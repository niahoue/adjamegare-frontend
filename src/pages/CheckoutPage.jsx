import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, CalendarDays, MapPin, Clock, Users, Building, DollarSign } from 'lucide-react'; 
import api from '../services/apiService'; 
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const bookingInfo = location.state || {};

  // Vérifiez si les données essentielles sont présentes
  useEffect(() => {
    if (!bookingInfo.selectedSeats || bookingInfo.selectedSeats.length === 0 || !bookingInfo.outboundRouteId || !bookingInfo.totalPrice) {
      toast({
        title: t('booking_error'),
        description: t('booking_data_missing'),
        variant: 'destructive',
      });
      navigate(-1);
    }
  }, [bookingInfo, navigate, toast, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const { fullName, email, phoneNumber } = formData;
    if (!fullName || !email || !phoneNumber) {
      toast({
        title: t('incomplete_form'),
        description: t('fill_all_fields'),
        variant: 'destructive',
      });
      setIsProcessing(false);
      return;
    }

    try {
      const tripType = bookingInfo.returnRouteId ? 'roundTrip' : 'oneWay';
      
      const bookingDataToCreate = {
        outboundRouteId: bookingInfo.outboundRouteId,
        returnRouteId: bookingInfo.returnRouteId || undefined,
        tripType: tripType,
        selectedSeats: bookingInfo.selectedSeats,
        passengerDetails: formData,
        totalPrice: bookingInfo.totalPrice,
      };

      const createBookingRes = await api.travel.createBooking(bookingDataToCreate);
     
      if (!createBookingRes.data.success) {
        throw new Error(createBookingRes.data.message || t('error_creating_booking'));
      }

      const bookingId = createBookingRes.data.data._id;
      const initiatePaymentRes = await api.payment.initiatePayment(bookingId);
    
      if (!initiatePaymentRes.data.success) {
        throw new Error(initiatePaymentRes.data.message || t('error_initiating_payment'));
      }

      const { paymentUrl } = initiatePaymentRes.data;
      if (!paymentUrl) {
        throw new Error('URL de paiement manquante dans la réponse PayDunya');
      }

      window.location.href = paymentUrl;

    } catch (error) {
      let errorMessage = t('payment_system_error');
      
      if (error.response) {
        console.error('🔴 Réponse d\'erreur serveur:', error.response);
        errorMessage = error.response.data?.message || error.message;
      } else if (error.request) {
        console.error('📡 Erreur de requête (pas de réponse):', error.request);
        errorMessage = t('network_error');
      } else {
        console.error('⚠️ Erreur configuration:', error.message);
        errorMessage = error.message;
      }

      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPrice = bookingInfo.totalPrice || 0;
  const outboundRoute = bookingInfo.outboundRouteDetails;
  const returnRoute = bookingInfo.returnRouteDetails;

  if (!outboundRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('loading_booking_details')}</p>
        </div>
      </div>
    );
  }

  // Helper pour afficher le nom de la compagnie (compatible avec les snapshots)
  const getCompanyName = (company) => {
    if (!company) return '';
    if (typeof company === 'string') return company;
    if (typeof company === 'object') {
      return company.name || company.companyName || '';
    }
    return '';
  };

  // Helper pour afficher le nom de la ville (compatible avec les snapshots)
  const getCityName = (city) => {
    if (!city) return '';
    if (typeof city === 'string') return city;
    if (typeof city === 'object') {
      return city.name || city.cityName || '';
    }
    return '';
  };

  // Helper pour afficher les informations du bus (compatible avec les snapshots)
  const getBusInfo = (bus) => {
    if (!bus) return '';
    if (typeof bus === 'string') return bus;
    if (typeof bus === 'object') {
      const busNumber = bus.busNumber || bus.number || '';
      const model = bus.model || '';
      return model ? `${busNumber} - ${model}` : busNumber;
    }
    return '';
  };

  // Helper pour formater la date de manière sécurisée
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '';
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return format(date, 'PPP', { locale: fr });
    } catch (error) {
      console.warn('Erreur de formatage de date:', error);
      return dateString;
    }
  };

  // Helper pour afficher les arrêts
  const getStops = (stops) => {
    if (!stops || !Array.isArray(stops) || stops.length === 0) {
      return t('direct_trip');
    }
    return `${stops.length} ${stops.length === 1 ? t('stop') : t('stops')}`;
  };

  // Helper pour afficher les commodités
  const getAmenities = (amenities) => {
    if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
      return t('standard_amenities');
    }
    return amenities.join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t('passenger_info_and_payment')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <Card className="col-span-1 md:order-2 h-fit shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">{t('your_trip_summary')}</h2>

              {/* Outbound Route */}
              <div className="border-b pb-4 mb-4">
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 mb-2">{t('outbound_journey')}</h3>
                </div>
                <p className="flex justify-between items-center text-gray-700 font-medium mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{getCityName(outboundRoute.from)} → {getCityName(outboundRoute.to)}</span>
                </p>
                <p className="flex justify-between text-gray-600 text-sm">
                  <span><CalendarDays className="inline-block w-4 h-4 mr-1" /> {t('date')}:</span>
                  <span className="font-medium">{formatDate(outboundRoute.departureDate)}</span>
                </p>
                <p className="flex justify-between text-gray-600 text-sm">
                  <span><Clock className="inline-block w-4 h-4 mr-1" /> {t('departure_time')}:</span>
                  <span className="font-medium">{outboundRoute.departureTime}</span>
                </p>
                <p className="flex justify-between text-gray-600 text-sm">
                  <span><Clock className="inline-block w-4 h-4 mr-1" /> {t('arrival_time')}:</span>
                  <span className="font-medium">{outboundRoute.arrivalTime}</span>
                </p>
                <p className="flex justify-between text-gray-600 text-sm">
                  <span><Building className="inline-block w-4 h-4 mr-1" /> {t('company')}:</span>
                  <span className="font-medium">{getCompanyName(outboundRoute.companyName)}</span>
                </p>
                {outboundRoute.bus && (
                  <p className="flex justify-between text-gray-600 text-sm">
                    <span>🚌 {t('bus')}:</span>
                    <span className="font-medium">{getBusInfo(outboundRoute.bus)}</span>
                  </p>
                )}
                <p className="flex justify-between text-gray-600 text-sm">
                  <span><Users className="inline-block w-4 h-4 mr-1" /> {t('seats')}:</span>
                  <span className="font-medium">{bookingInfo.selectedSeats?.join(', ')}</span>
                </p>
                <p className="flex justify-between text-gray-600 text-sm">
                  <span>🛑 {t('stops')}:</span>
                  <span className="font-medium">{getStops(outboundRoute.stops)}</span>
                </p>
                {outboundRoute.amenities && (
                  <p className="flex justify-between text-gray-600 text-sm">
                    <span>✨ {t('amenities')}:</span>
                    <span className="font-medium text-xs">{getAmenities(outboundRoute.amenities)}</span>
                  </p>
                )}
              </div>

              {/* Return Route */}
              {bookingInfo.tripType === 'roundTrip' && returnRoute && (
                <div className="border-b pb-4 mb-4">
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-900 mb-2">{t('return_journey')}</h3>
                  </div>
                  <p className="flex justify-between items-center text-gray-700 font-medium mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{getCityName(returnRoute.from)} → {getCityName(returnRoute.to)}</span>
                  </p>
                  <p className="flex justify-between text-gray-600 text-sm">
                    <span><CalendarDays className="inline-block w-4 h-4 mr-1" /> {t('date')}:</span>
                    <span className="font-medium">{formatDate(returnRoute.departureDate)}</span>
                  </p>
                  <p className="flex justify-between text-gray-600 text-sm">
                    <span><Clock className="inline-block w-4 h-4 mr-1" /> {t('departure_time')}:</span>
                    <span className="font-medium">{returnRoute.departureTime}</span>
                  </p>
                  <p className="flex justify-between text-gray-600 text-sm">
                    <span><Clock className="inline-block w-4 h-4 mr-1" /> {t('arrival_time')}:</span>
                    <span className="font-medium">{returnRoute.arrivalTime}</span>
                  </p>
                  <p className="flex justify-between text-gray-600 text-sm">
                    <span><Building className="inline-block w-4 h-4 mr-1" /> {t('company')}:</span>
                    <span className="font-medium">{getCompanyName(returnRoute.companyName)}</span>
                  </p>
                  {returnRoute.bus && (
                    <p className="flex justify-between text-gray-600 text-sm">
                      <span>🚌 {t('bus')}:</span>
                      <span className="font-medium">{getBusInfo(returnRoute.bus)}</span>
                    </p>
                  )}
                  <p className="flex justify-between text-gray-600 text-sm">
                    <span><Users className="inline-block w-4 h-4 mr-1" /> {t('seats')}:</span>
                    <span className="font-medium">{bookingInfo.selectedSeats?.join(', ')}</span>
                  </p>
                  <p className="flex justify-between text-gray-600 text-sm">
                    <span>🛑 {t('stops')}:</span>
                    <span className="font-medium">{getStops(returnRoute.stops)}</span>
                  </p>
                  {returnRoute.amenities && (
                    <p className="flex justify-between text-gray-600 text-sm">
                      <span>✨ {t('amenities')}:</span>
                      <span className="font-medium text-xs">{getAmenities(returnRoute.amenities)}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between text-gray-600 font-medium">
                <span>{t('number_of_tickets')}:</span>
                <span className="font-medium text-gray-900">{bookingInfo.selectedSeats?.length}</span>
              </div>

              {outboundRoute.duration && (
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>{t('total_duration')}:</span>
                  <span className="font-medium text-gray-900">{outboundRoute.duration}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span><DollarSign className="inline-block w-5 h-5 mr-2 text-[#e85805]" />{t('total_to_pay')}:</span>
                  <span className="text-[#e85805]">{totalPrice.toLocaleString('fr-FR')} F CFA</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passenger + Payment */}
          <Card className="col-span-1 md:col-span-2 md:order-1 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">{t('your_information')}</h2>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('full_name')}</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={t('enter_full_name')}
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('enter_email')}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{t('phone_number')}</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder={t('phone_number_example')}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <h2 className="text-xl font-semibold mt-8 mb-4">{t('payment_method')}</h2>
                <div className="flex items-center space-x-4 border rounded-md p-4 bg-gray-50">
                  <img src="https://adjamegare.com/paydunya-logo.png" alt="Paydunya" className="h-8" />
                  <span className="font-medium">{t('mobile_payment_options')}</span>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#73D700] hover:bg-[#5CB800] text-white font-semibold py-3"
                >
                  {isProcessing ? t('processing_payment') : `${t('pay')} ${totalPrice.toLocaleString('fr-FR')} F CFA`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;