import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  Camera,
  X,
  Eye,
  Plus,
  Trash2,
  FileText,
  UserRoundPlus,
  CheckCircle,
  Truck,
} from 'lucide-react';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from '../hooks/use-toast';
import { generateSrNo, formatDateToDDMMYYYY } from '../lib/utils';
import { StatusDropdown } from './StatusDropdown';
import { MaterialPurchaseItem } from '../lib/api/types';
import { getUnits } from '../lib/api/common';
import { Unit } from '../lib/api/types';
import { materialIndentsApi } from '../lib/api/material-indents';

export enum PurposeType {
  MACHINE = 'machine',
  OTHER = 'other',
  SPARE = 'spare',
}

interface RequestItem {
  id: string;
  srNo: string;
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

interface VendorQuotation {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  price: string;
  quotedPrice: string;
  notes: string;
  quotationFile?: File | null;
  isSelected?: boolean;
  filePaths?: string[]; // Add filePaths for API data
}

interface RequisitionIndentFormProps {
  requestData: {
    id: string;
    items: RequestItem[];
    requestedBy: string;
    location: string;
    date: string;
    status: string;
    apiData?: {
      id?: number; // Add indent ID for API calls
      partialReceiptHistory?: Array<{
        id: string;
        receivedQuantity: number;
        receivedDate: string;
        notes: string;
        receivedBy: string;
        timestamp: string;
        status: string;
      }>;
      totalReceivedQuantity?: number;
    };
    receiptHistory?: Array<{
      id: string;
      date: string;
      materialName: string;
      quantity: string;
      receivedQuantity?: string;
      receivedDate?: string;
      purchaseOrderNumber?: string;
      totalValue?: string;
      notes?: string;
      status: string;
      items?: MaterialPurchaseItem[];
    }>;
  };
  isReadOnly?: boolean;
  onItemChange?: (itemId: string, field: string, value: string) => void;
  onVendorQuotationChange?: (
    itemId: string,
    quotations: VendorQuotation[]
  ) => void;
  availableMaterials?: Array<{
    name: string;
    specifications: string;
    measureUnit: string;
    category: string;
    makerBrand?: string;
  }>;
  machines?: string[];
  onLoadItemImages?: (itemId: number) => void;
  onLoadQuotationImages?: (itemId: number) => void;
  itemImageUrlsMap?: Record<string, string[]>;
  quotationImageUrlsMap?: Record<string, string[]>;
  onStatusChange?: (newStatus: string, additionalData?: any) => void;
  userRole?: 'company_owner' | 'supervisor';
  hasPermission?: (permission: string) => boolean;
  selectedVendors?: Record<string, string>;
  onVendorSelection?: (vendors: Record<string, string>) => void;
}

export const RequisitionIndentForm: React.FC<RequisitionIndentFormProps> = ({
  requestData,
  isReadOnly = true,
  onItemChange,
  onVendorQuotationChange,
  availableMaterials = [],
  machines = [],
  onLoadItemImages,
  onLoadQuotationImages,
  itemImageUrlsMap = {},
  quotationImageUrlsMap = {}, // Keep for backward compatibility but not used for quotations anymore
  onStatusChange,
  userRole = 'supervisor',
  hasPermission = () => false,
  selectedVendors,
  onVendorSelection,
}) => {
  // Add units state
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // Add function to get unit name by ID
  const getUnitName = (unitId?: number) => {
    if (!unitId) return '';
    const unit = availableUnits.find(u => u.id === unitId);
    return unit?.name || '';
  };

  // Fetch units when component mounts
  useEffect(() => {
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

    fetchUnits();
  }, []);

  // Vendor management state
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string>('');
  const [vendorFormData, setVendorFormData] = useState<VendorQuotation>({
    id: '',
    vendorName: '',
    contactPerson: '',
    phone: '',
    price: '0',
    quotedPrice: '0',
    notes: '',
    quotationFile: null,
  });

  // Add state for image popup
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');

  // Add state for vendor selection
  const [selectedVendorsState, setSelectedVendorsState] = useState<Record<string, string>>({});

  // Add state for partial receipt management
  const [isPartialReceiptOpen, setIsPartialReceiptOpen] = useState(false);
  const [partialReceiptData, setPartialReceiptData] = useState({
    receivedQuantity: '',
    receivedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Add state for quotation details popup
  const [isQuotationPopupOpen, setIsQuotationPopupOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<VendorQuotation | null>(null);
  const [selectedItemForQuotation, setSelectedItemForQuotation] = useState<RequestItem | null>(null);
  
  // Add state for images loaded from API
  const [quotationImagesLoaded, setQuotationImagesLoaded] = useState<Record<string, string[]>>({});
  const [itemImagesLoaded, setItemImagesLoaded] = useState<Record<string, string[]>>({});

  // Add state for partial receipt details popup
  const [isPartialReceiptDetailsOpen, setIsPartialReceiptDetailsOpen] = useState(false);
  const [selectedItemForReceiptDetails, setSelectedItemForReceiptDetails] = useState<RequestItem | null>(null);

  // Function to show images in popup
  const showImagesInPopup = (images: string[], title: string) => {
    setSelectedImages(images);
    setPopupTitle(title);
    setIsImagePopupOpen(true);
  };

  // Function to show partial receipt details in popup
  const showPartialReceiptDetails = (item: RequestItem) => {
    setSelectedItemForReceiptDetails(item);
    setIsPartialReceiptDetailsOpen(true);
  };

  // Function to load item images from API
  const loadItemImages = async (itemId: number) => {
    try {
      const indentId = requestData.apiData?.id;
      
      if (!indentId) {
        console.warn('No indent ID available for loading item images');
        return;
      }

      console.log('Loading item images for:', { indentId, itemId });
      const imageUrls = await materialIndentsApi.getItemImageUrls(indentId, itemId);
      console.log('Item image URLs received:', imageUrls);
      
      setItemImagesLoaded(prev => ({
        ...prev,
        [itemId.toString()]: imageUrls
      }));
    } catch (error) {
      console.error('Error loading item images:', error);
      toast({
        title: 'Error',
        description: 'Failed to load item images',
        variant: 'destructive',
      });
    }
  };

  // Function to load quotation images from API
  const loadQuotationImages = async (itemId: number) => {
    try {
      // Extract indent ID from requestData
      const indentId = requestData.apiData?.id;
      
      if (!indentId) {
        console.warn('No indent ID available for loading quotation images');
        return;
      }

      console.log('Loading quotation images for:', { indentId, itemId });
      const imageUrls = await materialIndentsApi.getItemQuotationImageUrls(indentId, itemId);
      console.log('Quotation image URLs received:', imageUrls);

      setQuotationImagesLoaded(prev => ({
        ...prev,
        [itemId.toString()]: imageUrls
      }));
    } catch (error) {
      console.error('Error loading quotation images:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quotation images',
        variant: 'destructive',
      });
    }
  };

  // Function to show quotation details in popup
  const showQuotationDetails = (quotation: VendorQuotation, item: RequestItem) => {
    setSelectedQuotation(quotation);
    setSelectedItemForQuotation(item);
    setIsQuotationPopupOpen(true);
    
    // Load quotation images using API
    loadQuotationImages(parseInt(item.id, 10));
  };

  const handleItemChange = (itemId: string, field: string, value: string) => {
    if (!isReadOnly && onItemChange) {
      onItemChange(itemId, field, value);
    }
  };

  const handleMaterialSelect = (itemId: string, materialName: string) => {
    if (!isReadOnly && onItemChange) {
      const material = availableMaterials.find((m) => m.name === materialName);
      if (material) {
        onItemChange(itemId, 'productName', material.name);
        onItemChange(itemId, 'specifications', material.specifications);
        // Convert measureUnit ID to name if it's a number
        const unitName = typeof material.measureUnit === 'number' 
          ? getUnitName(material.measureUnit) 
          : material.measureUnit;
        onItemChange(itemId, 'measureUnit', unitName);
      }
    }
  };

  const openVendorForm = (itemId: string) => {
    setCurrentItemId(itemId);
    setVendorFormData({
      id: '',
      vendorName: '',
      contactPerson: '',
      phone: '',
      price: '0',
      quotedPrice: '0',
      notes: '',
      quotationFile: null,
    });
    setIsVendorFormOpen(true);
  };

  const handleVendorFormChange = (field: string, value: string) => {
    setVendorFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVendorFileChange = (file: File) => {
    setVendorFormData((prev) => ({ ...prev, quotationFile: file }));
  };

  const addVendorQuotation = () => {
    const currentItem = requestData.items.find(
      (item) => item.id === currentItemId
    );
    if (currentItem && currentItem.vendorQuotations.length < 4) {
      const newQuotation: VendorQuotation = {
        ...vendorFormData,
        id: String(Date.now()),
      };

      const updatedQuotations = [...currentItem.vendorQuotations, newQuotation];

      if (onVendorQuotationChange) {
        onVendorQuotationChange(currentItemId, updatedQuotations);
      }

      // Clear form for next entry
      setVendorFormData({
        id: '',
        vendorName: '',
        contactPerson: '',
        phone: '',
        price: '0',
        quotedPrice: '0',
        notes: '',
        quotationFile: null,
      });

      toast({
        title: 'Vendor Quotation Added',
        description: `Quotation from ${newQuotation.vendorName} added successfully`,
      });
    } else if (currentItem && currentItem.vendorQuotations.length >= 4) {
      toast({
        title: 'Maximum Quotations Reached',
        description: 'You can only add up to 4 vendor quotations per item',
        variant: 'destructive',
      });
    }
  };

  const removeVendorQuotation = (itemId: string, quotationId: string) => {
    const currentItem = requestData.items.find((item) => item.id === itemId);
    if (currentItem && onVendorQuotationChange) {
      const updatedQuotations = currentItem.vendorQuotations.filter(
        (q) => q.id !== quotationId
      );
      onVendorQuotationChange(itemId, updatedQuotations);
    }
  };

  // Add function to handle vendor selection
  const handleVendorSelection = (itemId: string, quotationId: string) => {
    const newSelection = {
      ...selectedVendorsState,
      [itemId]: quotationId
    };
    setSelectedVendorsState(newSelection);
    if (onVendorSelection) {
      onVendorSelection(newSelection);
    }
  };

  // Add function to open partial receipt dialog
  const openPartialReceiptDialog = (itemId: string) => {
    setCurrentItemId(itemId);
    setPartialReceiptData({
      receivedQuantity: '',
      receivedDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsPartialReceiptOpen(true);
  };

  // Add function to handle partial receipt submission
  const handlePartialReceiptSubmit = () => {
    if (!partialReceiptData.receivedQuantity || !partialReceiptData.receivedDate) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive',
      });
      return;
    }

    const receivedQty = parseInt(partialReceiptData.receivedQuantity);
    const currentItem = requestData.items.find(item => item.id === currentItemId);
    const requiredQty = parseInt(currentItem?.reqQuantity || '0');
    const totalReceived = getTotalReceivedQuantity();
    const remainingQty = requiredQty - totalReceived;

    // Validate that the received quantity doesn't exceed what's remaining
    if (receivedQty > remainingQty) {
      toast({
        title: 'Invalid Quantity',
        description: `Cannot receive ${receivedQty} units. Only ${remainingQty} units remaining (${totalReceived} already received out of ${requiredQty} required).`,
        variant: 'destructive',
      });
      return;
    }

    if (receivedQty <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Received quantity must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    const newTotalReceived = totalReceived + receivedQty;

    // Check if this receipt will complete the order
    const willBeFullyReceived = newTotalReceived >= requiredQty;
    const status = willBeFullyReceived ? 'fully_received' : 'partially_received';

    if (onStatusChange) {
      onStatusChange(status, {
        receivedQuantity: receivedQty,
        receivedDate: partialReceiptData.receivedDate,
        notes: partialReceiptData.notes,
      });
    }

    setIsPartialReceiptOpen(false);
    setPartialReceiptData({
      receivedQuantity: '',
      receivedDate: new Date().toISOString().split('T')[0],
      notes: '',
    });

    toast({
      title: 'Receipt Added',
      description: willBeFullyReceived 
        ? 'Material fully received and status updated'
        : `Partial receipt added successfully. ${newTotalReceived}/${requiredQty} units received.`,
    });
  };

  // Calculate total received quantity
  const getTotalReceivedQuantity = () => {
    return requestData.apiData?.partialReceiptHistory?.reduce((sum, receipt) => 
      sum + (receipt.receivedQuantity || 0), 0
    ) || 0;
  };

  // Check if item can receive more materials
  const canReceiveMore = (item: RequestItem) => {
    const totalReceived = getTotalReceivedQuantity();
    const required = parseInt(item.reqQuantity);
    return totalReceived < required && requestData.status === 'partially_received';
  };

  return (
    <div className='space-y-5'>
      {/* Form Header - Remove empty card to reduce spacing */}
      {/* Removed the empty Card component that was creating unnecessary spacing */}

      {/* Items Table */}
      <Card className='border-0 shadow-none'>
        <CardContent className='pt-6 pb-0 px-0 border-none'>
          <div className='border-none'>
            <Table className='border-none w-full'>
              <TableHeader className='border-none'>
                <TableRow className='bg-gray-50'>
                  <TableHead className='border border-gray-300 font-semibold min-w-[80px]'>
                    PURCHASE ID
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold min-w-[120px]'>
                    MATERIALS
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold min-w-[150px]'>
                    SPECIFICATIONS
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold min-w-[80px]'>
                    CURRENT STOCK
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold min-w-[100px]'>
                    REQ. QUANTITY
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold min-w-[80px]'>
                    IMAGES
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold min-w-[120px]'>
                    VENDOR QUOTATIONS
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold min-w-[100px]'>
                    PURPOSE TYPE
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold min-w-[120px]'>
                    MACHINE NAME
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold min-w-[100px]'>
                    NOTES
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='border border-gray-300 text-center font-semibold'>
                      {isReadOnly ? (
                        item.srNo
                      ) : (
                        <Input
                          type='text'
                          value={item.srNo}
                          readOnly
                          className='border-0 focus:ring-0 focus:outline-none rounded-none bg-transparent w-full'
                        />
                      )}
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      {isReadOnly ? (
                        <div className='text-xs'>
                          <div className='font-medium truncate'>{item.productName}</div>
                          {(() => {
                            const material = availableMaterials.find(m => m.name === item.productName);
                            const makerBrand = material?.makerBrand || '';
                            return makerBrand && (
                              <div className='text-xs text-muted-foreground mt-1 truncate'>
                                {makerBrand}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <Select
                          value={item.productName}
                          onValueChange={(value) =>
                            handleMaterialSelect(item.id, value)
                          }
                        >
                          <SelectTrigger className='border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none w-full'>
                            <SelectValue placeholder='Select Material' />
                          </SelectTrigger>
                          <SelectContent>
                            {availableMaterials.map((material) => (
                              <SelectItem
                                key={material.name}
                                value={material.name}
                              >
                                <div className='flex flex-col'>
                                  <div className='font-semibold'>
                                    {material.name}
                                  </div>
                                  <div className='text-sm text-muted-foreground'>
                                    {material.category}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      {isReadOnly ? (
                        <div className='truncate'>{item.specifications}</div>
                      ) : (
                        <Input
                          value={item.specifications}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 30);
                            handleItemChange(item.id, 'specifications', value);
                          }}
                          placeholder='Specifications'
                          maxLength={30}
                          className='border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none w-full'
                        />
                      )}
                    </TableCell>
                    <TableCell className='border border-gray-300 text-center'>
                      {isReadOnly ? (
                        <div className='flex items-center gap-2'>
                          <span>{item.oldStock}</span>
                          <span className='text-sm text-gray-600'>
                            {item.measureUnit}
                          </span>
                        </div>
                      ) : (
                        <div className='flex items-center gap-2'>
                        <Input
                          type='number'
                          value={item.oldStock}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'oldStock',
                              e.target.value
                            )
                          }
                          placeholder='0'
                          min='0'
                          className='border-0 p-0 h-auto w-20 text-center focus:ring-0 focus:outline-none rounded-none'
                        />
                          <span className='text-sm text-gray-600'>
                            {item.measureUnit}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          {isReadOnly ? (
                            <div className='flex items-center gap-2'>
                              <div className='flex flex-col'>
                                <span className='truncate font-medium'>{item.reqQuantity}</span>
                                <span className='text-xs text-gray-500'>{item.measureUnit}</span>
                              </div>
                              <div className='flex items-center gap-1 ml-2'>
                                {canReceiveMore(item) && userRole === 'supervisor' && (
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => openPartialReceiptDialog(item.id)}
                                    className='h-6 w-6 p-0 flex-shrink-0'
                                    title='Add Partial Receipt'
                                  >
                                    <Plus className='w-3 h-3' />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <Input
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
                                className='border border-gray-300 p-2 h-auto w-20 focus:ring-0 focus:outline-none rounded-md'
                              />
                              <span className='text-sm text-gray-600 whitespace-nowrap'>
                                {item.measureUnit}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Show partial receipt history with dates */}
                        {requestData.apiData?.partialReceiptHistory && 
                         requestData.apiData.partialReceiptHistory.length > 0 && (
                          <div className='space-y-1'>
                            <div className='text-xs font-medium text-blue-600 flex items-center justify-between'>
                              <span>Received History:</span>
                              <span className='text-green-600 font-bold'>
                                {getTotalReceivedQuantity()}/{item.reqQuantity} {item.measureUnit}
                              </span>
                            </div>
                            {requestData.apiData.partialReceiptHistory.map((receipt, index) => (
                              <div key={receipt.id} className='text-xs bg-blue-50 border border-blue-200 p-2 rounded'>
                                <div className='flex justify-between items-start mb-1'>
                                  <span className='font-medium text-blue-800'>
                                    Receipt #{index + 1}
                                  </span>
                                  <span className='text-blue-600 font-medium'>
                                    {receipt.receivedQuantity} {item.measureUnit}
                                  </span>
                                </div>
                                <div className='flex justify-between items-center text-blue-600'>
                                  <span>{formatDateToDDMMYYYY(receipt.receivedDate)}</span>
                                  <span className='text-xs'>by {receipt.receivedBy}</span>
                                </div>
                                {receipt.notes && (
                                  <div className='text-blue-600 mt-1 text-xs italic'>
                                    "{receipt.notes}"
                                  </div>
                                )}
                              </div>
                            ))}
                            <div className='text-xs font-medium text-green-600 bg-green-50 border border-green-200 p-2 rounded'>
                              <div className='flex justify-between items-center'>
                                <span>Total Received:</span>
                                <span className='font-bold'>
                                  {getTotalReceivedQuantity()} {item.measureUnit}
                                </span>
                              </div>
                              <div className='text-xs text-green-500 mt-1'>
                                {requestData.apiData.partialReceiptHistory.length} receipt(s)
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      <div className='space-y-2'>
                        {/* Load and display item images */}
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={async () => {
                              // Load images from API
                              await loadItemImages(parseInt(item.id, 10));
                              
                              // Show images in popup if they exist
                              const images = itemImagesLoaded[item.id] || itemImageUrlsMap[item.id] || [];
                              if (images.length > 0) {
                                showImagesInPopup(
                                  images,
                                  `Item Images - ${item.productName}`
                                );
                              } else {
                                toast({
                                  title: 'No Images',
                                  description: 'No images available for this item',
                                  variant: 'default',
                                });
                              }
                            }}
                            disabled={!isReadOnly}
                            className='gap-2 w-full'
                          >
                            <Eye className='w-4 h-4' />
                            <span className='hidden sm:inline'>View Images</span>
                          </Button>
                        </div>
                        {/* Thumbnails hidden per requirements */}
                      </div>
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      <div className='space-y-1'>
                        {/* Show all quotations with name and price only */}
                        {item.vendorQuotations.length > 0 && (
                          <div className='space-y-2'>
                            {userRole === 'company_owner' && 
                             requestData.status === 'pending_approval' ? (
                              // Show radio buttons for company owner approval
                              <RadioGroup
                                value={selectedVendorsState[item.id] || ''}
                                onValueChange={(value) => handleVendorSelection(item.id, value)}
                              >
                                {item.vendorQuotations.map((quotation) => (
                                  <div key={quotation.id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                                    <RadioGroupItem
                                      value={quotation.id}
                                      id={`${item.id}-${quotation.id}`}
                                    />
                                    <Label
                                      htmlFor={`${item.id}-${quotation.id}`}
                                      className="text-sm cursor-pointer flex-1 min-w-0"
                                    >
                                      <div className="font-medium text-gray-900 truncate">{quotation.vendorName}</div>
                                      <div className="text-xs font-medium text-green-600">
                                        {quotation.quotedPrice}
                                      </div>
                                    </Label>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        showQuotationDetails(quotation, item);
                                      }}
                                      className='h-6 w-6 p-0 ml-2 flex-shrink-0'
                                    >
                                      <Eye className='w-3 h-3' />
                                    </Button>
                                  </div>
                                ))}
                              </RadioGroup>
                            ) : (
                              // Show only selected quotations
                              <div className='space-y-2'>
                                {item.vendorQuotations.filter(q => q.isSelected === true).map((quotation) => (
                                  <div
                                    key={quotation.id}
                                    className={`p-2 rounded border cursor-pointer hover:bg-gray-50 ${
                                      quotation.isSelected 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                    onClick={() => showQuotationDetails(quotation, item)}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 truncate">
                                          {quotation.vendorName}
                                        </div>
                                        <div className="text-xs font-medium text-green-600">
                                          {quotation.quotedPrice}
                                        </div>
                                      </div>
                                      {quotation.isSelected && (
                                        <div className="text-xs bg-green-600 text-white px-2 py-1 rounded flex-shrink-0">
                                          ✓
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Add quotation button for editing */}
                        {!isReadOnly && (
                          <div className='flex gap-1 mt-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              className='h-8 flex-1'
                              onClick={() => openVendorForm(item.id)}
                              disabled={item.vendorQuotations.length >= 4}
                            >
                              <Plus className='w-3 h-3 mr-1' />
                              <span className='hidden sm:inline'>Add ({item.vendorQuotations.length}/4)</span>
                              <span className='sm:hidden'>({item.vendorQuotations.length}/4)</span>
                            </Button>
                            {item.vendorQuotations.length > 0 && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='h-8 w-8 p-0 flex-shrink-0'
                                onClick={() => openVendorForm(item.id)}
                              >
                                <Eye className='w-3 h-3' />
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {/* Show message when no quotations */}
                        {item.vendorQuotations.length === 0 && (
                          <div className='text-xs text-gray-500 italic p-2 bg-gray-50 border border-gray-200 rounded'>
                            No vendor quotations
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      {isReadOnly ? (
                        <div className='truncate'>{item.purposeType || 'Machine'}</div>
                      ) : (
                        <Select
                          value={item.purposeType || PurposeType.MACHINE}
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
                          <SelectTrigger className='border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none w-full'>
                            <SelectValue placeholder='Select Purpose *' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PurposeType.MACHINE}>Machine</SelectItem>
                            <SelectItem value={PurposeType.SPARE}>Spare</SelectItem>
                            <SelectItem value={PurposeType.OTHER}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      {isReadOnly ? (
                        <div className='truncate'>{item.machineName}</div>
                      ) : (
                        <>
                          {item.purposeType === PurposeType.MACHINE ? (
                            <Select
                              value={item.machineName}
                              onValueChange={(value) =>
                                handleItemChange(item.id, 'machineName', value)
                              }
                            >
                              <SelectTrigger className='border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none w-full'>
                                <SelectValue placeholder='Select Machine *' />
                              </SelectTrigger>
                              <SelectContent>
                                {machines.map((machine) => (
                                  <SelectItem key={machine} value={machine}>
                                    {machine}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className='text-sm text-gray-600 p-2'>
                              {item.purposeType === PurposeType.SPARE ? 'Spare' : 'Other'}
                            </div>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      {isReadOnly ? (
                        <div className='truncate'>{item.notes || '-'}</div>
                      ) : (
                        <Textarea
                          value={item.notes || ''}
                          onChange={(e) =>
                            handleItemChange(item.id, 'notes', e.target.value)
                          }
                          placeholder={item.purposeType === PurposeType.SPARE || item.purposeType === PurposeType.OTHER ? 'Required for Spare/Other purpose...' : 'Add notes...'}
                          className='border-0 p-0 h-auto min-h-[60px] resize-none focus:ring-0 focus:outline-none rounded-none w-full'
                          rows={2}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Partial Receipt Dialog */}
      <Dialog open={isPartialReceiptOpen} onOpenChange={setIsPartialReceiptOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Add Partial Receipt</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            {/* Show summary of current status */}
            {(() => {
              const currentItem = requestData.items.find(item => item.id === currentItemId);
              const requiredQty = parseInt(currentItem?.reqQuantity || '0');
              const totalReceived = getTotalReceivedQuantity();
              const remainingQty = requiredQty - totalReceived;
              
              return (
                <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                  <div className='text-sm space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-blue-700'>Required:</span>
                      <span className='font-semibold text-blue-900'>{requiredQty} {currentItem?.measureUnit}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-blue-700'>Already Received:</span>
                      <span className='font-semibold text-green-600'>{totalReceived} {currentItem?.measureUnit}</span>
                    </div>
                    <div className='flex justify-between border-t border-blue-300 pt-1'>
                      <span className='text-blue-700 font-medium'>Remaining:</span>
                      <span className='font-bold text-orange-600'>{remainingQty} {currentItem?.measureUnit}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='receivedQuantity'>Received Quantity *</Label>
                <Input
                  id='receivedQuantity'
                  type='number'
                  value={partialReceiptData.receivedQuantity}
                  onChange={(e) =>
                    setPartialReceiptData((prev) => ({
                      ...prev,
                      receivedQuantity: e.target.value,
                    }))
                  }
                  placeholder='Enter quantity'
                  min='1'
                  max={(() => {
                    const currentItem = requestData.items.find(item => item.id === currentItemId);
                    const requiredQty = parseInt(currentItem?.reqQuantity || '0');
                    const totalReceived = getTotalReceivedQuantity();
                    return requiredQty - totalReceived;
                  })()}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='receivedDate'>Received Date *</Label>
                <Input
                  id='receivedDate'
                  type='date'
                  value={partialReceiptData.receivedDate}
                  onChange={(e) =>
                    setPartialReceiptData((prev) => ({
                      ...prev,
                      receivedDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='notes'>Notes</Label>
              <Textarea
                id='notes'
                value={partialReceiptData.notes}
                onChange={(e) =>
                  setPartialReceiptData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder='Additional notes about the receipt...'
              />
            </div>
          </div>
          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => setIsPartialReceiptOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePartialReceiptSubmit}
              disabled={!partialReceiptData.receivedQuantity || !partialReceiptData.receivedDate}
            >
              <Truck className='w-4 h-4 mr-2' />
              Add Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vendor Quotation Management Dialog */}
      <Dialog open={isVendorFormOpen} onOpenChange={setIsVendorFormOpen}>
        <DialogContent className='max-w-6xl max-h-[95vh] overflow-y-auto'>
          <DialogHeader className='pb-4'>
            <DialogTitle className='flex items-center gap-3 text-xl'>
              <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
                <UserRoundPlus className='w-6 h-6 text-primary' />
              </div>
              Manage Vendor Quotations (Optional)
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Current Quotations Table */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Current Quotations (Optional)</h3>
                <Badge variant='secondary'>
                  {requestData.items.find((item) => item.id === currentItemId)
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
                        Total Quotation Amount{' '}
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
                    {requestData.items
                      .find((item) => item.id === currentItemId)
                      ?.vendorQuotations.filter(q => q.isSelected === true).map((quotation, index) => (
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
                          <TableCell className='border-r font-medium'>
                            {quotation.price}
                          </TableCell>
                          <TableCell className='border-r font-medium text-primary'>
                            {quotation.quotedPrice}
                          </TableCell>
                          <TableCell className='border-r text-sm'>
                            {quotation.notes || '-'}
                          </TableCell>
                          <TableCell className='border-r'>
                            {quotation.quotationFile ? (
                              <div className='flex items-center gap-1 text-sm'>
                                <FileText className='w-3 h-3' />
                                <span className='truncate max-w-20'>
                                  {quotation.quotationFile.name}
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
                    {!requestData.items.find(
                      (item) => item.id === currentItemId
                    )?.vendorQuotations.length && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className='text-center py-8 text-muted-foreground'
                        >
                          No vendor quotations added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Add New Quotation Form */}
            <div className='space-y-4 border-t pt-6'>
              <h3 className='text-lg font-semibold'>Add New Quotation (Optional)</h3>

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
                  <Label htmlFor='quotedPrice' className='text-sm font-medium'>
                    Total Quotation Amount*
                  </Label>
                  <Input
                    id='quotedPrice'
                    value={vendorFormData.quotedPrice}
                    onChange={(e) =>
                      handleVendorFormChange('quotedPrice', e.target.value)
                    }
                    placeholder='Enter Total Quotation Amount'
                    className='h-10 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-md text-sm transition-all duration-200'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                  {vendorFormData.quotationFile && (
                    <div className='flex items-center gap-2'>
                      <FileText className='w-4 h-4' />
                      <span>Selected: {vendorFormData.quotationFile.name}</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={addVendorQuotation}
                  disabled={
                    !vendorFormData.vendorName.trim() ||
                    !vendorFormData.quotedPrice.trim() ||
                    (requestData.items.find((item) => item.id === currentItemId)
                      ?.vendorQuotations.length || 0) >= 4
                  }
                  className='h-10 px-6 bg-primary hover:bg-primary/90'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Quotation
                </Button>
              </div>
            </div>
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
        </DialogContent>
      </Dialog>

      {/* Image Popup Modal */}
      {isImagePopupOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-4xl max-h-[80vh] w-full overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold'>{popupTitle}</h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsImagePopupOpen(false)}
                className='h-8 w-8 p-0'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>

            {/* Content */}
            <div className='p-4 overflow-y-auto max-h-[60vh]'>
              {selectedImages.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {selectedImages.map((imageUrl, index) => (
                    <div key={index} className='relative group'>
                      <img
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        className='w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-primary transition-colors'
                        onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                        onError={(e) => {
                          console.error('Failed to load image:', imageUrl, e);
                          toast({
                            title: 'Image Load Error',
                            description: `Failed to load image: ${imageUrl}`,
                            variant: 'destructive',
                          });
                        }}
                      />
                      <div className='absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs'>
                        Image {index + 1}
                      </div>
                      <div className='absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs max-w-[200px] truncate'>
                        {imageUrl}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  <Eye className='w-12 h-12 mx-auto mb-4 opacity-50' />
                  <p>No images available</p>
                  <p className='text-xs mt-2'>Debug: {selectedImages.length} images in array</p>
                  <p className='text-xs'>Title: {popupTitle}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quotation Details Popup */}
      {isQuotationPopupOpen && selectedQuotation && selectedItemForQuotation && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-4xl max-h-[80vh] w-full overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold'>
                Quotation Details - {selectedQuotation.vendorName}
              </h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsQuotationPopupOpen(false)}
                className='h-8 w-8 p-0'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>

            {/* Content */}
            <div className='p-4 overflow-y-auto max-h-[60vh]'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Quotation Details */}
                <div className='space-y-4'>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h4 className='font-semibold text-gray-800 mb-3'>Vendor Information</h4>
                    <div className='space-y-2 text-sm'>
                      <div>
                        <span className='font-medium'>Vendor Name:</span>
                        <span className='ml-2'>{selectedQuotation.vendorName}</span>
                      </div>
                      <div>
                        <span className='font-medium'>Contact Person:</span>
                        <span className='ml-2'>{selectedQuotation.contactPerson || 'N/A'}</span>
                      </div>
                      <div>
                        <span className='font-medium'>Phone:</span>
                        <span className='ml-2'>{selectedQuotation.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className='font-medium'>Price:</span>
                        <span className='ml-2 font-bold text-blue-600'>₹{selectedQuotation.price}</span>
                      </div>
                      <div>
                        <span className='font-medium'>Total Quotation Amount:</span>
                        <span className='ml-2 font-bold text-green-600'>₹{selectedQuotation.quotedPrice}</span>
                      </div>
                      {selectedQuotation.notes && (
                        <div>
                          <span className='font-medium'>Notes:</span>
                          <div className='mt-1 p-2 bg-white rounded border text-gray-600'>
                            {selectedQuotation.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Material Information */}
                  <div className='bg-blue-50 p-4 rounded-lg'>
                    <h4 className='font-semibold text-blue-800 mb-3'>Material Information</h4>
                    <div className='space-y-2 text-sm'>
                      <div>
                        <span className='font-medium'>Material:</span>
                        <span className='ml-2'>{selectedItemForQuotation.productName}</span>
                      </div>
                      <div>
                        <span className='font-medium'>Specifications:</span>
                        <span className='ml-2'>{selectedItemForQuotation.specifications}</span>
                      </div>
                      <div>
                        <span className='font-medium'>Requested Quantity:</span>
                        <span className='ml-2'>{selectedItemForQuotation.reqQuantity} {selectedItemForQuotation.measureUnit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quotation Images */}
                <div className='space-y-4'>
                  <h4 className='font-semibold text-gray-800'>Quotation Images</h4>
                  {/* Display images loaded from API */}
                  {quotationImagesLoaded[selectedItemForQuotation.id] && 
                   quotationImagesLoaded[selectedItemForQuotation.id].length > 0 ? (
                    <div className='grid grid-cols-1 gap-4'>
                      {quotationImagesLoaded[selectedItemForQuotation.id].map((imageUrl, index) => (
                        <div key={`quotation-${index}`} className='relative group'>
                          <img
                            src={imageUrl}
                            alt={`Quotation Image ${index + 1}`}
                            className='w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-primary transition-colors cursor-pointer'
                            onClick={() => showImagesInPopup([imageUrl], `Quotation Image ${index + 1}`)}
                            onError={(e) => {
                              console.error('Failed to load image:', imageUrl);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className='absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs'>
                            Image {index + 1}
                          </div>
                          <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center'>
                            <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                              <Button
                                variant='secondary'
                                size='sm'
                                onClick={() => showImagesInPopup([imageUrl], `Quotation Image ${index + 1}`)}
                                className='gap-2'
                              >
                                <Eye className='w-4 h-4' />
                                View Preview
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      <FileText className='w-12 h-12 mx-auto mb-4 opacity-50' />
                      <p>No quotation images available</p>
                      <p className='text-xs mt-2'>
                        Loading images for item ID: {selectedItemForQuotation.id}
                      </p>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => loadQuotationImages(parseInt(selectedItemForQuotation.id, 10))}
                        className='mt-2'
                      >
                        Retry Loading Images
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partial Receipt Details Dialog */}
      {isPartialReceiptDetailsOpen && selectedItemForReceiptDetails && (
        <Dialog open={isPartialReceiptDetailsOpen} onOpenChange={setIsPartialReceiptDetailsOpen}>
          <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Truck className='w-5 h-5' />
                Partial Receipt Details - {selectedItemForReceiptDetails.productName}
              </DialogTitle>
            </DialogHeader>
            
            <div className='space-y-6'>
              {/* Item Summary */}
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <h3 className='font-semibold text-blue-800 mb-2'>Item Summary</h3>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='font-medium'>Product:</span>
                    <span className='ml-2'>{selectedItemForReceiptDetails.productName}</span>
                  </div>
                  <div>
                    <span className='font-medium'>Required Quantity:</span>
                    <span className='ml-2'>{selectedItemForReceiptDetails.reqQuantity} {selectedItemForReceiptDetails.measureUnit}</span>
                  </div>
                  <div>
                    <span className='font-medium'>Total Received:</span>
                    <span className='ml-2 font-bold text-green-600'>
                      {getTotalReceivedQuantity()} {selectedItemForReceiptDetails.measureUnit}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium'>Remaining:</span>
                    <span className='ml-2 font-bold text-orange-600'>
                      {parseInt(selectedItemForReceiptDetails.reqQuantity) - getTotalReceivedQuantity()} {selectedItemForReceiptDetails.measureUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt History */}
              <div className='space-y-4'>
                <h3 className='font-semibold text-lg'>Receipt History</h3>
                {requestData.apiData?.partialReceiptHistory && 
                 requestData.apiData.partialReceiptHistory.length > 0 ? (
                  <div className='space-y-3'>
                    {requestData.apiData.partialReceiptHistory.map((receipt, index) => (
                      <div key={receipt.id} className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                        <div className='flex justify-between items-start mb-3'>
                          <div className='flex items-center gap-2'>
                            <span className='font-bold text-lg text-blue-600'>#{index + 1}</span>
                            <span className='text-sm text-gray-500'>
                              {formatDateToDDMMYYYY(receipt.receivedDate)}
                            </span>
                          </div>
                          <div className='text-right'>
                            <div className='font-bold text-green-600 text-lg'>
                              {receipt.receivedQuantity} {selectedItemForReceiptDetails.measureUnit}
                            </div>
                            <div className='text-xs text-gray-500'>
                              by {receipt.receivedBy}
                            </div>
                          </div>
                        </div>
                        
                        {receipt.notes && (
                          <div className='mt-3 p-3 bg-white border border-gray-200 rounded'>
                            <div className='text-sm font-medium text-gray-700 mb-1'>Notes:</div>
                            <div className='text-sm text-gray-600 italic'>"{receipt.notes}"</div>
                          </div>
                        )}
                        
                        <div className='mt-3 text-xs text-gray-500'>
                          Timestamp: {new Date(receipt.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 text-muted-foreground'>
                    <Truck className='w-12 h-12 mx-auto mb-4 opacity-50' />
                    <p>No partial receipts recorded yet</p>
                    <p className='text-xs mt-2'>
                      This item is marked as partially received but no receipt details have been added.
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Summary */}
              <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                <h3 className='font-semibold text-green-800 mb-2'>Progress Summary</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span>Total Receipts:</span>
                    <span className='font-bold'>{requestData.apiData?.partialReceiptHistory?.length || 0}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Total Received:</span>
                    <span className='font-bold text-green-600'>
                      {getTotalReceivedQuantity()} {selectedItemForReceiptDetails.measureUnit}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Required:</span>
                    <span className='font-bold'>
                      {selectedItemForReceiptDetails.reqQuantity} {selectedItemForReceiptDetails.measureUnit}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Completion:</span>
                    <span className='font-bold text-blue-600'>
                      {Math.round((getTotalReceivedQuantity() / parseInt(selectedItemForReceiptDetails.reqQuantity)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
