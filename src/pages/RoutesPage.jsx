import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowRight, BusFront, Clock, DollarSign, Filter, Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/apiService';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext'; 

const RoutesPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate(); 
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // États pour les filtres
  const [filters, setFilters] = useState({
    departureTime: '',
    date: '',
    company: '',
    destination: '',
    origin: ''
  });

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fonction helper pour afficher les valeurs en toute sécurité
  const getDisplayValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return value.name || value._id || 'N/A';
    }
    return value || 'N/A';
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return 'N/A';
    }
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await api.travel.getAllRoutes();
        if (response.data.success) {
          setRoutes(response.data.data);
        } else {
          setError(response.data.message || 'Impossible de récupérer les routes.');
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des routes:", err);
        setError(err.response?.data?.message || 'Erreur serveur.');
        toast({
          title: "Erreur",
          description: "Échec de la récupération des routes. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutes();
  }, [toast]);

  // Extraction des valeurs uniques pour les filtres
  const uniqueCompanies = useMemo(() => {
    const companies = routes.map(route => getDisplayValue(route.companyName));
    return [...new Set(companies)].filter(company => company !== 'N/A');
  }, [routes]);

  const uniqueDestinations = useMemo(() => {
    const destinations = routes.map(route => getDisplayValue(route.to));
    return [...new Set(destinations)].filter(dest => dest !== 'N/A');
  }, [routes]);

  const uniqueOrigins = useMemo(() => {
    const origins = routes.map(route => getDisplayValue(route.from));
    return [...new Set(origins)].filter(origin => origin !== 'N/A');
  }, [routes]);

  // Logique de filtrage
  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      // Filtre par heure de départ
      if (filters.departureTime && route.departureTime) {
        const routeTime = route.departureTime.split(':');
        const filterTime = filters.departureTime.split(':');
        if (routeTime.length >= 2 && filterTime.length >= 2) {
          const routeMinutes = parseInt(routeTime[0]) * 60 + parseInt(routeTime[1]);
          const filterMinutes = parseInt(filterTime[0]) * 60 + parseInt(filterTime[1]);
          if (Math.abs(routeMinutes - filterMinutes) > 60) return false; // ±1 heure de tolérance
        }
      }

      // Filtre par date
      if (filters.date && route.departureDate) {
        const routeDate = new Date(route.departureDate).toISOString().split('T')[0];
        if (routeDate !== filters.date) return false;
      }

      // Filtre par compagnie
      if (filters.company && getDisplayValue(route.companyName).toLowerCase() !== filters.company.toLowerCase()) {
        return false;
      }

      // Filtre par destination
      if (filters.destination && getDisplayValue(route.to).toLowerCase() !== filters.destination.toLowerCase()) {
        return false;
      }

      // Filtre par origine
      if (filters.origin && getDisplayValue(route.from).toLowerCase() !== filters.origin.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [routes, filters]);

  // Logique de pagination
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const paginatedRoutes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRoutes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRoutes, currentPage]);

  // Réinitialiser la page lors du changement de filtres
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      departureTime: '',
      date: '',
      company: '',
      destination: '',
      origin: ''
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll vers le haut lors du changement de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction de gestion du clic sur le bouton
  const handleSearchTicket = (route) => {
    if (isAuthenticated) {
      navigate(`/select-seat`, {
        state: {
          selectedRouteId: route._id, 
          isReturnRoute: false, 
          searchParams: {
            tripType: 'oneWay', 
            from: route.from,
            to: route.to,
            departureDate: route.departureDate,
            departureTime: route.departureTime,
            companyName: route.companyName,
            price: route.price
          }
        }
      });
    } else {
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement des trajets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header />
        <div className="container mx-auto p-4 text-center">
          <p className="text-xl font-semibold mb-4">
            Erreur lors du chargement: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Trajets Disponibles</h1>
        
        {/* Section des filtres */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtres
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              {showFilters ? 'Masquer' : 'Afficher'} les filtres
            </Button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 ${showFilters || 'hidden lg:grid'}`}>
            {/* Filtre par origine */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Origine</label>
              <Select onValueChange={(value) => handleFilterChange('origin', value)} value={filters.origin}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une origine" />
                </SelectTrigger>
                <SelectContent className="bg-white ">
                  <SelectItem value="all">Toutes les origines</SelectItem>
                  {uniqueOrigins.map(origin => (
                    <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par destination */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <Select onValueChange={(value) => handleFilterChange('destination', value)} value={filters.destination}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une destination" />
                </SelectTrigger>
                <SelectContent className="bg-white ">
                  <SelectItem value="all">Toutes les destinations</SelectItem>
                  {uniqueDestinations.map(dest => (
                    <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par compagnie */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Compagnie</label>
              <Select onValueChange={(value) => handleFilterChange('company', value)} value={filters.company}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une compagnie" />
                </SelectTrigger>
                <SelectContent className="bg-white ">
                  <SelectItem value="all">Toutes les compagnies</SelectItem>
                  {uniqueCompanies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de départ</label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filtre par heure */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Heure de départ</label>
              <Input
                type="time"
                value={filters.departureTime}
                onChange={(e) => handleFilterChange('departureTime', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className={`flex justify-between items-center mt-4 ${showFilters || 'hidden lg:flex'}`}>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="text-sm"
            >
              Effacer les filtres
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredRoutes.length} trajet{filteredRoutes.length !== 1 ? 's' : ''} trouvé{filteredRoutes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Grille des trajets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {paginatedRoutes.length > 0 ? (
            paginatedRoutes.map(route => (
              <Card key={route._id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <div className="flex items-center text-sm">
                      <span className="truncate">{getDisplayValue(route.from)}</span>
                      <ArrowRight className="w-4 h-4 mx-2 flex-shrink-0" />
                      <span className="truncate">{getDisplayValue(route.to)}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
                    <BusFront className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{getDisplayValue(route.companyName)}</span>
                  </p>
                  
                  {/* Date du voyage */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{formatDate(route.departureDate)}</span>
                  </p>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    {t('duration')}: {route.duration || 'N/A'}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-bold text-lg flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                    {route.price || 'N/A'} F CFA
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    Départ: {route.departureTime || 'N/A'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    Arrivée: {route.arrivalTime || 'N/A'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
                    <Search className="w-4 h-4 mr-2 flex-shrink-0" />
                    Places: {route.availableSeats || 'N/A'}
                  </p>
                  <div className="pt-4">
                    <Button
                      onClick={() => handleSearchTicket(route)}
                      className="w-full bg-[#73D700] hover:bg-[#5CB800] text-sm"
                    >
                      {t('search_ticket')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                Aucun trajet trouvé avec les filtres sélectionnés.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Effacer les filtres
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>

              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === currentPage;
                  const showPage = 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  if (!showPage && page === 2 && currentPage > 4) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  if (!showPage && page === totalPages - 1 && currentPage < totalPages - 3) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  if (!showPage) {
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={isCurrentPage ? "bg-[#73D700] hover:bg-[#5CB800]" : ""}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} sur {totalPages} ({filteredRoutes.length} trajets au total)
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoutesPage;