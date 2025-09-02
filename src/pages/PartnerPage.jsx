import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Building2, Users, TrendingUp } from "lucide-react";
import { partnerApi } from "../services/apiService"; // Import correct
import { toast } from "../hooks/use-toast";

const PartnerPage = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // Mise à jour des inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Envoi au backend avec la bonne API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Utilisation de l'API service au lieu de fetch direct
      const response = await partnerApi.createRequest(formData);
      
      toast({
        title: "Succès",
        description: "✅ Votre demande a été envoyée avec succès !",
        variant: "default"
      });
      
      // Réinitialiser le formulaire
      setFormData({ companyName: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || error.message || "❌ Une erreur est survenue.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section */}
      <section className="bg-white shadow-md py-16">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
            🚌 Devenez partenaire de <span className="text-[#73D700]">Adjamegare</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez notre plateforme et offrez plus de visibilité à votre compagnie.
            Augmentez vos ventes et simplifiez la gestion de vos voyages.
          </p>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-green-100 hover:shadow-xl transition-all">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-[#73D700]" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Boostez vos ventes</h3>
            <p className="text-sm text-gray-600">
              Attirez plus de clients et augmentez vos revenus grâce à notre plateforme.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-green-100 hover:shadow-xl transition-all">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-[#73D700]" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Accédez à +10 000 voyageurs</h3>
            <p className="text-sm text-gray-600">
              Connectez-vous directement avec des milliers de clients actifs.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-green-100 hover:shadow-xl transition-all">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Building2 className="w-6 h-6 text-[#73D700]" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Simplifiez votre gestion</h3>
            <p className="text-sm text-gray-600">
              Une plateforme unique pour gérer vos voyages, réservations et paiements.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Formulaire */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            ✏️ Rejoignez-nous dès aujourd'hui
          </h2>
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la compagnie *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Ex: IvoireBus"
                    required
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#73D700] focus:border-[#73D700] transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@compagnie.com"
                      required
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#73D700] focus:border-[#73D700] transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+225 01 23 45 67 89"
                      required
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#73D700] focus:border-[#73D700] transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optionnel)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Parlez-nous de votre compagnie, de vos services, de vos attentes..."
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#73D700] focus:border-[#73D700] transition-colors resize-none"
                  ></textarea>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#73D700] hover:bg-green-600 text-white px-8 py-3 rounded-lg shadow-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      "🚀 Envoyer ma demande"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PartnerPage;