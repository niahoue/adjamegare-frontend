import React from 'react';
import { Card, CardContent } from './ui/card';
import { Settings, MapPin, HelpCircle, Briefcase } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: <Settings className="w-6 h-6 text-[#73D700]" />,
      title: 'Gérer ma réservation',
      description: 'Voir, modifier ou annuler votre réservation',
      path: '/profile'
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#73D700]" />,
      title: 'Suivre mon voyage',
      description: 'Suivez votre bus en temps réel',
      path: '/track-travel'
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-[#73D700]" />,
      title: 'Aide',
      description: 'Obtenez de l\'aide et trouvez des réponses à vos questions',
      path: '/help'
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {actions.map((action, index) => (
            <Card
              key={index}
              onClick={() => navigate(action.path)}
              className="cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border-gray-200 hover:border-[#73D700]"
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full hover:bg-green-200 transition-colors duration-200">
                    {action.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Nouvelle carte pour devenir partenaire */}
          <Card className="shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-2 border-[#73D700] bg-gradient-to-br from-white to-green-50">
            <CardContent className="p-6 text-center flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Briefcase className="w-6 h-6 text-[#73D700]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Devenez partenaire
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Vous êtes propriétaire d'une compagnie ? 
                  Augmentez vos ventes en rejoignant notre plateforme.
                </p>
              </div>
              <Link
                to="/partner"
                className="inline-block bg-[#73D700] text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-colors duration-200"
              >
                Je deviens partenaire
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QuickActions;