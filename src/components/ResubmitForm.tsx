import { useState, useEffect } from "react";
import { Send, X, FileText, AlertTriangle, Edit, CheckCircle, Plus, Trash2, Camera, Eye, UserRoundPlus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "../hooks/use-toast";
import { useRole } from "../contexts/RoleContext";
import materialsApi from "../lib/api/materials";
import machinesApi from "../lib/api/machines";
import { getUnits } from "../lib/api/common";
import { Material, Machine, Unit, VendorQuotation } from "../lib/api/types";
import { formatDateToDDMMYYYY } from "../lib/utils";

export enum PurposeType {
  MACHINE = 'machine',
  OTHER = 'other',
  SPARE = 'spare',
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
  purposeType: PurposeType;
}

interface ResubmitFormProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedRequest: any) => void;
}

export const ResubmitForm = ({ request, isOpen, onClose, onSubmit }: ResubmitFormProps) => {
  const { currentUser } = useRole();

  // Helper function to format Purchase ID (same as MaterialOrderBookTab)
  const formatPurchaseId = (uniqueId: string, branchCode?: string) => {
    // Convert to uppercase and keep numeric unit format (UNIT1, UNIT2, etc.)
    let formattedId = uniqueId.toUpperCase();

    // Remove any hyphens between UNIT and number
    formattedId = formattedId.replace(/UNIT-(\d+)/g, 'UNIT$1');

    return formattedId;
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);
  const [isViewQuotationsOpen, setIsViewQuotationsOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string>("");
  const [currentQuotations, setCurrentQuotations] = useState<VendorQuotation[]>([]);
  const [vendorFormData, setVendorFormData] = useState<Partial<VendorQuotation>>({
    vendorName: "",
    contactPerson: "",
    phone: "",
    price: "0",
    quotationAmount: "0",
    notes: "",
    filePaths: []
  });

  // Materials and Machines from API
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [machinesError, setMachinesError] = useState<string | null>(null);

  // Add units state
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // Enhanced getUnitName function with better debugging
  const getUnitName = (unitId?: number) => {
    if (!unitId) {
      console.log('No unitId provided');
      return '';
    }
    const unit = availableUnits.find(u => u.id === unitId);
    console.log(`Looking for unitId: ${unitId}, Found:`, unit, 'Available units:', availableUnits);
    return unit?.name || '';
  };

  // Initialize request items from the original request
  const [requestItems, setRequestItems] = useState<RequestItem[]>(() => {
    if (request?.items && request.items.length > 0) {
      // If request has items array, use all items
      return request.items.map((item: any, index: number) => ({
        id: item.id || String(index + 1),
        srNo: index + 1,
        productName: item.material?.name || item.productName || item.materialName || "",
        machineName: item.machine?.name || item.machineName || "",
        specifications: item.specifications || "",
        oldStock: item.currentStock || item.material?.currentStock || item.oldStock || 0,
        reqQuantity: String(item.requestedQuantity || item.reqQuantity || item.quantity || ""),
        measureUnit: item.material?.measureUnit?.name || item.measureUnit || "",
        images: [],
        imagePreviews: item.imagePaths || item.imagePreviews || [],
        notes: item.notes || "",
        vendorQuotations: (item.quotations || item.vendorQuotations || []).map((quotation: any) => ({
          id: quotation.id || String(Date.now()),
          vendorName: quotation.vendorName || "",
          contactPerson: quotation.contactPerson || "",
          phone: quotation.phone || "",
          price: quotation.price || "0",
          quotationAmount: quotation.quotationAmount || "0",
          notes: quotation.notes || "",
          filePaths: [] // File objects will be handled separately
        })),
        purposeType: item.purposeType || PurposeType.MACHINE
      }));
    } else {
      // Fallback to single item from request root level
      return [{
        id: "1",
        srNo: 1,
        productName: request?.material?.name || request?.materialName || request?.productName || "",
        machineName: request?.machine?.name || request?.machineName || "",
        specifications: request?.specifications || "",
        oldStock: request?.currentStock || request?.material?.currentStock || request?.oldStock || 0,
        reqQuantity: String(request?.requestedQuantity || request?.quantity || request?.reqQuantity || ""),
        measureUnit: request?.material?.measureUnit?.name || request?.measureUnit || "",
        images: [],
        imagePreviews: request?.imagePaths || request?.imagePreviews || [],
        notes: request?.notes || "",
        vendorQuotations: (request?.quotations || request?.vendorQuotations || []).map((quotation: any) => ({
          id: quotation.id || String(Date.now()),
          vendorName: quotation.vendorName || "",
          contactPerson: quotation.contactPerson || "",
          phone: quotation.phone || "",
          price: quotation.price || "0",
          quotationAmount: quotation.quotationAmount || "0",
          notes: quotation.notes || "",
          filePaths: [] // File objects will be handled separately
        })),
        purposeType: request?.purposeType || PurposeType.MACHINE
      }];
    }
  });

  const [resubmissionNotes, setResubmissionNotes] = useState(() => {
    const revertReason = request?.revertReason || request?.rejectionReason || "";
    return revertReason ? `Original Revert Reason: ${revertReason}\n\nChanges Made: ` : "";
  });

  useEffect(() => {
      const fetchMaterials = async () => {
        setIsLoadingMaterials(true);
        setMaterialsError(null);
        try {
          const res = await materialsApi.getMaterials({
            limit: 100,
            sortBy: 'id',
            sortOrder: 'ASC',
          });
          setAvailableMaterials(res.data);
        } catch (err) {
          console.error('Error fetching materials:', err);
          setMaterialsError('Failed to load materials');
          toast({
            title: 'Error',
            description: 'Failed to load materials',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingMaterials(false);
        }
      };

      const fetchMachines = async () => {
        setIsLoadingMachines(true);
        setMachinesError(null);
        try {
          const res = await machinesApi.getAll({
            limit: 100,
            sortBy: 'id',
            sortOrder: 'ASC',
          });
          setAvailableMachines(res.data);
        } catch (err) {
          console.error('Error fetching machines:', err);
          setMachinesError('Failed to load machines');
          toast({
            title: 'Error',
            description: 'Failed to load machines',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingMachines(false);
        }
      };

    // Add fetch units function
      const fetchUnits = async () => {
        setIsLoadingUnits(true);
        try {
          const res = await getUnits({ limit: 100 });
          setAvailableUnits(res.data || []);
        } catch (err) {
          console.error('Error fetching units:', err);
        } finally {
          setIsLoadingUnits(false);
        }
      };

      fetchMaterials();
      fetchMachines();
      fetchUnits();
  }, []);

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

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newFiles.length) {
          setRequestItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                  ...item,
                  images: [...(item.images || []), ...newFiles],
                  imagePreviews: [
                    ...(item.imagePreviews || []),
                    ...newPreviews,
                  ],
                }
                : item
            )
          );
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (itemId: string, imageIndex: number) => {
    setRequestItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
            ...item,
            images:
              item.images?.filter((_, index) => index !== imageIndex) || [],
            imagePreviews:
              item.imagePreviews?.filter(
                (_, index) => index !== imageIndex
              ) || [],
          }
          : item
      )
    );
  };

  const handleMaterialSelect = (itemId: string, materialName: string) => {
    console.log('Material selected:', materialName);
    const material = availableMaterials.find((m) => m.name === materialName);
    console.log('Found material:', material);
    if (material) {
      // Use measureUnit.name directly instead of looking up by ID
      const unitName = material.measureUnit?.name || 'units';
      console.log('Unit name for material:', unitName);
      setRequestItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
          ...item,
          productName: material.name,
              specifications: material.specifications || '',
              measureUnit: unitName, // Use the unit name directly
              oldStock: material.currentStock,
            }
            : item
        )
      );
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
      vendorQuotations: [],
      purposeType: PurposeType.MACHINE
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
      vendorName: "",
      contactPerson: "",
      phone: "",
      price: "0",
      quotationAmount: "0",
      notes: "",
      filePaths: []
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
    setVendorFormData(prev => ({ ...prev, filePaths: [file.name] }));
  };

  const addVendorQuotation = () => {
    const currentItem = requestItems.find(item => item.id === currentItemId);
    if (currentItem && currentItem.vendorQuotations.length < 4) {
      const newQuotation: VendorQuotation = {
        ...vendorFormData,
        id: Date.now(),
        isSelected: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as VendorQuotation;
      
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

  const removeVendorQuotation = (itemId: string, quotationId: number) => {
    setRequestItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, vendorQuotations: item.vendorQuotations.filter(q => q.id !== quotationId) }
        : item
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    requestItems.forEach((item, index) => {
      if (!item.productName.trim())
        newErrors[
          `productName_${item.id}`
        ] = `Product name is required for item ${index + 1}`;
      
      // Validate purpose type and machine selection
      if (item.purposeType === PurposeType.MACHINE) {
        if (!item.machineName || !item.machineName.trim() || item.machineName === 'Spare' || item.machineName === 'Other')
          newErrors[
            `machineName_${item.id}`
          ] = `Machine selection is required for item ${index + 1}`;
      } else if (item.purposeType === PurposeType.SPARE || item.purposeType === PurposeType.OTHER) {
        if (!item.notes || !item.notes.trim())
          newErrors[
            `notes_${item.id}`
          ] = `Notes are required for ${item.purposeType} purpose in item ${index + 1}`;
      }
      
      if (!item.reqQuantity.trim())
        newErrors[
          `reqQuantity_${item.id}`
        ] = `Required quantity is required for item ${index + 1}`;
      
      const qty = Number(item.reqQuantity);
      if (qty <= 0)
        newErrors[
          `reqQuantity_${item.id}`
        ] = `Quantity must be greater than 0 for item ${index + 1}`;
    });

    if (!resubmissionNotes.trim()) {
      newErrors.resubmissionNotes = "Please explain the changes made to address the revert reason";
    }

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

    const updatedRequest = {
      ...request,
      id: request.id,
      uniqueId: request.uniqueId, // Preserve the original uniqueId
      status: "pending_approval",
      statusDescription: "Resubmitted after addressing Owner's concerns",
      currentStage: "Pending Approval",
      progressStage: 1,
      resubmittedBy: currentUser?.name,
      resubmittedDate: new Date().toISOString(),
      resubmissionNotes: resubmissionNotes,
      originalRevertReason: request.revertReason || request.rejectionReason,
      resubmissionCount: (request.resubmissionCount || 0) + 1,
      items: requestItems.map(item => ({
        ...item,
        reqQuantity: Number(item.reqQuantity)
      })),
      requestedBy: currentUser?.name || "",
      department: currentUser?.department || ""
    };

    console.log('ResubmitForm: Submitting updated request:', updatedRequest);
    onSubmit(updatedRequest);

    toast({
      title: "Request Resubmitted",
      description: `Request ${request.id} has been resubmitted for approval with your updates.`,
    });

    onClose();
  };

  const TableView = () => (
    <Card className='border-0 shadow-none'>
      <CardContent className='p-0 border-none'>
        <div className='overflow-x-auto border-none'>
          <Table className='border-none'>
            <TableHeader className='border-none'>
              <TableRow className='bg-gray-50'>
                <TableHead className='border border-gray-300 font-semibold w-32'>
                  PURCHASE ID
                </TableHead>
                <TableHead className='border border-gray-300 font-semibold w-40'>
                  MATERIALS
                </TableHead>
                <TableHead className='border border-gray-300 font-semibold w-56'>
                  SPECIFICATIONS
                </TableHead>
                <TableHead className='border border-gray-300 font-semibold w-20'>
                  CURRENT STOCK
                </TableHead>
                <TableHead className='border border-gray-300 font-semibold w-24'>
                  REQ. QUANTITY
                </TableHead>
                <TableHead className='border border-gray-300 font-semibold w-20'>
                  IMAGES
                </TableHead>
                <TableHead className='border border-gray-300 font-semibold w-40'>
                  VENDOR QUOTATIONS
                </TableHead>
                <TableHead className='border border-gray-300 font-semibold w-32'>
                  PURPOSE TYPE
                </TableHead>
                <TableHead className='border border-gray-300 font-semibold w-52'>
                  MACHINE NAME
                </TableHead>
                <TableHead className='border border-gray-300 font-semibold w-40'>
                  NOTES
                </TableHead>
                <TableHead className='border border-gray-300 font-semibold w-16'>
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className='border border-gray-300 text-center font-semibold'>
                    {request?.uniqueId ? formatPurchaseId(request.uniqueId, request?.branch?.code) : (request?.id || 'N/A')}
                  </TableCell>
                  <TableCell className='border border-gray-300'>
                    <Select
                      value={item.productName}
                      onValueChange={(value) =>
                        handleMaterialSelect(item.id, value)
                      }
                    >
                      <SelectTrigger className='border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none'>
                        <SelectValue placeholder='Select Material' />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials.map((material) => (
                        <SelectItem key={material.name} value={material.name}>
                            {material.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`productName_${item.id}`] && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors[`productName_${item.id}`]}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className='border border-gray-300'>
                  <Textarea
                    value={item.specifications}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 30);
                        handleItemChange(item.id, 'specifications', value);
                      }}
                      placeholder='Specifications (max 30 chars)'
                      maxLength={30}
                      className='border-0 p-0 h-auto min-h-[60px] resize-none focus:ring-0 focus:outline-none rounded-none'
                      rows={2}
                    />
                    <div className='text-xs text-muted-foreground mt-1'>
                      {item.specifications.length}/30 characters
                </div>
                  </TableCell>
                  <TableCell className='border border-gray-300 text-center'>
                    <div className='flex items-center gap-2'>
                    <Input
                        type='number'
                      value={item.oldStock}
                        readOnly
                        onChange={(e) =>
                          handleItemChange(item.id, 'oldStock', e.target.value)
                        }
                        placeholder='0'
                        min='0'
                        className='border-0 p-0 h-auto w-20 text-center focus:ring-0 focus:outline-none rounded-none'
                      />
                      <span className='text-sm text-gray-600'>
                        {item.measureUnit}
                      </span>
                  </div>
                  </TableCell>
                  <TableCell className='border border-gray-300'>
                    <div className='flex items-center gap-2'>
                      <Input
                        id={`reqQuantity-${item.id}`}
                        type='number'
                        value={item.reqQuantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'reqQuantity',
                            e.target.value
                          )
                        }
                        placeholder='Qty'
                        min='0'
                        className='border-0 p-0 h-auto w-20 focus:ring-0 focus:outline-none rounded-none'
                      />
                      <span className='text-sm text-gray-600'>
                        {item.measureUnit}
                      </span>
                    </div>
                    {errors[`reqQuantity_${item.id}`] && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors[`reqQuantity_${item.id}`]}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className='border border-gray-300'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                    <Input
                          type='file'
                          accept='image/*'
                          multiple
                      onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              handleMultipleFileChange(item.id, files);
                            }
                          }}
                          className='hidden'
                          id={`images-${item.id}`}
                        />
                        <Label
                          htmlFor={`images-${item.id}`}
                          className='cursor-pointer'
                        >
                          <Camera className='w-4 h-4' />
                        </Label>
                        <span className='text-xs text-muted-foreground'>
                          ({item.imagePreviews?.length || 0} images)
                        </span>
                      </div>
                      {item.imagePreviews && item.imagePreviews.length > 0 && (
                        <div className='flex flex-wrap gap-1'>
                          {item.imagePreviews
                            .slice(0, 3)
                            .map((preview, index) => (
                              <div
                                key={index}
                                className='relative w-8 h-8 rounded border overflow-hidden'
                              >
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className='w-full h-full object-cover'
                                />
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => removeImage(item.id, index)}
                                  className='absolute -top-1 -right-1 h-4 w-4 p-0 bg-red-500 text-white hover:bg-red-600 rounded-full'
                                >
                                  <X className='w-2 h-2' />
                                </Button>
                              </div>
                            ))}
                          {item.imagePreviews.length > 3 && (
                            <div className='w-8 h-8 rounded border flex items-center justify-center bg-gray-100 text-xs'>
                              +{item.imagePreviews.length - 3}
                      </div>
                    )}
                  </div>
                      )}
                </div>
                  </TableCell>
                  <TableCell className='border border-gray-300'>
                    <div className='space-y-1'>
                      <div className='flex gap-1'>
                    <Button 
                          variant='outline'
                          size='sm'
                          className='h-8 flex-1'
                      onClick={() => openVendorForm(item.id)}
                      disabled={item.vendorQuotations.length >= 4}
                    >
                          <Plus className='w-3 h-3 mr-1' />
                          Add ({item.vendorQuotations.length}/4)
                    </Button>
                    {item.vendorQuotations.length > 0 && (
                      <Button
                            variant='outline'
                            size='sm'
                            className='h-8 w-8 p-0'
                        onClick={() => viewVendorQuotations(item.id)}
                      >
                            <Eye className='w-3 h-3' />
                      </Button>
                    )}
                  </div>
                  {item.vendorQuotations.filter(q => q.isSelected).length > 0 && (
                    <div className='space-y-1'>
                      {item.vendorQuotations.filter(q => q.isSelected).map((quotation) => (
                            <div
                              key={quotation.id}
                              className='flex items-center justify-between gap-2 text-xs bg-gray-50 p-1 rounded border'
                            >
                              <span className='truncate flex-1 font-medium'>
                                {quotation.vendorName} - {quotation.quotationAmount}
                              </span>
                          <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  removeVendorQuotation(item.id, quotation.id)
                                }
                                className='h-4 w-4 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                <X className='w-2 h-2' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                  </TableCell>
                  <TableCell className='border border-gray-300'>
                    <Select
                      value={item.purposeType}
                      onValueChange={(value) => {
                        handleItemChange(item.id, 'purposeType', value);
                        // Reset machine name when purpose type changes
                        if (value === PurposeType.SPARE || value === PurposeType.OTHER) {
                          handleItemChange(item.id, 'machineName', value === PurposeType.SPARE ? 'Spare' : 'Other');
                        } else {
                          handleItemChange(item.id, 'machineName', '');
                        }
                      }}
                    >
                      <SelectTrigger className='border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none'>
                        <SelectValue placeholder='Select Purpose *' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PurposeType.MACHINE}>Machine</SelectItem>
                        <SelectItem value={PurposeType.SPARE}>Spare</SelectItem>
                        <SelectItem value={PurposeType.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors[`purposeType_${item.id}`] && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors[`purposeType_${item.id}`]}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className='border border-gray-300'>
                    {item.purposeType === PurposeType.MACHINE ? (
                      <Select
                        value={item.machineName}
                        onValueChange={(value) =>
                          handleItemChange(item.id, 'machineName', value)
                        }
                      >
                        <SelectTrigger className='border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none'>
                          <SelectValue placeholder='Select Machine *' />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMachines.map((machine) => (
                            <SelectItem key={machine.id} value={machine.name}>
                              {machine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className='text-sm text-gray-600 p-2'>
                        {item.purposeType === PurposeType.SPARE ? 'Spare' : 'Other'}
                      </div>
                    )}
                    {errors[`machineName_${item.id}`] && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors[`machineName_${item.id}`]}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className='border border-gray-300'>
                    <Textarea
                      id={`notes-${item.id}`}
                      value={item.notes || ''}
                      onChange={(e) =>
                        handleItemChange(item.id, 'notes', e.target.value)
                      }
                      placeholder={item.purposeType === PurposeType.SPARE || item.purposeType === PurposeType.OTHER ? 'Required for Spare/Other purpose...' : 'Add notes...'}
                      className='border-0 p-0 h-auto min-h-[60px] resize-none focus:ring-0 focus:outline-none rounded-none'
                      rows={2}
                    />
                    {errors[`notes_${item.id}`] && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors[`notes_${item.id}`]}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className='border border-gray-300'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => removeItem(item.id)}
                      disabled={requestItems.length === 1}
                      className='h-8 w-8 p-0'
                    >
                      <Trash2 className='w-3 h-3' />
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-foreground" />
            Resubmit Request - {request?.id}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Revert Information */}
          {request?.revertReason && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Original Revert Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 bg-white p-3 rounded border">
                  {request.revertReason}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Add Item Button */}
          <div className="flex justify-end">
            <Button type="button" onClick={addNewItem} className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Item
            </Button>
          </div>

          {/* Items Section */}
          <TableView />

          {/* Resubmission Notes */}
          <Card className="border-secondary bg-secondary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">Resubmission Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="resubmission-notes">Changes Made to Address Revert Reason *</Label>
                <Textarea
                  id="resubmission-notes"
                  placeholder="Explain what changes you have made to address the Owner's concerns..."
                  value={resubmissionNotes}
                  onChange={(e) => setResubmissionNotes(e.target.value)}
                  rows={4}
                  className={`min-h-[50px] px-4 py-3 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200 ${errors.resubmissionNotes ? "border-red-500" : ""}`}
                />
                {errors.resubmissionNotes && (
                  <p className="text-red-500 text-sm">{errors.resubmissionNotes}</p>
                )}
              </div>
              <div className="text-sm text-foreground">
                <strong>Note:</strong> Please be specific about how you have addressed each point raised in the revert reason.
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-center gap-3 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary-hover text-white">
              <Send className="w-4 h-4 mr-2" />
              Resubmit Request
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>

        {/* Vendor Quotation Table Dialog */}
        <Dialog open={isVendorFormOpen} onOpenChange={setIsVendorFormOpen}>
          <DialogContent className='max-w-6xl max-h-[95vh] overflow-y-auto'>
            <DialogHeader className='pb-4'>
              <DialogTitle className='flex items-center gap-3 text-xl'>
                <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
                  <UserRoundPlus className='w-6 h-6 text-primary' />
                </div>
                Manage Vendor Quotations
              </DialogTitle>
            </DialogHeader>
            
            <div className='space-y-6'>
              {/* Current Quotations Table */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold'>Current Quotations</h3>
                  <Badge variant='secondary'>
                    {requestItems.find((item) => item.id === currentItemId)
                      ?.vendorQuotations.length || 0}
                    /4 Quotations
                  </Badge>
                </div>

                <div className='border rounded-lg overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-gray-50'>
                        <TableHead className='border-r font-semibold w-12'>
                          SR.
                        </TableHead>
                        <TableHead className='border-r font-semibold w-36'>
                          Vendor Name
                        </TableHead>
                        <TableHead className='border-r font-semibold w-32'>
                          Contact Person
                        </TableHead>
                        <TableHead className='border-r font-semibold w-28'>
                          Phone
                        </TableHead>
                        <TableHead className='border-r font-semibold w-24'>
                          Price
                        </TableHead>
                        <TableHead className='border-r font-semibold w-32'>
                          Total Quotation Amount
                        </TableHead>
                        <TableHead className='border-r font-semibold w-44'>
                          Notes
                        </TableHead>
                        <TableHead className='border-r font-semibold w-28'>
                          File
                        </TableHead>
                        <TableHead className='font-semibold w-16'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestItems
                        .find((item) => item.id === currentItemId)
                        ?.vendorQuotations.map((quotation, index) => (
                          <TableRow key={quotation.id}>
                            <TableCell className='border-r text-center font-medium'>
                              {index + 1}
                            </TableCell>
                            <TableCell className='border-r font-medium'>
                              {quotation.vendorName}
                            </TableCell>
                            <TableCell className='border-r'>
                              {quotation.contactPerson}
                            </TableCell>
                            <TableCell className='border-r'>
                              {quotation.phone}
                            </TableCell>
                            <TableCell className='border-r font-medium text-blue-600'>
                              ₹{quotation.price}
                            </TableCell>
                            <TableCell className='border-r font-medium text-primary'>
                              ₹{quotation.quotationAmount}
                            </TableCell>
                            <TableCell className='border-r text-sm'>
                              {quotation.notes || '-'}
                            </TableCell>
                            <TableCell className='border-r'>
                              {quotation.filePaths && quotation.filePaths.length > 0 ? (
                                <div className='flex items-center gap-1 text-sm'>
                                  <FileText className='w-3 h-3' />
                                  <span className='truncate max-w-20'>
                                    {quotation.filePaths[0]}
                                  </span>
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  removeVendorQuotation(
                                    currentItemId,
                                    quotation.id
                                  )
                                }
                                className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                <Trash2 className='w-3 h-3' />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {!requestItems.find((item) => item.id === currentItemId)
                        ?.vendorQuotations.length && (
                          <TableRow>
                            <TableCell
                              colSpan={10}
                              className='text-center py-8 text-muted-foreground'
                            >
                              No vendor quotations
                            </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Add New Quotation Form */}
              <div className='space-y-4 border-t pt-6'>
                <h3 className='text-lg font-semibold'>Add New Quotation</h3>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='vendorName' className='text-sm font-medium'>
                      Vendor Name *
                    </Label>
                  <Input
                      id='vendorName'
                    value={vendorFormData.vendorName}
                      onChange={(e) =>
                        handleVendorFormChange('vendorName', e.target.value)
                      }
                      placeholder='Enter vendor name'
                      className='h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200'
                  />
                </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='contactPerson'
                      className='text-sm font-medium'
                    >
                      Contact Person
                    </Label>
                  <Input
                      id='contactPerson'
                    value={vendorFormData.contactPerson}
                      onChange={(e) =>
                        handleVendorFormChange('contactPerson', e.target.value)
                      }
                      placeholder='Enter contact person'
                      className='h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200'
                  />
                </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phone' className='text-sm font-medium'>
                      Phone
                    </Label>
                  <Input
                      id='phone'
                    value={vendorFormData.phone}
                      onChange={(e) =>
                        handleVendorFormChange('phone', e.target.value)
                      }
                      placeholder='Enter phone number'
                      className='h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200'
                  />
                </div>
                  <div className='space-y-2'>
                    <Label htmlFor='price' className='text-sm font-medium'>
                      Price*
                    </Label>
                  <Input
                      id='price'
                    value={vendorFormData.price}
                      onChange={(e) =>
                        handleVendorFormChange('price', e.target.value)
                      }
                      placeholder='Enter Price'
                      className='h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200'
                  />
                </div>
                  <div className='space-y-2'>
                    <Label htmlFor='quotationAmount' className='text-sm font-medium'>
                      Total Quotation Amount*
                    </Label>
                  <Input
                      id='quotationAmount'
                    value={vendorFormData.quotationAmount}
                      onChange={(e) =>
                        handleVendorFormChange('quotationAmount', e.target.value)
                      }
                      placeholder='Enter Total Quotation Amount'
                      className='h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200'
                  />
                </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='quotationFile'
                      className='text-sm font-medium'
                    >
                      Quotation File
                    </Label>
                <Input
                      id='quotationFile'
                      type='file'
                      accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleVendorFileChange(file);
                    }
                  }}
                      className='h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200'
                />
              </div>
                  <div className='space-y-2'>
                    <Label htmlFor='notes' className='text-sm font-medium'>
                      Notes
                    </Label>
                    <Input
                      id='notes'
                  value={vendorFormData.notes}
                      onChange={(e) =>
                        handleVendorFormChange('notes', e.target.value)
                      }
                      placeholder='Additional notes or comments'
                      className='h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200'
                />
              </div>
            </div>

                <div className='flex justify-between items-center pt-4'>
                  <div className='text-sm text-muted-foreground'>
                    {vendorFormData.filePaths && vendorFormData.filePaths.length > 0 && (
                      <div className='flex items-center gap-2'>
                        <FileText className='w-4 h-4' />
                        <span>Selected: {vendorFormData.filePaths[0]}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={addVendorQuotation}
                    disabled={
                      !vendorFormData.vendorName.trim() ||
                      !vendorFormData.quotationAmount.trim() ||
                      (requestItems.find((item) => item.id === currentItemId)
                        ?.vendorQuotations.length || 0) >= 4
                    }
                    className='h-10 px-6 bg-primary hover:bg-primary/90'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                Add Quotation
              </Button>
                </div>

                <div className='flex justify-end gap-4 pt-6 border-t'>
                  <Button
                    variant='outline'
                    onClick={() => setIsVendorFormOpen(false)}
                    className='h-10 px-6'
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Vendor Quotations Dialog */}
        <Dialog
          open={isViewQuotationsOpen}
          onOpenChange={setIsViewQuotationsOpen}
        >
          <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Eye className='w-5 h-5 text-foreground' />
                Vendor Quotations
              </DialogTitle>
            </DialogHeader>
            
            <div className='space-y-4'>
              {currentQuotations.length > 0 ? (
                <div className='border rounded-lg overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-gray-50'>
                        <TableHead className='border-r font-semibold w-12'>
                          SR.
                        </TableHead>
                        <TableHead className='border-r font-semibold w-36'>
                          Vendor Name
                        </TableHead>
                        <TableHead className='border-r font-semibold w-32'>
                          Contact Person
                        </TableHead>
                        <TableHead className='border-r font-semibold w-28'>
                          Phone
                        </TableHead>
                        <TableHead className='border-r font-semibold w-24'>
                          Price
                        </TableHead>
                        <TableHead className='border-r font-semibold w-32'>
                          Total Quotation Amount
                        </TableHead>
                        <TableHead className='border-r font-semibold w-44'>
                          Notes
                        </TableHead>
                        <TableHead className='border-r font-semibold w-28'>
                          File
                        </TableHead>
                        <TableHead className='font-semibold w-16'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                  {currentQuotations.map((quotation, index) => (
                        <TableRow key={quotation.id}>
                          <TableCell className='border-r text-center font-medium'>
                            {index + 1}
                          </TableCell>
                          <TableCell className='border-r font-medium'>
                            {quotation.vendorName}
                          </TableCell>
                          <TableCell className='border-r'>
                            {quotation.contactPerson || '-'}
                          </TableCell>
                          <TableCell className='border-r'>
                            {quotation.phone || '-'}
                          </TableCell>
                          <TableCell className='border-r font-medium text-blue-600'>
                            ₹{quotation.price}
                          </TableCell>
                          <TableCell className='border-r font-medium text-primary'>
                            ₹{quotation.quotationAmount}
                          </TableCell>
                          <TableCell className='border-r text-sm max-w-32'>
                            <div
                              className='truncate'
                              title={quotation.notes || ''}
                            >
                              {quotation.notes || '-'}
                        </div>
                          </TableCell>
                          <TableCell className='border-r'>
                            {quotation.filePaths && quotation.filePaths.length > 0 ? (
                              <div className='flex items-center gap-1 text-sm'>
                                <FileText className='w-3 h-3' />
                                <span
                                  className='truncate max-w-20'
                                  title={quotation.filePaths[0]}
                                >
                                  {quotation.filePaths[0]}
                                </span>
                          </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                removeVendorQuotation(currentItemId, quotation.id)
                              }
                              className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                            >
                              <Trash2 className='w-3 h-3' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className='text-center py-8'>
                  <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold text-foreground mb-2'>
                    No Quotations
                  </h3>
                  <p className='text-muted-foreground'>
                    No vendor quotations for this item.
                  </p>
                </div>
              )}
            </div>

            <div className='flex justify-end pt-4'>
              <Button
                variant='outline'
                onClick={() => setIsViewQuotationsOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};