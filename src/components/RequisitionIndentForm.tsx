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
import { generateSrNo } from '../lib/utils';
import { StatusDropdown } from './StatusDropdown';
import { MaterialPurchaseItem } from '../lib/api/types';

interface RequestItem {
  id: string;
  srNo: string; // Change from number to string
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
  quotedPrice: string;
  notes: string;
  quotationFile?: File | null;
  isSelected?: boolean; // Add this field
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
  onStatusChange?: (newStatus: string, additionalData?: any) => void; // Add this prop
  userRole?: 'company_owner' | 'supervisor'; // Add this prop
  hasPermission?: (permission: string) => boolean; // Add this prop
  selectedVendors?: Record<string, string>; // Add this
  onVendorSelection?: (vendors: Record<string, string>) => void; // Add this
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
    quotedPrice: '',
    notes: '',
    quotationFile: null,
  });

  // Add state for image popup
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');

  // Add state for vendor selection
  const [selectedVendorsState, setSelectedVendorsState] = useState<Record<string, string>>({});

  // Function to show images in popup
  const showImagesInPopup = (images: string[], title: string) => {
    setSelectedImages(images);
    setPopupTitle(title);
    setIsImagePopupOpen(true);
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
      quotedPrice: '',
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
        quotedPrice: '',
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

  return (
    <div className='space-y-6'>
      {/* Form Header */}
      <Card className='border-0 shadow-sm'>
        <CardContent className='p-6'>
          {/* Removed Date and Status fields - they're now in the header */}
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className='border-0 shadow-none'>
        <CardContent className='p-0 border-none'>
          <div className='overflow-x-auto border-none'>
            <Table className='border-none'>
              <TableHeader className='border-none'>
                <TableRow className='bg-gray-50'>
                  <TableHead className='border border-gray-300 font-semibold'>
                    PURCHASE ID
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold'>
                    MATERIALS
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold'>
                    SPECIFICATIONS
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold'>
                    CURRENT STOCK
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold'>
                    REQ. QUANTITY
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold'>
                    IMAGES
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold'>
                    VENDOR QUOTATIONS
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold'>
                    MACHINE NAME
                  </TableHead>
                  <TableHead className='border border-gray-300 font-semibold'>
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
                      <div className='flex items-center gap-2'>
                        {isReadOnly ? (
                          <div>{item.reqQuantity}</div>
                        ) : (
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
                        )}
                        <span className='text-sm text-gray-600'>
                          {item.measureUnit}
                        </span>
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
                        {/* Load remote quotation images when available */}
                        {onLoadQuotationImages && (
                          <div className='flex gap-2 mb-1'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                onLoadQuotationImages(parseInt(item.id, 10));
                                // Show images in popup if they exist
                                if (
                                  quotationImageUrlsMap[item.id] &&
                                  quotationImageUrlsMap[item.id].length > 0
                                ) {
                                  showImagesInPopup(
                                    quotationImageUrlsMap[item.id],
                                    `Quotation Images - ${item.productName}`
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
                        {/* Quotation thumbnails hidden per requirements */}
                        {!isReadOnly && (
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
                                onClick={() => openVendorForm(item.id)}
                              >
                                <Eye className='w-3 h-3' />
                              </Button>
                            )}
                          </div>
                        )}
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
                                  <div key={quotation.id} className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value={quotation.id}
                                      id={`${item.id}-${quotation.id}`}
                                    />
                                    <Label
                                      htmlFor={`${item.id}-${quotation.id}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      <div className="font-medium">{quotation.vendorName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {quotation.quotedPrice}
                                        {quotation.contactPerson && ` • ${quotation.contactPerson}`}
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            ) : (userRole === 'company_owner' || userRole === 'supervisor') && 
                              ['approved', 'ordered', 'partially_received', 'fully_received', 'issued', 'closed'].includes(requestData.status) ? (
                              // Show only selected vendor for both company owner and supervisor after approval
                              <div className='space-y-1'>
                                {(() => {
                                  // Debug: Log the quotations to see isSelected values
                                  console.log('Item quotations:', item.vendorQuotations);
                                  console.log('Selected quotations:', item.vendorQuotations.filter(q => q.isSelected));
                                  
                                  const selectedQuotations = item.vendorQuotations.filter((quotation) => quotation.isSelected);
                                  
                                  if (selectedQuotations.length === 0) {
                                    return (
                                      <div className='text-xs text-gray-500 italic'>
                                        No vendor selected
                                      </div>
                                    );
                                  }
                                  
                                  return selectedQuotations.map((quotation) => (
                                    <div
                                      key={quotation.id}
                                      className='flex items-center justify-between gap-2 text-xs bg-green-50 border border-green-200 p-2 rounded'
                                    >
                                      <div className='flex-1'>
                                        <div className='font-medium text-green-800'>
                                          {quotation.vendorName}
                                        </div>
                                        <div className='text-green-600'>
                                          {quotation.quotedPrice}
                                          {quotation.contactPerson && ` • ${quotation.contactPerson}`}
                                        </div>
                                      </div>
                                      <div className='text-xs text-green-600 font-medium'>
                                        SELECTED
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            ) : (
                              // Show read-only quotations for other cases
                              <div className='space-y-1'>
                                {item.vendorQuotations.map((quotation) => (
                                  <div
                                    key={quotation.id}
                                    className='flex items-center justify-between gap-2 text-xs bg-gray-50 p-1 rounded border'
                                  >
                                    <span className='truncate flex-1 font-medium'>
                                      {quotation.vendorName} -{' '}
                                      {quotation.quotedPrice}
                                    </span>
                                    {!isReadOnly && (
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          removeVendorQuotation(
                                            item.id,
                                            quotation.id
                                          )
                                        }
                                        className='h-4 w-4 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                                      >
                                        <X className='w-2 h-2' />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
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
                            <SelectValue placeholder='Select Machine' />
                          </SelectTrigger>
                          <SelectContent>
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

      {/* Partial Receipt History */}
      {requestData.status === 'partially_received' && 
       requestData.apiData?.partialReceiptHistory && 
       requestData.apiData.partialReceiptHistory.length > 0 && (
        <Card className='border-0 shadow-sm'>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Truck className='w-5 h-5' />
              Partial Receipt History
            </h3>
            <div className='space-y-3'>
              {requestData.apiData.partialReceiptHistory.map((receipt, index) => (
                <div key={receipt.id} className='flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-sm font-medium text-orange-800'>
                        Receipt #{index + 1}
                      </span>
                      <span className='text-xs text-orange-600'>
                        {new Date(receipt.receivedDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <div className='text-sm text-orange-700'>
                      <strong>Quantity:</strong> {receipt.receivedQuantity} units
                    </div>
                    {receipt.notes && (
                      <div className='text-sm text-orange-600'>
                        <strong>Notes:</strong> {receipt.notes}
                      </div>
                    )}
                    <div className='text-xs text-orange-500'>
                      Received by: {receipt.receivedBy} • {new Date(receipt.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm font-medium text-orange-800'>
                      {receipt.receivedQuantity} units
                    </div>
                    <div className='text-xs text-orange-600'>
                      #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Total Summary */}
              <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium text-blue-800'>Total Received:</span>
                  <span className='font-bold text-blue-900'>
                    {requestData.apiData.partialReceiptHistory.reduce((sum, receipt) => 
                      sum + (receipt.receivedQuantity || 0), 0
                    )} units
                  </span>
                </div>
                <div className='text-sm text-blue-600 mt-1'>
                  {requestData.apiData.partialReceiptHistory.length} partial receipt(s)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor Quotation Management Dialog */}
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
                  {requestData.items.find((item) => item.id === currentItemId)
                    ?.vendorQuotations.length || 0}
                  /4 Quotations
                </Badge>
              </div>

              <div className='border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-gray-50'>
                      <TableHead className='border-r font-semibold'>
                        SR.
                      </TableHead>
                      <TableHead className='border-r font-semibold'>
                        Vendor Name
                      </TableHead>
                      <TableHead className='border-r font-semibold'>
                        Contact Person
                      </TableHead>
                      <TableHead className='border-r font-semibold'>
                        Phone
                      </TableHead>
                      <TableHead className='border-r font-semibold'>
                        Total Quotation Amount{' '}
                      </TableHead>
                      <TableHead className='border-r font-semibold'>
                        Notes
                      </TableHead>
                      <TableHead className='border-r font-semibold'>
                        File
                      </TableHead>
                      <TableHead className='font-semibold'>Actions</TableHead>
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
    </div>
  );
};
