// src/pages/admin/AdminDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Route as RouteIcon, BusFront, CalendarCheck, DollarSign, Clock, Building2, MapPin, Handshake } from 'lucide-react'; 
import { useToast } from '../../hooks/use-toast';
import api from '../../services/apiService';
import { useTranslation } from 'react-i18next';

const AdminDashboardPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    users: 0,
    routes: 0,
    buses: 0,
    companies: 0, 
    cities: 0,
    partners: 0, // Nouveau: Statistique pour les partenaires
    bookings: {
      total: 0,
      pendingPayment: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    },
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    users: true,
    routes: true,
    buses: true,
    companies: true, 
    cities: true, 
    partners: true, // Nouveau: État de chargement pour les partenaires
    bookings: true,
    revenue: true,
  });

  // Fonction centralisée pour charger les stats admin
  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    const updateLoadingState = (key, value) => {
      setLoadingStates(prev => ({ ...prev, [key]: value }));
    };

    try {
      // --- Users Count ---
      try {
        updateLoadingState('users', true);
        const usersRes = await api.admin.getUsersCount();
        if (usersRes.data?.success) {
          setStats(prev => ({ ...prev, users: usersRes.data.count }));
        }
        updateLoadingState('users', false);
      } catch (err) {
        console.error('Error fetching users count:', err);
        updateLoadingState('users', false);
        toast({
          title: t('error'),
          description: t('error_fetching_users'),
          variant: 'destructive',
        });
      }

      // --- Routes Count ---
      try {
        updateLoadingState('routes', true);
        const routesRes = await api.admin.getRoutesCount();
        if (routesRes.data?.success) {
          setStats(prev => ({ ...prev, routes: routesRes.data.count }));
        }
        updateLoadingState('routes', false);
      } catch (err) {
        console.error('Error fetching routes count:', err);
        updateLoadingState('routes', false);
        toast({
          title: t('error'),
          description: t('error_fetching_routes'),
          variant: 'destructive',
        });
      }

      // --- Buses Count ---
      try {
        updateLoadingState('buses', true);
        const busesRes = await api.admin.getBusesCount();
        if (busesRes.data?.success) {
          setStats(prev => ({ ...prev, buses: busesRes.data.count }));
        }
        updateLoadingState('buses', false);
      } catch (err) {
        console.error('Error fetching buses count:', err);
        updateLoadingState('buses', false);
        toast({
          title: t('error'),
          description: t('error_fetching_buses'),
          variant: 'destructive',
        });
      }

      // --- Companies Count ---
      try {
        updateLoadingState('companies', true);
        const companiesRes = await api.admin.getCompaniesCount(); 
        if (companiesRes.data?.success) {
          setStats(prev => ({ ...prev, companies: companiesRes.data.data.count })); 
        }
        updateLoadingState('companies', false);
      } catch (err) {
        console.error('Error fetching companies count:', err);
        updateLoadingState('companies', false);
        toast({
          title: t('error'),
          description: 'Impossible de charger le nombre de compagnies',
          variant: 'destructive',
        });
      }

      // --- Cities Count ---
      try {
        updateLoadingState('cities', true);
        const citiesRes = await api.admin.getCitiesAdmin();
        if (citiesRes.data?.success) {
          setStats(prev => ({ ...prev, cities: citiesRes.data.data.length }));
        }
        updateLoadingState('cities', false);
      } catch (err) {
        console.error('Error fetching cities count:', err);
        updateLoadingState('cities', false);
        toast({
          title: t('error'),
          description: 'Impossible de charger le nombre de villes',
          variant: 'destructive',
        });
      }

      // --- Partners Count --- (NOUVEAU)
      try {
        updateLoadingState('partners', true);
        const partnersRes = await api.admin.getPartnersCount();
        if (partnersRes.data?.success) {
          setStats(prev => ({ ...prev, partners: partnersRes.data.count }));
        }
        updateLoadingState('partners', false);
      } catch (err) {
        console.error('Error fetching partners count:', err);
        updateLoadingState('partners', false);
        toast({
          title: t('error'),
          description: 'Impossible de charger le nombre de partenaires',
          variant: 'destructive',
        });
      }

      // --- Bookings Count ---
      try {
        updateLoadingState('bookings', true);
        const bookingsRes = await api.admin.getBookingCounts();
        if (bookingsRes.data?.success) {
          setStats(prev => ({ ...prev, bookings: bookingsRes.data.data }));
        }
        updateLoadingState('bookings', false);
      } catch (err) {
        console.error('Error fetching bookings count:', err);
        updateLoadingState('bookings', false);
        toast({
          title: t('error'),
          description: t('error_fetching_bookings_stats'),
          variant: 'destructive',
        });
      }

      // --- Revenue ---
      try {
        updateLoadingState('revenue', true);
        const revenueRes = await api.admin.getTotalRevenue();
        if (revenueRes.data?.success) {
          setStats(prev => ({ ...prev, totalRevenue: revenueRes.data.totalRevenue }));
        }
        updateLoadingState('revenue', false);
      } catch (err) {
        console.error('Error fetching revenue:', err);
        updateLoadingState('revenue', false);
        toast({
          title: t('error'),
          description: t('error_fetching_revenue'),
          variant: 'destructive',
        });
      }

    } catch (err) {
      console.error('General error fetching admin stats:', err);
      setError(t('error_fetching_dashboard_stats'));
      toast({
        title: t('error'),
        description: t('error_fetching_dashboard_stats_detail'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading && Object.values(loadingStates).every(state => state)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#73D700]"></div>
        <p className="ml-4 text-gray-700 font-medium">{t('loading_dashboard_stats')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 bg-gray-50 dark:bg-gray-900 p-6 min-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin_dashboard')}</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">{t('error')}!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Users */}
        <Card className="bg-white border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_users')}</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStates.users ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold">{stats.users.toLocaleString()}</div>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('registered_users_count')}</p>
          </CardContent>
        </Card>

        {/* Routes */}
        <Card className="bg-white border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_routes')}</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <RouteIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStates.routes ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold">{stats.routes.toLocaleString()}</div>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('available_routes_count')}</p>
          </CardContent>
        </Card>

        {/* Buses */}
        <Card className="bg-white border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_buses')}</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <BusFront className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStates.buses ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold">{stats.buses.toLocaleString()}</div>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('managed_buses_count')}</p>
          </CardContent>
        </Card>

        {/* Companies */}
        <Card className="bg-white border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Compagnies</CardTitle>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Building2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStates.companies ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold">{stats.companies.toLocaleString()}</div>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total des compagnies de transport</p>
          </CardContent>
        </Card>

        {/* Cities */}
        <Card className="bg-white border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Villes</CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <MapPin className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStates.cities ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold">{stats.cities.toLocaleString()}</div>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total des villes gérées</p>
          </CardContent>
        </Card>

        {/* Partners (NOUVEAU) */}
        <Card className="bg-white border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Partenaires</CardTitle>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <Handshake className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStates.partners ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold">{(stats.partners || 0).toLocaleString()}</div>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total des partenaires enregistrés</p>
          </CardContent>
        </Card>

        {/* Bookings */}
        <Card className="bg-white border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_bookings')}</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <CalendarCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStates.bookings ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold">{stats.bookings.total.toLocaleString()}</div>
            )}
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-green-600 font-medium">{t('confirmed')}: {stats.bookings.confirmed}</span>
              <span className="text-yellow-600 font-medium">{t('pending')}: {stats.bookings.pendingPayment}</span>
              <span className="text-red-600 font-medium">{t('cancelled')}: {stats.bookings.cancelled}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue + Bookings repartition */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Revenue */}
        <Card className="bg-white border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">{t('revenue')}</CardTitle>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStates.revenue ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-32 mb-2"></div>
              </div>
            ) : (
              <div className="text-4xl font-bold mb-2">
                {stats.totalRevenue.toLocaleString('fr-FR')} F CFA
              </div>
            )}
            <p className="text-sm text-gray-600 ">{t('total_revenue_description')}</p>
          </CardContent>
        </Card>

        {/* Bookings repartition */}
        <Card className="bg-white border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Répartition des réservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { color: 'green', label: 'Confirmées', value: stats.bookings.confirmed },
                { color: 'yellow', label: 'En attente', value: stats.bookings.pendingPayment },
                { color: 'red', label: 'Annulées', value: stats.bookings.cancelled },
                { color: 'blue', label: 'Terminées', value: stats.bookings.completed },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 bg-${item.color}-500 rounded-full`}></div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extra Stats */}
      <div className="grid gap-6 md:grid-cols-1">
        <Card className="bg-white border shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Statistiques détaillées à venir</p>
              <p className="text-sm mt-2">Cette section affichera l'activité récente du système</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;