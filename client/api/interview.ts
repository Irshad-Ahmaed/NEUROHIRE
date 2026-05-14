import { apiClient } from "./client";

export interface SourceChunk {
  book: string;
  text: string;
  score: number;
  chunk_index?: number;
}

export interface FinalAnalysis {
  overall_score: number;
  grade: string;
  summary: string;
  strengths: string[];
  improvement_areas: string[];
  recommendation: string;
}

export interface InterviewTurn {
  id: string;
  turn_number: number;
  question: string;
  answer?: string;
  score?: number;
  context?: SourceChunk[];
}

export interface InterviewSession {
  session_id: string;
  turn_id: string;
  question: string;
  source_context?: SourceChunk[];
  difficulty?: string;
  session_complete?: boolean;
  turns?: InterviewTurn[];
  final_analysis?: FinalAnalysis | null;
  role?: string;
  status?: string;
  created_at?: string;
  feedback?: string;
  turn_number?: number;
}

/**
 * Interview and Session API services
 */
export const interviewApi = {
  startSession: (formData: FormData) => {
    return apiClient<InterviewSession>("/session/start", {
      method: "POST",
      body: formData,
    });
  },

  submitAnswer: (data: { session_id: string; turn_id: string; answer: string }) => {
    return apiClient<InterviewSession>("/session/answer", {
      method: "POST",
      body: data,
    });
  },

  getSession: (sessionId: string) => {
    return apiClient<InterviewSession>(`/session/${sessionId}`, {
      method: "GET",
    });
  },

  listSessions: () => {
    return apiClient<InterviewSession[]>("/sessions", {
      method: "GET",
    });
  },
};
