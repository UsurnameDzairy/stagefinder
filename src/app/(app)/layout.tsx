import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/ui/navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      <Navbar user={session} />
      <main className="flex-1 overflow-y-auto bg-black relative pt-16">
        <div className="max-w-7xl mx-auto p-8 md:p-10 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
