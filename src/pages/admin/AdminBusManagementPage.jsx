// src/pages/admin/AdminBusManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PlusCircle, Search, Edit, Trash2, BusFront, Bus, Layout, ClipboardList } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/apiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const AdminBusManagementPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [originalBuses, setOriginalBuses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBus, setCurrentBus] = useState(null);

  // État pour le formulaire
  const [formData, setFormData] = useState({
    name: '',
    busId: '',
    totalSeats: '',
    layout: '',
    amenities: '',
  });

  const fetchBuses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.admin.getAllBuses();
      if (res.data.success) {
        setBuses(res.data.data);
        setOriginalBuses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError(t('error_fetching_buses'));
      toast({
        title: t('Erreur'),
        description: t('Erreur lors de la récupération des bus.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [toast, t]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setBuses(originalBuses);
      return;
    }
    
    const filteredBuses = originalBuses.filter(bus =>
      bus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.busId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setBuses(filteredBuses);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, originalBuses]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAddBus = () => {
    setIsEditing(false);
    setCurrentBus(null);
    setFormData({
      name: '',
      busId: '',
      totalSeats: '',
      layout: '',
      amenities: '',
    });
    setIsModalOpen(true);
  };

  const handleEditBus = (bus) => {
    setIsEditing(true);
    setCurrentBus(bus);
    setFormData({
      name: bus.name,
      busId: bus.busId,
      totalSeats: bus.totalSeats,
      layout: bus.layout,
      amenities: bus.amenities ? bus.amenities.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteBus = async (busId) => {
    if (window.confirm(t('Voulez-vous vraiment supprimer ce bus?'))) {
      try {
        await api.admin.deleteBus(busId);
        toast({
          title: t('Succès'),
          description: t('Bus supprimé avec succès.'),
        });
        fetchBuses();
      } catch (err) {
        console.error('Error deleting bus:', err);
        toast({
          title: t('Erreur'),
          description: err.response?.data?.message || t('Erreur lors de la suppression du bus.'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
      totalSeats: Number(formData.totalSeats),
    };

    try {
      if (isEditing) {
        await api.admin.updateBus(currentBus._id, dataToSend);
        toast({
          title: t('Succès'),
          description: t('Bus mis à jour avec succès.'),
        });
      } else {
        await api.admin.createBus(dataToSend);
        toast({
          title: t('Succès'),
          description: t('Bus ajouté avec succès.'),
        });
      }
      setIsModalOpen(false);
      fetchBuses();
    } catch (err) {
      console.error('Error saving bus:', err);
      toast({
        title: t('Erreur'),
        description: err.response?.data?.message || t('Erreur lors de l\'enregistrement du bus.'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700]"></div>
        <p className="ml-4 text-gray-700 font-medium">{t('Chargement des bus...')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <BusFront className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('Gestion des bus')}</h1>
        </div>
        <Button 
          className="bg-[#e85805] hover:bg-[#F46A21] text-white font-medium" 
          onClick={handleAddBus}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('Ajouter un bus')}
        </Button>
      </div>

      {/* Modal d'ajout/modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-300">
          <DialogHeader>
            <DialogTitle>{isEditing ? t('Modifier un bus') : t('Ajouter un bus')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('Nom du bus')}</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="busId">{t('ID du bus')}</Label>
              <Input id="busId" value={formData.busId} onChange={handleInputChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalSeats">{t('Nombre total de sièges')}</Label>
                <Input type="number" id="totalSeats" value={formData.totalSeats} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="layout">{t('Disposition')}</Label>
                <Input id="layout" placeholder="ex: 2x2" value={formData.layout} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amenities">{t('Services')}</Label>
              <Textarea id="amenities" placeholder="ex: Wi-Fi, Climatisation, Toilettes" value={formData.amenities} onChange={handleInputChange} />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit" className="bg-[#e85805] hover:bg-[#F46A21] text-white">
                {isEditing ? t('Enregistrer les modifications') : t('Ajouter le bus')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">{t('Erreur')}!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{t('Liste des bus')}</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <Input
              placeholder={t('Rechercher des bus...')}
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
        </CardHeader>
        <CardContent className="bg-white dark:bg-gray-800 p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('Nom du bus')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('ID du bus')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('Sièges')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('Disposition')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('Services')}</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white font-semibold">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.length > 0 ? (
                  buses.map((bus) => (
                    <TableRow 
                      key={bus._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 bg-white dark:bg-gray-800"
                    >
                      <TableCell className="text-gray-900 dark:text-white font-medium">
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          {bus.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300 font-mono">
                        {bus.busId}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Layout className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 font-medium">
                            {bus.totalSeats} sièges
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          {bus.layout}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="max-w-xs flex flex-wrap gap-1 items-center">
                          <ClipboardList className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          {bus.amenities && bus.amenities.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {bus.amenities.slice(0, 2).map((amenity, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {bus.amenities.length > 2 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{bus.amenities.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 italic">
                              {t('Aucun')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditBus(bus)}
                            className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteBus(bus._id)}
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
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <BusFront className="h-12 w-12 opacity-50" />
                        <div>
                          <p className="font-medium">{t('Aucun bus trouvé')}</p>
                          {searchTerm && (
                            <p className="text-sm mt-1">
                              Essayez de modifier votre recherche ou 
                              <button 
                                onClick={() => setSearchTerm('')}
                                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                              >
                                {t('afficher tous les bus')}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBusManagementPage;
