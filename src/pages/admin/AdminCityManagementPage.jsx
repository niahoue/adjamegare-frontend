// src/pages/admin/AdminCityManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Search, Plus, Edit, Trash2, MapPin, Star, Globe, Map } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/apiService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';

const AdminCityManagementPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    country: '',
    isInternational: false,
    region: '',
    isFeatured: false,
    description: '',
    latitude: '',
    longitude: '',
    image: '',
  });

  // --- Fonctions de gestion de l'API ---
  const fetchCities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.admin.getCitiesAdmin();
      if (response.data?.success) {
        setCities(response.data.data);
      } else {
        setError(response.data?.message || 'Erreur lors de la récupération des villes.');
      }
    } catch (err) {
      console.error('Erreur de l\'API:', err);
      setError(t('error_fetching_cities') || 'Erreur lors du chargement des villes');
      toast({
        title: t('error') || 'Erreur',
        description: t('error_fetching_cities_detail') || 'Impossible de charger les villes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCity = async (cityData) => {
    setIsSubmitting(true);
    try {
      // Convertir les coordonnées en nombres si elles existent
      const processedData = {
        ...cityData,
        latitude: cityData.latitude ? parseFloat(cityData.latitude) : undefined,
        longitude: cityData.longitude ? parseFloat(cityData.longitude) : undefined,
      };

      const response = await api.admin.createCity(processedData);
      if (response.data?.success) {
        toast({ title: 'Succès', description: 'Ville ajoutée avec succès.' });
        fetchCities(); 
        setDialogOpen(false);
        resetForm();
      } else {
        toast({ title: 'Erreur', description: response.data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ 
        title: 'Erreur', 
        description: err.response?.data?.message || 'Échec de l\'ajout de la ville.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCity = async (id, cityData) => {
    setIsSubmitting(true);
    try {
      // Convertir les coordonnées en nombres si elles existent
      const processedData = {
        ...cityData,
        latitude: cityData.latitude ? parseFloat(cityData.latitude) : undefined,
        longitude: cityData.longitude ? parseFloat(cityData.longitude) : undefined,
      };

      const response = await api.admin.updateCity(id, processedData);
      if (response.data?.success) {
        toast({ title: 'Succès', description: 'Ville mise à jour avec succès.' });
        fetchCities();
        setDialogOpen(false);
        resetForm();
      } else {
        toast({ title: 'Erreur', description: response.data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ 
        title: 'Erreur', 
        description: err.response?.data?.message || 'Échec de la mise à jour de la ville.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

const deleteCity = async (id) => {
  try {
    const response = await api.admin.deleteCity(id);
    if (response.data?.success) {
      toast({ title: 'Succès', description: 'Ville supprimée avec succès.' });
      fetchCities();
    } else {
      toast({ title: 'Erreur', description: response.data.message, variant: 'destructive' });
    }
  } catch (err) {
    toast({ 
      title: 'Erreur', 
      description: err.response?.data?.message || 'Échec de la suppression de la ville.', 
      variant: 'destructive' 
    });
  }
};

  useEffect(() => {
    fetchCities();
  }, []);

  // --- Fonctions de gestion de l'UI ---
  const resetForm = () => {
    setFormState({
      name: '',
      country: '',
      isInternational: false,
      region: '',
      isFeatured: false,
      description: '',
      latitude: '',
      longitude: '',
      image: '',
    });
  };


const handleOpenDialog = (city = null) => {
  setCurrentCity(city);
  if (city) {
    setFormState({
      name: city.name || '',
      country: city.country || '',
      isInternational: city.isInternational || false,
      region: city.region || '',
      isFeatured: city.isFeatured || false,
      description: city.description || '',
      latitude: city.latitude ? city.latitude.toString() : '',
      longitude: city.longitude ? city.longitude.toString() : '',
      image: city.image || '',
    });
  } else {
    resetForm();
  }
  setDialogOpen(true);
};

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentCity(null);
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormState(prev => ({ ...prev, [name]: checked }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentCity) {
      updateCity(currentCity._id, formState);
    } else {
      createCity(formState);
    }
  };

  const filteredCities = cities.filter(city =>
    city.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6 min-h-[calc(100vh-120px)] text-white">
      {/* Header et contrôles */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <MapPin className="mr-3" /> {t('manage_cities') || 'Gestion des Villes'}
        </h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder={t('search_city_placeholder') || 'Rechercher une ville...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-[300px] bg-white dark:bg-gray-800"
            prefix={<Search className="h-4 w-4 text-gray-500" />}
          />
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" /> {t('add_city') || 'Ajouter ville'}
          </Button>
        </div>
      </div>
      
      {/* Affichage de l'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">{t('error') || 'Erreur'}!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Tableau des villes */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Statuts</TableHead>
                  <TableHead>Coordonnées</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700]"></div>
                        <p className="mt-2 text-gray-500">Chargement des villes...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <TableRow key={city._id}>
                      <TableCell className="font-medium text-blue-600">{city.name}</TableCell>
                      <TableCell>{city.country}</TableCell>
                      <TableCell>{city.region || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {city.isFeatured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Vedette
                            </Badge>
                          )}
                          {city.isInternational && (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              International
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {city.latitude && city.longitude ? (
                          <div className="text-xs">
                            <Map className="w-3 h-3 inline mr-1" />
                            {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(city)}
                          className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer la ville "{city.name}" ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCity(city._id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                      Aucune ville trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour Créer/Mettre à jour une ville */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentCity ? 'Modifier la ville' : 'Ajouter une nouvelle ville'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Nom de la ville"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formState.country}
                  onChange={handleFormChange}
                  required
                  placeholder="Nom du pays"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Région</Label>
              <Input
                id="region"
                name="region"
                value={formState.region}
                onChange={handleFormChange}
                placeholder="Région (optionnel)"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleFormChange}
                placeholder="Description de la ville (optionnel)"
                rows={3}
              />
            </div>

            {/* Coordonnées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formState.latitude}
                  onChange={handleFormChange}
                  placeholder="ex: 5.3364"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formState.longitude}
                  onChange={handleFormChange}
                  placeholder="ex: -4.0267"
                />
              </div>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label htmlFor="image">URL de l'image</Label>
              <Input
                id="image"
                name="image"
                type="url"
                value={formState.image}
                onChange={handleFormChange}
                placeholder="https://exemple.com/image.jpg"
              />
            </div>

            {/* Options booléennes */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formState.isFeatured}
                  onCheckedChange={(checked) => handleCheckboxChange('isFeatured', checked)}
                />
                <Label htmlFor="isFeatured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <Star className="w-4 h-4 inline mr-2" />
                  Ville vedette (mise en avant)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isInternational"
                  checked={formState.isInternational}
                  onCheckedChange={(checked) => handleCheckboxChange('isInternational', checked)}
                />
                <Label htmlFor="isInternational" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Destination internationale
                </Label>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {currentCity ? 'Modification...' : 'Ajout...'}
                </>
              ) : (
                currentCity ? 'Enregistrer les modifications' : 'Ajouter la ville'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCityManagementPage;