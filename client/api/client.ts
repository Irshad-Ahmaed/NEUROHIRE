/**
 * Core API Client for NeuroHire
 * This utility wraps the native fetch API with standard configurations for neurohire.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export type ApiRequestConfig = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | string | FormData | null;
  params?: Record<string, string>;
};

export async function apiClient<T>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const { params, ...customConfig } = config;

  // Build URL with query params if provided
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Set default headers
  const headers: Record<string, string> = {
    ...(customConfig.headers as Record<string, string>),
  };

  // Automatically set Content-Type to application/json for object bodies
  if (customConfig.body && typeof customConfig.body === "object" && !(customConfig.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    customConfig.body = JSON.stringify(customConfig.body);
  }

  const response = await fetch(url, {
    ...customConfig,
    headers,
    // Ensure cookies are sent (for session auth)
    credentials: customConfig.credentials || "include",
    body: customConfig.body as BodyInit,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  // Handle logout or empty responses
  if (response.status === 204 || endpoint === "/logout") {
    return {} as T;
  }

  return response.json();
}
