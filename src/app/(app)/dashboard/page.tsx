import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Building2, Send, CheckCircle, Search, FileText } from "lucide-react";

async function getStats(userId: string) {
  const [savedOffers, savedCompanies, applications, interviews] = await Promise.all([
    prisma.savedOffer.count({ where: { userId } }),
    prisma.savedCompany.count({ where: { userId } }),
    prisma.application.count({ where: { userId, status: { not: "NOT_APPLIED" } } }),
    prisma.application.count({ where: { userId, status: "INTERVIEW" } }),
  ]);

  return { savedOffers, savedCompanies, applications, interviews };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const stats = await getStats(session.id);

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Bienvenue sur StageFinder
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Offres sauvegardees
            </CardTitle>
            <Briefcase className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedOffers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Entreprises
            </CardTitle>
            <Building2 className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedCompanies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Candidatures
            </CardTitle>
            <Send className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Entretiens
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interviews}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link href="/offres">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Rechercher des offres
            </Button>
          </Link>
          <Link href="/entreprises">
            <Button variant="secondary">
              <Building2 className="mr-2 h-4 w-4" />
              Explorer les entreprises
            </Button>
          </Link>
          <Link href="/lettres">
            <Button variant="secondary">
              <FileText className="mr-2 h-4 w-4" />
              Generer une lettre
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
