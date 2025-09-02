import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/apiService';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, TrendingUp, Calendar } from 'lucide-react';

const WhereToNextSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [destinations, setDestinations] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [todayRoutes, setTodayRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('suggested');

  const formatRouteData = (routes, extra = {}) => {
    return routes.map(route => ({
      _id: route._id,
      name: route.to?.name || 'Ville inconnue',
      route: `${route.from?.name || 'N/A'} - ${route.to?.name || 'N/A'}`,
      featured: false,
      from: route.from?._id || route.from,
      to: route.to?._id || route.to,
      departureTime: route.departureTime,
      arrivalTime: route.arrivalTime,
      price: route.price,
      availableSeats: route.availableSeats,
      companyName: route.companyName?.name || 'N/A',
      companyLogo: route.companyName?.logo || '',
      duration: route.duration,
      ...extra
    }));
  };

  const fetchTodayRoutes = useCallback(async () => {
    try {
      // Utiliser getAllRoutes au lieu de searchRoutes pour éviter l'erreur de paramètres manquants
      const res = await api.travel.getAllRoutes();
      
      if (res.data.success) {
        const today = new Date().toISOString().split('T')[0];
        // Filtrer les routes pour aujourd'hui côté client
        const todayFilteredRoutes = res.data.data.filter(route => {
          if (!route.departureDate) return false;
          const routeDate = new Date(route.departureDate).toISOString().split('T')[0];
          return routeDate === today;
        }).slice(0, 6);
        
        setTodayRoutes(formatRouteData(todayFilteredRoutes, { isToday: true }));
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des routes du jour:', err);
      setTodayRoutes([]);
    }
  }, []);

  const fetchPopularRoutes = useCallback(async () => {
    try {
      const res = await api.travel.getPopularRoutes();
      if (res.data.success) {
        const routes = res.data.data.slice(0, 6);
        setPopularRoutes(formatRouteData(routes, { isPopular: true }));
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des routes populaires:', err);
      setPopularRoutes([]);
    }
  }, []);

  const fetchSuggestedRoutes = useCallback(async () => {
    try {
      const res = await api.travel.getSuggestedRoutes();

      if (res.data.success) {
        const fetchedRoutes = res.data.data;
        const uniqueDestinations = [];

        fetchedRoutes.forEach(route => {
          if (!uniqueDestinations.find(d => d.to === (route.to?._id || route.to))) {
            uniqueDestinations.push({
              _id: route._id,
              name: route.to?.name || 'Ville inconnue',
              route: `${route.from?.name || 'N/A'} - ${route.to?.name || 'N/A'}`,
              featured: false,
              from: route.from?._id || route.from,
              to: route.to?._id || route.to,
              price: route.price,
              companyName: route.companyName?.name || 'N/A',
              companyLogo: route.companyName?.logo || ''
            });
          }
        });

        // Marquer quelques destinations comme "featured"
        if (uniqueDestinations.length > 0) uniqueDestinations[0].featured = true;
        if (uniqueDestinations.length > 2) uniqueDestinations[2].featured = true;

        setDestinations(uniqueDestinations);
      } else {
        setError(res.data.message || t('error_fetching_destinations'));
        toast({
          title: t('error'),
          description: res.data.message || t('error_fetching_destinations'),
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des destinations:', err);
      setError(err.message || t('error_fetching_destinations_server'));
      toast({
        title: t('error'),
        description: err.message || t('error_fetching_destinations_server'),
        variant: 'destructive',
      });
    }
  }, [toast, t]);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchSuggestedRoutes(),
        fetchPopularRoutes(),
        fetchTodayRoutes()
      ]);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSuggestedRoutes, fetchPopularRoutes, fetchTodayRoutes]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getCurrentRoutes = () => {
    switch (activeTab) {
      case 'popular':
        return popularRoutes;
      case 'today':
        return todayRoutes;
      default:
        return destinations;
    }
  };

  const handleRouteClick = (route) => {
    const today = new Date().toISOString().split('T')[0];
    navigate('/routes', { 
      state: { 
        from: route.from, 
        to: route.to, 
        departureDate: route.isToday ? today : new Date().toISOString(), 
        passengers: '1 Adult'
      } 
    });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_destinations')}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('error_occurred')}</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button
            onClick={fetchAllData}
            variant="outline"
            className="border-[#73D700] text-[#73D700] hover:bg-[#73D700] hover:text-white"
          >
            {t('retry')}
          </Button>
        </div>
      </section>
    );
  }

  const currentRoutes = getCurrentRoutes();

  return (
    <section className="py-16 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-20">
          <div className="w-full h-full bg-gradient-to-t from-blue-300 to-transparent rounded-tl-full"></div>
        </div>
        <div className="absolute top-10 right-20 w-32 h-32 bg-white/30 rounded-full blur-sm"></div>
        <div className="absolute top-32 right-40 w-20 h-20 bg-blue-200/50 rounded-full blur-sm"></div>
        <div className="absolute bottom-20 right-60 w-24 h-24 bg-indigo-200/40 rounded-full blur-sm"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('where_to_next')}
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t('discover_destinations_message')}
            </p>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
              <Button
                onClick={() => setActiveTab('suggested')}
                variant={activeTab === 'suggested' ? 'default' : 'outline'}
                className={`flex items-center space-x-2 ${
                  activeTab === 'suggested' 
                    ? 'bg-[#73D700] hover:bg-[#5CB800] text-white' 
                    : 'border-[#73D700] text-[#73D700] hover:bg-[#73D700] hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Suggérés</span>
              </Button>
              <Button
                onClick={() => setActiveTab('popular')}
                variant={activeTab === 'popular' ? 'default' : 'outline'}
                className={`flex items-center space-x-2 ${
                  activeTab === 'popular' 
                    ? 'bg-[#73D700] hover:bg-[#5CB800] text-white' 
                    : 'border-[#73D700] text-[#73D700] hover:bg-[#73D700] hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Populaires</span>
              </Button>
              <Button
                onClick={() => setActiveTab('today')}
                variant={activeTab === 'today' ? 'default' : 'outline'}
                className={`flex items-center space-x-2 ${
                  activeTab === 'today' 
                    ? 'bg-[#73D700] hover:bg-[#5CB800] text-white' 
                    : 'border-[#73D700] text-[#73D700] hover:bg-[#73D700] hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Aujourd'hui</span>
              </Button>
            </div>

            <Button
              asChild
              className="bg-[#73D700] hover:bg-[#5CB800] text-white px-8 py-3 text-lg font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Link to="/routes">
                {t('explore_destinations')}
              </Link>
            </Button>
          </div>

          {/* Route Cards */}
          <div className="relative">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentRoutes.length > 0 ? (
                currentRoutes.map((route, index) => (
                  <Card
                    key={route._id || index}
                    onClick={() => handleRouteClick(route)}
                    className={`
                      w-full bg-white rounded-lg shadow-md p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer border
                      ${route.featured || route.isPopular ? 'border-[#73D700] shadow-lg' : 'border-gray-200'}
                    `}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            route.featured || route.isPopular ? 'bg-[#73D700]' : 'bg-gray-400'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{route.name}</h4>
                            <p className="text-sm text-gray-600 truncate">{route.route}</p>
                            {route.price && (
                              <p className="text-sm font-medium text-[#73D700]">{route.price} F CFA</p>
                            )}
                            {route.departureTime && (
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-500">
                                  {route.departureTime}
                                  {route.arrivalTime && ` - ${route.arrivalTime}`}
                                </span>
                              </div>
                            )}
                            {route.companyName && route.companyName !== 'N/A' && (
                              <p className="text-xs text-gray-500 mt-1">{route.companyName}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-3">
                          {route.isPopular && (
                            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                              Populaire
                            </Badge>
                          )}
                          {route.featured && !route.isPopular && (
                            <Badge className="bg-[#73D700] hover:bg-[#5CB800] text-white text-xs">
                              {t('popular')}
                            </Badge>
                          )}
                          {route.isToday && (
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs">
                              Aujourd'hui
                            </Badge>
                          )}
                          {route.availableSeats && (
                            <span className="text-xs text-gray-500">
                              {route.availableSeats} places
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {activeTab === 'today' && 'Aucun trajet disponible aujourd\'hui'}
                    {activeTab === 'popular' && 'Aucun trajet populaire trouvé'}
                    {activeTab === 'suggested' && t('no_destinations_found')}
                  </p>
                </div>
              )}
            </div>

            {/* Decorative map elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#73D700] rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-12 -left-2 w-4 h-4 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-8 right-8 w-6 h-6 bg-indigo-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhereToNextSection;