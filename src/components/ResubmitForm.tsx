import { useState } from "react";
import { Send, X, FileText, AlertTriangle, Edit, CheckCircle, Plus, Trash2, Camera, Eye, UserRoundPlus } from "lucide-react";
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

interface VendorQuotation {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  price: string;
  quotedPrice: string;
  notes: string;
  quotationFile?: File | null;
}

interface RequestItem {
  id: string;
  srNo: number;
  productName: string;
  machineName: string;
  specifications: string;
  oldStock: number;
  reqQuantity: string;
  measureUnit: string;
  image?: File | null;
  imagePreview?: string | null;
  vendorQuotations: VendorQuotation[];
}

interface ResubmitFormProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedRequest: any) => void;
}

export const ResubmitForm = ({ request, isOpen, onClose, onSubmit }: ResubmitFormProps) => {
  const { currentUser } = useRole();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);
  const [isViewQuotationsOpen, setIsViewQuotationsOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string>("");
  const [currentQuotations, setCurrentQuotations] = useState<VendorQuotation[]>([]);
  const [vendorFormData, setVendorFormData] = useState<VendorQuotation>({
    id: "",
    vendorName: "",
    contactPerson: "",
    phone: "",
    price: "0",
    quotedPrice: "0",
    notes: "",
    quotationFile: null
  });

  // Available materials matching the physical form
  const availableMaterials = [
    {
      name: "FEVICOL",
      specifications: "SH adhesive",
      measureUnit: "kg",
      category: "Adhesives"
    },
    {
      name: "COPPER WIRE BRUSH",
      specifications: "0.01 mm thickness of wire",
      measureUnit: "pieces",
      category: "Tools"
    },
    {
      name: "DHOLLAK BALL",
      specifications: "PVC transparent",
      measureUnit: "pieces",
      category: "Components"
    },
    {
      name: "TRIANGLE BRUSH",
      specifications: "Cleaning brush",
      measureUnit: "pieces",
      category: "Tools"
    },
    {
      name: "GUM TAPE",
      specifications: "1 inch width adhesive tape",
      measureUnit: "pieces",
      category: "Office Supplies"
    },
    {
      name: "BEARINGS (SKF 6205-2RS)",
      specifications: "Deep Grove Ball Bearing, Inner: 25mm, Outer: 52mm",
      measureUnit: "pieces",
      category: "Parts"
    },
    {
      name: "MOTOR OIL (SAE 10W-30)",
      specifications: "Industrial grade lubricant for machinery",
      measureUnit: "liters",
      category: "Lubricants"
    },
    {
      name: "CONVEYOR BELTS",
      specifications: "Rubber belt, 600mm width, food grade",
      measureUnit: "meters",
      category: "Equipment"
    }
  ];

  // Machines for the supervisor
  const machines = [
    "BLENDER",
    "MAIN FLOUR MILL #01",
    "SECONDARY MILL #02", 
    "FLOUR SIFTER #01",
    "MAIN CONVEYOR #01"
  ];

  // Initialize request items from the original request
  const [requestItems, setRequestItems] = useState<RequestItem[]>([
    {
      id: "1",
      srNo: 1,
      productName: request?.items?.[0]?.productName || request?.materialName || "",
      machineName: request?.items?.[0]?.machineName || request?.machineName || "",
      specifications: request?.items?.[0]?.specifications || request?.specifications || "",
      oldStock: request?.items?.[0]?.oldStock || 0,
      reqQuantity: request?.items?.[0]?.reqQuantity || request?.quantity || "",
      measureUnit: request?.items?.[0]?.measureUnit || "",
      image: null,
      imagePreview: null,
      vendorQuotations: request?.items?.[0]?.vendorQuotations || []
    }
  ]);

  const [resubmissionNotes, setResubmissionNotes] = useState("");

  const handleItemChange = (itemId: string, field: string, value: string) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
    
    // Clear error for this field
    if (errors[`${field}_${itemId}`]) {
      setErrors(prev => ({ ...prev, [`${field}_${itemId}`]: "" }));
    }
  };

  const handleFileChange = (itemId: string, field: string, file: File) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: file } : item
    ));
  };

  const handleMaterialSelect = (itemId: string, materialName: string) => {
    const material = availableMaterials.find(m => m.name === materialName);
    if (material) {
      setRequestItems(prev => prev.map(item => 
        item.id === itemId ? {
          ...item,
          productName: material.name,
          specifications: material.specifications,
          measureUnit: material.measureUnit
        } : item
      ));
    }
  };

  const addNewItem = () => {
    const newItem: RequestItem = {
      id: String(Date.now()),
      srNo: requestItems.length + 1,
      productName: "",
      machineName: "",
      specifications: "",
      oldStock: 0,
      reqQuantity: "",
      measureUnit: "",
      image: null,
      imagePreview: null,
      vendorQuotations: []
    };
    setRequestItems(prev => [...prev, newItem]);
  };

  const removeItem = (itemId: string) => {
    if (requestItems.length > 1) {
      setRequestItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const openVendorForm = (itemId: string) => {
    setCurrentItemId(itemId);
    setVendorFormData({
      id: "",
      vendorName: "",
      contactPerson: "",
      phone: "",
      price: "0",
      quotedPrice: "0",
      notes: "",
      quotationFile: null
    });
    setIsVendorFormOpen(true);
  };

  const viewVendorQuotations = (itemId: string) => {
    const item = requestItems.find(item => item.id === itemId);
    if (item) {
      setCurrentQuotations(item.vendorQuotations);
      setCurrentItemId(itemId);
      setIsViewQuotationsOpen(true);
    }
  };

  const handleVendorFormChange = (field: string, value: string) => {
    setVendorFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVendorFileChange = (file: File) => {
    setVendorFormData(prev => ({ ...prev, quotationFile: file }));
  };

  const addVendorQuotation = () => {
    const currentItem = requestItems.find(item => item.id === currentItemId);
    if (currentItem && currentItem.vendorQuotations.length < 4) {
      const newQuotation: VendorQuotation = {
        ...vendorFormData,
        id: String(Date.now())
      };
      
      setRequestItems(prev => prev.map(item => 
        item.id === currentItemId 
          ? { ...item, vendorQuotations: [...item.vendorQuotations, newQuotation] }
          : item
      ));
      
      setIsVendorFormOpen(false);
      toast({
        title: "Vendor Quotation Added",
        description: `Quotation from ${vendorFormData.vendorName} added successfully`,
      });
    } else if (currentItem && currentItem.vendorQuotations.length >= 4) {
      toast({
        title: "Maximum Quotations Reached",
        description: "You can only add up to 4 vendor quotations per item",
        variant: "destructive"
      });
    }
  };

  const removeVendorQuotation = (itemId: string, quotationId: string) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, vendorQuotations: item.vendorQuotations.filter(q => q.id !== quotationId) }
        : item
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    requestItems.forEach((item, index) => {
      if (!item.productName.trim()) newErrors[`productName_${item.id}`] = `Product name is required for item ${index + 1}`;
      if (!item.machineName.trim()) newErrors[`machineName_${item.id}`] = `Machine name is required for item ${index + 1}`;
      if (!item.reqQuantity.trim()) newErrors[`reqQuantity_${item.id}`] = `Required quantity is required for item ${index + 1}`;
      
      const qty = Number(item.reqQuantity);
      if (qty <= 0) newErrors[`reqQuantity_${item.id}`] = `Quantity must be greater than 0 for item ${index + 1}`;
    });

    if (!resubmissionNotes.trim()) {
      newErrors.resubmissionNotes = "Please explain the changes made to address the revert reason";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedRequest = {
      ...request,
      id: request.id,
      status: "pending_approval",
      statusDescription: "Resubmitted after addressing Owner's concerns",
      currentStage: "Pending Approval",
      progressStage: 1,
      resubmittedBy: currentUser?.name,
      resubmittedDate: new Date().toISOString(),
      resubmissionNotes: resubmissionNotes,
      originalRevertReason: request.revertReason,
      resubmissionCount: (request.resubmissionCount || 0) + 1,
      items: requestItems.map(item => ({
        ...item,
        reqQuantity: Number(item.reqQuantity)
      })),
      requestedBy: currentUser?.name || "",
      department: currentUser?.department || ""
    };

    onSubmit(updatedRequest);

    toast({
      title: "Request Resubmitted",
      description: `Request ${request.id} has been resubmitted for approval with your updates.`,
    });

    onClose();
  };

  const ListView = () => (
    <div className="space-y-6">
      {requestItems.map((item) => (
        <Card key={item.id} className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Product Name *</Label>
                  <Select value={item.productName} onValueChange={(value) => handleMaterialSelect(item.id, value)}>
                    <SelectTrigger className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200">
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials.map((material) => (
                        <SelectItem key={material.name} value={material.name}>
                          <div className="flex flex-col">
                            <div className="font-semibold">{material.name}</div>
                            <div className="text-sm text-muted-foreground">{material.category}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`productName_${item.id}`] && (
                    <p className="text-destructive text-sm mt-1">{errors[`productName_${item.id}`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Machine Name *</Label>
                  <Select value={item.machineName} onValueChange={(value) => handleItemChange(item.id, "machineName", value)}>
                    <SelectTrigger className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200">
                      <SelectValue placeholder="Select Machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((machine) => (
                        <SelectItem key={machine} value={machine}>
                          {machine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`machineName_${item.id}`] && (
                    <p className="text-destructive text-sm mt-1">{errors[`machineName_${item.id}`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Specifications</Label>
                  <Textarea
                    value={item.specifications}
                    onChange={(e) => handleItemChange(item.id, "specifications", e.target.value)}
                    placeholder="Enter detailed specifications"
                    className="min-h-[50px] px-4 py-3 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Old Stock</Label>
                    <Input
                      type="number"
                      value={item.oldStock}
                      onChange={(e) => handleItemChange(item.id, "oldStock", e.target.value)}
                      placeholder="0"
                      min="0"
                      className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Required Quantity *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.reqQuantity}
                        onChange={(e) => handleItemChange(item.id, "reqQuantity", e.target.value)}
                        placeholder="Enter quantity"
                        min="0"
                        className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                      />
                      <span className="text-sm text-muted-foreground">{item.measureUnit}</span>
                    </div>
                    {errors[`reqQuantity_${item.id}`] && (
                      <p className="text-destructive text-sm mt-1">{errors[`reqQuantity_${item.id}`]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            handleItemChange(item.id, "imagePreview", e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                          handleFileChange(item.id, "image", file);
                        }
                      }}
                      className="flex-1 h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                    />
                    {item.imagePreview && (
                      <div className="w-16 h-16 rounded-[5px] border overflow-hidden">
                        <img src={item.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vendor Quotations ({item.vendorQuotations.length}/4)</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-11"
                      onClick={() => openVendorForm(item.id)}
                      disabled={item.vendorQuotations.length >= 4}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vendor Quotation
                    </Button>
                    {item.vendorQuotations.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => viewVendorQuotations(item.id)}
                        className="px-3 h-11"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {item.vendorQuotations.length > 0 && (
                    <div className="space-y-2">
                      {item.vendorQuotations.map((quotation) => (
                        <div key={quotation.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-[5px] border">
                          <div>
                            <div className="font-medium text-sm">{quotation.vendorName}</div>
                            <div className="text-xs text-muted-foreground">{quotation.quotedPrice}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVendorQuotation(item.id, quotation.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {requestItems.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive h-10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Item
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-foreground" />
            Resubmit Request - {request?.id}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Revert Information */}
         

          {/* Add Item Button */}
          <div className="flex justify-end">
            <Button type="button" onClick={addNewItem} className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Item
            </Button>
          </div>

          {/* Items Section */}
          <ListView />

          {/* Resubmission Notes */}
          <Card className="border-secondary bg-secondary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">Resubmission Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="resubmission-notes">Changes Made to Address Revert Reason *</Label>
                <Textarea
                  id="resubmission-notes"
                  placeholder="Explain what changes you have made to address the Owner's concerns..."
                  value={resubmissionNotes}
                  onChange={(e) => setResubmissionNotes(e.target.value)}
                  rows={4}
                  className={`min-h-[50px] px-4 py-3 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200 ${errors.resubmissionNotes ? "border-red-500" : ""}`}
                />
                {errors.resubmissionNotes && (
                  <p className="text-red-500 text-sm">{errors.resubmissionNotes}</p>
                )}
              </div>
              <div className="text-sm text-foreground">
                <strong>Note:</strong> Please be specific about how you have addressed each point raised in the revert reason.
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-center gap-3 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary-hover text-white">
              <Send className="w-4 h-4 mr-2" />
              Resubmit Request
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>

        {/* Vendor Quotation Form Dialog */}
        <Dialog open={isVendorFormOpen} onOpenChange={setIsVendorFormOpen}>
          <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <UserRoundPlus className="w-6 h-6 text-primary" />
                </div>
                Add Vendor Quotation
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vendorName" className="text-sm font-medium">Vendor Name *</Label>
                  <Input
                    id="vendorName"
                    value={vendorFormData.vendorName}
                    onChange={(e) => handleVendorFormChange("vendorName", e.target.value)}
                    placeholder="Enter vendor name"
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-sm font-medium">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={vendorFormData.contactPerson}
                    onChange={(e) => handleVendorFormChange("contactPerson", e.target.value)}
                    placeholder="Enter contact person"
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone *</Label>
                  <Input
                    id="phone"
                    value={vendorFormData.phone}
                    onChange={(e) => handleVendorFormChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">Price *</Label>
                  <Input
                    id="price"
                    value={vendorFormData.price}
                    onChange={(e) => handleVendorFormChange("price", e.target.value)}
                    placeholder="Enter Price"
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quotedPrice" className="text-sm font-medium">Total Quotation Amount *</Label>
                  <Input
                    id="quotedPrice"
                    value={vendorFormData.quotedPrice}
                    onChange={(e) => handleVendorFormChange("quotedPrice", e.target.value)}
                    placeholder="Enter Total Quotation Amount"
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotationFile" className="text-sm font-medium">Quotation File</Label>
                <Input
                  id="quotationFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleVendorFileChange(file);
                    }
                  }}
                  className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  value={vendorFormData.notes}
                  onChange={(e) => handleVendorFormChange("notes", e.target.value)}
                  placeholder="Additional notes or comments"
                  className="min-h-[50px] px-4 py-3 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsVendorFormOpen(false)} className="h-11 px-6">
                Cancel
              </Button>
              <Button onClick={addVendorQuotation} className="h-11 px-6 bg-primary hover:bg-primary/90">
                Add Quotation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Vendor Quotations Dialog */}
        <Dialog open={isViewQuotationsOpen} onOpenChange={setIsViewQuotationsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-foreground" />
                Vendor Quotations
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {currentQuotations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuotations.map((quotation, index) => (
                    <Card key={quotation.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{quotation.vendorName}</CardTitle>
                          <Badge variant="secondary">Quotation #{index + 1}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Contact Person:</span>
                            <div className="font-medium">{quotation.contactPerson}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Phone:</span>
                            <div className="font-medium">{quotation.phone}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Price:</span>
                            <div className="font-medium">{quotation.price}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Total Quotation Amount:</span>
                            <div className="font-medium text-primary/80">{quotation.quotedPrice}</div>
                          </div>
                        </div>
                        
                        {quotation.notes && (
                          <div>
                            <span className="font-medium text-muted-foreground text-sm">Notes:</span>
                            <div className="text-sm mt-1 p-2 bg-gray-50 rounded border">
                              {quotation.notes}
                            </div>
                          </div>
                        )}
                        
                        {quotation.quotationFile && (
                          <div>
                            <span className="font-medium text-muted-foreground text-sm">Quotation File:</span>
                            <div className="text-sm mt-1 p-2 bg-secondary/10 rounded border border-secondary">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-foreground" />
                                <span className="font-medium">{quotation.quotationFile.name}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Quotations</h3>
                  <p className="text-muted-foreground">
                    No vendor quotations have been added for this item yet.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setIsViewQuotationsOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};