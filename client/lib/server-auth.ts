import { cookies, headers } from "next/headers";
import type { AuthUser, MeResponse } from "@/api/auth";

export type ServerAuthResult = {
  authenticated: boolean;
  user: AuthUser | null;
};

async function getServerApiBase() {
  const headerList = await headers();

  if (process.env.API_SERVER_BASE_URL) {
    return process.env.API_SERVER_BASE_URL;
  }

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (!host) {
    throw new Error(
      "API_SERVER_BASE_URL is required when host headers are unavailable."
    );
  }

  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}/api`;
}

export async function getServerAuth(): Promise<ServerAuthResult> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  try {
    const response = await fetch(`${await getServerApiBase()}/me`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        authenticated: false,
        user: null,
      };
    }

    const data = (await response.json()) as MeResponse;

    if (!data.authenticated || !data.user?.id || !data.user.email) {
      return {
        authenticated: false,
        user: null,
      };
    }

    return {
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  } catch {
    return {
      authenticated: false,
      user: null,
    };
  }
}
