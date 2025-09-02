import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  MapPin,
  Clock,
  Bus,
  CalendarDays,
  Gauge,
  Route as RouteIcon, // Renommé pour éviter le conflit avec le modèle Route
  ArrowLeft,
  CheckCircle,
  Hourglass,
  XCircle,
  Info,
  Building,
  Users
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const TrackDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams(); // Récupère l'ID de réservation de l'URL
  const { toast } = useToast();
  const { t } = useTranslation();

  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // 'error' et 'setError' supprimés car useToast gère l'affichage des erreurs

  useEffect(() => {
    // Les données de suivi sont passées via location.state depuis TravelTrackingPage
    if (location.state && location.state.trackingData) {
      setTrackingData(location.state.trackingData);
      setIsLoading(false);
    } else if (bookingId) {
      // Si on arrive directement sur cette page (via un lien direct par exemple)
      // on devrait refaire un appel API pour récupérer les données.
      // Pour l'instant, nous allons afficher une erreur simplifiée.
      // Dans une application réelle, vous feriez un appel à api.travel.trackBooking(bookingId) ici
      toast({
        title: t('error'),
        description: t('tracking_data_missing_or_fetch_failed'), // Nouvelle clé de traduction
        variant: 'destructive',
      });
      navigate('/track'); // Rediriger vers la page de recherche de suivi
    } else {
      toast({
        title: t('error'),
        description: t('no_booking_id_provided'),
        variant: 'destructive',
      });
      navigate('/track');
    }
  }, [location.state, bookingId, navigate, toast, t]);


  const getStatusDisplay = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="text-yellow-600 font-semibold flex items-center"><Hourglass className="w-5 h-5 mr-2" />{t('status_scheduled')}</span>;
      case 'in_transit':
        return <span className="text-blue-600 font-semibold flex items-center"><Bus className="w-5 h-5 mr-2" />{t('status_in_transit')}</span>;
      case 'completed':
        return <span className="text-green-600 font-semibold flex items-center"><CheckCircle className="w-5 h-5 mr-2" />{t('status_completed')}</span>;
      case 'cancelled': // Si le statut de la réservation est "cancelled"
        return <span className="text-red-600 font-semibold flex items-center"><XCircle className="w-5 h-5 mr-2" />{t('status_cancelled')}</span>;
      default:
        return <span className="text-gray-600 font-semibold flex items-center"><Info className="w-5 h-5 mr-2" />{t('status_unknown')}</span>;
    }
  };

  if (isLoading || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_tracking_info')}</p>
        </div>
      </div>
    );
  }

  const { outboundRoute, passengerDetails, currentTracking } = trackingData;
  const { status, currentLocation, estimatedArrivalTime, departureInfo, arrivalInfo, busDetails } = currentTracking;

  // Formatter la date de départ
  const formattedDepartureDate = outboundRoute.departureDate ? format(parseISO(outboundRoute.departureDate), 'PPP', { locale: fr }) : t('N/A');
  // Formatter l'heure d'arrivée estimée
  const formattedEstimatedArrivalTime = estimatedArrivalTime ? format(new Date(estimatedArrivalTime), 'HH:mm', { locale: fr }) : t('N/A');
  // Formatter l'heure d'arrivée prévue (issue de la route)
  const formattedRouteArrivalTime = outboundRoute.arrivalTime ? outboundRoute.arrivalTime : t('N/A');


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/track')}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back_to_tracking_search')}</span>
        </Button>

        <Card className="shadow-lg p-6 md:p-8 rounded-lg border border-gray-200">
          <CardHeader className="text-center mb-6 border-b pb-4">
            <CardTitle className="text-3xl font-bold text-gray-900">{t('trip_tracking')}</CardTitle>
            <CardDescription className="text-gray-600">
              {t('booking_id')}: <span className="font-semibold text-gray-800">{bookingId}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="flex items-center justify-center space-x-4 p-4 bg-blue-50 rounded-md">
              <span className="text-xl">{t('current_status')}:</span>
              {getStatusDisplay(status)}
            </div>

            {/* Tracking Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Route Information */}
              <div className="space-y-3 p-4 border rounded-md bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <RouteIcon className="w-5 h-5 mr-2 text-blue-500" /> {t('route_information')}
                </h3>
                <p className="text-gray-700 flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {t('from')}: <span className="font-medium ml-1">{departureInfo.city || outboundRoute.from}</span></p>
                <p className="text-gray-700 flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {t('to')}: <span className="font-medium ml-1">{arrivalInfo.city || outboundRoute.to}</span></p>
                <p className="text-gray-700 flex items-center"><CalendarDays className="w-4 h-4 mr-2 text-gray-400" /> {t('date')}: <span className="font-medium ml-1">{formattedDepartureDate}</span></p>
                <p className="text-gray-700 flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> {t('departure_time')}: <span className="font-medium ml-1">{departureInfo.time || outboundRoute.departureTime}</span></p>
                <p className="text-gray-700 flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> {t('expected_arrival')}: <span className="font-medium ml-1">{formattedRouteArrivalTime}</span></p> {/* Utiliser arrivalTime de la route */}
                <p className="text-gray-700 flex items-center"><Building className="w-4 h-4 mr-2 text-gray-400" /> {t('company')}: <span className="font-medium ml-1">{outboundRoute.companyName.name}</span></p>
              </div>

              {/* Bus Information */}
              <div className="space-y-3 p-4 border rounded-md bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Bus className="w-5 h-5 mr-2 text-green-500" /> {t('bus_information')}
                </h3>
                {busDetails ? (
                  <>
                    <p className="text-gray-700 flex items-center"><Bus className="w-4 h-4 mr-2 text-gray-400" /> {t('bus_name')}: <span className="font-medium ml-1">{busDetails.name || t('N/A')}</span></p>
                    <p className="text-gray-700 flex items-center"><Gauge className="w-4 h-4 mr-2 text-gray-400" /> {t('bus_id')}: <span className="font-medium ml-1">{busDetails.busId || t('N/A')}</span></p>
                    <p className="text-gray-700 flex items-center"><Users className="w-4 h-4 mr-2 text-gray-400" /> {t('total_seats')}: <span className="font-medium ml-1">{busDetails.totalSeats || t('N/A')}</span></p>
                  </>
                ) : (
                  <p className="text-gray-700">{t('bus_details_not_available')}</p>
                )}
                <p className="text-gray-700 flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {t('current_position')}: <span className="font-medium ml-1">{currentLocation || t('N/A')}</span></p>
                <p className="text-gray-700 flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> {t('estimated_arrival_time')}: <span className="font-medium ml-1">{formattedEstimatedArrivalTime}</span></p>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="space-y-3 p-4 border rounded-md bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-500" /> {t('passenger_details')}
                </h3>
                <p className="text-gray-700">{t('full_name')}: <span className="font-medium">{passengerDetails.fullName || t('N/A')}</span></p>
                <p className="text-gray-700">{t('email')}: <span className="font-medium">{passengerDetails.email || t('N/A')}</span></p>
                <p className="text-gray-700">{t('phone_number')}: <span className="font-medium">{passengerDetails.phoneNumber || t('N/A')}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackDetailsPage;
