import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="mx-auto mt-16 max-w-md rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h1 className="text-[22px] font-semibold">Sign in</h1>
      <form className="mt-4 space-y-3" action="/api/auth/login" method="post">
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-[8px] border border-[var(--color-border)] px-3 py-2 text-[14px]" />
        <input name="password" type="password" required placeholder="Password" className="w-full rounded-[8px] border border-[var(--color-border)] px-3 py-2 text-[14px]" />
        <Button className="w-full">Sign in</Button>
      </form>
    </main>
  );
}
