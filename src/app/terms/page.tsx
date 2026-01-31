"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <h1 className="text-5xl font-serif font-bold mb-4">Conditions Générales d'Utilisation</h1>
        <p className="text-zinc-500 mb-12">Dernière mise à jour : 25 janvier 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">1. Acceptation des Conditions</h2>
            <p>
              En accédant et en utilisant StageFinder, vous acceptez d'être lié par ces conditions générales d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme. Nous nous réservons le droit 
              de modifier ces conditions à tout moment, et votre utilisation continue de la plateforme constitue votre 
              acceptation de ces modifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">2. Description du Service</h2>
            <p>
              StageFinder est une plateforme de recherche de stages et d'opportunités professionnelles propulsée par 
              l'intelligence artificielle. Nous proposons des services incluant :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Recherche intelligente d'offres de stages</li>
              <li>Analyse de CV par IA</li>
              <li>Génération de lettres de motivation personnalisées</li>
              <li>Assistant IA (KAM) pour conseils carrière</li>
              <li>Alertes d'offres personnalisées</li>
              <li>Suivi des candidatures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">3. Inscription et Compte Utilisateur</h2>
            <p className="mb-4">Pour utiliser StageFinder, vous devez :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Avoir au moins 16 ans</li>
              <li>Fournir des informations exactes et à jour lors de l'inscription</li>
              <li>Maintenir la confidentialité de votre mot de passe</li>
              <li>Être responsable de toutes les activités effectuées sous votre compte</li>
              <li>Nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
            </ul>
            <p className="mt-4">
              Nous nous réservons le droit de suspendre ou de résilier votre compte si vous violez ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">4. Plans d'Abonnement et Paiements</h2>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Plans Disponibles</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Plan FREE :</strong> 10 requêtes IA par jour, 1 recherche d'emploi par jour</li>
              <li><strong>Plan STUDENT :</strong> 8,99€/mois - 700 requêtes IA totales, 3 recherches par jour (email .edu requis)</li>
              <li><strong>Plan PRO :</strong> 19,99€/mois - 50 requêtes IA par jour, 10 recherches par jour, accès illimité</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Facturation</h3>
            <p className="mb-4">
              Les paiements sont traités de manière sécurisée par Stripe. En souscrivant à un plan payant, vous acceptez :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Le renouvellement automatique de votre abonnement</li>
              <li>La facturation mensuelle ou annuelle selon votre choix</li>
              <li>Les prix affichés sont TTC (toutes taxes comprises)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Annulation et Remboursement</h3>
            <p>
              Vous pouvez annuler votre abonnement à tout moment depuis votre compte. L'annulation prendra effet à la fin 
              de votre période de facturation en cours. Aucun remboursement n'est accordé pour les périodes partiellement 
              utilisées, sauf en cas de dysfonctionnement majeur de notre service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">5. Utilisation Acceptable</h2>
            <p className="mb-4">Vous vous engagez à ne pas :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Utiliser la plateforme à des fins illégales ou frauduleuses</li>
              <li>Tenter de contourner les limitations de votre plan d'abonnement</li>
              <li>Partager votre compte avec d'autres personnes</li>
              <li>Utiliser des robots, scrapers ou autres outils automatisés sans autorisation</li>
              <li>Télécharger des contenus malveillants, offensants ou inappropriés</li>
              <li>Usurper l'identité d'une autre personne ou entité</li>
              <li>Interférer avec le fonctionnement de la plateforme</li>
              <li>Extraire ou copier massivement nos données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">6. Propriété Intellectuelle</h2>
            <p className="mb-4">
              Tous les contenus de StageFinder (textes, graphiques, logos, code, algorithmes IA) sont protégés par 
              les droits d'auteur et autres droits de propriété intellectuelle. Vous conservez la propriété de vos 
              données personnelles et documents uploadés (CV, lettres de motivation).
            </p>
            <p>
              En utilisant notre service, vous nous accordez une licence limitée pour traiter vos documents afin de 
              fournir nos services (analyse IA, recommandations, etc.). Cette licence prend fin lorsque vous supprimez 
              vos documents ou votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">7. Intelligence Artificielle</h2>
            <p className="mb-4">
              Notre plateforme utilise des modèles d'IA pour analyser vos CV, générer des recommandations et fournir 
              des conseils carrière. Vous reconnaissez que :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Les résultats de l'IA sont fournis à titre indicatif et ne constituent pas des conseils professionnels garantis</li>
              <li>L'IA peut occasionnellement produire des erreurs ou des inexactitudes</li>
              <li>Vous êtes responsable de vérifier et valider toutes les informations générées par l'IA</li>
              <li>Nous améliorons continuellement nos algorithmes en analysant les interactions (de manière anonymisée)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">8. Limitation de Responsabilité</h2>
            <p className="mb-4">
              StageFinder est fourni "en l'état" sans garantie d'aucune sorte. Nous ne garantissons pas :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Que vous trouverez un stage ou un emploi</li>
              <li>L'exactitude, l'exhaustivité ou la pertinence des offres d'emploi</li>
              <li>La disponibilité ininterrompue du service</li>
              <li>L'absence d'erreurs ou de bugs</li>
            </ul>
            <p className="mt-4">
              Dans la mesure permise par la loi, notre responsabilité est limitée au montant que vous avez payé 
              pour le service au cours des 12 derniers mois.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">9. Offres d'Emploi et Entreprises</h2>
            <p>
              Les offres d'emploi affichées sur StageFinder proviennent de sources tierces. Nous ne sommes pas 
              responsables de l'exactitude, de la légalité ou de la qualité de ces offres. Nous vous encourageons 
              à faire preuve de diligence raisonnable avant de postuler à une offre ou de communiquer avec une entreprise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">10. Résiliation</h2>
            <p className="mb-4">
              Nous pouvons suspendre ou résilier votre accès à StageFinder immédiatement, sans préavis, si :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Vous violez ces conditions d'utilisation</li>
              <li>Vous utilisez le service de manière abusive ou frauduleuse</li>
              <li>Votre compte présente une activité suspecte</li>
              <li>Requis par la loi</li>
            </ul>
            <p className="mt-4">
              Vous pouvez résilier votre compte à tout moment en nous contactant ou via les paramètres de votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">11. Droit Applicable et Juridiction</h2>
            <p>
              Ces conditions sont régies par le droit français. Tout litige relatif à ces conditions sera soumis à 
              la compétence exclusive des tribunaux de Paris, France, sauf dispositions impératives contraires.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">12. Dispositions Générales</h2>
            <p className="mb-4">
              Si une disposition de ces conditions est jugée invalide ou inapplicable, les autres dispositions 
              resteront en vigueur. Notre non-exercice d'un droit ne constitue pas une renonciation à ce droit.
            </p>
            <p>
              Ces conditions constituent l'intégralité de l'accord entre vous et StageFinder concernant l'utilisation 
              de notre service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">13. Contact</h2>
            <p>
              Pour toute question concernant ces conditions générales d'utilisation, contactez-nous :
            </p>
            <p className="mt-4">
              Email : <a href="mailto:legal@stagefinder.com" className="text-white underline">legal@stagefinder.com</a><br />
              Adresse : StageFinder, Paris, France
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
