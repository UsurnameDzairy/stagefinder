"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function PrivacyPage() {
  const { language } = useLanguage();

  const content = {
    en: {
      back: "Back",
      title: "Privacy Policy",
      lastUpdate: "Last updated: January 25, 2026",
      sections: [
        {
          title: "1. Introduction",
          content: "Welcome to StageFinder. We are committed to protecting your privacy and personal data. This privacy policy explains how we collect, use, share, and protect your information when you use our AI-powered internship search platform."
        },
        {
          title: "2. Data Collected",
          intro: "We collect the following types of data:",
          list: [
            "Account information: name, email address, password (encrypted)",
            "Profile information: school, education level, specialty, preferred cities, contract types",
            "CV and documents: files uploaded for analysis by our AI",
            "Usage history: searches performed, offers viewed, applications",
            "Payment data: processed securely by Stripe (we do not store your banking information)",
            "AI conversations: messages exchanged with our KAM assistant to improve our services"
          ]
        },
        {
          title: "3. Use of Data",
          intro: "We use your data to:",
          list: [
            "Provide and improve our internship search services",
            "Personalize your recommendations through our AI",
            "Analyze your CV and generate cover letters",
            "Manage your subscription and process payments",
            "Send you job alerts matching your profile",
            "Improve our AI algorithms and service quality",
            "Communicate with you about your account and our services"
          ]
        },
        {
          title: "4. Data Sharing",
          intro: "We never sell your personal data. We may share your information with:",
          list: [
            "Service providers: Stripe for payments, OpenRouter for AI",
            "Companies: only if you apply for a position (with your explicit consent)",
            "Legal authorities: if required by law"
          ]
        },
        {
          title: "5. Data Security",
          content: "We implement appropriate technical and organizational security measures to protect your data against unauthorized access, modification, disclosure, or destruction. This includes password encryption, secure HTTPS connections, and regular backups."
        },
        {
          title: "6. Your Rights (GDPR)",
          intro: "In accordance with GDPR, you have the following rights:",
          list: [
            "Right of access: obtain a copy of your personal data",
            "Right to rectification: correct inaccurate data",
            "Right to erasure: delete your data (\"right to be forgotten\")",
            "Right to portability: receive your data in a structured format",
            "Right to object: object to the processing of your data",
            "Right to restriction: limit the processing of your data"
          ],
          outro: "To exercise these rights, contact us at: privacy@stagefinder.com"
        },
        {
          title: "7. Cookies and Similar Technologies",
          content: "We use essential cookies for the operation of our platform (authentication, preferences). We do not use third-party advertising cookies. You can manage your cookie preferences in your browser settings."
        },
        {
          title: "8. Data Retention",
          content: "We retain your personal data as long as your account is active or as necessary to provide our services. If you delete your account, your data will be erased within 30 days, unless we are legally required to retain it."
        },
        {
          title: "9. International Transfers",
          content: "Your data may be transferred and processed in countries outside the European Union. We ensure that these transfers comply with GDPR requirements and that appropriate safeguards are in place (standard contractual clauses, Privacy Shield)."
        },
        {
          title: "10. Changes to this Policy",
          content: "We may update this privacy policy from time to time. We will notify you of any significant changes by email or via a notification on the platform. The date of the last update is indicated at the top of this page."
        },
        {
          title: "11. Contact",
          content: "For any questions regarding this privacy policy or your personal data, contact our Data Protection Officer:",
          contact: "Email: dpo@stagefinder.com\nAddress: StageFinder, Paris, France"
        }
      ]
    },
    fr: {
      back: "Retour",
      title: "Politique de Confidentialité",
      lastUpdate: "Dernière mise à jour : 25 janvier 2026",
      sections: [
        {
          title: "1. Introduction",
          content: "Bienvenue sur StageFinder. Nous nous engageons à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre plateforme de recherche de stages propulsée par l'IA."
        },
        {
          title: "2. Données Collectées",
          intro: "Nous collectons les types de données suivants :",
          list: [
            "Informations de compte : nom, prénom, adresse email, mot de passe (crypté)",
            "Informations de profil : école, niveau d'études, spécialité, villes préférées, types de contrat",
            "CV et documents : fichiers uploadés pour analyse par notre IA",
            "Historique d'utilisation : recherches effectuées, offres consultées, candidatures",
            "Données de paiement : traitées de manière sécurisée par Stripe (nous ne stockons pas vos informations bancaires)",
            "Conversations avec l'IA : messages échangés avec notre assistant KAM pour améliorer nos services"
          ]
        },
        {
          title: "3. Utilisation des Données",
          intro: "Nous utilisons vos données pour :",
          list: [
            "Fournir et améliorer nos services de recherche de stages",
            "Personnaliser vos recommandations grâce à notre IA",
            "Analyser votre CV et générer des lettres de motivation",
            "Gérer votre abonnement et traiter les paiements",
            "Vous envoyer des alertes d'offres correspondant à votre profil",
            "Améliorer nos algorithmes d'IA et la qualité de nos services",
            "Communiquer avec vous concernant votre compte et nos services"
          ]
        },
        {
          title: "4. Partage des Données",
          intro: "Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations avec :",
          list: [
            "Prestataires de services : Stripe pour les paiements, OpenRouter pour l'IA",
            "Entreprises : uniquement si vous postulez à une offre (avec votre consentement explicite)",
            "Autorités légales : si requis par la loi"
          ]
        },
        {
          title: "5. Sécurité des Données",
          content: "Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Cela inclut le cryptage des mots de passe, des connexions HTTPS sécurisées, et des sauvegardes régulières."
        },
        {
          title: "6. Vos Droits (RGPD)",
          intro: "Conformément au RGPD, vous disposez des droits suivants :",
          list: [
            "Droit d'accès : obtenir une copie de vos données personnelles",
            "Droit de rectification : corriger vos données inexactes",
            "Droit à l'effacement : supprimer vos données (\"droit à l'oubli\")",
            "Droit à la portabilité : recevoir vos données dans un format structuré",
            "Droit d'opposition : vous opposer au traitement de vos données",
            "Droit de limitation : limiter le traitement de vos données"
          ],
          outro: "Pour exercer ces droits, contactez-nous à : privacy@stagefinder.com"
        },
        {
          title: "7. Cookies et Technologies Similaires",
          content: "Nous utilisons des cookies essentiels pour le fonctionnement de notre plateforme (authentification, préférences). Nous n'utilisons pas de cookies publicitaires tiers. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur."
        },
        {
          title: "8. Conservation des Données",
          content: "Nous conservons vos données personnelles aussi longtemps que votre compte est actif ou que nécessaire pour vous fournir nos services. Si vous supprimez votre compte, vos données seront effacées dans un délai de 30 jours, sauf obligation légale de conservation."
        },
        {
          title: "9. Transferts Internationaux",
          content: "Vos données peuvent être transférées et traitées dans des pays en dehors de l'Union Européenne. Nous nous assurons que ces transferts respectent les exigences du RGPD et que des garanties appropriées sont en place (clauses contractuelles types, Privacy Shield)."
        },
        {
          title: "10. Modifications de cette Politique",
          content: "Nous pouvons mettre à jour cette politique de confidentialité de temps en temps. Nous vous informerons de tout changement significatif par email ou via une notification sur la plateforme. La date de dernière mise à jour est indiquée en haut de cette page."
        },
        {
          title: "11. Contact",
          content: "Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez notre délégué à la protection des données :",
          contact: "Email : dpo@stagefinder.com\nAdresse : StageFinder, Paris, France"
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

              {section.outro && (
                <p className="mt-4">
                  {section.outro.includes('@') ? (
                    <>
                      {section.outro.split(': ')[0]}:{' '}
                      <a href={`mailto:${section.outro.split(': ')[1]}`} className="text-white underline">
                        {section.outro.split(': ')[1]}
                      </a>
                    </>
                  ) : section.outro}
                </p>
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
