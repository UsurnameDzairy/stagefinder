"use client";

import { ReactNode } from "react";
import { LanguageSelectorModal } from "@/components/ui/language-selector-modal";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <LanguageSelectorModal />
      {children}
    </>
  );
}
