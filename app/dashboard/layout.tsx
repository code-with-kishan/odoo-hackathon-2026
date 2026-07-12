import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

// The dashboard page itself renders <AppShell> (sidebar + topbar + auth guard).
// This layout only enforces the auth redirect so visiting /dashboard while
// logged out sends the user to /login instead of rendering a shell with no user.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}
