from flask import Flask
from app.config import config
from app.extensions import cors, Base, engine

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    cors.init_app(app, supports_credentials=True, origins=["http://localhost:3000"])

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.interview import interview_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(interview_bp, url_prefix='/api')

    # Create database tables (Raw SQLAlchemy way)
    Base.metadata.create_all(bind=engine)

    @app.route("/")
    def home():
        return {"message": "AI Interview System API - Production Ready (Modular)"}, 200

    return app
