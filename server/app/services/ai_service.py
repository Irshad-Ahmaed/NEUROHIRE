import os
import json
import re
from google import genai
from app.services.rag_service import retrieve

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def resume_analysis_prompt(resume_text, user_goal, experience):
    return f"""
    You are a senior software engineer and hiring manager.

    Evaluate the resume based on the user goal and their experience level.

    User goal: "{user_goal}"
    Target Role Seniority: "Looking for a role requiring ~{experience} years of experience"
    Resume text: "{resume_text}"

    # STRICT RULES:
    - Extract only relevent skills for this goal
    - Remove irrelevent tools like: [excel for backend dev, etc]
    - Identify real gaps
    - Generate roadmap only for missing skills or fields
    - Make output DIFFERENT based on goal.

    Return response in ONLY JSON format.
    {{
        "skills": ["skill1", "skill2"],
        "missing_skills": ["skill3", "skill4"],
        "roadmap": [
            {"skill": "Skill Name", "description": "Detailed learning path"}
        ],
        "interview_questions": [
            {"question": "The Question", "answer": "The ideal answer"}
        ]
    }}
    """

def analyze_resume(resume_text, user_goal, experience):
    prompt = resume_analysis_prompt(resume_text, user_goal, experience)

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
            config={
                'temperature': 0.3,
            }
        )

        result_text = response.text.strip()
        
        match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if match:
            result_text = match.group(0)
            
        return json.loads(result_text)
    
    except Exception as e:
        return {"error": str(e)}

# --- New Interactive Interview Functions ---

def extract_skills_from_resume(resume_text: str) -> list[str]:
    prompt = f"""Extract ONLY the technical skills and tools from this resume.
Return as a JSON array of strings. No explanation.
Resume: {resume_text[:3000]}
Format: ["skill1", "skill2"]"""
    try:
        resp = client.models.generate_content(model="gemini-2.5-flash-lite", contents=prompt)
        match = re.search(r'\[.*\]', resp.text, re.DOTALL)
        return json.loads(match.group(0)) if match else []
    except Exception as e:
        print(f"Error extracting skills: {e}")
        return []

def build_query_from_resume(skills: list[str], role: str) -> str:
    return f"Key concepts for {role}: {', '.join(skills[:8])}"

def generate_first_question(resume_text: str, role: str, experience: str, context_chunks: list[dict]) -> dict:
    context_str = "\n\n".join([f"[{c['book']}]: {c['text']}" for c in context_chunks])
    prompt = f"""You are a senior technical interviewer.

Role: {role} | Experience required: {experience} years
Candidate Resume Summary: {resume_text[:1500]}

Knowledge Context (from textbooks):
{context_str}

Generate ONE opening interview question. It should:
- Be relevant to the role and candidate background
- Be grounded in the context above
- Be appropriate for {experience} years experience

Return ONLY JSON:
{{"question": "...", "topic": "...", "difficulty": "easy|medium|hard"}}"""
    try:
        resp = client.models.generate_content(model="gemini-2.5-flash-lite", contents=prompt,
                                               config={"temperature": 0.4})
        match = re.search(r'\{.*\}', resp.text, re.DOTALL)
        return json.loads(match.group(0)) if match else {"question": resp.text, "topic": "general", "difficulty": "medium"}
    except Exception as e:
        print(f"Error generating first question: {e}")
        return {"question": "Can you start by telling me about your experience with machine learning projects?", "topic": "general", "difficulty": "medium"}

def evaluate_and_next_question(question: str, answer: str, role: str,
                                session_history: list[dict], context_chunks: list[dict],
                                current_difficulty: str) -> dict:
    history_str = "\n".join([f"Q{i+1}: {t['question']}\nA{i+1}: {t['answer']}" 
                              for i, t in enumerate(session_history[-3:])])  # last 3 turns
    context_str = "\n\n".join([f"[{c['book']}]: {c['text']}" for c in context_chunks])

    prompt = f"""You are a senior technical interviewer evaluating a candidate for {role}.

Session History (last 3 turns):
{history_str}

Current Question: {question}
Candidate Answer: {answer}

Knowledge Context:
{context_str}

Current difficulty: {current_difficulty}

Evaluate the answer and generate the next question. 
Score: 0.0 (wrong) to 1.0 (perfect).
- score < 0.4 → next difficulty = "easy"
- score 0.4–0.7 → next difficulty = "medium"  
- score > 0.7 → next difficulty = "hard"

Return ONLY JSON:
{{
  "score": 0.0-1.0,
  "feedback": "brief feedback on the answer",
  "strengths": ["..."],
  "gaps": ["..."],
  "next_question": "...",
  "next_topic": "...",
  "next_difficulty": "easy|medium|hard"
}}"""
    try:
        resp = client.models.generate_content(model="gemini-2.5-flash-lite", contents=prompt,
                                               config={"temperature": 0.3})
        match = re.search(r'\{.*\}', resp.text, re.DOTALL)
        return json.loads(match.group(0)) if match else {
            "score": 0.5, 
            "feedback": "Thank you for your answer.", 
            "next_question": "Can you elaborate more on that?", 
            "next_difficulty": "medium"
        }
    except Exception as e:
        print(f"Error in evaluate_and_next_question: {e}")
        return {"score": 0.5, "feedback": "Thank you for your answer.", "next_question": "Can you elaborate more on that?", "next_difficulty": "medium"}

def generate_final_analysis(session_turns: list[dict], role: str) -> dict:
    qa_str = "\n".join([f"Q: {t['question']}\nA: {t['answer']}\nScore: {t.get('score', 'N/A')}" 
                         for t in session_turns])
    valid_scores = [t['score'] for t in session_turns if t.get('score') is not None]
    avg_score = sum(valid_scores) / max(len(valid_scores), 1)

    prompt = f"""Summarize this technical interview for a {role} candidate.

Q&A Log:
{qa_str}

Average Score: {avg_score:.2f}

Return ONLY JSON:
{{
  "overall_score": 0-100,
  "grade": "A|B|C|D|F",
  "summary": "2-3 sentence summary",
  "strengths": ["..."],
  "improvement_areas": ["..."],
  "recommendation": "Hire|Consider|Reject"
}}"""
    try:
        resp = client.models.generate_content(model="gemini-2.5-flash-lite", contents=prompt,
                                               config={"temperature": 0.2})
        match = re.search(r'\{.*\}', resp.text, re.DOTALL)
        return json.loads(match.group(0)) if match else {"overall_score": int(avg_score * 100), "grade": "B", "summary": "Evaluation complete."}
    except Exception as e:
        print(f"Error generating final analysis: {e}")
        return {"overall_score": int(avg_score * 100), "grade": "N/A", "summary": "Error during analysis."}
