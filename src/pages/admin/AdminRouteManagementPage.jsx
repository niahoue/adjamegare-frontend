// src/pages/admin/AdminRouteManagementPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PlusCircle, Search, Edit, Trash2, Route, MapPin, Clock, DollarSign, Bus, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import  api  from '../../services/apiService'; 
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';

const AdminRouteManagementPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [originalRoutes, setOriginalRoutes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  // Nouvel état pour les listes déroulantes
  const [buses, setBuses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [cities, setCities] = useState([]);

  // États pour le formulaire
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    stops: '',
    price: '',
    availableSeats: '',
    amenities: '',
    features: '',
    companyName: '', // ID de la compagnie
    bus: '',         // ID du bus
    popular: false,
  });

  // Fonction pour récupérer toutes les routes
  const fetchRoutes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.admin.getAllRoutes();
      if (res.data.success) {
        setRoutes(res.data.data);
        setOriginalRoutes(res.data.data);
        setFilteredRoutes(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(t('error_fetching_routes') || 'Erreur lors du chargement des routes');
      toast({
        title: t('error') || 'Erreur',
        description: err.response?.data?.message || t('error_fetching_routes_detail') || 'Impossible de charger les routes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  // Fonction pour récupérer tous les bus
  const fetchBuses = useCallback(async () => {
    try {
      const res = await api.admin.getAllBuses();
      if (res.data.success) {
        setBuses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching buses:', err);
      toast({
        title: t('error') || 'Erreur',
        description: err.response?.data?.message || t('error_fetching_buses') || 'Erreur lors du chargement des bus',
        variant: 'destructive',
      });
    }
  }, [t, toast]);

  // Fonction pour récupérer toutes les compagnies
  const fetchCompanies = useCallback(async () => {
    try {
      const res = await api.admin.getCompaniesAdmin(); // Utiliser la fonction admin spécifique
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      toast({
        title: t('error') || 'Erreur',
        description: err.response?.data?.message || t('error_fetching_companies') || 'Erreur lors du chargement des compagnies',
        variant: 'destructive',
      });
    }
  }, [t, toast]);

  // Fonction pour récupérer toutes les villes
  const fetchCities = useCallback(async () => {
    try {
      const res = await api.admin.getCitiesAdmin(); // Utiliser la fonction admin spécifique
      if (res.data.success) {
        setCities(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      toast({
        title: t('error') || 'Erreur',
        description: err.response?.data?.message || t('error_fetching_cities') || 'Erreur lors du chargement des villes',
        variant: 'destructive',
      });
    }
  }, [t, toast]);

  useEffect(() => {
    fetchRoutes();
    fetchBuses();
    fetchCompanies();
    fetchCities();
  }, [fetchRoutes, fetchBuses, fetchCompanies, fetchCities]);

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredRoutes(originalRoutes);
      return;
    }
    const filtered = originalRoutes.filter(route =>
      (route.from && typeof route.from === 'object' ? route.from.name : route.from)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.to && typeof route.to === 'object' ? route.to.name : route.to)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.companyName && typeof route.companyName === 'object' ? route.companyName.name : route.companyName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.bus && typeof route.bus === 'object' ? route.bus.name : route.bus)?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoutes(filtered);
    setCurrentPage(1); // Revenir à la première page lors d'une nouvelle recherche
  }, [searchTerm, originalRoutes]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, originalRoutes, handleSearch]);

  useEffect(() => {
    // Initialiser filteredRoutes quand originalRoutes change
    setFilteredRoutes(originalRoutes);
  }, [originalRoutes]);

  // Logique de pagination
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoutes = filteredRoutes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [id]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddRoute = () => {
    setIsEditing(false);
    setCurrentRoute(null);
    setFormData({
      from: '', 
      to: '', 
      departureDate: '', 
      departureTime: '', 
      arrivalTime: '',
      duration: '', 
      stops: '', 
      price: '', 
      availableSeats: '',
      amenities: '', 
      features: '', 
      companyName: '', 
      bus: '',
      popular: false,
    });
    setIsModalOpen(true);
  };

  const handleEditRoute = (route) => {
    setIsEditing(true);
    setCurrentRoute(route);
    setFormData({
      from: route.from?._id || '', // Utiliser l'ID de la ville
      to: route.to?._id || '',     // Utiliser l'ID de la ville
      departureDate: route.departureDate ? format(parseISO(route.departureDate), 'yyyy-MM-dd') : '',
      departureTime: route.departureTime || '',
      arrivalTime: route.arrivalTime || '',
      duration: route.duration || '',
      stops: Array.isArray(route.stops) ? route.stops.join(', ') : (route.stops || ''),
      price: route.price || '',
      availableSeats: route.availableSeats || '',
      amenities: Array.isArray(route.amenities) ? route.amenities.join(', ') : (route.amenities || ''),
      features: Array.isArray(route.features) ? route.features.join(', ') : (route.features || ''),
      companyName: route.companyName?._id || '', // Utiliser l'ID de la compagnie
      bus: route.bus?._id || '', // Utiliser l'ID du bus
      popular: route.popular || false,
    });
    setIsModalOpen(true);
  };

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm(t('confirm_delete_route') || 'Êtes-vous sûr de vouloir supprimer cette route ?')) {
      try {
        await api.admin.deleteRoute(routeId);
        toast({
          title: t('success') || 'Succès',
          description: t('route_deleted_success') || 'Route supprimée avec succès',
        });
        fetchRoutes();
      } catch (err) {
        console.error('Error deleting route:', err);
        toast({
          title: t('error') || 'Erreur',
          description: err.response?.data?.message || t('error_deleting_route') || 'Erreur lors de la suppression',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs requis
    const requiredFields = ['from', 'to', 'departureDate', 'departureTime', 'arrivalTime', 'duration', 'price', 'availableSeats', 'companyName', 'bus'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: t('error') || 'Erreur',
        description: `Veuillez remplir tous les champs obligatoires: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    const dataToSend = {
      ...formData,
      stops: formData.stops ? formData.stops.split(',').map(s => s.trim()).filter(s => s) : [],
      amenities: formData.amenities ? formData.amenities.split(',').map(s => s.trim()).filter(s => s) : [],
      features: formData.features ? formData.features.split(',').map(s => s.trim()).filter(s => s) : [],
      price: Number(formData.price),
      availableSeats: Number(formData.availableSeats),
    };

    try {
      if (isEditing) {
        await api.admin.updateRoute(currentRoute._id, dataToSend);
        toast({
          title: t('success') || 'Succès',
          description: t('route_updated_success') || 'Route mise à jour avec succès',
        });
      } else {
        await api.admin.createRoute(dataToSend);
        toast({
          title: t('success') || 'Succès',
          description: t('route_added_success') || 'Route ajoutée avec succès',
        });
      }
      setIsModalOpen(false);
      fetchRoutes();
    } catch (err) {
      console.error('Error saving route:', err);
      toast({
        title: t('error') || 'Erreur',
        description: err.response?.data?.message || t('error_saving_route') || 'Erreur lors de la sauvegarde',
        variant: 'destructive',
      });
    }
  };

  // Fonctions d'aide pour afficher les noms peuplés
  const getCityName = (cityObject) => {
    return cityObject && typeof cityObject === 'object' ? cityObject.name : 'Ville inconnue';
  };

  const getCompanyName = (companyObject) => {
    return companyObject && typeof companyObject === 'object' ? companyObject.name : 'Compagnie inconnue';
  };

  const getBusName = (busObject) => {
    return busObject && typeof busObject === 'object' ? busObject.name : 'Bus inconnu';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700]"></div>
        <p className="ml-4 text-gray-700 font-medium">{t('loading_routes') || 'Chargement des routes...'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Route className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('route_management') || 'Gestion des routes'}
          </h1>
        </div>
        <Button 
          className="bg-[#e85805] hover:bg-[#F46A21] text-white font-medium" 
          onClick={handleAddRoute}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('add_route') || 'Ajouter une route'}
        </Button>
      </div>
      
      {/* Modal d'ajout/modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[900px] bg-white dark:bg-gray-300 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? (t('edit_route') || 'Modifier la route') : (t('add_route') || 'Ajouter une route')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {/* Ligne 1: De - À (Villes) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">{t('from') || 'De'} *</Label>
                <Select onValueChange={(value) => handleSelectChange('from', value)} value={formData.from}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_departure_city') || 'Sélectionner une ville de départ'} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city._id} value={city._id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">{t('to') || 'À'} *</Label>
                <Select onValueChange={(value) => handleSelectChange('to', value)} value={formData.to}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_arrival_city') || 'Sélectionner une ville d\'arrivée'} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city._id} value={city._id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Ligne 2: Date de départ - Heure de départ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate">{t('departure_date') || 'Date de départ'} *</Label>
                <Input 
                  type="date" 
                  id="departureDate" 
                  value={formData.departureDate} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">{t('departure_time') || 'Heure de départ'} *</Label>
                <Input 
                  type="time" 
                  id="departureTime" 
                  value={formData.departureTime} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            
            {/* Ligne 3: Heure d'arrivée - Durée */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arrivalTime">{t('arrival_time') || "Heure d'arrivée"} *</Label>
                <Input 
                  type="time" 
                  id="arrivalTime" 
                  value={formData.arrivalTime} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">{t('duration') || 'Durée'} *</Label>
                <Input 
                  id="duration" 
                  placeholder="ex: 4h30min" 
                  value={formData.duration} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            
            {/* Ligne 4: Prix - Places disponibles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t('price') || 'Prix'} (F CFA) *</Label>
                <Input 
                  type="number" 
                  id="price" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                  required 
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableSeats">{t('available_seats') || 'Places disponibles'} *</Label>
                <Input 
                  type="number" 
                  id="availableSeats" 
                  value={formData.availableSeats} 
                  onChange={handleInputChange} 
                  required 
                  min="0"
                />
              </div>
            </div>
            
            {/* Ligne 5: Compagnie - Bus */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">{t('company') || 'Compagnie'} *</Label>
                <Select onValueChange={(value) => handleSelectChange('companyName', value)} value={formData.companyName}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_a_company') || 'Sélectionner une compagnie'} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company._id} value={company._id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bus">{t('associated_bus') || 'Bus associé'} *</Label>
                <Select onValueChange={(value) => handleSelectChange('bus', value)} value={formData.bus}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_a_bus') || 'Sélectionner un bus'} />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map(bus => (
                      <SelectItem key={bus._id} value={bus._id}>
                        {bus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Ligne 6: Arrêts */}
            <div className="space-y-2">
              <Label htmlFor="stops">{t('stops') || 'Arrêts'} (séparer par des virgules)</Label>
              <Textarea 
                id="stops" 
                value={formData.stops} 
                onChange={handleInputChange} 
                placeholder="ex: Gare routière, Centre-ville, Aéroport"
                rows={2}
              />
            </div>
            
            {/* Ligne 7: Commodités - Fonctionnalités */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amenities">{t('amenities') || 'Commodités'} (séparer par des virgules)</Label>
                <Textarea 
                  id="amenities" 
                  value={formData.amenities} 
                  onChange={handleInputChange} 
                  placeholder="ex: WiFi, Climatisation, Toilettes"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">{t('features') || 'Fonctionnalités'} (séparer par des virgules)</Label>
                <Textarea 
                  id="features" 
                  value={formData.features} 
                  onChange={handleInputChange} 
                  placeholder="ex: Écran TV, Prises électriques, Siège inclinable"
                  rows={2}
                />
              </div>
            </div>
            
            {/* Ligne 8: Route populaire */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="popular" 
                checked={formData.popular}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, popular: checked }))}
              />
              <Label htmlFor="popular">{t('popular_route') || 'Route populaire'}</Label>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button type="submit" className="bg-[#e85805] hover:bg-[#F46A21] text-white">
                {isEditing ? (t('save_changes') || 'Enregistrer les modifications') : (t('add_route') || 'Ajouter la route')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">{t('error') || 'Erreur'}!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('list_of_routes') || 'Liste des routes'}
          </CardTitle>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder={t('search_routes') || 'Rechercher des routes...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
              <Button 
                onClick={handleSearch} 
                className="bg-[#73D700] hover:bg-[#5CB800] text-white font-medium"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {filteredRoutes.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: {filteredRoutes.length} routes
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="bg-white dark:bg-gray-800 p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('from') || 'De'}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('to') || 'À'}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('departure_date') || 'Date'}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('departure_time') || 'Heure'}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('company') || 'Compagnie'}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('bus') || 'Bus'}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('price') || 'Prix'}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('available_seats') || 'Places'}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">Status</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white font-semibold">{t('actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRoutes.length > 0 ? (
                  currentRoutes.map((route) => (
                    <TableRow 
                      key={route._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 bg-white dark:bg-gray-800"
                    >
                      <TableCell className="text-gray-900 dark:text-white font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                          {getCityName(route.from)}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-600 dark:text-red-400" />
                          {getCityName(route.to)}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          {format(parseISO(route.departureDate), 'PPP', { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-mono">{route.departureTime}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 font-medium">
                          <Bus className="h-3 w-3 mr-1" />
                          {getCompanyName(route.companyName)}
                        </span>
                      </TableCell>
                       <TableCell className="text-gray-700 dark:text-gray-300">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400 font-medium">
                          <Bus className="h-3 w-3 mr-1" />
                          {getBusName(route.bus)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white font-semibold">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          {route.price?.toLocaleString('fr-FR')} F CFA
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          route.availableSeats > 10 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : route.availableSeats > 5 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {route.availableSeats} places
                        </span>
                      </TableCell>
                      <TableCell>
                        {route.popular && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            <Star className="h-3 w-3 mr-1" />
                            Populaire
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditRoute(route)}
                            className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteRoute(route._id)}
                            className="hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <Route className="h-12 w-12 opacity-50" />
                        <div>
                          <p className="font-medium">{t('no_routes_found') || 'Aucune route trouvée'}</p>
                          {searchTerm && (
                            <p className="text-sm mt-1">
                              Essayez de modifier votre recherche ou 
                              <button 
                              aria-label="Clear search"
                                onClick={() => setSearchTerm('')}
                                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                              >
                                afficher toutes les routes
                              </button>
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredRoutes.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span>
                  Affichage {startIndex + 1} à {Math.min(endIndex, filteredRoutes.length)} sur {filteredRoutes.length} routes
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-10 h-10 ${
                          currentPage === pageNumber 
                            ? "bg-[#e85805] hover:bg-[#F46A21] text-white" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRouteManagementPage;