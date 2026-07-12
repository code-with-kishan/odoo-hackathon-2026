import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentRole } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const role = await getCurrentRole();
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar user={user} />
        <main className="mx-auto w-full max-w-[1280px] flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
