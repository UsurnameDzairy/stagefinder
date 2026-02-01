"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage, useTranslation } from "@/lib/i18n";

export default function TermsPage() {
  const { language } = useLanguage();
  const { t } = useTranslation();

  const content = {
    en: {
      back: "Back",
      title: "Terms of Service",
      lastUpdate: "Last updated: January 25, 2026",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content: "By accessing and using StageFinder, you agree to be bound by these terms of service. If you do not accept these terms, please do not use our platform. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes your acceptance of these modifications."
        },
        {
          title: "2. Description of Service",
          content: "StageFinder is an AI-powered internship and professional opportunity search platform. We offer services including:",
          list: [
            "Intelligent internship search",
            "AI-powered CV analysis",
            "Personalized cover letter generation",
            "AI assistant (KAM) for career advice",
            "Personalized job alerts",
            "Application tracking"
          ]
        },
        {
          title: "3. Registration and User Account",
          intro: "To use StageFinder, you must:",
          list: [
            "Be at least 16 years old",
            "Provide accurate and up-to-date information during registration",
            "Maintain the confidentiality of your password",
            "Be responsible for all activities conducted under your account",
            "Notify us immediately of any unauthorized use of your account"
          ],
          outro: "We reserve the right to suspend or terminate your account if you violate these terms."
        },
        {
          title: "4. Subscription Plans and Payments",
          sub1Title: "4.1 Available Plans",
          sub1List: [
            "FREE Plan: 10 AI queries per day, 1 job search per day",
            "STUDENT Plan: $8.99/month - 700 total AI queries, 3 searches per day (.edu email required)",
            "PRO Plan: $19.99/month - 50 AI queries per day, 10 searches per day, unlimited access"
          ],
          sub2Title: "4.2 Billing",
          sub2Intro: "Payments are processed securely by Stripe. By subscribing to a paid plan, you agree to:",
          sub2List: [
            "Automatic renewal of your subscription",
            "Monthly or annual billing as per your choice",
            "Displayed prices include all applicable taxes"
          ],
          sub3Title: "4.3 Cancellation and Refunds",
          sub3Content: "You can cancel your subscription at any time from your account. Cancellation will take effect at the end of your current billing period. No refunds are provided for partially used periods, except in case of major service malfunction."
        },
        {
          title: "5. Acceptable Use",
          intro: "You agree not to:",
          list: [
            "Use the platform for illegal or fraudulent purposes",
            "Attempt to bypass subscription plan limitations",
            "Share your account with others",
            "Use bots, scrapers, or other automated tools without authorization",
            "Upload malicious, offensive, or inappropriate content",
            "Impersonate another person or entity",
            "Interfere with the platform's operation",
            "Mass extract or copy our data"
          ]
        },
        {
          title: "6. Intellectual Property",
          content: "All StageFinder content (text, graphics, logos, code, AI algorithms) is protected by copyright and other intellectual property rights. You retain ownership of your personal data and uploaded documents (CVs, cover letters).",
          content2: "By using our service, you grant us a limited license to process your documents to provide our services (AI analysis, recommendations, etc.). This license terminates when you delete your documents or account."
        },
        {
          title: "7. Artificial Intelligence",
          intro: "Our platform uses AI models to analyze your CVs, generate recommendations, and provide career advice. You acknowledge that:",
          list: [
            "AI results are provided for informational purposes and do not constitute guaranteed professional advice",
            "AI may occasionally produce errors or inaccuracies",
            "You are responsible for verifying and validating all AI-generated information",
            "We continuously improve our algorithms by analyzing interactions (anonymized)"
          ]
        },
        {
          title: "8. Limitation of Liability",
          intro: "StageFinder is provided \"as is\" without warranty of any kind. We do not guarantee:",
          list: [
            "That you will find an internship or job",
            "The accuracy, completeness, or relevance of job postings",
            "Uninterrupted service availability",
            "The absence of errors or bugs"
          ],
          outro: "To the extent permitted by law, our liability is limited to the amount you have paid for the service in the past 12 months."
        },
        {
          title: "9. Job Postings and Companies",
          content: "Job postings displayed on StageFinder come from third-party sources. We are not responsible for the accuracy, legality, or quality of these postings. We encourage you to exercise due diligence before applying for a position or communicating with a company."
        },
        {
          title: "10. Termination",
          intro: "We may suspend or terminate your access to StageFinder immediately, without notice, if:",
          list: [
            "You violate these terms of service",
            "You use the service abusively or fraudulently",
            "Your account shows suspicious activity",
            "Required by law"
          ],
          outro: "You may terminate your account at any time by contacting us or through your account settings."
        },
        {
          title: "11. Governing Law and Jurisdiction",
          content: "These terms are governed by French law. Any dispute relating to these terms will be submitted to the exclusive jurisdiction of the courts of Paris, France, unless mandatory provisions dictate otherwise."
        },
        {
          title: "12. General Provisions",
          content: "If any provision of these terms is found invalid or unenforceable, the other provisions will remain in effect. Our failure to exercise a right does not constitute a waiver of that right.",
          content2: "These terms constitute the entire agreement between you and StageFinder regarding the use of our service."
        },
        {
          title: "13. Contact",
          content: "For any questions regarding these terms of service, contact us:",
          contact: "Email: legal@stagefinder.com\nAddress: StageFinder, Paris, France"
        }
      ]
    },
    fr: {
      back: "Retour",
      title: "Conditions Générales d'Utilisation",
      lastUpdate: "Dernière mise à jour : 25 janvier 2026",
      sections: [
        {
          title: "1. Acceptation des Conditions",
          content: "En accédant et en utilisant StageFinder, vous acceptez d'être lié par ces conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme. Nous nous réservons le droit de modifier ces conditions à tout moment, et votre utilisation continue de la plateforme constitue votre acceptation de ces modifications."
        },
        {
          title: "2. Description du Service",
          content: "StageFinder est une plateforme de recherche de stages et d'opportunités professionnelles propulsée par l'intelligence artificielle. Nous proposons des services incluant :",
          list: [
            "Recherche intelligente d'offres de stages",
            "Analyse de CV par IA",
            "Génération de lettres de motivation personnalisées",
            "Assistant IA (KAM) pour conseils carrière",
            "Alertes d'offres personnalisées",
            "Suivi des candidatures"
          ]
        },
        {
          title: "3. Inscription et Compte Utilisateur",
          intro: "Pour utiliser StageFinder, vous devez :",
          list: [
            "Avoir au moins 16 ans",
            "Fournir des informations exactes et à jour lors de l'inscription",
            "Maintenir la confidentialité de votre mot de passe",
            "Être responsable de toutes les activités effectuées sous votre compte",
            "Nous informer immédiatement de toute utilisation non autorisée de votre compte"
          ],
          outro: "Nous nous réservons le droit de suspendre ou de résilier votre compte si vous violez ces conditions."
        },
        {
          title: "4. Plans d'Abonnement et Paiements",
          sub1Title: "4.1 Plans Disponibles",
          sub1List: [
            "Plan FREE : 10 requêtes IA par jour, 1 recherche d'emploi par jour",
            "Plan STUDENT : 8,99€/mois - 700 requêtes IA totales, 3 recherches par jour (email .edu requis)",
            "Plan PRO : 19,99€/mois - 50 requêtes IA par jour, 10 recherches par jour, accès illimité"
          ],
          sub2Title: "4.2 Facturation",
          sub2Intro: "Les paiements sont traités de manière sécurisée par Stripe. En souscrivant à un plan payant, vous acceptez :",
          sub2List: [
            "Le renouvellement automatique de votre abonnement",
            "La facturation mensuelle ou annuelle selon votre choix",
            "Les prix affichés sont TTC (toutes taxes comprises)"
          ],
          sub3Title: "4.3 Annulation et Remboursement",
          sub3Content: "Vous pouvez annuler votre abonnement à tout moment depuis votre compte. L'annulation prendra effet à la fin de votre période de facturation en cours. Aucun remboursement n'est accordé pour les périodes partiellement utilisées, sauf en cas de dysfonctionnement majeur de notre service."
        },
        {
          title: "5. Utilisation Acceptable",
          intro: "Vous vous engagez à ne pas :",
          list: [
            "Utiliser la plateforme à des fins illégales ou frauduleuses",
            "Tenter de contourner les limitations de votre plan d'abonnement",
            "Partager votre compte avec d'autres personnes",
            "Utiliser des robots, scrapers ou autres outils automatisés sans autorisation",
            "Télécharger des contenus malveillants, offensants ou inappropriés",
            "Usurper l'identité d'une autre personne ou entité",
            "Interférer avec le fonctionnement de la plateforme",
            "Extraire ou copier massivement nos données"
          ]
        },
        {
          title: "6. Propriété Intellectuelle",
          content: "Tous les contenus de StageFinder (textes, graphiques, logos, code, algorithmes IA) sont protégés par les droits d'auteur et autres droits de propriété intellectuelle. Vous conservez la propriété de vos données personnelles et documents uploadés (CV, lettres de motivation).",
          content2: "En utilisant notre service, vous nous accordez une licence limitée pour traiter vos documents afin de fournir nos services (analyse IA, recommandations, etc.). Cette licence prend fin lorsque vous supprimez vos documents ou votre compte."
        },
        {
          title: "7. Intelligence Artificielle",
          intro: "Notre plateforme utilise des modèles d'IA pour analyser vos CV, générer des recommandations et fournir des conseils carrière. Vous reconnaissez que :",
          list: [
            "Les résultats de l'IA sont fournis à titre indicatif et ne constituent pas des conseils professionnels garantis",
            "L'IA peut occasionnellement produire des erreurs ou des inexactitudes",
            "Vous êtes responsable de vérifier et valider toutes les informations générées par l'IA",
            "Nous améliorons continuellement nos algorithmes en analysant les interactions (de manière anonymisée)"
          ]
        },
        {
          title: "8. Limitation de Responsabilité",
          intro: "StageFinder est fourni \"en l'état\" sans garantie d'aucune sorte. Nous ne garantissons pas :",
          list: [
            "Que vous trouverez un stage ou un emploi",
            "L'exactitude, l'exhaustivité ou la pertinence des offres d'emploi",
            "La disponibilité ininterrompue du service",
            "L'absence d'erreurs ou de bugs"
          ],
          outro: "Dans la mesure permise par la loi, notre responsabilité est limitée au montant que vous avez payé pour le service au cours des 12 derniers mois."
        },
        {
          title: "9. Offres d'Emploi et Entreprises",
          content: "Les offres d'emploi affichées sur StageFinder proviennent de sources tierces. Nous ne sommes pas responsables de l'exactitude, de la légalité ou de la qualité de ces offres. Nous vous encourageons à faire preuve de diligence raisonnable avant de postuler à une offre ou de communiquer avec une entreprise."
        },
        {
          title: "10. Résiliation",
          intro: "Nous pouvons suspendre ou résilier votre accès à StageFinder immédiatement, sans préavis, si :",
          list: [
            "Vous violez ces conditions d'utilisation",
            "Vous utilisez le service de manière abusive ou frauduleuse",
            "Votre compte présente une activité suspecte",
            "Requis par la loi"
          ],
          outro: "Vous pouvez résilier votre compte à tout moment en nous contactant ou via les paramètres de votre compte."
        },
        {
          title: "11. Droit Applicable et Juridiction",
          content: "Ces conditions sont régies par le droit français. Tout litige relatif à ces conditions sera soumis à la compétence exclusive des tribunaux de Paris, France, sauf dispositions impératives contraires."
        },
        {
          title: "12. Dispositions Générales",
          content: "Si une disposition de ces conditions est jugée invalide ou inapplicable, les autres dispositions resteront en vigueur. Notre non-exercice d'un droit ne constitue pas une renonciation à ce droit.",
          content2: "Ces conditions constituent l'intégralité de l'accord entre vous et StageFinder concernant l'utilisation de notre service."
        },
        {
          title: "13. Contact",
          content: "Pour toute question concernant ces conditions générales d'utilisation, contactez-nous :",
          contact: "Email : legal@stagefinder.com\nAdresse : StageFinder, Paris, France"
        }
      ]
    }
  };

  const c = content[language as keyof typeof content] || content.en;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {c.back}
        </Link>

        <h1 className="text-5xl font-serif font-bold mb-4">{c.title}</h1>
        <p className="text-zinc-500 mb-12">{c.lastUpdate}</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          {c.sections.map((section, idx) => (
            <section key={idx}>
              <h2 className="text-2xl font-serif font-semibold text-white mb-4">{section.title}</h2>

              {section.content && <p className="mb-4">{section.content}</p>}
              {section.intro && <p className="mb-4">{section.intro}</p>}

              {section.list && (
                <ul className="list-disc list-inside space-y-2 ml-4">
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {section.outro && <p className="mt-4">{section.outro}</p>}
              {section.content2 && <p className="mt-4">{section.content2}</p>}

              {/* Subscription specific subsections */}
              {section.sub1Title && (
                <>
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">{section.sub1Title}</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {section.sub1List?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </>
              )}

              {section.sub2Title && (
                <>
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">{section.sub2Title}</h3>
                  <p className="mb-4">{section.sub2Intro}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {section.sub2List?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </>
              )}

              {section.sub3Title && (
                <>
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">{section.sub3Title}</h3>
                  <p>{section.sub3Content}</p>
                </>
              )}

              {section.contact && (
                <p className="mt-4 whitespace-pre-line">
                  {section.contact.split('\n').map((line, i) => (
                    <span key={i}>
                      {line.includes('@') ? (
                        <>
                          {line.split(':')[0]}:{' '}
                          <a href={`mailto:${line.split(': ')[1]}`} className="text-white underline">
                            {line.split(': ')[1]}
                          </a>
                        </>
                      ) : line}
                      <br />
                    </span>
                  ))}
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
