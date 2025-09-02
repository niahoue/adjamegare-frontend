// src/pages/admin/AdminBookingManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Search, Eye, Trash2, CheckCircle, XCircle, Hourglass, DollarSign, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/apiService';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../../components/ui/dialog';

const AdminBookingManagementPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingBooking, setViewingBooking] = useState(null);
  const bookingsPerPage = 10;

  // Fonction utilitaire pour vérifier si une réservation a des données valides
  const isBookingDataValid = (booking) => {
    return booking && 
           booking.outboundRoute && 
           booking.outboundRoute.from && 
           booking.outboundRoute.to &&
           booking.outboundRoute.departureDate;
  };

  // Fonction pour extraire le nom de la ville de manière sécurisée
  const getCityName = (cityData) => {
    if (!cityData) return t('city_unavailable');
    
    // Si c'est déjà une chaîne (nom de ville)
    if (typeof cityData === 'string') {
      return cityData;
    }
    
    // Si c'est un objet avec un nom
    if (typeof cityData === 'object') {
      return cityData.name || cityData.cityName || t('city_unavailable');
    }
    
    return t('city_unavailable');
  };

  // Fonction pour formater une route de manière sécurisée
  const formatRoute = (route) => {
    if (!route || !route.from || !route.to) {
      return t('route_unavailable');
    }
    
    const fromCity = getCityName(route.from);
    const toCity = getCityName(route.to);
    
    return `${fromCity} → ${toCity}`;
  };

  // Fonction pour formater une date de manière sécurisée
  const formatDate = (dateString) => {
    if (!dateString) return t('date_unavailable');
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return t('invalid_date');
      return format(date, 'PPP', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('invalid_date');
    }
  };

  // Fonction pour formater les sièges de manière sécurisée
  const formatSeats = (seats) => {
    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return t('no_seats');
    }
    return seats.join(', ');
  };

  // Fonction pour formater le prix de manière sécurisée
  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return t('price_unavailable');
    }
    return `${price.toLocaleString('fr-FR')} F CFA`;
  };

  const fetchBookings = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: bookingsPerPage,
        search: searchTerm,
        status: filterStatus === 'all' ? undefined : filterStatus,
      };
      
      // Récupérer les réservations avec les données populées
      const res = await api.admin.getAllBookings(params);
      if (res.data.success) {
        // Filtrer les réservations avec des données valides et marquer celles avec des problèmes
        const processedBookings = res.data.data.map(booking => {
          // S'assurer que les données des routes sont correctement structurées
          if (booking.outboundRoute) {
            // Si from/to sont des ObjectIds, essayer de les résoudre
            if (booking.outboundRoute.from && typeof booking.outboundRoute.from === 'object') {
              booking.outboundRoute.from = booking.outboundRoute.from.name || booking.outboundRoute.from;
            }
            if (booking.outboundRoute.to && typeof booking.outboundRoute.to === 'object') {
              booking.outboundRoute.to = booking.outboundRoute.to.name || booking.outboundRoute.to;
            }
          }
          
          if (booking.returnRoute) {
            if (booking.returnRoute.from && typeof booking.returnRoute.from === 'object') {
              booking.returnRoute.from = booking.returnRoute.from.name || booking.returnRoute.from;
            }
            if (booking.returnRoute.to && typeof booking.returnRoute.to === 'object') {
              booking.returnRoute.to = booking.returnRoute.to.name || booking.returnRoute.to;
            }
          }

          return {
            ...booking,
            hasDataIssues: !isBookingDataValid(booking)
          };
        });
        
        setBookings(processedBookings);
        setTotalPages(1); // À ajuster si l'API renvoie des informations de pagination
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(t('error_fetching_bookings'));
      toast({
        title: t('error'),
        description: t('error_fetching_bookings_detail'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(currentPage);
  }, [searchTerm, filterStatus, currentPage, toast, t]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBookings(1);
  };

  const handleUpdateBookingStatus = async (bookingId, currentStatus, newStatus) => {
    try {
      const confirmation = window.confirm(t('confirm_change_booking_status', { newStatus: t(`status_${newStatus}`) }));
      if (!confirmation) return;
      
      await api.admin.updateBookingStatus(bookingId, { status: newStatus });
      toast({
        title: t('success'),
        description: t('booking_status_updated_success', { status: t(`status_${newStatus}`) }),
      });
      fetchBookings(currentPage);
    } catch (err) {
      console.error('Error updating booking status:', err);
      toast({
        title: t('error'),
        description: err.response?.data?.message || t('error_updating_booking_status'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const confirmation = window.confirm(t('confirm_delete_booking'));
      if (!confirmation) return;

      await api.admin.deleteBooking(bookingId);
      toast({
        title: t('success'),
        description: t('booking_deleted_successfully'),
      });
      fetchBookings(currentPage);
    } catch (err) {
      console.error('Error deleting booking:', err);
      toast({
        title: t('error'),
        description: err.response?.data?.message || t('error_deleting_booking'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOldBookings = async () => {
    if (window.confirm(t('confirm_delete_old_bookings'))) {
      try {
        const res = await api.admin.deleteOldBookings();
        toast({
          title: t('success'),
          description: res.data.message || t('old_bookings_deleted_success'),
        });
        fetchBookings(currentPage);
      } catch (err) {
        console.error('Error deleting old bookings:', err);
        toast({
          title: t('error'),
          description: err.response?.data?.message || t('error_deleting_old_bookings'),
          variant: 'destructive',
        });
      }
    }
  };

  // Nouvelle fonction pour supprimer les réservations avec des données corrompues
  const handleDeleteCorruptedBookings = async () => {
    const corruptedBookings = bookings.filter(booking => booking.hasDataIssues);
    
    if (corruptedBookings.length === 0) {
      toast({
        title: t('info'),
        description: t('no_corrupted_bookings_found'),
      });
      return;
    }

    if (window.confirm(t('confirm_delete_corrupted_bookings', { count: corruptedBookings.length }))) {
      try {
        const deletePromises = corruptedBookings.map(booking => 
          api.admin.deleteBooking(booking._id)
        );
        
        await Promise.all(deletePromises);
        
        toast({
          title: t('success'),
          description: t('corrupted_bookings_deleted_success', { count: corruptedBookings.length }),
        });
        fetchBookings(currentPage);
      } catch (err) {
        console.error('Error deleting corrupted bookings:', err);
        toast({
          title: t('error'),
          description: err.response?.data?.message || t('error_deleting_corrupted_bookings'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewBooking = async (bookingId) => {
    try {
      const res = await api.admin.getBookingById(bookingId);
      if (res.data.success) {
        // Traiter les données de la réservation pour extraire les noms des villes
        const bookingData = res.data.data;
        if (bookingData.outboundRoute) {
          if (bookingData.outboundRoute.from && typeof bookingData.outboundRoute.from === 'object') {
            bookingData.outboundRoute.from = bookingData.outboundRoute.from.name || bookingData.outboundRoute.from;
          }
          if (bookingData.outboundRoute.to && typeof bookingData.outboundRoute.to === 'object') {
            bookingData.outboundRoute.to = bookingData.outboundRoute.to.name || bookingData.outboundRoute.to;
          }
        }
        
        if (bookingData.returnRoute) {
          if (bookingData.returnRoute.from && typeof bookingData.returnRoute.from === 'object') {
            bookingData.returnRoute.from = bookingData.returnRoute.from.name || bookingData.returnRoute.from;
          }
          if (bookingData.returnRoute.to && typeof bookingData.returnRoute.to === 'object') {
            bookingData.returnRoute.to = bookingData.returnRoute.to.name || bookingData.returnRoute.to;
          }
        }
        
        setViewingBooking(bookingData);
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      toast({
        title: t('error'),
        description: err.response?.data?.message || t('error_fetching_booking_details'),
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_payment': return <Hourglass className="h-4 w-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Hourglass className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700]"></div>
        <p className="ml-4 text-gray-700 font-medium">{t('loading_bookings')}</p>
      </div>
    );
  }

  // Compter les réservations avec des problèmes de données
  const corruptedBookingsCount = bookings.filter(booking => booking.hasDataIssues).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('booking_management')}</h1>
        <div className="flex gap-2">
          {corruptedBookingsCount > 0 && (
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium" 
              onClick={handleDeleteCorruptedBookings}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t('delete_corrupted_bookings')} ({corruptedBookingsCount})
            </Button>
          )}
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white font-medium" 
            onClick={handleDeleteOldBookings}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('delete_old_bookings')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">{t('error')}!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {corruptedBookingsCount > 0 && (
        <div className="bg-orange-100 border border-orange-400 text-orange-800 px-4 py-3 rounded-lg relative" role="alert">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <div>
              <strong className="font-bold">{t('warning')}!</strong>
              <span className="block sm:inline"> {t('corrupted_bookings_detected', { count: corruptedBookingsCount })}</span>
            </div>
          </div>
        </div>
      )}

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{t('list_of_bookings')}</CardTitle>
          <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
            <Input
              placeholder={t('search_bookings_by_passenger')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder={t('filter_by_status')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <SelectItem value="all" className="text-gray-900 dark:text-white">{t('all_statuses')}</SelectItem>
                <SelectItem value="pending_payment" className="text-gray-900 dark:text-white">{t('status_pending_payment')}</SelectItem>
                <SelectItem value="confirmed" className="text-gray-900 dark:text-white">{t('status_confirmed')}</SelectItem>
                <SelectItem value="cancelled" className="text-gray-900 dark:text-white">{t('status_cancelled')}</SelectItem>
                <SelectItem value="completed" className="text-gray-900 dark:text-white">{t('status_completed')}</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('booking_id')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('passenger')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('route')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('date')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('seats')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('price')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('status')}</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white font-semibold">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <TableRow 
                      key={booking._id}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 ${
                        booking.hasDataIssues ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      <TableCell className="text-gray-900 dark:text-white font-mono text-sm">
                        <div className="flex items-center gap-2">
                          {booking.hasDataIssues && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                          {booking._id ? booking._id.substring(0, 8) + '...' : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white font-medium">
                        {booking.passengerDetails?.fullName || t('passenger_unavailable')}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="font-medium">
                            {formatRoute(booking.outboundRoute)}
                          </div>
                          {booking.returnRoute && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('return')}: {formatRoute(booking.returnRoute)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {formatDate(booking.outboundRoute?.departureDate)}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {formatSeats(booking.selectedSeats)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white font-semibold">
                        {formatPrice(booking.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(booking.status)}
                          <span className={`font-medium text-sm ${
                            booking.status === 'pending_payment' ? 'text-yellow-600 dark:text-yellow-400' :
                            booking.status === 'confirmed' ? 'text-green-600 dark:text-green-400' :
                            booking.status === 'cancelled' ? 'text-red-600 dark:text-red-400' :
                            booking.status === 'completed' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {booking.status ? t(`status_${booking.status}`) : t('status_unknown')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Bouton de visualisation */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewBooking(booking._id)}
                            className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>

                          {/* Bouton de suppression */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteBooking(booking._id)}
                            className="hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </Button>

                          {/* Menu déroulant pour la mise à jour du statut - seulement si les données sont valides */}
                          {!booking.hasDataIssues && booking.status && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <Select onValueChange={(value) => handleUpdateBookingStatus(booking._id, booking.status, value)}>
                              <SelectTrigger className="w-[120px] h-8 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                <SelectValue placeholder={t('change_status')} />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                <SelectItem value="confirmed" className="text-gray-900 dark:text-white">{t('status_confirmed')}</SelectItem>
                                <SelectItem value="cancelled" className="text-gray-900 dark:text-white">{t('status_cancelled')}</SelectItem>
                                <SelectItem value="completed" className="text-gray-900 dark:text-white">{t('status_completed')}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {t('no_bookings_found')}
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
                {t('previous')}
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
                {t('next')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modale de visualisation des détails */}
      <Dialog open={!!viewingBooking} onOpenChange={() => setViewingBooking(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className='text-gray-900 dark:text-white'>{t('booking_details')}</DialogTitle>
            <DialogDescription className='text-gray-500 dark:text-gray-400'>{t('full_details_for_booking')}</DialogDescription>
          </DialogHeader>
          {viewingBooking && (
            <div className="grid gap-4 py-4 text-gray-900 dark:text-gray-300">
              <div><strong>ID:</strong> {viewingBooking._id || 'N/A'}</div>
              <div><strong>{t('passenger')}:</strong> {viewingBooking.passengerDetails?.fullName || t('passenger_unavailable')}</div>
              <div><strong>{t('email')}:</strong> {viewingBooking.passengerDetails?.email || t('email_unavailable')}</div>
              <div><strong>{t('phone')}:</strong> {viewingBooking.passengerDetails?.phoneNumber || t('phone_unavailable')}</div>
              <div><strong>{t('route')}:</strong> {formatRoute(viewingBooking.outboundRoute)}</div>
              {viewingBooking.returnRoute && (
                <div><strong>{t('return')}:</strong> {formatRoute(viewingBooking.returnRoute)}</div>
              )}
              <div><strong>{t('date')}:</strong> {formatDate(viewingBooking.outboundRoute?.departureDate)}</div>
              <div><strong>{t('seats')}:</strong> {formatSeats(viewingBooking.selectedSeats)}</div>
              <div><strong>{t('total_price')}:</strong> {formatPrice(viewingBooking.totalPrice)}</div>
              <div><strong>{t('status')}:</strong> {viewingBooking.status ? t(`status_${viewingBooking.status}`) : t('status_unknown')}</div>
              {!isBookingDataValid(viewingBooking) && (
                <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded-md text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <strong>{t('data_corruption_detected')}</strong>
                  </div>
                  <p className="mt-1">{t('booking_has_missing_data')}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookingManagementPage;