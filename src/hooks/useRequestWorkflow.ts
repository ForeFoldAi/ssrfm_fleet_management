import { useState, useCallback } from 'react';
import { useStock } from '../contexts/StockContext';

export interface RequestStatusHistory {
  status: string;
  date: string;
  description: string;
  user: string;
  data?: any;
}

export interface RequestWorkflowData {
  id: string;
  status: string;
  statusDescription: string;
  currentStage: string;
  progressStage: number;
  statusHistory: RequestStatusHistory[];
  // Receipt form data
  receivedForm?: {
    purchasedPrice: string;
    purchasedQuantity: string;
    purchasedFrom: string;
    receivedDate: string;
    invoiceNumber: string;
    qualityCheck: string;
    notes: string;
  };
  // Approval/Revert data
  approvedBy?: string;
  approvedDate?: string;
  revertedBy?: string;
  revertedDate?: string;
  revertReason?: string;
}

export const useRequestWorkflow = () => {
  const { updateStockFromRequest } = useStock();
  const [requests, setRequests] = useState<Map<string, RequestWorkflowData>>(
    new Map()
  );

  // Initialize request workflow data
  const initializeRequest = useCallback(
    (requestId: string, initialData: Partial<RequestWorkflowData>) => {
      const workflowData: RequestWorkflowData = {
        id: requestId,
        status: 'pending_approval',
        statusDescription: 'Awaiting approval',
        currentStage: 'Pending Approval',
        progressStage: 1,
        statusHistory: [
          {
            status: 'pending_approval',
            date: new Date().toISOString(),
            description: 'Request submitted for approval',
            user: 'System',
          },
        ],
        ...initialData,
      };

      setRequests((prev) => new Map(prev.set(requestId, workflowData)));
      return workflowData;
    },
    []
  );

  // Update request status with workflow logic
  const updateRequestStatus = useCallback(
    (
      requestId: string,
      newStatus: string,
      updateData: any,
      userContext?: { name: string; role: string }
    ) => {
      setRequests((prev) => {
        const current = prev.get(requestId);
        if (!current) return prev;

        const statusHistory: RequestStatusHistory = {
          status: newStatus,
          date: new Date().toISOString(),
          description:
            updateData.statusDescription || `Status updated to ${newStatus}`,
          user:
            userContext?.name ||
            updateData.approvedBy ||
            updateData.revertedBy ||
            updateData.receivedBy ||
            'System',
          data: updateData,
        };

        const updated: RequestWorkflowData = {
          ...current,
          status: newStatus,
          statusDescription:
            updateData.statusDescription || current.statusDescription,
          currentStage: updateData.currentStage || current.currentStage,
          progressStage: updateData.progressStage || current.progressStage,
          statusHistory: [statusHistory, ...current.statusHistory],
          ...updateData,
        };

        // Handle stock updates for material receipt
        if (
          newStatus === 'material_received' ||
          newStatus === 'partially_received'
        ) {
          // This would typically integrate with your stock management system
          // For now, we'll just log the action
          console.log(`Stock updated for request ${requestId}:`, {
            material: updateData.materialName,
            quantity: updateData.purchasedQuantity,
            status: newStatus,
          });
        }

        return new Map(prev.set(requestId, updated));
      });
    },
    []
  );

  // Owner approves request
  const approveRequest = useCallback(
    (requestId: string, approverName: string) => {
      updateRequestStatus(requestId, 'ordered', {
        approvedBy: approverName,
        approvedDate: new Date().toISOString(),
        statusDescription: 'Approved by Owner - Order placed with supplier',
        currentStage: 'Ordered',
        progressStage: 3,
      });
    },
    [updateRequestStatus]
  );

  // Owner reverts request
  const revertRequest = useCallback(
    (requestId: string, revertReason: string, reverterName: string) => {
      updateRequestStatus(requestId, 'reverted', {
        revertedBy: reverterName,
        revertedDate: new Date().toISOString(),
        revertReason: revertReason,
        statusDescription: `Reverted by Owner: ${revertReason}`,
        currentStage: 'Reverted - Resubmission Required',
        progressStage: 0,
      });
    },
    [updateRequestStatus]
  );

  // Supervisor updates material receipt
  const updateMaterialReceipt = useCallback(
    (
      requestId: string,
      receiptData: any,
      supervisorName: string,
      isPartial: boolean = false
    ) => {
      const status = isPartial ? 'partially_received' : 'material_received';
      const stage = isPartial ? 'Partially Received' : 'Material Received';
      const progressStage = isPartial ? 4 : 5;

      updateRequestStatus(requestId, status, {
        receivedBy: supervisorName,
        receivedDate: receiptData.receivedDate,
        receivedForm: receiptData,
        statusDescription: isPartial
          ? `Partially received: ${receiptData.purchasedQuantity} MeasureUnits`
          : 'Materials fully received and updated in inventory',
        currentStage: stage,
        progressStage: progressStage,
        ...receiptData,
      });
    },
    [updateRequestStatus]
  );

  // Resubmit reverted request
  const resubmitRequest = useCallback(
    (requestId: string, submitterName: string) => {
      updateRequestStatus(requestId, 'pending_approval', {
        statusDescription: 'Request resubmitted after corrections',
        currentStage: 'Pending Approval',
        progressStage: 1,
        resubmittedBy: submitterName,
        resubmittedDate: new Date().toISOString(),
      });
    },
    [updateRequestStatus]
  );

  // Get request workflow data
  const getRequestWorkflow = useCallback(
    (requestId: string): RequestWorkflowData | undefined => {
      return requests.get(requestId);
    },
    [requests]
  );

  // Get all requests with workflow data
  const getAllRequestsWithWorkflow = useCallback(() => {
    return Array.from(requests.values());
  }, [requests]);

  // Check if user can perform action
  const canPerformAction = useCallback(
    (
      requestId: string,
      action: 'approve' | 'revert' | 'update_receipt' | 'resubmit',
      userRole: string
    ): boolean => {
      const request = requests.get(requestId);
      if (!request) return false;

      switch (action) {
        case 'approve':
        case 'revert':
          return (
            userRole === 'company_owner' &&
            request.status === 'pending_approval'
          );

        case 'update_receipt':
          return (
            userRole === 'supervisor' &&
            (request.status === 'ordered' ||
              request.status === 'partially_received')
          );

        case 'resubmit':
          return request.status === 'reverted';

        default:
          return false;
      }
    },
    [requests]
  );

  return {
    initializeRequest,
    updateRequestStatus,
    approveRequest,
    revertRequest,
    updateMaterialReceipt,
    resubmitRequest,
    getRequestWorkflow,
    getAllRequestsWithWorkflow,
    canPerformAction,
  };
};
