import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { Search } from 'lucide-react';
import api from '../services/apiService'; // Importez le service API
import { useTranslation } from 'react-i18next'; // Importez useTranslation

const TravelTrackingPage = () => {
  const [bookingId, setBookingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleTrackTravel = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!bookingId) {
      toast({
        title: t('required_field'),
        description: t('please_enter_booking_number'),
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.travel.trackBooking(bookingId); // Appel à la nouvelle API

      if (res.data.success) {
        toast({
          title: t('trip_found'),
          description: t('bus_en_route', { bookingId }),
        });
        // Rediriger vers une page de détails du suivi, en passant les données
        navigate(`/track-details/${bookingId}`, { state: { trackingData: res.data.data } });
      } else {
        toast({
          title: t('booking_not_found'),
          description: res.data.message || t('booking_number_incorrect'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur de suivi de voyage:', error);
      const errorMessage = error.response?.data?.message || error.message || t('tracking_error_occurred');
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <Card className="w-full max-w-md bg-white text-black rounded-lg shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">{t('track_your_trip')}</CardTitle>
            <CardDescription className="text-gray-600">
              {t('enter_booking_number_to_track_bus')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackTravel} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookingId" className="text-gray-700">{t('booking_number')}</Label>
                <Input
                  id="bookingId"
                  type="text"
                  placeholder="Ex: BOOK-XYZ123"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  required
                  className="border-gray-300 focus:border-[#73D700] focus:ring focus:ring-[#73D700]/20"
                />
              </div>
              <Button type="submit" className="w-full bg-[#73D700] hover:bg-[#5CB800] text-white font-semibold py-2.5 rounded-md shadow-md transition-all duration-200" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Search className="w-4 h-4 animate-spin mr-2" />
                    {t('searching')}...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    {t('track_my_trip')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TravelTrackingPage;
