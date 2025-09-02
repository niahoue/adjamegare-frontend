import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import BusStationsPage from './pages/BusStationsPage';
import StationDetailPage from './pages/StationDetailPage';
import RoutesPage from './pages/RoutesPage';
import HelpPage from './pages/HelpPage';
import PrivacyPoliticsPage from './pages/PrivacyPoliticsPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import Cookies from './pages/CookiesPage';
import TravelTrackingPage from './pages/TravelTrackingPage';
import TrackDetailsPage from './pages/TrackDetailsPage';
import PartnerPage from './pages/PartnerPage';
import AdminLayout from './components/AdminLayout'; 
import AdminDashboardPage from './pages/admin/AdminDashboardPage'; 
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage'; 
import AdminRouteManagementPage from './pages/admin/AdminRouteManagementPage'; 
import AdminBusManagementPage from './pages/admin/AdminBusManagementPage'; 
import AdminBookingManagementPage from './pages/admin/AdminBookingManagementPage';
import AdminCompanyManagementPage from './pages/admin/AdminCompanyManagementPage';
import AdminCityManagementPage from './pages/admin/AdminCityManagementPage';
import AdminPartnerManagementPage from './pages/admin/AdminPartnerManagementPage'
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';

// Importez la configuration i18n et I18nextProvider
import './i18n'; // Assurez-vous que le fichier i18n.js est importé pour l'initialisation
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Importez l'instance i18n configurée

import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <I18nextProvider i18n={i18n}> 
          <AuthProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/select-seat" element={<SeatSelectionPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/confirmation-paiement/:token" element={<ConfirmationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/bus-stations" element={<BusStationsPage />} />
              <Route path="/stations/:id" element={<StationDetailPage />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/track-travel" element={<TravelTrackingPage />} />
              <Route path="/track-details/:bookingId" element={<TrackDetailsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPoliticsPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/partner" element={<PartnerPage />} />


               {/* Admin Routes (Protégées par AdminLayout) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUserManagementPage />} />
              <Route path="routes" element={<AdminRouteManagementPage />} /> 
              <Route path="buses" element={<AdminBusManagementPage />} /> 
              <Route path="bookings" element={<AdminBookingManagementPage />} /> 
              <Route path="companies" element={<AdminCompanyManagementPage />} />
              <Route path="cities" element={<AdminCityManagementPage />} />
              <Route path="partners" element={<AdminPartnerManagementPage />} />
            </Route>
            </Routes>
            <Toaster />
          </AuthProvider>
        </I18nextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
