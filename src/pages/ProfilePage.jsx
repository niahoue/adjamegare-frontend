// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Users,
  Download,
  XCircle,
  Edit,
  User,
  LogOut,
  Mail,
  Cake,
  Phone,
  BusFront,
} from 'lucide-react';
import { format, isBefore, addHours, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
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
} from '../components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../lib/utils';
import { subYears } from 'date-fns';


const ProfilePage = () => {
  const { user, isAuthenticated, logout, loadUserProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userBookings, setUserBookings] = useState([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const { t } = useTranslation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      toast({
        title: t("Accès refusé"),
        description: t("Veuillez vous connecter pour accéder à votre profil."),
        variant: "destructive",
      });
    } else {
      fetchUserBookings();
      setEditFirstName(user?.firstName || '');
      setEditLastName(user?.lastName || '');
      setEditPhone(user?.phone || '');
      setEditDateOfBirth(user?.dateOfBirth ? parseISO(user.dateOfBirth) : null);
    }
  }, [isAuthenticated, navigate, toast, user, t, loadUserProfile]);

  const fetchUserBookings = React.useCallback(async () => {
    try {
      const res = await api.travel.getUserBookings();
      if (res.data.success) {
        setUserBookings(res.data.data);
      } else {
        toast({
          title: t("Erreur"),
          description: res.data.message || t("Impossible de récupérer vos réservations."),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
      toast({
        title: t("Erreur"),
        description: error.response?.data?.message || t("Erreur serveur lors de la récupération des réservations."),
        variant: "destructive",
      });
    }
  }, [toast, t]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDownloadTicket = async (bookingId) => {
    try {
      toast({
        title: t("Téléchargement en cours"),
        description: t(`Préparation de votre ticket pour la réservation ${bookingId}...`),
      });

      // Appel à l'API pour le téléchargement du ticket
      const res = await api.travel.downloadTicket(bookingId);

      // Créer un lien temporaire pour le téléchargement
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-reservation-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast({
        title: t("Téléchargement réussi"),
        description: t("Votre ticket a été téléchargé avec succès."),
        variant: "success",
      });

    } catch (error) {
      console.error("Erreur lors du téléchargement du ticket:", error);
      toast({
        title: t("Erreur de téléchargement"),
        description: error.response?.data?.message || t("Impossible de télécharger le ticket."),
        variant: "destructive",
      });
    }
  };

  const isCancellableOrModifiable = (departureDate, departureTime) => {
    const [hours, minutes] = departureTime.split(':').map(Number);
    const bookingDateTime = new Date(departureDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    return isBefore(now, addHours(bookingDateTime, -24));
  };

  const handleCancelBooking = async (bookingId) => {
    setIsCancelling(true);
    try {
      const res = await api.travel.updateBookingStatus(bookingId, { status: 'cancelled' });
      if (res.data.success) {
        toast({
          title: t("Réservation annulée"),
          description: t(`La réservation ${bookingId} a été annulée avec succès.`),
          variant: "success",
        });
        fetchUserBookings();
      } else {
        toast({
          title: t("Erreur d'annulation"),
          description: res.data.message || t("Impossible d'annuler la réservation."),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur annulation:", error);
      toast({
        title: t("Erreur d'annulation"),
        description: error.response?.data?.message || t("Erreur serveur lors de l'annulation."),
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleModifyBooking = () => {
    toast({
      title: t("Fonctionnalité à venir"),
      description: t("La modification du billet n'est pas encore active."),
      variant: "info",
    });
  };

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    if (editPassword && editPassword !== editConfirmPassword) {
      toast({
        title: t("Mots de passe non correspondants"),
        description: t("Les nouveaux mots de passe ne correspondent pas."),
        variant: "destructive",
      });
      setIsUpdatingProfile(false);
      return;
    }
    
    if (editPassword && editPassword.length < 8) {
      toast({
        title: t("Mot de passe trop court"),
        description: t("Le mot de passe doit contenir au moins 8 caractères."),
        variant: "destructive",
      });
      setIsUpdatingProfile(false);
      return;
    }

    const today = new Date();
    const eighteenYearsAgo = subYears(today, 18);
    if (editDateOfBirth && (!isValid(editDateOfBirth) || editDateOfBirth > eighteenYearsAgo)) {
      toast({
        title: t("Date de naissance invalide"),
        description: t("Vous devez avoir au moins 18 ans."),
        variant: "destructive",
      });
      setIsUpdatingProfile(false);
      return;
    }

    try {
      const updatedData = {
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        dateOfBirth: editDateOfBirth ? editDateOfBirth.toISOString() : user.dateOfBirth,
      };
      if (editPassword) {
        updatedData.password = editPassword;
        updatedData.confirmPassword = editConfirmPassword;
      }

      const result = await updateProfile(updatedData);

      if (result.success) {
        toast({
          title: t("Profil mis à jour"),
          description: t("Vos informations de profil ont été mises à jour avec succès."),
          variant: "success",
        });
        setIsEditModalOpen(false);
        setEditPassword('');
        setEditConfirmPassword('');
        loadUserProfile();
      } else {
        toast({
          title: t("Erreur de mise à jour"),
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        title: t("Erreur de mise à jour"),
        description: error.response?.data?.message || t("Erreur serveur lors de la mise à jour du profil."),
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const upcomingBookings = userBookings.filter(b =>
    b.status === 'confirmed' && isBefore(new Date(), parseISO(b.outboundRoute.departureDate))
  );
  const pastOrCancelledBookings = userBookings.filter(b =>
    b.status !== 'confirmed' || isBefore(parseISO(b.outboundRoute.departureDate), new Date())
  );
  
  const formattedEditDateOfBirth = editDateOfBirth ? format(editDateOfBirth, 'PPP', { locale: fr }) : t('choose_date');
  const maxEditDate = subYears(new Date(), 18);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('my_profile')}</h1>
          <Button onClick={handleLogout} variant="outline" className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" /> {t('logout')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
          <Card className="lg:col-span-1 h-fit ">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{t('my_information')}</CardTitle>
              <CardDescription className=" text-gray-400 dark:text-gray-50">{t('manage_personal_info')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('first_name')}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.firstName || t('not_provided')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('last_name')}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.lastName || t('not_provided')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('email')}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.email || t('not_provided')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('phone_number')}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.phone || t('not_provided')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Cake className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('date_of_birth')}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.dateOfBirth ? format(parseISO(user.dateOfBirth), 'PPP', { locale: fr }) : t('not_provided')}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                onClick={() => setIsEditModalOpen(true)}
              >
                {t('modify_profile')}
              </Button>
            </CardContent>
          </Card>

          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4" >
                <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  {t('edit_profile')}
                  </DialogTitle>
                  
                <CardDescription>{t('update_your_profile_info')}</CardDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editFirstName" className="text-right">
                    {t('first_name')}
                  </Label>
                  <Input
                    id="editFirstName"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editLastName" className="text-right">
                    {t('last_name')}
                  </Label>
                  <Input
                    id="editLastName"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editPhone" className="text-right">
                    {t('phone_number')}
                  </Label>
                  <Input
                    id="editPhone"
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editDateOfBirth" className="text-right">
                    {t('date_of_birth')}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !editDateOfBirth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formattedEditDateOfBirth}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editDateOfBirth}
                        onSelect={setEditDateOfBirth}
                        initialFocus
                        locale={fr}
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={maxEditDate.getFullYear()}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Separator className="my-2" />
                <p className="text-sm text-gray-500 col-span-4 text-center">{t('change_password_optional')}</p>
                <div className="space-y-2">
                  <Label htmlFor="editPassword" className="text-right">
                    {t('new_password')}
                  </Label>
                  <Input
                    id="editPassword"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="col-span-3"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editConfirmPassword" className="text-right">
                    {t('confirm_new_password')}
                  </Label>
                  <Input
                    id="editConfirmPassword"
                    type="password"
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    className="col-span-3"
                    placeholder="••••••••"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#e85805] hover:bg-[#F46A21]" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? t('saving') : t('save_changes')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>


          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{t('upcoming_bookings')}</CardTitle>
                <CardDescription className="text-gray-400 dark:text-gray-50">{t('your_booked_trips')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => {
                    const departureDateTime = new Date(booking.outboundRoute.departureDate);
                    const [hours, minutes] = booking.outboundRoute.departureTime.split(':').map(Number);
                    departureDateTime.setHours(hours, minutes, 0, 0);

                    const canModifyOrCancel = isCancellableOrModifiable(booking.outboundRoute.departureDate, booking.outboundRoute.departureTime);

                    return (
                      <div key={booking._id} className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                            {booking.outboundRoute.from.name} → {booking.outboundRoute.to.name}
                          </h3>
                          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-[#73D700]/20 text-[#73D700]' :
                            booking.status === 'cancelled' ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {t(booking.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-1 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                          {format(departureDateTime, 'PPP à HH:mm', { locale: fr })}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-1 flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-500" />
                          {t('seats')}: {booking.selectedSeats.join(', ')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 flex items-center">
                          <BusFront className="w-4 h-4 mr-2 text-gray-500" />
                          {t('company')}: {booking.outboundRoute.companyName.name}
                        </p>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadTicket(booking._id)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Download className="w-4 h-4 mr-1" /> {t('ticket')}
                          </Button>
                          {canModifyOrCancel && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleModifyBooking(booking._id)}
                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                              >
                                <Edit className="w-4 h-4 mr-1" /> {t('modify')}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                    disabled={isCancelling}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" /> {t('cancel')}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t('confirm_cancel')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t('confirm_cancel_description', { bookingId: booking._id })}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelBooking(booking._id)}
                                      disabled={isCancelling}
                                    >
                                      {isCancelling ? t("Annulation...") : t("confirm")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                           {!canModifyOrCancel && booking.status === 'confirmed' && (
                             <span className="text-sm text-red-500 flex items-center ml-2">
                               <Clock className="w-4 h-4 mr-1" /> {t('not_cancellable_modifiable')}
                             </span>
                           )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">{t('no_upcoming_bookings')}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{t('booking_history')}</CardTitle>
                <CardDescription className="text-gray-400 dark:text-gray-50">{t('past_cancelled_trips')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pastOrCancelledBookings.length > 0 ? (
                  pastOrCancelledBookings.map((booking) => {
                    const departureDateTime = new Date(booking.outboundRoute.departureDate);
                    const [hours, minutes] = booking.outboundRoute.departureTime.split(':').map(Number);
                    departureDateTime.setHours(hours, minutes, 0, 0);

                    return (
                      <div key={booking._id} className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 opacity-70">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                            {booking.outboundRoute.from.name} → {booking.outboundRoute.to.name}
                          </h3>
                          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-[#73D700]/20 text-[#73D700]' :
                            booking.status === 'cancelled' ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {t(booking.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-1 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                          {format(departureDateTime, 'PPP à HH:mm', { locale: fr })}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-1 flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-500" />
                          {t('seats')}: {booking.selectedSeats.join(', ')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 flex items-center">
                          <BusFront className="w-4 h-4 mr-2 text-gray-500" />
                          {t('company')}: {booking.outboundRoute.companyName.name}
                        </p>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadTicket(booking._id)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Download className="w-4 h-4 mr-1" /> {t('ticket')}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">{t('no_past_cancelled_bookings')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;