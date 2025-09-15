import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Eye, EyeOff, Mail, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Validation en temps réel (avec debounce pour éviter les boucles)
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'identifier':
        if (!value.trim()) {
          newErrors.identifier = t('Email ou téléphone requis');
        } else {
          delete newErrors.identifier;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = t('Mot de passe requis');
        } else if (value.length < 8) {
          newErrors.password = t('Le mot de passe doit contenir au moins 8 caractères');
        } else {
          delete newErrors.password;
        }
        break;
    }

    return newErrors;
  };

  const handleInputChange = (field, value) => {
    switch (field) {
      case 'identifier':
        setIdentifier(value);
        break;
      case 'password':
        setPassword(value);
        break;
    }

    // Validation seulement si le champ a été touché
    if (touched[field]) {
      const newErrors = validateField(field, value);
      setErrors(newErrors);
    }
  };

  const handleBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const newErrors = validateField(field, value);
    setErrors(newErrors);
  };

  const getInputIcon = (field) => {
    switch (field) {
      case 'identifier':
        return identifier.includes('@') ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />;
      case 'password':
        return <Lock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Fonction pour vérifier si le formulaire a des erreurs valides
  const hasValidationErrors = () => {
    return Object.values(errors).some(error => error && error.trim() !== '');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Marquer tous les champs comme touchés
    setTouched({ identifier: true, password: true });
    
    // Validation finale
    const finalErrors = validateField('identifier', identifier);
    Object.assign(finalErrors, validateField('password', password));
    
    if (!identifier.trim() || !password) {
      setErrors({
        ...finalErrors,
        identifier: !identifier.trim() ? t('Email ou téléphone requis') : finalErrors.identifier || '',
        password: !password ? t('Mot de passe requis') : finalErrors.password || ''
      });
      return;
    }

    if (Object.values(finalErrors).some(error => error && error.trim() !== '')) {
      setErrors(finalErrors);
      return;
    }

    setIsLoading(true);
    setErrors({}); // Effacer les erreurs précédentes

    try {
      const result = await login(identifier.trim(), password);

      if (result.success) {
        // Sauvegarder les préférences de "Se souvenir de moi"
        if (rememberMe) {
          localStorage.setItem('rememberedUser', identifier.trim());
        } else {
          localStorage.removeItem('rememberedUser');
        }

        toast({
          title: t("Connexion réussie"),
          description: t("Bienvenue sur Adjamegare !"),
          className: "bg-green-600 text-white border border-green-700 shadow-lg",
        });

        // Redirection vers la page demandée ou accueil
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        // Gestion des erreurs spécifiques
        let errorMessage = result.message || t('Une erreur s\'est produite');
        
        if (result.message && result.message.includes('banni')) {
          setErrors({ general: errorMessage });
        } else if (result.message && result.message.includes('verrouillé')) {
          setErrors({ general: errorMessage });
        } else if (result.message && (
          result.message.includes('Identifiants invalides') || 
          result.message.includes('Invalid credentials') ||
          result.message.includes('incorrect')
        )) {
          const invalidCredsMessage = t('Email/téléphone ou mot de passe incorrect');
          setErrors({ 
            general: invalidCredsMessage
          });
          errorMessage = invalidCredsMessage;
        } else {
          setErrors({ general: errorMessage });
        }

        toast({
          title: t("Erreur de connexion"),
          description: errorMessage,
          className: "bg-red-600 text-white border border-red-700 shadow-lg"
        });
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const errorMessage = t('Une erreur inattendue s\'est produite');
      setErrors({ general: errorMessage });
      toast({
        title: t("Erreur"),
        description: t("Une erreur inattendue s'est produite. Veuillez réessayer."),
        className: "bg-red-600 text-white border border-red-700 shadow-lg"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger l'utilisateur mémorisé au montage
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setIdentifier(rememberedUser);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-white text-black shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t('login')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('connect_to_your_account')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errors.general && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                {t('email_or_phone')}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  {getInputIcon('identifier')}
                </div>
                <Input
                  id="identifier"
                  type="text"
                  placeholder={t('email_or_phone_placeholder')}
                  value={identifier}
                  onChange={(e) => handleInputChange('identifier', e.target.value)}
                  onBlur={(e) => handleBlur('identifier', e.target.value)}
                  className={`pl-10 ${errors.identifier ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
                  required
                  autoComplete="username"
                />
              </div>
              {errors.identifier && (
                <p className="text-sm text-red-600 mt-1">{errors.identifier}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('password')}
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
                >
                  {t('forgot_password')}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={(e) => handleBlur('password', e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
                  required
                  autoComplete="current-password"
                />
                <button
                  aria-label={showPassword ? t('hide_password') : t('show_password')}
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                {t('remember_me')}
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#e85805] hover:bg-[#F46A21] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200" 
              disabled={isLoading || hasValidationErrors()}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('logging_in')}
                </div>
              ) : (
                t('log_in')
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600">
          {t('no_account_yet')}{" "}
          <Link 
            to="/register" 
            className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
          >
            {t('register')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;