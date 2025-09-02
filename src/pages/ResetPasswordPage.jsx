import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import api from '../services/apiService'; // Importez le service API

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null); // Pour stocker le token de l'URL
  const [isTokenValid, setIsTokenValid] = useState(false); // Pour contrôler l'affichage du formulaire

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = location.pathname.split('/').pop(); // Extraire le token directement du chemin de l'URL
    
    // Si votre route est /reset-password?token=XYZ, utilisez queryParams.get('token');
    // Si votre route est /reset-password/XYZ, utilisez location.pathname.split('/').pop();

    if (token && token !== 'reset-password') { // Assurez-vous que le token n'est pas juste le nom de la route
      setResetToken(token);
      setIsTokenValid(true); // Supposons qu'il est valide pour l'instant (la vraie validation est côté backend)
    } else {
      toast({
        title: "Erreur",
        description: "Lien de réinitialisation invalide ou manquant.",
        variant: "destructive",
      });
      // Optionnel: rediriger l'utilisateur après un court délai
      setTimeout(() => {
        navigate('/forgot-password');
      }, 3000); // Redirige après 3 secondes
    }
  }, [location.pathname, location.search, navigate, toast]);


  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!resetToken) {
      toast({
        title: "Erreur",
        description: "Le jeton de réinitialisation est manquant.",
        className: "bg-red-600 text-white border border-red-700 shadow-lg"
      });
      setIsLoading(false);
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs du nouveau mot de passe.",
        className: "bg-red-600 text-white border border-red-700 shadow-lg"
      });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Mots de passe non correspondants",
        description: "Les nouveaux mots de passe ne correspondent pas.",
        className: "bg-red-600 text-white border border-red-700 shadow-lg"
      });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) { // Validation minimale du backend est de 8 caractères
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        className: "bg-red-600 text-white border border-red-700 shadow-lg"
      });
      setIsLoading(false);
      return;
    }
    if (newPassword.toLowerCase().includes('password')) { // Validation du backend
        toast({
            title: "Mot de passe invalide",
            description: "Le mot de passe ne peut pas contenir 'password'.",
            className: "bg-red-600 text-white border border-red-700 shadow-lg"
        });
        setIsLoading(false);
        return;
    }


    try {
      // Appel à l'API backend pour réinitialiser le mot de passe
      const res = await api.auth.resetPassword(resetToken, { password: newPassword, confirmPassword: confirmNewPassword });

      if (res.data.success) {
        toast({
          title: "Mot de passe réinitialisé",
          description: "Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.",
          className: "bg-green-600 text-white border border-green-700 shadow-lg"
        });
        navigate('/login'); // Redirige vers la page de connexion après succès
      } else {
        // Le backend devrait renvoyer success: false et un message en cas d'erreur
        toast({
          title: "Erreur",
          description: res.data.message || "Une erreur est survenue lors de la réinitialisation de votre mot de passe.",
          className: "bg-red-600 text-white border border-red-700 shadow-lg"
        });
      }
    } catch (error) {
      console.error("Erreur de réinitialisation du mot de passe:", error);
      const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue lors de la réinitialisation de votre mot de passe.";
      toast({
        title: "Erreur",
        description: errorMessage,
        className: "bg-red-600 text-white border border-red-700 shadow-lg"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-[380px] md:w-[450px] bg-white text-black">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Réinitialiser le mot de passe</CardTitle>
          <CardDescription>
            {isTokenValid ? "Entrez votre nouveau mot de passe." : "Lien de réinitialisation invalide."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTokenValid ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#e85805] hover:bg-[#F46A21]" disabled={isLoading}>
                {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          ) : (
            <div className="text-center text-red-500 font-medium">
              <p>Impossible d'afficher le formulaire de réinitialisation.</p>
              <p>Veuillez vérifier que le lien de réinitialisation est correct et non expiré.</p>
              <Link to="/forgot-password" className="font-medium text-orange-600 hover:text-orange-700 hover:underline mt-4 block">
                Demander un nouveau lien de réinitialisation
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-center text-sm">
          <Link to="/login" className="font-medium text-orange-600 hover:text-orange-700 hover:underline">
            Retour à la connexion
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
