import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { Calendar as CalendarIcon, MapPin, ArrowRightLeft, Clock, Building, Users, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale'
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/apiService';

const HeroSection = () => {
  const [tripType, setTripType] = useState('oneWay');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  const [passengers, setPassengers] = useState('1 Adult');
  const [departureTime, setDepartureTime] = useState('08:00');
  const [companyName, setCompanyName] = useState('');

  // États pour les filtres de villes
  const [fromSearchTerm, setFromSearchTerm] = useState('');
  const [toSearchTerm, setToSearchTerm] = useState('');
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  // Charger la liste des villes au montage
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoadingCities(true);
        const response = await api.travel.getAllCities();
        if (response.data.success && response.data.data) {
          setCities(response.data.data);
          if (response.data.data.includes('Abidjan')) {
            setFromLocation('Abidjan');
          }
          if (response.data.data.includes('Yamoussoukro')) {
            setToLocation('Yamoussoukro');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des villes:', error);
        const fallbackCities = ['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Daloa', 'Korhogo', 'Man', 'Gagnoa'];
        setCities(fallbackCities);
        setFromLocation('Abidjan');
        setToLocation('Yamoussoukro');
      } finally {
        setIsLoadingCities(false);
      }
    };
    loadCities();
  }, []);

  // Charger la liste des compagnies au montage
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const response = await api.travel.getCompanies();
        if (response.data.success && response.data.data) {
          const companyNames = response.data.data.map(c => {
            if (typeof c === 'string') return c;
            return c.name || c;
          });
          setCompanies(companyNames);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des compagnies:", error);
        setCompanies(['SOTRA', 'UTB', 'CTA', 'TCV', 'Groupe RTI', 'Bus Ivoire']);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  // Gestion des clics en dehors pour fermer les dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target)) {
        setFromDropdownOpen(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target)) {
        setToDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les villes en fonction du terme de recherche
  const getFilteredFromCities = useCallback(() => {
    const availableCities = cities.filter(city => city !== toLocation);
    if (!fromSearchTerm) return availableCities;
    return availableCities.filter(city => 
      city.toLowerCase().includes(fromSearchTerm.toLowerCase())
    );
  }, [cities, toLocation, fromSearchTerm]);

  const getFilteredToCities = useCallback(() => {
    const availableCities = cities.filter(city => city !== fromLocation);
    if (!toSearchTerm) return availableCities;
    return availableCities.filter(city => 
      city.toLowerCase().includes(toSearchTerm.toLowerCase())
    );
  }, [cities, fromLocation, toSearchTerm]);

  const handleSwapLocations = useCallback(() => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
    setFromSearchTerm('');
    setToSearchTerm('');
  }, [fromLocation, toLocation]);

  const handleFromLocationSelect = useCallback((city) => {
    setFromLocation(city);
    setFromSearchTerm('');
    setFromDropdownOpen(false);
    if (city === toLocation) {
      setToLocation('');
    }
  }, [toLocation]);

  const handleToLocationSelect = useCallback((city) => {
    setToLocation(city);
    setToSearchTerm('');
    setToDropdownOpen(false);
    if (city === fromLocation) {
      setFromLocation('');
    }
  }, [fromLocation]);

const handleFromInputChange = useCallback((e) => {
    const value = e.target.value;
    setFromSearchTerm(value);
    setFromDropdownOpen(true);

    if (value === '') {
      setFromLocation('');
    }
  }, []);

  const handleToInputChange = useCallback((e) => {
    const value = e.target.value;
    setToSearchTerm(value);
    setToDropdownOpen(true);

    if (value === '') {
      setToLocation('');
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (isSearching || !fromLocation || !toLocation) return;
    setIsSearching(true);

    try {
      const searchData = {
        from: fromLocation,
        to: toLocation,
        departureDate: departureDate.toISOString(),
        returnDate: tripType === 'roundTrip' && returnDate ? returnDate.toISOString() : null,
        passengers,
        tripType,
        departureTime: departureTime !== '08:00' ? departureTime : 'all',
        companyName: companyName || 'all',
      };

      await new Promise(resolve => setTimeout(resolve, 100));
      
      navigate('/search', {
        state: searchData
      });
    } catch (error) {
      console.error('Erreur de navigation:', error);
    } finally {
      setIsSearching(false);
    }
  }, [navigate, fromLocation, toLocation, departureDate, returnDate, passengers, tripType, departureTime, companyName, isSearching]);

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const isSearchDisabled = isSearching || !fromLocation || !toLocation || isLoadingCities;

  // Composant de sélection de ville avec filtre personnalisé
  const CitySelector = ({ 
    label, 
    placeholder, 
    value, 
    searchTerm, 
    onInputChange, 
    onCitySelect, 
    filteredCities, 
    dropdownOpen, 
    setDropdownOpen,
    disabled,
    inputRef,
    dropdownRef
  }) => (
    <div className="flex-1 space-y-2" ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-20" />
        <input
          ref={inputRef}
          type="text"
          placeholder={disabled ? 'Chargement...' : placeholder}
          value={value || searchTerm}
          onChange={onInputChange}
          onFocus={() => setDropdownOpen(true)}
          disabled={disabled}
          className="h-12 w-full pl-10 pr-10 border border-gray-300 rounded-md focus:border-[#73D700] focus:ring-1 focus:ring-[#73D700] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        
        {/* Dropdown personnalisé */}
        {dropdownOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map(city => (
                <div
                  key={city}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  onClick={() => onCitySelect(city)}
                >
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    {city}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                Aucune ville trouvée
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="relative min-h-[500px] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/heroImage.webp')`
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {t('hero_title') || 'Réservez votre voyage facilement'}
          </h1>
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-2xl p-6 md:p-8 mb-4">
          {/* Types de trajet */}
          <div className="flex items-center space-x-6 mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="oneWay"
                checked={tripType === 'oneWay'}
                onChange={(e) => setTripType(e.target.value)}
                className="w-4 h-4 text-[#73D700] border-gray-300 focus:ring-[#73D700]"
              />
              <span className="text-gray-700 font-medium">{t('one_way') || 'Aller simple'}</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="roundTrip"
                checked={tripType === 'roundTrip'}
                onChange={(e) => setTripType(e.target.value)}
                className="w-4 h-4 text-[#73D700] border-gray-300 focus:ring-[#73D700]"
              />
              <span className="text-gray-700 font-medium">{t('round_trip') || 'Aller-retour'}</span>
            </label>
          </div>

          {/* Première ligne : De, Vers et Date de départ */}
          <div className="flex flex-col lg:flex-row gap-4 items-end mb-4">
            {/* From Location avec filtre */}
            <CitySelector
              label={t('from_location_label') || 'De'}
              placeholder={t('from_location_placeholder') || 'Tapez pour rechercher une ville de départ'}
              value={fromLocation}
              searchTerm={fromSearchTerm}
              onInputChange={handleFromInputChange}
              onCitySelect={handleFromLocationSelect}
              filteredCities={getFilteredFromCities()}
              dropdownOpen={fromDropdownOpen}
              setDropdownOpen={setFromDropdownOpen}
              disabled={isSearching || isLoadingCities}
              inputRef={fromInputRef}
              dropdownRef={fromDropdownRef}
            />

            {/* Swap Button */}
            <div className="flex justify-center items-end pb-1 lg:pb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSwapLocations}
                className="p-2 text-gray-500 hover:text-[#73D700] hover:bg-green-50 rounded-full transition-all duration-200 border border-gray-200 hover:border-[#73D700] mx-1"
                disabled={isSearching || isLoadingCities || !fromLocation || !toLocation}
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* To Location avec filtre */}
            <CitySelector
              label={t('to_location_label') || 'Vers'}
              placeholder={t('to_location_placeholder') || "Tapez pour rechercher une ville d'arrivée"}
              value={toLocation}
              searchTerm={toSearchTerm}
              onInputChange={handleToInputChange}
              onCitySelect={handleToLocationSelect}
              filteredCities={getFilteredToCities()}
              dropdownOpen={toDropdownOpen}
              setDropdownOpen={setToDropdownOpen}
              disabled={isSearching || isLoadingCities}
              inputRef={toInputRef}
              dropdownRef={toDropdownRef}
            />

            {/* Departure Date */}
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('departure_date_label') || 'Date de départ'}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 w-full justify-start text-left font-normal border-gray-300 hover:border-[#73D700]",
                      !departureDate && "text-muted-foreground"
                    )}
                    disabled={isSearching}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "dd/MM/yyyy", { locale: fr }) : <span>{t('choose_date') || 'Choisir une date'}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-md border z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                    locale={fr}
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Deuxième ligne : Date de retour (uniquement pour aller-retour) */}
          {tripType === 'roundTrip' && (
            <div className="mb-4">
              <div className="max-w-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('return_date_label') || 'Date de retour'}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-12 w-full justify-start text-left font-normal border-gray-300 hover:border-[#73D700]",
                        !returnDate && "text-muted-foreground"
                      )}
                      disabled={isSearching}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, "dd/MM/yyyy", { locale: fr }) : <span>{t('choose_date') || 'Choisir une date'}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-md border z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      initialFocus
                      locale={fr}
                      fromDate={departureDate || new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Ligne 3 : heure, compagnie, passagers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
            {/* Heure */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('departure_time_label') || 'Heure'}</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Select value={departureTime} onValueChange={setDepartureTime} disabled={isSearching}>
                  <SelectTrigger className="h-12 w-full pl-10 border-gray-300 focus:border-[#73D700] focus:ring-[#73D700]">
                    <SelectValue placeholder={t('select_departure_time') || 'Sélectionner'} />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-48">
                    {generateTimeOptions().map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Compagnie */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('company_name_label') || 'Compagnie'}</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Select 
                  value={companyName} 
                  onValueChange={setCompanyName} 
                  disabled={isSearching || isLoadingCompanies}
                >
                  <SelectTrigger className="h-12 w-full pl-10 border-gray-300 focus:border-[#73D700] focus:ring-[#73D700]">
                    <SelectValue placeholder={isLoadingCompanies ? 'Chargement...' : (t('company_name_placeholder') || 'Toutes les compagnies')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-48">
                    <SelectItem value="all">{t('all_companies') || 'Toutes les compagnies'}</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Passagers */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('passengers_label') || 'Passagers'}</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Select value={passengers} onValueChange={setPassengers} disabled={isSearching}>
                  <SelectTrigger className="h-12 w-full pl-10 border-gray-300 focus:border-[#73D700] focus:ring-[#73D700]">
                    <SelectValue placeholder={t('select_passengers_placeholder') || 'Sélectionner'} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1 Adult">{t('1_adult') || '1 Adulte'}</SelectItem>
                    <SelectItem value="2 Adults">{t('2_adults') || '2 Adultes'}</SelectItem>
                    <SelectItem value="3 Adults">{t('3_adults') || '3 Adultes'}</SelectItem>
                    <SelectItem value="4 Adults">{t('4_adults') || '4 Adultes'}</SelectItem>
                    <SelectItem value="1 Adult, 1 Child">{t('1_adult_1_child') || '1 Adulte, 1 Enfant'}</SelectItem>
                    <SelectItem value="2 Adults, 1 Child">{t('2_adults_1_child') || '2 Adultes, 1 Enfant'}</SelectItem>
                    <SelectItem value="2 Adults, 2 Children">{t('2_adults_2_children') || '2 Adultes, 2 Enfants'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Bouton recherche */}
          <div className="flex justify-center lg:justify-end">
            <Button
              onClick={handleSearch}
              disabled={isSearchDisabled}
              className="bg-[#73D700] hover:bg-[#5CB800] text-white px-12 py-3 text-lg font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[200px]"
            >
              {isLoadingCities 
                ? 'Chargement...' 
                : isSearching 
                  ? (t('searching') || 'Recherche...') 
                  : (t('search') || 'Rechercher')
              }
            </Button>
          </div>

          {/* Message d'aide si les deux villes ne sont pas sélectionnées */}
          {(!fromLocation || !toLocation) && !isLoadingCities && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                {!fromLocation && !toLocation 
                  ? 'Veuillez sélectionner une ville de départ et une ville d\'arrivée'
                  : !fromLocation 
                    ? 'Veuillez sélectionner une ville de départ'
                    : 'Veuillez sélectionner une ville d\'arrivée'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;