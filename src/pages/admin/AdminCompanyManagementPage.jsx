// src/pages/admin/AdminCompanyManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Search, Plus, Edit, Trash2, Building2 } from 'lucide-react';
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

const AdminCompanyManagementPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // --- Fonctions de gestion de l'API ---
  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.admin.getCompaniesAdmin();
      if (response.data?.success) {
        setCompanies(response.data.data);
      } else {
        setError(response.data?.message || 'Erreur lors de la récupération des compagnies.');
      }
    } catch (err) {
      console.error('Erreur de l\'API:', err);
      setError(t('error_fetching_companies'));
      toast({
        title: t('error'),
        description: t('error_fetching_companies_detail'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCompany = async (companyData) => {
    setIsSubmitting(true);
    try {
      const response = await api.admin.createCompany(companyData);
      if (response.data?.success) {
        toast({ title: 'Succès', description: 'Compagnie ajoutée avec succès.' });
        fetchCompanies(); // Recharger la liste
        setDialogOpen(false);
      } else {
        toast({ title: 'Erreur', description: response.data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Erreur', description: err.response?.data?.message || 'Échec de l\'ajout de la compagnie.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCompany = async (id, companyData) => {
    setIsSubmitting(true);
    try {
      const response = await api.admin.updateCompany(id, companyData);
      if (response.data?.success) {
        toast({ title: 'Succès', description: 'Compagnie mise à jour avec succès.' });
        fetchCompanies();
        setDialogOpen(false);
      } else {
        toast({ title: 'Erreur', description: response.data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Erreur', description: err.response?.data?.message || 'Échec de la mise à jour de la compagnie.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCompany = async (id) => {
    try {
      const response = await api.admin.deleteCompany(id);
      if (response.data?.success) {
        toast({ title: 'Succès', description: 'Compagnie supprimée avec succès.' });
        fetchCompanies();
      } else {
        toast({ title: 'Erreur', description: response.data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Erreur', description: err.response?.data?.message || 'Échec de la suppression de la compagnie.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // --- Fonctions de gestion de l'UI ---
  const handleOpenDialog = (company = null) => {
    setCurrentCompany(company);
    setFormState(company || { name: '', email: '', phone: '', address: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentCompany(null);
    setFormState({ name: '', email: '', phone: '', address: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentCompany) {
      updateCompany(currentCompany._id, formState);
    } else {
      createCompany(formState);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6 min-h-[calc(100vh-120px)] text-white">
      {/* Header et contrôles */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Building2 className="mr-3" /> {t('manage_companies')}
        </h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder={t('search_company_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-[300px] bg-white dark:bg-gray-800"
            prefix={<Search className="h-4 w-4 text-gray-500" />}
          />
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" /> {t('add_company')}
          </Button>
        </div>
      </div>
      
      {/* Affichage de l'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">{t('error')}!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Tableau des compagnies */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700]"></div>
                        <p className="mt-2 text-gray-500">Chargement des compagnies...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <TableRow key={company._id}>
                      <TableCell className="font-medium text-blue-600">{company.name}</TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>{company.phone}</TableCell>
                      <TableCell>{company.address}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(company)}
                          className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400"  />
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
                                Êtes-vous sûr de vouloir supprimer cette compagnie ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCompany(company._id)}
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
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      Aucune compagnie trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour Créer/Mettre à jour une compagnie */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white ">
          <DialogHeader>
            <DialogTitle>{currentCompany ? 'Modifier la compagnie' : 'Ajouter une nouvelle compagnie'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nom</Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                value={formState.phone}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Adresse</Label>
              <Input
                id="address"
                name="address"
                value={formState.address}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
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
              {isSubmitting ? (currentCompany ? 'Modification...' : 'Ajout...') : (currentCompany ? 'Enregistrer les modifications' : 'Ajouter la compagnie')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCompanyManagementPage;