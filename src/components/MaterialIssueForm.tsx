import logo from "/logo.png";
import { useState } from "react";
import { Package, Save, X, User, Calendar, CheckCircle, AlertCircle, FileText, Building2, Trash2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { toast } from "../hooks/use-toast";
import { useRole } from "../contexts/RoleContext";

interface MaterialIssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issueData: any) => void;
}

export const MaterialIssueForm = ({ isOpen, onClose, onSubmit }: MaterialIssueFormProps) => {
  const { currentUser } = useRole();
  const [formData, setFormData] = useState({
    // Document Information (matching the physical form)
    date: new Date().toISOString().split('T')[0],
    materialIssueFormSrNo: `SSFM/IISFN/006`,
    reqFormSrNo: `SSFM/MNT/RQ/0011`,
    indFormSrNo: `SSFM/MNT/IND./0011`,
    
    // Material items (supporting multiple items like in the physical form)
    items: [
      {
        srNo: 1,
        nameOfMaterial: "",
        existingStock: 0,
        issuedQty: "",
        stockAfterIssue: 0,
        unit: ""
      }
    ],
    
    // Personnel Information (matching the signature sections)
    issuingPersonName: "",
    issuingPersonDesignation: "", 
    receiverName: "",
    receiverDesignation: "",
    
    // Additional fields
    purpose: "",
    notes: "",
    requestedBy: currentUser?.name || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  // Available materials with current stock (matching the physical form in the image)
  const availableMaterials = [
    {
      id: "MAT-001",
      name: "fevicol",
      make: "MARINE",
      specifications: "SH adhesive",
      unit: "KG",
      currentStock: 1,
      location: "Chemical Storage"
    },
    {
      id: "MAT-002", 
      name: "wire brush",
      make: "INDUSTRIAL",
      specifications: "0.01 mm thickness of wire",
      unit: "pieces",
      currentStock: 2,
      location: "Tools Storage"
    },
    {
      id: "MAT-003",
      name: "dholak ball", 
      make: "INDUSTRIAL",
      specifications: "PVC transparent",
      unit: "pieces",
      currentStock: 200,
      location: "Components Storage"
    },
    {
      id: "MAT-004",
      name: "triangle brush",
      make: "INDUSTRIAL", 
      specifications: "Cleaning brush",
      unit: "pieces",
      currentStock: 130,
      location: "Tools Storage"
    },
    {
      id: "MAT-005",
      name: "gum tape",
      make: "INDUSTRIAL",
      specifications: "1 inch width adhesive tape", 
      unit: "pieces",
      currentStock: 14,
      location: "Office Supplies"
    },
    {
      id: "MAT-006",
      name: "BEARINGS (SKF 6205-2RS)",
      make: "SKF",
      specifications: "Deep Grove Ball Bearing, Inner: 25mm, Outer: 52mm",
      unit: "pieces",
      currentStock: 24,
      location: "Parts Storage A-1"
    },
    {
      id: "MAT-007",
      name: "MOTOR OIL (SAE 10W-30)",
      make: "CASTROL",
      specifications: "Industrial grade lubricant for machinery",
      unit: "liters",
      currentStock: 65,
      location: "Chemical Storage B-1"
    },
    {
      id: "MAT-008",
      name: "CONVEYOR BELTS",
      make: "CONTINENTAL",
      specifications: "Rubber belt, 600mm width, food grade",
      unit: "meters",
      currentStock: 45,
      location: "Equipment Storage C-1"
    }
  ];

  // Machines for the supervisor
  const machines = [
    {
      id: "MACHINE-001",
      name: "BLENDER",
      type: "Laboratory Equipment",
      location: "Laboratory"
    },
    {
      id: "MACHINE-002",
      name: "MAIN FLOUR MILL #01",
      type: "Roller Flour Mill",
      location: "Production Floor A"
    },
    {
      id: "MACHINE-003",
      name: "SECONDARY MILL #02",
      type: "Roller Flour Mill",
      location: "Production Floor A"
    },
    {
      id: "MACHINE-004",
      name: "FLOUR SIFTER #01",
      type: "Rotary Sifter",
      location: "Processing Line B"
    },
    {
      id: "MACHINE-005",
      name: "MAIN CONVEYOR #01",
      type: "Belt Conveyor",
      location: "Transport Line"
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleMaterialSelect = (materialId: string) => {
    const material = availableMaterials.find(m => m.id === materialId);
    if (material) {
      setSelectedMaterial(material);
      setFormData(prev => ({
        ...prev,
        productName: material.name,
        make: material.make,
        specifications: material.specifications,
        unit: material.unit,
        oldStock: material.currentStock
      }));
    }
  };

  const handleMachineSelect = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    if (machine) {
      setFormData(prev => ({
        ...prev,
        machineName: machine.name
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate each item in the items array
    formData.items.forEach((item, index) => {
      if (!item.nameOfMaterial.trim()) {
        newErrors[`nameOfMaterial_${index}`] = `Material name is required for item ${index + 1}`;
      }
      if (!item.issuedQty.trim()) {
        newErrors[`issuedQty_${index}`] = `Issued quantity is required for item ${index + 1}`;
      }
      
      const issuedQty = Number(item.issuedQty);
      if (issuedQty <= 0) {
        newErrors[`issuedQty_${index}`] = `Issued quantity must be greater than 0 for item ${index + 1}`;
      }
      if (issuedQty > item.existingStock) {
        newErrors[`issuedQty_${index}`] = `Issued quantity cannot exceed existing stock for item ${index + 1}`;
      }
    });

    // Validate personnel information
    if (!formData.issuingPersonName.trim()) newErrors.issuingPersonName = "Issuing person name is required";
    if (!formData.issuingPersonDesignation.trim()) newErrors.issuingPersonDesignation = "Issuing person designation is required";
    if (!formData.receiverName.trim()) newErrors.receiverName = "Receiver name is required";
    if (!formData.receiverDesignation.trim()) newErrors.receiverDesignation = "Receiver designation is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Generate document numbers
    const timestamp = Date.now();
    const docNo = `SSRFM/MNTI/R-${String(timestamp).slice(-4)}`;
    const reqFormNo = `SSRFM/MNT/REQ.-${String(timestamp).slice(-4)}`;
    const indFormNo = `SSRFM/MNT/IND.-${String(timestamp).slice(-4)}`;
    const reqSrNo = `SSRFM/MNT/REQ.-${String(timestamp).slice(-4)}`;
    const indSrNo = `SSRFM/MNT/IND.-${String(timestamp).slice(-4)}`;
    
    const issueData = {
      ...formData,
      id: `ISS-${timestamp}`,
      status: "issued",
      type: "material_issue",
      timestamp: new Date().toISOString(),
      issuedItems: formData.items.filter(item => item.nameOfMaterial && item.issuedQty)
    };
    
    onSubmit(issueData);
    
    const issuedItemsCount = formData.items.filter(item => item.nameOfMaterial && item.issuedQty).length;
    toast({
      title: "Material Issue Form Submitted",
      description: `${issuedItemsCount} material item(s) issued successfully to ${formData.receiverName}`,
    });
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      materialIssueFormSrNo: `SSFM/IISFN/006`,
      reqFormSrNo: `SSFM/MNT/RQ/0011`,
      indFormSrNo: `SSFM/MNT/IND./0011`,
      items: [
        {
          srNo: 1,
          nameOfMaterial: "",
          existingStock: 0,
          issuedQty: "",
          stockAfterIssue: 0,
          unit: ""
        }
      ],
      issuingPersonName: "",
      issuingPersonDesignation: "", 
      receiverName: "",
      receiverDesignation: "",
      purpose: "",
      notes: "",
      requestedBy: currentUser?.name || "",
      
    });
    setSelectedMaterial(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-4">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <div className="text-base font-bold">MATERIAL ISSUE FORM</div>
              <div className="text-xs text-muted-foreground">AGAINST REQUISITION AND INDENT FORM</div>
            </div>
            
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
         

          {/* Add Item Button - Compact */}
          <div className="flex justify-end">
            <Button 
              type="button"
              onClick={() => {
                const newItem = {
                  srNo: formData.items.length + 1,
                  nameOfMaterial: "",
                  existingStock: 0,
                  issuedQty: "",
                  stockAfterIssue: 0,
                  unit: ""
                };
                setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
              }}
              className="gap-1 h-8 text-xs"
              size="sm"
            >
              <Plus className="w-3 h-3" />
              Add Item
            </Button>
          </div>

          {/* Material Items Table - Compact */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">SR.NO.</TableHead>
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">NAME OF THE MATERIAL</TableHead>
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">EXISTING STOCK</TableHead>
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">ISSUED QTY</TableHead>
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">STOCK AFTER ISSUE</TableHead>
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="border border-gray-300 text-center font-semibold text-xs px-2 py-1">
                          {item.srNo}
                        </TableCell>
                        <TableCell className="border border-gray-300 px-2 py-1">
                          <Select 
                            value={item.nameOfMaterial} 
                            onValueChange={(value) => {
                              const material = availableMaterials.find(m => m.name === value);
                              if (material) {
                                const newItems = [...formData.items];
                                newItems[index] = {
                                  ...item,
                                  nameOfMaterial: material.name,
                                  existingStock: material.currentStock,
                                  unit: material.unit,
                                  stockAfterIssue: material.currentStock - Number(item.issuedQty || 0)
                                };
                                setFormData(prev => ({ ...prev, items: newItems }));
                              }
                            }}
                          >
                            <SelectTrigger className="border-0 p-0 h-auto text-xs">
                              <SelectValue placeholder="Select Material" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableMaterials.map((material) => (
                                <SelectItem key={material.id} value={material.name}>
                                  <div className="flex flex-col">
                                    <div className="font-semibold text-xs">{material.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Stock: {material.currentStock} {material.unit} • {material.make}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`nameOfMaterial_${index}`] && (
                            <p className="text-destructive text-xs mt-1">{errors[`nameOfMaterial_${index}`]}</p>
                          )}
                        </TableCell>
                        <TableCell className="border border-gray-300 text-center px-2 py-1">
                          <div className="font-semibold text-xs">
                            {item.existingStock} {item.unit}
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-300 text-center px-2 py-1">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={item.issuedQty}
                              onChange={(e) => {
                                const issuedQty = Number(e.target.value) || 0;
                                const newItems = [...formData.items];
                                newItems[index] = {
                                  ...item,
                                  issuedQty: e.target.value,
                                  stockAfterIssue: item.existingStock - issuedQty
                                };
                                setFormData(prev => ({ ...prev, items: newItems }));
                              }}
                              placeholder="Qty"
                              min="0"
                              max={item.existingStock}
                              className="border-0 p-2 h-10 w-16 text-center text-sm outline-none focus:outline-none hover:outline-none active:outline-none focus:ring-0 rounded-sm"
                            />
                            <span className="text-xs text-gray-600">{item.unit}</span>
                          </div>
                          {errors[`issuedQty_${index}`] && (
                            <p className="text-destructive text-xs mt-1">{errors[`issuedQty_${index}`]}</p>
                          )}
                        </TableCell>
                        <TableCell className="border border-gray-300 text-center px-2 py-1">
                          <div className="font-semibold text-xs">
                            {item.stockAfterIssue} {item.unit}
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-300 px-2 py-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (formData.items.length > 1) {
                                const newItems = formData.items.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, items: newItems }));
                              }
                            }}
                            disabled={formData.items.length === 1}
                            className="gap-1 text-xs h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Signature Section - Compact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4">
                {/* Issuing Person */}
                <div className="border border-gray-300">
                  <div className="bg-gray-50 border-b border-gray-300 p-2">
                    <div className="font-semibold text-center text-xs">ISSUING PERSON NAME</div>
                    <div className="text-center text-xs">DESIGNATION</div>
                  </div>
                  <div className="p-3 space-y-2">
                    <Input
                      value={formData.issuingPersonName}
                      onChange={(e) => handleInputChange("issuingPersonName", e.target.value)}
                      placeholder="Enter Issuing Person Name"
                      className="text-center text-sm h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] transition-all duration-200"
                    />
                    <Input
                      value={formData.issuingPersonDesignation}
                      onChange={(e) => handleInputChange("issuingPersonDesignation", e.target.value)}
                      placeholder="Designation"
                      className="text-center text-sm h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] transition-all duration-200"
                    />
                    
                  </div>
                </div>

                {/* Receiver */}
                <div className="border border-gray-300">
                  <div className="bg-gray-50 border-b border-gray-300 p-2">
                    <div className="font-semibold text-center text-xs">RECEIVER NAME</div>
                    <div className="text-center text-xs">DESIGNATION</div>
                  </div>
                  <div className="p-3 space-y-2">
                    <Input
                      value={formData.receiverName}
                      onChange={(e) => handleInputChange("receiverName", e.target.value)}
                      placeholder="Enter Receiver Name"
                      className="text-center text-sm h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] transition-all duration-200"
                    />
                    <Input
                      value={formData.receiverDesignation}
                      onChange={(e) => handleInputChange("receiverDesignation", e.target.value)}
                      placeholder="Designation"
                      className="text-center text-sm h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] transition-all duration-200"
                    />
                   
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information - Compact */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="purpose" className="text-xs">Purpose of Issue *</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the purpose for this material issue"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  className="min-h-[60px] px-4 py-3 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200"
                />
                {errors.purpose && <p className="text-destructive text-xs">{errors.purpose}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or special instructions"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="min-h-[60px] px-4 py-3 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Requested By</Label>
                  <div className="input-friendly bg-secondary text-center py-2 font-semibold text-xs">
                    {formData.requestedBy}
                  </div>
                </div>
               
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <div className="input-friendly bg-secondary text-center py-2 font-semibold text-xs">
                    {new Date(formData.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions - Compact */}
          <div className="flex justify-center gap-3 pt-3">
            <Button type="submit" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              Submit Form
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="gap-2" size="sm">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
