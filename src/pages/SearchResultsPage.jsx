import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Wifi,
  Power,
  Users,
  CalendarDays,
  Building,
  ArrowLeftRight,
  Filter,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Header from '../components/Header';
import api from '../services/apiService';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { cn } from '../lib/utils';
import { useAuth } from "../context/AuthContext";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  // Paramètres de recherche originaux
  const [originalSearchParams, setOriginalSearchParams] = useState(null);
  
  // États pour les filtres
  const [showFilters, setShowFilters] = useState(false);
  const [filterDepartureTime, setFilterDepartureTime] = useState('all');
  const [filterCompanyName, setFilterCompanyName] = useState('all');
  const [filterPriceRange, setFilterPriceRange] = useState('all');
  const [filterAmenities, setFilterAmenities] = useState('all');
  const [filterFromCity, setFilterFromCity] = useState('all');
  const [filterToCity, setFilterToCity] = useState('all');
  const [filterDate, setFilterDate] = useState(null);

  const [searchResults, setSearchResults] = useState({ outbound: [], return: [] });
  const [filteredResults, setFilteredResults] = useState({ outbound: [], return: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les listes déroulantes de filtres
  const [companies, setCompanies] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  // Charger les compagnies et villes pour les filtres
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setIsLoadingCompanies(true);
        
        // Charger les compagnies
        const companiesResponse = await api.travel.getCompanies();
        if (companiesResponse.data.success && companiesResponse.data.data) {
          const companyNames = companiesResponse.data.data.map(c => 
            typeof c === 'string' ? c : c.name || c
          );
          setCompanies(companyNames);
        }

        // Charger les villes
        const citiesResponse = await api.travel.getAllCities();
        if (citiesResponse.data.success && citiesResponse.data.data) {
          setCities(citiesResponse.data.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de filtrage:', error);
        setCompanies(['SOTRA', 'UTB', 'CTA', 'TCV']);
        setCities(['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Daloa']);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    loadFilterData();
  }, []);

  const fetchRoutes = useCallback(async (params) => {
    setIsLoading(true);
    setError(null);
    try {
    
      
      // Construire les paramètres de recherche correctement
      const searchParams = {
        from: params.from,
        to: params.to,
        departureDate: params.departureDate,
        passengers: params.passengers || 1
      };

      // Ajouter les paramètres optionnels seulement s'ils existent
      if (params.departureTime && params.departureTime !== 'all') {
        searchParams.departureTime = params.departureTime;
      }
      if (params.companyName && params.companyName !== 'all') {
        searchParams.companyName = params.companyName;
      }
      if (params.returnDate) {
        searchParams.returnDate = params.returnDate;
      }

      const res = await api.travel.searchRoutes(searchParams);
      
      
      if (res.data.success) {
        const results = res.data.data || { outbound: [], return: [] };
        
        // Filtrer les routes passées
        const now = new Date();
        const today = startOfDay(now);
        
        const filterPastRoutes = (routes) => {
          return routes.filter(route => {
            try {
              const routeDate = parseISO(route.departureDate);
              const routeDateTime = new Date(routeDate);
              
              // Ajouter l'heure de départ à la date
              if (route.departureTime) {
                const [hours, minutes] = route.departureTime.split(':').map(Number);
                routeDateTime.setHours(hours, minutes, 0, 0);
              }
              
              // Garder seulement les routes futures ou d'aujourd'hui avec une heure future
              if (isAfter(routeDate, today)) {
                return true; // Routes futures
              } else if (routeDate.toDateString() === now.toDateString()) {
                return isAfter(routeDateTime, now); // Routes d'aujourd'hui mais avec heure future
              }
              return false;
            } catch (error) {
              console.error('Erreur lors du parsing de la date:', error);
              return true; // Garder la route en cas d'erreur
            }
          });
        };

        const filteredResults = {
          outbound: filterPastRoutes(results.outbound || []),
          return: filterPastRoutes(results.return || [])
        };

        setSearchResults(filteredResults);
        setFilteredResults(filteredResults);
      } else {
        const errorMsg = res.data.message || t('search_error_generic') || 'Erreur de recherche';
        setError(errorMsg);
        toast({
          title: t('search_error') || 'Erreur de recherche',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des routes:', err);
      const errorMsg = err.response?.data?.message || err.message || t('search_error_server') || 'Erreur serveur';
      setError(errorMsg);
      toast({
        title: t('search_error') || 'Erreur de recherche',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  // Tri par date et heure de départ
  const sortRoutesByDateTime = useCallback((routes) => {
    return [...routes].sort((a, b) => {
      const dateA = new Date(a.departureDate);
      const dateB = new Date(b.departureDate);
      
      // Comparer d'abord par date
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // Si même date, comparer par heure
      const timeA = a.departureTime || '00:00';
      const timeB = b.departureTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  }, []);

  // Application des filtres améliorée
  useEffect(() => {
    const applyFilters = () => {
      const filterRoutes = (routes) => {
        return routes.filter(route => {
          // Filtre par ville de départ
          if (filterFromCity !== 'all') {
            const fromCity = typeof route.from === 'string' ? route.from : route.from?.name || '';
            if (!fromCity.toLowerCase().includes(filterFromCity.toLowerCase())) {
              return false;
            }
          }

          // Filtre par ville d'arrivée
          if (filterToCity !== 'all') {
            const toCity = typeof route.to === 'string' ? route.to : route.to?.name || '';
            if (!toCity.toLowerCase().includes(filterToCity.toLowerCase())) {
              return false;
            }
          }

          // Filtre par date spécifique
          if (filterDate) {
            const routeDate = new Date(route.departureDate);
            const selectedDate = new Date(filterDate);
            if (routeDate.toDateString() !== selectedDate.toDateString()) {
              return false;
            }
          }

          // Filtre par heure de départ
          if (filterDepartureTime !== 'all') {
            const routeHour = parseInt(route.departureTime?.split(':')[0] || '0');
            let timeRange;
            
            switch (filterDepartureTime) {
              case 'morning': timeRange = routeHour >= 6 && routeHour < 12; break;
              case 'afternoon': timeRange = routeHour >= 12 && routeHour < 18; break;
              case 'evening': timeRange = routeHour >= 18 && routeHour < 24; break;
              case 'night': timeRange = routeHour >= 0 && routeHour < 6; break;
              default: timeRange = true;
            }
            if (!timeRange) return false;
          }

          // Filtre par compagnie
          if (filterCompanyName !== 'all') {
            const routeCompany = typeof route.companyName === 'string' 
              ? route.companyName 
              : route.companyName?.name || '';
            if (!routeCompany.toLowerCase().includes(filterCompanyName.toLowerCase())) {
              return false;
            }
          }

          // Filtre par prix
          if (filterPriceRange !== 'all') {
            const price = route.price || 0;
            switch (filterPriceRange) {
              case 'low': if (price > 15000) return false; break;
              case 'medium': if (price <= 15000 || price > 30000) return false; break;
              case 'high': if (price <= 30000) return false; break;
            }
          }

          // Filtre par commodités
          if (filterAmenities !== 'all') {
            const amenities = route.amenities || [];
            switch (filterAmenities) {
              case 'wifi': if (!amenities.includes('wifi')) return false; break;
              case 'power': if (!amenities.includes('power')) return false; break;
              case 'ac': if (!amenities.includes('ac') && !amenities.includes('climatisation')) return false; break;
            }
          }

          return true;
        });
      };

      const filtered = {
        outbound: sortRoutesByDateTime(filterRoutes(searchResults.outbound || [])),
        return: sortRoutesByDateTime(filterRoutes(searchResults.return || []))
      };

      setFilteredResults(filtered);
    };

    applyFilters();
  }, [
    searchResults, 
    filterDepartureTime, 
    filterCompanyName, 
    filterPriceRange, 
    filterAmenities, 
    filterFromCity, 
    filterToCity, 
    filterDate, 
    sortRoutesByDateTime
  ]);

  // Initialisation des paramètres depuis l'état de navigation
  useEffect(() => {
    if (location.state) {
      const params = {
        from: location.state.from,
        to: location.state.to,
        departureDate: location.state.departureDate,
        passengers: parseInt(location.state.passengers?.split(' ')[0]) || 1,
        tripType: location.state.tripType || 'oneWay'
      };

      // Ajouter les paramètres optionnels seulement s'ils existent et ne sont pas 'all'
      if (location.state.departureTime && location.state.departureTime !== 'all' && location.state.departureTime !== '08:00') {
        params.departureTime = location.state.departureTime;
      }
      if (location.state.companyName && location.state.companyName !== 'all' && location.state.companyName !== '') {
        params.companyName = location.state.companyName;
      }
      if (location.state.tripType === 'roundTrip' && location.state.returnDate) {
        params.returnDate = location.state.returnDate;
      }
      
      setOriginalSearchParams(location.state);
      fetchRoutes(params);
    } else {

      const timer = setTimeout(() => {
        navigate('/', { replace: true });
        toast({
          title: t('no_search_params') || 'Paramètres manquants',
          description: t('redirecting_home') || 'Redirection vers la page d\'accueil',
          variant: 'destructive',
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, fetchRoutes, toast, t]);

  const handleBackToSearch = () => {
    navigate('/', { replace: true });
  };

  const handleSelectBus = (routeId, isReturnRoute = false) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          redirectTo: "/select-seat",
          bookingData: {
            selectedRouteId: routeId,
            isReturnRoute,
            searchParams: originalSearchParams,
          },
        },
      });
      return;
    }
    navigate("/select-seat", {
      state: {
        selectedRouteId: routeId,
        isReturnRoute,
        searchParams: originalSearchParams,
      },
    });
  };

  const clearFilters = () => {
    setFilterDepartureTime('all');
    setFilterCompanyName('all');
    setFilterPriceRange('all');
    setFilterAmenities('all');
    setFilterFromCity('all');
    setFilterToCity('all');
    setFilterDate(null);
  };

  const hasActiveFilters = useMemo(() => {
    return filterDepartureTime !== 'all' || 
           filterCompanyName !== 'all' || 
           filterPriceRange !== 'all' || 
           filterAmenities !== 'all' ||
           filterFromCity !== 'all' ||
           filterToCity !== 'all' ||
           filterDate !== null;
  }, [filterDepartureTime, filterCompanyName, filterPriceRange, filterAmenities, filterFromCity, filterToCity, filterDate]);

  // Grouper les routes par date
  const groupRoutesByDate = (routes) => {
    const grouped = {};
    routes.forEach(route => {
      const dateKey = format(parseISO(route.departureDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(route);
    });

    // Trier chaque groupe par heure de départ
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        const timeA = a.departureTime || '00:00';
        const timeB = b.departureTime || '00:00';
        return timeA.localeCompare(timeB);
      });
    });

    return grouped;
  };

  // Fonction pour rendre une carte de route
  const renderRouteCard = (route, isReturn = false) => {
    const fromCityName = typeof route.from === 'string' ? route.from : route.from?.name || 'Ville inconnue';
    const toCityName = typeof route.to === 'string' ? route.to : route.to?.name || 'Ville inconnue';
    const companyName = typeof route.companyName === 'string' ? route.companyName : route.companyName?.name || 'Compagnie inconnue';
    
    return (
      <Card key={route._id} className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Company Name */}
            <div className="space-y-1">
              <h3 className="font-bold text-xl text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-gray-700" />
                {companyName}
              </h3>
              <p className="text-sm text-gray-500">{t('bus_type') || 'Type de bus'}: {route.bus?.name || t('unknown') || 'Inconnu'}</p>
            </div>

            {/* Time and Route */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <span>{route.departureTime}</span>
                <span>→</span>
                <span>{route.arrivalTime}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 text-sm">
                <Clock className="w-4 h-4" />
                <span>{route.duration}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{fromCityName} → {toCityName}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 text-sm">
                <span>
                  {Array.isArray(route.stops) ? 
                    (route.stops.length === 0 ? (t('non_stop') || 'Sans arrêt') : `${route.stops.length} ${t('stops') || 'arrêts'}`) : 
                    (route.stops === '0' ? (t('non_stop') || 'Sans arrêt') : `${route.stops} ${t('stops') || 'arrêts'}`)
                  }
                </span>
              </div>
            </div>

            {/* Amenities & Seats */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-4">
                {route.amenities?.includes('wifi') && (
                  <div className="flex items-center space-x-1 text-[#73D700]">
                    <Wifi className="w-4 h-4" />
                    <span className="text-xs">Wi-Fi</span>
                  </div>
                )}
                {route.amenities?.includes('power') && (
                  <div className="flex items-center space-x-1 text-[#73D700]">
                    <Power className="w-4 h-4" />
                    <span className="text-xs">Prise</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-xs">{route.availableSeats} {t('seats_left') || 'places restantes'}</span>
              </div>
            </div>

            {/* Price and Features */}
            <div className="space-y-2 text-right">
              <div className="text-2xl font-bold text-gray-900">
                {route.price?.toLocaleString('fr-FR')} FCFA
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {route.features?.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => handleSelectBus(route._id, isReturn)}
                  className="bg-[#73D700] hover:bg-[#5CB800] text-white px-6 py-2 font-semibold"
                >
                  {t('select') || 'Sélectionner'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Fonction pour rendre les routes groupées par date
  const renderRoutesGroupedByDate = (routes, isReturn = false) => {
    if (!routes || routes.length === 0) {
      return null;
    }

    const groupedRoutes = groupRoutesByDate(routes);
    const sortedDates = Object.keys(groupedRoutes).sort();

    return sortedDates.map(dateKey => (
      <div key={dateKey} className="mb-8">
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {format(parseISO(dateKey), 'EEEE, dd MMMM yyyy', { locale: fr })}
          </h3>
          <span className="text-sm text-gray-600">
            {groupedRoutes[dateKey].length} {t('routes_found') || 'trajets trouvés'}
          </span>
        </div>
        <div className="space-y-4">
          {groupedRoutes[dateKey].map((route) => renderRouteCard(route, isReturn))}
        </div>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_buses') || 'Chargement des bus...'}</p>
        </div>
      </div>
    );
  }

  if (!originalSearchParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  if (error && filteredResults.outbound.length === 0 && filteredResults.return.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('error_occurred') || 'Une erreur est survenue'}</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button
            onClick={handleBackToSearch}
            variant="outline"
            className="border-[#73D700] text-[#73D700] hover:bg-[#73D700] hover:text-white"
          >
            {t('modify_search') || 'Modifier la recherche'}
          </Button>
        </div>
      </div>
    );
  }

  const { from, to, departureDate, returnDate, passengers, tripType } = originalSearchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Search Summary */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackToSearch}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('back_to_search') || 'Retour à la recherche'}</span>
              </Button>
              <div className="text-lg font-semibold text-gray-900">
                {from} → {to}
              </div>
              <div className="text-gray-600 flex items-center space-x-2">
                <CalendarDays className="w-4 h-4" />
                <span>{format(parseISO(departureDate), 'PPP', { locale: fr })}</span>
                {tripType === 'roundTrip' && returnDate && (
                  <>
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>{format(parseISO(returnDate), 'PPP', { locale: fr })}</span>
                  </>
                )}
                <Users className="w-4 h-4" />
                <span>{passengers}</span>
              </div>
            </div>

            {/* Filter Toggle Button */}
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Effacer
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center space-x-2",
                  hasActiveFilters && "border-[#73D700] text-[#73D700]"
                )}
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 bg-[#73D700] text-white">
                    Actifs
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filtres Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Ville de départ */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ville de départ</label>
                  <Select value={filterFromCity} onValueChange={setFilterFromCity}>
                    <SelectTrigger className="h-10 border-gray-300 focus:border-[#73D700]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ville d'arrivée */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ville d'arrivée</label>
                  <Select value={filterToCity} onValueChange={setFilterToCity}>
                    <SelectTrigger className="h-10 border-gray-300 focus:border-[#73D700]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date spécifique */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date spécifique</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-10 w-full justify-start text-left font-normal border-gray-300 focus:border-[#73D700]",
                          !filterDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterDate ? format(filterDate, "dd/MM/yyyy", { locale: fr }) : "Toutes les dates"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filterDate}
                        onSelect={setFilterDate}
                        initialFocus
                        locale={fr}
                        fromDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Heure de départ */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Heure de départ</label>
                  <Select value={filterDepartureTime} onValueChange={setFilterDepartureTime}>
                    <SelectTrigger className="h-10 border-gray-300 focus:border-[#73D700]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les heures</SelectItem>
                      <SelectItem value="morning">Matin (6h-12h)</SelectItem>
                      <SelectItem value="afternoon">Après-midi (12h-18h)</SelectItem>
                      <SelectItem value="evening">Soirée (18h-24h)</SelectItem>
                      <SelectItem value="night">Nuit (0h-6h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Compagnie */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Compagnie</label>
                  <Select 
                    value={filterCompanyName} 
                    onValueChange={setFilterCompanyName}
                    disabled={isLoadingCompanies}
                  >
                    <SelectTrigger className="h-10 border-gray-300 focus:border-[#73D700]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les compagnies</SelectItem>
                      {companies.map(company => (
                        <SelectItem key={company} value={company}>{company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gamme de prix */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Prix</label>
                  <Select value={filterPriceRange} onValueChange={setFilterPriceRange}>
                    <SelectTrigger className="h-10 border-gray-300 focus:border-[#73D700]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les prix</SelectItem>
                      <SelectItem value="low">Économique (≤ 15 000 FCFA)</SelectItem>
                      <SelectItem value="medium">Standard (15 001 - 30 000 FCFA)</SelectItem>
                      <SelectItem value="high">Premium (≥ 30 000 FCFA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Commodités */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Commodités</label>
                  <Select value={filterAmenities} onValueChange={setFilterAmenities}>
                    <SelectTrigger className="h-10 border-gray-300 focus:border-[#73D700]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="wifi">Wi-Fi</SelectItem>
                      <SelectItem value="power">Prises électriques</SelectItem>
                      <SelectItem value="ac">Climatisation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredResults.outbound.length > 0 && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {t('available_outbound_buses') || 'Bus disponibles - Aller'} 
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({filteredResults.outbound.length} {t('routes_found') || 'trajets trouvés'})
              </span>
            </h1>
            {renderRoutesGroupedByDate(filteredResults.outbound)}
          </div>
        )}

        {tripType === 'roundTrip' && filteredResults.return && filteredResults.return.length > 0 && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {t('available_return_buses') || 'Bus disponibles - Retour'}
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({filteredResults.return.length} {t('routes_found') || 'trajets trouvés'})
              </span>
            </h1>
            {renderRoutesGroupedByDate(filteredResults.return, true)}
          </div>
        )}

        {/* No results message */}
        {filteredResults.outbound.length === 0 && (!filteredResults.return || filteredResults.return.length === 0) && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4 text-lg">
              {hasActiveFilters 
                ? 'Aucun trajet ne correspond à vos critères de filtrage'
                : (t('no_routes_found') || 'Aucun trajet trouvé')
              }
            </div>
            <p className="text-gray-400 mb-6">
              {hasActiveFilters
                ? 'Essayez de modifier ou supprimer certains filtres.'
                : 'Essayez de modifier vos critères de recherche ou choisir d\'autres dates.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-[#73D700] text-[#73D700] hover:bg-[#73D700] hover:text-white"
                >
                  Supprimer les filtres
                </Button>
              )}
              <Button
                onClick={handleBackToSearch}
                variant="outline"
                className="border-[#73D700] text-[#73D700] hover:bg-[#73D700] hover:text-white"
              >
                {t('modify_search') || 'Modifier la recherche'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;