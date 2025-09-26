import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { FileText, Package, PackageCheck, Clock, CheckCircle2 } from 'lucide-react';

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
  selectedVendor?: string;
}

interface SupervisorRequestFormProps {
  requestData: {
    id: string;
    items: RequestItem[];
    requestedBy: string;
    location: string;
    date: string;
    status: string;
    selectedVendors?: Record<string, string>;
  };
  selectedStatuses: Record<string, string>;
  onStatusSelect: (itemId: string, status: string, additionalData?: any) => void;
  onSubmit: () => void;
}

export const SupervisorRequestForm: React.FC<SupervisorRequestFormProps> = ({
  requestData,
  selectedStatuses,
  onStatusSelect,
  onSubmit
}) => {
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string>('');
  const [receivedQuantity, setReceivedQuantity] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);

  const getStatusOptions = (itemId: string) => {
    const currentStatus = requestData.status;
    
    if (currentStatus === 'approved') {
      return [
        {
          value: 'ordered',
          label: 'Mark as Ordered',
          icon: <Package className="w-4 h-4" />,
        }
      ];
    }
    
    if (currentStatus === 'ordered') {
      return [
        {
          value: 'partially_received',
          label: 'Partially Received',
          icon: <Clock className="w-4 h-4" />,
        },
        {
          value: 'material_received',
          label: 'Fully Received',
          icon: <CheckCircle2 className="w-4 h-4" />,
        }
      ];
    }
    
    if (currentStatus === 'partially_received') {
      return [
        {
          value: 'partially_received',
          label: 'Add More Receipt',
          icon: <Clock className="w-4 h-4" />,
        },
        {
          value: 'material_received',
          label: 'Mark Complete',
          icon: <CheckCircle2 className="w-4 h-4" />,
        }
      ];
    }

    if (currentStatus === 'material_received') {
      return [
        {
          value: 'issued',
          label: 'Issue Materials',
          icon: <PackageCheck className="w-4 h-4" />,
          description: 'Issue to maintenance team'
        }
      ];
    }

    if (currentStatus === 'issued') {
      return [
        {
          value: 'completed',
          label: 'Mark Complete',
          icon: <CheckCircle2 className="w-4 h-4" />,
          description: 'Installation/usage complete'
        }
      ];
    }

    if (currentStatus === 'reverted') {
      return [
        {
          value: 'pending_approval',
          label: 'Resubmit for Approval',
          icon: <Package className="w-4 h-4" />,
          description: 'Submit corrected request'
        }
      ];
    }

    return [];
  };

  const handleStatusChange = (itemId: string, status: string) => {
    if (status === 'partially_received') {
      setCurrentItemId(itemId);
      setShowReceiptDialog(true);
    } else {
      onStatusSelect(itemId, status);
    }
  };

  const handleReceiptSubmit = () => {
    if (receivedQuantity && receivedDate && currentItemId) {
      onStatusSelect(currentItemId, 'partially_received', {
        receivedQuantity,
        receivedDate,
        notes: `Received ${receivedQuantity} on ${receivedDate}`
      });
      setShowReceiptDialog(false);
      setReceivedQuantity('');
      setReceivedDate(new Date().toISOString().split('T')[0]);
      setCurrentItemId('');
    }
  };

  const canSubmit = () => {
    return requestData.items.every(item => selectedStatuses[item.id]);
  };

  const getSubmitButtonText = () => {
    const statusValues = Object.values(selectedStatuses);
    const orderedCount = statusValues.filter(status => status === 'ordered').length;
    const partialCount = statusValues.filter(status => status === 'partially_received').length;
    const receivedCount = statusValues.filter(status => status === 'material_received').length;
    const issuedCount = statusValues.filter(status => status === 'issued').length;
    const completedCount = statusValues.filter(status => status === 'completed').length;
    const resubmitCount = statusValues.filter(status => status === 'pending_approval').length;

    if (orderedCount > 0 && partialCount === 0 && receivedCount === 0 && issuedCount === 0 && completedCount === 0) {
      return `Mark ${orderedCount} Item${orderedCount > 1 ? 's' : ''} as Ordered`;
    } else if (receivedCount > 0 && orderedCount === 0 && partialCount === 0 && issuedCount === 0 && completedCount === 0) {
      return `Mark ${receivedCount} Item${receivedCount > 1 ? 's' : ''} as Received`;
    } else if (partialCount > 0 && orderedCount === 0 && receivedCount === 0 && issuedCount === 0 && completedCount === 0) {
      return `Update ${partialCount} Item${partialCount > 1 ? 's' : ''} Receipt`;
    } else if (issuedCount > 0 && orderedCount === 0 && partialCount === 0 && receivedCount === 0 && completedCount === 0) {
      return `Issue ${issuedCount} Item${issuedCount > 1 ? 's' : ''}`;
    } else if (completedCount > 0 && orderedCount === 0 && partialCount === 0 && receivedCount === 0 && issuedCount === 0) {
      return `Mark ${completedCount} Item${completedCount > 1 ? 's' : ''} Complete`;
    } else if (resubmitCount > 0 && orderedCount === 0 && partialCount === 0 && receivedCount === 0 && issuedCount === 0 && completedCount === 0) {
      return `Resubmit ${resubmitCount} Item${resubmitCount > 1 ? 's' : ''}`;
    } else {
      return `Submit Status Updates (${Object.keys(selectedStatuses).length}/${requestData.items.length})`;
    }
  };

  const getSelectedVendorInfo = (item: RequestItem) => {
    const selectedVendorId = requestData.selectedVendors?.[item.id];
    if (selectedVendorId) {
      const vendor = item.vendorQuotations.find(v => v.id === selectedVendorId);
      if (vendor) {
        return `${vendor.vendorName} - ${vendor.quotedPrice}`;
      }
    }
    return 'No vendor selected';
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

      {/* Items Table with Status Management */}
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
                  <TableHead className="border border-gray-300 font-semibold">SELECTED VENDOR</TableHead>
                  <TableHead className="border border-gray-300 font-semibold">STATUS UPDATE</TableHead>
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
                      <div className="min-w-[200px]">
                        {requestData.selectedVendors?.[item.id] ? (
                          <div className="p-2 bg-green-50 rounded border border-green-200">
                            <div className="flex items-center gap-2">
                              <PackageCheck className="w-4 h-4 text-green-600" />
                              <div>
                                <div className="font-medium text-green-800">
                                  {getSelectedVendorInfo(item)}
                                </div>
                                <div className="text-xs text-green-600">Selected by Company Owner</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <div className="text-xs">No vendor selected</div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <Select
                        value={selectedStatuses[item.id] || ''}
                        onValueChange={(value) => handleStatusChange(item.id, value)}
                      >
                        <SelectTrigger className="w-full min-w-[150px]">
                          <SelectValue placeholder="Update Status" />
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

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Material Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="received-quantity">Received Quantity</Label>
              <Input
                id="received-quantity"
                type="text"
                placeholder="Enter quantity received"
                value={receivedQuantity}
                onChange={(e) => setReceivedQuantity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="received-date">Date Received</Label>
              <Input
                id="received-date"
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleReceiptSubmit}>
                Record Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 