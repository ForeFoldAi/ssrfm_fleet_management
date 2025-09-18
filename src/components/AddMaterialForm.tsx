import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { } from 'lucide-react';
import { useStock } from '@/contexts/StockContext';

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
    measureUnit: "",
    customMeasureUnit: "",
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

  const measureUnits = [
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.name.trim()) newErrors.name = "Material name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.category === "Other" && !formData.customCategory.trim()) {
      newErrors.customCategory = "Custom category is required";
    }
    if (!formData.specifications.trim()) newErrors.specifications = "Specifications are required";
    if (!formData.measureUnit) newErrors.measureUnit = "Measure Unit is required";
    if (formData.measureUnit === "other" && !formData.customMeasureUnit.trim()) {
      newErrors.customMeasureUnit = "Custom measure unit is required";
    }
    if (!formData.maker.trim()) newErrors.maker = "Maker/Brand is required";
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier is required";
    if (!formData.supplierContact.trim()) newErrors.supplierContact = "Supplier contact is required";
    if (!formData.currentStock.trim()) newErrors.currentStock = "Current stock is required";
    if (!formData.minStock.trim()) newErrors.minStock = "Minimum stock is required";
    if (!formData.maxStock.trim()) newErrors.maxStock = "Maximum stock is required";
    if (!formData.reorderLevel.trim()) newErrors.reorderLevel = "Reorder level is required";
    if (!formData.leadTime.trim()) newErrors.leadTime = "Lead time is required";
    if (formData.location === "Other" && !formData.customLocation.trim()) {
      newErrors.customLocation = "Custom location is required";
    }

    // Numeric validations
    if (formData.currentStock && isNaN(Number(formData.currentStock))) {
      newErrors.currentStock = "Current stock must be a number";
    }
    if (formData.minStock && isNaN(Number(formData.minStock))) {
      newErrors.minStock = "Minimum stock must be a number";
    }
    if (formData.maxStock && isNaN(Number(formData.maxStock))) {
      newErrors.maxStock = "Maximum stock must be a number";
    }
    if (formData.reorderLevel && isNaN(Number(formData.reorderLevel))) {
      newErrors.reorderLevel = "Reorder level must be a number";
    }
    if (formData.unitPrice && isNaN(Number(formData.unitPrice))) {
      newErrors.unitPrice = "Unit price must be a number";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const currentStockNum = Number(formData.currentStock);
    
    const materialData = {
      id: `MAT-${Date.now()}`,
      name: formData.name,
      category: formData.category === "Other" ? formData.customCategory : formData.category,
      specifications: formData.specifications,
      measureUnit: formData.measureUnit === "other" ? formData.customMeasureUnit : formData.measureUnit,
      maker: formData.maker,
      supplier: formData.supplier,
      supplierContact: formData.supplierContact,
      unitPrice: formData.unitPrice ? `₹${formData.unitPrice}` : "",
      totalValue: formData.unitPrice ? `₹${(currentStockNum * Number(formData.unitPrice)).toLocaleString()}` : "",
      currentStock: currentStockNum,
      minStock: Number(formData.minStock),
      maxStock: Number(formData.maxStock),
      reorderLevel: Number(formData.reorderLevel),
      leadTime: formData.leadTime,
      location: formData.location === "Other" ? formData.customLocation : formData.location,
      partNumber: formData.partNumber,
      description: formData.description,
      notes: formData.notes,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: currentStockNum <= Number(formData.minStock) ? 'low' : 'good'
    };

    onSubmit(materialData);
    
    // Reset form
    setFormData({
      name: "",
      category: "",
      customCategory: "",
      specifications: "",
      measureUnit: "",
      customMeasureUnit: "",
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
  };

  const handleClose = () => {
    setFormData({
      name: "",
      category: "",
      customCategory: "",
      specifications: "",
      measureUnit: "",
      customMeasureUnit: "",
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Add New Material</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6 rounded-sm opacity-70 hover:opacity-100"
          >
           
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Material Information Section */}
          <div className="space-y-4">
           
            {/* First Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm font-medium">Material Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter material name"
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
                <Label htmlFor="measureUnit" className="text-sm font-medium">Measure Unit *</Label>
                <Select value={formData.measureUnit} onValueChange={(value) => handleSelectChange("measureUnit", value)}>
                  <SelectTrigger className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200">
                    <SelectValue placeholder="Select Measure unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {measureUnits.map((measureUnit) => (
                      <SelectItem key={measureUnit} value={measureUnit}>{measureUnit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.measureUnit === "other" && (
                  <Input
                    placeholder="Enter custom measure unit"
                    value={formData.customMeasureUnit}
                    onChange={(e) => handleInputChange("customMeasureUnit", e.target.value)}
                    className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200 mt-1"
                  />
                )}
                {errors.measureUnit && <p className="text-destructive text-xs mt-1">{errors.measureUnit}</p>}
                {errors.customMeasureUnit && <p className="text-destructive text-xs mt-1">{errors.customMeasureUnit}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="maker" className="text-sm font-medium">Maker/Brand</Label>
                <Input
                  id="maker"
                  placeholder="Enter maker or brand name"
                  value={formData.maker}
                  onChange={(e) => handleInputChange("maker", e.target.value)}
                  className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                />
                {errors.maker && <p className="text-destructive text-xs mt-1">{errors.maker}</p>}
              </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="currentStock" className="text-sm font-medium">Current Stock *</Label>
                <Input
                  id="currentStock"
                  type="number"
                  placeholder="0"
                  value={formData.currentStock}
                  onChange={(e) => handleInputChange("currentStock", e.target.value)}
                  className="h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                />
                {errors.currentStock && <p className="text-destructive text-xs mt-1">{errors.currentStock}</p>}
              </div>

            {/* Specifications */}
            <div className="space-y-1">
              <Label htmlFor="specifications" className="text-sm font-medium">Specifications *</Label>
              <Textarea
                id="specifications"
                placeholder="Enter detailed specifications and technical details"
                value={formData.specifications}
                onChange={(e) => handleInputChange("specifications", e.target.value)}
                className="min-h-[80px] px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
              />
              {errors.specifications && <p className="text-destructive text-xs mt-1">{errors.specifications}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes and remarks"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="min-h-[60px] px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Material
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
