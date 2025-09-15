import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin, Smartphone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Informations de l'entreprise */}
          <section className="space-y-4">
            <div className="flex space-x-4">
              <ul className="flex space-x-4" role="list" aria-label="Réseaux sociaux">
                <li>
                  <a 
                    href="https://www.facebook.com/adjamegare" 
                    className="text-gray-300 hover:text-[#F46A21] transition-colors" 
                    aria-label="Suivez-nous sur Facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://x.com/busticket225" 
                    className="text-gray-300 hover:text-[#F46A21] transition-colors" 
                    aria-label="Suivez-nous sur Twitter"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-[#F46A21] transition-colors" 
                    aria-label="Suivez-nous sur Instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.linkedin.com/company/adjamegare" 
                    className="text-gray-300 hover:text-[#F46A21] transition-colors" 
                    aria-label="Suivez-nous sur LinkedIn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </li>
              </ul>
            </div>
          </section>

          {/* Liens rapides */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Liens rapides</h3>
            <nav aria-label="Navigation footer">
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/" 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    aria-label="Aller à la page d'accueil"
                  >
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/routes" 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    aria-label="Voir les destinations nationales"
                  >
                    Destinations Nationales
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/routes" 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    aria-label="Voir les destinations internationales"
                  >
                    Destinations Internationales
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/help" 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    aria-label="Accéder au centre d'aide"
                  >
                    Centre d'Aide
                  </Link>
                </li>
              </ul>
            </nav>
          </section>

          {/* Services */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Nos Services</h3>
            <ul className="space-y-2 text-sm text-gray-300" role="list" aria-label="Liste des services">
              <li>Réservation en ligne</li>
              <li>Transport sécurisé</li>
              <li>Service clientèle 24/7</li>
              <li>Assurance voyage</li>
              <li>Suivi en temps réel</li>
              <li>Annulation flexible</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <address className="space-y-3 not-italic">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#F46A21] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-gray-300">
                  <p>Marcory, Abidjan</p>
                  <p>Côte d'Ivoire</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#F46A21] flex-shrink-0" aria-hidden="true" />
                <a 
                  href="tel:+22501615565009" 
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                  aria-label="Appeler adjamegare"
                >
                  +225 01 61 55 65 09
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#F46A21] flex-shrink-0" aria-hidden="true" />
                <a 
                  href="mailto:busticket225@gmail.com" 
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                  aria-label="Envoyer un email à adjamegare"
                >
                  adjamegare@gmail.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#F46A21] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-gray-300">
                  <p>Lun - Ven: 8h00 - 22h00</p>
                  <p>Sam - Dim: 9h00 - 20h00</p>
                </div>
              </div>
            </address>
          </section>
        </div>

        {/* 🚀 Nouvelle section Application Mobile */}
        <div className="bg-[#F46A21]/10 text-center py-6 mt-12 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <Smartphone className="w-8 h-8 text-[#F46A21]" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-white">Application mobile bientôt disponible !</h3>
            <p className="text-sm text-gray-300 max-w-md">
              Réservez vos billets encore plus facilement grâce à notre future application mobile sur iOS et Android.
            </p>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-300">
              © 2024 adjamegare. Tous droits réservés.
              <br />
              adjamegare est une propriété de WebKlor sarl.
            </div>
            <nav aria-label="Liens légaux">
              <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
                <Link 
                  to="/terms-of-service" 
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Lire les conditions d'utilisation"
                >
                  Conditions d'utilisation
                </Link>
                <Link 
                  to="/privacy-policy" 
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Lire la politique de confidentialité"
                  data-discover="true"
                >
                  Politique de confidentialité
                </Link>
                <Link 
                  to="/cookies" 
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="En savoir plus sur les cookies"
                  data-discover="true"
                >
                  Cookies
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
