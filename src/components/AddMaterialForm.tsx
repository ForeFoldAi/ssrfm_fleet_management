import { useState } from "react";
import { Package, Save, X, Truck, AlertTriangle, Plus } from "lucide-react";
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
    customCategory: "",
    specifications: "",
    unit: "",
    customUnit: "",
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
    customLocation: "",
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

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear custom field if not selecting "Other"/"other"
    if (value !== "Other" && value !== "other") {
      if (field === "category") setFormData(prev => ({ ...prev, customCategory: "" }));
      if (field === "unit") setFormData(prev => ({ ...prev, customUnit: "" }));
      if (field === "location") setFormData(prev => ({ ...prev, customLocation: "" }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Material name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.category === "Other" && !formData.customCategory.trim()) {
      newErrors.customCategory = "Custom category is required";
    }
    if (!formData.specifications.trim()) newErrors.specifications = "Specifications are required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (formData.unit === "other" && !formData.customUnit.trim()) {
      newErrors.customUnit = "Custom unit is required";
    }
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
        category: formData.category === "Other" ? formData.customCategory : formData.category,
        unit: formData.unit === "other" ? formData.customUnit : formData.unit,
        location: formData.location === "Other" ? formData.customLocation : formData.location,
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
        customCategory: "",
        specifications: "",
        unit: "",
        customUnit: "",
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
        customLocation: "",
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            Add New Material
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* First Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium">Material Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Steel Rods (20mm)"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.category === "Other" && (
                    <Input
                      placeholder="Enter custom category"
                      value={formData.customCategory}
                      onChange={(e) => handleInputChange("customCategory", e.target.value)}
                      className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200 mt-1"
                    />
                  )}
                  {errors.category && <p className="text-destructive text-xs mt-1">{errors.category}</p>}
                  {errors.customCategory && <p className="text-destructive text-xs mt-1">{errors.customCategory}</p>}
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="unit" className="text-sm font-medium">Measure Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleSelectChange("unit", value)}>
                    <SelectTrigger className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200">
                      <SelectValue placeholder="Select Measure unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.unit === "other" && (
                    <Input
                      placeholder="Enter custom unit"
                      value={formData.customUnit}
                      onChange={(e) => handleInputChange("customUnit", e.target.value)}
                      className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200 mt-1"
                    />
                  )}
                  {errors.unit && <p className="text-destructive text-xs mt-1">{errors.unit}</p>}
                  {errors.customUnit && <p className="text-destructive text-xs mt-1">{errors.customUnit}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="maker" className="text-sm font-medium">Maker/Brand *</Label>
                  <Input
                    id="maker"
                    placeholder="e.g., SteelCorp Industries"
                    value={formData.maker}
                    onChange={(e) => handleInputChange("maker", e.target.value)}
                    className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                  {errors.maker && <p className="text-destructive text-xs mt-1">{errors.maker}</p>}
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-1">
                <Label htmlFor="specifications" className="text-sm font-medium">Specifications *</Label>
                <Textarea
                  id="specifications"
                  placeholder="Enter detailed specifications (size, grade, model, technical details, etc.)"
                  value={formData.specifications}
                  onChange={(e) => handleInputChange("specifications", e.target.value)}
                  className="min-h-[50px] px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200"
                />
                {errors.specifications && <p className="text-destructive text-xs mt-1">{errors.specifications}</p>}
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="location" className="text-sm font-medium">Storage Unit</Label>
                  <Select value={formData.location} onValueChange={(value) => handleSelectChange("location", value)}>
                    <SelectTrigger className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200">
                      <SelectValue placeholder="Select storage Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.location === "Other" && (
                    <Input
                      placeholder="Enter custom location"
                      value={formData.customLocation}
                      onChange={(e) => handleInputChange("customLocation", e.target.value)}
                      className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200 mt-1"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="currentStock" className="text-sm font-medium">Current Stock *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange("currentStock", e.target.value)}
                    className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                  {errors.currentStock && <p className="text-destructive text-xs mt-1">{errors.currentStock}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="unitPrice" className="text-sm font-medium">Price (₹)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                    className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                  {errors.unitPrice && <p className="text-destructive text-xs mt-1">{errors.unitPrice}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 px-4">
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button type="submit" className="h-9 px-4 bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-1" />
              Add Material
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 