import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { CalendarIcon, Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { format,  subYears, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: null,
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validation en temps réel
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = t('Le prénom est requis');
        } else if (value.trim().length < 2) {
          newErrors.firstName = t('Le prénom doit contenir au moins 2 caractères');
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = t('Le nom est requis');
        } else if (value.trim().length < 2) {
          newErrors.lastName = t('Le nom doit contenir au moins 2 caractères');
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'email':
        if (value && !/^\S+@\S+\.\S+$/.test(value)) {
          newErrors.email = t('Format d\'email invalide');
        } else {
          delete newErrors.email;
        }
        break;

      case 'phoneNumber':
        if (value) {
          const cleanNumber = value.replace(/\s|-|\(|\)/g, '').replace(/^\+225/, '');
          if (!/^(01|05|07|21|25|27)\d{8}$/.test(cleanNumber)) {
            newErrors.phoneNumber = t('Numéro de téléphone ivoirien invalide');
          } else {
            delete newErrors.phoneNumber;
          }
        } else {
          delete newErrors.phoneNumber;
        }
        break;

      case 'dateOfBirth':
        if (!value) {
          newErrors.dateOfBirth = t('La date de naissance est requise');
        } else {
          const age = differenceInYears(new Date(), value);
          if (age < 18) {
            newErrors.dateOfBirth = t('Vous devez avoir au moins 18 ans');
          } else if (age > 120) {
            newErrors.dateOfBirth = t('Date de naissance invalide');
          } else {
            delete newErrors.dateOfBirth;
          }
        }
        break;

      case 'password': {
        const strength = calculatePasswordStrength(value);
        setPasswordStrength(strength);
        
        if (!value) {
          newErrors.password = t('Le mot de passe est requis');
        } else if (value.length < 8) {
          newErrors.password = t('Le mot de passe doit contenir au moins 8 caractères');
        } else if (value.toLowerCase().includes('password')) {
          newErrors.password = t('Le mot de passe ne peut pas contenir "password"');
        } else if (strength < 3) {
          newErrors.password = t('Le mot de passe est trop faible');
        } else {
          delete newErrors.password;
        }
        break;
      }

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = t('Veuillez confirmer le mot de passe');
        } else if (value !== formData.password) {
          newErrors.confirmPassword = t('Les mots de passe ne correspondent pas');
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    // Validation que au moins email ou téléphone est fourni
    if ((field === 'email' || field === 'phoneNumber')) {
      if (!formData.email && !formData.phoneNumber && !value) {
        newErrors.contact = t('Veuillez fournir au moins un email ou un numéro de téléphone');
      } else {
        delete newErrors.contact;
      }
    }

    setErrors(newErrors);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return { label: t('Très faible'), color: 'bg-red-500' };
      case 2: return { label: t('Faible'), color: 'bg-orange-500' };
      case 3: return { label: t('Moyen'), color: 'bg-yellow-500' };
      case 4: return { label: t('Fort'), color: 'bg-green-500' };
      case 5: return { label: t('Très fort'), color: 'bg-green-600' };
      default: return { label: '', color: 'bg-gray-300' };
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return !errors.firstName && !errors.lastName && formData.firstName && formData.lastName;
      case 2:
        return (!errors.email && !errors.phoneNumber && !errors.contact && 
                (formData.email || formData.phoneNumber) && 
                !errors.dateOfBirth && formData.dateOfBirth);
      case 3:
        return (!errors.password && !errors.confirmPassword && 
                formData.password && formData.confirmPassword && acceptTerms);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation finale
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'password', 'confirmPassword'];
    const hasRequiredFields = requiredFields.every(field => 
      field === 'dateOfBirth' ? formData[field] : formData[field]?.trim()
    );
    
    if (!hasRequiredFields || (!formData.email && !formData.phoneNumber)) {
      toast({
        title: t("Champs requis"),
        description: t("Veuillez remplir tous les champs obligatoires."),
        className: "bg-red-600 text-white border border-red-700 shadow-lg"
      });
      return;
    }

    if (Object.keys(errors).length > 0) {
      toast({
        title: t("Erreurs de validation"),
        description: t("Veuillez corriger les erreurs avant de continuer."),
        className: "bg-red-600 text-white border border-red-700 shadow-lg",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: t("Conditions d'utilisation"),
        description: t("Veuillez accepter les conditions d'utilisation."),
        className: "bg-red-600 text-white border border-red-700 shadow-lg"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.email || '',
        formData.phoneNumber || '',
        formData.dateOfBirth.toISOString(),
        formData.password
      );

      if (result.success) {
        toast({
          title: t("Inscription réussie"),
          description: t("Votre compte a été créé. Vous êtes maintenant connecté."),
          className: "bg-green-600 text-white border border-green-700 shadow-lg"
        });
        navigate('/');
      } else {
        // Gestion des erreurs spécifiques
        if (result.message.includes('email')) {
          setErrors({ email: result.message });
        } else if (result.message.includes('téléphone')) {
          setErrors({ phoneNumber: result.message });
        } else {
          setErrors({ general: result.message });
        }

        toast({
          title: t("Erreur d'inscription"),
          description: result.message,
          className: "bg-red-600 text-white border border-red-700 shadow-lg"
        });
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setErrors({ general: t('Une erreur inattendue s\'est produite') });
      toast({
        title: t("Erreur"),
        description: t("Une erreur inattendue s'est produite. Veuillez réessayer."),
        className: "bg-red-600 text-white border border-red-700 shadow-lg"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDateOfBirth = formData.dateOfBirth ? 
    format(formData.dateOfBirth, 'PPP', { locale: fr }) : t('Choisir une date');
  const maxDate = subYears(new Date(), 18);
  const minDate = subYears(new Date(), 120);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  {t('first_name')} *
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder={t('first_name')}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`pl-10 ${errors.firstName ? 'border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
                    required
                    autoComplete="given-name"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  {t('last_name')} *
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={t('last_name')}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`pl-10 ${errors.lastName ? 'border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
                    required
                    autoComplete="family-name"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t('Veuillez fournir au moins un email ou un numéro de téléphone.')}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {t('email')}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('email')}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                {t('phone_number')}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="h-4 w-4" />
                </div>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder={t('phone_number')}
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`pl-10 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
                  autoComplete="tel"
                />
              </div>
              <p className="text-xs text-gray-500">{t('Format: 07 00 00 00 00 ou +225 07 00 00 00 00')}</p>
              {errors.phoneNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            {errors.contact && (
              <p className="text-sm text-red-600">{errors.contact}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                {t('date_of_birth')} *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground",
                      errors.dateOfBirth && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formattedDateOfBirth}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) => handleInputChange('dateOfBirth', date)}
                    initialFocus
                    locale={fr}
                    captionLayout="dropdown"
                    fromYear={minDate.getFullYear()}
                    toYear={maxDate.getFullYear()}
                    disabled={(date) => date > maxDate || date < minDate}
                  />
                </PopoverContent>
              </Popover>
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {t('password')} *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
                  required
                  autoComplete="new-password"
                />
                <button
                  aria-label={showPassword ? t('hide_password') : t('show_password')}
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Indicateur de force du mot de passe */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Progress 
                        value={(passwordStrength / 5) * 100} 
                        className="h-2"
                      />
                    </div>
                    <span className={`text-xs font-medium ${getPasswordStrengthLabel().color.replace('bg-', 'text-')}`}>
                      {getPasswordStrengthLabel().label}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    <ul className="space-y-1">
                      <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('Au moins 8 caractères')}
                      </li>
                      <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('Une lettre minuscule')}
                      </li>
                      <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('Une lettre majuscule')}
                      </li>
                      <li className={`flex items-center ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('Un chiffre')}
                      </li>
                      <li className={`flex items-center ${/[^a-zA-Z\d]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('Un caractère spécial')}
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                {t('confirm_password')} *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
                  required
                  autoComplete="new-password"
                />
                <button
                  aria-label={showConfirmPassword ? t('hide_password') : t('show_password')}
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
              />
              <div className="text-sm">
                <Label htmlFor="acceptTerms" className="text-gray-700 cursor-pointer">
                  {t('J\'accepte les')}{' '}
                  <Link 
                    to="/conditions" 
                    className="text-orange-600 hover:text-orange-700 font-medium underline"
                  >
                    {t('conditions d\'utilisation')}
                  </Link>
                  {' '}{t('et la')}{' '}
                  <Link 
                    to="/privacy" 
                    className="text-orange-600 hover:text-orange-700 font-medium underline"
                  >
                    {t('politique de confidentialité')}
                  </Link>
                </Label>
              </div>
            </div>

            {!acceptTerms && currentStep === 3 && (
              <p className="text-sm text-red-600">
                {t('Veuillez accepter les conditions d\'utilisation pour continuer')}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return t('Informations personnelles');
      case 2: return t('Contact et naissance');
      case 3: return t('Sécurité du compte');
      default: return t('Inscription');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('Créer un compte')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('Rejoignez notre communauté')}
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('Étape')} {currentStep} {t('sur')} 3
            </CardDescription>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={(currentStep / 3) * 100} className="h-2" />
            </div>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <CardContent className="space-y-6">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {renderStep()}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="flex justify-between w-full">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 mr-2"
                  >
                    {t('Précédent')}
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {t('Suivant')}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !validateStep(currentStep)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('Inscription...')}
                      </>
                    ) : (
                      t('Créer mon compte')
                    )}
                  </Button>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                {t('Vous avez déjà un compte ?')}{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  {t('Se connecter')}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;