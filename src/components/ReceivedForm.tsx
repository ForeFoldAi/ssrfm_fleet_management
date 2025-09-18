import { useState } from "react";
import { Package, Save, X, FileText, CheckCircle, AlertTriangle } from "lucide-react";
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

interface ReceivedFormProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ReceivedFormData, isPartial: boolean) => void;
}

interface ReceivedFormData {
  purchasedPrice: string;
  purchasedQuantity: string;
  purchasedFrom: string;
  receivedDate: string;
  invoiceNumber: string;
  qualityCheck: string;
  notes: string;
}

export const ReceivedForm = ({ request, isOpen, onClose, onSubmit }: ReceivedFormProps) => {
  const { currentUser } = useRole();
  const [formData, setFormData] = useState<ReceivedFormData>({
    purchasedPrice: "",
    purchasedQuantity: "",
    purchasedFrom: "",
    receivedDate: new Date().toISOString().split('T')[0],
    invoiceNumber: "",
    qualityCheck: "passed",
    notes: ""
  });
  const [isPartialReceipt, setIsPartialReceipt] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.purchasedPrice.trim()) newErrors.purchasedPrice = "Purchased price is required";
    if (!formData.purchasedQuantity.trim()) newErrors.purchasedQuantity = "Purchased quantity is required";
    if (!formData.purchasedFrom.trim()) newErrors.purchasedFrom = "Supplier name is required";
    
    const price = parseFloat(formData.purchasedPrice);
    if (isNaN(price) || price <= 0) newErrors.purchasedPrice = "Please enter a valid price";
    
    const quantity = parseFloat(formData.purchasedQuantity);
    if (isNaN(quantity) || quantity <= 0) newErrors.purchasedQuantity = "Please enter a valid quantity";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit(formData, isPartialReceipt);
    
    // Reset form
    setFormData({
      purchasedPrice: "",
      purchasedQuantity: "",
      purchasedFrom: "",
      receivedDate: new Date().toISOString().split('T')[0],
      invoiceNumber: "",
      qualityCheck: "passed",
      notes: ""
    });
    setIsPartialReceipt(false);
    setErrors({});
  };

  const handleInputChange = (field: keyof ReceivedFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const originalQuantity = parseFloat(request?.quantity?.split(' ')[0] || '0');
  const receivedQuantity = parseFloat(formData.purchasedQuantity || '0');
  const isQuantityValid = receivedQuantity > 0;
  const isPartialByQuantity = isQuantityValid && receivedQuantity < originalQuantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary/80" />
            Material Received Form - {request?.id}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Summary */}
          <Card className="bg-secondary/10 border-secondary">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">Material:</span>
                  <div className="text-foreground">{request?.materialName}</div>
                </div>
                <div>
                  <span className="font-medium text-foreground">Requested Quantity:</span>
                  <div className="text-foreground">{request?.quantity}</div>
                </div>
                <div>
                  <span className="font-medium text-foreground">Estimated Value:</span>
                  <div className="text-foreground">{request?.value}</div>
                </div>
                <div>
                  <span className="font-medium text-foreground">Supplier:</span>
                  <div className="text-foreground">{request?.maker}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Receipt Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchased-price">Purchased Price *</Label>
                  <Input
                    id="purchased-price"
                    type="number"
                    step="0.01"
                    placeholder="Enter total price (₹)"
                    value={formData.purchasedPrice}
                    onChange={(e) => handleInputChange("purchasedPrice", e.target.value)}
                    className={errors.purchasedPrice ? "border-red-500" : ""}
                  />
                  {errors.purchasedPrice && (
                    <p className="text-red-500 text-sm">{errors.purchasedPrice}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchased-quantity">Purchased Quantity *</Label>
                  <Input
                    id="purchased-quantity"
                    type="number"
                    step="0.01"
                    placeholder="Enter received quantity"
                    value={formData.purchasedQuantity}
                    onChange={(e) => handleInputChange("purchasedQuantity", e.target.value)}
                    className={errors.purchasedQuantity ? "border-red-500" : ""}
                  />
                  {errors.purchasedQuantity && (
                    <p className="text-red-500 text-sm">{errors.purchasedQuantity}</p>
                  )}
                  {isQuantityValid && isPartialByQuantity && (
                    <p className="text-orange-600 text-sm">
                      ⚠️ Quantity is less than requested ({originalQuantity}). This will be marked as partial receipt.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchased-from">Purchased From *</Label>
                  <Input
                    id="purchased-from"
                    placeholder="Supplier/Vendor name"
                    value={formData.purchasedFrom}
                    onChange={(e) => handleInputChange("purchasedFrom", e.target.value)}
                    className={errors.purchasedFrom ? "border-red-500" : ""}
                  />
                  {errors.purchasedFrom && (
                    <p className="text-red-500 text-sm">{errors.purchasedFrom}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="received-date">Received Date</Label>
                  <Input
                    id="received-date"
                    type="date"
                    value={formData.receivedDate}
                    onChange={(e) => handleInputChange("receivedDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input
                    id="invoice-number"
                    placeholder="Invoice/Bill number"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality-check">Quality Check</Label>
                  <Select 
                    value={formData.qualityCheck} 
                    onValueChange={(value) => handleInputChange("qualityCheck", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary/80" />
                          Passed
                        </div>
                      </SelectItem>
                      <SelectItem value="failed">
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-red-600" />
                          Failed
                        </div>
                      </SelectItem>
                      <SelectItem value="partial">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          Partial Pass
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt-notes">Additional Notes</Label>
                <Textarea
                  id="receipt-notes"
                  placeholder="Any additional notes about the received materials..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Partial Receipt Option */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="partial-receipt"
                    checked={isPartialReceipt || isPartialByQuantity}
                    onChange={(e) => setIsPartialReceipt(e.target.checked)}
                    disabled={isPartialByQuantity}
                    className="rounded"
                  />
                  <Label htmlFor="partial-receipt" className="text-sm">
                    This is a partial receipt (more materials expected)
                  </Label>
                </div>
                
                {(isPartialReceipt || isPartialByQuantity) && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div className="text-sm text-accent-foreground">
                        <strong>Partial Receipt:</strong> This will be marked as "Partially Received". 
                        You can update the receipt again when more materials arrive.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {isQuantityValid && (
            <Card className={`${isPartialReceipt || isPartialByQuantity ? 'bg-accent/10 border-accent/20' : 'bg-primary/5 border-primary/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {isPartialReceipt || isPartialByQuantity ? (
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-primary/80 mt-0.5" />
                  )}
                  <div>
                    <div className={`font-medium ${isPartialReceipt || isPartialByQuantity ? 'text-accent-foreground' : 'text-primary'}`}>
                      {isPartialReceipt || isPartialByQuantity ? 'Partial Receipt Summary' : 'Complete Receipt Summary'}
                    </div>
                    <div className={`text-sm mt-1 ${isPartialReceipt || isPartialByQuantity ? 'text-accent-foreground' : 'text-primary/90'}`}>
                      <div>Received: {receivedQuantity} of {originalQuantity} MeasureUnits</div>
                      <div>Total Cost: ₹{formData.purchasedPrice}</div>
                      <div>Supplier: {formData.purchasedFrom}</div>
                      <div>Status: {isPartialReceipt || isPartialByQuantity ? 'Partially Received' : 'Material Received'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-center gap-3 pt-4">
            <Button 
              type="submit" 
              className={`${isPartialReceipt || isPartialByQuantity ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary-hover'} text-white`}
            >
              <Save className="w-4 h-4 mr-2" />
              {isPartialReceipt || isPartialByQuantity ? 'Record Partial Receipt' : 'Record Complete Receipt'}
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