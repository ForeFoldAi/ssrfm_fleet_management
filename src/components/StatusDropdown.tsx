import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Package,
  Truck,
  Calendar,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface StatusDropdownProps {
  currentStatus: string;
  userRole: 'company_owner' | 'supervisor';
  onStatusChange: (newStatus: string, additionalData?: any) => void;
  requestId: string;
  hasVendorSelected?: boolean;
  hasNoVendorQuotations?: boolean;
  partialReceiptHistory?: Array<{
    id: string;
    receivedQuantity: number;
    receivedDate: string;
    notes: string;
    receivedBy: string;
    timestamp: string;
    status: string;
  }>;
  requiredQuantity?: number;
}

interface StatusOption {
  value: string;
  label: string;
  icon: React.ReactNode;

  requiresAdditionalData?: boolean;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  userRole,
  onStatusChange,
  requestId,
  hasVendorSelected = false,
  hasNoVendorQuotations = false,
  partialReceiptHistory = [],
  requiredQuantity = 0,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [additionalData, setAdditionalData] = React.useState({
    receivedQuantity: '',
    receivedDate: new Date().toISOString().split('T')[0],
    notes: '',
    revertReason: '',
  });

  // Add state for order confirmation dialog
  const [isOrderConfirmOpen, setIsOrderConfirmOpen] = React.useState(false);

  const getOwnerStatusOptions = (): StatusOption[] => {
    const options: StatusOption[] = [];
    
    // Always show revert option
    options.push({
      value: 'reverted',
      label: 'Revert',
      icon: <RotateCcw className='w-4 h-4' />,
      requiresAdditionalData: true,
    });
    
    // Show approve option if vendor is selected OR if there are no vendor quotations
    if (hasVendorSelected || hasNoVendorQuotations) {
      options.unshift({
        value: 'approved',
        label: 'Approved',
        icon: <CheckCircle className='w-4 h-4' />,
      });
    }
    
    return options;
  };

  const getSupervisorStatusOptions = (): StatusOption[] => {
    switch (currentStatus) {
      case 'approved':
        return [
          {
            value: 'ordered',
            label: 'Ordered',
            icon: <Package className='w-4 h-4' />,
          },
        ];
      case 'ordered':
        return [
          {
            value: 'partially_received',
            label: 'Partially Received',
            icon: <Truck className='w-4 h-4' />,
            requiresAdditionalData: true,
          },
          {
            value: 'fully_received',
            label: 'Fully Received',
            icon: <CheckCircle className='w-4 h-4' />,
            requiresAdditionalData: true,
          },
        ];
      case 'partially_received':
        return [
          {
            value: 'partially_received',
            label: 'Add Partial Receipt',
            icon: <Truck className='w-4 h-4' />,
            requiresAdditionalData: true,
          },
          {
            value: 'fully_received',
            label: 'Fully Received',
            icon: <CheckCircle className='w-4 h-4' />,
            requiresAdditionalData: true,
          },
        ];
      default:
        return [];
    }
  };

  const statusOptions =
    userRole === 'company_owner'
      ? getOwnerStatusOptions()
      : getSupervisorStatusOptions();

  const handleStatusSelect = (status: string) => {
    const option = statusOptions.find((opt) => opt.value === status);
    
    if (status === 'ordered') {
      // Show order confirmation dialog
      setSelectedStatus(status);
      setIsOrderConfirmOpen(true);
    } else if (option?.requiresAdditionalData) {
      setSelectedStatus(status);
      setIsDialogOpen(true);
    } else {
      onStatusChange(status);
    }
  };

  const handleSubmitWithData = () => {
    // Check if this partial receipt will complete the order
    if (selectedStatus === 'partially_received') {
      const currentTotal = partialReceiptHistory.reduce((sum, receipt) => 
        sum + (receipt.receivedQuantity || 0), 0
      );
      const newReceiptQuantity = parseInt(additionalData.receivedQuantity) || 0;
      const totalAfterReceipt = currentTotal + newReceiptQuantity;
      
      // Use the required quantity passed as prop
      
      if (totalAfterReceipt >= requiredQuantity) {
        // Auto-update to fully received
        onStatusChange('fully_received', additionalData);
      } else {
        onStatusChange(selectedStatus, additionalData);
      }
    } else {
      onStatusChange(selectedStatus, additionalData);
    }
    
    setIsDialogOpen(false);
    setAdditionalData({
      receivedQuantity: '',
      receivedDate: new Date().toISOString().split('T')[0],
      notes: '',
      revertReason: '',
    });
  };

  const handleOrderConfirm = () => {
    onStatusChange(selectedStatus);
    setIsOrderConfirmOpen(false);
  };

  const canChangeStatus = () => {
    if (userRole === 'company_owner') {
      return currentStatus === 'pending_approval';
    }
    return ['approved', 'ordered', 'fully_received'].includes(
      currentStatus
    );
  };

  if (!canChangeStatus() || statusOptions.length === 0) {
    return (
      <Badge variant='secondary' className='cursor-not-allowed'>
        {currentStatus.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  }

  return (
    <>
      <Select onValueChange={handleStatusSelect}>
        <SelectTrigger className='w-[200px]'>
          <SelectValue placeholder={currentStatus.replace('_', ' ').toUpperCase()} />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className='flex items-center gap-2'>
                {option.icon}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Order Confirmation Dialog */}
      <Dialog open={isOrderConfirmOpen} onOpenChange={setIsOrderConfirmOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Confirm Purchase Order</DialogTitle>
          </DialogHeader>
          

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => setIsOrderConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleOrderConfirm}
              className='bg-blue-600 hover:bg-blue-700'
            >
              <Package className='w-4 h-4 mr-2' />
              Confirm Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Data Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {selectedStatus === 'reverted' && 'Revert Request'}
              {selectedStatus === 'rejected' && 'Reject Request'}
              {(selectedStatus === 'fully_received') &&
                'Material Receipt'}
              {(selectedStatus === 'partially_received') &&
                'Partial Material Receipt'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {selectedStatus === 'reverted' && (
              <div className='space-y-2'>
                <Label htmlFor='revertReason'>Reason for Revert *</Label>
                <Textarea
                  id='revertReason'
                  value={additionalData.revertReason}
                  onChange={(e) =>
                    setAdditionalData((prev) => ({
                      ...prev,
                      revertReason: e.target.value,
                    }))
                  }
                  placeholder='Explain why this request needs corrections...'
                  className='min-h-[100px]'
                />
              </div>
            )}


            {(selectedStatus === 'fully_received' || selectedStatus === 'partially_received') && (
              <>
                {/* Show past received data if available */}
                {partialReceiptHistory.length > 0 && (
                  <div className='space-y-3 p-3 bg-green-50 border border-green-200 rounded-lg'>
                    <h4 className='font-medium text-green-800'>Previous Receipts</h4>
                    <div className='space-y-2 max-h-32 overflow-y-auto'>
                      {partialReceiptHistory.map((receipt, index) => (
                        <div key={receipt.id} className='text-sm bg-white p-2 rounded border'>
                          <div className='flex justify-between items-start'>
                            <div>
                              <span className='font-medium'>Receipt #{index + 1}</span>
                              <span className='text-gray-500 ml-2'>
                                {new Date(receipt.receivedDate).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                            <span className='font-medium text-green-600'>
                              {receipt.receivedQuantity} units
                            </span>
                          </div>
                          {receipt.notes && (
                            <div className='text-gray-600 mt-1'>
                              {receipt.notes}
                            </div>
                          )}
                          <div className='text-xs text-gray-500 mt-1'>
                            by {receipt.receivedBy}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='text-sm font-medium text-green-700 pt-2 border-t'>
                      Total Received: {partialReceiptHistory.reduce((sum, receipt) => 
                        sum + receipt.receivedQuantity, 0
                      )} units
                    </div>
                  </div>
                )}
                
                {/* Input fields for new receipt */}
                <div className='space-y-3'>
                  <div>
                    <Label htmlFor='receivedQuantity'>
                      {selectedStatus === 'partially_received' ? 'Received Quantity *' : 'Total Received Quantity *'}
                    </Label>
                    <Input
                      id='receivedQuantity'
                      type='number'
                      value={additionalData.receivedQuantity}
                      onChange={(e) =>
                        setAdditionalData((prev) => ({
                          ...prev,
                          receivedQuantity: e.target.value,
                        }))
                      }
                      placeholder='Enter quantity received'
                      min='1'
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor='receivedDate'>Received Date *</Label>
                    <Input
                      id='receivedDate'
                      type='date'
                      value={additionalData.receivedDate}
                      onChange={(e) =>
                        setAdditionalData((prev) => ({
                          ...prev,
                          receivedDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor='receiveNotes'>Notes</Label>
                    <Textarea
                      id='receiveNotes'
                      value={additionalData.notes}
                      onChange={(e) =>
                        setAdditionalData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder='Any additional notes about the received material...'
                      className='min-h-[80px]'
                    />
                  </div>
                </div>
                
                {selectedStatus === 'fully_received' && (
                  <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                    <p className='text-blue-800 font-medium'>
                      Confirm that all materials have been fully received and the request can be marked as complete.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitWithData}
              disabled={
                (selectedStatus === 'reverted' &&
                  !additionalData.revertReason.trim()) ||
                (selectedStatus === 'rejected' &&
                  !additionalData.notes.trim()) ||
                ((selectedStatus === 'fully_received' || selectedStatus === 'partially_received') &&
                  (!additionalData.receivedQuantity.trim() || !additionalData.receivedDate.trim()))
              }
            >
              {selectedStatus === 'reverted' && 'Revert Request'}
              {selectedStatus === 'rejected' && 'Reject Request'}
              {selectedStatus === 'fully_received' && 'Confirm Fully Received'}
              {selectedStatus === 'partially_received' && 'Add Partial Receipt'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
