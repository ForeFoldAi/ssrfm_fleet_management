import { useState, useRef } from "react";
import { ChevronRight, Package, Camera, Upload, X, Eye, FileText, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { toast } from "../hooks/use-toast";
import { useRole } from "../contexts/RoleContext";

interface RequestFormProps {
  formData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export const RequestForm = ({ formData, onUpdate, onNext }: RequestFormProps) => {
  const { currentUser } = useRole();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [oldMaterialPreview, setOldMaterialPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const oldMaterialInputRef = useRef<HTMLInputElement>(null);
  const oldMaterialCameraRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const signatureCameraRef = useRef<HTMLInputElement>(null);

  // SSRFM specific materials for Roller Flour Mills
  const materials = [
    { id: "bearings", name: "Bearings", measureUnit: "pieces", category: "Mechanical Components" },
    { id: "belts", name: "Belts", measureUnit: "pieces", category: "Mechanical Components" },
    { id: "fevicol", name: "Fevicol (Adhesive)", measureUnit: "bottles", category: "Adhesives & Sealants" },
    { id: "motor-oil", name: "Motor Oil", measureUnit: "liters", category: "Lubricants" },
    { id: "grinding-stones", name: "Grinding Stones", measureUnit: "pieces", category: "Processing Equipment" },
    { id: "flour-sieves", name: "Flour Sieves", measureUnit: "pieces", category: "Processing Equipment" },
    { id: "conveyor-belts", name: "Conveyor Belts", measureUnit: "meters", category: "Mechanical Components" },
    { id: "electrical-wires", name: "Electrical Wires", measureUnit: "meters", category: "Electrical" },
    { id: "switches", name: "Electrical Switches", measureUnit: "pieces", category: "Electrical" },
    { id: "safety-equipment", name: "Safety Equipment", measureUnit: "sets", category: "Safety" }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'oldMaterial' | 'signature') => {
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
        
        if (type === 'oldMaterial') {
          setOldMaterialPreview(result);
          onUpdate({ 
            oldMaterialImage: file,
            oldMaterialImagePreview: result,
            oldMaterialImageName: file.name
          });
          toast({
            title: "Old material image uploaded",
            description: "Old material condition image has been added.",
          });
        } else if (type === 'signature') {
          setSignaturePreview(result);
          onUpdate({ 
            requestorSignatureImage: file,
            requestorSignatureImagePreview: result,
            requestorSignatureImageName: file.name
          });
          toast({
            title: "Signature uploaded",
            description: "Requestor signature has been added.",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (type: 'oldMaterial' | 'signature') => {
    if (type === 'oldMaterial' && oldMaterialCameraRef.current) {
      oldMaterialCameraRef.current.click();
    } else if (type === 'signature' && signatureCameraRef.current) {
      signatureCameraRef.current.click();
    }
  };

  const handleFileUpload = (type: 'oldMaterial' | 'signature') => {
    if (type === 'oldMaterial' && oldMaterialInputRef.current) {
      oldMaterialInputRef.current.click();
    } else if (type === 'signature' && signatureInputRef.current) {
      signatureInputRef.current.click();
    }
  };

  const removeImage = (type: 'oldMaterial' | 'signature') => {
    if (type === 'oldMaterial') {
      setOldMaterialPreview(null);
      onUpdate({ 
        oldMaterialImage: null,
        oldMaterialImagePreview: null,
        oldMaterialImageName: null
      });
      if (oldMaterialInputRef.current) oldMaterialInputRef.current.value = '';
      if (oldMaterialCameraRef.current) oldMaterialCameraRef.current.value = '';
      toast({
        title: "Image removed",
        description: "Old material image has been removed.",
      });
    } else if (type === 'signature') {
      setSignaturePreview(null);
      onUpdate({ 
        requestorSignatureImage: null,
        requestorSignatureImagePreview: null,
        requestorSignatureImageName: null
      });
      if (signatureInputRef.current) signatureInputRef.current.value = '';
      if (signatureCameraRef.current) signatureCameraRef.current.value = '';
      toast({
        title: "Signature removed",
        description: "Requestor signature has been removed.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.materialName) newErrors.materialName = "Please select a material";
    if (!formData.specifications) newErrors.specifications = "Please enter specifications";
    if (!formData.maker) newErrors.maker = "Please enter maker/brand";
    if (!formData.quantity) newErrors.quantity = "Please enter quantity";
    if (!formData.priority) newErrors.priority = "Please select priority";
    if (!formData.materialPurpose) newErrors.materialPurpose = "Please describe material purpose";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Set requestor details
      onUpdate({
        requestedBy: currentUser?.name || "Current User",
        requestedDate: new Date().toISOString().split('T')[0]
      });
      onNext();
    }
  };

  const selectedMaterial = materials.find(m => m.id === formData.materialName);

  // Set preview images from formData if they exist
  if (formData.oldMaterialImagePreview && !oldMaterialPreview) {
    setOldMaterialPreview(formData.oldMaterialImagePreview);
  }
  if (formData.requestorSignatureImagePreview && !signaturePreview) {
    setSignaturePreview(formData.requestorSignatureImagePreview);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Requisition cum Indent Form</h2>
        <p className="text-muted-foreground">SSRFM - Material Request for Production Operations</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Material Name */}
        <div className="space-y-2">
          <Label htmlFor="materialName" className="text-lg font-semibold">
            Name of Material *
          </Label>
          <Select value={formData.materialName} onValueChange={(value) => {
            const material = materials.find(m => m.id === value);
            onUpdate({ 
              materialName: value, 
              measureUnit: material?.measureUnit || '',
              category: material?.category || ''
            });
          }}>
            <SelectTrigger className="input-friendly h-12">
              <SelectValue placeholder="Select the material you need..." />
            </SelectTrigger>
            <SelectContent>
              {materials.map((material) => (
                <SelectItem key={material.id} value={material.id}>
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-semibold">{material.name}</div>
                      <div className="text-sm text-muted-foreground">{material.category} • Unit: {material.measureUnit}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.materialName && <p className="text-destructive text-sm">{errors.materialName}</p>}
        </div>

        {/* Specifications */}
        <div className="space-y-2">
          <Label htmlFor="specifications" className="text-lg font-semibold">
            Specifications *
          </Label>
          <Textarea
            id="specifications"
            placeholder="Enter detailed specifications (size, grade, model, technical details, etc.)"
            value={formData.specifications}
            onChange={(e) => onUpdate({ specifications: e.target.value })}
            className="input-friendly min-h-[80px] resize-none"
          />
          <p className="text-sm text-muted-foreground">
            Include technical specifications, dimensions, grade, model number, etc.
          </p>
          {errors.specifications && <p className="text-destructive text-sm">{errors.specifications}</p>}
        </div>

        {/* Maker */}
        <div className="space-y-2">
          <Label htmlFor="maker" className="text-lg font-semibold">
            Maker/Brand *
          </Label>
          <Input
            id="maker"
            placeholder="Enter manufacturer or brand name"
            value={formData.maker}
            onChange={(e) => onUpdate({ maker: e.target.value })}
            className="input-friendly"
          />
          <p className="text-sm text-muted-foreground">
            Preferred manufacturer or brand (e.g., SKF, Bosch, etc.)
          </p>
          {errors.maker && <p className="text-destructive text-sm">{errors.maker}</p>}
        </div>

        {/* Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="quantity" className="text-lg font-semibold">
              Quantity *
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity needed..."
              value={formData.quantity}
              onChange={(e) => onUpdate({ quantity: e.target.value })}
              className="input-friendly"
            />
            {errors.quantity && <p className="text-destructive text-sm">{errors.quantity}</p>}
          </div>
          
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Unit</Label>
            <div className="input-friendly bg-secondary text-center py-3 font-semibold text-primary">
              {selectedMaterial?.measureUnit || "Select material first"}
            </div>
          </div>
        </div>

        {/* Priority */}
        

        {/* Material Purpose */}
        <div className="space-y-2">
          <Label htmlFor="materialPurpose" className="text-lg font-semibold">
            Material Purpose *
          </Label>
          <Textarea
            id="materialPurpose"
            placeholder="Describe what this material will be used for (maintenance, replacement, new installation, etc.)"
            value={formData.materialPurpose}
            onChange={(e) => onUpdate({ materialPurpose: e.target.value })}
            className="input-friendly min-h-[100px] resize-none"
          />
          <p className="text-sm text-muted-foreground">
            Explain the specific purpose and how it will be used in production
          </p>
          {errors.materialPurpose && <p className="text-destructive text-sm">{errors.materialPurpose}</p>}
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="additionalNotes" className="text-lg font-semibold">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any additional information, special requirements, or notes"
            value={formData.additionalNotes}
            onChange={(e) => onUpdate({ additionalNotes: e.target.value })}
            className="input-friendly min-h-[80px] resize-none"
          />
          <p className="text-sm text-muted-foreground">
            Special handling requirements, delivery instructions, etc.
          </p>
        </div>

        {/* Old Material Image */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">
            Old Material Image (Optional)
          </Label>
          <p className="text-sm text-muted-foreground">
            Upload an image of the current/old material condition that needs replacement
          </p>

          {!oldMaterialPreview ? (
            <div className="border-2 border-dashed border-border rounded-xl p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Old Material Condition</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Show the current condition of material being replaced
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleCameraCapture('oldMaterial')}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleFileUpload('oldMaterial')}
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
                      src={oldMaterialPreview} 
                      alt="Old material condition" 
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage('oldMaterial')}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-foreground" />
                      <span className="text-sm font-medium text-foreground">Old material image uploaded</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {formData.oldMaterialImageName || "old-material.jpg"}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCameraCapture('oldMaterial')}
                        className="gap-1 text-xs"
                      >
                        <Camera className="w-3 h-3" />
                        Retake
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFileUpload('oldMaterial')}
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
        </div>

        {/* Requestor Signature */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">
            Requestor Signature (Optional)
          </Label>
          <p className="text-sm text-muted-foreground">
            Upload your signature or take a photo of your signed authorization
          </p>

          {!signaturePreview ? (
            <div className="border-2 border-dashed border-border rounded-xl p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Add Your Signature</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Provide your signature for authorization
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleCameraCapture('signature')}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleFileUpload('signature')}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Signature
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
                      src={signaturePreview} 
                      alt="Requestor signature" 
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage('signature')}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-foreground" />
                      <span className="text-sm font-medium text-foreground">Signature uploaded</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {formData.requestorSignatureImageName || "signature.jpg"}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCameraCapture('signature')}
                        className="gap-1 text-xs"
                      >
                        <Camera className="w-3 h-3" />
                        Retake
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFileUpload('signature')}
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
        </div>

        {/* Hidden file inputs */}
        <input
          ref={oldMaterialInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'oldMaterial')}
          className="hidden"
        />
        <input
          ref={oldMaterialCameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleImageUpload(e, 'oldMaterial')}
          className="hidden"
        />
        <input
          ref={signatureInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'signature')}
          className="hidden"
        />
        <input
          ref={signatureCameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleImageUpload(e, 'signature')}
          className="hidden"
        />

        {/* Next Button */}
        <div className="text-center pt-6">
          <Button type="submit" size="lg" className="btn-primary min-w-48">
            Continue to Machine Selection
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};
