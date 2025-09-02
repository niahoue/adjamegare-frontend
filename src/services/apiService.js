// src/services/apiService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

// Intercepteur pour injecter le token d'accès dans les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les tokens expirés
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || (error.response.status === 401 && !originalRequest._retry)) {
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await api.post('/users/refresh');
          if (res.data.success) {
            localStorage.setItem('accessToken', res.data.token);
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Impossible de rafraîchir le token, déconnexion:', refreshError);
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(refreshError.response?.data || { message: refreshError.message || 'Refresh token invalide.' });
        }
      }
      return Promise.reject(error.response?.data || { message: error.message || 'Erreur réseau inconnue.' });
    }
    return Promise.reject(error.response.data);
  }
);

// Fonctions d'authentification
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

// Fonctions de voyage et réservation
export const travelApi = {
  searchRoutes: (params) => api.get('/travel/routes/search', { params }),
  getAllRoutes: () => api.get('/travel/routes/all'),
  getBusLayout: (busId, params) => api.get(`/travel/buses/${busId}/layout`, { params }),
  getRouteById: (id) => api.get(`/travel/routes/${id}`),
  createBooking: (bookingData) => api.post('/travel/bookings', bookingData),
  getUserBookings: () => api.get('/travel/bookings/my'),
  getBookingById: (bookingId) => api.get(`/travel/bookings/${bookingId}`),
  updateBookingStatus: (bookingId, statusData) => api.put(`/travel/bookings/${bookingId}/status`, statusData),
  getSuggestedRoutes: () => api.get('/travel/routes/suggested'),
  getCompanies: () => api.get('/travel/companies'),
  trackBooking: (bookingId) => api.get(`/travel/bookings/${bookingId}/track`),
  downloadTicket: (bookingId) => api.get(`/travel/bookings/${bookingId}/ticket`),
  getStations: () => api.get('/travel/stations'),
  getStationById: (stationId) => api.get(`/travel/stations/${stationId}`),
  getPopularRoutes: () => api.get('/travel/routes/popular'),
  getDepartureCities: () => api.get('/travel/cities/departure'),
  getArrivalCities: () => api.get('/travel/cities/arrival'),
  getAllCities: () => api.get('/travel/cities/all'),
};

export const paymentApi = {
  initiatePayment: (bookingId) => {
    return api.post('/payment/initiate', { bookingId });
  },
  checkPaymentStatus: (invoiceToken) => {
    return api.get(`/payment/check-status/${invoiceToken}`);
  }
};

// --- NOUVEAU : Fonctions API pour l'administration ---
// Extrait de la partie adminApi dans apiService.js

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

  // Revenus - FONCTION AJOUTÉE
  getTotalRevenue: () => api.get('/admin/revenue/total'),

   // Villes (NOUVEAU) ✨
  getCitiesCount: () => api.get('/admin/cities/count'), 
  getCitiesAdmin: () => api.get('/admin/cities'),
  getCityById: (id) => api.get(`/admin/cities/${id}`),
  createCity: (cityData) => api.post('/admin/cities', cityData),
  updateCity: (id, cityData) => api.put(`/admin/cities/${id}`, cityData),
  deleteCity: (id) => api.delete(`/admin/cities/${id}`),


    // Partenaires (nouveau ✨)
  getPartnersCount: () => api.get('/admin/partners/count'),
  getAllPartners: () => api.get('/admin/partners'),
  addPartnerDirectly: (partnerData) => api.post('/admin/partners', partnerData),
  approvePartner: (id) => api.put(`/admin/partners/${id}/approve`),
  rejectPartner: (id) => api.put(`/admin/partners/${id}/reject`),
  deletePartner: (id) => api.delete(`/admin/partners/${id}`),
  updatePartner: (id, partnerData) => api.put(`/admin/partners/${id}`, partnerData),

};




// --- Partenaires côté public ---
export const partnerApi = {
  createRequest: (formData) => api.post('/partners/request', formData),
};


export default {
  auth: authApi,
  travel: travelApi,
  payment: paymentApi,
  admin: adminApi, 
  partner: partnerApi,
};
