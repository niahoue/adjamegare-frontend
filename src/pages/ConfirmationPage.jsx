import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { paymentApi, travelApi } from '../services/apiService';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  CheckCircle,
  XCircle,
  Hourglass,
  Info,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Building,
  DollarSign,
  Home,
  Printer,
  Download
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Génération du code QR avec les informations du voyage
  const generateQRCode = useCallback((booking) => {
    if (!booking) return '';

    const qrData = {
      bookingId: booking._id,
      passenger: booking.passengerDetails.fullName,
      from: booking.outboundRoute.from,
      to: booking.outboundRoute.to,
      date: booking.outboundRoute.departureDate,
      time: booking.outboundRoute.departureTime,
      seats: booking.selectedSeats,
      company: booking.outboundRoute.companyName.name,
      phone: booking.passengerDetails.phoneNumber,
      totalPrice: booking.totalPrice
    };

    const qrString = JSON.stringify(qrData);
    // Utiliser l'API QR Code de Google Charts
    const encodedData = encodeURIComponent(qrString);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}&format=png&ecc=M`;
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return <CheckCircle className="w-12 h-12 text-green-500 mb-4" />;
      case 'pending':
        return <Hourglass className="w-12 h-12 text-yellow-500 mb-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-12 h-12 text-red-500 mb-4" />;
      default:
        return <Info className="w-12 h-12 text-gray-500 mb-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return t('payment_confirmed_title') || 'Paiement confirmé';
      case 'pending':
        return t('payment_pending_title') || 'Paiement en attente';
      case 'failed':
        return t('payment_failed_title') || 'Paiement échoué';
      case 'cancelled':
        return t('payment_cancelled_title') || 'Paiement annulé';
      default:
        return t('payment_unknown_title') || 'Statut inconnu';
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Fonction d'impression
  const handlePrint = () => {
    window.print();
  };

  // Fonction de téléchargement du billet
  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    const ticketHtml = document.getElementById('printable-ticket').innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Billet - ${bookingDetails._id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .ticket { max-width: 800px; margin: 0 auto; border: 2px solid #73D700; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #73D700; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { color: #73D700; font-size: 24px; font-weight: bold; }
            .details { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .section { flex: 1; margin-right: 20px; }
            .qr-section { text-align: center; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .ticket { border: 2px solid #000; }
            }
          </style>
        </head>
        <body>
          ${ticketHtml}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

   const fetchBookingAndPaymentStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const queryParams = new URLSearchParams(location.search);
    
    const bookingIdFromUrl = params.bookingId;
    const tokenFromUrl = params.token;
    const bookingIdFromQuery = queryParams.get('bookingId');
    const statusFromQuery = queryParams.get('status');
    const invoiceToken = queryParams.get('token') || queryParams.get('invoice_token');

    let bookingId = bookingIdFromUrl || bookingIdFromQuery;
    
    if (!bookingId && tokenFromUrl) {
      bookingId = tokenFromUrl;
    }

    try {
      if (!bookingId) {
        throw new Error(t('error_booking_id_missing') || 'ID de réservation manquant');
      }
      const bookingRes = await travelApi.getBookingById(bookingId);
      
      if (!bookingRes.data.success || !bookingRes.data.data) {
        throw new Error(bookingRes.data.message || t('error_booking_not_found') || 'Réservation non trouvée');
      }
      
      const booking = bookingRes.data.data;
      setBookingDetails(booking);
      
      // Générer le code QR
      const qrUrl = generateQRCode(booking);
      setQrCodeUrl(qrUrl);

      // Déterminer le statut de paiement en fonction de plusieurs sources
      let finalPaymentStatus = 'pending';

      // 1. Vérifier le statut depuis l'URL
      if (statusFromQuery) {
        finalPaymentStatus = statusFromQuery.toLowerCase();
      }
      // 2. Vérifier le statut de la réservation
      else if (booking.status) {
        const bookingStatus = booking.status.toLowerCase();
        
        if (bookingStatus === 'confirmed' || bookingStatus === 'active') {
          finalPaymentStatus = 'success';
        } else if (bookingStatus === 'cancelled' || bookingStatus === 'canceled') {
          finalPaymentStatus = 'cancelled';
        } else if (bookingStatus === 'pending') {
          finalPaymentStatus = 'pending';
        } else {
          finalPaymentStatus = 'success'; // Par défaut, considérer comme confirmé si statut non reconnu
        }
      }
      // 3. Vérifier avec l'API de paiement si un token est disponible
      else if (invoiceToken) {
        try {
          const statusRes = await paymentApi.checkPaymentStatus(invoiceToken);
          if (statusRes.data.success && statusRes.data.status) {
            finalPaymentStatus = statusRes.data.status.toLowerCase();
            
          }
        } catch (statusError) {
          console.error('Error checking payment status:', statusError);
          // Si on ne peut pas vérifier le statut de paiement mais qu'on a une réservation, 
          // considérer comme confirmé
          finalPaymentStatus = 'success';
        }
      }
      // 4. Par défaut, si on a une réservation valide, la considérer comme confirmée
      else {
        finalPaymentStatus = 'success';
      }
      setPaymentStatus(finalPaymentStatus);

    } catch (err) {
      console.error('Erreur lors de la confirmation du paiement:', err);
      setError(err.message);
      setPaymentStatus('failed');
      toast({
        title: t('error') || 'Erreur',
        description: err.message || t('error_processing_payment_confirmation') || 'Erreur lors du traitement de la confirmation de paiement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [location.search, params, toast, t, generateQRCode]);

  useEffect(() => {
    fetchBookingAndPaymentStatus();
  }, [fetchBookingAndPaymentStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_confirmation') || 'Chargement de la confirmation...'}</p>
        </div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('error_occurred') || 'Une erreur est survenue'}</h1>
          <p className="text-gray-700 mb-6">{error || t('error_loading_booking') || 'Erreur lors du chargement de la réservation'}</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#73D700] hover:bg-[#5CB800] text-white px-6 py-2 font-semibold flex items-center mx-auto"
          >
            <Home className="w-4 h-4 mr-2" />
            <span>{t('back_to_home') || 'Retour à l\'accueil'}</span>
          </Button>
        </div>
      </div>
    );
  }

  const outboundRoute = bookingDetails.outboundRoute;
  const returnRoute = bookingDetails.returnRoute;
  const totalPrice = bookingDetails.totalPrice || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Styles d'impression */}
      <style jsx='true'>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { margin: 0; background: white !important; }
          .ticket-container { 
            box-shadow: none !important; 
            margin: 0 !important; 
            padding: 20px !important;
          }
        }
        .print-only { display: none; }
      `}</style>

      <div className="no-print">
        <Header />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Section - Masqué à l'impression */}
        <div className="no-print mb-8">
          <Card className="shadow-lg text-center p-6 md:p-8">
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center">
                {getStatusIcon(paymentStatus)}
                <h1 className={`text-3xl font-bold mb-2 ${getStatusColorClass(paymentStatus)}`}>
                  {getStatusText(paymentStatus)}
                </h1>
                <p className="text-gray-700 text-lg">
                  {paymentStatus === 'success' || paymentStatus === 'completed'
                    ? t('thank_you_for_booking') || 'Merci pour votre réservation'
                    : t('payment_status_message') || 'Statut du paiement'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buttons - Masqués à l'impression */}
        <div className="no-print mb-6 flex gap-4 justify-center">
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold flex items-center"
          >
            <Printer className="w-4 h-4 mr-2" />
            <span>{t('print_ticket') || 'Imprimer le billet'}</span>
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            <span>{t('download_ticket') || 'Télécharger le billet'}</span>
          </Button>
        </div>

        {/* Billet imprimable */}
        <div id="printable-ticket" className="ticket-container">
          <Card className="shadow-lg border-2 border-[#73D700]">
            <CardContent className="p-8">
              {/* En-tête du billet */}
              <div className="text-center border-b-2 border-[#73D700] pb-6 mb-6">
                <h1 className="text-3xl font-bold text-[#73D700] mb-2">BILLET DE TRANSPORT</h1>
                <p className="text-lg text-gray-600">Réservation #{bookingDetails._id.slice(-8).toUpperCase()}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Informations du voyage */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Informations de la compagnie */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      {t('transport_company') || 'Compagnie de transport'}
                    </h2>
                    <p className="text-lg font-bold text-[#e85805]">{outboundRoute.companyName.name}</p>
                  </div>

                  {/* Détails du passager */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">
                      {t('passenger_information') || 'Informations du passager'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>{t('full_name') || 'Nom complet'}:</strong></p>
                        <p className="text-lg">{bookingDetails.passengerDetails.fullName}</p>
                      </div>
                      <div>
                        <p><strong>{t('phone') || 'Téléphone'}:</strong></p>
                        <p className="text-lg">{bookingDetails.passengerDetails.phoneNumber}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p><strong>{t('email') || 'Email'}:</strong></p>
                        <p className="text-lg">{bookingDetails.passengerDetails.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Détails du voyage aller */}
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h2 className="text-xl font-semibold mb-3 text-blue-700">
                      {t('outbound_journey') || 'Voyage aller'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="flex items-center text-lg font-medium">
                          <MapPin className="w-5 h-5 mr-2 text-green-600" />
                          {t('departure') || 'Départ'}: <span className="ml-2 font-bold">{outboundRoute.from.name}</span>
                        </p>
                        <p className="flex items-center text-lg font-medium mt-2">
                          <MapPin className="w-5 h-5 mr-2 text-red-600" />
                          {t('arrival') || 'Arrivée'}: <span className="ml-2 font-bold">{outboundRoute.to.name}</span>
                        </p>
                      </div>
                      <div>
                        <p className="flex items-center">
                          <CalendarDays className="w-5 h-5 mr-2" />
                          <span className="font-bold">{format(parseISO(outboundRoute.departureDate), 'EEEE dd MMMM yyyy', { locale: fr })}</span>
                        </p>
                        <p className="flex items-center mt-2">
                          <Clock className="w-5 h-5 mr-2" />
                          <span className="font-bold">{outboundRoute.departureTime}</span> - <span className="font-bold">{outboundRoute.arrivalTime}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Voyage retour si applicable */}
                  {bookingDetails.tripType === 'roundTrip' && returnRoute && (
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <h2 className="text-xl font-semibold mb-3 text-orange-700">
                        {t('return_journey') || 'Voyage retour'}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="flex items-center text-lg font-medium">
                            <MapPin className="w-5 h-5 mr-2 text-green-600" />
                            {t('departure') || 'Départ'}: <span className="ml-2 font-bold">{returnRoute.from}</span>
                          </p>
                          <p className="flex items-center text-lg font-medium mt-2">
                            <MapPin className="w-5 h-5 mr-2 text-red-600" />
                            {t('arrival') || 'Arrivée'}: <span className="ml-2 font-bold">{returnRoute.to}</span>
                          </p>
                        </div>
                        <div>
                          <p className="flex items-center">
                            <CalendarDays className="w-5 h-5 mr-2" />
                            <span className="font-bold">{format(parseISO(returnRoute.departureDate), 'EEEE dd MMMM yyyy', { locale: fr })}</span>
                          </p>
                          <p className="flex items-center mt-2">
                            <Clock className="w-5 h-5 mr-2" />
                            <span className="font-bold">{returnRoute.departureTime}</span> - <span className="font-bold">{returnRoute.arrivalTime}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informations des sièges et prix */}
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="flex items-center text-lg">
                          <Users className="w-5 h-5 mr-2" />
                          <strong>{t('selected_seats') || 'Sièges sélectionnés'}:</strong>
                        </p>
                        <p className="text-2xl font-bold text-[#73D700] ml-7">
                          {bookingDetails.selectedSeats.join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="flex items-center text-lg">
                          <DollarSign className="w-5 h-5 mr-2" />
                          <strong>{t('total_price') || 'Prix total'}:</strong>
                        </p>
                        <p className="text-2xl font-bold text-[#e85805] ml-7">
                          {totalPrice.toLocaleString('fr-FR')} F CFA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code QR et informations de validation */}
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Code QR du billet"
                        className="w-48 h-48 mx-auto"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200/E0F2F7/007bff?text=QR+Code';
                        }}
                      />
                    ) : (
                      <div className="w-48 h-48 mx-auto bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-500">Code QR</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-4 max-w-xs mx-auto">
                    {t('qr_code_validation_message') || 'Présentez ce code QR lors de l\'embarquement pour validation'}
                  </p>
                  
                  {/* Statut de la réservation */}
                  <div className="mt-6 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{t('booking_status') || 'Statut de la réservation'}</p>
                    <p className={`font-bold text-lg ${getStatusColorClass(paymentStatus)}`}>
                      {paymentStatus === 'success' ? 'CONFIRMÉ' : 
                       paymentStatus === 'pending' ? 'EN ATTENTE' :
                       paymentStatus === 'cancelled' ? 'ANNULÉ' : 'STATUT INCONNU'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pied de page */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {t('ticket_validity_message') || 'Ce billet est valable uniquement pour la date et l\'heure indiquées.'}
                </p>
                <p className="text-xs text-gray-500">
                  {t('ticket_generated_at') || 'Billet généré le'} {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bouton retour à l'accueil - Masqué à l'impression */}
        <div className="no-print mt-8 text-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-[#73D700] hover:bg-[#5CB800] text-white px-6 py-3 text-base font-medium rounded-md shadow-sm flex items-center mx-auto"
          >
            <Home className="w-5 h-5 mr-2" />
            <span>{t('back_to_home') || 'Retour à l\'accueil'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;