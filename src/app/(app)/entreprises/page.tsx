import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink, FileText, Send } from "lucide-react";

async function getSavedCompanies(userId: string) {
  return prisma.savedCompany.findMany({
    where: { userId },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function EntreprisesPage() {
  const session = await getSession();
  if (!session) return null;

  const savedCompanies = await getSavedCompanies(session.id);

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Entreprises</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Entreprises sauvegardees et suivi des candidatures
        </p>
      </div>

      {savedCompanies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 mb-4">
              Aucune entreprise sauvegardee pour le moment
            </p>
            <a href="/offres">
              <Button variant="secondary">Rechercher des offres</Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedCompanies.map((saved) => (
            <Card key={saved.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-900 truncate">
                      {saved.company.name}
                    </h3>
                    {saved.company.sector && (
                      <Badge variant="secondary" className="mt-1">
                        {saved.company.sector}
                      </Badge>
                    )}
                  </div>
                </div>

                {saved.notes && (
                  <p className="text-sm text-zinc-500 mt-3 line-clamp-2">
                    {saved.notes}
                  </p>
                )}

                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <Button variant="secondary" size="sm" className="flex-1">
                    <Send className="h-3 w-3 mr-1" />
                    Candidater
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1">
                    <FileText className="h-3 w-3 mr-1" />
                    Lettre
                  </Button>
                  {saved.company.website && (
                    <a
                      href={saved.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
