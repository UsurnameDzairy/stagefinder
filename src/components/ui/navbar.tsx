"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Logo } from "./logo";
import Link from "next/link";
import { LogOut, Settings, User as UserIcon, Menu, X } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface SubmenuItem {
  href: string;
  label: string;
  description?: string;
}

interface NavLink {
  href?: string;
  label: string;
  submenu?: boolean;
  type?: "simple" | "description";
  items?: SubmenuItem[];
}

interface NavbarProps {
  user?: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
  } | null;
}

const landingNavigationLinks: NavLink[] = [
  { href: "/", label: "Home" },
  {
    label: "Features",
    submenu: true,
    type: "description",
    items: [
      {
        href: "#features",
        label: "AI Search",
        description: "Intelligent matching for your career path.",
      },
      {
        href: "#features",
        label: "Auto-Scraper",
        description: "Get the latest internships automatically.",
      },
      {
        href: "#features",
        label: "Strategy",
        description: "Optimized application workflow.",
      },
    ],
  },
  {
    label: "Pricing",
    submenu: true,
    type: "simple",
    items: [
      { href: "#pricing", label: "Pro Plan" },
      { href: "#pricing", label: "Student Plan" },
      { href: "#pricing", label: "Free" },
    ],
  },
  {
    label: "About",
    submenu: true,
    type: "simple",
    items: [
      { href: "#about", label: "Our Mission" },
      { href: "#about", label: "Team" },
      { href: "#about", label: "Careers" },
    ],
  },
];

const appNavigationLinks: NavLink[] = [
  { href: "/assistant", label: "KAM" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/offres", label: "Offres" },
  { href: "/entreprises", label: "Entreprises" },
  {
    label: "Outils",
    submenu: true,
    type: "simple",
    items: [
      { href: "/cv-improver", label: "CV Improver" },
      { href: "/lettres", label: "Lettres de motivation" },
      { href: "/candidatures", label: "Mes Candidatures" },
    ],
  },
];

export default function Navbar({ user }: NavbarProps) {
  const links = user ? appNavigationLinks : landingNavigationLinks;
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-black/60 backdrop-blur-2xl px-4 md:px-10 h-20 flex items-center">
      <div className="max-w-7xl mx-auto w-full relative flex items-center justify-between h-full">
        
        {/* Left side: Logo */}
        <div className="flex items-center shrink-0 z-20">
          <Link href={user ? "/dashboard" : "/"} className="hover:opacity-80 transition-all duration-300 active:scale-95">
            <Logo size={26} />
          </Link>
        </div>

        {/* Center: Navigation - Perfectly Centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none hidden md:flex">
          <div className="pointer-events-auto">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {links.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    {link.submenu ? (
                      <>
                        <NavigationMenuTrigger className="text-zinc-400 hover:text-white bg-transparent px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 data-[state=open]:text-white">
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className={cn(
                            "grid w-[400px] gap-3 p-5 bg-zinc-950/95 border border-zinc-900/50 backdrop-blur-3xl md:w-[500px] md:grid-cols-2 lg:w-[600px] rounded-2xl shadow-3xl",
                            link.type === "description" && "md:grid-cols-1"
                          )}>
                            {link.items?.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={item.href}
                                    className="group block select-none space-y-1.5 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-white/[0.03] hover:text-white"
                                  >
                                    <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-200 group-hover:text-white transition-colors">
                                      {item.label}
                                    </div>
                                    {item.description && (
                                      <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">
                                        {item.description}
                                      </p>
                                    )}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          href={link.href || "#"}
                          className="text-zinc-400 hover:text-white py-2 px-5 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 inline-block"
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
              <NavigationMenuViewport className="bg-zinc-950/95 border border-zinc-900/50 shadow-2xl rounded-2xl" />
            </NavigationMenu>
          </div>
        </div>

        {/* Right side: Auth / Account */}
        <div className="flex items-center gap-6 shrink-0 z-20">
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-3 group outline-none cursor-pointer">
                  <div className="flex flex-col items-end hidden md:flex">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-200 group-hover:text-white transition-colors leading-none mb-1">
                      {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors font-medium leading-none">Compte</span>
                  </div>
                  <div className="size-9 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/20 shadow-lg group-hover:scale-105">
                    {user.image ? (
                      <img src={user.image} alt="Profile" className="size-full object-cover" />
                    ) : (
                      <UserIcon className="size-4 text-zinc-500 group-hover:text-zinc-300" />
                    )}
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-60 p-2 bg-zinc-950/95 border border-zinc-900/50 backdrop-blur-3xl mt-4 rounded-2xl shadow-3xl">
                <div className="flex flex-col gap-1">
                  <Link href="/parametres" className="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/[0.03] rounded-xl transition-all">
                    <Settings className="size-3.5" />
                    Paramètres
                  </Link>
                  <div className="h-px bg-white/[0.05] mx-2 my-1" />
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/80 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    Déconnexion
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/5 px-5 hidden md:flex h-10 rounded-full transition-all font-serif italic text-sm normal-case tracking-tight">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-black border border-zinc-800 text-white font-serif italic text-sm px-7 h-10 shadow-xl transition-all hover:scale-105 active:scale-95">
                <Link href="/register">Join Now</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="group size-10 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all active:scale-90" variant="ghost" size="icon">
                  <Menu className="size-5 text-white group-data-[state=open]:hidden" />
                  <X className="size-5 text-white hidden group-data-[state=open]:block" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-3 bg-zinc-950/95 border border-zinc-900/50 backdrop-blur-3xl mt-4 rounded-2xl shadow-3xl">
                <nav className="flex flex-col gap-1">
                  {links.map((link, index) => (
                    <Link key={index} href={link.href || "#"} className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/[0.03] rounded-xl transition-all">
                      {link.label}
                    </Link>
                  ))}
                  <div className="h-px bg-white/[0.05] mx-3 my-2" />
                  {!user ? (
                    <div className="flex flex-col gap-2 p-1">
                      <Link href="/login" className="px-5 py-4 text-sm font-serif italic text-white text-center hover:text-white transition-colors">Sign In</Link>
                      <Link href="/register" className="px-5 py-4 text-sm font-serif italic text-white bg-black border border-zinc-800 rounded-xl text-center active:scale-[0.98] transition-all shadow-xl">Join Now</Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <Link href="/parametres" className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3 hover:text-white hover:bg-white/[0.03] rounded-xl transition-all">
                        <Settings className="size-3.5" /> Paramètres
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="w-full px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/80 flex items-center gap-3 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all cursor-pointer"
                      >
                        <LogOut className="size-3.5" /> Déconnexion
                      </button>
                    </div>
                  )}
                </nav>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}
