import { apiClient } from "./client";

export interface LoginResponse {
  message?: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface SignupResponse {
  message?: string;
}

/**
 * Authentication API services
 */
export const authApi = {
  login: (formData: FormData) => {
    return apiClient<LoginResponse>("/login", {
      method: "POST",
      body: formData,
    });
  },

  signup: (formData: FormData) => {
    return apiClient<SignupResponse>("/signup", {
      method: "POST",
      body: formData,
    });
  },

  logout: () => {
    return apiClient<void>("/logout", {
      method: "GET",
    });
  },
  
  me: () => {
    return apiClient<{ authenticated: boolean; user?: LoginResponse["user"] }>("/me", {
      method: "GET",
    });
  },
};
