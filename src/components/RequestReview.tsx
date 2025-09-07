import { useState } from "react";
import { ChevronLeft, Send, Package, Settings, MapPin, Clock, User, FileText, Image as ImageIcon, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";

interface RequestReviewProps {
  formData: any;
  onBack: () => void;
}

export const RequestReview = ({ formData, onBack }: RequestReviewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const materials = [
    { id: "steel-rods", name: "Steel Rods (20mm)", unit: "kg" },
    { id: "hydraulic-oil", name: "Hydraulic Oil", unit: "liters" },
    { id: "concrete-mix", name: "Concrete Mix", unit: "tons" },
    { id: "industrial-bolts", name: "Industrial Bolts", unit: "pieces" },
    { id: "welding-electrodes", name: "Welding Electrodes", unit: "boxes" }
  ];

  const selectedMaterial = materials.find(m => m.id === formData.material);

  const getPriorityBadge = (priority: string) => {
    const badges = {
      "High": "badge-status bg-destructive/10 text-destructive ring-1 ring-destructive/20",
      "Medium": "badge-status bg-warning/10 text-warning ring-1 ring-warning/20",
      "Low": "badge-status bg-primary/10 text-primary ring-1 ring-primary/20"
    };
    return badges[priority as keyof typeof badges] || "badge-status bg-muted text-muted-foreground";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Request Submitted Successfully!",
      description: "Your material request has been sent for approval. You'll be notified once it's reviewed.",
    });
    
    setIsSubmitting(false);
    navigate('/my-requests');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Review Your Request</h2>
        <p className="text-muted-foreground">Please check all details before submitting</p>
      </div>

      <div className="space-y-6">
        {/* Material Information */}
        <div className="card-friendly p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Material Request</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Material</p>
              <p className="text-lg font-semibold text-foreground">{selectedMaterial?.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Quantity Required</p>
              <p className="text-lg font-bold text-primary">
                {formData.quantity} {selectedMaterial?.unit}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Priority Level</p>
              <span className={getPriorityBadge(formData.priority)}>
                {formData.priority} Priority
              </span>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Request Date</p>
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Purpose</p>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-foreground">{formData.purpose}</p>
            </div>
          </div>

          {/* Material Proof Image */}
          {formData.proofImagePreview && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">Material Proof Image</p>
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={formData.proofImagePreview} 
                        alt="Material proof" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Proof image attached</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formData.proofImageName || "material-proof.jpg"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This image will be reviewed with your request
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Machine Information */}
        {formData.machineDetails && (
          <div className="card-friendly p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Target Machine</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Machine</p>
                <p className="text-lg font-semibold text-foreground">{formData.machineDetails.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Type</p>
                <p className="text-lg font-semibold text-primary">{formData.machineDetails.type}</p>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="font-semibold">{formData.machineDetails.location}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Specifications</p>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-foreground">{formData.machineDetails.specifications}</p>
              </div>
            </div>

            {/* Machine Proof Image */}
            {formData.machineProofImagePreview && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-3">Machine Condition Proof</p>
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={formData.machineProofImagePreview} 
                          alt="Machine condition proof" 
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Machine proof attached</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formData.machineProofImageName || "machine-proof.jpg"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Shows current machine condition
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Proof Images Summary */}
        {(formData.proofImagePreview || formData.machineProofImagePreview) && (
          <div className="card-friendly p-6 bg-blue-50/50 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-900">Attached Evidence</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.proofImagePreview && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Material Proof</p>
                    <p className="text-sm text-muted-foreground">Evidence attached</p>
                  </div>
                </div>
              )}
              {formData.machineProofImagePreview && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Machine Proof</p>
                    <p className="text-sm text-muted-foreground">Condition documented</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requester Information */}
        <div className="card-friendly p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Request Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Requested By</p>
              <p className="text-lg font-semibold text-foreground">Current User</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <span className="badge-status bg-warning/10 text-warning ring-1 ring-warning/20">
                Pending Approval
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onBack}
            className="flex-1 btn-friendly"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Edit
          </Button>
          
          <Button 
            size="lg" 
            onClick={handleSubmit}
            className="flex-1 btn-success"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>

        {/* Note */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-primary">
            <strong>Note:</strong> Your request will be reviewed by the materials team. 
            You'll receive a notification once it's approved or if additional information is needed.
            {(formData.proofImagePreview || formData.machineProofImagePreview) && (
              <span className="block mt-1">
                Attached proof images will help expedite the approval process.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};