import React from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion'; 
import { Mail, Phone, MapPin } from 'lucide-react';

const HelpPage = () => {
  const faqItems = [
    {
      question: "Comment puis-je réserver un billet de bus ?",
      answer: "Vous pouvez réserver un billet directement sur notre page d'accueil en utilisant le formulaire de recherche. Sélectionnez votre ville de départ, de destination, la date et le nombre de passagers, puis cliquez sur 'Rechercher'."
    },
    {
      question: "Puis-je modifier ou annuler ma réservation ?",
      answer: "Oui, vous pouvez modifier ou annuler votre réservation jusqu'à 24 heures avant le départ prévu. Rendez-vous dans la section 'Mon Profil' et sélectionnez la réservation concernée."
    },
    {
      question: "Quels sont les modes de paiement acceptés ?",
      answer: "Nous acceptons les paiements via Paydunya, qui inclut les paiements par Mobile Money (Orange Money, MTN MoMo, Moov Money) et par carte bancaire (Visa, Mastercard)."
    },
    {
      question: "Que se passe-t-il si je rate mon bus ?",
      answer: "En cas de bus manqué, votre billet n'est généralement pas remboursable ni modifiable. Nous vous recommandons d'arriver à la gare au moins 30 minutes avant l'heure de départ."
    },
    {
      question: "Comment puis-je contacter le support client ?",
      answer: "Vous pouvez nous contacter par téléphone, par e-mail ou via notre formulaire de contact sur cette page."
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
          Centre d'Aide & FAQ
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Foire Aux Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-left text-gray-800 dark:text-gray-200">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 dark:text-gray-400">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-xl">Nous Contacter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Téléphone</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">+225 01 61 55 65 09</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">contact@adjamegare.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Adresse</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Abidjan, Côte d'Ivoire</p>
                </div>
              </div>
              <Button asChild className="w-full bg-[#e85805] hover:bg-[#F46A21]">
                <a href="mailto:contact@adjamegare.com">Envoyer un Email</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
