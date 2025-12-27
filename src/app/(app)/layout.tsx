import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { FloatingAssistant } from "@/components/assistant/floating-assistant";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar user={session} />
      <main className="flex-1 overflow-auto p-8 bg-zinc-950 ml-60">{children}</main>
      <FloatingAssistant />
    </div>
  );
}
