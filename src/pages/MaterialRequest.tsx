import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Camera, Upload, X, Eye, User, Settings, MapPin, Package, Plus, Trash2, Building2, List, Table as TableIcon, ArrowLeft, Phone, Mail, Calendar, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "../hooks/use-toast";
import { useRole } from "../contexts/RoleContext";

interface VendorQuotation {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  email: string;
  quotedPrice: string;
  currency: string;
  deliveryTime: string;
  warranty: string;
  paymentTerms: string;
  validityPeriod: string;
  notes: string;
  quotationFile?: File | null;
}

interface RequestItem {
  id: string;
  srNo: number;
  productName: string;
  make: string;
  machineName: string;
  specifications: string;
  oldStock: number;
  reqQuantity: string;
  unit: string;
  image?: File | null;
  imagePreview?: string | null;
  vendorQuotations: VendorQuotation[];
}

const MaterialRequest = () => {
  const { currentUser } = useRole();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  
  // Form header data
  const [headerData, setHeaderData] = useState({
    docNo: `SSRFM/MNTI/R-${String(Date.now()).slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    revisionStatus: "0",
    issueNo: "1",
    page: "1 OF 1",
    reqFormNo: `SSRFM/MNT/REQ.-${String(Date.now()).slice(-4)}`,
    indFormNo: `SSRFM/MNT/IND.-${String(Date.now()).slice(-4)}`,
    reqSrNo: `SSRFM/MNT/REQ.-${String(Date.now()).slice(-4)}`,
    indSrNo: `SSRFM/MNT/IND.-${String(Date.now()).slice(-4)}`
  });

  // Request items (multiple items support)
  const [requestItems, setRequestItems] = useState<RequestItem[]>([
    {
      id: "1",
      srNo: 1,
      productName: "",
      make: "",
      machineName: "",
      specifications: "",
      oldStock: 0,
      reqQuantity: "",
      unit: "",
      image: null,
      imagePreview: null,
      vendorQuotations: []
    }
  ]);

  // Available materials matching the physical form
  const availableMaterials = [
    {
      name: "FEVICOL",
      make: "MARINE",
      specifications: "SH adhesive",
      unit: "kg",
      category: "Adhesives"
    },
    {
      name: "COPPER WIRE BRUSH",
      make: "INDUSTRIAL",
      specifications: "0.01 mm thickness of wire",
      unit: "pieces",
      category: "Tools"
    },
    {
      name: "DHOLLAK BALL",
      make: "INDUSTRIAL",
      specifications: "PVC transparent",
      unit: "pieces",
      category: "Components"
    },
    {
      name: "TRIANGLE BRUSH",
      make: "INDUSTRIAL",
      specifications: "Cleaning brush",
      unit: "pieces",
      category: "Tools"
    },
    {
      name: "GUM TAP",
      make: "INDUSTRIAL",
      specifications: "1 inch width",
      unit: "pieces",
      category: "Adhesives"
    },
    {
      name: "BEARINGS (SKF 6205-2RS)",
      make: "SKF",
      specifications: "Deep Grove Ball Bearing, Inner: 25mm, Outer: 52mm",
      unit: "pieces",
      category: "Mechanical Components"
    },
    {
      name: "MOTOR OIL (SAE 10W-30)",
      make: "CASTROL",
      specifications: "Industrial grade lubricant for machinery",
      unit: "liters",
      category: "Lubricants"
    },
    {
      name: "CONVEYOR BELTS",
      make: "CONTINENTAL",
      specifications: "Rubber belt, 600mm width, food grade",
      unit: "meters",
      category: "Mechanical Components"
    }
  ];

  // Machines for the supervisor
  const machines = [
    "PLANSHIFTER",
    "MAIN FLOUR MILL #01",
    "SECONDARY MILL #02", 
    "FLOUR SIFTER #01",
    "MAIN CONVEYOR #01",
    "PACKAGING UNIT #01",
    "WHEAT CLEANER #01"
  ];

  const handleItemChange = (itemId: string, field: keyof RequestItem, value: any) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleMaterialSelect = (itemId: string, materialName: string) => {
    const material = availableMaterials.find(m => m.name === materialName);
    if (material) {
      setRequestItems(prev => prev.map(item => 
        item.id === itemId ? {
          ...item,
          productName: material.name,
          make: material.make,
          specifications: material.specifications,
          unit: material.unit
        } : item
      ));
    }
  };

  const addNewItem = () => {
    const newItem: RequestItem = {
      id: String(Date.now()),
      srNo: requestItems.length + 1,
      productName: "",
      make: "",
      machineName: "",
      specifications: "",
      oldStock: 0,
      reqQuantity: "",
      unit: "",
      image: null,
      imagePreview: null,
      vendorQuotations: []
    };
    setRequestItems(prev => [...prev, newItem]);
  };

  const removeItem = (itemId: string) => {
    if (requestItems.length > 1) {
      setRequestItems(prev => prev.filter(item => item.id !== itemId));
      // Update serial numbers
      setRequestItems(prev => prev.map((item, index) => ({
        ...item,
        srNo: index + 1
      })));
    }
  };

  const handleImageUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
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
        setRequestItems(prev => prev.map(item => 
          item.id === itemId ? {
            ...item,
            image: file,
            imagePreview: result
          } : item
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  // Vendor quotation management functions
  const addVendorQuotation = (itemId: string) => {
    const item = requestItems.find(item => item.id === itemId);
    if (item && item.vendorQuotations.length >= 4) {
      toast({
        title: "Maximum quotations reached",
        description: "You can add up to 4 vendor quotations per item.",
        variant: "destructive",
      });
      return;
    }

    const newQuotation: VendorQuotation = {
      id: `quote_${Date.now()}`,
      vendorName: "",
      contactPerson: "",
      phone: "",
      email: "",
      quotedPrice: "",
      currency: "INR",
      deliveryTime: "",
      warranty: "",
      paymentTerms: "",
      validityPeriod: "",
      notes: "",
      quotationFile: null
    };

    setRequestItems(prev => prev.map(item => 
      item.id === itemId ? {
        ...item,
        vendorQuotations: [...item.vendorQuotations, newQuotation]
      } : item
    ));
  };

  const removeVendorQuotation = (itemId: string, quotationId: string) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId ? {
        ...item,
        vendorQuotations: item.vendorQuotations.filter(q => q.id !== quotationId)
      } : item
    ));
  };

  const handleQuotationChange = (itemId: string, quotationId: string, field: keyof VendorQuotation, value: any) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId ? {
        ...item,
        vendorQuotations: item.vendorQuotations.map(q => 
          q.id === quotationId ? { ...q, [field]: value } : q
        )
      } : item
    ));
  };

  const handleQuotationFileUpload = (itemId: string, quotationId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      handleQuotationChange(itemId, quotationId, 'quotationFile', file);
      toast({
        title: "File uploaded",
        description: `${file.name} has been attached to the quotation.`,
      });
    }
  };

  const removeImage = (itemId: string) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId ? {
        ...item,
        image: null,
        imagePreview: null
      } : item
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    requestItems.forEach((item, index) => {
      if (!item.productName.trim()) newErrors[`productName_${item.id}`] = `Product name is required for item ${index + 1}`;
      if (!item.make.trim()) newErrors[`make_${item.id}`] = `Make is required for item ${index + 1}`;
      if (!item.machineName.trim()) newErrors[`machineName_${item.id}`] = `Machine name is required for item ${index + 1}`;
      if (!item.reqQuantity.trim()) newErrors[`reqQuantity_${item.id}`] = `Required quantity is required for item ${index + 1}`;
      
      const qty = Number(item.reqQuantity);
      if (qty <= 0) newErrors[`reqQuantity_${item.id}`] = `Quantity must be greater than 0 for item ${index + 1}`;
    });

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
      title: "Requisition Submitted Successfully!",
      description: `Your material request with ${requestItems.length} items has been submitted for approval.`,
    });

    // Navigate to requests page
    navigate('/supervisor-requests');
  };

  const TableView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="border border-gray-300 font-semibold">SR.NO.</TableHead>
                <TableHead className="border border-gray-300 font-semibold">PRODUCT NAME</TableHead>
                <TableHead className="border border-gray-300 font-semibold">MAKE</TableHead>
                <TableHead className="border border-gray-300 font-semibold">MACHINE NAME</TableHead>
                <TableHead className="border border-gray-300 font-semibold">SPECIFICATIONS</TableHead>
                <TableHead className="border border-gray-300 font-semibold">OLD STOCK</TableHead>
                <TableHead className="border border-gray-300 font-semibold">REQ. QUANTITY</TableHead>
                <TableHead className="border border-gray-300 font-semibold">IMAGE</TableHead>
                <TableHead className="border border-gray-300 font-semibold">VENDOR QUOTATIONS</TableHead>
                <TableHead className="border border-gray-300 font-semibold">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="border border-gray-300 text-center font-semibold">
                    {item.srNo}
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <Select value={item.productName} onValueChange={(value) => handleMaterialSelect(item.id, value)}>
                      <SelectTrigger className="border-0 p-0 h-auto">
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMaterials.map((material) => (
                          <SelectItem key={material.name} value={material.name}>
                            <div className="flex flex-col">
                              <div className="font-semibold">{material.name}</div>
                              <div className="text-sm text-muted-foreground">{material.category}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`productName_${item.id}`] && (
                      <p className="text-destructive text-xs mt-1">{errors[`productName_${item.id}`]}</p>
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <Input
                      value={item.make}
                      onChange={(e) => handleItemChange(item.id, "make", e.target.value)}
                      placeholder="Make/Brand"
                      className="border-0 p-0 h-auto"
                    />
                    {errors[`make_${item.id}`] && (
                      <p className="text-destructive text-xs mt-1">{errors[`make_${item.id}`]}</p>
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <Select value={item.machineName} onValueChange={(value) => handleItemChange(item.id, "machineName", value)}>
                      <SelectTrigger className="border-0 p-0 h-auto">
                        <SelectValue placeholder="Select Machine" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map((machine) => (
                          <SelectItem key={machine} value={machine}>
                            {machine}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`machineName_${item.id}`] && (
                      <p className="text-destructive text-xs mt-1">{errors[`machineName_${item.id}`]}</p>
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <Textarea
                      value={item.specifications}
                      onChange={(e) => handleItemChange(item.id, "specifications", e.target.value)}
                      placeholder="Specifications"
                      className="border-0 p-0 h-auto resize-none"
                      rows={2}
                    />
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center">
                    <Input
                      type="number"
                      value={item.oldStock}
                      onChange={(e) => handleItemChange(item.id, "oldStock", Number(e.target.value))}
                      className="border-0 p-0 h-auto text-center w-20"
                    />
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.reqQuantity}
                        onChange={(e) => handleItemChange(item.id, "reqQuantity", e.target.value)}
                        placeholder="Qty"
                        className="border-0 p-0 h-auto w-16 text-center"
                        min="1"
                      />
                      <span className="text-sm text-gray-600">{item.unit}</span>
                    </div>
                    {errors[`reqQuantity_${item.id}`] && (
                      <p className="text-destructive text-xs mt-1">{errors[`reqQuantity_${item.id}`]}</p>
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    {item.imagePreview ? (
                      <div className="relative">
                        <img 
                          src={item.imagePreview} 
                          alt="Product" 
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(item.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handleImageUpload(item.id, e as any);
                            input.click();
                          }}
                          className="gap-1 text-xs"
                        >
                          <Upload className="w-3 h-3" />
                          Upload
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.capture = 'environment';
                            input.onchange = (e) => handleImageUpload(item.id, e as any);
                            input.click();
                          }}
                          className="gap-1 text-xs"
                        >
                          <Camera className="w-3 h-3" />
                          Camera
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold">Quotations ({item.vendorQuotations.length}/4)</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addVendorQuotation(item.id)}
                          disabled={item.vendorQuotations.length >= 4}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      {item.vendorQuotations.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-2">
                          No quotations
                        </div>
                      ) : (
                                                 <div className="space-y-1 max-h-32 overflow-y-auto">
                           {item.vendorQuotations.map((quotation, index) => (
                             <div key={quotation.id} className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                               <div className="flex justify-between items-start">
                                 <div className="flex-1 min-w-0 cursor-pointer" title="Click to edit quotation details">
                                   <div className="font-semibold text-blue-800 truncate">
                                     {quotation.vendorName || `Vendor ${index + 1}`}
                                   </div>
                                   <div className="text-blue-600 flex items-center gap-1">
                                     <DollarSign className="w-3 h-3" />
                                     {quotation.currency} {quotation.quotedPrice || '0'}
                                   </div>
                                   {quotation.deliveryTime && (
                                     <div className="text-muted-foreground flex items-center gap-1">
                                       <Calendar className="w-3 h-3" />
                                       {quotation.deliveryTime}
                                     </div>
                                   )}
                                   <div className="text-xs text-blue-500 mt-1">
                                     💡 Switch to List View for detailed editing
                                   </div>
                                 </div>
                                 <div className="flex gap-1">
                                   <Button
                                     type="button"
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => removeVendorQuotation(item.id, quotation.id)}
                                     className="h-4 w-4 p-0 hover:bg-red-100"
                                   >
                                     <X className="w-3 h-3 text-red-500" />
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={requestItems.length === 1}
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
      </CardContent>
    </Card>
  );

  const ListView = () => (
    <div className="space-y-4">
      {requestItems.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Item #{item.srNo}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(item.id)}
                disabled={requestItems.length === 1}
                className="gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Select value={item.productName} onValueChange={(value) => handleMaterialSelect(item.id, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMaterials.map((material) => (
                      <SelectItem key={material.name} value={material.name}>
                        <div className="flex flex-col">
                          <div className="font-semibold">{material.name}</div>
                          <div className="text-sm text-muted-foreground">{material.category}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`productName_${item.id}`] && (
                  <p className="text-destructive text-sm">{errors[`productName_${item.id}`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Make/Brand *</Label>
                <Input
                  value={item.make}
                  onChange={(e) => handleItemChange(item.id, "make", e.target.value)}
                  placeholder="Enter make or brand"
                />
                {errors[`make_${item.id}`] && (
                  <p className="text-destructive text-sm">{errors[`make_${item.id}`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Machine Name *</Label>
                <Select value={item.machineName} onValueChange={(value) => handleItemChange(item.id, "machineName", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((machine) => (
                      <SelectItem key={machine} value={machine}>
                        {machine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`machineName_${item.id}`] && (
                  <p className="text-destructive text-sm">{errors[`machineName_${item.id}`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Required Quantity *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={item.reqQuantity}
                    onChange={(e) => handleItemChange(item.id, "reqQuantity", e.target.value)}
                    placeholder="Enter quantity"
                    min="1"
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 min-w-0">{item.unit || "unit"}</span>
                </div>
                {errors[`reqQuantity_${item.id}`] && (
                  <p className="text-destructive text-sm">{errors[`reqQuantity_${item.id}`]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Specifications</Label>
              <Textarea
                value={item.specifications}
                onChange={(e) => handleItemChange(item.id, "specifications", e.target.value)}
                placeholder="Enter detailed specifications"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Old Stock</Label>
              <Input
                type="number"
                value={item.oldStock}
                onChange={(e) => handleItemChange(item.id, "oldStock", Number(e.target.value))}
                placeholder="Current stock quantity"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Product Image</Label>
              {item.imagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={item.imagePreview} 
                    alt="Product" 
                    className="w-32 h-32 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(item.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => handleImageUpload(item.id, e as any);
                      input.click();
                    }}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.capture = 'environment';
                      input.onchange = (e) => handleImageUpload(item.id, e as any);
                      input.click();
                    }}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </Button>
                </div>
              )}
            </div>

            {/* Vendor Quotations Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Vendor Quotations (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addVendorQuotation(item.id)}
                  disabled={item.vendorQuotations.length >= 4}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Quotation ({item.vendorQuotations.length}/4)
                </Button>
              </div>

              {item.vendorQuotations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No vendor quotations added yet</p>
                  <p className="text-sm">Add up to 4 quotations to compare prices</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {item.vendorQuotations.map((quotation, index) => (
                    <Card key={quotation.id} className="border-blue-200 bg-blue-50/30">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm font-medium text-blue-800">
                            Quotation #{index + 1}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVendorQuotation(item.id, quotation.id)}
                            className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Vendor Name *</Label>
                            <Input
                              value={quotation.vendorName}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'vendorName', e.target.value)}
                              placeholder="Enter vendor company name"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Contact Person</Label>
                            <Input
                              value={quotation.contactPerson}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'contactPerson', e.target.value)}
                              placeholder="Enter contact person name"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Phone</Label>
                            <Input
                              value={quotation.phone}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'phone', e.target.value)}
                              placeholder="Enter phone number"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Email</Label>
                            <Input
                              type="email"
                              value={quotation.email}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'email', e.target.value)}
                              placeholder="Enter email address"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Quoted Price *</Label>
                            <div className="flex gap-2">
                              <Select
                                value={quotation.currency}
                                onValueChange={(value) => handleQuotationChange(item.id, quotation.id, 'currency', value)}
                              >
                                <SelectTrigger className="w-20 h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="INR">₹</SelectItem>
                                  <SelectItem value="USD">$</SelectItem>
                                  <SelectItem value="EUR">€</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                value={quotation.quotedPrice}
                                onChange={(e) => handleQuotationChange(item.id, quotation.id, 'quotedPrice', e.target.value)}
                                placeholder="Enter price"
                                className="flex-1 h-9"
                                step="0.01"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Delivery Time</Label>
                            <Input
                              value={quotation.deliveryTime}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'deliveryTime', e.target.value)}
                              placeholder="e.g., 2-3 weeks"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Warranty</Label>
                            <Input
                              value={quotation.warranty}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'warranty', e.target.value)}
                              placeholder="e.g., 1 year"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Payment Terms</Label>
                            <Input
                              value={quotation.paymentTerms}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'paymentTerms', e.target.value)}
                              placeholder="e.g., 30% advance, 70% on delivery"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Validity Period</Label>
                            <Input
                              value={quotation.validityPeriod}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'validityPeriod', e.target.value)}
                              placeholder="e.g., 30 days"
                              className="h-9"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Additional Notes</Label>
                          <Textarea
                            value={quotation.notes}
                            onChange={(e) => handleQuotationChange(item.id, quotation.id, 'notes', e.target.value)}
                            placeholder="Any additional terms, conditions, or notes"
                            className="min-h-[60px] resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Quotation Document</Label>
                          <div className="flex gap-2 items-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                                input.onchange = (e) => handleQuotationFileUpload(item.id, quotation.id, e as any);
                                input.click();
                              }}
                              className="gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Upload Document
                            </Button>
                            {quotation.quotationFile && (
                              <Badge variant="secondary" className="gap-1">
                                <FileText className="w-3 h-3" />
                                {quotation.quotationFile.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Vendor Quotations Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Vendor Quotations (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addVendorQuotation(item.id)}
                  disabled={item.vendorQuotations.length >= 4}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Quotation ({item.vendorQuotations.length}/4)
                </Button>
              </div>

              {item.vendorQuotations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No vendor quotations added yet</p>
                  <p className="text-sm">Add up to 4 quotations to compare prices</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {item.vendorQuotations.map((quotation, index) => (
                    <Card key={quotation.id} className="border-blue-200 bg-blue-50/30">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm font-medium text-blue-800">
                            Quotation #{index + 1}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVendorQuotation(item.id, quotation.id)}
                            className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Vendor Name *</Label>
                            <Input
                              value={quotation.vendorName}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'vendorName', e.target.value)}
                              placeholder="Enter vendor company name"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Contact Person</Label>
                            <Input
                              value={quotation.contactPerson}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'contactPerson', e.target.value)}
                              placeholder="Enter contact person name"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Phone</Label>
                            <Input
                              value={quotation.phone}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'phone', e.target.value)}
                              placeholder="Enter phone number"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Email</Label>
                            <Input
                              type="email"
                              value={quotation.email}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'email', e.target.value)}
                              placeholder="Enter email address"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Quoted Price *</Label>
                            <div className="flex gap-2">
                              <Select
                                value={quotation.currency}
                                onValueChange={(value) => handleQuotationChange(item.id, quotation.id, 'currency', value)}
                              >
                                <SelectTrigger className="w-20 h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="INR">₹</SelectItem>
                                  <SelectItem value="USD">$</SelectItem>
                                  <SelectItem value="EUR">€</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                value={quotation.quotedPrice}
                                onChange={(e) => handleQuotationChange(item.id, quotation.id, 'quotedPrice', e.target.value)}
                                placeholder="Enter price"
                                className="flex-1 h-9"
                                step="0.01"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Delivery Time</Label>
                            <Input
                              value={quotation.deliveryTime}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'deliveryTime', e.target.value)}
                              placeholder="e.g., 2-3 weeks"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Warranty</Label>
                            <Input
                              value={quotation.warranty}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'warranty', e.target.value)}
                              placeholder="e.g., 1 year"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Payment Terms</Label>
                            <Input
                              value={quotation.paymentTerms}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'paymentTerms', e.target.value)}
                              placeholder="e.g., 30% advance, 70% on delivery"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Validity Period</Label>
                            <Input
                              value={quotation.validityPeriod}
                              onChange={(e) => handleQuotationChange(item.id, quotation.id, 'validityPeriod', e.target.value)}
                              placeholder="e.g., 30 days"
                              className="h-9"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Additional Notes</Label>
                          <Textarea
                            value={quotation.notes}
                            onChange={(e) => handleQuotationChange(item.id, quotation.id, 'notes', e.target.value)}
                            placeholder="Any additional terms, conditions, or notes"
                            className="min-h-[60px] resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Quotation Document</Label>
                          <div className="flex gap-2 items-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                                input.onchange = (e) => handleQuotationFileUpload(item.id, quotation.id, e as any);
                                input.click();
                              }}
                              className="gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Upload Document
                            </Button>
                            {quotation.quotationFile && (
                              <Badge variant="secondary" className="gap-1">
                                <FileText className="w-3 h-3" />
                                {quotation.quotationFile.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 p-4">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Company Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-blue-800">SREE SAI ROLLER FLOUR MILLS PVT LTD</h1>
              <p className="text-lg text-blue-600">REQUISITION FORM & INDENT FORM FOR REQUESTING MATERIAL OR NEW PURCHASE</p>
            </div>
          </div>
          
          {/* Document Information */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm bg-white p-4 rounded border">
            <div>
              <span className="font-semibold">DOC.NO.:</span>
              <div className="font-mono">{headerData.docNo}</div>
            </div>
            <div>
              <span className="font-semibold">DATE:</span>
              <div>{new Date(headerData.date).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="font-semibold">REVISION STATUS:</span>
              <div>{headerData.revisionStatus}</div>
            </div>
            <div>
              <span className="font-semibold">ISSUE NO.:</span>
              <div>{headerData.issueNo}</div>
            </div>
            <div>
              <span className="font-semibold">PAGE:</span>
              <div>{headerData.page}</div>
            </div>
            <div>
              <span className="font-semibold">SR.NO. FOR REQ.FORM:</span>
              <div className="font-mono text-xs">{headerData.reqFormNo}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle and Add Item */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List View
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="flex items-center gap-2"
          >
            <TableIcon className="w-4 h-4" />
            Table View
          </Button>
        </div>

        <Button onClick={addNewItem} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Item
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Items Section */}
        {viewMode === "table" ? <TableView /> : <ListView />}

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button type="submit" size="lg" className="min-w-48 gap-2">
            <FileText className="w-5 h-5" />
            Submit Requisition Request
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MaterialRequest;
