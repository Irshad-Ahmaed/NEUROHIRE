import uuid
import json
import io
import PyPDF2
import docx
from flask import Blueprint, request, session, jsonify
from app.extensions import SessionLocal
from app.models.schemas import Resume, InterviewSession, InterviewTurn, SessionStatus
from app.services.ai_service import (
    extract_skills_from_resume,
    build_query_from_resume,
    generate_first_question,
    evaluate_and_next_question,
    generate_final_analysis
)
from app.services.rag_service import retrieve

interview_bp = Blueprint('interview', __name__)

@interview_bp.route("/session/start", methods=["POST"])
def session_start():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    role = request.form.get("role")
    experience = request.form.get("experience", "2")
    file = request.files.get("file")
    resume_text = request.form.get("resume_text", "")

    # Parse file if uploaded
    if file and file.filename:
        if file.filename.endswith(".pdf"):
            try:
                pdf_reader = PyPDF2.PdfReader(file)
                resume_text = "\n".join(p.extract_text() or "" for p in pdf_reader.pages)
            except Exception as e:
                return jsonify({"error": f"PDF Error: {str(e)}"}), 400
        elif file.filename.endswith(".docx"):
            try:
                doc = docx.Document(io.BytesIO(file.read()))
                resume_text = "\n".join(p.text for p in doc.paragraphs)
            except Exception as e:
                return jsonify({"error": f"DOCX Error: {str(e)}"}), 400

    if not resume_text or not role:
        return jsonify({"error": "resume and role required"}), 400

    # Extract skills + retrieve context
    skills = extract_skills_from_resume(resume_text)
    query = build_query_from_resume(skills, role)
    chunks = retrieve(query, role)

    # Generate first question
    first_q = generate_first_question(resume_text, role, experience, chunks)
    q_difficulty = first_q.get("difficulty", "medium")

    user_id = uuid.UUID(session["user"]["id"])

    with SessionLocal() as db_session:
        # Save Resume for reuse
        resume_obj = Resume(
            user_id=user_id,
            content=resume_text,
            parsed_skills=json.dumps(skills),
        )
        db_session.add(resume_obj)
        db_session.flush()

        # Create Interview Session
        interview_session = InterviewSession(
            user_id=user_id,
            resume_id=resume_obj.id,
            role=role,
            experience=experience,
        )
        db_session.add(interview_session)
        db_session.flush()

        # Save Turn 1
        turn = InterviewTurn(
            session_id=interview_session.id,
            turn_number=1,
            question=first_q["question"],
            retrieved_context=json.dumps(chunks),
            ai_feedback=json.dumps({"difficulty": q_difficulty})
        )
        db_session.add(turn)
        db_session.commit()

        return jsonify({
            "session_id": str(interview_session.id),
            "turn_id": str(turn.id),
            "question": first_q["question"],
            "topic": first_q.get("topic"),
            "difficulty": q_difficulty,
            "source_context": chunks,
        })

@interview_bp.route("/session/answer", methods=["POST"])
def session_answer():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    if not data or "session_id" not in data or "turn_id" not in data:
        return jsonify({"error": "session_id and turn_id required"}), 400
        
    session_id = uuid.UUID(data["session_id"])
    turn_id = uuid.UUID(data["turn_id"])
    answer_text = data.get("answer", "")
    MAX_TURNS = 4

    with SessionLocal() as db_session:
        interview_session = db_session.query(InterviewSession).filter_by(id=session_id).first()
        if not interview_session or str(interview_session.user_id) != session["user"]["id"]:
            return jsonify({"error": "Session not found or unauthorized"}), 404

        current_turn = db_session.query(InterviewTurn).filter_by(id=turn_id).first()
        if not current_turn:
            return jsonify({"error": "Turn not found"}), 404
            
        current_turn.answer = answer_text

        # Get all turns to build history
        all_turns = db_session.query(InterviewTurn).filter_by(session_id=session_id).order_by(InterviewTurn.turn_number).all()
        history = [{"question": t.question, "answer": t.answer or "", "score": t.score} for t in all_turns]

        turn_count = len(all_turns)

        # Retrieve context relevant to the answer/question
        chunks = retrieve(answer_text + " " + current_turn.question, interview_session.role)
        
        # Determine the difficulty of the question being answered
        current_q_difficulty = "medium"
        if current_turn.ai_feedback:
            try:
                meta = json.loads(current_turn.ai_feedback)
                current_q_difficulty = meta.get("difficulty", "medium")
            except:
                pass

        # Evaluate current answer and generate next question
        ai_resp = evaluate_and_next_question(
            question=current_turn.question,
            answer=answer_text,
            role=interview_session.role,
            session_history=history,
            context_chunks=chunks,
            current_difficulty=current_q_difficulty
        )

        # Update current turn with AI evaluation results
        current_turn.ai_feedback = json.dumps(ai_resp)
        current_turn.score = ai_resp.get("score")

        if turn_count >= MAX_TURNS:
            # Update history with the latest score before analysis
            history[-1]["score"] = ai_resp.get("score")
            # Generate final analysis and close session
            final = generate_final_analysis(history, interview_session.role)
            interview_session.status = SessionStatus.COMPLETED
            interview_session.final_analysis = json.dumps(final)
            db_session.commit()
            return jsonify({
                "session_complete": True, 
                "final_analysis": final,
                "feedback": ai_resp.get("feedback"),
                "score": ai_resp.get("score")
            })

        # Create and save next turn
        next_difficulty = ai_resp.get("next_difficulty", "medium")
        next_turn = InterviewTurn(
            session_id=session_id,
            turn_number=turn_count + 1,
            question=ai_resp["next_question"],
            retrieved_context=json.dumps(chunks),
            ai_feedback=json.dumps({"difficulty": next_difficulty})
        )
        db_session.add(next_turn)
        db_session.commit()

        return jsonify({
            "turn_id": str(next_turn.id),
            "question": ai_resp["next_question"],
            "topic": ai_resp.get("next_topic"),
            "difficulty": next_difficulty,
            "feedback": ai_resp.get("feedback"),
            "score": ai_resp.get("score"),
            "source_context": chunks,
            "turn_number": turn_count + 1,
        })

@interview_bp.route("/session/<uuid:session_id>")
def get_session(session_id):
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    with SessionLocal() as db_session:
        s = db_session.query(InterviewSession).filter_by(id=session_id).first()
        if not s or str(s.user_id) != session["user"]["id"]:
            return jsonify({"error": "Not found"}), 404
            
        turns = db_session.query(InterviewTurn).filter_by(session_id=session_id).order_by(InterviewTurn.turn_number).all()
        
        final_analysis = None
        if s.final_analysis:
            try:
                final_analysis = json.loads(s.final_analysis)
            except:
                pass

        return jsonify({
            "session_id": str(s.id),
            "role": s.role,
            "status": s.status.value,
            "final_analysis": final_analysis,
            "turns": [{"id": str(t.id), "turn_number": t.turn_number, "question": t.question,
                       "answer": t.answer, "score": t.score,
                       "context": json.loads(t.retrieved_context or "[]")} for t in turns]
        })

@interview_bp.route("/sessions")
def list_sessions():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    user_id_obj = uuid.UUID(session["user"]["id"])
    with SessionLocal() as db_session:
        sessions_list = db_session.query(InterviewSession).filter_by(user_id=user_id_obj).order_by(InterviewSession.created_at.desc()).all()
        
        return jsonify([{
            "session_id": str(s.id), "role": s.role,
            "status": s.status.value,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M"),
        } for s in sessions_list])
