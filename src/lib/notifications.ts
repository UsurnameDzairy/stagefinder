import prisma from "@/lib/prisma";

interface JobOffer {
  id: string;
  title: string;
  companyName: string;
  location: string;
  contractType: string;
  description: string;
  skills: string;
  matchScore?: number;
}

/**
 * Vérifie les alertes des utilisateurs et crée des notifications pour les offres correspondantes
 */
export async function checkJobAlertsForUser(userId: string, offers: JobOffer[]) {
  try {
    // Récupérer les alertes actives de l'utilisateur
    const alerts = await prisma.jobAlert.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (alerts.length === 0) return;

    const notifications: {
      userId: string;
      alertId: string;
      type: string;
      title: string;
      message: string;
      data: string;
    }[] = [];

    for (const alert of alerts) {
      const alertDomains = alert.domains.toLowerCase().split(",").map(d => d.trim());
      const alertKeywords = alert.keywords?.toLowerCase().split(",").map(k => k.trim()) || [];
      const alertLocations = alert.locations?.toLowerCase().split(",").map(l => l.trim()) || [];
      const alertContractTypes = alert.contractTypes?.toLowerCase().split(",").map(c => c.trim()) || [];

      for (const offer of offers) {
        // Calculer le score de correspondance
        let matchScore = 0;
        const offerText = `${offer.title} ${offer.description} ${offer.skills}`.toLowerCase();
        const offerLocation = offer.location.toLowerCase();
        const offerContractType = offer.contractType.toLowerCase();

        // Vérifier les domaines
        const domainMatch = alertDomains.some(domain => offerText.includes(domain));
        if (domainMatch) matchScore += 40;

        // Vérifier les mots-clés
        const keywordMatches = alertKeywords.filter(kw => offerText.includes(kw)).length;
        matchScore += keywordMatches * 15;

        // Vérifier la localisation
        if (alertLocations.length === 0 || alertLocations.some(loc => offerLocation.includes(loc))) {
          matchScore += 20;
        }

        // Vérifier le type de contrat
        if (alertContractTypes.length === 0 || alertContractTypes.some(ct => offerContractType.includes(ct))) {
          matchScore += 20;
        }

        // Utiliser le matchScore de l'offre si disponible
        if (offer.matchScore) {
          matchScore = Math.max(matchScore, offer.matchScore);
        }

        // Créer une notification si le score dépasse le minimum
        if (matchScore >= alert.minMatchScore) {
          // Vérifier si une notification existe déjà pour cette offre/alerte
          const existingNotif = await prisma.notification.findFirst({
            where: {
              userId,
              alertId: alert.id,
              data: { contains: offer.id },
            },
          });

          if (!existingNotif) {
            notifications.push({
              userId,
              alertId: alert.id,
              type: "job_match",
              title: `🎯 Nouvelle opportunité: ${offer.title}`,
              message: `${offer.companyName} à ${offer.location} - Correspond à votre alerte "${alert.name}"`,
              data: JSON.stringify({
                offerId: offer.id,
                companyName: offer.companyName,
                jobTitle: offer.title,
                location: offer.location,
                matchScore,
              }),
            });
          }
        }
      }

      // Mettre à jour la date de dernière vérification
      await prisma.jobAlert.update({
        where: { id: alert.id },
        data: { lastCheckedAt: new Date() },
      });
    }

    // Créer les notifications en batch
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
      console.log(`✉️ Created ${notifications.length} notifications for user ${userId}`);
    }

    return notifications.length;
  } catch (error) {
    console.error("Error checking job alerts:", error);
    return 0;
  }
}

/**
 * Vérifie les alertes pour tous les utilisateurs (pour un cron job)
 */
export async function checkAllJobAlerts() {
  try {
    // Récupérer toutes les alertes actives
    const alerts = await prisma.jobAlert.findMany({
      where: { isActive: true },
      include: { user: true },
    });

    const userIds = [...new Set(alerts.map(a => a.userId))];
    let totalNotifications = 0;

    for (const userId of userIds) {
      // Récupérer les offres récentes (dernières 24h)
      const recentOffers = await prisma.jobOffer.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        take: 100,
      });

      const offers = recentOffers.map(o => ({
        id: o.id,
        title: o.title,
        companyName: o.companyName,
        location: o.location || "",
        contractType: o.contractType || "",
        description: o.description || "",
        skills: o.skills || "",
      }));

      const count = await checkJobAlertsForUser(userId, offers);
      totalNotifications += count || 0;
    }

    console.log(`📬 Total notifications created: ${totalNotifications}`);
    return totalNotifications;
  } catch (error) {
    console.error("Error checking all job alerts:", error);
    return 0;
  }
}

/**
 * Crée une notification système
 */
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: "system",
        title,
        message,
        data: data ? JSON.stringify(data) : null,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating system notification:", error);
    return null;
  }
}
