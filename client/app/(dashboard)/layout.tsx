import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { getServerAuth } from "@/lib/server-auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const auth = await getServerAuth();

  if (!auth.authenticated) {
    redirect("/login");
  }

  return <AuthGuard>{children}</AuthGuard>;
}
