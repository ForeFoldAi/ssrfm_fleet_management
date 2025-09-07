import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Camera, Upload, X, Eye, User, Settings, MapPin, Package } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { toast } from "../hooks/use-toast";
import { useRole } from "../contexts/RoleContext";

const MaterialRequest = () => {
  const { currentUser } = useRole();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Image upload refs and states
  const [oldMaterialPreview, setOldMaterialPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [machineProofPreview, setMachineProofPreview] = useState<string | null>(null);
  const oldMaterialInputRef = useRef<HTMLInputElement>(null);
  const oldMaterialCameraRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const signatureCameraRef = useRef<HTMLInputElement>(null);
  const machineProofInputRef = useRef<HTMLInputElement>(null);
  const machineProofCameraRef = useRef<HTMLInputElement>(null);

  // Form data state
  const [formData, setFormData] = useState({
    materialName: "",
    specifications: "",
    maker: "",
    quantity: "",
    unit: "",
    materialPurpose: "",
    priority: "",
    machineId: "",
    machineName: "",
    additionalNotes: "",
    requestedBy: currentUser?.name || "",
    requestedDate: new Date().toISOString().split('T')[0]
  });

  // SSRFM specific materials for Roller Flour Mills
  const materials = [
    { id: "bearings", name: "Bearings", unit: "pieces", category: "Mechanical Components" },
    { id: "belts", name: "Belts", unit: "pieces", category: "Mechanical Components" },
    { id: "fevicol", name: "Fevicol (Adhesive)", unit: "bottles", category: "Adhesives & Sealants" },
    { id: "motor-oil", name: "Motor Oil", unit: "liters", category: "Lubricants" },
    { id: "grinding-stones", name: "Grinding Stones", unit: "pieces", category: "Processing Equipment" },
    { id: "flour-sieves", name: "Flour Sieves", unit: "pieces", category: "Processing Equipment" },
    { id: "conveyor-belts", name: "Conveyor Belts", unit: "meters", category: "Mechanical Components" },
    { id: "electrical-wires", name: "Electrical Wires", unit: "meters", category: "Electrical" },
    { id: "switches", name: "Electrical Switches", unit: "pieces", category: "Electrical" },
    { id: "safety-equipment", name: "Safety Equipment", unit: "sets", category: "Safety" }
  ];

  const priorities = [
    { value: "High", label: "🔴 High Priority", description: "Urgent - Production stopped" },
    { value: "Medium", label: "🟡 Medium Priority", description: "Important - Plan ahead" },
    { value: "Low", label: "🟢 Low Priority", description: "Normal - When available" }
  ];

  // SSRFM Machines - Flour Mill specific
  const machines = [
    {
      id: "flour-mill-01",
      name: "Main Flour Mill #01",
      type: "Roller Flour Mill",
      location: "Production Floor A",
      status: "Active",
      specifications: "Primary wheat grinding mill, 500kg/hour capacity"
    },
    {
      id: "flour-mill-02", 
      name: "Secondary Mill #02",
      type: "Roller Flour Mill",
      location: "Production Floor A",
      status: "Active",
      specifications: "Secondary grinding mill, 300kg/hour capacity"
    },
    {
      id: "sifter-01",
      name: "Flour Sifter #01",
      type: "Rotary Sifter",
      location: "Processing Line B",
      status: "Active", 
      specifications: "Multi-grade flour separation, 400kg/hour"
    },
    {
      id: "conveyor-01",
      name: "Main Conveyor #01",
      type: "Belt Conveyor",
      location: "Transport Line",
      status: "Active",
      specifications: "Primary material transport, 50m length"
    },
    {
      id: "packaging-01",
      name: "Packaging Unit #01",
      type: "Auto Packaging Machine",
      location: "Packaging Floor",
      status: "Active",
      specifications: "Automated flour packaging, 200 bags/hour"
    },
    {
      id: "cleaning-01",
      name: "Wheat Cleaner #01",
      type: "Grain Cleaning Machine",
      location: "Pre-processing Area",
      status: "Active",
      specifications: "Wheat cleaning and stone removal"
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleMaterialChange = (materialId: string) => {
    const selectedMaterial = materials.find(m => m.id === materialId);
    if (selectedMaterial) {
      setFormData(prev => ({
        ...prev,
        materialName: selectedMaterial.name,
        unit: selectedMaterial.unit
      }));
    }
  };

  const handleMachineChange = (machineId: string) => {
    const selectedMachine = machines.find(m => m.id === machineId);
    if (selectedMachine) {
      setFormData(prev => ({
        ...prev,
        machineId: machineId,
        machineName: selectedMachine.name
      }));
    }
  };

  // Image upload handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'oldMaterial' | 'signature' | 'machineProof') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      handleFileUpload(file, type);
    }
  };

  const handleFileUpload = (file: File, type: 'oldMaterial' | 'signature' | 'machineProof') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'oldMaterial') {
        setOldMaterialPreview(result);
      } else if (type === 'signature') {
        setSignaturePreview(result);
      } else if (type === 'machineProof') {
        setMachineProofPreview(result);
      }
      
      toast({
        title: "Image uploaded successfully",
        description: `${type === 'oldMaterial' ? 'Old material' : type === 'signature' ? 'Signature' : 'Machine proof'} image has been attached.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'oldMaterial' | 'signature' | 'machineProof') => {
    if (type === 'oldMaterial') {
      setOldMaterialPreview(null);
      if (oldMaterialInputRef.current) oldMaterialInputRef.current.value = '';
      if (oldMaterialCameraRef.current) oldMaterialCameraRef.current.value = '';
    } else if (type === 'signature') {
      setSignaturePreview(null);
      if (signatureInputRef.current) signatureInputRef.current.value = '';
      if (signatureCameraRef.current) signatureCameraRef.current.value = '';
    } else if (type === 'machineProof') {
      setMachineProofPreview(null);
      if (machineProofInputRef.current) machineProofInputRef.current.value = '';
      if (machineProofCameraRef.current) machineProofCameraRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.materialName) newErrors.materialName = "Material name is required";
    if (!formData.specifications) newErrors.specifications = "Specifications are required";
    if (!formData.maker) newErrors.maker = "Maker/Brand is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (!formData.materialPurpose) newErrors.materialPurpose = "Material purpose is required";
    if (!formData.priority) newErrors.priority = "Priority is required";
    if (!formData.machineId) newErrors.machineId = "Machine selection is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fill in all required fields",
        description: "Check the form for missing information.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the data to your backend
    toast({
      title: "Request Submitted Successfully!",
      description: `Your material request for ${formData.materialName} has been submitted for approval.`,
    });

    // Navigate to requests page
    navigate('/my-requests');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Requisition cum Indent Form
        </h1>
        <p className="text-lg text-muted-foreground">
          SSRFM - Material Request for Production Operations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Material Details Section */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Material Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Name of Material *</Label>
                <Select value={formData.materialName} onValueChange={handleMaterialChange}>
                  <SelectTrigger className={errors.materialName ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select material needed" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        <div className="flex flex-col">
                          <span>{material.name}</span>
                          <span className="text-xs text-muted-foreground">{material.category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.materialName && <p className="text-sm text-red-500">{errors.materialName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Specifications *</Label>
                <Input
                  id="specifications"
                  value={formData.specifications}
                  onChange={(e) => handleInputChange("specifications", e.target.value)}
                  placeholder="Technical specifications, size, grade..."
                  className={errors.specifications ? "border-red-500" : ""}
                />
                {errors.specifications && <p className="text-sm text-red-500">{errors.specifications}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maker">Maker/Brand *</Label>
                <Input
                  id="maker"
                  value={formData.maker}
                  onChange={(e) => handleInputChange("maker", e.target.value)}
                  placeholder="Manufacturer or brand name"
                  className={errors.maker ? "border-red-500" : ""}
                />
                {errors.maker && <p className="text-sm text-red-500">{errors.maker}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    placeholder="0"
                    className={`flex-1 ${errors.quantity ? "border-red-500" : ""}`}
                  />
                  <Input
                    value={formData.unit}
                    readOnly
                    className="w-24 bg-secondary text-center"
                    placeholder="Unit"
                  />
                </div>
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialPurpose">Material Purpose *</Label>
                <Input
                  id="materialPurpose"
                  value={formData.materialPurpose}
                  onChange={(e) => handleInputChange("materialPurpose", e.target.value)}
                  placeholder="What will this material be used for?"
                  className={errors.materialPurpose ? "border-red-500" : ""}
                />
                {errors.materialPurpose && <p className="text-sm text-red-500">{errors.materialPurpose}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger className={errors.priority ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex flex-col">
                          <span>{priority.label}</span>
                          <span className="text-xs text-muted-foreground">{priority.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-sm text-red-500">{errors.priority}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                placeholder="Any additional information or special requirements..."
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Machine Selection Section */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Machine Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="machine">For Machine Name *</Label>
              <Select value={formData.machineId} onValueChange={handleMachineChange}>
                <SelectTrigger className={errors.machineId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select the machine that needs this material" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{machine.name}</span>
                        <span className="text-sm text-muted-foreground">{machine.type} - {machine.location}</span>
                        <span className="text-xs text-muted-foreground">{machine.specifications}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.machineId && <p className="text-sm text-red-500">{errors.machineId}</p>}
            </div>

            {formData.machineId && (
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Selected Machine Details:</span>
                </div>
                {(() => {
                  const selectedMachine = machines.find(m => m.id === formData.machineId);
                  return selectedMachine ? (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Name:</strong> {selectedMachine.name}</p>
                      <p><strong>Type:</strong> {selectedMachine.type}</p>
                      <p><strong>Location:</strong> {selectedMachine.location}</p>
                      <p><strong>Specifications:</strong> {selectedMachine.specifications}</p>
                      <p><strong>Status:</strong> <span className="text-blue-600">{selectedMachine.status}</span></p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Information Section */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Request Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedBy">Requested By</Label>
                <Input
                  id="requestedBy"
                  value={formData.requestedBy}
                  onChange={(e) => handleInputChange("requestedBy", e.target.value)}
                  className="bg-secondary"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedDate">Requested Date</Label>
                <Input
                  id="requestedDate"
                  type="date"
                  value={formData.requestedDate}
                  onChange={(e) => handleInputChange("requestedDate", e.target.value)}
                  className="bg-secondary"
                  readOnly
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Section */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Old Material Image */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Old Material Image</Label>
              <p className="text-sm text-muted-foreground">Upload an image of the old/damaged material that needs replacement</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => oldMaterialCameraRef.current?.click()}
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => oldMaterialInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
              </div>
              {oldMaterialPreview && (
                <Card className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-3">
                      <img
                        src={oldMaterialPreview}
                        alt="Old Material"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Old Material Image</p>
                        <p className="text-xs text-muted-foreground">Image attached successfully</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage('oldMaterial')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            {/* Machine Condition Proof */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Machine Condition Proof</Label>
              <p className="text-sm text-muted-foreground">Upload an image showing the machine condition or location where material is needed</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => machineProofCameraRef.current?.click()}
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => machineProofInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
              </div>
              {machineProofPreview && (
                <Card className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-3">
                      <img
                        src={machineProofPreview}
                        alt="Machine Condition"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Machine Condition Proof</p>
                        <p className="text-xs text-muted-foreground">Image attached successfully</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage('machineProof')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            {/* Requestor Signature */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Requestor Signature</Label>
              <p className="text-sm text-muted-foreground">Upload your signature or a photo of your signed approval</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => signatureCameraRef.current?.click()}
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => signatureInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
              </div>
              {signaturePreview && (
                <Card className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-3">
                      <img
                        src={signaturePreview}
                        alt="Requestor Signature"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Requestor Signature</p>
                        <p className="text-xs text-muted-foreground">Signature attached successfully</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage('signature')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Section */}
        <Card className="card-friendly">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="text-sm text-muted-foreground">
                <p>Please review all information before submitting.</p>
                <p>Your request will be sent to management for approval.</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Submit Request
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={oldMaterialInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'oldMaterial')}
        />
        <input
          type="file"
          ref={oldMaterialCameraRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleImageUpload(e, 'oldMaterial')}
        />
        <input
          type="file"
          ref={signatureInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'signature')}
        />
        <input
          type="file"
          ref={signatureCameraRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleImageUpload(e, 'signature')}
        />
        <input
          type="file"
          ref={machineProofInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'machineProof')}
        />
        <input
          type="file"
          ref={machineProofCameraRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleImageUpload(e, 'machineProof')}
        />
      </form>
    </div>
  );
};

export default MaterialRequest;