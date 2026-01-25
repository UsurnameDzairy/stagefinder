"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Building2, Send, CheckCircle, Search, FileText, 
  Sparkles, ExternalLink, TrendingUp, BarChart3, PieChart, Target, Activity as ActivityIcon, Star 
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

interface Stats {
  savedOffers: number;
  savedCompanies: number;
  applications: number;
  interviews: number;
  matchTrend?: number[];
  skillsCoverage?: Array<{ label: string; value: number; color: string }>;
  searchActivity?: number[];
  applicationStatus?: {
    pending: number;
    interview: number;
    rejected: number;
    responseRate: number;
  };
}

interface Activity {
  id: string;
  type: "application" | "saved_offer" | "saved_company" | "interview";
  title: string;
  subtitle: string;
  date: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch("/api/dashboard/stats");
        const statsData = await statsRes.json();
        setStats(statsData.stats);

        // Fetch real recent activity from API
        try {
          const activityRes = await fetch("/api/dashboard/activity");
          if (activityRes.ok) {
            const activityData = await activityRes.json();
            setRecentActivity(activityData.activity || []);
          }
        } catch (e) {
          // If activity API fails, leave empty
          setRecentActivity([]);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-4xl font-serif font-normal tracking-tight text-white">{t("dashboard.title")}</h1>
        <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
          {t("dashboard.welcome")} StageFinder
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("offers.title"), value: stats?.savedOffers || 0, icon: Star, color: "text-blue-500" },
          { label: t("companies.title"), value: stats?.savedCompanies || 0, icon: Building2, color: "text-purple-500" },
          { label: t("applications.title"), value: stats?.applications || 0, icon: Send, color: "text-green-500" },
          { label: t("dashboard.stats.interviews"), value: stats?.interviews || 0, icon: CheckCircle, color: "text-orange-500" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-black border-zinc-900 shadow-none group hover:border-zinc-700 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">{stat.label}</span>
                  <stat.icon className={cn("h-4 w-4 transition-colors opacity-50 group-hover:opacity-100", stat.color)} />
                </div>
                <div className="text-3xl font-bold tracking-tighter text-white">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Analytics Main Chart Placeholder */}
        <Card className="lg:col-span-2 bg-black border-zinc-900 shadow-none overflow-hidden">
          <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <ActivityIcon className="h-4 w-4" />
              Activité de Recherche
            </CardTitle>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-[10px] text-zinc-500 uppercase">Vues</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="text-[10px] text-zinc-500 uppercase">Postulés</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {stats?.searchActivity && stats.searchActivity.length > 0 ? (
              <div className="h-64 w-full flex items-end justify-between gap-2 mt-4">
                {stats.searchActivity.map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative h-full flex items-end gap-0.5">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.5 + (i * 0.05) }}
                        className="flex-1 bg-white/10 rounded-t-sm group-hover:bg-white/20 transition-colors" 
                      />
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height * 0.4}%` }}
                        transition={{ delay: 0.7 + (i * 0.05) }}
                        className="flex-1 bg-white rounded-t-sm group-hover:bg-zinc-200 transition-colors" 
                      />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-800 uppercase group-hover:text-zinc-500 transition-colors">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 w-full flex items-center justify-center">
                <p className="text-zinc-600 text-sm">Aucune donnée disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-black border-zinc-900 shadow-none">
          <CardHeader className="p-6">
            <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Statut des Candidatures
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            {stats?.applicationStatus ? (
              <>
                <div className="relative h-40 flex items-center justify-center">
                  <svg className="w-32 h-32 -rotate-90">
                    <circle cx="64" cy="64" r="50" fill="transparent" stroke="#1a1a1a" strokeWidth="12" />
                    <motion.circle 
                      cx="64" cy="64" r="50" fill="transparent" stroke="white" strokeWidth="12" 
                      strokeDasharray="314"
                      initial={{ strokeDashoffset: 314 }}
                      animate={{ strokeDashoffset: 314 * (1 - (stats.applicationStatus.responseRate || 0) / 100) }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold tracking-tighter">{stats.applicationStatus.responseRate || 0}%</span>
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Réponses</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "En attente", value: `${stats.applicationStatus.pending || 0}%`, color: "bg-zinc-800" },
                    { label: "Entretiens", value: `${stats.applicationStatus.interview || 0}%`, color: "bg-white" },
                    { label: "Refusé", value: `${stats.applicationStatus.rejected || 0}%`, color: "bg-zinc-900" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
                        <span className="text-zinc-500">{item.label}</span>
                      </div>
                      <span className="text-zinc-300">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <p className="text-zinc-600 text-sm">Aucune candidature</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Score Trend & Skills Analysis */}
        <div className="lg:col-span-3 grid gap-6 md:grid-cols-2">
          <Card className="bg-black border-zinc-900 shadow-none overflow-hidden">
            <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5" />
                Score de Compatibilité
              </CardTitle>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-[9px] font-bold text-green-500">+12.5%</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
            <div className="h-48 w-full flex items-end justify-between gap-1.5 mt-6 relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  {[0, 1, 2, 3].map(i => <div key={i} className="w-full h-px bg-zinc-800" />)}
                </div>
                
                {(stats?.matchTrend || []).map((score, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                    <div className="w-full relative h-full flex items-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${score}%` }}
                        transition={{ delay: 0.5 + (i * 0.05), duration: 0.8, ease: "easeOut" }}
                        className={cn(
                          "w-full rounded-t-[2px] transition-all duration-500 relative group-hover:brightness-125",
                          score >= 85 ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" : 
                          score >= 70 ? "bg-zinc-500" : "bg-zinc-800"
                        )} 
                      />
                    </div>
                    <span className="text-[8px] font-bold text-zinc-800 uppercase group-hover:text-zinc-500 transition-colors">
                      S{i + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Performance</p>
                  <p className="text-[13px] font-bold text-white tracking-tight">Optimal Matching</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Target</p>
                  <p className="text-[13px] font-bold text-white tracking-tight">95% Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Coverage Analytics */}
          <Card className="bg-black border-zinc-900 shadow-none overflow-hidden">
            <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Target className="h-3.5 w-3.5" />
                Couverture des Compétences
              </CardTitle>
              <Sparkles className="h-3.5 w-3.5 text-zinc-700" />
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              {stats?.skillsCoverage && stats.skillsCoverage.length > 0 ? (
                <>
                  <div className="space-y-5">
                    {stats.skillsCoverage.map((skill, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{skill.label}</span>
                          <span className="text-[11px] font-bold text-white">{skill.value}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.value}%` }}
                            transition={{ delay: 0.8 + (i * 0.1), duration: 1, ease: "easeOut" }}
                            className={cn("h-full rounded-full", skill.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-zinc-600 text-sm">Ajoutez des compétences à votre profil</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Pro Tip */}
          <div className="md:col-span-2 grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 bg-black border-zinc-900 shadow-none overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles className="h-32 w-32 text-white" />
              </div>
              <CardHeader className="px-6 pt-6 pb-2">
                <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{t("dashboard.quickActions")}</CardTitle>
              </CardHeader>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { label: "Postuler", icon: Send, action: "/offres", primary: true },
              { label: "Ma Carrière", icon: TrendingUp, action: "/candidatures" },
              { label: "Lettres IA", icon: FileText, action: "/lettres" },
              { label: "Mon Profil", icon: Target, action: "/parametres" },
            ].map((action, i) => (
              <Link href={action.action} key={i}>
                <Button 
                  className={cn(
                    "w-full h-14 rounded-2xl font-serif italic text-base transition-all hover:scale-[1.02] active:scale-[0.98] border shadow-xl flex items-center justify-between px-6",
                    action.primary 
                      ? "bg-black text-white border-zinc-800 hover:bg-zinc-900" 
                      : "bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white hover:border-zinc-700"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <action.icon className="h-5 w-5 opacity-60" />
                    {action.label}
                  </span>
                  <ExternalLink className="h-4 w-4 opacity-30" />
                </Button>
              </Link>
            ))}
          </div>
            </Card>

            <Card className="bg-zinc-950 border-zinc-900 shadow-none">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-zinc-400" />
                  Conseil Pro
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <p className="text-[13px] text-zinc-400 leading-relaxed font-medium">
                  Utilisez le <span className="text-white">CV Improver</span> pour augmenter vos chances de réponse de 40%. Harvard recommande d'utiliser des verbes d'action puissants.
                </p>
                <Link href="/cv-improver" className="inline-flex items-center gap-2 mt-4 text-[11px] font-bold text-white uppercase tracking-widest hover:gap-3 transition-all">
                  Améliorer mon CV <ExternalLink className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Section */}
        <Card className="lg:col-span-3 bg-black border-zinc-900 shadow-none">
          <CardHeader className="p-6 pb-4 border-b border-zinc-900/50">
            <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <ActivityIcon className="h-4 w-4" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-900">
              {recentActivity.map((activity, i) => (
                <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-zinc-950/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-xl border transition-colors",
                      activity.type === "application" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                      activity.type === "saved_offer" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                      activity.type === "saved_company" ? "bg-purple-500/10 border-purple-500/20 text-purple-500" :
                      "bg-orange-500/10 border-orange-500/20 text-orange-500"
                    )}>
                      {activity.type === "application" ? <Send className="h-4 w-4" /> :
                       activity.type === "saved_offer" ? <Star className="h-4 w-4" /> :
                       activity.type === "saved_company" ? <Building2 className="h-4 w-4" /> :
                       <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-zinc-100 tracking-tight">{activity.title}</p>
                      <p className="text-[11px] font-medium text-zinc-500">{activity.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest group-hover:text-zinc-500 transition-colors">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
