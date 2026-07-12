import { getSessionUser } from "@/lib/auth/session";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

export default async function Home() {
  const user = await getSessionUser();
  return <LandingPageClient user={user} />;
}
