import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Camera, Upload, X, Eye, User, Settings, MapPin, Package, Plus, Trash2, Building2, List, Table as TableIcon, ArrowLeft, Phone, Mail, Calendar, IndianRupee, UserRoundPlus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";
import { useRole } from "../contexts/RoleContext";

interface VendorQuotation {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  quotedPrice: string;
  notes: string;
  quotationFile?: File | null;
}

interface RequestItem {
  id: string;
  srNo: number;
  productName: string;
  machineName: string;
  specifications: string;
  oldStock: number;
  reqQuantity: string;
  measureUnit: string;
  images?: File[];
  imagePreviews?: string[];
  notes?: string;
  vendorQuotations: VendorQuotation[];
}

const MaterialRequest = () => {
  const { currentUser } = useRole();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);
  const [isViewQuotationsOpen, setIsViewQuotationsOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string>("");
  const [currentQuotations, setCurrentQuotations] = useState<VendorQuotation[]>([]);
  const [vendorFormData, setVendorFormData] = useState<VendorQuotation>({
    id: "",
    vendorName: "",
    contactPerson: "",
    phone: "",
    quotedPrice: "",
    notes: "",
    quotationFile: null
  });
  
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
      machineName: "",
      specifications: "",
      oldStock: 0,
      reqQuantity: "",
      measureUnit: "",
      images: [],
      imagePreviews: [],
      notes: "",
      vendorQuotations: []
    }
  ]);

  // Available materials matching the physical form
  const availableMaterials = [
    {
      name: "FEVICOL",
      specifications: "SH adhesive",
      measureUnit: "kg",
      category: "Adhesives"
    },
    {
      name: "COPPER WIRE BRUSH",
      specifications: "0.01 mm thickness of wire",
      measureUnit: "pieces",
      category: "Tools"
    },
    {
      name: "DHOLLAK BALL",
      specifications: "PVC transparent",
      measureUnit: "pieces",
      category: "Components"
    },
    {
      name: "TRIANGLE BRUSH",
      specifications: "Cleaning brush",
      measureUnit: "pieces",
      category: "Tools"
    },
    {
      name: "GUM TAPE",
      specifications: "1 inch width adhesive tape",
      measureUnit: "pieces",
      category: "Office Supplies"
    },
    {
      name: "BEARINGS (SKF 6205-2RS)",
      specifications: "Deep Grove Ball Bearing, Inner: 25mm, Outer: 52mm",
      measureUnit: "pieces",
      category: "Parts"
    },
    {
      name: "MOTOR OIL (SAE 10W-30)",
      specifications: "Industrial grade lubricant for machinery",
      measureUnit: "liters",
      category: "Lubricants"
    },
    {
      name: "CONVEYOR BELTS",
      specifications: "Rubber belt, 600mm width, food grade",
      measureUnit: "meters",
      category: "Equipment"
    }
  ];

  // Machines for the supervisor
  const machines = [
    "BLENDER",
    "MAIN FLOUR MILL #01",
    "SECONDARY MILL #02", 
    "FLOUR SIFTER #01",
    "MAIN CONVEYOR #01"
  ];

  const handleItemChange = (itemId: string, field: string, value: string) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
    
    // Clear error for this field
    if (errors[`${field}_${itemId}`]) {
      setErrors(prev => ({ ...prev, [`${field}_${itemId}`]: "" }));
    }
  };

  const handleMultipleFileChange = (itemId: string, files: FileList) => {
    const newFiles = Array.from(files);
    const newPreviews: string[] = [];
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newFiles.length) {
    setRequestItems(prev => prev.map(item => 
            item.id === itemId ? { 
              ...item, 
              images: [...(item.images || []), ...newFiles],
              imagePreviews: [...(item.imagePreviews || []), ...newPreviews]
            } : item
          ));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (itemId: string, imageIndex: number) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId ? {
        ...item,
        images: item.images?.filter((_, index) => index !== imageIndex) || [],
        imagePreviews: item.imagePreviews?.filter((_, index) => index !== imageIndex) || []
      } : item
    ));
  };

  const handleMaterialSelect = (itemId: string, materialName: string) => {
    const material = availableMaterials.find(m => m.name === materialName);
    if (material) {
      setRequestItems(prev => prev.map(item => 
        item.id === itemId ? {
          ...item,
          productName: material.name,
          specifications: material.specifications,
          measureUnit: material.measureUnit
        } : item
      ));
    }
  };

  const addNewItem = () => {
    const newItem: RequestItem = {
      id: String(Date.now()),
      srNo: requestItems.length + 1,
      productName: "",
      machineName: "",
      specifications: "",
      oldStock: 0,
      reqQuantity: "",
      measureUnit: "",
      images: [],
      imagePreviews: [],
      notes: "",
      vendorQuotations: []
    };
    setRequestItems(prev => [...prev, newItem]);
  };

  const removeItem = (itemId: string) => {
    if (requestItems.length > 1) {
      setRequestItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const openVendorForm = (itemId: string) => {
    setCurrentItemId(itemId);
    setVendorFormData({
      id: "",
      vendorName: "",
      contactPerson: "",
      phone: "",
      quotedPrice: "",
      notes: "",
      quotationFile: null
    });
    setIsVendorFormOpen(true);
  };

  const viewVendorQuotations = (itemId: string) => {
    const item = requestItems.find(item => item.id === itemId);
    if (item) {
      setCurrentQuotations(item.vendorQuotations);
      setCurrentItemId(itemId);
      setIsViewQuotationsOpen(true);
    }
  };

  const handleVendorFormChange = (field: string, value: string) => {
    setVendorFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVendorFileChange = (file: File) => {
    setVendorFormData(prev => ({ ...prev, quotationFile: file }));
  };

  const addVendorQuotation = () => {
    const currentItem = requestItems.find(item => item.id === currentItemId);
    if (currentItem && currentItem.vendorQuotations.length < 4) {
      const newQuotation: VendorQuotation = {
        ...vendorFormData,
        id: String(Date.now())
      };
      
      setRequestItems(prev => prev.map(item => 
        item.id === currentItemId 
          ? { ...item, vendorQuotations: [...item.vendorQuotations, newQuotation] }
          : item
      ));
      
      // Clear form for next entry
      setVendorFormData({
        id: "",
        vendorName: "",
        contactPerson: "",
        phone: "",
        quotedPrice: "",
        notes: "",
        quotationFile: null
      });
      
      toast({
        title: "Vendor Quotation Added",
        description: `Quotation from ${newQuotation.vendorName} added successfully`,
      });
    } else if (currentItem && currentItem.vendorQuotations.length >= 4) {
      toast({
        title: "Maximum Quotations Reached",
        description: "You can only add up to 4 vendor quotations per item",
        variant: "destructive"
      });
    }
  };

  const removeVendorQuotation = (itemId: string, quotationId: string) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, vendorQuotations: item.vendorQuotations.filter(q => q.id !== quotationId) }
        : item
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    requestItems.forEach((item, index) => {
      if (!item.productName.trim()) newErrors[`productName_${item.id}`] = `Product name is required for item ${index + 1}`;
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
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Generate document numbers
    const timestamp = Date.now();
    const docNo = `SSRFM/MNTI/R-${String(timestamp).slice(-4)}`;
    const reqFormNo = `SSRFM/MNT/REQ.-${String(timestamp).slice(-4)}`;
    const indFormNo = `SSRFM/MNT/IND.-${String(timestamp).slice(-4)}`;
    const reqSrNo = `SSRFM/MNT/REQ.-${String(timestamp).slice(-4)}`;
    const indSrNo = `SSRFM/MNT/IND.-${String(timestamp).slice(-4)}`;
    
    const requestData = {
      id: `REQ-${timestamp}`,
      status: "pending_approval",
      type: "material_request",
      timestamp: new Date().toISOString(),
      headerData: {
        ...headerData,
        docNo,
        reqFormNo,
        indFormNo,
        reqSrNo,
        indSrNo
      },
      items: requestItems.map(item => ({
        ...item,
        reqQuantity: Number(item.reqQuantity)
      })),
      requestedBy: currentUser?.name || "",
      department: currentUser?.department || ""
    };
    
    toast({
      title: "Material Request Submitted",
      description: `${requestItems.length} item(s) submitted successfully`,
    });
    
    // Reset form
    setRequestItems([{
      id: "1",
      srNo: 1,
      productName: "",
      machineName: "",
      specifications: "",
      oldStock: 0,
      reqQuantity: "",
      measureUnit: "",
      images: [],
      imagePreviews: [],
      notes: "",
      vendorQuotations: []
    }]);
    setErrors({});
    navigate("/supervisor-requests");
  };

  const TableView = () => (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0 border-none">
        <div className="overflow-x-auto border-none">
          <Table className="border-none">
            <TableHeader className="border-none">
              <TableRow className="bg-gray-50">
                <TableHead className="border border-gray-300 font-semibold">SR.NO.</TableHead>
                <TableHead className="border border-gray-300 font-semibold">MATERIALS</TableHead>
                <TableHead className="border border-gray-300 font-semibold">SPECIFICATIONS</TableHead>
                <TableHead className="border border-gray-300 font-semibold">CURRENT STOCK</TableHead>
                <TableHead className="border border-gray-300 font-semibold">REQ. QUANTITY</TableHead>
                <TableHead className="border border-gray-300 font-semibold">IMAGES</TableHead>
                <TableHead className="border border-gray-300 font-semibold">VENDOR QUOTATIONS</TableHead>
                <TableHead className="border border-gray-300 font-semibold">MACHINE NAME</TableHead>
                <TableHead className="border border-gray-300 font-semibold">NOTES</TableHead>
                <TableHead className="border border-gray-300 font-semibold">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="border border-gray-300 text-center font-semibold">
                    {String(item.srNo).padStart(2, '0')}
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <Select value={item.productName} onValueChange={(value) => handleMaterialSelect(item.id, value)}>
                      <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none">
                        <SelectValue placeholder="Select Material" />
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
                      value={item.specifications}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 30);
                        handleItemChange(item.id, "specifications", value);
                      }}
                      placeholder="Specifications (max 30 chars)"
                      maxLength={30}
                      className="border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.specifications.length}/30 characters
                    </div>
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center">
                    <Input
                      type="number"
                      value={item.oldStock}
                      onChange={(e) => handleItemChange(item.id, "oldStock", e.target.value)}
                      placeholder="0"
                      min="0"
                      className="border-0 p-0 h-auto w-20 text-center focus:ring-0 focus:outline-none rounded-none"
                    />
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.reqQuantity}
                        onChange={(e) => handleItemChange(item.id, "reqQuantity", e.target.value)}
                        placeholder="Qty"
                        min="0"
                        className="border-0 p-0 h-auto w-20 focus:ring-0 focus:outline-none rounded-none"
                      />
                      <span className="text-sm text-gray-600">{item.measureUnit}</span>
                    </div>
                    {errors[`reqQuantity_${item.id}`] && (
                      <p className="text-destructive text-xs mt-1">{errors[`reqQuantity_${item.id}`]}</p>
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                          multiple
                        onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              handleMultipleFileChange(item.id, files);
                          }
                        }}
                        className="hidden"
                          id={`images-${item.id}`}
                      />
                        <Label htmlFor={`images-${item.id}`} className="cursor-pointer">
                        <Camera className="w-4 h-4" />
                      </Label>
                        <span className="text-xs text-muted-foreground">
                          ({item.imagePreviews?.length || 0} images)
                        </span>
                      </div>
                      {item.imagePreviews && item.imagePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.imagePreviews.slice(0, 3).map((preview, index) => (
                            <div key={index} className="relative w-8 h-8 rounded border overflow-hidden">
                              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeImage(item.id, index)}
                                className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-red-500 text-white hover:bg-red-600 rounded-full"
                              >
                                <X className="w-2 h-2" />
                              </Button>
                            </div>
                          ))}
                          {item.imagePreviews.length > 3 && (
                            <div className="w-8 h-8 rounded border flex items-center justify-center bg-gray-100 text-xs">
                              +{item.imagePreviews.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 flex-1"
                          onClick={() => openVendorForm(item.id)}
                          disabled={item.vendorQuotations.length >= 4}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add ({item.vendorQuotations.length}/4)
                        </Button>
                        {item.vendorQuotations.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => viewVendorQuotations(item.id)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      {item.vendorQuotations.length > 0 && (
                        <div className="space-y-1">
                          {item.vendorQuotations.map((quotation) => (
                            <div key={quotation.id} className="flex items-center justify-between gap-2 text-xs bg-gray-50 p-1 rounded border">
                              <span className="truncate flex-1 font-medium">
                                {quotation.vendorName} - {quotation.quotedPrice}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVendorQuotation(item.id, quotation.id)}
                                className="h-4 w-4 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-2 h-2" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <Select value={item.machineName} onValueChange={(value) => handleItemChange(item.id, "machineName", value)}>
                      <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none">
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
                      value={item.notes || ''}
                      onChange={(e) => handleItemChange(item.id, "notes", e.target.value)}
                      placeholder="Add notes..."
                      className="border-0 p-0 h-auto min-h-[60px] resize-none focus:ring-0 focus:outline-none rounded-none"
                      rows={2}
                    />
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={requestItems.length === 1}
                      className="h-8 w-8 p-0"
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
    <div className="space-y-6">
      {requestItems.map((item) => (
        <Card key={item.id} className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Materials *</Label>
                  <Select value={item.productName} onValueChange={(value) => handleMaterialSelect(item.id, value)}>
                    <SelectTrigger className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200">
                      <SelectValue placeholder="Select Material" />
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
                    <p className="text-destructive text-sm mt-1">{errors[`productName_${item.id}`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Machine Name *</Label>
                  <Select value={item.machineName} onValueChange={(value) => handleItemChange(item.id, "machineName", value)}>
                    <SelectTrigger className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200">
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
                    <p className="text-destructive text-sm mt-1">{errors[`machineName_${item.id}`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Specifications</Label>
                  <Textarea
                    value={item.specifications}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 30);
                      handleItemChange(item.id, "specifications", value);
                    }}
                    placeholder="Enter detailed specifications (max 30 chars)"
                    maxLength={30}
                    className="min-h-[50px] px-4 py-3 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200"
                  />
                  <div className="text-xs text-muted-foreground">
                    {item.specifications.length}/30 characters
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Old Stock</Label>
                    <Input
                      type="number"
                      value={item.oldStock}
                      onChange={(e) => handleItemChange(item.id, "oldStock", e.target.value)}
                      placeholder="0"
                      min="0"
                      className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Required Quantity *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.reqQuantity}
                        onChange={(e) => handleItemChange(item.id, "reqQuantity", e.target.value)}
                        placeholder="Enter quantity"
                        min="0"
                        className="h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                      />
                      <span className="text-sm text-muted-foreground">{item.measureUnit}</span>
                    </div>
                    {errors[`reqQuantity_${item.id}`] && (
                      <p className="text-destructive text-sm mt-1">{errors[`reqQuantity_${item.id}`]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Images</Label>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          handleMultipleFileChange(item.id, files);
                        }
                      }}
                      className="flex-1 h-11 px-4 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200"
                    />
                    {item.imagePreviews && item.imagePreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {item.imagePreviews.map((preview, index) => (
                          <div key={index} className="relative w-16 h-16 rounded-[5px] border overflow-hidden">
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(item.id, index)}
                              className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white hover:bg-red-600 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {item.imagePreviews?.length || 0} image(s) selected
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vendor Quotations ({item.vendorQuotations.length}/4)</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-11"
                      onClick={() => openVendorForm(item.id)}
                      disabled={item.vendorQuotations.length >= 4}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vendor Quotation
                    </Button>
                    {item.vendorQuotations.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => viewVendorQuotations(item.id)}
                        className="px-3 h-11"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {item.vendorQuotations.length > 0 && (
                    <div className="space-y-2">
                      {item.vendorQuotations.map((quotation) => (
                        <div key={quotation.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-[5px] border">
                          <div>
                            <div className="font-medium text-sm">{quotation.vendorName}</div>
                            <div className="text-xs text-muted-foreground">{quotation.quotedPrice}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVendorQuotation(item.id, quotation.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {requestItems.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive h-10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Item
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-sm sm:text-1xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">

                Requisition & Indent form
              </h1>
              
            </div>
          </div>
        </div>
        
        {/* List/Table Toggle and Add Item Button */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-secondary overflow-hidden bg-secondary/10/50 w-fit shadow-sm">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-none px-3 sm:px-4 ${
                viewMode === "list" 
                  ? "bg-primary text-white hover:bg-primary-hover" 
                  : "text-foreground hover:text-foreground hover:bg-secondary/20"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm">List</span>
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`rounded-none px-3 sm:px-4 ${
                viewMode === "table" 
                  ? "bg-primary text-white hover:bg-primary-hover" 
                  : "text-foreground hover:text-foreground hover:bg-secondary/20"
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm">Table</span>
            </Button>
          </div>
          
          <Button type="button" onClick={addNewItem} className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Item
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
       

        {/* Items Section */}
        {viewMode === "table" ? <TableView /> : <ListView />}

        {/* Form Actions */}
        <div className="flex justify-center gap-4 pt-6">
          <Button type="submit" size="lg" className="min-w-48 gap-2">
            
            Submit
          </Button>
          <Button type="button" size="lg" variant="outline" onClick={() => navigate(-1)} className="min-w-48 gap-2">
            <X className="w-5 h-5" />
            Cancel
          </Button>
        </div>
      </form>

      {/* Vendor Quotation Table Dialog */}
      <Dialog open={isVendorFormOpen} onOpenChange={setIsVendorFormOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <UserRoundPlus className="w-6 h-6 text-primary" />
              </div>
              Manage Vendor Quotations
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Quotations Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Current Quotations</h3>
                <Badge variant="secondary">
                  {requestItems.find(item => item.id === currentItemId)?.vendorQuotations.length || 0}/4 Quotations
                </Badge>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="border-r font-semibold">SR.</TableHead>
                      <TableHead className="border-r font-semibold">Vendor Name</TableHead>
                      <TableHead className="border-r font-semibold">Contact Person</TableHead>
                      <TableHead className="border-r font-semibold">Phone</TableHead>
                      <TableHead className="border-r font-semibold">Total Quotation Amount</TableHead>
                      <TableHead className="border-r font-semibold">Notes</TableHead>
                      <TableHead className="border-r font-semibold">File</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestItems.find(item => item.id === currentItemId)?.vendorQuotations.map((quotation, index) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="border-r text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="border-r font-medium">{quotation.vendorName}</TableCell>
                        <TableCell className="border-r">{quotation.contactPerson}</TableCell>
                        <TableCell className="border-r">{quotation.phone}</TableCell>
                        <TableCell className="border-r font-medium text-primary">{quotation.quotedPrice}</TableCell>
                        <TableCell className="border-r text-sm">{quotation.notes || '-'}</TableCell>
                        <TableCell className="border-r">
                          {quotation.quotationFile ? (
                            <div className="flex items-center gap-1 text-sm">
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-20">{quotation.quotationFile.name}</span>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVendorQuotation(currentItemId, quotation.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!requestItems.find(item => item.id === currentItemId)?.vendorQuotations.length) && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No vendor quotations added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Add New Quotation Form */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Add New Quotation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorName" className="text-sm font-medium">Vendor Name *</Label>
                <Input
                  id="vendorName"
                  value={vendorFormData.vendorName}
                  onChange={(e) => handleVendorFormChange("vendorName", e.target.value)}
                  placeholder="Enter vendor name"
                    className="h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-sm font-medium">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={vendorFormData.contactPerson}
                  onChange={(e) => handleVendorFormChange("contactPerson", e.target.value)}
                  placeholder="Enter contact person"
                    className="h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={vendorFormData.phone}
                  onChange={(e) => handleVendorFormChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                    className="h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quotedPrice" className="text-sm font-medium">Total Quotation Amount*</Label>
                <Input
                  id="quotedPrice"
                  value={vendorFormData.quotedPrice}
                  onChange={(e) => handleVendorFormChange("quotedPrice", e.target.value)}
                  placeholder="Enter Total Quotation Amount"
                    className="h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200"
                />
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quotationFile" className="text-sm font-medium">Quotation File</Label>
              <Input
                id="quotationFile"
                type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleVendorFileChange(file);
                  }
                }}
                    className="h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                  <Input
                id="notes"
                value={vendorFormData.notes}
                onChange={(e) => handleVendorFormChange("notes", e.target.value)}
                placeholder="Additional notes or comments"
                    className="h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200"
              />
            </div>
          </div>

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  {vendorFormData.quotationFile && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Selected: {vendorFormData.quotationFile.name}</span>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={addVendorQuotation} 
                  disabled={!vendorFormData.vendorName.trim() || !vendorFormData.quotedPrice.trim() || 
                           (requestItems.find(item => item.id === currentItemId)?.vendorQuotations.length || 0) >= 4}
                  className="h-10 px-6 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
              Add Quotation
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={() => setIsVendorFormOpen(false)} className="h-10 px-6">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Vendor Quotations Dialog */}
      <Dialog open={isViewQuotationsOpen} onOpenChange={setIsViewQuotationsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-foreground" />
              Vendor Quotations
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentQuotations.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="border-r font-semibold">SR.</TableHead>
                      <TableHead className="border-r font-semibold">Vendor Name</TableHead>
                      <TableHead className="border-r font-semibold">Contact Person</TableHead>
                      <TableHead className="border-r font-semibold">Phone</TableHead>
                      <TableHead className="border-r font-semibold">Total Quotation Amount</TableHead>
                      <TableHead className="border-r font-semibold">Notes</TableHead>
                      <TableHead className="border-r font-semibold">File</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                {currentQuotations.map((quotation, index) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="border-r text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="border-r font-medium">{quotation.vendorName}</TableCell>
                        <TableCell className="border-r">{quotation.contactPerson || '-'}</TableCell>
                        <TableCell className="border-r">{quotation.phone || '-'}</TableCell>
                        <TableCell className="border-r font-medium text-primary">{quotation.quotedPrice}</TableCell>
                        <TableCell className="border-r text-sm max-w-32">
                          <div className="truncate" title={quotation.notes || ''}>
                            {quotation.notes || '-'}
                      </div>
                        </TableCell>
                        <TableCell className="border-r">
                          {quotation.quotationFile ? (
                            <div className="flex items-center gap-1 text-sm">
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-20" title={quotation.quotationFile.name}>
                                {quotation.quotationFile.name}
                              </span>
                        </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVendorQuotation(currentItemId, quotation.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Quotations</h3>
                <p className="text-muted-foreground">
                  No vendor quotations have been added for this item yet.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsViewQuotationsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialRequest;
