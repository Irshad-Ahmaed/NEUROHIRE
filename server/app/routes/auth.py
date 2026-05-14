from flask import Blueprint, request, session, jsonify
from app.extensions import SessionLocal
from app.models.schemas import User
from app.utils.security import generate_hash_password, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/login", methods=["POST"])
def api_login():
    email = request.form.get("email")
    password = request.form.get("password")
    
    with SessionLocal() as db_session:
        user = db_session.query(User).filter_by(email=email).first()

        if not user or not check_password_hash(user.hashed_password, password):
            return jsonify({"error": "Invalid credentials"}), 401
        
        session["user"] = {
            "id": str(user.id),
            "email": user.email
        }

    return jsonify({"message": "Login successful", "user": session["user"]}), 200

@auth_bp.route("/signup", methods=["POST"])
def api_signup():
    email = request.form.get("email")
    password = request.form.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    with SessionLocal() as db_session:
        existing_user = db_session.query(User).filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "User already exists"}), 400

        hashed_password = generate_hash_password(password)

        new_user = User(email=email, hashed_password=hashed_password)
        db_session.add(new_user)
        db_session.commit()

    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route("/logout")
def api_logout():
    session.pop("user", None)
    return jsonify({"message": "Logged out"}), 200
