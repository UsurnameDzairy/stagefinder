"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface UsageData {
  plan: string;
  aiRequestsRemaining: number;
  jobSearchesRemaining: number;
  isUnlimited: boolean;
}

export function UsageBadge() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/subscription/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (error) {
      console.error("Failed to fetch usage:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge variant="outline" className="text-xs">
        {usage.plan}
      </Badge>
      {!usage.isUnlimited && (
        <>
          <span className="text-zinc-500">
            IA: {usage.aiRequestsRemaining}
          </span>
          <span className="text-zinc-500">
            Recherches: {usage.jobSearchesRemaining}
          </span>
        </>
      )}
    </div>
  );
}
