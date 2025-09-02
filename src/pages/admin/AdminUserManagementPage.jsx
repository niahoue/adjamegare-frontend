// src/pages/admin/AdminUserManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PlusCircle, Search, Edit, Trash2, Ban, Check, UserPlus, UserX, UserCheck, Phone, Mail, User, Calendar, CircleUser, ArrowUpFromDot } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/apiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { format } from 'date-fns';

const AdminUserManagementPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const usersPerPage = 10;

  // État du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    email: '',
    password: '',
    role: 'user',
    isBanned: false,
  });

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.admin.getAllUsers({
        page,
        limit: usersPerPage,
        search: searchTerm,
      });
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setCurrentPage(res.data.pagination.currentPage);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('Erreur lors de la récupération des utilisateurs.'));
      toast({
        title: t('Erreur'),
        description: t('Une erreur est survenue lors de la récupération des données.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [searchTerm, currentPage, toast, t]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddUser = () => {
    setIsEditing(false);
    setCurrentUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      email: '',
      password: '',
      role: 'user',
      isBanned: false,
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth ? format(new Date(user.dateOfBirth), 'yyyy-MM-dd') : '',
      email: user.email,
      password: '', // Ne pas pré-remplir le mot de passe
      role: user.role,
      isBanned: user.isBanned,
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('Voulez-vous vraiment supprimer cet utilisateur? Cette action est irréversible.'))) {
      try {
        await api.admin.deleteUser(userId);
        toast({
          title: t('Succès'),
          description: t('Utilisateur supprimé avec succès.'),
        });
        fetchUsers(currentPage);
      } catch (err) {
        console.error('Error deleting user:', err);
        toast({
          title: t('Erreur'),
          description: err.response?.data?.message || t('Erreur lors de la suppression de l\'utilisateur.'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleBan = async (userId, currentStatus) => {
    if (window.confirm(currentStatus ? t('Voulez-vous vraiment débannir cet utilisateur?') : t('Voulez-vous vraiment bannir cet utilisateur?'))) {
      try {
        await api.admin.toggleUserBan(userId);
        toast({
          title: t('Succès'),
          description: currentStatus ? t('Utilisateur débanni avec succès.') : t('Utilisateur banni avec succès.'),
        });
        fetchUsers(currentPage);
      } catch (err) {
        console.error('Error toggling ban status:', err);
        toast({
          title: t('Erreur'),
          description: err.response?.data?.message || t('Erreur lors de la modification du statut de bannissement.'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Envoi des données pour la mise à jour
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        await api.admin.updateUser(currentUser._id, dataToUpdate);
        toast({
          title: t('Succès'),
          description: t('Utilisateur mis à jour avec succès.'),
        });
      } else {
        // Envoi des données pour la création
        await api.admin.createUser(formData);
        toast({
          title: t('Succès'),
          description: t('Utilisateur créé avec succès.'),
        });
      }
      setIsModalOpen(false);
      fetchUsers(currentPage);
    } catch (err) {
      console.error('Error saving user:', err);
      toast({
        title: t('Erreur'),
        description: err.response?.data?.message || t('Erreur lors de l\'enregistrement de l\'utilisateur.'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700]"></div>
        <p className="ml-4 text-gray-700 font-medium">{t('Chargement des utilisateurs...')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('Gestion des utilisateurs')}</h1>
        <Button className="bg-[#e85805] hover:bg-[#F46A21] text-white font-medium" onClick={handleAddUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t('Ajouter un utilisateur')}
        </Button>
      </div>

      {/* Modal d'ajout/modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-300">
          <DialogHeader>
            <DialogTitle>{isEditing ? t('Modifier un utilisateur') : t('Ajouter un utilisateur')}</DialogTitle>
            <DialogDescription>
              {isEditing ? t('Mettez à jour les informations de l\'utilisateur.') : t('Remplissez le formulaire pour créer un nouvel utilisateur.')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('Prénom')}</Label>
                <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('Nom')}</Label>
                <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('Email')}</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('Téléphone')}</Label>
                <Input id="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t('Date de naissance')}</Label>
                <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t('Rôle')}</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                >
                  <option value="user">{t('Utilisateur')}</option>
                  <option value="admin">{t('Administrateur')}</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('Mot de passe')}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!isEditing}
                placeholder={isEditing ? t('Laissez vide pour ne pas changer') : t('Entrez un mot de passe')}
              />
            </div>
            {isEditing && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isBanned"
                  checked={formData.isBanned}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#e85805] focus:ring-[#e85805] border-gray-300 rounded"
                />
                <Label htmlFor="isBanned" className="text-sm font-medium leading-none">
                  {t('Banni')}
                </Label>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button type="submit" className="bg-[#e85805] hover:bg-[#F46A21] text-white">
                {isEditing ? t('Enregistrer les modifications') : t('Ajouter l\'utilisateur')}
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
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{t('Liste des utilisateurs')}</CardTitle>
          <div className="flex items-center gap-2 mt-4">
            <Input
              placeholder={t('Rechercher des utilisateurs...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
            <Button onClick={handleSearch} className="bg-[#73D700] hover:bg-[#5CB800] text-white font-medium">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="bg-white dark:bg-gray-800 p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('Utilisateur')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('Contact')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('Rôle')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('Statut')}</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white font-semibold">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 bg-white dark:bg-gray-800">
                      <TableCell className="text-gray-900 dark:text-white font-medium">
                        <div className="flex items-center gap-2">
                          <CircleUser className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="font-semibold">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.dateOfBirth ? format(new Date(user.dateOfBirth), 'dd/MM/yyyy') : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                          {user.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${user.isBanned ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'}`}>
                          {user.isBanned ? t('Banni') : t('Actif')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} className="hover:bg-blue-100 dark:hover:bg-blue-900/20">
                            <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleBan(user._id, user.isBanned)} className="hover:bg-yellow-100 dark:hover:bg-yellow-900/20">
                            {user.isBanned ? <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> : <Ban className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user._id)} className="hover:bg-red-100 dark:hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {t('Aucun utilisateur trouvé')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                {t('Précédent')}
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                {t('Suivant')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagementPage;
