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
    department: currentUser?.department || ""
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
      department: currentUser?.department || ""
    });
    setSelectedMaterial(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold">MATERIAL ISSUE FORM</div>
              <div className="text-sm text-muted-foreground">AGAINST REQUISITION AND INDENT FORM</div>
            </div>
            <Badge variant="secondary" className="ml-auto">SSRFM Industries</Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Company Header - Matching MaterialRequest Style */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-blue-800">SREE SAI ROLLER FLOUR MILLS PVT LTD</h1>
                  <p className="text-lg text-blue-600">MATERIAL ISSUE FORM AGAINST REQUISITION AND INDENT FORM</p>
                </div>
              </div>
              
              {/* Document Information - Matching MaterialRequest Grid Layout */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm bg-white p-4 rounded border">
                <div>
                  <span className="font-semibold">DATE:</span>
                  <div>{new Date(formData.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="font-semibold">MATERIAL ISSUE FORM SR.N.:</span>
                  <div className="font-mono text-xs">{formData.materialIssueFormSrNo}</div>
                </div>
                <div>
                  <span className="font-semibold">REQ.FORM SR. NO.:</span>
                  <div className="font-mono text-xs">{formData.reqFormSrNo}</div>
                </div>
                <div>
                  <span className="font-semibold">IND. FORM SR NO.:</span>
                  <div className="font-mono text-xs">{formData.indFormSrNo}</div>
                </div>
                <div>
                  <span className="font-semibold">REVISION STATUS:</span>
                  <div>0</div>
                </div>
                <div>
                  <span className="font-semibold">PAGE:</span>
                  <div>1 OF 1</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Item Button - Matching MaterialRequest Style */}
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
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Item
            </Button>
          </div>

          {/* Material Items Table - Matching MaterialRequest Table Style */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="border border-gray-300 font-semibold">SR.NO.</TableHead>
                      <TableHead className="border border-gray-300 font-semibold">NAME OF THE MATERIAL</TableHead>
                      <TableHead className="border border-gray-300 font-semibold">EXISTING STOCK</TableHead>
                      <TableHead className="border border-gray-300 font-semibold">ISSUED QTY</TableHead>
                      <TableHead className="border border-gray-300 font-semibold">STOCK AFTER ISSUE</TableHead>
                      <TableHead className="border border-gray-300 font-semibold">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="border border-gray-300 text-center font-semibold">
                          {item.srNo}
                        </TableCell>
                        <TableCell className="border border-gray-300">
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
                            <SelectTrigger className="border-0 p-0 h-auto">
                              <SelectValue placeholder="Select Material" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableMaterials.map((material) => (
                                <SelectItem key={material.id} value={material.name}>
                                  <div className="flex flex-col">
                                    <div className="font-semibold">{material.name}</div>
                                    <div className="text-sm text-muted-foreground">
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
                        <TableCell className="border border-gray-300 text-center">
                          <div className="font-semibold">
                            {item.existingStock} {item.unit}
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-300 text-center">
                          <div className="flex items-center gap-2">
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
                              className="border-0 p-0 h-auto w-16 text-center"
                            />
                            <span className="text-sm text-gray-600">{item.unit}</span>
                          </div>
                          {errors[`issuedQty_${index}`] && (
                            <p className="text-destructive text-xs mt-1">{errors[`issuedQty_${index}`]}</p>
                          )}
                        </TableCell>
                        <TableCell className="border border-gray-300 text-center">
                          <div className="font-semibold">
                            {item.stockAfterIssue} {item.unit}
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-300">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Add functionality to remove item if multiple items exist
                              if (formData.items.length > 1) {
                                const newItems = formData.items.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, items: newItems }));
                              }
                            }}
                            disabled={formData.items.length === 1}
                            className="gap-1 text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Signature Section - Matching Physical Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Issuing Person */}
                <div className="border border-gray-300">
                  <div className="bg-gray-50 border-b border-gray-300 p-3">
                    <div className="font-semibold text-center">ISSUING PERSON NAME</div>
                    <div className="text-center">DESIGNATION</div>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      value={formData.issuingPersonName}
                      onChange={(e) => handleInputChange("issuingPersonName", e.target.value)}
                      placeholder="Issuing Person Name"
                      className="text-center font-semibold"
                    />
                    <Input
                      value={formData.issuingPersonDesignation}
                      onChange={(e) => handleInputChange("issuingPersonDesignation", e.target.value)}
                      placeholder="Designation"
                      className="text-center"
                    />
                    <div className="border-t border-gray-300 pt-3">
                      <div className="text-center font-semibold">SIGNATURE & DATE</div>
                      <div className="h-16 border border-gray-200 rounded mt-2 bg-gray-50"></div>
                    </div>
                  </div>
                </div>

                {/* Receiver */}
                <div className="border border-gray-300">
                  <div className="bg-gray-50 border-b border-gray-300 p-3">
                    <div className="font-semibold text-center">RECEIVER NAME</div>
                    <div className="text-center">DESIGNATION</div>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      value={formData.receiverName}
                      onChange={(e) => handleInputChange("receiverName", e.target.value)}
                      placeholder="Receiver Name"
                      className="text-center font-semibold"
                    />
                    <Input
                      value={formData.receiverDesignation}
                      onChange={(e) => handleInputChange("receiverDesignation", e.target.value)}
                      placeholder="Designation"
                      className="text-center"
                    />
                    <div className="border-t border-gray-300 pt-3">
                      <div className="text-center font-semibold">SIGNATURE & DATE</div>
                      <div className="h-16 border border-gray-200 rounded mt-2 bg-gray-50"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Issue *</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the purpose for this material issue (e.g., laboratory work, maintenance, repair, etc.)"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  className="input-friendly min-h-[100px]"
                />
                {errors.purpose && <p className="text-destructive text-sm">{errors.purpose}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or special instructions"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="input-friendly min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Requested By</Label>
                  <div className="input-friendly bg-secondary text-center py-3 font-semibold">
                    {formData.requestedBy}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <div className="input-friendly bg-secondary text-center py-3 font-semibold">
                    {formData.department}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="input-friendly bg-secondary text-center py-3 font-semibold">
                    {new Date(formData.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions - Matching MaterialRequest Style */}
          <div className="flex justify-center pt-6">
            <Button type="submit" size="lg" className="min-w-48 gap-2">
              <FileText className="w-5 h-5" />
              Submit Material Issue Form
            </Button>
          </div>
          
          <div className="flex justify-center pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
