// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/apiService'; // Importez le service API

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken')); 
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true); 

  // Fonction pour charger le profil utilisateur
  const loadUserProfile = useCallback(async () => {
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      // Le backend renvoie l'objet user sous `data`
      const res = await api.auth.getProfile(); 
      if (res.data.success) {
        setUser(res.data.data); 
        setIsAuthenticated(true);
      } else {
        // Token invalide ou expiré, déconnecter
        handleLogout();
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil utilisateur:', error);
      handleLogout(); // Déconnexion en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleLogin = async (identifier, password) => { // Accepte identifier et password
    try {
      setLoading(true);
      const credentials = { emailOrPhone: identifier, password };
      const res = await api.auth.login(credentials); // Envoie l'objet credentials

      if (res.data.success) {
        localStorage.setItem('accessToken', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user); // Le contrôleur renvoie l'objet user directement
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true, message: 'Connexion réussie!' };
      }
    } catch (error) {
      setLoading(false);
      // Correction: Meilleure extraction du message d'erreur
      let errorMessage = 'Erreur lors de la connexion.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      console.error('Erreur de connexion:', errorMessage, error); // Log l'objet error complet pour le débogage
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false); // Assurez-vous que loading est toujours défini à false
    }
  };

  const handleRegister = async (firstName, lastName, email, phoneNumber, dateOfBirth, password) => { // Accepte les champs individuels
    try {
      setLoading(true);
      const userData = { firstName, lastName, email, phone: phoneNumber, dateOfBirth, password };
      const res = await api.auth.register(userData); // Envoie l'objet userData

      if (res.data.success) {
        localStorage.setItem('accessToken', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true, message: 'Inscription réussie!' };
      }
    } catch (error) {
      setLoading(false);
      // Correction: Meilleure extraction du message d'erreur
      let errorMessage = 'Erreur lors de l\'inscription.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      console.error('Erreur d\'inscription:', errorMessage, error); // Log l'objet error complet pour le débogage
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false); // Assurez-vous que loading est toujours défini à false
    }
  };

  const handleUpdateProfile = async (userData) => {
    try {
      setLoading(true);
      const res = await api.auth.updateProfile(userData);
      if (res.data.success) {
        setUser(res.data.user); // Le contrôleur renvoie l'utilisateur mis à jour
        setLoading(false);
        return { success: true, message: 'Profil mis à jour!' };
      }
    } catch (error) {
      setLoading(false);
      let errorMessage = 'Erreur lors de la mise à jour du profil.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      console.error('Erreur de mise à jour du profil:', errorMessage, error);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false); // Assurez-vous que loading est toujours défini à false
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout(); // Appelle l'API de déconnexion pour nettoyer le cookie refreshToken
    } catch (error) {
      console.error('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    loadUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
