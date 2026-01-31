"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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

        <h1 className="text-5xl font-serif font-bold mb-4">Politique de Confidentialité</h1>
        <p className="text-zinc-500 mb-12">Dernière mise à jour : 25 janvier 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Bienvenue sur StageFinder. Nous nous engageons à protéger votre vie privée et vos données personnelles. 
              Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons 
              vos informations lorsque vous utilisez notre plateforme de recherche de stages propulsée par l'IA.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">2. Données Collectées</h2>
            <p className="mb-4">Nous collectons les types de données suivants :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Informations de compte :</strong> nom, prénom, adresse email, mot de passe (crypté)</li>
              <li><strong>Informations de profil :</strong> école, niveau d'études, spécialité, villes préférées, types de contrat</li>
              <li><strong>CV et documents :</strong> fichiers uploadés pour analyse par notre IA</li>
              <li><strong>Historique d'utilisation :</strong> recherches effectuées, offres consultées, candidatures</li>
              <li><strong>Données de paiement :</strong> traitées de manière sécurisée par Stripe (nous ne stockons pas vos informations bancaires)</li>
              <li><strong>Conversations avec l'IA :</strong> messages échangés avec notre assistant KAM pour améliorer nos services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">3. Utilisation des Données</h2>
            <p className="mb-4">Nous utilisons vos données pour :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fournir et améliorer nos services de recherche de stages</li>
              <li>Personnaliser vos recommandations grâce à notre IA</li>
              <li>Analyser votre CV et générer des lettres de motivation</li>
              <li>Gérer votre abonnement et traiter les paiements</li>
              <li>Vous envoyer des alertes d'offres correspondant à votre profil</li>
              <li>Améliorer nos algorithmes d'IA et la qualité de nos services</li>
              <li>Communiquer avec vous concernant votre compte et nos services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">4. Partage des Données</h2>
            <p className="mb-4">Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations avec :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Prestataires de services :</strong> Stripe pour les paiements, OpenRouter pour l'IA</li>
              <li><strong>Entreprises :</strong> uniquement si vous postulez à une offre (avec votre consentement explicite)</li>
              <li><strong>Autorités légales :</strong> si requis par la loi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">5. Sécurité des Données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger 
              vos données contre tout accès non autorisé, modification, divulgation ou destruction. Cela inclut le 
              cryptage des mots de passe, des connexions HTTPS sécurisées, et des sauvegardes régulières.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">6. Vos Droits (RGPD)</h2>
            <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> supprimer vos données ("droit à l'oubli")</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de limitation :</strong> limiter le traitement de vos données</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@stagefinder.com" className="text-white underline">privacy@stagefinder.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">7. Cookies et Technologies Similaires</h2>
            <p>
              Nous utilisons des cookies essentiels pour le fonctionnement de notre plateforme (authentification, préférences). 
              Nous n'utilisons pas de cookies publicitaires tiers. Vous pouvez gérer vos préférences de cookies dans les 
              paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">8. Conservation des Données</h2>
            <p>
              Nous conservons vos données personnelles aussi longtemps que votre compte est actif ou que nécessaire pour 
              vous fournir nos services. Si vous supprimez votre compte, vos données seront effacées dans un délai de 30 jours, 
              sauf obligation légale de conservation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">9. Transferts Internationaux</h2>
            <p>
              Vos données peuvent être transférées et traitées dans des pays en dehors de l'Union Européenne. 
              Nous nous assurons que ces transferts respectent les exigences du RGPD et que des garanties appropriées 
              sont en place (clauses contractuelles types, Privacy Shield).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">10. Modifications de cette Politique</h2>
            <p>
              Nous pouvons mettre à jour cette politique de confidentialité de temps en temps. Nous vous informerons 
              de tout changement significatif par email ou via une notification sur la plateforme. La date de dernière 
              mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">11. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles, 
              contactez notre délégué à la protection des données :
            </p>
            <p className="mt-4">
              Email : <a href="mailto:dpo@stagefinder.com" className="text-white underline">dpo@stagefinder.com</a><br />
              Adresse : StageFinder, Paris, France
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
