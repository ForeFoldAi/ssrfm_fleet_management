import React, { useState } from 'react';
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
  quotationImageUrlsMap = {},
  onStatusChange,
  userRole = 'supervisor',
  hasPermission = () => false,
  selectedVendors,
  onVendorSelection,
}) => {
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

  // Function to show images in popup
  const showImagesInPopup = (images: string[], title: string) => {
    setSelectedImages(images);
    setPopupTitle(title);
    setIsImagePopupOpen(true);
  };

  // Function to show quotation details in popup
  const showQuotationDetails = (quotation: VendorQuotation, item: RequestItem) => {
    setSelectedQuotation(quotation);
    setSelectedItemForQuotation(item);
    setIsQuotationPopupOpen(true);
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
        onItemChange(itemId, 'measureUnit', material.measureUnit);
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
    const totalReceived = (requestData.apiData?.totalReceivedQuantity || 0) + receivedQty;

    // Check if this receipt will complete the order
    const willBeFullyReceived = totalReceived >= requiredQty;
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
        : 'Partial receipt added successfully',
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
    return totalReceived < required && ['ordered', 'partially_received'].includes(requestData.status);
  };

  return (
    <div className='space-y-5'>
      {/* Form Header - Remove empty card to reduce spacing */}
      {/* Removed the empty Card component that was creating unnecessary spacing */}

      {/* Items Table */}
      <Card className='border-0 shadow-none'>
        <CardContent className='p-0 border-none'>
          <div className='overflow-x-auto border-none'>
            <Table className='border-none'>
              <TableHeader className='border-none'>
                <TableRow className='bg-gray-50'>
                  <TableHead className='border border-gray-300 font-semibold w-24'>
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
                    VENDOR QUOTATIONS (Optional)
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold w-52'>
                    MACHINE NAME*
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold w-40'>
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
                          className='border-0 focus:ring-0 focus:outline-none rounded-none bg-transparent'
                        />
                      )}
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      {isReadOnly ? (
                        <div className='font-medium'>{item.productName}</div>
                      ) : (
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
                        <div>{item.specifications}</div>
                      ) : (
                        <Input
                          value={item.specifications}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 30);
                            handleItemChange(item.id, 'specifications', value);
                          }}
                          placeholder='Specifications'
                          maxLength={30}
                          className='border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none'
                        />
                      )}
                    </TableCell>
                    <TableCell className='border border-gray-300 text-center'>
                      {isReadOnly ? (
                        <div>{item.oldStock}</div>
                      ) : (
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
                      )}
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          {isReadOnly ? (
                            <div className='flex items-center gap-2'>
                              <span>{item.reqQuantity}</span>
                              <span className='text-sm text-gray-600'>
                                {item.measureUnit}
                              </span>
                              {canReceiveMore(item) && userRole === 'supervisor' && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => openPartialReceiptDialog(item.id)}
                                  className='h-6 w-6 p-0 ml-2'
                                >
                                  <Plus className='w-3 h-3' />
                                </Button>
                              )}
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
                              <span className='text-sm text-gray-600'>
                                {item.measureUnit}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Show partial receipt history with dates */}
                        {requestData.apiData?.partialReceiptHistory && 
                         requestData.apiData.partialReceiptHistory.length > 0 && (
                          <div className='space-y-1'>
                            <div className='text-xs font-medium text-blue-600'>
                              Received History:
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
                        {/* Load remote item images when available */}
                        {onLoadItemImages && (
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                onLoadItemImages(parseInt(item.id, 10));
                                // Show images in popup if they exist
                                if (
                                  itemImageUrlsMap[item.id] &&
                                  itemImageUrlsMap[item.id].length > 0
                                ) {
                                  showImagesInPopup(
                                    itemImageUrlsMap[item.id],
                                    `Item Images - ${item.productName}`
                                  );
                                }
                              }}
                              disabled={!isReadOnly}
                              className='gap-2'
                            >
                              <Eye className='w-4 h-4' />
                              View Images
                            </Button>
                          </div>
                        )}
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
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      <div className="font-medium text-gray-900">{quotation.vendorName}</div>
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
                                      className='h-6 w-6 p-0 ml-2'
                                    >
                                      <Eye className='w-3 h-3' />
                                    </Button>
                                  </div>
                                ))}
                              </RadioGroup>
                            ) : (
                              // Show all quotations with selection status
                              <div className='space-y-2'>
                                {item.vendorQuotations.map((quotation) => (
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
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {quotation.vendorName}
                                        </div>
                                        <div className="text-xs font-medium text-green-600">
                                          {quotation.quotedPrice}
                                        </div>
                                      </div>
                                      {quotation.isSelected && (
                                        <div className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                          APPROVED
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
                              Add ({item.vendorQuotations.length}/4)
                            </Button>
                            {item.vendorQuotations.length > 0 && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='h-8 w-8 p-0'
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
                            No vendor quotations (Optional)
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      {isReadOnly ? (
                        <div>{item.machineName}</div>
                      ) : (
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
                            <SelectItem value='Spare'>Spare</SelectItem>
                            <SelectItem value='Other'>Other</SelectItem>
                            {machines.map((machine) => (
                              <SelectItem key={machine} value={machine}>
                                {machine}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className='border border-gray-300'>
                      {isReadOnly ? (
                        <div>{item.notes || '-'}</div>
                      ) : (
                        <Textarea
                          value={item.notes || ''}
                          onChange={(e) =>
                            handleItemChange(item.id, 'notes', e.target.value)
                          }
                          placeholder='Add notes...'
                          className='border-0 p-0 h-auto min-h-[60px] resize-none focus:ring-0 focus:outline-none rounded-none'
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
                        className='w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-primary transition-colors cursor-pointer'
                        onClick={() => window.open(imageUrl, '_blank')}
                      />
                      <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center'>
                        <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                          <Button
                            variant='secondary'
                            size='sm'
                            onClick={() => window.open(imageUrl, '_blank')}
                            className='gap-2'
                          >
                            <Eye className='w-4 h-4' />
                            View Full Size
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  <Eye className='w-12 h-12 mx-auto mb-4 opacity-50' />
                  <p>No images available</p>
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
                        <span className='font-medium'>Quoted Price:</span>
                        <span className='ml-2 font-bold text-green-600'>{selectedQuotation.quotedPrice}</span>
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
                  {quotationImageUrlsMap[selectedItemForQuotation.id] && 
                   quotationImageUrlsMap[selectedItemForQuotation.id].length > 0 ? (
                    <div className='grid grid-cols-1 gap-4'>
                      {quotationImageUrlsMap[selectedItemForQuotation.id].map((imageUrl, index) => (
                        <div key={index} className='relative group'>
                          <img
                            src={imageUrl}
                            alt={`Quotation Image ${index + 1}`}
                            className='w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-primary transition-colors cursor-pointer'
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                          <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center'>
                            <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                              <Button
                                variant='secondary'
                                size='sm'
                                onClick={() => window.open(imageUrl, '_blank')}
                                className='gap-2'
                              >
                                <Eye className='w-4 h-4' />
                                View Full Size
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
