import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1280px] p-6">
      <Card className="p-6">
        <h1 className="text-[32px] font-semibold leading-[1.2]">IronRoute</h1>
        <p className="mt-3 text-[14px] text-[var(--color-text-muted)]">Fleet operations platform with AI-assisted trip intake and optimizer dispatch.</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button>Open Dashboard</Button>
        </Link>
      </Card>
    </main>
  );
}
