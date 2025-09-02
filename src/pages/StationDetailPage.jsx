import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  BusFront, 
  Clock, 
  DollarSign,
  Users,
  Route as RouteIcon,
  Star,
  Wifi,
  Coffee,
  AirVent,
  Shield,
  Globe,
  Navigation,
  Calendar,
  Info,
  Icon
} from 'lucide-react';
import api from '../services/apiService';
import { useToast } from '../hooks/use-toast';
//import { useTranslation } from 'react-i18next';
import { format , parseISO} from 'date-fns';
import { fr } from 'date-fns/locale';

const StationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
//  const { t } = useTranslation();

  const [station, setStation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  // Récupérer le nom de la compagnie depuis l'état de navigation
  const companyNameFromState = location.state?.companyName;

  useEffect(() => {
    const fetchStationDetails = async () => {
      try {
        setIsLoading(true);
        // Assurez-vous que l'API renvoie l'objet Company complet ou au moins son nom
        const response = await api.travel.getStationById(id);
        
        if (response.data.success) {
          const fetchedStation = response.data.data;

          // Calculer min, max, avg price si des routes existent
          let minPrice = 0, maxPrice = 0, averagePrice = 0;
          if (fetchedStation.routes && fetchedStation.routes.length > 0) {
            const prices = fetchedStation.routes.map(route => route.price);
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
            averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
          }
          
          setStation({
            ...fetchedStation,
            priceRange: fetchedStation.routes && fetchedStation.routes.length > 0 ? { min: minPrice, max: maxPrice, average: averagePrice } : null,
            // Services et équipements par défaut si non fournis par l'API pour la station elle-même
            services: fetchedStation.services || ['Transport de passagers', 'Bagages inclus', 'Service clientèle', 'Assistance aux voyageurs'],
            amenities: fetchedStation.amenities || ['Sièges confortables', 'Climatisation', 'Éclairage LED', 'Espace bagages'],
          });
        } else {
          setError(response.data.message || 'Station non trouvée.');
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de la station:", err);
        const errorMessage = err.response?.data?.message || 'Erreur serveur.';
        setError(errorMessage);
        
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de la station.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchStationDetails();
    }
  }, [id, toast]);

  const handleBookRoute = (route) => {
     const departureDate = route.departureDate ? parseISO(route.departureDate) : new Date();

    const searchParams = {
      tripType: 'oneWay',
      from: route.from, 
      to: route.to,     
      departureDate: format(departureDate, 'yyyy-MM-dd', { locale: fr }),
      departureTime: route.departureTime,
      passengers: 1, 
      companyName: station.companyName
    };

    const queryParams = new URLSearchParams(searchParams).toString();
    navigate(`/routes?${queryParams}`); }

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return `${price.toLocaleString('fr-FR')} F CFA`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85805] mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Chargement des détails de la station...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Button>
          
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <div className="text-red-500 mb-4">
              <BusFront className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Station non trouvée
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleGoBack} variant="outline">
                Retour
              </Button>
              <Button 
                onClick={() => navigate('/stations')} 
                className="bg-[#e85805] hover:bg-[#F46A21]"
              >
                Voir toutes les stations
              </Button>
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
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux stations</span>
        </Button>

        {/* En-tête de la station */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-[#e85805] to-[#f46a21] p-3 rounded-xl shadow-lg">
                <BusFront className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {station.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {station.companyName || companyNameFromState}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-[#e85805]/10 text-[#e85805]">
                    <RouteIcon className="w-3 h-3" />
                    <span>{station.routeCount || 0} route{(station.routeCount || 0) !== 1 ? 's' : ''}</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-blue-50 text-blue-600">
                    <MapPin className="w-3 h-3" />
                    <span>{station.servedCities?.length || 0} ville{(station.servedCities?.length || 0) !== 1 ? 's' : ''}</span>
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">(4.8)</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Station certifiée</p>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {[
                { id: 'info', label: 'Informations', icon: Info }, 
                { id: 'routes', label: 'Routes disponibles', icon: RouteIcon },
                { id: 'location', label: 'Localisation', icon: Navigation },
                { id: 'services', label: 'Services', icon: Coffee }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === id
                      ? 'border-[#e85805] text-[#e85805]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Onglet Informations */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 dark:text-white">À propos de cette station</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {station.description || 'Station de transport moderne offrant des services de qualité pour tous vos déplacements.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-50">
                        <Phone className="w-5 h-5 mr-2 text-[#e85805]" />
                        Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {station.phone || 'Non spécifié'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {station.email || 'Non spécifié'}
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {station.address || 'Adresse non spécifiée'}
                        </span>
                      </div>
                      {station.website && (
                        <div className="flex items-center space-x-3">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a 
                            href={station.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#e85805] hover:underline"
                          >
                            Site web
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-50">
                        <MapPin className="w-5 h-5 mr-2 text-[#e85805]" />
                        Villes desservies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {station.servedCities && station.servedCities.length > 0 ? (
                          station.servedCities.map((city, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-600">
                              {city}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Aucune ville spécifiée
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {station.priceRange && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-[#e85805]" />
                        Gamme de prix
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatPrice(station.priceRange.min)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Prix minimum</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-[#e85805]">
                            {formatPrice(station.priceRange.average)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Prix moyen</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatPrice(station.priceRange.max)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Prix maximum</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Onglet Routes */}
            {activeTab === 'routes' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold dark:text-white">Routes disponibles</h3>
                {station.routes && station.routes.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {station.routes.map((route) => (
                      <Card key={route._id} className="hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg flex items-center dark:text-white">
                                <span className="text-[#e85805]">{route.from}</span>
                                <RouteIcon className="w-4 h-4 mx-2 text-gray-400" />
                                <span className="text-[#e85805]">{route.to}</span>
                              </h4>
                              <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{formatTime(route.departureTime)} - {formatTime(route.arrivalTime)}</span>
                              </div>
                              {route.duration && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Durée: {route.duration}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-[#e85805] text-xl">
                                {formatPrice(route.price)}
                              </p>
                              <div className="flex items-center justify-end text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <Users className="w-3 h-3 mr-1" />
                                {route.availableSeats || 0} places
                              </div>
                            </div>
                          </div>

                          {/* Informations sur le bus */}
                          {route.bus && (
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {route.bus.name}
                                  </p>
                                  {route.bus.type && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      Type: {route.bus.type}
                                    </p>
                                  )}
                                </div>
                                {route.bus.capacity && (
                                  <Badge variant="outline" className="text-xs">
                                    {route.bus.capacity} places
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Arrêts */}
                          {route.stops && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Arrêts:
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {route.stops}
                              </p>
                            </div>
                          )}

                          {/* Équipements */}
                          {route.amenities && route.amenities.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Équipements:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {route.amenities.slice(0, 3).map((amenity, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {route.amenities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{route.amenities.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <Button 
                            onClick={() => handleBookRoute(route)}
                            className="w-full bg-[#e85805] hover:bg-[#F46A21] transition-colors"
                          >
                            Réserver ce Trajet
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BusFront className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Aucune route disponible
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Cette station ne propose pas de routes pour le moment.
                    </p>
                    <Button 
                      onClick={() => navigate('/search')}
                      className="bg-[#e85805] hover:bg-[#F46A21]"
                    >
                      Rechercher d'autres routes
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Localisation */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold dark:text-white">Localisation</h3>
                
                {/* Carte placeholder */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Carte interactive
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Coordonnées: {station.coordinates?.latitude || 'N/A'}, {station.coordinates?.longitude || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {station.address || 'Adresse non spécifiée'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-[#e85805]" />
                        Adresse complète
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        {station.address || 'Adresse non spécifiée'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Navigation className="w-5 h-5 mr-2 text-[#e85805]" />
                        Comment s'y rendre
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        Accessible en taxi, bus urbain ou véhicule personnel. 
                        Parking disponible sur place.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Onglet Services */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold dark:text-white">Services et équipements</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-[#e85805]" />
                        Services inclus
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {station.services && station.services.length > 0 ? (
                        station.services.map((service, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-[#e85805] rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300">{service}</span>
                          </div>
                        ))
                      ) : (
                        ['Transport de passagers', 'Bagages inclus', 'Service clientèle', 'Assistance aux voyageurs'].map((service, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-[#e85805] rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300">{service}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Coffee className="w-5 h-5 mr-2 text-[#e85805]" />
                        Équipements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {station.amenities && station.amenities.length > 0 ? (
                        station.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-[#e85805] rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                          </div>
                        ))
                      ) : (
                        ['Sièges confortables', 'Climatisation', 'Éclairage LED', 'Espace bagages'].map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-[#e85805] rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Wifi, label: 'WiFi gratuit', available: true },
                    { icon: Coffee, label: 'Cafétéria', available: true },
                    { icon: AirVent, label: 'Climatisation', available: true },
                    { icon: Shield, label: 'Sécurité 24h/24', available: true }
                  ].map(({ icon: Icon, label, available }, index) => (
                    <div key={index} className={`p-4 rounded-lg text-center transition-colors ${
                      available 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${
                        available 
                          ? 'text-[#e85805]' 
                          : 'text-gray-400'
                      }`} />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-50">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate('/search')}
                className="bg-[#e85805] hover:bg-[#F46A21]"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Rechercher un voyage
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(`tel:${station.phone}`, '_self')}
                disabled={!station.phone}
                className="bg-blue-50 text-blue-600"
              >
                <Phone className="w-4 h-4 mr-2" />
                Appeler la station
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(`mailto:${station.email}`, '_self')}
                disabled={!station.email}
                className="bg-blue-50 text-blue-600"
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer un email
              </Button>
              {station.website && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(station.website, '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Visiter le site web
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StationDetailPage;