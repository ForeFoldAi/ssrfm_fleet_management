import logo from "/logo.png";
import { useState, useEffect } from "react";
import { Package, Save, X, User, Calendar, CheckCircle, AlertCircle, FileText, Building2, Trash2, Plus, Edit } from "lucide-react";
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
  editingIssue?: any;
}

export const MaterialIssueForm = ({ isOpen, onClose, onSubmit, editingIssue }: MaterialIssueFormProps) => {
  const { currentUser } = useRole();
  
  // Helper function to generate form serial number
  const generateFormSerialNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Generate a random 3-digit number for the form
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `ssrfm/unit-1/I-${dateStr}${randomNum}`;
  };

  const [formData, setFormData] = useState({
    // Document Information (matching the physical form)
    date: new Date().toISOString().split('T')[0],
    materialIssueFormSrNo: generateFormSerialNumber(),
    reqFormSrNo: `ssrfm/unit-1/REQ-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}001`,
    indFormSrNo: `ssrfm/unit-1/IND-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}001`,
    
    // Material items (supporting multiple items like in the physical form)
    items: [
      {
        srNo: 1,
        nameOfMaterial: "",
        existingStock: 0,
        issuedQty: "",
        stockAfterIssue: 0,
        measureUnit: "",
        receiverName: "",
        image: "",
        purpose: ""
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
    issuedBy: currentUser?.name || "",
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (editingIssue && isOpen) {
      setFormData({
        date: editingIssue.issuedDate,
        materialIssueFormSrNo: editingIssue.materialIssueFormSrNo,
        reqFormSrNo: `ssrfm/unit-1/REQ-${new Date(editingIssue.issuedDate).toISOString().slice(2, 10).replace(/-/g, '')}001`,
        indFormSrNo: `ssrfm/unit-1/IND-${new Date(editingIssue.issuedDate).toISOString().slice(2, 10).replace(/-/g, '')}001`,
        items: [
          {
            srNo: 1,
            nameOfMaterial: editingIssue.materialName,
            existingStock: editingIssue.existingStock,
            issuedQty: editingIssue.issuedQuantity.toString(),
            stockAfterIssue: editingIssue.stockAfterIssue,
            measureUnit: editingIssue.measureUnit || editingIssue.unit,
            receiverName: editingIssue.recipientName,
            image: "",
            purpose: editingIssue.purpose
          }
        ],
        issuingPersonName: editingIssue.issuingPersonName,
        issuingPersonDesignation: editingIssue.issuingPersonDesignation,
        receiverName: editingIssue.recipientName,
        receiverDesignation: editingIssue.recipientDesignation,
        purpose: editingIssue.purpose,
        notes: "",
        requestedBy: currentUser?.name || "",
        issuedBy: currentUser?.name || "",
      });
    } else if (!editingIssue && isOpen) {
      // Reset form for new issue
      setFormData({
        date: new Date().toISOString().split('T')[0],
        materialIssueFormSrNo: generateFormSerialNumber(),
        reqFormSrNo: `ssrfm/unit-1/REQ-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}001`,
        indFormSrNo: `ssrfm/unit-1/IND-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}001`,
        items: [
          {
            srNo: 1,
            nameOfMaterial: "",
            existingStock: 0,
            issuedQty: "",
            stockAfterIssue: 0,
            measureUnit: "",
            receiverName: "",
            image: "",
            purpose: ""
          }
        ],
        issuingPersonName: "",
        issuingPersonDesignation: "", 
        receiverName: "",
        receiverDesignation: "",
        purpose: "",
        notes: "",
        requestedBy: currentUser?.name || "",
        issuedBy: currentUser?.name || "",
      });
    }
  }, [editingIssue, isOpen, currentUser]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  // Available materials with current stock (matching the physical form in the image)
  const availableMaterials = [
    {
      id: "MAT-001",
      name: "fevicol",
      make: "MARINE",
      specifications: "SH adhesive",
      measureUnit: "KG",
      currentStock: 1,
      
    },
    {
      id: "MAT-002", 
      name: "wire brush",
      make: "INDUSTRIAL",
      specifications: "0.01 mm thickness of wire",
      measureUnit: "pieces",
      currentStock: 2,
      location: "Tools Storage"
    },
    {
      id: "MAT-003",
      name: "dholak ball", 
      make: "INDUSTRIAL",
      specifications: "PVC transparent",
      measureUnit: "pieces",
      currentStock: 200,
      location: "Components Storage"
    },
    {
      id: "MAT-004",
      name: "triangle brush",
      make: "INDUSTRIAL", 
      specifications: "Cleaning brush",
      measureUnit: "pieces",
      currentStock: 130,
      location: "Tools Storage"
    },
    {
      id: "MAT-005",
      name: "gum tape",
      make: "INDUSTRIAL",
      specifications: "1 inch width adhesive tape", 
      measureUnit: "pieces",
      currentStock: 14,
      location: "Office Supplies"
    },
    {
      id: "MAT-006",
      name: "BEARINGS (SKF 6205-2RS)",
      make: "SKF",
      specifications: "Deep Grove Ball Bearing, Inner: 25mm, Outer: 52mm",
      measureUnit: "pieces",
      currentStock: 24,
      location: "Parts Storage A-1"
    },
    {
      id: "MAT-007",
      name: "MOTOR OIL (SAE 10W-30)",
      make: "CASTROL",
      specifications: "Industrial grade lubricant for machinery",
      measureUnit: "liters",
      currentStock: 65,
      location: "Chemical Storage B-1"
    },
    {
      id: "MAT-008",
      name: "CONVEYOR BELTS",
      make: "CONTINENTAL",
      specifications: "Rubber belt, 600mm width, food grade",
      measureUnit: "meters",
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
        measureUnit: material.measureUnit,
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
    
    // Generate document numbers with new format
    const timestamp = Date.now();
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const docNo = `ssrfm/unit-1/I-${dateStr}${randomNum}`;
    const reqFormNo = `ssrfm/unit-1/REQ-${dateStr}${randomNum}`;
    const indFormNo = `ssrfm/unit-1/IND-${dateStr}${randomNum}`;
    
    const issueData = {
      ...formData,
      id: docNo,
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
    
    // Reset form with new serial numbers
    setFormData({
      date: new Date().toISOString().split('T')[0],
      materialIssueFormSrNo: generateFormSerialNumber(),
      reqFormSrNo: `ssrfm/unit-1/REQ-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}001`,
      indFormSrNo: `ssrfm/unit-1/IND-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}001`,
      items: [
        {
          srNo: 1,
          nameOfMaterial: "",
          existingStock: 0,
          issuedQty: "",
          stockAfterIssue: 0,
          measureUnit: "",
          receiverName: "",
          image: "",
          purpose: ""
        }
      ],
      issuingPersonName: "",
      issuingPersonDesignation: "", 
      receiverName: "",
      receiverDesignation: "",
      purpose: "",
      notes: "",
      requestedBy: currentUser?.name || "",
      issuedBy: currentUser?.name || "",
      
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
              <div className="text-base font-bold">
                {editingIssue ? "EDIT MATERIAL ISSUE FORM" : "MATERIAL ISSUE FORM"}
              </div>
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
                  measureUnit: "",
                  receiverName: "",
                  image: "",
                  purpose: ""
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
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">CURRENT STOCK</TableHead>
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">ISSUED QTY</TableHead>
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">STOCK AFTER ISSUE</TableHead>
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">RECEIVER NAME</TableHead>
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">IMAGE</TableHead>
                      <TableHead className="border border-gray-300 font-semibold text-xs px-2 py-1">PURPOSE OF ISSUE</TableHead>
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
                                  measureUnit: material.measureUnit,
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
                                  {material.name}
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
                            {item.existingStock} {item.measureUnit}
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
                            <span className="text-xs text-gray-600">{item.measureUnit}</span>
                          </div>
                          {errors[`issuedQty_${index}`] && (
                            <p className="text-destructive text-xs mt-1">{errors[`issuedQty_${index}`]}</p>
                          )}
                        </TableCell>
                        <TableCell className="border border-gray-300 text-center px-2 py-1">
                          <div className="font-semibold text-xs">
                            {item.stockAfterIssue} {item.measureUnit}
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-300 px-2 py-1">
                          <Input
                            value={item.receiverName}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index] = {
                                ...item,
                                receiverName: e.target.value
                              };
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            placeholder="Receiver Name"
                            className="border-0 p-1 h-8 text-xs outline-none focus:outline-none focus:ring-0 rounded-sm"
                          />
                        </TableCell>
                        <TableCell className="border border-gray-300 px-2 py-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const newItems = [...formData.items];
                                newItems[index] = {
                                  ...item,
                                  image: file.name
                                };
                                setFormData(prev => ({ ...prev, items: newItems }));
                              }
                            }}
                            className="border-0 p-1 h-8 text-xs outline-none focus:outline-none focus:ring-0 rounded-sm"
                          />
                        </TableCell>
                        <TableCell className="border border-gray-300 px-2 py-1">
                          <Input
                            value={item.purpose}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index] = {
                                ...item,
                                purpose: e.target.value
                              };
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            placeholder="Purpose"
                            className="border-0 p-1 h-8 text-xs outline-none focus:outline-none focus:ring-0 rounded-sm"
                          />
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
              
            </CardContent>
          </Card>

          {/* Additional Information - Compact */}
          <Card>
            
            <CardContent className="space-y-3">
              

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
                  <Label className="text-xs">Issued By</Label>
                  <div className="input-friendly bg-secondary text-center py-2 font-semibold text-xs">
                    {formData.issuedBy}
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
              {editingIssue ? "Update Form" : "Submit Form"}
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
