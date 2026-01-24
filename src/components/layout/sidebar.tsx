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
import { LanguageSelector } from "@/components/ui/language-selector";
import { useTranslation } from "@/lib/i18n";

const getNavigation = (t: (key: string) => string) => [
  { name: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
  { name: t("nav.offers"), href: "/offres", icon: Briefcase },
  { name: t("nav.companies"), href: "/entreprises", icon: Building2 },
  { name: t("nav.applications"), href: "/candidatures", icon: Send },
  { name: t("nav.letters"), href: "/lettres", icon: FileText },
  { name: t("nav.cvImprover"), href: "/cv-improver", icon: GraduationCap },
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
  const { t } = useTranslation();
  const navigation = getNavigation(t);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-black border-r border-zinc-900">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="size-6 rounded bg-white flex items-center justify-center">
              <span className="text-black font-black text-[10px] tracking-tighter italic">SF</span>
            </div>
            <span className="text-lg font-serif tracking-tight text-white">StageFinder</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector compact />
            <NotificationBell />
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-serif transition-all duration-200",
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-zinc-500")} />
                {item.name}
              </Link>
            );
          })}
          
          {user?.role === "admin" && (
            <>
              <div className="my-4 mx-3 border-t border-zinc-900" />
              <div className="px-6 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                Admin
              </div>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-serif transition-all duration-200",
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-zinc-500")} />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {user && (
          <div className="p-4 border-t border-zinc-900 bg-zinc-950/30">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 hover:bg-zinc-900 transition-all duration-300"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.firstName || user.email}
                  className="h-8 w-8 rounded-full object-cover border border-zinc-800"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-700">
                  {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="truncate text-[13px] font-semibold text-zinc-200">
                  {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email.split('@')[0]}
                </p>
                <p className="truncate text-[11px] text-zinc-500">{t("nav.viewProfile")}</p>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-600 transition-transform duration-300", profileOpen ? 'rotate-180' : '')} />
            </button>
            
            {profileOpen && (
              <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <Link
                  href="/parametres"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[12px] font-medium text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all"
                >
                  <Settings className="h-3.5 w-3.5" />
                  {t("nav.settings")}
                </Link>
                <Link
                  href="/parametres#cv"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[12px] font-medium text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all"
                >
                  <FileUp className="h-3.5 w-3.5" />
                  {t("nav.cvImprover")}
                </Link>
                <a
                  href="/api/auth/sign-out"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[12px] font-medium text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t("nav.logout")}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
