import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import api from '../services/apiService'; // Importez l'instance par défaut pour accéder à authApi

const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState(''); // Peut être email ou téléphone
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!identifier) {
      toast({
        title: "Champ requis",
        description: "Veuillez entrer votre adresse email ou numéro de téléphone.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Appel à l'API backend pour envoyer un lien de réinitialisation
      const res = await api.auth.forgotPassword(identifier); // Utilise l'identifiant (email ou phone)

      if (res.data.success) {
        toast({
          title: "E-mail/SMS envoyé",
          description: "Si un compte avec cet identifiant existe, un lien de réinitialisation de mot de passe a été envoyé (vérifiez votre boîte de réception ou vos SMS).",
          className: "bg-green-600 text-white border border-green-700 shadow-lg"
        });
        navigate('/login'); // Redirige vers la page de connexion après l'envoi
      } else {
        // Normalement, le backend renvoie toujours success: true pour ne pas donner d'informations
        // mais au cas où il y aurait une erreur interne qui renvoie success: false
        toast({
          title: "Erreur",
          description: res.data.message || "Une erreur est survenue lors de l'envoi de l'e-mail de réinitialisation.",
          className: "bg-red-600 text-white border border-red-700 shadow-lg"
        });
      }
    } catch (error) {
      console.error("Erreur de récupération du mot de passe:", error);
      const errorMessage = error.message || error.response?.data?.message || "Une erreur est survenue lors de l'envoi de l'e-mail de réinitialisation.";
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
          <CardTitle className="text-2xl font-bold">Mot de passe oublié ?</CardTitle>
          <CardDescription>
            Entrez votre adresse email ou numéro de téléphone pour recevoir un lien de réinitialisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email ou Numéro de Téléphone</Label> {/* Label mis à jour */}
              <Input
                id="identifier"
                type="text" // Type 'text' pour accepter email ou téléphone
                placeholder="votre_email@example.com ou 07XXXXXXXX" // Placeholder mis à jour
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-[#e85805] hover:bg-[#F46A21]" disabled={isLoading}>
              {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </Button>
          </form>
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

export default ForgotPasswordPage;
