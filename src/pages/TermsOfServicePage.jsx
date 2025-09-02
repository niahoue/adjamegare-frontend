import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { FileText, Shield, Users, AlertTriangle } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <>
      <SEO 
        title="Conditions d'Utilisation | Termes et conditions - adjamegare"
        description="Consultez les conditions d'utilisation de adjamegare. Termes et conditions régissant l'utilisation de notre plateforme de réservation de billets de bus."
        keywords="conditions utilisation adjamegare, termes conditions, règlement transport, CGU adjamegare"
        canonicalUrl="https://adjamegare.com/conditions-utilisation"
        ogType="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Conditions d'Utilisation - adjamegare",
          "description": "Conditions générales d'utilisation de la plateforme adjamegare",
          "url": "https://adjamegare.com/conditions-utilisation",
          "isPartOf": {
            "@type": "WebSite",
            "name": "adjamegare",
            "url": "https://adjamegare.com"
          },
          "publisher": {
            "@type": "Organization",
            "name": "WebKlor SARL",
            "legalName": "WebKlor SARL"
          },
          "dateModified": "2025-05-28",
          "inLanguage": "fr"
        }}
      />    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <header className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-6 text-teal-200" aria-hidden="true" />
              <h1 className="text-4xl font-bold mb-4">Conditions d'Utilisation</h1>
              <p className="text-xl text-teal-100">
                Dernière mise à jour : 28 mai 2025
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
              
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  Bienvenue sur adjamegare, une plateforme de réservation de transport en bus exploitée par WebKlor SARL. 
                  En utilisant notre service, vous acceptez d'être lié par les présentes conditions d'utilisation. 
                  Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                </p>
              </section>

              {/* Définitions */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Définitions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Service</h3>
                    <p className="text-gray-700">
                      La plateforme adjamegare accessible via le site web et l'application mobile permettant la réservation 
                      de voyages en bus en Côte d'Ivoire et en Afrique de l'Ouest.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Utilisateur</h3>
                    <p className="text-gray-700">
                      Toute personne physique ou morale utilisant les services de adjamegare.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Transporteur</h3>
                    <p className="text-gray-700">
                      Les compagnies de transport partenaires proposant leurs services via notre plateforme.
                    </p>
                  </div>
                </div>
              </section>

              {/* Utilisation du Service */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-teal-600" />
                  3. Utilisation du Service
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 Éligibilité</h3>
                    <p className="text-gray-700">
                      Vous devez avoir au moins 18 ans pour utiliser nos services. En créant un compte, 
                      vous garantissez que vous avez l'âge légal et la capacité juridique pour contracter.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2 Compte Utilisateur</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Vous êtes responsable de maintenir la confidentialité de votre compte</li>
                      <li>Vous devez fournir des informations exactes et à jour</li>
                      <li>Un compte par personne physique est autorisé</li>
                      <li>Vous êtes responsable de toutes les activités sous votre compte</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">3.3 Utilisation Acceptable</h3>
                    <p className="text-gray-700 mb-2">Il est interdit d'utiliser notre service pour :</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Toute activité illégale ou frauduleuse</li>
                      <li>Harceler, menacer ou nuire à d'autres utilisateurs</li>
                      <li>Diffuser des virus ou codes malveillants</li>
                      <li>Contourner nos mesures de sécurité</li>
                      <li>Utiliser des robots ou scripts automatisés</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Réservations et Paiements */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Réservations et Paiements</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 Processus de Réservation</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Les réservations sont confirmées après validation du paiement</li>
                      <li>Les prix affichés incluent toutes les taxes applicables</li>
                      <li>Les billets sont émis sous forme électronique</li>
                      <li>Vous devez présenter une pièce d'identité valide lors du voyage</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 Paiements</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Paiements acceptés : cartes bancaires, mobile money, espèces (points de vente)</li>
                      <li>Les paiements sont sécurisés et traités par nos partenaires certifiés</li>
                      <li>Les frais de service sont clairement indiqués avant confirmation</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3 Annulations et Remboursements</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Annulation gratuite jusqu'à 24h avant le départ</li>
                      <li>Annulation entre 24h et 6h : 50% de frais</li>
                      <li>Annulation moins de 6h avant : 100% de frais</li>
                      <li>Remboursements traités sous 5-7 jours ouvrables</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Responsabilités */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-teal-600" />
                  5. Responsabilités et Limitations
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.1 Rôle de adjamegare</h3>
                    <p className="text-gray-700">
                      adjamegare agit en tant qu'intermédiaire entre les utilisateurs et les transporteurs. 
                      Nous facilitons les réservations mais ne sommes pas responsables du service de transport lui-même.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.2 Limitation de Responsabilité</h3>
                    <p className="text-gray-700">
                      Notre responsabilité est limitée au montant payé pour la réservation. 
                      Nous ne sommes pas responsables des dommages indirects, incidents ou consécutifs.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.3 Force Majeure</h3>
                    <p className="text-gray-700">
                      Nous ne sommes pas responsables des retards ou annulations dus à des événements 
                      hors de notre contrôle (conditions météorologiques, troubles civils, etc.).
                    </p>
                  </div>
                </div>
              </section>

              {/* Propriété Intellectuelle */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propriété Intellectuelle</h2>
                <p className="text-gray-700 mb-4">
                  Tous les contenus de la plateforme adjamegare (textes, images, logos, codes) sont protégés 
                  par les droits de propriété intellectuelle et appartiennent à WebKlor SARL ou à ses partenaires.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Utilisation personnelle et non commerciale autorisée</li>
                  <li>Reproduction ou distribution interdite sans autorisation</li>
                  <li>Respect des marques et droits d'auteur tiers</li>
                </ul>
              </section>

              {/* Données Personnelles */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Protection des Données</h2>
                <p className="text-gray-700">
                  Le traitement de vos données personnelles est régi par notre 
                  <a href="/politique-confidentialite" className="text-teal-600 hover:text-teal-800 underline ml-1">
                    Politique de Confidentialité
                  </a>
                  , qui fait partie intégrante des présentes conditions.
                </p>
              </section>

              {/* Modifications */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-amber-600" />
                  8. Modifications des Conditions
                </h2>
                <p className="text-gray-700">
                  Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. 
                  Les modifications entrent en vigueur dès leur publication sur notre site. 
                  L'utilisation continue de nos services constitue votre acceptation des nouvelles conditions.
                </p>
              </section>

              {/* Droit Applicable */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Droit Applicable et Juridiction</h2>
                <p className="text-gray-700">
                  Les présentes conditions sont régies par le droit ivoirien. 
                  Tout litige sera soumis à la juridiction exclusive des tribunaux d'Abidjan, Côte d'Ivoire.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-8">
                <div className="bg-teal-50 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
                  <p className="text-gray-700 mb-4">
                    Pour toute question concernant ces conditions d'utilisation, contactez-nous :
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email :</strong> legal@adjamegare.com</p>
                    <p><strong>Téléphone :</strong> +225 01 61 55 65 13</p>
                    <p><strong>Adresse :</strong> Marcory, Abidjan, Côte d'Ivoire</p>
                  </div>
                </div>
              </section>

              {/* Footer légal */}
              <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
                <p>© 2024 WebKlor SARL - Tous droits réservés</p>
                <p>Document légal - Version 1.0</p>              </div>
            </div>
          </article>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default TermsOfServicePage;
