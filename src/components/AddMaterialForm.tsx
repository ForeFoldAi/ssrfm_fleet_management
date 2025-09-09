import { useState } from "react";
import { Package, Save, X, Truck, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "../hooks/use-toast";

interface AddMaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (materialData: any) => void;
}

export const AddMaterialForm = ({ isOpen, onClose, onSubmit }: AddMaterialFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    specifications: "",
    unit: "",
    maker: "",
    supplier: "",
    supplierContact: "",
    unitPrice: "",
    currentStock: "",
    minStock: "",
    maxStock: "",
    reorderLevel: "",
    leadTime: "",
    location: "",
    partNumber: "",
    description: "",
    notes: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    "Mechanical Components",
    "Lubricants",
    "Adhesives & Sealants",
    "Processing Equipment",
    "Electrical",
    "Safety",
    "Raw Materials",
    "Consumables",
    "Spare Parts",
    "Tools",
    "Other"
  ];

  const units = [
    "pieces",
    "kg",
    "liters",
    "tons",
    "meters",
    "boxes",
    "sets",
    "rolls",
    "bottles",
    "packets",
    "units",
    "gallons",
    "feet",
    "inches",
    "other"
  ];

  const locations = [
    "Parts Storage A-1",
    "Parts Storage A-2",
    "Chemical Storage B-1",
    "Chemical Storage B-2",
    "Equipment Storage C-1",
    "Equipment Storage C-2",
    "Raw Material Storage",
    "Finished Goods Storage",
    "Maintenance Workshop",
    "Production Floor A",
    "Production Floor B",
    "Other"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Material name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.specifications.trim()) newErrors.specifications = "Specifications are required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.maker.trim()) newErrors.maker = "Maker/Brand is required";
    if (!formData.currentStock.trim()) newErrors.currentStock = "Current stock is required";
    if (!formData.minStock.trim()) newErrors.minStock = "Minimum stock level is required";
    
    // Validate numeric fields
    if (formData.currentStock && isNaN(Number(formData.currentStock))) {
      newErrors.currentStock = "Current stock must be a number";
    }
    if (formData.minStock && isNaN(Number(formData.minStock))) {
      newErrors.minStock = "Minimum stock must be a number";
    }
    if (formData.maxStock && isNaN(Number(formData.maxStock))) {
      newErrors.maxStock = "Maximum stock must be a number";
    }
    if (formData.unitPrice && isNaN(Number(formData.unitPrice))) {
      newErrors.unitPrice = "Unit price must be a number";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const currentStockNum = Number(formData.currentStock);
      const minStockNum = Number(formData.minStock);
      
      let status = "In Stock";
      if (currentStockNum === 0) {
        status = "Out of Stock";
      } else if (currentStockNum <= minStockNum) {
        status = "Low Stock";
      }
      
      const materialData = {
        ...formData,
        id: Date.now(), // Generate a temporary ID
        currentStock: currentStockNum,
        minStock: minStockNum,
        maxStock: formData.maxStock ? Number(formData.maxStock) : null,
        unitPrice: formData.unitPrice ? `₹${formData.unitPrice}` : "",
        totalValue: formData.unitPrice ? `₹${(currentStockNum * Number(formData.unitPrice)).toLocaleString()}` : "",
        status,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      onSubmit(materialData);
      
      toast({
        title: "Material Added Successfully",
        description: `${formData.name} has been added to the inventory.`,
      });
      
      // Reset form
      setFormData({
        name: "",
        category: "",
        specifications: "",
        unit: "",
        maker: "",
        supplier: "",
        supplierContact: "",
        unitPrice: "",
        currentStock: "",
        minStock: "",
        maxStock: "",
        reorderLevel: "",
        leadTime: "",
        location: "",
        partNumber: "",
        description: "",
        notes: ""
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            Add New Material
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Material Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Steel Rods (20mm)"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="input-friendly"
                  />
                  {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="input-friendly">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-destructive text-sm">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                    <SelectTrigger className="input-friendly">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit && <p className="text-destructive text-sm">{errors.unit}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maker">Maker/Brand *</Label>
                  <Input
                    id="maker"
                    placeholder="e.g., SteelCorp Industries"
                    value={formData.maker}
                    onChange={(e) => handleInputChange("maker", e.target.value)}
                    className="input-friendly"
                  />
                  {errors.maker && <p className="text-destructive text-sm">{errors.maker}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Specifications *</Label>
                <Textarea
                  id="specifications"
                  placeholder="Enter detailed specifications (size, grade, model, technical details, etc.)"
                  value={formData.specifications}
                  onChange={(e) => handleInputChange("specifications", e.target.value)}
                  className="input-friendly min-h-[100px]"
                />
                {errors.specifications && <p className="text-destructive text-sm">{errors.specifications}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partNumber">Part Number</Label>
                  <Input
                    id="partNumber"
                    placeholder="Manufacturer part number"
                    value={formData.partNumber}
                    onChange={(e) => handleInputChange("partNumber", e.target.value)}
                    className="input-friendly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Storage Location</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger className="input-friendly">
                      <SelectValue placeholder="Select storage location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Stock Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Current Stock *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange("currentStock", e.target.value)}
                    className="input-friendly"
                  />
                  {errors.currentStock && <p className="text-destructive text-sm">{errors.currentStock}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStock">Min Stock *</Label>
                  <Input
                    id="minStock"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange("minStock", e.target.value)}
                    className="input-friendly"
                  />
                  {errors.minStock && <p className="text-destructive text-sm">{errors.minStock}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStock">Max Stock</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.maxStock}
                    onChange={(e) => handleInputChange("maxStock", e.target.value)}
                    className="input-friendly"
                  />
                  {errors.maxStock && <p className="text-destructive text-sm">{errors.maxStock}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorderLevel">Reorder Level</Label>
                  <Input
                    id="reorderLevel"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={(e) => handleInputChange("reorderLevel", e.target.value)}
                    className="input-friendly"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                    className="input-friendly"
                  />
                  {errors.unitPrice && <p className="text-destructive text-sm">{errors.unitPrice}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadTime">Lead Time</Label>
                  <Input
                    id="leadTime"
                    placeholder="e.g., 5 days"
                    value={formData.leadTime}
                    onChange={(e) => handleInputChange("leadTime", e.target.value)}
                    className="input-friendly"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Supplier Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    placeholder="Supplier company name"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange("supplier", e.target.value)}
                    className="input-friendly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplierContact">Supplier Contact</Label>
                  <Input
                    id="supplierContact"
                    placeholder="Phone number or email"
                    value={formData.supplierContact}
                    onChange={(e) => handleInputChange("supplierContact", e.target.value)}
                    className="input-friendly"
                  />
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the material and its uses"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="input-friendly min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information, special handling requirements, etc."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="input-friendly min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 