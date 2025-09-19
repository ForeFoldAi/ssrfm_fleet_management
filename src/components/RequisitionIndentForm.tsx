import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Camera, X, Eye, Plus, Trash2, FileText, UserRoundPlus } from 'lucide-react';
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
  onVendorQuotationChange?: (itemId: string, quotations: VendorQuotation[]) => void;
  availableMaterials?: Array<{
    name: string;
    specifications: string;
    measureUnit: string;
    category: string;
  }>;
  machines?: string[];
}

export const RequisitionIndentForm: React.FC<RequisitionIndentFormProps> = ({
  requestData,
  isReadOnly = true,
  onItemChange,
  onVendorQuotationChange,
  availableMaterials = [],
  machines = []
}) => {
  // Vendor management state
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string>("");
  const [vendorFormData, setVendorFormData] = useState<VendorQuotation>({
    id: "",
    vendorName: "",
    contactPerson: "",
    phone: "",
    quotedPrice: "",
    notes: "",
    quotationFile: null
  });

  const handleItemChange = (itemId: string, field: string, value: string) => {
    if (!isReadOnly && onItemChange) {
      onItemChange(itemId, field, value);
    }
  };

  const handleMaterialSelect = (itemId: string, materialName: string) => {
    if (!isReadOnly && onItemChange) {
      const material = availableMaterials.find(m => m.name === materialName);
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

  const handleVendorFormChange = (field: string, value: string) => {
    setVendorFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVendorFileChange = (file: File) => {
    setVendorFormData(prev => ({ ...prev, quotationFile: file }));
  };

  const addVendorQuotation = () => {
    const currentItem = requestData.items.find(item => item.id === currentItemId);
    if (currentItem && currentItem.vendorQuotations.length < 4) {
      const newQuotation: VendorQuotation = {
        ...vendorFormData,
        id: String(Date.now())
      };
      
      const updatedQuotations = [...currentItem.vendorQuotations, newQuotation];
      
      if (onVendorQuotationChange) {
        onVendorQuotationChange(currentItemId, updatedQuotations);
      }
      
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
    const currentItem = requestData.items.find(item => item.id === itemId);
    if (currentItem && onVendorQuotationChange) {
      const updatedQuotations = currentItem.vendorQuotations.filter(q => q.id !== quotationId);
      onVendorQuotationChange(itemId, updatedQuotations);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Purchase ID</Label>
              <div className="text-lg font-semibold">{requestData.id}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Requested By</Label>
              <div className="text-lg font-semibold">{requestData.requestedBy}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Location</Label>
              <div className="text-lg font-semibold">{requestData.location}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Date</Label>
              <div className="text-lg font-semibold">{requestData.date}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge className="mt-1">{requestData.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border border-gray-300 text-center font-semibold">
                      {isReadOnly ? (
                        generateSrNo(requestData.location, item.srNo)
                      ) : (
                        <Input
                          type="text"
                          value={generateSrNo(requestData.location, item.srNo)}
                          readOnly
                          className="border-0 focus:ring-0 focus:outline-none rounded-none bg-transparent"
                        />
                      )}
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      {isReadOnly ? (
                        <div className="font-medium">{item.productName}</div>
                      ) : (
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
                      )}
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      {isReadOnly ? (
                        <div>{item.specifications}</div>
                      ) : (
                        <Input
                          value={item.specifications}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 30);
                            handleItemChange(item.id, "specifications", value);
                          }}
                          placeholder="Specifications"
                          maxLength={30}
                          className="border-0 p-0 h-auto focus:ring-0 focus:outline-none rounded-none"
                        />
                      )}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center">
                      {isReadOnly ? (
                        <div>{item.oldStock}</div>
                      ) : (
                        <Input
                          type="number"
                          value={item.oldStock}
                          onChange={(e) => handleItemChange(item.id, "oldStock", e.target.value)}
                          placeholder="0"
                          min="0"
                          className="border-0 p-0 h-auto w-20 text-center focus:ring-0 focus:outline-none rounded-none"
                        />
                      )}
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <div className="flex items-center gap-2">
                        {isReadOnly ? (
                          <div>{item.reqQuantity}</div>
                        ) : (
                          <Input
                            type="number"
                            value={item.reqQuantity}
                            onChange={(e) => handleItemChange(item.id, "reqQuantity", e.target.value)}
                            placeholder="Qty"
                            min="0"
                            className="border-0 p-0 h-auto w-20 focus:ring-0 focus:outline-none rounded-none"
                          />
                        )}
                        <span className="text-sm text-gray-600">{item.measureUnit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <div className="space-y-2">
                        {item.imagePreviews && item.imagePreviews.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.imagePreviews.slice(0, 3).map((preview, index) => (
                              <div key={index} className="relative w-8 h-8 rounded border overflow-hidden">
                                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {item.imagePreviews.length > 3 && (
                              <div className="w-8 h-8 rounded border flex items-center justify-center bg-gray-100 text-xs">
                                +{item.imagePreviews.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No images</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <div className="space-y-1">
                        {!isReadOnly && (
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
                                onClick={() => openVendorForm(item.id)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        )}
                        {item.vendorQuotations.length > 0 && (
                          <div className="space-y-1">
                            {item.vendorQuotations.map((quotation) => (
                              <div key={quotation.id} className="flex items-center justify-between gap-2 text-xs bg-gray-50 p-1 rounded border">
                                <span className="truncate flex-1 font-medium">
                                  {quotation.vendorName} - {quotation.quotedPrice}
                                </span>
                                {!isReadOnly && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVendorQuotation(item.id, quotation.id)}
                                    className="h-4 w-4 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="w-2 h-2" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      {isReadOnly ? (
                        <div>{item.machineName}</div>
                      ) : (
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
                      )}
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      {isReadOnly ? (
                        <div>{item.notes || '-'}</div>
                      ) : (
                        <Textarea
                          value={item.notes || ''}
                          onChange={(e) => handleItemChange(item.id, "notes", e.target.value)}
                          placeholder="Add notes..."
                          className="border-0 p-0 h-auto min-h-[60px] resize-none focus:ring-0 focus:outline-none rounded-none"
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
                  {requestData.items.find(item => item.id === currentItemId)?.vendorQuotations.length || 0}/4 Quotations
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
                      <TableHead className="border-r font-semibold">Total Quotation Amount </TableHead>
                      <TableHead className="border-r font-semibold">Notes</TableHead>
                      <TableHead className="border-r font-semibold">File</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestData.items.find(item => item.id === currentItemId)?.vendorQuotations.map((quotation, index) => (
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
                    {(!requestData.items.find(item => item.id === currentItemId)?.vendorQuotations.length) && (
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
                           (requestData.items.find(item => item.id === currentItemId)?.vendorQuotations.length || 0) >= 4}
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
    </div>
  );
}; 