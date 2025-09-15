import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Camera, Upload, X, Eye, User, Settings, MapPin, Package, Plus, Trash2, Building2, List, Table as TableIcon, ArrowLeft, Phone, Mail, Calendar, IndianRupee } from "lucide-react";
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
      specifications: "SH adhesive",
      unit: "kg",
      category: "Adhesives"
    },
    {
      name: "COPPER WIRE BRUSH",
      specifications: "0.01 mm thickness of wire",
      unit: "pieces",
      category: "Tools"
    },
    {
      name: "DHOLLAK BALL",
      specifications: "PVC transparent",
      unit: "pieces",
      category: "Components"
    },
    {
      name: "TRIANGLE BRUSH",
      specifications: "Cleaning brush",
      unit: "pieces",
      category: "Tools"
    },
    {
      name: "GUM TAPE",
      specifications: "1 inch width adhesive tape",
      unit: "pieces",
      category: "Office Supplies"
    },
    {
      name: "BEARINGS (SKF 6205-2RS)",
      specifications: "Deep Grove Ball Bearing, Inner: 25mm, Outer: 52mm",
      unit: "pieces",
      category: "Parts"
    },
    {
      name: "MOTOR OIL (SAE 10W-30)",
      specifications: "Industrial grade lubricant for machinery",
      unit: "liters",
      category: "Lubricants"
    },
    {
      name: "CONVEYOR BELTS",
      specifications: "Rubber belt, 600mm width, food grade",
      unit: "meters",
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

  const handleFileChange = (itemId: string, field: string, file: File) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: file } : item
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
      
      setIsVendorFormOpen(false);
      toast({
        title: "Vendor Quotation Added",
        description: `Quotation from ${vendorFormData.vendorName} added successfully`,
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
      unit: "",
      image: null,
      imagePreview: null,
      vendorQuotations: []
    }]);
    setErrors({});
    navigate("/supervisor-requests");
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
                <TableHead className="border border-gray-300 font-semibold">SPECIFICATIONS</TableHead>
                <TableHead className="border border-gray-300 font-semibold">OLD STOCK</TableHead>
                <TableHead className="border border-gray-300 font-semibold">REQ. QUANTITY</TableHead>
                <TableHead className="border border-gray-300 font-semibold">IMAGE</TableHead>
                <TableHead className="border border-gray-300 font-semibold">VENDOR QUOTATIONS</TableHead>
                <TableHead className="border border-gray-300 font-semibold">MACHINE NAME</TableHead>
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
                      value={item.specifications}
                      onChange={(e) => handleItemChange(item.id, "specifications", e.target.value)}
                      placeholder="Specifications"
                      className="border-0 p-0 h-auto"
                    />
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center">
                    <Input
                      type="number"
                      value={item.oldStock}
                      onChange={(e) => handleItemChange(item.id, "oldStock", e.target.value)}
                      placeholder="0"
                      min="0"
                      className="border-0 p-0 h-auto w-20 text-center"
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
                        className="border-0 p-0 h-auto w-20"
                      />
                      <span className="text-sm text-gray-600">{item.unit}</span>
                    </div>
                    {errors[`reqQuantity_${item.id}`] && (
                      <p className="text-destructive text-xs mt-1">{errors[`reqQuantity_${item.id}`]}</p>
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              handleItemChange(item.id, "imagePreview", e.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                            handleFileChange(item.id, "image", file);
                          }
                        }}
                        className="hidden"
                        id={`image-${item.id}`}
                      />
                      <Label htmlFor={`image-${item.id}`} className="cursor-pointer">
                        <Camera className="w-4 h-4" />
                      </Label>
                      {item.imagePreview && (
                        <div className="w-8 h-8 rounded border overflow-hidden">
                          <img src={item.imagePreview} alt="Preview" className="w-full h-full object-cover" />
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
                            <div key={quotation.id} className="flex items-center gap-1 text-xs">
                              <span className="truncate flex-1">{quotation.vendorName}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVendorQuotation(item.id, quotation.id)}
                                className="h-4 w-4 p-0"
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
    <div className="space-y-4">
      {requestItems.map((item) => (
        <Card key={item.id} className="card-friendly">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
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
                  <Label>Specifications</Label>
                  <Textarea
                    value={item.specifications}
                    onChange={(e) => handleItemChange(item.id, "specifications", e.target.value)}
                    placeholder="Enter detailed specifications"
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Old Stock</Label>
                    <Input
                      type="number"
                      value={item.oldStock}
                      onChange={(e) => handleItemChange(item.id, "oldStock", e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Required Quantity *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.reqQuantity}
                        onChange={(e) => handleItemChange(item.id, "reqQuantity", e.target.value)}
                        placeholder="Enter quantity"
                        min="0"
                      />
                      <span className="text-sm text-muted-foreground">{item.unit}</span>
                    </div>
                    {errors[`reqQuantity_${item.id}`] && (
                      <p className="text-destructive text-sm">{errors[`reqQuantity_${item.id}`]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            handleItemChange(item.id, "imagePreview", e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                          handleFileChange(item.id, "image", file);
                        }
                      }}
                      className="flex-1"
                    />
                    {item.imagePreview && (
                      <div className="w-16 h-16 rounded border overflow-hidden">
                        <img src={item.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vendor Quotations ({item.vendorQuotations.length}/4)</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
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
                        className="px-3"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {item.vendorQuotations.length > 0 && (
                    <div className="space-y-2">
                      {item.vendorQuotations.map((quotation) => (
                        <div key={quotation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
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
                      className="text-destructive hover:text-destructive"
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                INDENT FORM
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Material Request Form
              </p>
            </div>
          </div>
        </div>
        
        {/* List/Table Toggle */}
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
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Company Header */}
        <Card className="bg-secondary/10 border-secondary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-foreground" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">SREE SAI ROLLER FLOUR MILLS PVT LTD</h1>
                <p className="text-lg text-foreground">MATERIAL INDENT FORM</p>
              </div>
            </div>
            
            {/* Document Information */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm bg-white p-4 rounded border">
              <div>
                <span className="font-semibold">DATE:</span>
                <div>{new Date(headerData.date).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="font-semibold">DOC. NO.:</span>
                <div className="font-mono text-xs">{headerData.docNo}</div>
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
                <span className="font-semibold">REQ. FORM NO.:</span>
                <div className="font-mono text-xs">{headerData.reqFormNo}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Item Button */}
        <div className="flex justify-end">
          <Button type="button" onClick={addNewItem} className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Item
          </Button>
        </div>

        {/* Items Section */}
        {viewMode === "table" ? <TableView /> : <ListView />}

        {/* Form Actions */}
        <div className="flex justify-center gap-4 pt-6">
          <Button type="submit" size="lg" className="min-w-48 gap-2">
            <FileText className="w-5 h-5" />
            Submit Indent Form
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </form>

      {/* Vendor Quotation Form Dialog */}
      <Dialog open={isVendorFormOpen} onOpenChange={setIsVendorFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary/80" />
              Add Vendor Quotation
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name *</Label>
                <Input
                  id="vendorName"
                  value={vendorFormData.vendorName}
                  onChange={(e) => handleVendorFormChange("vendorName", e.target.value)}
                  placeholder="Enter vendor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={vendorFormData.contactPerson}
                  onChange={(e) => handleVendorFormChange("contactPerson", e.target.value)}
                  placeholder="Enter contact person"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={vendorFormData.phone}
                  onChange={(e) => handleVendorFormChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quotedPrice">Quoted Price *</Label>
                <Input
                  id="quotedPrice"
                  value={vendorFormData.quotedPrice}
                  onChange={(e) => handleVendorFormChange("quotedPrice", e.target.value)}
                  placeholder="Enter quoted price"
                />
              </div>
              
            </div>


            

            <div className="space-y-2">
              <Label htmlFor="quotationFile">Quotation File</Label>
              <Input
                id="quotationFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleVendorFileChange(file);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={vendorFormData.notes}
                onChange={(e) => handleVendorFormChange("notes", e.target.value)}
                placeholder="Additional notes or comments"
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsVendorFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addVendorQuotation}>
              Add Quotation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Vendor Quotations Dialog */}
      <Dialog open={isViewQuotationsOpen} onOpenChange={setIsViewQuotationsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-foreground" />
              Vendor Quotations
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentQuotations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuotations.map((quotation, index) => (
                  <Card key={quotation.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{quotation.vendorName}</CardTitle>
                        <Badge variant="secondary">Quotation #{index + 1}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Contact Person:</span>
                          <div className="font-medium">{quotation.contactPerson}</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Phone:</span>
                          <div className="font-medium">{quotation.phone}</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Price:</span>
                          <div className="font-medium text-primary/80">{quotation.quotedPrice}</div>
                        </div>
                      </div>
                      
                      {quotation.notes && (
                        <div>
                          <span className="font-medium text-muted-foreground text-sm">Notes:</span>
                          <div className="text-sm mt-1 p-2 bg-gray-50 rounded border">
                            {quotation.notes}
                          </div>
                        </div>
                      )}
                      
                      {quotation.quotationFile && (
                        <div>
                          <span className="font-medium text-muted-foreground text-sm">Quotation File:</span>
                          <div className="text-sm mt-1 p-2 bg-secondary/10 rounded border border-secondary">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-foreground" />
                              <span className="font-medium">{quotation.quotationFile.name}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
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
