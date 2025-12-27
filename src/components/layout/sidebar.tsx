"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Send,
  FileText,
  Settings,
  LogOut,
  User,
  Database,
  Bot,
  FileUp,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Offres", href: "/offres", icon: Briefcase },
  { name: "Entreprises", href: "/entreprises", icon: Building2 },
  { name: "Candidatures", href: "/candidatures", icon: Send },
  { name: "Lettres", href: "/lettres", icon: FileText },
  { name: "CV Improver", href: "/cv-improver", icon: GraduationCap },
];

const adminNavigation = [
  { name: "Scraper", href: "/admin/scraper", icon: Database },
];

interface SidebarProps {
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    role?: string;
    image?: string | null;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-zinc-200 bg-zinc-950">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white">StageFinder</span>
          </Link>
          <NotificationBell />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
          
          {user?.role === "admin" && (
            <>
              <div className="my-2 border-t border-zinc-800" />
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Admin
              </div>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {user && (
          <div className="border-t border-zinc-800 p-3">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-zinc-900 transition-colors"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.firstName || user.email}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-zinc-700"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white ring-2 ring-zinc-700">
                  {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="truncate text-sm font-medium text-white">
                  {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email.split('@')[0]}
                </p>
                <p className="truncate text-xs text-zinc-500">Voir le profil</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {profileOpen && (
              <div className="mt-2 space-y-1">
                <Link
                  href="/parametres"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Parametres
                </Link>
                <Link
                  href="/parametres#cv"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  <FileUp className="h-4 w-4" />
                  Mon CV
                </Link>
                <a
                  href="/api/auth/sign-out"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Deconnexion
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
