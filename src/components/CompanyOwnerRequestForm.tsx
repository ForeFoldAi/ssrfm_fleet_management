import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { FileText, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

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

interface CompanyOwnerRequestFormProps {
  requestData: {
    id: string;
    items: RequestItem[];
    requestedBy: string;
    location: string;
    date: string;
    status: string;
  };
  selectedVendors: Record<string, string>;
  onVendorSelect: (itemId: string, vendorId: string) => void;
  selectedStatuses: Record<string, string>;
  onStatusSelect: (itemId: string, status: string) => void;
  onSubmit: () => void;
}

export const CompanyOwnerRequestForm: React.FC<CompanyOwnerRequestFormProps> = ({
  requestData,
  selectedVendors,
  onVendorSelect,
  selectedStatuses,
  onStatusSelect,
  onSubmit
}) => {
  const getStatusOptions = (itemId: string) => {
    const hasVendorSelected = selectedVendors[itemId];
    const options = [
      {
        value: 'reverted',
        label: 'Revert',
        icon: <RotateCcw className="w-4 h-4" />,
       
      },
     
    ];

    if (hasVendorSelected) {
      options.unshift({
        value: 'approved',
        label: 'Approve',
        icon: <CheckCircle className="w-4 h-4" />,
       
      });
    }

    return options;
  };

  const canSubmit = () => {
    return requestData.items.every(item => selectedStatuses[item.id]);
  };

  const getSubmitButtonText = () => {
    const approvedCount = Object.values(selectedStatuses).filter(status => status === 'approved').length;
    const rejectedCount = Object.values(selectedStatuses).filter(status => status === 'rejected').length;
    const revertedCount = Object.values(selectedStatuses).filter(status => status === 'reverted').length;

    if (approvedCount > 0 && rejectedCount === 0 && revertedCount === 0) {
      return `Approve ${approvedCount} Item${approvedCount > 1 ? 's' : ''}`;
    } else if (rejectedCount > 0 && approvedCount === 0 && revertedCount === 0) {
      return `Reject ${rejectedCount} Item${rejectedCount > 1 ? 's' : ''}`;
    } else if (revertedCount > 0 && approvedCount === 0 && rejectedCount === 0) {
      return `Revert ${revertedCount} Item${revertedCount > 1 ? 's' : ''}`;
    } else {
      return `Submit Decisions (${Object.keys(selectedStatuses).length}/${requestData.items.length})`;
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

      {/* Items Table with Vendor Selection and Status */}
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
                  <TableHead className="border border-gray-300 font-semibold">VENDOR SELECTION</TableHead>
                  <TableHead className="border border-gray-300 font-semibold">STATUS DECISION</TableHead>
                  <TableHead className="border border-gray-300 font-semibold">MACHINE NAME</TableHead>
                  <TableHead className="border border-gray-300 font-semibold">NOTES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border border-gray-300 text-center font-semibold">
                      {String(item.srNo).padStart(2, '0')}
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <div className="font-medium">{item.productName}</div>
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <div className="text-sm">{item.specifications}</div>
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center">
                      <div className="font-medium">{item.oldStock}</div>
                      <div className="text-xs text-muted-foreground">{item.measureUnit}</div>
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.reqQuantity}</span>
                        <span className="text-sm text-gray-600">{item.measureUnit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      {item.imagePreviews && item.imagePreviews.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.imagePreviews.slice(0, 3).map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`${item.productName} ${index + 1}`}
                                className="w-12 h-12 object-cover rounded border"
                              />
                            </div>
                          ))}
                          {item.imagePreviews.length > 3 && (
                            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                              <span className="text-xs text-gray-600">+{item.imagePreviews.length - 3}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-2 text-muted-foreground">
                          <div className="text-xs">No images</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      {item.vendorQuotations.filter(q => q.isSelected).length > 0 ? (
                        <div className="space-y-2 min-w-[200px]">
                          <RadioGroup
                            value={selectedVendors[item.id] || ''}
                            onValueChange={(value) => onVendorSelect(item.id, value)}
                          >
                            {item.vendorQuotations.filter(q => q.isSelected).map((quotation) => (
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
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
                          <div className="text-xs">No quotations</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <Select
                        value={selectedStatuses[item.id] || ''}
                        onValueChange={(value) => onStatusSelect(item.id, value)}
                      >
                        <SelectTrigger className="w-full min-w-[150px]">
                          <SelectValue placeholder="Select Decision" />
                        </SelectTrigger>
                        <SelectContent>
                          {getStatusOptions(item.id).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {option.icon}
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <div className="font-medium">{item.machineName}</div>
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <div className="text-sm max-w-[150px]">
                        {item.notes || (
                          <span className="text-muted-foreground italic">No notes</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Submit Section */}
      <div className="flex justify-center pt-6">
        <Button 
          onClick={onSubmit}
          disabled={!canSubmit()}
          size="lg"
          className="min-w-64"
        >
          {getSubmitButtonText()}
        </Button>
      </div>
    </div>
  );
}; 