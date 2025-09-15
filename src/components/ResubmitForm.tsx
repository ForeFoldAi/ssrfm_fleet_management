import { useState } from "react";
import { Send, X, FileText, AlertTriangle, Edit, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "../hooks/use-toast";
import { useRole } from "../contexts/RoleContext";

interface ResubmitFormProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedRequest: any) => void;
}

export const ResubmitForm = ({ request, isOpen, onClose, onSubmit }: ResubmitFormProps) => {
  const { currentUser } = useRole();
  const [formData, setFormData] = useState({
    materialName: request?.materialName || "",
    specifications: request?.specifications || "",
    maker: request?.maker || "",
    quantity: request?.quantity || "",
    value: request?.value || "",
    priority: request?.priority || "medium",
    materialPurpose: request?.materialPurpose || "",
    machineId: request?.machineId || "",
    machineName: request?.machineName || "",
    additionalNotes: request?.additionalNotes || "",
    resubmissionNotes: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.materialName.trim()) newErrors.materialName = "Material name is required";
    if (!formData.specifications.trim()) newErrors.specifications = "Specifications are required";
    if (!formData.maker.trim()) newErrors.maker = "Maker/Brand is required";
    if (!formData.quantity.trim()) newErrors.quantity = "Quantity is required";
    if (!formData.value.trim()) newErrors.value = "Estimated value is required";
    if (!formData.materialPurpose.trim()) newErrors.materialPurpose = "Material purpose is required";
    if (!formData.resubmissionNotes.trim()) newErrors.resubmissionNotes = "Please explain the changes made to address the revert reason";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const updatedRequest = {
      ...request,
      ...formData,
      status: "pending_approval",
      statusDescription: "Resubmitted after addressing Owner's concerns",
      currentStage: "Pending Approval",
      progressStage: 1,
      resubmittedBy: currentUser?.name,
      resubmittedDate: new Date().toISOString(),
      resubmissionNotes: formData.resubmissionNotes,
      originalRevertReason: request.revertReason,
      resubmissionCount: (request.resubmissionCount || 0) + 1
    };
    
    onSubmit(updatedRequest);
    
    toast({
      title: "Request Resubmitted",
      description: `Request ${request.id} has been resubmitted for approval with your updates.`,
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Resubmit Request - {request?.id}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Revert Information */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Owner's Revert Reason
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                <div className="text-sm text-red-800">
                  <strong>Reverted by:</strong> {request?.revertedBy} on {new Date(request?.revertedDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-red-700 mt-2">
                  <strong>Reason:</strong> {request?.revertReason}
                </div>
              </div>
              <div className="text-sm text-red-700">
                <strong>Instructions:</strong> Please address the above concerns and update the request details accordingly before resubmitting.
              </div>
            </CardContent>
          </Card>

          {/* Material Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Material Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material-name">Material Name *</Label>
                  <Input
                    id="material-name"
                    placeholder="Enter material name"
                    value={formData.materialName}
                    onChange={(e) => handleInputChange("materialName", e.target.value)}
                    className={errors.materialName ? "border-red-500" : ""}
                  />
                  {errors.materialName && (
                    <p className="text-red-500 text-sm">{errors.materialName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maker">Maker/Brand *</Label>
                  <Input
                    id="maker"
                    placeholder="Enter manufacturer or brand"
                    value={formData.maker}
                    onChange={(e) => handleInputChange("maker", e.target.value)}
                    className={errors.maker ? "border-red-500" : ""}
                  />
                  {errors.maker && (
                    <p className="text-red-500 text-sm">{errors.maker}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    placeholder="Enter quantity with unit"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm">{errors.quantity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Estimated Value *</Label>
                  <Input
                    id="value"
                    placeholder="Enter estimated cost (₹)"
                    value={formData.value}
                    onChange={(e) => handleInputChange("value", e.target.value)}
                    className={errors.value ? "border-red-500" : ""}
                  />
                  {errors.value && (
                    <p className="text-red-500 text-sm">{errors.value}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="machine-name">Machine Name</Label>
                  <Input
                    id="machine-name"
                    placeholder="Enter machine name"
                    value={formData.machineName}
                    onChange={(e) => handleInputChange("machineName", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Specifications *</Label>
                <Textarea
                  id="specifications"
                  placeholder="Enter detailed specifications (address the Owner's concerns)"
                  value={formData.specifications}
                  onChange={(e) => handleInputChange("specifications", e.target.value)}
                  rows={4}
                  className={errors.specifications ? "border-red-500" : ""}
                />
                {errors.specifications && (
                  <p className="text-red-500 text-sm">{errors.specifications}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="material-purpose">Material Purpose *</Label>
                <Textarea
                  id="material-purpose"
                  placeholder="Describe the purpose and justification for this material"
                  value={formData.materialPurpose}
                  onChange={(e) => handleInputChange("materialPurpose", e.target.value)}
                  rows={3}
                  className={errors.materialPurpose ? "border-red-500" : ""}
                />
                {errors.materialPurpose && (
                  <p className="text-red-500 text-sm">{errors.materialPurpose}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-notes">Additional Notes</Label>
                <Textarea
                  id="additional-notes"
                  placeholder="Any additional information or special requirements"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resubmission Notes */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-800">Resubmission Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="resubmission-notes">Changes Made to Address Revert Reason *</Label>
                <Textarea
                  id="resubmission-notes"
                  placeholder="Explain what changes you have made to address the Owner's concerns..."
                  value={formData.resubmissionNotes}
                  onChange={(e) => handleInputChange("resubmissionNotes", e.target.value)}
                  rows={4}
                  className={errors.resubmissionNotes ? "border-red-500" : ""}
                />
                {errors.resubmissionNotes && (
                  <p className="text-red-500 text-sm">{errors.resubmissionNotes}</p>
                )}
              </div>
              <div className="text-sm text-blue-700">
                <strong>Note:</strong> Please be specific about how you have addressed each point raised in the revert reason.
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Resubmission Summary</div>
                  <div className="text-sm text-green-700 mt-1">
                    <div>Request ID: {request?.id}</div>
                    <div>Material: {formData.materialName}</div>
                    <div>Quantity: {formData.quantity}</div>
                    <div>Estimated Value: {formData.value}</div>
                    <div>Resubmitted by: {currentUser?.name}</div>
                    <div>Status after resubmission: Pending Approval</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-center gap-3 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Send className="w-4 h-4 mr-2" />
              Resubmit Request
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};