// src/pages/BusStationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  BusFront, 
  Route as RouteIcon, 
  Star, 
  ArrowLeft,
  Globe,
  Clock,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/apiService';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from 'react-i18next';

const BusStationsPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setIsLoading(true);
        const response = await api.travel.getStations();
        
        if (response.data.success) {
          setStations(response.data.data);
        } else {
          setError(response.data.message || 'Impossible de récupérer les stations.');
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des stations:", err);
        const errorMessage = err.response?.data?.message || 'Erreur serveur lors de la récupération des stations.';
        setError(errorMessage);
        
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les gares de bus. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, [toast]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85805] mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des stations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec bouton retour */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('our_bus_stations') || 'Nos Stations de Bus'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Découvrez nos stations de bus réparties dans tout le pays
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-center text-red-600">{error}</p>
            <div className="text-center mt-4">
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Réessayer
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && stations.length === 0 && (
          <div className="text-center py-12">
            <BusFront className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              {t('no_stations_found') || 'Aucune station trouvée'}
            </p>
            <Button onClick={handleGoBack} variant="outline">
              Retour à l'accueil
            </Button>
          </div>
        )}

        {/* Grille des stations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => (
            <Card 
              key={station._id} 
              className="hover:shadow-lg transition-all duration-200 hover:scale-105 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <BusFront className="w-5 h-5 mr-2 text-[#e85805] flex-shrink-0" />
                    <span className="truncate text-blue-600">{station.name}</span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardTitle>
                <p className="text-sm text-gray-500 font-medium">{station.companyName}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                  {station.description || 'Station de transport moderne avec tous les équipements nécessaires pour votre voyage.'}
                </p>

                {/* Informations de contact */}
                <div className="space-y-2">
                  <div className="flex items-start text-sm text-gray-700 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{station.address || 'Adresse non spécifiée'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{station.phone || 'N° de téléphone non spécifié'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{station.email || 'Email non spécifié'}</span>
                  </div>
                  {station.website && (
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-400">
                      <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                      <a 
                        href={station.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#e85805] hover:underline truncate"
                      >
                        Site web
                      </a>
                    </div>
                  )}
                </div>

                {/* Statistiques */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-[#e85805]/10 text-[#e85805]">
                    <RouteIcon className="w-3 h-3" />
                    <span>{station.routeCount || 0} route{(station.routeCount || 0) !== 1 ? 's' : ''}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    <Users className="w-3 h-3 mr-1" />
                    {station.servedCities?.length || 0} ville{(station.servedCities?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Villes desservies */}
                {station.servedCities && station.servedCities.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Villes desservies :</p>
                    <div className="flex flex-wrap gap-1">
                      {station.servedCities.slice(0, 4).map((city, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs px-2 py-1 bg-gray-50 "
                        >
                          {city}
                        </Badge>
                      ))}
                      {station.servedCities.length > 4 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700"
                        >
                          +{station.servedCities.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Prix si disponible */}
                {station.priceRange && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Gamme de prix :
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-medium text-sm">
                        À partir de {station.priceRange.min?.toLocaleString('fr-FR')} F CFA
                      </span>
                      <span className="text-gray-500 text-xs">
                        jusqu'à {station.priceRange.max?.toLocaleString('fr-FR')} F
                      </span>
                    </div>
                  </div>
                )}

                {/* Services et équipements */}
                {station.services && station.services.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Services :</p>
                    <div className="flex flex-wrap gap-1">
                      {station.services.slice(0, 2).map((service, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-blue-50 text-blue-600"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton d'action */}
                <div className="pt-2">
                  <Button asChild className="w-full bg-[#e85805] hover:bg-[#F46A21] transition-colors">
                    <Link to={`/stations/${station._id}`}>
                      {t('view_details') || 'Voir les détails'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message informatif */}
        {stations.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Notre réseau de transport
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {stations.length} station{stations.length > 1 ? 's' : ''} disponible{stations.length > 1 ? 's' : ''} dans notre réseau
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#e85805]">{stations.length}</div>
                  <div className="text-sm text-gray-600">Stations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#e85805]">
                    {stations.reduce((total, station) => total + (station.routeCount || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Routes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#e85805]">
                    {[...new Set(stations.flatMap(station => station.servedCities || []))].length}
                  </div>
                  <div className="text-sm text-gray-600">Villes</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusStationsPage;