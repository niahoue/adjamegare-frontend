import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Cookie, Settings, BarChart3, Shield, Eye, Globe, Check, X } from 'lucide-react';

const CookiesPage = () => {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: true,
    marketing: false,
    personalization: true
  });

  const handlePreferenceChange = (type) => {
    if (type === 'essential') return; // Cannot change essential cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const savePreferences = () => {
    // Here you would typically save to localStorage or send to server
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    alert('Vos préférences ont été enregistrées !');
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
  };

  const rejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    setPreferences(essentialOnly);
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
  };

  return (
    <>
      <SEO 
        title="Gestion des Cookies | Préférences de confidentialité - adjamegare"
        description="Gérez vos préférences de cookies sur adjamegare. Contrôlez l'utilisation des cookies analytiques, marketing et de personnalisation selon vos besoins."
        keywords="cookies adjamegare, préférences confidentialité, gestion cookies, RGPD cookies, paramètres cookies"
        canonicalUrl="https://adjamegare.com/cookies"
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Gestion des Cookies - adjamegare",
          "description": "Page de gestion des préférences de cookies et de confidentialité",
          "url": "https://adjamegare.com/cookies",
          "isPartOf": {
            "@type": "WebSite",
            "name": "adjamegare",
            "url": "https://adjamegare.com"
          },
          "publisher": {
            "@type": "Organization",
            "name": "WebKlor SARL"
          },
          "inLanguage": "fr"
        }}
      />
      
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <div className="flex-grow">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <Cookie className="w-16 h-16 mx-auto mb-6 text-orange-200" />
                <h1 className="text-4xl font-bold mb-4">Politique de Cookies</h1>
                <p className="text-xl text-orange-100">
                  Dernière mise à jour : 28 mai 2025
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-orange-600" />
                  1. Qu'est-ce qu'un cookie ?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) 
                  lorsque vous visitez un site web. Les cookies permettent au site de reconnaître votre appareil 
                  et de mémoriser certaines informations sur vos préférences ou actions passées.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  adjamegare utilise des cookies pour améliorer votre expérience de navigation, analyser l'utilisation 
                  de notre plateforme et vous proposer du contenu personnalisé.
                </p>
              </section>

              {/* Types de cookies */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Types de cookies que nous utilisons</h2>
                
                <div className="space-y-6">
                  {/* Essential Cookies */}
                  <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                    <div className="flex items-center mb-4">
                      <Shield className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Cookies essentiels</h3>
                        <p className="text-green-600 text-sm">Obligatoires - Ne peuvent pas être désactivés</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés. 
                      Ils sont généralement définis en réponse à des actions que vous effectuez.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Exemples :</h4>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          <li>Gestion de session utilisateur</li>
                          <li>Panier de réservation</li>
                          <li>Paramètres de sécurité</li>
                          <li>Préférences de langue</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Durée :</h4>
                        <p className="text-gray-700 text-sm">Session ou jusqu'à 1 an</p>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border border-teal-200 rounded-lg p-6 bg-teal-50">
                    <div className="flex items-center mb-4">
                      <BarChart3 className="w-8 h-8 text-teal-600 mr-3" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Cookies d'analyse</h3>
                        <p className="text-teal-600 text-sm">Optionnels - Peuvent être désactivés</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site 
                      en collectant et rapportant des informations de manière anonyme.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Exemples :</h4>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          <li>Google Analytics</li>
                          <li>Nombre de visiteurs</li>
                          <li>Pages les plus populaires</li>
                          <li>Temps passé sur le site</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Durée :</h4>
                        <p className="text-gray-700 text-sm">Jusqu'à 2 ans</p>
                      </div>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border border-teal-200 rounded-lg p-6 bg-teal-50">
                    <div className="flex items-center mb-4">
                      <Globe className="w-8 h-8 text-teal-600 mr-3" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Cookies marketing</h3>
                        <p className="text-teal-600 text-sm">Optionnels - Peuvent être désactivés</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Ces cookies sont utilisés pour suivre les visiteurs sur les sites web. L'intention est 
                      d'afficher des publicités pertinentes et engageantes pour l'utilisateur individuel.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Exemples :</h4>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          <li>Facebook Pixel</li>
                          <li>Google Ads</li>
                          <li>Retargeting publicitaire</li>
                          <li>Réseaux sociaux</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Durée :</h4>
                        <p className="text-gray-700 text-sm">Jusqu'à 1 an</p>
                      </div>
                    </div>
                  </div>

                  {/* Personalization Cookies */}
                  <div className="border border-indigo-200 rounded-lg p-6 bg-indigo-50">
                    <div className="flex items-center mb-4">
                      <Settings className="w-8 h-8 text-indigo-600 mr-3" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Cookies de personnalisation</h3>
                        <p className="text-indigo-600 text-sm">Optionnels - Peuvent être désactivés</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Ces cookies permettent au site de mémoriser vos choix et de vous fournir des fonctionnalités 
                      personnalisées et améliorées.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Exemples :</h4>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          <li>Destinations favorites</li>
                          <li>Historique de recherche</li>
                          <li>Préférences d'affichage</li>
                          <li>Recommandations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Durée :</h4>
                        <p className="text-gray-700 text-sm">Jusqu'à 6 mois</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Gestion des cookies */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Comment gérer vos cookies</h2>
                <p className="text-gray-700 mb-6">
                  Vous pouvez contrôler et gérer les cookies de plusieurs façons. Veuillez noter que la suppression 
                  ou le blocage des cookies peut affecter votre expérience utilisateur.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Via votre navigateur</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      La plupart des navigateurs vous permettent de contrôler les cookies via leurs paramètres.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      <li><a href="#" className="text-teal-600 hover:underline">Chrome</a></li>
                      <li><a href="#" className="text-teal-600 hover:underline">Firefox</a></li>
                      <li><a href="#" className="text-teal-600 hover:underline">Safari</a></li>
                      <li><a href="#" className="text-teal-600 hover:underline">Edge</a></li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Outils de désinscription</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      Vous pouvez vous désinscrire de la publicité comportementale en ligne.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      <li><a href="#" className="text-teal-600 hover:underline">Digital Advertising Alliance</a></li>
                      <li><a href="#" className="text-teal-600 hover:underline">Network Advertising Initiative</a></li>
                      <li><a href="#" className="text-teal-600 hover:underline">European Digital Advertising Alliance</a></li>
                    </ul>
                  </div>
                </div>
              </section>

            </div>

            {/* Cookie Preferences Panel */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-orange-600" />
                Gérer vos préférences de cookies
              </h2>

              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Cookies essentiels</h3>
                    <p className="text-gray-600 text-sm">Nécessaires au fonctionnement du site</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 font-medium mr-2">Toujours actifs</span>
                    <div className="w-12 h-6 bg-green-600 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Cookies d'analyse</h3>
                    <p className="text-gray-600 text-sm">Nous aident à améliorer notre site</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('analytics')}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.analytics ? 'bg-teal-600 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Cookies marketing</h3>
                    <p className="text-gray-600 text-sm">Pour des publicités personnalisées</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('marketing')}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.marketing ? 'bg-teal-600 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                  </button>
                </div>

                {/* Personalization Cookies */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Cookies de personnalisation</h3>
                    <p className="text-gray-600 text-sm">Pour une expérience personnalisée</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('personalization')}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.personalization ? 'bg-indigo-600 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={savePreferences}
                  className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Enregistrer mes préférences
                </button>
                <button
                  onClick={acceptAll}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accepter tout
                </button>
                <button
                  onClick={rejectAll}
                  className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 mr-2" />
                  Refuser les cookies optionnels
                </button>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Informations supplémentaires</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookies tiers</h3>
                  <p className="text-gray-700">
                    Certains cookies sont placés par des services tiers qui apparaissent sur nos pages. 
                    Nous n'avons aucun contrôle sur ces cookies. Ces services tiers ont leurs propres 
                    politiques de confidentialité.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Mise à jour de cette politique</h3>
                  <p className="text-gray-700">
                    Nous pouvons mettre à jour cette politique de cookies de temps à autre. Les modifications 
                    seront publiées sur cette page avec une date de mise à jour révisée.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact</h3>
                  <p className="text-gray-700">
                    Si vous avez des questions concernant notre utilisation des cookies, contactez-nous à 
                    <a href="mailto:privacy@adjamegare.ci" className="text-orange-600 hover:text-orange-700 underline ml-1">
                      privacy@adjamegare.ci
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default CookiesPage;
