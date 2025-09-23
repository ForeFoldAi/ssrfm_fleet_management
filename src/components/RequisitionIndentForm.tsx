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
} from 'lucide-react';
import { Label } from './ui/label';
import { toast } from '../hooks/use-toast';
import { generateSrNo } from '../lib/utils';

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

interface VendorQuotation {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  quotedPrice: string;
  notes: string;
  quotationFile?: File | null;
}

interface RequisitionIndentFormProps {
  requestData: {
    id: string;
    items: RequestItem[];
    requestedBy: string;
    location: string; // Changed from department
    date: string;
    status: string;
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

  return (
    <div className='space-y-6'>
      {/* Form Header */}
      <Card className='border-0 shadow-sm'>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Purchase ID
              </Label>
              <div className='text-lg font-semibold'>{requestData.id}</div>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Requested By
              </Label>
              <div className='text-lg font-semibold'>
                {requestData.requestedBy}
              </div>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Location
              </Label>
              <div className='text-lg font-semibold'>
                {requestData.location}
              </div>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Date
              </Label>
              <div className='text-lg font-semibold'>{requestData.date}</div>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Status
              </Label>
              <Badge className='mt-1'>{requestData.status}</Badge>
            </div>
          </div>
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
                    SR.NO.
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
                        generateSrNo(requestData.location, item.srNo)
                      ) : (
                        <Input
                          type='text'
                          value={generateSrNo(requestData.location, item.srNo)}
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
                            className='border-0 p-0 h-auto w-20 focus:ring-0 focus:outline-none rounded-none'
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
                                if (itemImageUrlsMap[item.id] && itemImageUrlsMap[item.id].length > 0) {
                                  showImagesInPopup(itemImageUrlsMap[item.id], `Item Images - ${item.productName}`);
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
                        {/* Remote thumbnails */}
                        {itemImageUrlsMap[item.id] &&
                        itemImageUrlsMap[item.id].length > 0 ? (
                          <div className='flex flex-wrap gap-1'>
                            {itemImageUrlsMap[item.id]
                              .slice(0, 6)
                              .map((url) => (
                                <a
                                  key={url}
                                  href={url}
                                  target='_blank'
                                  rel='noreferrer'
                                >
                                  <img
                                    src={url}
                                    alt='Item'
                                    className='w-8 h-8 object-cover rounded border'
                                  />
                                </a>
                              ))}
                          </div>
                        ) : item.imagePreviews &&
                          item.imagePreviews.length > 0 ? (
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
                                </div>
                              ))}
                            {item.imagePreviews.length > 3 && (
                              <div className='w-8 h-8 rounded border flex items-center justify-center bg-gray-100 text-xs'>
                                +{item.imagePreviews.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className='text-xs text-muted-foreground'>
                            No images
                          </div>
                        )}
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
                                if (quotationImageUrlsMap[item.id] && quotationImageUrlsMap[item.id].length > 0) {
                                  showImagesInPopup(quotationImageUrlsMap[item.id], `Quotation Images - ${item.productName}`);
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
                        {/* Remote quotation thumbnails */}
                        {quotationImageUrlsMap[item.id] &&
                          quotationImageUrlsMap[item.id].length > 0 && (
                            <div className='flex flex-wrap gap-1 mb-2'>
                              {quotationImageUrlsMap[item.id]
                                .slice(0, 6)
                                .map((url) => (
                                  <a
                                    key={url}
                                    href={url}
                                    target='_blank'
                                    rel='noreferrer'
                                  >
                                    <img
                                      src={url}
                                      alt='Quotation'
                                      className='w-8 h-8 object-cover rounded border'
                                    />
                                  </a>
                                ))}
                            </div>
                          )}
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
