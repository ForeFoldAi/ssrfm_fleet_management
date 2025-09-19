import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, RotateCcw, Package, Truck, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface StatusDropdownProps {
  currentStatus: string;
  userRole: 'company_owner' | 'site_supervisor';
  onStatusChange: (newStatus: string, additionalData?: any) => void;
  requestId: string;
  hasVendorSelected?: boolean;
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
  hasVendorSelected = false
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [additionalData, setAdditionalData] = React.useState({
    receivedQuantity: '',
    receivedDate: new Date().toISOString().split('T')[0],
    notes: '',
    revertReason: ''
  });

  const getOwnerStatusOptions = (): StatusOption[] => [
    {
      value: 'approved',
      label: 'Approved',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      value: 'reverted',
      label: 'Revert',
      icon: <RotateCcw className="w-4 h-4" />,
      requiresAdditionalData: true
    },
   
  ];

  const getSupervisorStatusOptions = (): StatusOption[] => {
    switch (currentStatus) {
      case 'approved':
        return [
          {
            value: 'ordered',
            label: 'Ordered',
            icon: <Package className="w-4 h-4" />,
          }
        ];
      case 'ordered':
        return [
          {
            value: 'partially_received',
            label: 'Partially Received',
            icon: <Truck className="w-4 h-4" />,
            requiresAdditionalData: true
          },
          {
            value: 'material_received',
            label: 'Material Received',
            icon: <CheckCircle className="w-4 h-4" />,
            requiresAdditionalData: true
          }
        ];
      case 'partially_received':
        return [
          {
            value: 'material_received',
            label: 'Material Received',
            icon: <CheckCircle className="w-4 h-4" />,
            requiresAdditionalData: true
          }
        ];
      default:
        return [];
    }
  };

  const statusOptions = userRole === 'company_owner' ? getOwnerStatusOptions() : getSupervisorStatusOptions();

  const handleStatusSelect = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (option?.requiresAdditionalData) {
      setSelectedStatus(status);
      setIsDialogOpen(true);
    } else {
      onStatusChange(status);
    }
  };

  const handleSubmitWithData = () => {
    onStatusChange(selectedStatus, additionalData);
    setIsDialogOpen(false);
    setAdditionalData({
      receivedQuantity: '',
      receivedDate: new Date().toISOString().split('T')[0],
      notes: '',
      revertReason: ''
    });
  };

  const canChangeStatus = () => {
    if (userRole === 'company_owner') {
      return currentStatus === 'pending_approval' && hasVendorSelected;
    }
    return ['approved', 'ordered', 'partially_received'].includes(currentStatus);
  };

  if (!canChangeStatus() || statusOptions.length === 0) {
    return (
      <Badge variant="secondary" className="cursor-not-allowed">
        {currentStatus.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  }

  return (
    <>
      

      {/* Additional Data Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedStatus === 'reverted' && 'Revert Request'}
              {selectedStatus === 'rejected' && 'Reject Request'}
              {(selectedStatus === 'partially_received' || selectedStatus === 'material_received') && 'Material Receipt'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedStatus === 'reverted' && (
              <div className="space-y-2">
                <Label htmlFor="revertReason">Reason for Revert *</Label>
                <Textarea
                  id="revertReason"
                  value={additionalData.revertReason}
                  onChange={(e) => setAdditionalData(prev => ({ ...prev, revertReason: e.target.value }))}
                  placeholder="Explain why this request needs corrections..."
                  className="min-h-[100px]"
                />
              </div>
            )}

            {selectedStatus === 'rejected' && (
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Reason for Rejection *</Label>
                <Textarea
                  id="rejectReason"
                  value={additionalData.notes}
                  onChange={(e) => setAdditionalData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Explain why this request is rejected..."
                  className="min-h-[100px]"
                />
              </div>
            )}

            {(selectedStatus === 'partially_received' || selectedStatus === 'material_received') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receivedQuantity">Received Quantity *</Label>
                    <Input
                      id="receivedQuantity"
                      type="number"
                      value={additionalData.receivedQuantity}
                      onChange={(e) => setAdditionalData(prev => ({ ...prev, receivedQuantity: e.target.value }))}
                      placeholder="Enter quantity"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receivedDate">Received Date *</Label>
                    <Input
                      id="receivedDate"
                      type="date"
                      value={additionalData.receivedDate}
                      onChange={(e) => setAdditionalData(prev => ({ ...prev, receivedDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={additionalData.notes}
                    onChange={(e) => setAdditionalData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about the receipt..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitWithData}
              disabled={
                (selectedStatus === 'reverted' && !additionalData.revertReason.trim()) ||
                (selectedStatus === 'rejected' && !additionalData.notes.trim()) ||
                ((selectedStatus === 'partially_received' || selectedStatus === 'material_received') && 
                 !additionalData.receivedQuantity.trim())
              }
            >
              {selectedStatus === 'reverted' && 'Revert Request'}
              {selectedStatus === 'rejected' && 'Reject Request'}
              {(selectedStatus === 'partially_received' || selectedStatus === 'material_received') && 'Update Status'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 