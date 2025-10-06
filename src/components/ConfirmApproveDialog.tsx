import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { CheckCircle, AlertCircle, Package } from 'lucide-react';
import { MaterialIndentItem, VendorQuotation, ApproveRejectMaterialIndentRequest } from '../lib/api/types';
import { materialIndentsApi } from '../lib/api/material-indents';

interface ConfirmApproveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  materialIndent: {
    id: number;
    uniqueId: string;
    items: MaterialIndentItem[];
  };
  preSelectedVendors?: Record<string, string>; // itemId -> quotationId mapping
}

interface SelectedApproval {
  itemId: number;
  quotationId: number;
}

export const ConfirmApproveDialog: React.FC<ConfirmApproveDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  materialIndent,
  preSelectedVendors = {},
}) => {
  // Initialize selectedApprovals from preSelectedVendors
  const [selectedApprovals, setSelectedApprovals] = useState<SelectedApproval[]>(() => {
    return Object.entries(preSelectedVendors).map(([itemId, quotationId]) => ({
      itemId: parseInt(itemId),
      quotationId: parseInt(quotationId),
    }));
  });
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update selectedApprovals when preSelectedVendors changes
  React.useEffect(() => {
    if (isOpen && Object.keys(preSelectedVendors).length > 0) {
      setSelectedApprovals(
        Object.entries(preSelectedVendors).map(([itemId, quotationId]) => ({
          itemId: parseInt(itemId),
          quotationId: parseInt(quotationId),
        }))
      );
    }
  }, [isOpen, preSelectedVendors]);

  const handleItemQuotationChange = (itemId: number, quotationId: number) => {
    setSelectedApprovals(prev => {
      const existing = prev.find(approval => approval.itemId === itemId);
      if (existing) {
        return prev.map(approval => 
          approval.itemId === itemId 
            ? { ...approval, quotationId }
            : approval
        );
      } else {
        return [...prev, { itemId, quotationId }];
      }
    });
  };

  const getSelectedQuotation = (itemId: number) => {
    const approval = selectedApprovals.find(a => a.itemId === itemId);
    return approval?.quotationId;
  };

  const canApprove = () => {
    // Check if all items with quotations have been selected
    const itemsWithQuotations = materialIndent.items.filter(item => 
      item.quotations && item.quotations.length > 0
    );
    
    // We can approve if:
    // 1. All items with quotations have selections, OR
    // 2. There are no items with quotations (all items can be approved without quotations)
    return selectedApprovals.length === itemsWithQuotations.length;
  };

  const handleApprove = async () => {
    if (!canApprove()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Approve with the first selected item (backend should handle the entire indent)
      // The backend typically approves the entire indent, not individual items
      const firstApproval = selectedApprovals[0] || {
        itemId: materialIndent.items[0].id,
        quotationId: 0,
      };

      const payload: ApproveRejectMaterialIndentRequest = {
        status: 'approved',
        itemId: firstApproval.itemId,
        quotationId: firstApproval.quotationId,
        rejectionReason: approvalNotes.trim() || undefined,
      };

      console.log('Submitting approval for material indent:', { 
        indentId: materialIndent.id, 
        payload,
        note: 'Approving entire indent with first item'
      });

      const result = await materialIndentsApi.approve(materialIndent.id, payload);
      
      console.log('Approval successful:', result);
      
      onSuccess();
      onClose();
      
      // Reset form
      setSelectedApprovals([]);
      setApprovalNotes('');
      
    } catch (err) {
      console.error('Approval failed:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to approve material indent. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemsWithQuotations = materialIndent.items.filter(item => 
    item.quotations && item.quotations.length > 0
  );

  const itemsWithoutQuotations = materialIndent.items.filter(item => 
    !item.quotations || item.quotations.length === 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Confirm Material Indent Approval
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Simple Request Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Indent Details</h3>
            <p><strong>ID:</strong> {materialIndent.uniqueId.toUpperCase()}</p>
            <p><strong>Items:</strong> {materialIndent.items.length}</p>
          </div>

          {/* Selected Vendors Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold">Selected Vendor Quotations:</h4>
            {itemsWithQuotations.map((item) => {
              const selectedQuotationId = getSelectedQuotation(item.id);
              const selectedQuotation = item.quotations.find(q => q.id === selectedQuotationId);
              
              if (!selectedQuotation) return null;
              
              return (
                <div key={item.id} className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{item.material.name}</span>
                      {item.material.makerBrand && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({item.material.makerBrand})
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {selectedQuotation.vendorName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{selectedQuotation.quotationAmount}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Items without Quotations Warning */}
          {itemsWithoutQuotations.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> {itemsWithoutQuotations.length} item(s) have no vendor quotations and will be approved without vendor selection.
              </p>
            </div>
          )}

        

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Approval Failed</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!canApprove() || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Approval
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
