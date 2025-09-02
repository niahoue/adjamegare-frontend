import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Shield, Eye, Lock, Database, User, Mail, Phone, Globe } from 'lucide-react';

const PrivacyPolitics = () => {
  return (
    <>
      <SEO 
        title="Politique de Confidentialité | Protection des données - adjamegare"
        description="Découvrez comment adjamegare protège vos données personnelles. Notre politique de confidentialité détaille la collecte, l'utilisation et la protection de vos informations."
        keywords="politique confidentialité adjamegare, protection données, RGPD, vie privée, sécurité données personnelles"
        canonicalUrl="https://adjamegare.com/politique-confidentialite"
        ogType="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Politique de Confidentialité - adjamegare",
          "description": "Politique de confidentialité et protection des données personnelles de adjamegare",
          "url": "https://adjamegare.com/politique-confidentialite",
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
        <header className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-6 text-green-200" aria-hidden="true" />
              <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
              <p className="text-xl text-green-100">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-green-600" aria-hidden="true" />
                1. Introduction
              </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  WebKlor SARL, éditeur de la plateforme adjamegare, s'engage à protéger la confidentialité et la sécurité 
                  de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, 
                  utilisons, stockons et protégeons vos informations personnelles.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  En utilisant nos services, vous consentez aux pratiques décrites dans cette politique de confidentialité.
                </p>
              </section>

              {/* Données collectées */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Database className="w-6 h-6 mr-2 text-green-600" />
                  2. Données que nous collectons
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-teal-600" />
                      Informations d'identification
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Nom et prénom</li>
                      <li>Adresse e-mail</li>
                      <li>Numéro de téléphone</li>
                      <li>Date de naissance</li>
                      <li>Numéro de pièce d'identité (si requis)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-teal-600" />
                      Données de transaction
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Historique des réservations</li>
                      <li>Informations de paiement (cryptées)</li>
                      <li>Préférences de voyage</li>
                      <li>Communications avec notre service client</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-teal-600" />
                      Données techniques
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Adresse IP</li>
                      <li>Type de navigateur et version</li>
                      <li>Système d'exploitation</li>
                      <li>Pages visitées et temps passé</li>
                      <li>Données de géolocalisation (avec votre consentement)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Utilisation des données */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Comment nous utilisons vos données</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Services principaux</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Traitement des réservations</li>
                      <li>Gestion des paiements</li>
                      <li>Communication des informations de voyage</li>
                      <li>Support client</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-teal-500 pl-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Amélioration des services</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Analyse de l'utilisation de la plateforme</li>
                      <li>Personnalisation de l'expérience</li>
                      <li>Prévention de la fraude</li>
                      <li>Recherche et développement</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Partage des données */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Partage de vos données</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
                  <p className="text-yellow-800">
                    <strong>Principe :</strong> Nous ne vendons jamais vos données personnelles à des tiers.
                  </p>
                </div>
                
                <p className="text-gray-700 mb-4">Nous pouvons partager vos données uniquement dans les cas suivants :</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Partenaires de transport :</strong> Pour la réalisation de votre voyage</li>
                  <li><strong>Prestataires de paiement :</strong> Pour traiter vos transactions (données cryptées)</li>
                  <li><strong>Services cloud :</strong> Pour l'hébergement sécurisé de nos données</li>
                  <li><strong>Obligations légales :</strong> Si requis par la loi ou les autorités compétentes</li>
                  <li><strong>Protection des droits :</strong> Pour protéger nos droits, propriété ou sécurité</li>
                </ul>
              </section>

              {/* Sécurité */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-2 text-green-600" />
                  5. Sécurité de vos données
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-teal-50 rounded-lg">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-teal-600" />
                    <h3 className="font-semibold text-gray-800 mb-2">Cryptage</h3>
                    <p className="text-gray-600 text-sm">Chiffrement SSL/TLS pour toutes les transmissions</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <h3 className="font-semibold text-gray-800 mb-2">Accès restreint</h3>
                    <p className="text-gray-600 text-sm">Accès limité aux employés autorisés uniquement</p>
                  </div>
                  <div className="text-center p-6 bg-teal-50 rounded-lg">
                    <Database className="w-12 h-12 mx-auto mb-4 text-teal-600" />
                    <h3 className="font-semibold text-gray-800 mb-2">Sauvegardes</h3>
                    <p className="text-gray-600 text-sm">Sauvegardes régulières et sécurisées</p>
                  </div>
                </div>
              </section>

              {/* Vos droits */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vos droits</h2>
                <div className="bg-teal-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">Conformément aux lois sur la protection des données, vous disposez des droits suivants :</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li><strong>Droit d'accès :</strong> Consulter vos données</li>
                      <li><strong>Droit de rectification :</strong> Corriger vos informations</li>
                      <li><strong>Droit d'effacement :</strong> Supprimer vos données</li>
                    </ul>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li><strong>Droit à la portabilité :</strong> Récupérer vos données</li>
                      <li><strong>Droit d'opposition :</strong> Refuser certains traitements</li>
                      <li><strong>Droit de limitation :</strong> Limiter l'utilisation</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies et technologies similaires</h2>
                <p className="text-gray-700 mb-4">
                  Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme. 
                  Pour plus d'informations détaillées, consultez notre 
                  <a href="/cookies" className="text-green-600 hover:text-green-700 underline ml-1">
                    Politique de Cookies
                  </a>.
                </p>
              </section>

              {/* Conservation des données */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Conservation des données</h2>
                <p className="text-gray-700 mb-4">
                  Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux fins 
                  pour lesquelles elles ont été collectées, ou selon les exigences légales.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Données de compte :</strong> Jusqu'à la suppression de votre compte</li>
                  <li><strong>Données de transaction :</strong> 10 ans pour les obligations comptables</li>
                  <li><strong>Données de marketing :</strong> 3 ans après le dernier contact</li>
                </ul>
              </section>

              {/* Contact */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Nous contacter</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
                  </p>
                  <div className="space-y-2">
                    <p className="flex items-center text-gray-700">
                      <Mail className="w-5 h-5 mr-2 text-green-600" />
                      <strong>Email :</strong> 
                      <a href="mailto:busticket225@gmail.com" className="text-green-600 hover:text-green-700 ml-1">
                        privacy@adjamegare.ci
                      </a>
                    </p>
                    <p className="flex items-center text-gray-700">
                      <Phone className="w-5 h-5 mr-2 text-green-600" />
                      <strong>Téléphone :</strong> +225 01 61 55 65 13
                    </p>
                    <p className="text-gray-700">
                      <strong>Adresse :</strong> WebKlor SARL, Abidjan, Côte d'Ivoire
                    </p>
                  </div>
                </div>
              </section>

              {/* Modifications */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications de cette politique</h2>
                <p className="text-gray-700">
                  Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                  Les modifications seront publiées sur cette page avec une date de mise à jour révisée. 
                  Nous vous encourageons à consulter régulièrement cette politique pour rester informé de 
                  la façon dont nous protégeons vos informations.
                </p>
              </section>            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolitics;
