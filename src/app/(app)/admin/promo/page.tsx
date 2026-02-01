"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { Plus, Trash2, Copy, Check, Shield, Ticket, Users, GraduationCap, Crown, RefreshCw } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  type: "STUDENT_DISCOUNT" | "VIP_UNLIMITED";
  discountPercent: number | null;
  description: string | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { redemptions: number };
}

export default function AdminPromoPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState({
    code: "",
    type: "VIP_UNLIMITED" as "STUDENT_DISCOUNT" | "VIP_UNLIMITED",
    discountPercent: 50,
    description: "",
    maxUses: "",
  });

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch("/api/admin/promo");
      if (res.status === 403) {
        setError("Admin access required");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPromoCodes(data.promoCodes || []);
    } catch (err) {
      setError("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleCreateCode = async () => {
    if (!newCode.code.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.code.toUpperCase(),
          type: newCode.type,
          discountPercent: newCode.type === "STUDENT_DISCOUNT" ? newCode.discountPercent : undefined,
          description: newCode.description || undefined,
          maxUses: newCode.maxUses ? parseInt(newCode.maxUses) : undefined,
        }),
      });

      if (res.ok) {
        setNewCode({
          code: "",
          type: "VIP_UNLIMITED",
          discountPercent: 50,
          description: "",
          maxUses: "",
        });
        setShowForm(false);
        fetchPromoCodes();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create promo code");
      }
    } catch (err) {
      alert("Failed to create promo code");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;

    try {
      await fetch(`/api/admin/promo?id=${id}`, { method: "DELETE" });
      fetchPromoCodes();
    } catch (err) {
      alert("Failed to delete promo code");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="h-16 w-16 text-zinc-700" />
        <h2 className="text-xl font-serif text-white">Access Denied</h2>
        <p className="text-zinc-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-serif font-normal tracking-tight text-white flex items-center gap-3">
          <Shield className="h-6 w-6 text-zinc-400" />
          Promo Codes Manager
        </h1>
        <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">
          Create and manage promotional codes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black border-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Codes</p>
                <p className="text-2xl font-serif text-white">{promoCodes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black border-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-600/20 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Student Codes</p>
                <p className="text-2xl font-serif text-white">
                  {promoCodes.filter((c) => c.type === "STUDENT_DISCOUNT").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black border-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-600/20 flex items-center justify-center">
                <Crown className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">VIP Codes</p>
                <p className="text-2xl font-serif text-white">
                  {promoCodes.filter((c) => c.type === "VIP_UNLIMITED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Code */}
      <Card className="bg-black border-zinc-900 overflow-hidden">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
            <Plus className="h-4 w-4 text-zinc-400" />
            Create New Code
          </CardTitle>
          <CardDescription className="text-[13px] text-zinc-600 font-medium">
            Generate a new promotional code
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          {showForm ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                    Code
                  </label>
                  <Input
                    placeholder="e.g. MYFAMILY2024"
                    value={newCode.code}
                    onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                    className="h-12 bg-zinc-950 border-zinc-900 focus:border-white font-mono uppercase tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                    Type
                  </label>
                  <select
                    value={newCode.type}
                    onChange={(e) => setNewCode({ ...newCode, type: e.target.value as any })}
                    className="w-full h-12 px-4 rounded-xl bg-zinc-950 border border-zinc-900 text-sm font-medium focus:border-white transition-colors"
                  >
                    <option value="VIP_UNLIMITED">👑 VIP Unlimited (Pro free forever)</option>
                    <option value="STUDENT_DISCOUNT">🎓 Student Discount (50% off)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                    Description (optional)
                  </label>
                  <Input
                    placeholder="e.g. For my brother"
                    value={newCode.description}
                    onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                    className="h-12 bg-zinc-950 border-zinc-900 focus:border-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                    Max Uses (optional)
                  </label>
                  <Input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={newCode.maxUses}
                    onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
                    className="h-12 bg-zinc-950 border-zinc-900 focus:border-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-zinc-900">
                <Button
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="h-11 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCode}
                  disabled={creating || !newCode.code.trim()}
                  className="flex-1 bg-black hover:bg-zinc-900 text-white font-serif italic text-sm rounded-full border border-zinc-800 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] h-11"
                >
                  {creating ? <Loader size="sm" /> : "Create Promo Code"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full h-14 border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-all border border-dashed rounded-2xl"
            >
              <Plus className="h-5 w-5 mr-3" />
              Create New Promo Code
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Existing Codes */}
      <Card className="bg-black border-zinc-900">
        <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <Ticket className="h-4 w-4 text-zinc-400" />
              Active Promo Codes
            </CardTitle>
            <CardDescription className="text-[13px] text-zinc-600 font-medium">
              {promoCodes.length} codes available
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPromoCodes}
            className="h-9 px-3 text-zinc-500 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          {promoCodes.length === 0 ? (
            <div className="text-center py-12 bg-zinc-950/30 border border-dashed border-zinc-900 rounded-2xl">
              <Ticket className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-[13px] text-zinc-600">No promo codes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {promoCodes.map((promo) => (
                <div
                  key={promo.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all group",
                    promo.isActive
                      ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                      : "bg-black border-zinc-900 opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center",
                          promo.type === "VIP_UNLIMITED"
                            ? "bg-amber-600/20"
                            : "bg-emerald-600/20"
                        )}
                      >
                        {promo.type === "VIP_UNLIMITED" ? (
                          <Crown className="h-6 w-6 text-amber-400" />
                        ) : (
                          <GraduationCap className="h-6 w-6 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-lg font-bold text-white tracking-widest">
                            {promo.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(promo.code)}
                            className="h-7 w-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                          >
                            {copiedCode === promo.code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-zinc-500" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {promo.description || (promo.type === "VIP_UNLIMITED" ? "VIP Pro Unlimited" : "Student 50% off")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                          Uses
                        </p>
                        <p className="text-sm font-medium text-zinc-300">
                          {promo.usedCount} / {promo.maxUses || "∞"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCode(promo.id)}
                        className="h-9 w-9 rounded-xl bg-zinc-900 hover:bg-red-950 hover:border-red-900 border border-zinc-800 flex items-center justify-center transition-all text-zinc-600 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
