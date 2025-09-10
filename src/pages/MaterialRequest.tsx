import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Camera, Upload, X, Eye, User, Settings, MapPin, Package, Plus, Trash2, Building2, List, Table as TableIcon, ArrowLeft } from "lucide-react";
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
      imagePreview: null
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
      imagePreview: null
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
