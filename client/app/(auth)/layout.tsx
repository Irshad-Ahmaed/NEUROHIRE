import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/server-auth";

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const auth = await getServerAuth();

  if (auth.authenticated) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
