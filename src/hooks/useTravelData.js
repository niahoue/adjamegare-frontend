import { useEffect, useState, useCallback } from "react";
import api from "../services/apiService";

// Cache global partagé entre tous les composants
let globalCache = {
  cities: {
    data: null,
    timestamp: null,
    loading: false
  },
  companies: {
    data: null,
    timestamp: null,
    loading: false
  }
};

// Durée de cache en millisecondes (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

// Queue des promesses pour éviter les appels concurrents
let pendingRequests = {
  cities: null,
  companies: null
};

export default function useTravelData() {
  const [cities, setCities] = useState(globalCache.cities.data || []);
  const [companies, setCompanies] = useState(globalCache.companies.data || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Vérifier si le cache est valide
  const isCacheValid = useCallback((cacheItem) => {
    if (!cacheItem.data || !cacheItem.timestamp) return false;
    return Date.now() - cacheItem.timestamp < CACHE_DURATION;
  }, []);

  // Charger les villes avec cache et déduplication
  const loadCities = useCallback(async () => {
    // Si cache valide, utiliser les données existantes
    if (isCacheValid(globalCache.cities)) {
      setCities(globalCache.cities.data);
      return globalCache.cities.data;
    }

    // Si une requête est déjà en cours, attendre le résultat
    if (pendingRequests.cities) {
      const result = await pendingRequests.cities;
      setCities(result);
      return result;
    }

    // Nouvelle requête
    globalCache.cities.loading = true;
    
    try {
      pendingRequests.cities = api.travel.getAllCities()
        .then(response => {
          let citiesData = [];
          
          if (response.data.success && response.data.data) {
            citiesData = Array.isArray(response.data.data) 
              ? response.data.data 
              : [];
          }

          // Fallback avec villes par défaut si aucune donnée
          if (citiesData.length === 0) {
            console.warn('Aucune ville reçue de l\'API, utilisation des villes par défaut');
            citiesData = [
              'Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 
              'Daloa', 'Korhogo', 'Man', 'Gagnoa', 'Divo', 'Anyama'
            ];
          }

          // Mettre à jour le cache global
          globalCache.cities = {
            data: citiesData,
            timestamp: Date.now(),
            loading: false
          };

          return citiesData;
        });

      const result = await pendingRequests.cities;
      setCities(result);
      return result;

    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error);
      
      // Utiliser les villes par défaut en cas d'erreur
      const fallbackCities = [
        'Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 
        'Daloa', 'Korhogo', 'Man', 'Gagnoa', 'Divo', 'Anyama'
      ];
      
      globalCache.cities = {
        data: fallbackCities,
        timestamp: Date.now(),
        loading: false
      };
      
      setCities(fallbackCities);
      return fallbackCities;

    } finally {
      globalCache.cities.loading = false;
      pendingRequests.cities = null;
    }
  }, [isCacheValid]);

  // Charger les compagnies avec cache et déduplication
  const loadCompanies = useCallback(async () => {
    // Si cache valide, utiliser les données existantes
    if (isCacheValid(globalCache.companies)) {
      setCompanies(globalCache.companies.data);
      return globalCache.companies.data;
    }

    // Si une requête est déjà en cours, attendre le résultat
    if (pendingRequests.companies) {
      const result = await pendingRequests.companies;
      setCompanies(result);
      return result;
    }

    // Nouvelle requête
    globalCache.companies.loading = true;

    try {
      pendingRequests.companies = api.travel.getCompanies()
        .then(response => {
          let companiesData = [];
          
          if (response.data.success && response.data.data) {
            companiesData = response.data.data.map(company => {
              if (typeof company === 'string') return company;
              return company.name || company;
            }).filter(Boolean);
          }

          // Fallback avec compagnies par défaut si aucune donnée
          if (companiesData.length === 0) {
            console.warn('Aucune compagnie reçue de l\'API, utilisation des compagnies par défaut');
            companiesData = [
              'SOTRA', 'UTB', 'CTA', 'TCV', 'Groupe RTI', 
              'Bus Ivoire', 'STIF', 'Taxi Brousse'
            ];
          }

          // Mettre à jour le cache global
          globalCache.companies = {
            data: companiesData,
            timestamp: Date.now(),
            loading: false
          };

          return companiesData;
        });

      const result = await pendingRequests.companies;
      setCompanies(result);
      return result;

    } catch (error) {
      console.error('Erreur lors du chargement des compagnies:', error);
      
      // Utiliser les compagnies par défaut en cas d'erreur
      const fallbackCompanies = [
        'SOTRA', 'UTB', 'CTA', 'TCV', 'Groupe RTI', 
        'Bus Ivoire', 'STIF', 'Taxi Brousse'
      ];
      
      globalCache.companies = {
        data: fallbackCompanies,
        timestamp: Date.now(),
        loading: false
      };
      
      setCompanies(fallbackCompanies);
      return fallbackCompanies;

    } finally {
      globalCache.companies.loading = false;
      pendingRequests.companies = null;
    }
  }, [isCacheValid]);

  // Précharger les données au montage
  useEffect(() => {
    const preloadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Charger en parallèle si pas de cache valide
        const promises = [];
        
        if (!isCacheValid(globalCache.cities)) {
          promises.push(loadCities());
        } else {
          setCities(globalCache.cities.data);
        }
        
        if (!isCacheValid(globalCache.companies)) {
          promises.push(loadCompanies());
        } else {
          setCompanies(globalCache.companies.data);
        }

        // Attendre le chargement de toutes les données manquantes
        if (promises.length > 0) {
          await Promise.allSettled(promises);
        }

      } catch (error) {
        console.error('Erreur lors du préchargement:', error);
        setError(error.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    preloadData();
  }, [loadCities, loadCompanies, isCacheValid]);

  // Fonction pour forcer le rechargement
  const refreshData = useCallback(async () => {
    // Invalider le cache
    globalCache.cities = { data: null, timestamp: null, loading: false };
    globalCache.companies = { data: null, timestamp: null, loading: false };
    
    setLoading(true);
    setError(null);

    try {
      await Promise.allSettled([
        loadCities(),
        loadCompanies()
      ]);
    } catch (error) {
      setError(error.message || 'Erreur lors du rechargement');
    } finally {
      setLoading(false);
    }
  }, [loadCities, loadCompanies]);

  // Fonction pour obtenir des statistiques sur le cache
  const getCacheStats = useCallback(() => {
    return {
      cities: {
        cached: !!globalCache.cities.data,
        age: globalCache.cities.timestamp ? Date.now() - globalCache.cities.timestamp : null,
        count: globalCache.cities.data ? globalCache.cities.data.length : 0
      },
      companies: {
        cached: !!globalCache.companies.data,
        age: globalCache.companies.timestamp ? Date.now() - globalCache.companies.timestamp : null,
        count: globalCache.companies.data ? globalCache.companies.data.length : 0
      }
    };
  }, []);

  return {
    // Données principales
    cities,
    companies,
    loading: loading || globalCache.cities.loading || globalCache.companies.loading,
    error,
    
    // Fonctions utilitaires
    refreshData,
    loadCities,
    loadCompanies,
    getCacheStats,
    
    // États du cache
    isCitiesCached: isCacheValid(globalCache.cities),
    isCompaniesCached: isCacheValid(globalCache.companies),
    
    // Informations de debug
    isReady: !loading && cities.length > 0 && companies.length > 0,
    lastUpdate: {
      cities: globalCache.cities.timestamp,
      companies: globalCache.companies.timestamp
    }
  };
}

// Export de fonctions utilitaires pour usage global
export const preloadTravelData = async () => {
  console.log('🚀 Préchargement global des données de voyage...');
  
  try {
    const promises = [];
    
    // Précharger les villes si pas en cache
    if (!globalCache.cities.data || Date.now() - globalCache.cities.timestamp > CACHE_DURATION) {
      promises.push(
        api.travel.getAllCities().then(response => {
          if (response.data.success && response.data.data) {
            globalCache.cities = {
              data: response.data.data,
              timestamp: Date.now(),
              loading: false
            };
          }
        })
      );
    }

    // Précharger les compagnies si pas en cache
    if (!globalCache.companies.data || Date.now() - globalCache.companies.timestamp > CACHE_DURATION) {
      promises.push(
        api.travel.getCompanies().then(response => {
          if (response.data.success && response.data.data) {
            const companiesData = response.data.data.map(c => 
              typeof c === 'string' ? c : c.name || c
            ).filter(Boolean);
            
            globalCache.companies = {
              data: companiesData,
              timestamp: Date.now(),
              loading: false
            };
          }
        })
      );
    }

    await Promise.allSettled(promises);
    console.log('✅ Données de voyage préchargées avec succès');
    
  } catch (error) {
    console.warn('⚠️ Erreur lors du préchargement:', error);
  }
};

// Fonction pour nettoyer le cache
export const clearTravelDataCache = () => {
  globalCache = {
    cities: { data: null, timestamp: null, loading: false },
    companies: { data: null, timestamp: null, loading: false }
  };
  pendingRequests = { cities: null, companies: null };
  console.log('🗑️ Cache des données de voyage nettoyé');
};

// Fonction pour obtenir l'état du cache
export const getTravelDataCacheState = () => {
  return {
    cities: {
      cached: !!globalCache.cities.data,
      count: globalCache.cities.data ? globalCache.cities.data.length : 0,
      age: globalCache.cities.timestamp ? Date.now() - globalCache.cities.timestamp : null
    },
    companies: {
      cached: !!globalCache.companies.data,
      count: globalCache.companies.data ? globalCache.companies.data.length : 0,
      age: globalCache.companies.timestamp ? Date.now() - globalCache.companies.timestamp : null
    }
  };
};