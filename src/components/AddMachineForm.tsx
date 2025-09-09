import { useState } from "react";
import { Settings, Save, X, Calendar, MapPin, Wrench } from "lucide-react";
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
    location: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Machine name is required";
    if (!formData.type) newErrors.type = "Machine type is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.specifications.trim()) newErrors.specifications = "Specifications are required";
    if (!formData.manufacturer.trim()) newErrors.manufacturer = "Manufacturer is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const machineData = {
        ...formData,
        id: Date.now(), // Generate a temporary ID
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
        location: "",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            Add New Machine
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
                  <Label htmlFor="name">Machine Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Flour Mill #01"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="input-friendly"
                  />
                  {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Machine Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger className="input-friendly">
                      <SelectValue placeholder="Select machine type" />
                    </SelectTrigger>
                    <SelectContent>
                      {machineTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-destructive text-sm">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger className="input-friendly">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && <p className="text-destructive text-sm">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => handleInputChange("status", status.value)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                          formData.status === status.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium">{status.label}</div>
                        <div className="text-sm text-muted-foreground">{status.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Specifications *</Label>
                <Textarea
                  id="specifications"
                  placeholder="Enter detailed specifications (capacity, dimensions, technical details, etc.)"
                  value={formData.specifications}
                  onChange={(e) => handleInputChange("specifications", e.target.value)}
                  className="input-friendly min-h-[100px]"
                />
                {errors.specifications && <p className="text-destructive text-sm">{errors.specifications}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Manufacturing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manufacturing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer *</Label>
                  <Input
                    id="manufacturer"
                    placeholder="e.g., Bosch, Siemens, etc."
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                    className="input-friendly"
                  />
                  {errors.manufacturer && <p className="text-destructive text-sm">{errors.manufacturer}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="Model number"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    className="input-friendly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    placeholder="Serial number"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                    className="input-friendly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                    className="input-friendly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                  <Input
                    id="warrantyExpiry"
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => handleInputChange("warrantyExpiry", e.target.value)}
                    className="input-friendly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installationDate">Installation Date</Label>
                  <Input
                    id="installationDate"
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => handleInputChange("installationDate", e.target.value)}
                    className="input-friendly"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    placeholder="e.g., 500kg/hour"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                    className="input-friendly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="powerRating">Power Rating</Label>
                  <Input
                    id="powerRating"
                    placeholder="e.g., 5kW"
                    value={formData.powerRating}
                    onChange={(e) => handleInputChange("powerRating", e.target.value)}
                    className="input-friendly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operatingVoltage">Operating Voltage</Label>
                  <Input
                    id="operatingVoltage"
                    placeholder="e.g., 415V"
                    value={formData.operatingVoltage}
                    onChange={(e) => handleInputChange("operatingVoltage", e.target.value)}
                    className="input-friendly"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Maintenance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={formData.lastMaintenance}
                    onChange={(e) => handleInputChange("lastMaintenance", e.target.value)}
                    className="input-friendly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={formData.nextMaintenance}
                    onChange={(e) => handleInputChange("nextMaintenance", e.target.value)}
                    className="input-friendly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceInterval">Maintenance Interval</Label>
                  <Input
                    id="maintenanceInterval"
                    placeholder="e.g., 3 months"
                    value={formData.maintenanceInterval}
                    onChange={(e) => handleInputChange("maintenanceInterval", e.target.value)}
                    className="input-friendly"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about the machine"
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
              Add Machine
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 