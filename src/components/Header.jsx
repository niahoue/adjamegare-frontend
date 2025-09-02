import React from 'react';
import { ChevronDown, User, Globe, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '../hooks/use-toast'; // ✅ pour afficher les toasts

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  // Fonction pour obtenir le nom affichable de la langue
  const getLanguageDisplayName = (code) => {
    switch (code) {
      case 'fr': return 'Français';
      case 'en': return 'English';
      case 'es': return 'Español';
      default: return 'Français';
    }
  };

  // Fonction pour changer la langue
  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  // ✅ Redirection + toast de bienvenue
  const handleAccountClick = () => {
    if (user?.role === 'admin') {
      toast({
        title: t("Bienvenue Administrateur"),
        description: t("Accès au tableau de bord"),
        className: "bg-green-600 text-white border border-green-700 shadow-lg",
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: t("Bienvenue"),
        description: user?.firstName ? `${user.firstName}` : t("Accès au profil"),
        className: "bg-orange-500 text-white border border-orange-600 shadow-lg",
      });
      navigate('/profile');
    }
  };

  return (
    <header className="bg-[#e85805] text-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold">ADJAMEGARE</Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-white hover:text-green-100 transition-colors">
                <span>{t('plan_your_trip')}</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 bg-white text-black">
                <DropdownMenuItem><Link to="/search">{t('search_a_trip')}</Link></DropdownMenuItem>
                <DropdownMenuItem><Link to="/bus-stations">{t('bus_stations')}</Link></DropdownMenuItem>
                <DropdownMenuItem><Link to="/routes">{t('routes')}</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/track-travel" className="text-white hover:text-green-100 transition-colors">
              {t('track_travel')}
            </Link>
            
            <Link to="/help" className="text-white hover:text-green-100 transition-colors">
              {t('help')}
            </Link>
          </nav>

          {/* Right side - Language and User */}
          <div className="flex items-center space-x-4">
            {/* Sélecteur de langue */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 text-white hover:text-green-100 transition-colors">
                <Globe className="w-4 h-4" />
                <span>{getLanguageDisplayName(i18n.language)}</span>
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 bg-white text-black">
                <DropdownMenuItem onClick={() => handleLanguageChange('fr')}>Français</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('es')}>Español</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Compte utilisateur */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-green-100 hover:bg-green-600 transition-all duration-200"
                    onClick={handleAccountClick}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user?.name || user?.email || t('my_account')}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-2 bg-white text-black">
                  {/* ✅ Item conditionnel : Dashboard si admin, Profil sinon */}
                  <DropdownMenuItem>
                    {user?.role === 'admin' ? (
                      <Link to="/admin/dashboard">{t('dashboard')}</Link>
                    ) : (
                      <Link to="/profile">{t('my_profile')}</Link>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" /> {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                className="text-white hover:text-green-100 hover:bg-green-600 transition-all duration-200"
                onClick={() => navigate('/login')}
              >
                <User className="w-4 h-4 mr-2" />
                {t('register_login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
