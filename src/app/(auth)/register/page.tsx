"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { signUp } from "@/lib/auth-client";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`.trim() || email,
      });

      if (result.error) {
        setError(result.error.message || "Erreur d'inscription");
        setLoading(false);
        return;
      }

      router.push("/complete-profile");
    } catch {
      setError("Erreur d'inscription");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
      <div className="absolute top-1/4 right-1/4 size-64 bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[450px] relative z-10">
        <div className="flex items-center justify-center gap-2 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Logo size={24} />
        </div>

        <Card className="bg-black border-zinc-900 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <CardHeader className="pt-12 pb-8 text-center space-y-2">
            <h1 className="font-serif text-4xl font-normal tracking-tight text-white">Create Account</h1>
            <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Join the Strategic Network</p>
          </CardHeader>
          <CardContent className="px-8 pb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm rounded-xl px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm rounded-xl px-4"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Professional Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane.doe@institution.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm rounded-xl px-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Secure Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm rounded-xl px-4"
                  />
                  <p className="text-[9px] font-medium text-zinc-700 ml-1">Minimum 6 characters for security compliance.</p>
                </div>
              </div>

              {error && (
                <div className="p-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-950 border border-zinc-900 rounded-xl text-center">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-black hover:bg-zinc-900 text-white font-serif italic text-base rounded-xl border border-zinc-800 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? <Loader size="sm" /> : "Initialize Integration"}
              </Button>

              <div className="pt-8 border-t border-zinc-900/50 text-center space-y-4">
                <p className="text-[12px] font-medium text-zinc-600">
                  Already registered?{" "}
                  <Link href="/login" className="text-white hover:text-zinc-300 font-bold underline-offset-4 hover:underline transition-all">
                    Access Portal
                  </Link>
                </p>
                <div className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.3em]">
                  Verified Digital Environment
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

