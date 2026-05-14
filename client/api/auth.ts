import { apiClient } from "./client";

export interface AuthUser {
  id: string;
  email: string;
}

export interface LoginResponse {
  message?: string;
  user?: AuthUser;
}

export interface SignupResponse {
  message?: string;
}

export interface MeResponse {
  authenticated: boolean;
  user?: AuthUser;
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
    return apiClient<MeResponse>("/me", {
      method: "GET",
    });
  },
};
