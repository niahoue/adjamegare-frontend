import React, { useEffect, useState } from "react";
import { adminApi } from "../../services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../../components/ui/dialog";
import { 
  Loader2, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Eye,
  Building2,
  Mail,
  Phone,
  MessageSquare
} from "lucide-react";
import { toast } from "../../hooks/use-toast";

const AdminPartnerManagementPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    message: ""
  });

  // Charger tous les partenaires
  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getAllPartners();
      setPartners(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les partenaires.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les partenaires
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      companyName: "",
      email: "",
      phone: "",
      message: ""
    });
    setSelectedPartner(null);
  };

  // Ouvrir le dialog d'ajout
  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // Ouvrir le dialog d'édition
  const openEditDialog = (partner) => {
    setSelectedPartner(partner);
    setFormData({
      companyName: partner.companyName,
      email: partner.email,
      phone: partner.phone,
      message: partner.message || ""
    });
    setIsEditDialogOpen(true);
  };

  // Ouvrir le dialog de visualisation
  const openViewDialog = (partner) => {
    setSelectedPartner(partner);
    setIsViewDialogOpen(true);
  };

  // Ajouter un nouveau partenaire
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await adminApi.addPartnerDirectly(formData);
      toast({
        title: "Succès",
        description: "Partenaire ajouté avec succès ✅"
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchPartners();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout du partenaire.",
        variant: "destructive"
      });
    }
  };

  // Modifier un partenaire
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedPartner) return;
    
    try {
      await adminApi.updatePartner(selectedPartner._id, formData);
      toast({
        title: "Succès",
        description: "Partenaire modifié avec succès ✅"
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchPartners();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification.",
        variant: "destructive"
      });
    }
  };

  // Approuver un partenaire
  const handleApprove = async (id) => {
    try {
      await adminApi.approvePartner(id);
      toast({
        title: "Succès",
        description: "Partenaire approuvé ✅"
      });
      fetchPartners();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'approbation.",
        variant: "destructive"
      });
    }
  };

  // Rejeter un partenaire
  const handleReject = async (id) => {
    try {
      await adminApi.rejectPartner(id);
      toast({
        title: "Succès",
        description: "Partenaire rejeté ❌"
      });
      fetchPartners();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du rejet.",
        variant: "destructive"
      });
    }
  };

  // Supprimer un partenaire
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce partenaire ? Cette action est irréversible.")) return;
    try {
      await adminApi.deletePartner(id);
      toast({
        title: "Succès",
        description: "Partenaire supprimé 🗑️"
      });
      fetchPartners();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression.",
        variant: "destructive"
      });
    }
  };

  // Obtenir le style du badge de statut
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Statistiques
  const stats = {
    total: partners.length,
    pending: partners.filter(p => p.status === "pending").length,
    approved: partners.filter(p => p.status === "approved").length,
    rejected: partners.filter(p => p.status === "rejected").length
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return (
    <section className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Partenaires</h1>
          <p className="text-gray-600 mt-1">Gérez les demandes de partenariat et les partenaires existants</p>
        </div>
        <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un partenaire
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Rejetés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom d'entreprise, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des partenaires */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Chargement...</span>
        </div>
      ) : filteredPartners.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" 
                ? "Aucun partenaire ne correspond à vos critères de recherche."
                : "Aucun partenaire trouvé."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => (
            <Card key={partner._id} className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {partner.companyName}
                  </CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(partner.status)}`}
                  >
                    {partner.status === "pending" ? "En attente" :
                     partner.status === "approved" ? "Approuvé" : "Rejeté"}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{partner.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{partner.phone}</span>
                  </div>
                  {partner.message && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{partner.message}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Actions selon le statut */}
                  {partner.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 flex-1"
                        onClick={() => handleApprove(partner._id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(partner._id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </>
                  )}
                  
                  {/* Actions communes */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openViewDialog(partner)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(partner)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(partner._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog d'ajout */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau partenaire</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nom de l'entreprise *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                required
                placeholder="Ex: Transport SA"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="contact@transport-sa.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                placeholder="+225 XX XX XX XX"
              />
            </div>
            <div>
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Informations supplémentaires..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Ajouter
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le partenaire</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-companyName">Nom de l'entreprise *</Label>
              <Input
                id="edit-companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Téléphone *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-message">Message</Label>
              <Textarea
                id="edit-message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Sauvegarder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du partenaire</DialogTitle>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Nom de l'entreprise</Label>
                <p className="text-gray-900 font-semibold">{selectedPartner.companyName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-gray-900">{selectedPartner.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Téléphone</Label>
                <p className="text-gray-900">{selectedPartner.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Statut</Label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(selectedPartner.status)} mt-1`}
                >
                  {selectedPartner.status === "pending" ? "En attente" :
                   selectedPartner.status === "approved" ? "Approuvé" : "Rejeté"}
                </span>
              </div>
              {selectedPartner.message && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Message</Label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedPartner.message}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-600">Date de création</Label>
                <p className="text-gray-900">
                  {new Date(selectedPartner.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              {/* Actions dans le dialog de visualisation */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedPartner.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex-1"
                      onClick={() => {
                        handleApprove(selectedPartner._id);
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        handleReject(selectedPartner._id);
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeter
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openEditDialog(selectedPartner);
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AdminPartnerManagementPage;