import React from 'react';
import { Globe, Wifi, Smartphone, Leaf } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Globe className="w-12 h-12 text-[#73D700]" />,
      title: 'Vous connecter au monde',
      description: 'Des possibilités infinies. Découvrez plus de 8 000 destinations dans plus de 16 pays'
    },
    {
      icon: <Wifi className="w-12 h-12 text-[#73D700]" />,
      title: 'Confort en déplacement',
      description: 'Détendez-vous avec le Wi-Fi gratuit, des prises de courant et un espace pour les jambes supplémentaire. C\'est ça, les bus modernes.'
    },
    {
      icon: <Smartphone className="w-12 h-12 text-[#73D700]" />,
      title: 'Choisir, réserver, voyager',
      description: 'De votre écran à votre siège en quelques secondes. Vous effectuez la réservation, nous nous occupons du reste.'
    },
    {
      icon: <Leaf className="w-12 h-12 text-[#73D700]" />,
      title: 'Voyage respectueux de la planète',
      description: 'Laissez tomber la voiture, voyagez avec nous. Augmentez votre kilométrage et réduisez votre empreinte carbone.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-50 rounded-full">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;