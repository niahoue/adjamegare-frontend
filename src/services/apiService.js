// src/services/apiService.js - Optimisations frontend
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// OPTIMISATION 1: Configuration axios optimisée pour la production
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 45000, // Réduit de 60s à 45s
  // Optimisations HTTP
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Cache-Control pour certaines requêtes
    'Cache-Control': 'public, max-age=300' // 5 min de cache navigateur
  },
  // Compression automatique
  decompress: true,
});

// OPTIMISATION 2: Cache local simple pour les données statiques
const localCache = new Map();
// TTL aligné sur le cache Redis backend :
const CACHE_TTL = {
  routes: 15 * 60 * 1000,      // 15 min pour les routes
  cities: 30 * 60 * 1000,      // 30 min pour les villes
  companies: 30 * 60 * 1000,   // 30 min pour les compagnies
  default: 5 * 60 * 1000       // fallback 5 min
};

const getCachedData = (key, type = 'default') => {
  const cached = localCache.get(key);
  const ttl = CACHE_TTL[type] || CACHE_TTL.default;
  if (cached && Date.now() - cached.timestamp < ttl) {
    console.log(`📱 Cache local hit: ${key}`);
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  localCache.set(key, { data, timestamp: Date.now() });
  // Nettoyer le cache si trop grand (max 50 entrées)
  if (localCache.size > 50) {
    const firstKey = localCache.keys().next().value;
    localCache.delete(firstKey);
  }
};

// OPTIMISATION 3: Retry logic amélioré
const retryConfig = {
  retries: 3,
  retryDelay: (retryCount) => {
    console.log(`🔄 Tentative ${retryCount} de reconnexion...`);
    return Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
  },
  retryCondition: (error) => {
    // Retry sur erreurs réseau, timeouts, et certains codes d'erreur serveur
    return !error.response || 
           error.code === 'ECONNABORTED' ||
           error.code === 'NETWORK_ERROR' ||
           (error.response.status >= 500 && error.response.status < 600) ||
           error.response.status === 429; // Too Many Requests
  },
};

// Fonction retry personnalisée
const retryRequest = async (requestFn, config = retryConfig) => {
  let lastError;
  
  for (let i = 0; i <= config.retries; i++) {
    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      lastError = error;
      
      if (i === config.retries || !config.retryCondition(error)) {
        break;
      }
      
      const delay = config.retryDelay(i);
      console.log(`⏳ Attente ${delay}ms avant nouvelle tentative...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Intercepteur pour injecter le token d'accès dans les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // OPTIMISATION: Ajouter des headers de performance
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// OPTIMISATION 4: Intercepteur de réponse amélioré avec meilleure gestion d'erreur
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log détaillé des erreurs pour debug
    console.error('🚨 Erreur API:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });

    // Gestion spécifique des erreurs réseau
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        console.error('⏰ Timeout de requête');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('🌐 Erreur réseau - vérifiez votre connexion');
      }
      return Promise.reject({
        message: 'Problème de connexion réseau. Vérifiez votre connexion internet.',
        code: error.code
      });
    }

    // Gestion du token expiré
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log('🔄 Tentative de rafraîchissement du token...');
        const res = await api.post('/users/refresh');
        if (res.data.success) {
          localStorage.setItem('accessToken', res.data.token);
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Impossible de rafraîchir le token:', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject({
          message: 'Session expirée, veuillez vous reconnecter.',
          requiresLogin: true
        });
      }
    }

    return Promise.reject(error.response?.data || {
      message: error.message || 'Erreur inconnue',
      status: error.response?.status
    });
  }
);

// Fonctions d'authentification (inchangées)
export const authApi = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  forgotPassword: (emailOrPhone) => api.post('/users/forgot-password', { emailOrPhone }),
  resetPassword: (token, newPasswordData) => api.put(`/users/reset-password/${token}`, newPasswordData),
  logout: () => api.post('/users/logout'),
  refresh: () => api.post('/users/refresh'),
};

// OPTIMISATION 5: Fonctions voyage avec cache local et retry
export const travelApi = {
  // Requêtes avec retry automatique pour les endpoints critiques
  searchRoutes: (params) => {
    // Pas de cache local pour la recherche, toujours frais (cache côté backend)
    return retryRequest(() => api.get('/travel/routes/search', { params }));
  },

  getAllRoutes: ({ forceRefresh = false } = {}) => {
    const cacheKey = 'all-routes';
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey, 'routes');
      if (cached) return Promise.resolve(cached);
    }
    return retryRequest(() => api.get('/travel/routes/all'))
      .then(response => {
        setCachedData(cacheKey, response);
        return response;
      });
  },

  // Endpoints avec cache local pour données statiques
  getDepartureCities: ({ forceRefresh = false } = {}) => {
    const cacheKey = 'departure-cities';
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey, 'cities');
      if (cached) return Promise.resolve(cached);
    }
    return retryRequest(() => api.get('/travel/cities/departure'))
      .then(response => {
        setCachedData(cacheKey, response);
        return response;
      });
  },

  getArrivalCities: ({ forceRefresh = false } = {}) => {
    const cacheKey = 'arrival-cities';
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey, 'cities');
      if (cached) return Promise.resolve(cached);
    }
    return retryRequest(() => api.get('/travel/cities/arrival'))
      .then(response => {
        setCachedData(cacheKey, response);
        return response;
      });
  },

  getAllCities: ({ forceRefresh = false } = {}) => {
    const cacheKey = 'all-cities';
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey, 'cities');
      if (cached) return Promise.resolve(cached);
    }
    return retryRequest(() => api.get('/travel/cities/all'))
      .then(response => {
        setCachedData(cacheKey, response);
        return response;
      });
  },

  getCompanies: ({ forceRefresh = false } = {}) => {
    const cacheKey = 'companies';
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey, 'companies');
      if (cached) return Promise.resolve(cached);
    }
    return retryRequest(() => api.get('/travel/companies'))
      .then(response => {
        setCachedData(cacheKey, response);
        return response;
      });
  },

  getSuggestedRoutes: ({ forceRefresh = false } = {}) => {
    const cacheKey = 'suggested-routes';
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey, 'routes');
      if (cached) return Promise.resolve(cached);
    }
    return retryRequest(() => api.get('/travel/routes/suggested'))
      .then(response => {
        setCachedData(cacheKey, response);
        return response;
      });
  },

  getPopularRoutes: ({ forceRefresh = false } = {}) => {
    const cacheKey = 'popular-routes';
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey, 'routes');
      if (cached) return Promise.resolve(cached);
    }
    return retryRequest(() => api.get('/travel/routes/popular'))
      .then(response => {
        setCachedData(cacheKey, response);
        return response;
      });
  },

  // Autres endpoints sans cache mais avec retry
  getBusLayout: (busId, params) => retryRequest(() => api.get(`/travel/buses/${busId}/layout`, { params })),
  getRouteById: (id) => retryRequest(() => api.get(`/travel/routes/${id}`)),
  createBooking: (bookingData) => api.post('/travel/bookings', bookingData), // Pas de retry pour les créations
  getUserBookings: () => api.get('/travel/bookings/my'),
  getBookingById: (bookingId) => api.get(`/travel/bookings/${bookingId}`),
  updateBookingStatus: (bookingId, statusData) => api.put(`/travel/bookings/${bookingId}/status`, statusData),
  trackBooking: (bookingId) => api.get(`/travel/bookings/${bookingId}/track`),
  downloadTicket: (bookingId) => api.get(`/travel/bookings/${bookingId}/ticket`),
  getStations: () => api.get('/travel/stations'),
  getStationById: (stationId) => api.get(`/travel/stations/${stationId}`),
};

// OPTIMISATION 6: Fonction pour précharger les données critiques
export const preloadCriticalData = async () => {
  console.log('🚀 Préchargement des données critiques...');
  
  try {
    // Précharger en parallèle les données les plus utilisées
    const promises = [
      travelApi.getAllCities(),
      travelApi.getCompanies(),
      travelApi.getSuggestedRoutes(),
    ];

    await Promise.allSettled(promises);
    console.log('✅ Données critiques préchargées');
  } catch (error) {
    console.warn('⚠️ Erreur lors du préchargement:', error);
  }
};

// OPTIMISATION 7: Fonction pour nettoyer le cache
export const clearCache = () => {
  localCache.clear();
  console.log('🗑️ Cache local nettoyé');
};

export const paymentApi = {
  initiatePayment: (bookingId) => api.post('/payment/initiate', { bookingId }),
  checkPaymentStatus: (invoiceToken) => api.get(`/payment/check-status/${invoiceToken}`),
};

// Admin API (inchangée)
export const adminApi = {
  // Utilisateurs
  getUsersCount: () => api.get('/admin/users/count'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUserBan: (id) => api.post(`/admin/users/${id}/toggle-ban`),

  // Bus
  getBusesCount: () => api.get('/admin/buses/count'),
  getAllBuses: () => api.get('/admin/buses'),
  getBusById: (id) => api.get(`/admin/buses/${id}`),
  createBus: (busData) => api.post('/admin/buses', busData),
  updateBus: (id, busData) => api.put(`/admin/buses/${id}`, busData),
  deleteBus: (id) => api.delete(`/admin/buses/${id}`),

  // Routes
  getRoutesCount: () => api.get('/admin/routes/count'),
  getAllRoutes: () => api.get('/admin/routes'),
  getRouteById: (id) => api.get(`/admin/routes/${id}`),
  createRoute: (routeData) => api.post('/admin/routes', routeData),
  updateRoute: (id, routeData) => api.put(`/admin/routes/${id}`, routeData),
  deleteRoute: (id) => api.delete(`/admin/routes/${id}`),

  // Réservations
  getBookingCounts: () => api.get('/admin/bookings/count'),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getBookingById: (id) => api.get(`/admin/bookings/${id}`),
  updateBookingStatus: (id, statusData) => api.put(`/admin/bookings/${id}`, statusData),
  deleteOldBookings: () => api.delete('/admin/bookings/old'),
  deleteBooking: (id) => api.delete(`/admin/bookings/${id}`),

  // Compagnies
  getCompaniesCount: () => api.get('/admin/companies/count'),
  getCompaniesAdmin: () => api.get('/admin/companies'),
  getCompanyByIdAdmin: (id) => api.get(`/admin/companies/${id}`),
  createCompany: (companyData) => api.post('/admin/companies', companyData),
  updateCompany: (id, companyData) => api.put(`/admin/companies/${id}`, companyData),
  deleteCompany: (id) => api.delete(`/admin/companies/${id}`),

  // Revenus
  getTotalRevenue: () => api.get('/admin/revenue/total'),

  // Villes
  getCitiesCount: () => api.get('/admin/cities/count'), 
  getCitiesAdmin: () => api.get('/admin/cities'),
  getCityById: (id) => api.get(`/admin/cities/${id}`),
  createCity: (cityData) => api.post('/admin/cities', cityData),
  updateCity: (id, cityData) => api.put(`/admin/cities/${id}`, cityData),
  deleteCity: (id) => api.delete(`/admin/cities/${id}`),

  // Partenaires
  getPartnersCount: () => api.get('/admin/partners/count'),
  getAllPartners: () => api.get('/admin/partners'),
  addPartnerDirectly: (partnerData) => api.post('/admin/partners', partnerData),
  approvePartner: (id) => api.put(`/admin/partners/${id}/approve`),
  rejectPartner: (id) => api.put(`/admin/partners/${id}/reject`),
  deletePartner: (id) => api.delete(`/admin/partners/${id}`),
  updatePartner: (id, partnerData) => api.put(`/admin/partners/${id}`, partnerData),
};

// Partenaires côté public (inchangée)
export const partnerApi = {
  createRequest: (formData) => api.post('/partners/request', formData),
};

export default {
  auth: authApi,
  travel: travelApi,
  payment: paymentApi,
  admin: adminApi, 
  partner: partnerApi,
  // Nouvelles fonctions utilitaires
  preloadCriticalData,
  clearCache,
};