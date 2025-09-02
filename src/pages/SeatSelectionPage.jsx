import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Bus, Armchair, Users } from 'lucide-react';
import api from '../services/apiService';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const SeatSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const MAX_SEATS_ALLOWED = 5;
  const TAX_RATE = 0.065;
  

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [busLayout, setBusLayout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { selectedRouteId, isReturnRoute, searchParams } = location.state || {};

  const fetchRouteAndBusLayout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!selectedRouteId) {
        throw new Error(t('error_no_route_selected'));
      }

      const routeRes = await api.travel.getRouteById(selectedRouteId);
      if (!routeRes.data.success || !routeRes.data.data) {
        throw new Error(routeRes.data.message || t('error_fetching_route_details'));
      }
      const route = routeRes.data.data;
      setRouteData(route);

      if (!route.bus?._id) {
        throw new Error(t('error_no_bus_associated'));
      }
      const busLayoutRes = await api.travel.getBusLayout(route.bus._id, {
        routeId: selectedRouteId,
        departureDate: route.departureDate
      });
      if (!busLayoutRes.data.success || !busLayoutRes.data.data) {
        throw new Error(busLayoutRes.data.message || t('error_fetching_bus_layout'));
      }
      setBusLayout(busLayoutRes.data.data);

    } catch (err) {
      console.error('Erreur lors du chargement des détails du voyage:', err);
      setError(err.message);
      toast({
        title: t('error'),
        description: err.message || t('error_loading_trip_details'),
        variant: 'destructive',
      });
      navigate('/search', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [selectedRouteId, navigate, toast, t]);

  useEffect(() => {
    if (!selectedRouteId) {
      const timer = setTimeout(() => {
        navigate('/search', { replace: true });
        toast({
          title: t('no_route_id'),
          description: t('redirecting_search'),
          variant: 'destructive',
        });
      }, 1000);
      return () => clearTimeout(timer);
    }

    fetchRouteAndBusLayout();
  }, [selectedRouteId, navigate, toast, t, fetchRouteAndBusLayout]);

  const handleSeatClick = (seatNumber) => {
    const seat = busLayout?.seats.find(s => s.number === seatNumber);

    if (seat?.status === 'available') {
      const isSelected = selectedSeats.includes(seatNumber);

      if (isSelected) {
        setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
      } else {
        if (selectedSeats.length < MAX_SEATS_ALLOWED) {
          setSelectedSeats([...selectedSeats, seatNumber]);
        } else {
          toast({
            title: 'Limite atteinte',
            description: `Vous ne pouvez sélectionner que ${MAX_SEATS_ALLOWED} sièges maximum.`,
            variant: 'info',
          });
        }
      }
    } else if (seat?.status === 'reserved') {
      toast({
        title: 'Siège réservé',
        description: 'Ce siège est déjà réservé.',
        variant: 'destructive',
      });
    }
  };

  const renderSeat = (seat) => {
    const isSelected = selectedSeats.includes(seat.number);
    let seatClass = 'bg-gray-300 cursor-not-allowed';
    let seatNumberClass = 'text-gray-500';

    if (seat.status === 'available') {
      seatClass = `bg-white cursor-pointer hover:bg-[#73D700] hover:text-white transition-colors`;
      seatNumberClass = 'text-gray-700';
    }
    if (isSelected) {
      seatClass = `bg-[#73D700] text-white`;
      seatNumberClass = 'text-white';
    }
    if (seat.status === 'reserved') {
      seatClass = 'bg-red-400 cursor-not-allowed text-white';
      seatNumberClass = 'text-white';
    }

    return (
      <div
        key={seat.number}
        className={`w-10 h-10 rounded-md flex items-center justify-center border border-gray-200 shadow-sm relative ${seatClass}`}
        onClick={() => handleSeatClick(seat.number)}
      >
        <Armchair className="w-5 h-5 absolute" />
        <span className={`text-xs font-medium relative z-10 ${seatNumberClass}`}>
          {seat.number.toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length > 0 && routeData) {
      const outboundRouteId = isReturnRoute ? searchParams.selectedRouteId : routeData._id;
      const returnRouteId = isReturnRoute
        ? routeData._id
        : (searchParams.tripType === 'roundTrip' && searchParams.returnRouteId)
          ? searchParams.returnRouteId
          : null;

      let outboundRouteDetails = isReturnRoute ? searchParams.outboundRouteDetails : routeData;
      let returnRouteDetails = isReturnRoute ? routeData : searchParams.returnRouteDetails;

      navigate('/checkout', {
        state: {
          outboundRouteId,
          returnRouteId,
          tripType: searchParams.tripType,
          selectedSeats,
          passengerDetails: {},
          totalPrice: selectedSeats.length * routeData.price + Math.round((selectedSeats.length * routeData.price) * TAX_RATE),
          searchParams,
          outboundRouteDetails,
          returnRouteDetails,
        },
      });
    } else {
      toast({
        title: t('selection_required'),
        description: t('please_select_seats'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_trip_details')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('error_occurred')}</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-[#73D700] text-[#73D700] hover:bg-[#73D700] hover:text-white"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    );
  }

  if (!routeData || !busLayout) {
    return null;
  }

  const { from, to, departureDate, departureTime, companyName, price } = routeData;
  const remainingSeats = MAX_SEATS_ALLOWED - selectedSeats.length;

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
          <span>{t('back_to_results')}</span>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t('select_your_seats_for')} {t('trip_to')} {to?.name || 'Ville inconnue'}
          {isReturnRoute && ` (${t('return_trip')})`}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Bus Layout */}
          <Card className="col-span-2">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{t('seat_layout')}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-white border border-gray-200 rounded-sm"></div>
                    <span>{t('available')}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-[#73D700] rounded-sm"></div>
                    <span>{t('selected')}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-red-400 rounded-sm"></div>
                    <span>{t('reserved')}</span>
                  </span>
                </div>
              </div>

              {/* Indicateur */}
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-700 font-medium">
                    {selectedSeats.length}/{MAX_SEATS_ALLOWED} sièges sélectionnés
                  </span>
                  {remainingSeats > 0 && (
                    <span className="text-blue-600 text-sm">
                      (vous pouvez encore sélectionner {remainingSeats} siège{remainingSeats > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg">
                <div className="flex justify-end mb-4">
                  <Bus className="w-8 h-8 text-gray-400" />
                </div>
                <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {busLayout.seats.map((seat, index) => (
                    <React.Fragment key={seat.number}>
                      {renderSeat(seat)}
                      {(seat.number % 4 === 2) && (
                        <div className="w-10 hidden md:block"></div>
                      )}
                      {(seat.number % 4 === 0) && (index + 1 !== busLayout.seats.length) && (
                        <div className="col-span-full h-2"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">{t('booking_summary')}</h2>
              <div className="space-y-2">
                <p className="flex justify-between text-gray-600">
                  <span>{t('company')}:</span>
                  <span className="font-medium text-gray-900">
                    {companyName?.name || companyName || 'Compagnie inconnue'}
                  </span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>{t('from')}:</span>
                  <span className="font-medium text-gray-900">{from?.name || 'Ville inconnue'}</span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>{t('to')}:</span>
                  <span className="font-medium text-gray-900">{to?.name || 'Ville inconnue'}</span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>{t('date')}:</span>
                  <span className="font-medium text-gray-900">
                    {format(parseISO(departureDate), 'PPP', { locale: fr })}
                  </span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>{t('departure_time')}:</span>
                  <span className="font-medium text-gray-900">{departureTime}</span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>{t('selected_seats')}:</span>
                  <span className="font-medium text-gray-900">
                    {selectedSeats.length > 0 ? selectedSeats.sort((a, b) => a - b).join(', ') : t('none')}
                  </span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>{t('price_per_seat')}:</span>
                  <span className="font-medium text-gray-900">{price?.toLocaleString('fr-FR')} F CFA</span>
                </p>

              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('total')}:</span>
                  <span className="text-[#e85805]">
                    {(selectedSeats.length * price)?.toLocaleString('fr-FR')} F CFA
                  </span>
                </div>
              </div>
              <Button
                onClick={handleProceedToPayment}
                disabled={selectedSeats.length === 0}
                className="w-full bg-[#e85805] hover:bg-[#F46A21] text-white font-semibold py-3"
              >
                {t('proceed_to_payment')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
