import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Globe } from 'lucide-react';
import api from '../services/apiService';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from 'react-i18next';

const BrandsSection = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.travel.getCompanies();

      if (res.data.success) {
        setCompanies(res.data.data);
      } else {
        setError(res.data.message || t('error_fetching_companies') || 'Erreur lors du chargement des compagnies');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des compagnies:', err);
      const errorMessage = err.response?.data?.message || err.message || t('error_fetching_companies_server') || 'Erreur serveur lors du chargement des compagnies';
      setError(errorMessage);
      
      // Afficher un toast d'erreur seulement si ce n'est pas un problème de réseau silencieux
      if (!err.code || err.code !== 'ERR_NETWORK') {
        toast({
          title: t('error') || 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCompanyClick = (companyId, companyName) => {
    // Rediriger vers la page de la station de la compagnie
    navigate(`/stations/${companyId}`, { 
      state: { companyName } 
    });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('our_partners') || 'Nos Partenaires'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-2xl mx-auto">
              {t('trusted_transport_companies') || 'Compagnies de transport de confiance'}
            </p>
          </div>
          
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85805] mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Chargement des compagnies...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {t('our_partners') || 'Nos Partenaires'}
            </h2>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <Building2 className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm mb-4">{error}</p>
              <button 
                onClick={fetchCompanies}
                className="px-6 py-2 bg-[#e85805] text-white rounded-lg hover:bg-[#f46a21] transition-colors duration-200"
              >
                {t('retry') || 'Réessayer'}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (companies.length === 0) {
    return null; 
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 relative overflow-hidden ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 ">
            {t('our_partners') || 'Nos Partenaires'}
          </h2>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto text-lg">
            {t('partners_description') || 'Découvrez nos compagnies partenaires qui vous offrent des services de transport fiables et confortables dans tout le pays.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {companies.map((company) => (
            <div 
              key={company._id}
              onClick={() => handleCompanyClick(company._id, company.name)}
              className="group cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#e85805] hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                {/* Logo de la compagnie */}
                <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-700 group-hover:bg-[#e85805]/10 dark:group-hover:bg-[#e85805]/20 transition-colors duration-300">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={`Logo ${company.name}`}
                      className="w-14 h-14 object-contain rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br from-[#73D700] to-[#5CB800]  text-white flex items-center justify-center font-bold text-xl shadow-lg ${company.logo ? 'hidden' : 'block'}`}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Nom de la compagnie */}
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#e85805] transition-colors duration-300 text-base mb-2 line-clamp-2">
                  {company.name}
                </h3>

                {/* Description courte si disponible */}
                {company.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                    {company.description.length > 60 
                      ? `${company.description.substring(0, 60)}...`
                      : company.description
                    }
                  </p>
                )}

                {/* Informations de contact condensées */}
                <div className="w-full space-y-1 mb-3 text-xs text-gray-500 dark:text-gray-400">
                  {company.address && (
                    <div className="flex items-center justify-center">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{company.address.length > 30 ? `${company.address.substring(0, 30)}...` : company.address}</span>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div className="flex items-center justify-center">
                      <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  
                  {company.email && (
                    <div className="flex items-center justify-center">
                      <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex items-center justify-center">
                      <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="text-[#e85805]">Site web</span>
                    </div>
                  )}
                </div>

                {/* Indicateur de clic */}
                <div className="mt-auto">
                  <div className="px-4 py-2 bg-gradient-to-r from-[#e85805] to-[#f46a21] text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    {t('view_station') || 'Voir la station'} →
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message d'information et statistiques */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('click_to_explore') || 'Cliquez sur une compagnie pour explorer ses services et destinations'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#73D700] mb-2">{companies.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Compagnie{companies.length > 1 ? 's' : ''} partenaire{companies.length > 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-[#73D700] mb-2">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Service client disponible
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-[#73D700] mb-2">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Compagnies certifiées
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;