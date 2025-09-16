import { useState } from "react";
import { Settings, Save, X, Calendar, MapPin, Wrench, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "../hooks/use-toast";

interface AddMachineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (machineData: any) => void;
}

export const AddMachineForm = ({ isOpen, onClose, onSubmit }: AddMachineFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    customType: "",
    location: "",
    customLocation: "",
    status: "Active",
    specifications: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    capacity: "",
    powerRating: "",
    operatingVoltage: "",
    installationDate: "",
    lastMaintenance: "",
    nextMaintenance: "",
    maintenanceInterval: "",
    notes: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const machineTypes = [
    "Roller Flour Mill",
    "Rotary Sifter", 
    "Belt Conveyor",
    "Auto Packaging Machine",
    "Grain Cleaning Machine",
    "Steel Processing Unit",
    "Hydraulic Press",
    "Assembly Robot",
    "Concrete Mixer",
    "Welding Station",
    "Other"
  ];

  const locations = [
    "Production Floor A",
    "Production Floor B", 
    "Processing Line B",
    "Transport Line",
    "Packaging Floor",
    "Pre-processing Area",
    "Assembly Line",
    "Construction Site",
    "Fabrication Shop",
    "Maintenance Workshop",
    "Storage Area",
    "Other"
  ];

  const statusOptions = [
    { value: "Active", label: "Active", description: "Machine is operational" },
    { value: "Maintenance", label: "Under Maintenance", description: "Currently being serviced" },
    { value: "Inactive", label: "Inactive", description: "Not in use" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear custom field if not selecting "Other"
    if (value !== "Other") {
      if (field === "type") setFormData(prev => ({ ...prev, customType: "" }));
      if (field === "location") setFormData(prev => ({ ...prev, customLocation: "" }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Machine name is required";
    if (!formData.type) newErrors.type = "Machine type is required";
    if (formData.type === "Other" && !formData.customType.trim()) {
      newErrors.customType = "Custom machine type is required";
    }
    if (!formData.location) newErrors.location = "Location is required";
    if (formData.location === "Other" && !formData.customLocation.trim()) {
      newErrors.customLocation = "Custom location is required";
    }
    if (!formData.specifications.trim()) newErrors.specifications = "Specifications are required";
    if (!formData.manufacturer.trim()) newErrors.manufacturer = "Manufacturer is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const machineData = {
        ...formData,
        id: Date.now(), // Generate a temporary ID
        type: formData.type === "Other" ? formData.customType : formData.type,
        location: formData.location === "Other" ? formData.customLocation : formData.location,
        createdDate: new Date().toISOString().split('T')[0],
        lastMaintenance: formData.lastMaintenance || new Date().toISOString().split('T')[0]
      };
      
      onSubmit(machineData);
      
      toast({
        title: "Machine Added Successfully",
        description: `${formData.name} has been added to the inventory.`,
      });
      
      // Reset form
      setFormData({
        name: "",
        type: "",
        customType: "",
        location: "",
        customLocation: "",
        status: "Active",
        specifications: "",
        manufacturer: "",
        model: "",
        serialNumber: "",
        purchaseDate: "",
        warrantyExpiry: "",
        capacity: "",
        powerRating: "",
        operatingVoltage: "",
        installationDate: "",
        lastMaintenance: "",
        nextMaintenance: "",
        maintenanceInterval: "",
        notes: ""
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            Add New Machine
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* First Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Machine Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Flour Mill #01"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">Machine Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                    <SelectTrigger className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200">
                      <SelectValue placeholder="Select machine type" />
                    </SelectTrigger>
                    <SelectContent>
                      {machineTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.type === "Other" && (
                    <Input
                      placeholder="Enter custom machine type"
                      value={formData.customType}
                      onChange={(e) => handleInputChange("customType", e.target.value)}
                      className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200 mt-2"
                    />
                  )}
                  {errors.type && <p className="text-destructive text-sm mt-1">{errors.type}</p>}
                  {errors.customType && <p className="text-destructive text-sm mt-1">{errors.customType}</p>}
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleSelectChange("location", value)}>
                    <SelectTrigger className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200">
                      <SelectValue placeholder="Select location" />
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
                      className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200 mt-2"
                    />
                  )}
                  {errors.location && <p className="text-destructive text-sm mt-1">{errors.location}</p>}
                  {errors.customLocation && <p className="text-destructive text-sm mt-1">{errors.customLocation}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => handleInputChange("status", status.value)}
                        className={`h-8 px-3 py-1 rounded-[5px] border text-left transition-all duration-200 text-xs font-medium ${
                          formData.status === status.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input bg-background hover:border-primary/50 hover:bg-muted/30"
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-2">
                <Label htmlFor="specifications" className="text-sm font-medium">Specifications *</Label>
                <Textarea
                  id="specifications"
                  placeholder="Enter detailed specifications (capacity, dimensions, technical details, etc.)"
                  value={formData.specifications}
                  onChange={(e) => handleInputChange("specifications", e.target.value)}
                  className="min-h-[60px] px-4 py-3 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200"
                />
                {errors.specifications && <p className="text-destructive text-sm mt-1">{errors.specifications}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Manufacturing Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                
                Manufacturing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="text-sm font-medium">Manufacturer *</Label>
                  <Input
                    id="manufacturer"
                    placeholder="e.g., Bosch, Siemens, etc."
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                  {errors.manufacturer && <p className="text-destructive text-sm mt-1">{errors.manufacturer}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium">Model</Label>
                  <Input
                    id="model"
                    placeholder="Model number"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialNumber" className="text-sm font-medium">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    placeholder="Serial number"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseDate" className="text-sm font-medium">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warrantyExpiry" className="text-sm font-medium">Warranty Expiry</Label>
                  <Input
                    id="warrantyExpiry"
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => handleInputChange("warrantyExpiry", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installationDate" className="text-sm font-medium">Installation Date</Label>
                  <Input
                    id="installationDate"
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => handleInputChange("installationDate", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-sm font-medium">Capacity</Label>
                  <Input
                    id="capacity"
                    placeholder="e.g., 500kg/hour"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="powerRating" className="text-sm font-medium">Power Rating</Label>
                  <Input
                    id="powerRating"
                    placeholder="e.g., 5kW"
                    value={formData.powerRating}
                    onChange={(e) => handleInputChange("powerRating", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operatingVoltage" className="text-sm font-medium">Operating Voltage</Label>
                  <Input
                    id="operatingVoltage"
                    placeholder="e.g., 415V"
                    value={formData.operatingVoltage}
                    onChange={(e) => handleInputChange("operatingVoltage", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
             
                Maintenance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lastMaintenance" className="text-sm font-medium">Last Maintenance</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={formData.lastMaintenance}
                    onChange={(e) => handleInputChange("lastMaintenance", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextMaintenance" className="text-sm font-medium">Next Maintenance</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={formData.nextMaintenance}
                    onChange={(e) => handleInputChange("nextMaintenance", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceInterval" className="text-sm font-medium">Maintenance Interval</Label>
                  <Input
                    id="maintenanceInterval"
                    placeholder="e.g., 3 months"
                    value={formData.maintenanceInterval}
                    onChange={(e) => handleInputChange("maintenanceInterval", e.target.value)}
                    className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about the machine"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="min-h-[50px] px-4 py-3 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="h-11 px-6">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="h-11 px-6 bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 