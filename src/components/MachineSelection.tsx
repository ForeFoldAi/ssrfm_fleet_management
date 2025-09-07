import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Settings, MapPin, Camera, Upload, X, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { toast } from "../hooks/use-toast";

interface MachineSelectionProps {
  formData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const MachineSelection = ({ formData, onUpdate, onNext, onBack }: MachineSelectionProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const machines = [
    {
      id: "machine-45",
      name: "Machine #45",
      type: "Steel Processing Unit",
      location: "Production Line A",
      status: "Active",
      specifications: "Heavy-duty steel processing, 5-ton capacity",
    },
    {
      id: "machine-12",
      name: "Machine #12",
      type: "Hydraulic Press", 
      location: "Production Line B",
      status: "Active",
      specifications: "200-ton hydraulic press, precision forming",
    },
    {
      id: "machine-33",
      name: "Machine #33",
      type: "Assembly Robot",
      location: "Assembly Line",
      status: "Active",
      specifications: "6-axis robotic arm, precision assembly",
    },
    {
      id: "machine-56",
      name: "Machine #56",
      type: "Welding Station",
      location: "Fabrication Shop", 
      status: "Active",
      specifications: "Multi-process welding station, TIG/MIG capable",
    }
  ];

  const selectedMachine = machines.find(m => m.id === formData.machine);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        onUpdate({ 
          machineProofImage: file,
          machineProofImagePreview: result,
          machineProofImageName: file.name
        });
        toast({
          title: "Image uploaded",
          description: "Machine proof image has been added to your request.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    onUpdate({ 
      machineProofImage: null,
      machineProofImagePreview: null,
      machineProofImageName: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    toast({
      title: "Image removed",
      description: "Machine proof image has been removed from your request.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.machine) newErrors.machine = "Please select a machine";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  // Set preview image from formData if it exists
  if (formData.machineProofImagePreview && !previewImage) {
    setPreviewImage(formData.machineProofImagePreview);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Which machine needs this?</h2>
        <p className="text-muted-foreground">Select the machine that will use these materials</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Machine Selection */}
        <div className="space-y-2">
          <Label htmlFor="machine" className="text-lg font-semibold">
            Select Machine *
          </Label>
          <Select value={formData.machine} onValueChange={(value) => {
            const machine = machines.find(m => m.id === value);
            onUpdate({ 
              machine: value,
              machineDetails: machine
            });
          }}>
            <SelectTrigger className="input-friendly h-12">
              <SelectValue placeholder="Choose the machine..." />
            </SelectTrigger>
            <SelectContent>
              {machines.map((machine) => (
                <SelectItem key={machine.id} value={machine.id}>
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-semibold">{machine.name}</div>
                      <div className="text-sm text-muted-foreground">{machine.type}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {machine.location}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.machine && <p className="text-destructive text-sm">{errors.machine}</p>}
        </div>

        {/* Machine Details Preview */}
        {selectedMachine && (
          <div className="card-friendly p-6 bg-secondary/30">
            <h3 className="text-lg font-bold text-foreground mb-4">Machine Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Machine Name</p>
                <p className="font-semibold text-foreground">{selectedMachine.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-semibold text-primary">{selectedMachine.type}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <MapPin className="w-4 h-4" />
                  {selectedMachine.location}
                </div>
              </div>
              
              <div>  
                <p className="text-sm text-muted-foreground">Status</p>
                <span className="badge-status bg-success/10 text-success ring-1 ring-success/20">
                  {selectedMachine.status}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Specifications</p>
              <p className="text-foreground mt-1">{selectedMachine.specifications}</p>
            </div>
          </div>
        )}

        {/* Machine Proof Image Upload */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">
            Machine Condition Proof (Optional)
          </Label>
          <p className="text-sm text-muted-foreground">
            Upload an image showing the machine condition, maintenance needs, or current state
          </p>

          {!previewImage ? (
            <div className="border-2 border-dashed border-border rounded-xl p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Add Machine Proof</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Capture or upload an image of the machine condition
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCameraCapture}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleFileUpload}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={previewImage} 
                      alt="Machine condition proof" 
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Machine image uploaded</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {formData.machineProofImageName || "machine-proof.jpg"}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleCameraCapture}
                        className="gap-1 text-xs"
                      >
                        <Camera className="w-3 h-3" />
                        Retake
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleFileUpload}
                        className="gap-1 text-xs"
                      >
                        <Upload className="w-3 h-3" />
                        Replace
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            onClick={onBack}
            className="flex-1 btn-friendly"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Request Details
          </Button>
          
          <Button 
            type="submit" 
            size="lg" 
            className="flex-1 btn-primary"
          >
            Review My Request
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};