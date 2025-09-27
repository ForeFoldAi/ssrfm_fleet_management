import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FileEdit,
  Package,
  Loader2,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Truck,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useRole } from '../contexts/RoleContext';
import { toast } from '../hooks/use-toast';
import { RequisitionIndentForm } from '../components/RequisitionIndentForm';
import { SupervisorRequestForm } from '../components/SupervisorRequestForm';
import { StatusDropdown } from '../components/StatusDropdown';
import { HistoryView } from '../components/HistoryView';
import { generatePurchaseId, parseLocationFromId, formatDateToDDMMYYYY } from '../lib/utils';
import materialIndentsApi, { IndentStatus } from '../lib/api/material-indents';
import {
  materialPurchasesApi,
  MaterialPurchaseStatus,
} from '../lib/api/materials-purchases';
import {
  MaterialIndent,
  MaterialPurchase,
  ApproveRejectMaterialIndentRequest,
  ReceiveMaterialPurchaseItemRequest,
  MaterialPurchaseItem,
} from '../lib/api/types';
import { Badge } from '../components/ui/badge';

interface VendorQuotation {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  quotedPrice: string;
  notes: string;
  quotationFile?: File | null;
  isSelected?: boolean; // Add this line
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
}

interface RequestData {
  id: string;
  items: RequestItem[];
  requestedBy: string;
  location: string;
  date: string;
  status: string;
  selectedVendors?: Record<string, string>;
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
  apiData?: MaterialIndent; // Store the original API data
  partialReceiptHistory?: Array<{
    id: string;
    receivedQuantity: number;
    receivedDate: string;
    notes: string;
    receivedBy: string;
    timestamp: string;
    status: IndentStatus;
  }>;
  totalReceivedQuantity?: number;
}

const RequestDetails: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useRole();

  // Decode the requestId to handle URL encoded characters
  const decodedRequestId = requestId ? decodeURIComponent(requestId) : null;

  const [requestData, setRequestData] = useState<RequestData | null>(null);
  // Removed vendor selection state in favor of dialog-based approval per item
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, string>
  >({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for enhanced workflow
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedQuotationId, setSelectedQuotationId] = useState<number | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<MaterialPurchase | null>(null);
  const [receiveData, setReceiveData] =
    useState<ReceiveMaterialPurchaseItemRequest>({
      receivedQuantity: 0,
      receivedDate: new Date().toISOString().split('T')[0],
      notes: '',
    });

  // Add state for vendor selection
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string>>({});

  // Available materials and machines will be populated from API data
  const [availableMaterials, setAvailableMaterials] = useState<
    Array<{
      name: string;
      specifications: string;
      measureUnit: string;
      category: string;
    }>
  >([]);
  const [machines, setMachines] = useState<string[]>([]);

  // Helper function to format Purchase ID (same as MaterialOrderBookTab)
  const formatPurchaseId = (uniqueId: string, branchCode?: string) => {
    // Convert to uppercase
    let formattedId = uniqueId.toUpperCase();

    // Convert unit numbers to Roman numerals (UNIT1 -> UNIT-I, UNIT2 -> UNIT-II, etc.)
    formattedId = formattedId.replace(/UNIT(\d+)/g, (match, unitNumber) => {
      const num = parseInt(unitNumber, 10);
      const romanNumerals = [
        '',
        'I',
        'II',
        'III',
        'IV',
        'V',
        'VI',
        'VII',
        'VIII',
        'IX',
        'X',
      ];
      return `UNIT-${romanNumerals[num] || unitNumber}`;
    });

    return formattedId;
  };

  useEffect(() => {
    const loadRequestData = async () => {
      if (!decodedRequestId) {
        setError('Request ID is missing');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // The decodedRequestId should be the numeric ID from the URL
        // For example: if URL is /request-details/16, then decodedRequestId is "16"
        const numericId = parseInt(decodedRequestId, 10);

        if (isNaN(numericId) || numericId <= 0) {
          throw new Error('Invalid request ID format');
        }

        // Fetch the material indent data from API
        const indentData = await materialIndentsApi.getById(numericId);

        // Transform API data to match the RequestData interface
        const transformedData: RequestData = {
          id: formatPurchaseId(indentData.uniqueId, indentData.branch?.code), // Apply formatting here
          requestedBy: indentData.requestedBy?.name || 'Unknown',
          location: indentData.branch?.name || 'Unknown',
          date: indentData.requestDate,
          status: indentData.status,
          apiData: indentData, // Store the original API data
          items: indentData.items.map((item) => ({
            id: item.id.toString(),
            srNo: formatPurchaseId(indentData.uniqueId, indentData.branch?.code), // Use the same formatted ID as the Purchase ID
            productName: item.material.name,
            machineName: item.machine?.name || 'N/A',
            specifications:
              item.specifications || item.material.specifications || '',
            oldStock: item.currentStock,
            reqQuantity: item.requestedQuantity.toString(),
            measureUnit: item.material.measureUnitId?.toString() || 'units',
            notes: item.notes || '',
            imagePreviews: item.imagePaths || [],
            vendorQuotations: item.quotations.map((quotation) => ({
              id: quotation.id.toString(),
              vendorName: quotation.vendorName,
              contactPerson: quotation.contactPerson,
              phone: quotation.phone,
              quotedPrice: `₹${quotation.quotationAmount}`,
              notes: quotation.notes,
              quotationFile: null,
              isSelected: quotation.isSelected,
            })),
          })),
          selectedVendors: {},
          receiptHistory: indentData.purchases.map((purchase) => ({
            id: purchase.id.toString(),
            date: purchase.orderDate,
            materialName: indentData.items[0]?.material.name || 'Unknown',
            quantity: indentData.items[0]?.requestedQuantity.toString() || '0',
            purchaseOrderNumber: purchase.purchaseOrderNumber,
            totalValue: purchase.totalValue,
            notes: purchase.additionalNotes,
            status: 'purchased',
            items: purchase.items,
          })),
          partialReceiptHistory: indentData.partialReceiptHistory || [],
          totalReceivedQuantity: indentData.totalReceivedQuantity || 0,
        };

        // Removed initial selected vendors; handled via approval dialog
        setRequestData(transformedData);

        // Extract available materials and machines from the API data
        const materials = indentData.items.map((item) => ({
          name: item.material.name,
          specifications: item.material.specifications || '',
          measureUnit: item.material.measureUnitId?.toString() || 'units',
          category: 'Materials',
        }));

        const machineNames = indentData.items
          .filter((item) => item.machine)
          .map((item) => item.machine.name);

        setAvailableMaterials(materials);
        setMachines([...new Set(machineNames)]);
      } catch (error) {
        console.error('Error fetching request details:', error);
        setError('Failed to load request details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadRequestData();
  }, [decodedRequestId]);

  const handleItemChange = (itemId: string, field: string, value: string) => {
    if (!requestData) return;

    setRequestData((prev) => ({
      ...prev!,
      items: prev!.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Vendor selection handled via approval dialog; removed separate selector

  const handleStatusSelect = (itemId: string, status: string) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [itemId]: status,
    }));
  };

  // Removed duplicate company owner bulk submit; approval now via dialog only

  const handleSupervisorSubmit = async () => {
    if (!requestData || !requestData.apiData) return;

    try {
      // Extract numeric ID from the request ID
      const numericId = parseInt(
        requestData.id.split('/').pop()?.split('-').pop() || '0',
        10
      );

      if (isNaN(numericId) || numericId <= 0) {
        throw new Error('Invalid request ID format');
      }

      // Process the supervisor status updates
      const updates = requestData.items.map((item) => ({
        itemId: parseInt(item.id),
        materialName: item.productName,
        newStatus: selectedStatuses[item.id],
      }));

      // Determine the overall request status
      const statusValues = Object.values(selectedStatuses);
      let finalStatus = requestData.status;

      if (statusValues.every((status) => status === IndentStatus.ORDERED)) {
        finalStatus = IndentStatus.ORDERED;
      } else if (
        statusValues.every((status) => status === IndentStatus.FULLY_RECEIVED)
      ) {
        finalStatus = IndentStatus.FULLY_RECEIVED;
      } else if (statusValues.every((status) => status === 'issued')) {
        // Custom status
        finalStatus = 'issued';
      } else if (
        statusValues.every((status) => status === IndentStatus.CLOSED)
      ) {
        finalStatus = IndentStatus.CLOSED;
      } else if (
        statusValues.every((status) => status === IndentStatus.PENDING_APPROVAL)
      ) {
        finalStatus = IndentStatus.PENDING_APPROVAL;
      } else if (
        statusValues.some(
          (status) => status === IndentStatus.PARTIALLY_RECEIVED
        )
      ) {
        finalStatus = IndentStatus.PARTIALLY_RECEIVED;
      }

      // Update the material indent via API
      const updatedIndent = await materialIndentsApi.update(numericId, {
        status: finalStatus as IndentStatus,
        additionalNotes: `Status updated by ${
          currentUser?.name || 'Supervisor'
        } on ${new Date().toLocaleDateString()}.`,
      });

      // Update local state with API response
      const updatedData = {
        ...requestData,
        status: finalStatus,
        apiData: updatedIndent,
      };

      setRequestData(updatedData);

      // Show success message
      const orderedCount = statusValues.filter(
        (status) => status === IndentStatus.ORDERED
      ).length;
      const partialCount = statusValues.filter(
        (status) => status === IndentStatus.PARTIALLY_RECEIVED
      ).length;
      const receivedCount = statusValues.filter(
        (status) => status === IndentStatus.FULLY_RECEIVED
      ).length;
      const issuedCount = statusValues.filter(
        (status) => status === 'issued'
      ).length;
      const completedCount = statusValues.filter(
        (status) => status === IndentStatus.CLOSED
      ).length;
      const resubmitCount = statusValues.filter(
        (status) => status === IndentStatus.PENDING_APPROVAL
      ).length;

      let successMessage = `Successfully updated ${updates.length} item${
        updates.length > 1 ? 's' : ''
      }`;
      if (orderedCount > 0) successMessage += ` - ${orderedCount} ordered`;
      if (partialCount > 0)
        successMessage += ` - ${partialCount} partially received`;
      if (receivedCount > 0)
        successMessage += ` - ${receivedCount} fully received`;
      if (issuedCount > 0) successMessage += ` - ${issuedCount} issued`;
      if (completedCount > 0)
        successMessage += ` - ${completedCount} completed`;
      if (resubmitCount > 0)
        successMessage += ` - ${resubmitCount} resubmitted`;

      toast({
        title: 'Status Updated',
        description: successMessage,
      });
    } catch (error) {
      console.error('Error updating supervisor status:', error);

      toast({
        title: 'Status Update Failed',
        description: 'Failed to update the status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (
    newStatus: string,
    additionalData?: Record<string, unknown>
  ) => {
    if (!requestData || !requestData.apiData) return;

    try {
      // Use the API data ID directly instead of parsing from the formatted ID
      const numericId = requestData.apiData.id;

      if (!numericId || numericId <= 0) {
        throw new Error('Invalid request ID');
      }

      let updatedIndent;

      // Handle different status changes
      if (newStatus === IndentStatus.APPROVED) {
        // For approval, we need to select item and quotation
        setIsApprovalDialogOpen(true);
        return;
      } else if (newStatus === IndentStatus.REJECTED) {
        // For rejection, we need a reason
        setIsRejectionDialogOpen(true);
        return;
      } else if (newStatus === IndentStatus.REVERTED) {
        // For revert, use the update method with revert reason
        if (additionalData?.revertReason) {
          updatedIndent = await materialIndentsApi.update(numericId, {
            status: newStatus as IndentStatus,
            additionalNotes: String(additionalData.revertReason),
          });
        } else {
          throw new Error('Revert reason is required');
        }
      } else if (newStatus === IndentStatus.ORDERED) {
        // Create purchase order
        const purchaseData = {
          purchaseOrderNumber: `PO-${requestData.apiData.uniqueId}`,
          orderDate: new Date().toISOString().split('T')[0],
          additionalNotes: requestData.apiData.additionalNotes || '',
          indentId: requestData.apiData.id,
        };
        updatedIndent = await materialPurchasesApi.create(purchaseData);
      } else if (newStatus === IndentStatus.PARTIALLY_RECEIVED || 
                 newStatus === IndentStatus.FULLY_RECEIVED) {
        // Handle material receipt
        if (additionalData?.receivedQuantity && additionalData?.receivedDate) {
          const receiveData = {
            receivedQuantity: Number(additionalData.receivedQuantity),
            receivedDate: String(additionalData.receivedDate),
            notes: String(additionalData.notes || ''),
          };
          
          // Create receipt record for history
          const receiptRecord = {
            id: `receipt-${Date.now()}`,
            receivedQuantity: receiveData.receivedQuantity,
            receivedDate: receiveData.receivedDate,
            notes: receiveData.notes,
            receivedBy: currentUser?.name || 'Supervisor',
            timestamp: new Date().toISOString(),
            status: newStatus,
          };

          // Get existing partial receipt history
          const existingHistory = requestData.apiData?.partialReceiptHistory || [];
          const updatedHistory = [...existingHistory, receiptRecord];

          // Calculate total received quantity
          const totalReceived = updatedHistory.reduce((sum, receipt) => 
            sum + (receipt.receivedQuantity || 0), 0
          );
          
          // Find the first purchase order to receive
          const firstPurchase = requestData.receiptHistory?.[0];
          if (firstPurchase?.items?.[0]) {
            await materialPurchasesApi.receiveItem(
              Number(firstPurchase.id),
              firstPurchase.items[0].id,
              receiveData
            );
          }

          // Update with partial receipt history
        updatedIndent = await materialIndentsApi.update(numericId, {
          status: newStatus as IndentStatus,
            partialReceiptHistory: updatedHistory,
            totalReceivedQuantity: totalReceived,
          ...additionalData,
        });
        }
      } else {
        // For other status changes
        updatedIndent = await materialIndentsApi.update(numericId, {
          status: newStatus as IndentStatus,
          ...additionalData,
        });
      }

      // Update the local state with the API response
      const updatedData = {
        ...requestData,
        status: updatedIndent?.status || newStatus,
        apiData: updatedIndent || requestData.apiData,
      };

      setRequestData(updatedData);

      // Status-specific success messages
      let successMessage = '';
      switch (newStatus) {
        case IndentStatus.APPROVED:
          successMessage = 'Material indent has been approved successfully';
          break;
        case IndentStatus.REJECTED:
          successMessage = 'Material indent has been rejected';
          break;
        case IndentStatus.REVERTED:
          successMessage = 'Material indent has been reverted for corrections';
          break;
        case IndentStatus.ORDERED:
          successMessage = 'Purchase order has been created successfully';
          break;
        case IndentStatus.PARTIALLY_RECEIVED:
          const receiptCount = requestData.apiData?.partialReceiptHistory?.length || 0;
          successMessage = `Material partially received (Receipt #${receiptCount}) and status updated`;
          break;
        case IndentStatus.FULLY_RECEIVED:
          successMessage = 'Material fully received and status updated';
          break;
        case IndentStatus.CLOSED:
          successMessage = 'Material indent has been closed';
          break;
        default:
          successMessage = `Request status changed to ${newStatus.replace('_', ' ')}`;
      }

      toast({
        title: 'Success',
        description: successMessage,
      });
    } catch (error) {
      console.error('Error updating status:', error);

      toast({
        title: 'Status Update Failed',
        description: 'Failed to update the request status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!requestData || !requestData.apiData) return;

    try {
      // Extract numeric ID from the request ID
      const numericId = parseInt(
        requestData.id.split('/').pop()?.split('-').pop() || '0',
        10
      );

      if (isNaN(numericId) || numericId <= 0) {
        throw new Error('Invalid request ID format');
      }

      // Transform the edited data back to API format
      const apiUpdateData: Partial<MaterialIndent> = {
        additionalNotes: requestData.items.some((item) => item.notes)
          ? requestData.items.find((item) => item.notes)?.notes
          : undefined,
        // We're only updating notes and specifications, not the entire item structure
        // The API will handle partial updates correctly
      };

      // Update the material indent via API
      const updatedIndent = await materialIndentsApi.update(
        numericId,
        apiUpdateData
      );

      // Update local state with API response
      setRequestData({
        ...requestData,
        apiData: updatedIndent,
      });

      toast({
        title: 'Changes Saved',
        description: 'Request has been updated successfully',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving changes:', error);

      toast({
        title: 'Save Failed',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResubmit = async () => {
    if (!requestData || !requestData.apiData) return;

    try {
      // Extract numeric ID from the request ID
      const numericId = parseInt(
        requestData.id.split('/').pop()?.split('-').pop() || '0',
        10
      );

      if (isNaN(numericId) || numericId <= 0) {
        throw new Error('Invalid request ID format');
      }

      // Update the material indent status to pending_approval
      const updatedIndent = await materialIndentsApi.update(numericId, {
        status: IndentStatus.PENDING_APPROVAL,
        additionalNotes: requestData.items.some((item) => item.notes)
          ? `Resubmitted by ${
              currentUser?.name || 'Supervisor'
            } on ${new Date().toLocaleDateString()}. ${
              requestData.items.find((item) => item.notes)?.notes || ''
            }`
          : `Resubmitted by ${
              currentUser?.name || 'Supervisor'
            } on ${new Date().toLocaleDateString()}.`,
      });

      // Update local state with API response
      const updatedData = {
        ...requestData,
        status: IndentStatus.PENDING_APPROVAL,
        apiData: updatedIndent,
      };

      setRequestData(updatedData);

      toast({
        title: 'Request Resubmitted',
        description:
          'Request has been resubmitted for approval with updated vendor quotations',
      });
    } catch (error) {
      console.error('Error resubmitting request:', error);

      toast({
        title: 'Resubmission Failed',
        description: 'Failed to resubmit the request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVendorQuotationChange = (
    itemId: string,
    quotations: VendorQuotation[]
  ) => {
    if (!requestData) return;

    setRequestData((prev) => ({
      ...prev!,
      items: prev!.items.map((item) =>
        item.id === itemId ? { ...item, vendorQuotations: quotations } : item
      ),
    }));
  };

  const canEdit = () => {
    if (!requestData) return false;

    // Require update permission
    if (!hasPermission('inventory:material-indents:update')) return false;

    // Approvers don't edit in this flow
    if (hasPermission('inventory:material-indents:approve')) return false;

    // Only allow editing for reverted requests
    return requestData.status === 'reverted';
  };

  const isReadOnly = () => {
    if (!requestData) return true;

    if (hasPermission('inventory:material-indents:approve')) {
      return true; // Always read-only for approvers here
    }

    if (hasPermission('inventory:material-indents:update')) {
      // Only allow editing for reverted requests, read-only for all others
      return requestData.status !== 'reverted';
    }

    return true;
  };

  // Removed separate vendor selector in favor of approval dialog

  const shouldShowStatusDropdown = () => {
    if (!requestData) return false;

    if (hasPermission('inventory:material-indents:approve')) {
      return requestData.status === 'pending_approval';
    }

    if (hasPermission('inventory:material-indents:update')) {
      return ['approved', 'ordered', 'partially_received'].includes(
        requestData.status
      );
    }

    return false;
  };

  // Add function to check if all items have vendors selected
  const checkAllVendorsSelected = () => {
    if (!requestData?.apiData?.items) return false;
    
    return requestData.apiData.items.every(item => {
      // Check if this item has a selected vendor in the selectedVendors state
      return selectedVendors[item.id.toString()] && selectedVendors[item.id.toString()].trim() !== '';
    });
  };

  // State for last five material indents
  const [lastFiveIndents, setLastFiveIndents] = useState<MaterialIndent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Item and quotation image URLs state
  const [itemImageUrls, setItemImageUrls] = useState<Record<string, string[]>>(
    {}
  );
  const [quotationImageUrls, setQuotationImageUrls] = useState<
    Record<string, string[]>
  >({});

  const handleFetchItemImages = async (itemId: number) => {
    try {
      if (!requestData?.apiData?.id) return;
      const urls = await materialIndentsApi.getItemImageUrls(
        requestData.apiData.id,
        itemId
      );
      setItemImageUrls((prev) => ({ ...prev, [String(itemId)]: urls }));
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load item images',
        variant: 'destructive',
      });
    }
  };

  const handleFetchQuotationImages = async (itemId: number) => {
    try {
      if (!requestData?.apiData?.id) return;
      const urls = await materialIndentsApi.getItemQuotationImageUrls(
        requestData.apiData.id,
        itemId
      );
      setQuotationImageUrls((prev) => ({ ...prev, [String(itemId)]: urls }));
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load quotation images',
        variant: 'destructive',
      });
    }
  };

  // Fetch last five material indents
  useEffect(() => {
    const fetchLastFiveIndents = async () => {
      if (!hasPermission('inventory:material-indents:read:all')) return;

      setIsLoadingHistory(true);
      setHistoryError(null);

      try {
        const indents = await materialIndentsApi.getLastFive();
        setLastFiveIndents(indents);
      } catch (error) {
        console.error('Error fetching last five indents:', error);
        setHistoryError('Failed to load recent requests history.');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchLastFiveIndents();
  }, [hasPermission]);

  const getHistoryData = () => {
    if (!requestData) return [];

    if (hasPermission('inventory:material-indents:read:all')) {
      // Use the last five indents from API
      return lastFiveIndents.map((indent) => {
        // Get the first item for display purposes
        const firstItem =
          indent.items && indent.items.length > 0 ? indent.items[0] : null;
        const firstQuotation =
          firstItem?.selectedQuotation ||
          (firstItem?.quotations && firstItem.quotations.length > 0
            ? firstItem.quotations[0]
            : null);

        return {
          id: formatPurchaseId(indent.uniqueId, indent.branch?.code), // Apply formatting here too
          date: indent.requestDate,
          materialName: firstItem?.material?.name || 'Unknown',
          quantity: firstItem ? `${firstItem.requestedQuantity}` : '0',
          purchaseValue:
            indent.purchases && indent.purchases.length > 0
              ? indent.purchases[0].totalValue || '0'
              : '0',
          previousMaterialValue: '0', // Default value
          perMeasureQuantity: '1', // Default value
          requestedValue: firstQuotation ? firstQuotation.quotationAmount : '0',
          currentValue:
            indent.purchases && indent.purchases.length > 0
              ? indent.purchases[0].totalValue || '0'
              : '0',
          status: indent.status,
          requestedBy: indent.requestedBy?.name,
          location: indent.branch?.name || 'Unknown',
        };
      });
    } else {
      // For supervisor, show receipt history from current indent
      // Return receipt history for supervisor, but ensure it matches the HistoryItem interface
      return (requestData.receiptHistory || []).map((item) => ({
        ...item,
        purchaseValue: item.totalValue || '0',
        previousMaterialValue: '0', // Default value
        perMeasureQuantity: '1', // Default value
        requestedValue: item.totalValue || '0',
        currentValue: item.totalValue || '0',
      }));
    }
  };

  // New function to handle approval with selected vendors
  const handleApproveWithSelection = async () => {
    if (!requestData || !requestData.apiData) {
      toast({
        title: 'Error',
        description: 'No request data available.',
        variant: 'destructive',
      });
      return;
    }

    // Check if all items have vendors selected
    if (!checkAllVendorsSelected()) {
      toast({
        title: 'Error',
        description: 'Please select vendors for all items before approving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Approve all items with their selected quotations
      const approvalPromises = requestData.apiData.items.map(async (item) => {
        const selectedQuotationId = selectedVendors[item.id.toString()];
        if (!selectedQuotationId) {
          throw new Error(`No vendor selected for item ${item.material.name}`);
        }
        
      const approvalData: ApproveRejectMaterialIndentRequest = {
        status: 'approved',
          itemId: item.id,
          quotationId: parseInt(selectedQuotationId),
      };

        return materialIndentsApi.approve(requestData.apiData.id, approvalData);
      });

      // Wait for all approvals to complete
      await Promise.all(approvalPromises);

      toast({
        title: 'Success',
        description: 'Material indent approved successfully.',
      });

      setIsApprovalDialogOpen(false);
      setSelectedVendors({});

      // Refresh the request data
      const updatedIndent = await materialIndentsApi.getById(
        requestData.apiData.id
      );
      setRequestData((prev) =>
        prev
          ? { ...prev, apiData: updatedIndent, status: updatedIndent.status }
          : null
      );
    } catch (error) {
      console.error('Error approving indent:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve material indent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // New function to handle rejection with reason
  const handleRejectWithReason = async () => {
    if (!requestData || !requestData.apiData || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await materialIndentsApi.reject(requestData.apiData.id, rejectionReason);

      toast({
        title: 'Success',
        description: 'Material indent rejected successfully.',
      });

      setIsRejectionDialogOpen(false);
      setRejectionReason('');

      // Refresh the request data
      const updatedIndent = await materialIndentsApi.getById(
        requestData.apiData.id
      );
      setRequestData((prev) =>
        prev
          ? { ...prev, apiData: updatedIndent, status: updatedIndent.status }
          : null
      );
    } catch (error) {
      console.error('Error rejecting indent:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject material indent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // New function to create purchase order
  const handleCreatePurchaseOrder = async () => {
    if (!requestData || !requestData.apiData) {
      toast({
        title: 'Error',
        description: 'No indent data available for ordering.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const purchaseData = {
        purchaseOrderNumber: `PO-${requestData.apiData.uniqueId}`,
        orderDate: new Date().toISOString().split('T')[0],
        additionalNotes: requestData.apiData.additionalNotes || '',
        indentId: requestData.apiData.id,
      };

      const createdPurchase = await materialPurchasesApi.create(purchaseData);

      toast({
        title: 'Success',
        description: 'Purchase order created successfully.',
      });

      setIsOrderDialogOpen(false);
      setRequestData((prev) =>
        prev ? { ...prev, status: createdPurchase.status } : null
      );
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create purchase order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // New function to handle material receipt
  const handleReceiveMaterial = async () => {
    try {
      //  take from receipt history of the request
      const firstItem = requestData.receiptHistory[0].items?.[0];
      const selectedPurchase = requestData.receiptHistory[0];
      if (!firstItem) {
        toast({
          title: 'Error',
          description: 'No items found in this purchase order.',
          variant: 'destructive',
        });
        return;
      }

      await materialPurchasesApi.receiveItem(
        Number(selectedPurchase.id),
        firstItem.id,
        receiveData
      );

      toast({
        title: 'Success',
        description: 'Material received successfully.',
      });

      setIsReceiveDialogOpen(false);
      setSelectedPurchase(null);
      setReceiveData({
        receivedQuantity: 0,
        receivedDate: new Date().toISOString().split('T')[0],
        notes: '',
      });

      // Refresh the request data
      if (requestData?.apiData) {
        const updatedIndent = await materialIndentsApi.getById(
          requestData.apiData.id
        );
        setRequestData((prev) =>
          prev
            ? { ...prev, apiData: updatedIndent, status: updatedIndent.status }
            : null
        );
      }
    } catch (error) {
      console.error('Error receiving material:', error);
      toast({
        title: 'Error',
        description: 'Failed to receive material. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Enhanced action buttons for different workflow stages
  const renderWorkflowActions = () => {
    if (!requestData || !requestData.apiData) return null;

    // Only show status dropdown for users who can update status
    const canUpdateStatus = 
      hasPermission('inventory:material-indents:approve') ||
      hasPermission('inventory:material-indents:update');

    if (!canUpdateStatus) return null;

    // Show dropdown for more statuses including 'ordered'
    const allowedStatuses = [
      'pending_approval',
      'approved', 
      'ordered',
      'partially_received',
      'fully_received',
      'issued',
      'closed'
    ];

    if (!allowedStatuses.includes(requestData.status)) return null;

    return (
      <StatusDropdown
        currentStatus={requestData.status}
        userRole={
          hasPermission('inventory:material-indents:approve')
            ? 'company_owner'
            : 'supervisor'
        }
        onStatusChange={handleStatusChange}
        requestId={requestData.id}
        hasVendorSelected={checkAllVendorsSelected()}
        partialReceiptHistory={requestData.apiData?.partialReceiptHistory || []}
      />
    );
  };

  // Update the back button navigation
  const handleBackNavigation = () => {
    // Navigate back to the MaterialOrderBookTab (materials-inventory with material-order-book tab)
    navigate('/materials-inventory', {
      state: { activeTab: 'material-order-book' },
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <Loader2 className='animate-spin h-32 w-32 text-primary mx-auto' />
          <p className='mt-4 text-muted-foreground'>
            Loading request details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-foreground mb-2'>
            Error Loading Request
          </h2>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <Button onClick={() => navigate(-1)} className='mr-2'>
            Go Back
          </Button>
          <Button onClick={() => window.location.reload()} variant='outline'>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-foreground mb-2'>
            Request Not Found
          </h2>
          <p className='text-muted-foreground mb-4'>
            The requested material indent could not be found.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-0 p-2 sm:p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-6'>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              navigate('/materials-inventory', {
                state: { activeTab: 'material-order-book' },
              })
            }
            className='gap-2'
          >
            <ArrowLeft className='w-4 h-4' />
            Back
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>
              Request Details
            </h1>
            <p className='text-muted-foreground'>
              {hasPermission('inventory:material-indents:approve')
                ? 'Review and approve request'
                : 'Manage request status'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-6'>
          {/* Request Summary Info */}
          <div className='flex items-center gap-6 text-sm'>
            <div>
              <Label className='text-xs font-medium text-muted-foreground'>
                Requested By
              </Label>
              <div className='font-semibold'>
                {requestData.requestedBy}
              </div>
            </div>
            <div>
              <Label className='text-xs font-medium text-muted-foreground'>
                Unit
              </Label>
              <div className='font-semibold'>
                {requestData.location}
              </div>
            </div>
            <div>
              <Label className='text-xs font-medium text-muted-foreground'>
                Requested Date
              </Label>
              <div className='font-semibold'>
                {formatDateToDDMMYYYY(requestData.date)}
              </div>
            </div>
            <div>
              <Label className='text-xs font-medium text-muted-foreground'>
                Status
              </Label>
              {(hasPermission('inventory:material-indents:update') || 
                hasPermission('inventory:material-indents:approve')) ? (
                <StatusDropdown
                  currentStatus={requestData.status}
                  userRole={
                    hasPermission('inventory:material-indents:approve')
                      ? 'company_owner'
                      : 'supervisor'
                  }
                  onStatusChange={handleStatusChange}
                  requestId={requestData.id}
                  hasVendorSelected={checkAllVendorsSelected()}
                  partialReceiptHistory={requestData.apiData?.partialReceiptHistory || []}
                />
              ) : (
                <Badge className='mt-1'>{requestData.status}</Badge>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex items-center gap-3'>
            {canEdit() && !isEditing && (
              <Button onClick={() => setIsEditing(true)} className='gap-2'>
                <FileEdit className='w-4 h-4' />
                Edit Request
              </Button>
            )}

            {isEditing && (
              <Button onClick={handleSave} className='gap-2'>
                <Save className='w-4 h-4' />
                Save Changes
              </Button>
            )}

            {hasPermission('inventory:material-indents:update') &&
              requestData.status === 'reverted' && (
                <Button onClick={handleResubmit} className='gap-2'>
                  <Package className='w-4 h-4' />
                  Resubmit for Approval
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='w-full'>
        {/* Request Form - Full Width */}
        <div className='space-y-6'>
          {currentUser?.role === 'supervisor' &&
          requestData.status === 'reverted' ? (
            // For reverted requests, show full editable form like MaterialRequest.tsx
            <RequisitionIndentForm
              requestData={requestData}
              isReadOnly={false} // Allow editing for reverted requests
              onItemChange={handleItemChange}
              onVendorQuotationChange={handleVendorQuotationChange}
              availableMaterials={availableMaterials}
              machines={machines}
              onLoadItemImages={(itemId) => handleFetchItemImages(itemId)}
              onLoadQuotationImages={(itemId) =>
                handleFetchQuotationImages(itemId)
              }
              itemImageUrlsMap={itemImageUrls}
              quotationImageUrlsMap={quotationImageUrls}
              onStatusChange={handleStatusChange}
              userRole={
                hasPermission('inventory:material-indents:approve')
                  ? 'company_owner'
                  : 'supervisor'
              }
              hasPermission={hasPermission}
              selectedVendors={selectedVendors}
              onVendorSelection={(newSelection) => setSelectedVendors(newSelection)}
            />
          ) : currentUser?.role === 'supervisor' &&
            ['approved', 'ordered', 'partially_received', 'issued'].includes(
              requestData.status
            ) ? (
            <SupervisorRequestForm
              requestData={requestData}
              selectedStatuses={selectedStatuses}
              onStatusSelect={handleStatusSelect}
              onSubmit={handleSupervisorSubmit}
            />
          ) : (
            // For all other cases (including material_received, completed, rejected), show read-only form
            <>
              <RequisitionIndentForm
                requestData={requestData}
                isReadOnly={true} // Always read-only for completed/final statuses
                onItemChange={handleItemChange}
                availableMaterials={availableMaterials}
                machines={machines}
                onLoadItemImages={(itemId) => handleFetchItemImages(itemId)}
                onLoadQuotationImages={(itemId) =>
                  handleFetchQuotationImages(itemId)
                }
                itemImageUrlsMap={itemImageUrls}
                quotationImageUrlsMap={quotationImageUrls}
                onStatusChange={handleStatusChange}
                userRole={
                  hasPermission('inventory:material-indents:approve')
                    ? 'company_owner'
                    : 'supervisor'
                }
                hasPermission={hasPermission}
                selectedVendors={selectedVendors}
                onVendorSelection={(newSelection) => setSelectedVendors(newSelection)}
              />

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
                                {formatDateToDDMMYYYY(receipt.receivedDate)}
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
            </>
          )}
        </div>
      </div>

      {/* Bottom Section - Status and History */}
      <div className='mt-8 space-y-6'>
        {/* Request Status Card */}

        {/* History Section - Only for Company Owners */}
        {hasPermission('inventory:material-indents:read:all') && (
          <>
            {isLoadingHistory ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Requests History</CardTitle>
                </CardHeader>
                <CardContent className='flex justify-center items-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin text-primary' />
                  <p className='ml-2 text-muted-foreground'>
                    Loading history...
                  </p>
                </CardContent>
              </Card>
            ) : historyError ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Requests History</CardTitle>
                </CardHeader>
                <CardContent className='py-6'>
                  <div className='text-center'>
                    <p className='text-muted-foreground mb-2'>{historyError}</p>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setIsLoadingHistory(true);
                        setHistoryError(null);
                        materialIndentsApi
                          .getLastFive()
                          .then((indents) => setLastFiveIndents(indents))
                          .catch((err) => {
                            console.error('Error fetching history:', err);
                            setHistoryError(
                              'Failed to load recent requests history.'
                            );
                          })
                          .finally(() => setIsLoadingHistory(false));
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <HistoryView
                userRole='company_owner'
                historyData={getHistoryData()}
                requestId={requestData.id}
              />
            )}
          </>
        )}
      </div>

      {/* Approval Dialog */}
      <Dialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Approve Material Indent</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            {requestData?.apiData && (
              <div className='space-y-4'>
                <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <h3 className='font-semibold text-green-800 mb-2'>
                    Indent Details
                  </h3>
                  <p>
                    <strong>ID:</strong> {requestData.apiData.uniqueId.toUpperCase()}
                  </p>
                  <p>
                    <strong>Requested By:</strong>{' '}
                    {requestData.apiData.requestedBy?.name}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(requestData.apiData.requestDate)
                      .toLocaleDateString('en-GB')
                      .split('/')
                      .join(' - ')}
                  </p>
                  
                  {/* Selected Vendors */}
                  {Object.keys(selectedVendors).length > 0 && (
                    <div className='mt-3 pt-3 border-t border-green-200'>
                      <p className='font-semibold text-green-800 mb-2'>Selected Vendors:</p>
                      {requestData.apiData.items.map((item) => {
                        const selectedQuotationId = selectedVendors[item.id.toString()];
                        if (!selectedQuotationId) return null;
                        
                        const selectedQuotation = item.quotations.find(q => q.id.toString() === selectedQuotationId);
                        if (!selectedQuotation) return null;
                        
                        return (
                          <div key={item.id} className='text-sm'>
                            <strong>{item.material.name}:</strong> {selectedQuotation.vendorName} - ₹{selectedQuotation.quotationAmount}
                          </div>
                        );
                      })}
                  </div>
                )}
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsApprovalDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApproveWithSelection}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <CheckCircle className='w-4 h-4 mr-2' />
                    Confirm Approve
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={isRejectionDialogOpen}
        onOpenChange={setIsRejectionDialogOpen}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Reject Material Indent</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            {requestData?.apiData && (
              <div className='space-y-4'>
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <h3 className='font-semibold text-red-800 mb-2'>
                    Indent Details
                  </h3>
                  <p>
                    <strong>ID:</strong> {requestData.apiData.uniqueId}
                  </p>
                  <p>
                    <strong>Requested By:</strong>{' '}
                    {requestData.apiData.requestedBy?.name}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(
                      requestData.apiData.requestDate
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className='space-y-3'>
                  <Label htmlFor='rejectionReason'>Rejection Reason *</Label>
                  <Textarea
                    id='rejectionReason'
                    placeholder='Please provide a reason for rejection...'
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className='min-h-[100px]'
                  />
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsRejectionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRejectWithReason}
                    disabled={!rejectionReason.trim()}
                    className='bg-red-600 hover:bg-red-700'
                  >
                    <XCircle className='w-4 h-4 mr-2' />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Creation Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            {requestData?.apiData && (
              <div className='space-y-4'>
                <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <h3 className='font-semibold text-blue-800 mb-2'>
                    Indent Details
                  </h3>
                  <p>
                    <strong>ID:</strong> {requestData.apiData.uniqueId}
                  </p>
                  <p>
                    <strong>Requested By:</strong>{' '}
                    {requestData.apiData.requestedBy?.name}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(
                      requestData.apiData.requestDate
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className='space-y-3'>
                  <h4 className='font-semibold'>Items to Order:</h4>
                  <div className='space-y-2'>
                    {requestData.apiData.items.map((item) => (
                      <div
                        key={item.id}
                        className='p-3 bg-gray-50 rounded border'
                      >
                        <p>
                          <strong>{item.material.name}</strong>
                        </p>
                        <p>Quantity: {item.requestedQuantity}</p>
                        <p>
                          Selected Quotation:{' '}
                          {item.selectedQuotation?.vendorName ||
                            'None selected'}
                        </p>
                        <p>
                          Amount: ₹
                          {item.selectedQuotation?.quotationAmount || '0'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsOrderDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePurchaseOrder}
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    <ShoppingCart className='w-4 h-4 mr-2' />
                    Create Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Material Receipt Dialog */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Receive Material</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            {requestData.receiptHistory[0] && (
              <div className='space-y-4'>
                <div className='p-4 bg-orange-50 border border-orange-200 rounded-lg'>
                  <h3 className='font-semibold text-orange-800 mb-2'>
                    Purchase Order Details
                  </h3>
                  <p>
                    <strong>PO Number:</strong>{' '}
                    {requestData.receiptHistory[0].purchaseOrderNumber}
                  </p>
                  <p>
                    <strong>Order Date:</strong>{' '}
                    {new Date(
                      requestData.receiptHistory[0].date
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Total Value:</strong> ₹
                    {requestData.receiptHistory[0].totalValue}
                  </p>
                </div>

                <div className='space-y-3'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='receivedQuantity'>
                        Received Quantity *
                      </Label>
                      <Input
                        id='receivedQuantity'
                        type='number'
                        value={receiveData.receivedQuantity}
                        onChange={(e) =>
                          setReceiveData((prev) => ({
                            ...prev,
                            receivedQuantity: parseInt(e.target.value) || 0,
                          }))
                        }
                        min='1'
                      />
                    </div>
                    <div>
                      <Label htmlFor='receivedDate'>Received Date *</Label>
                      <Input
                        id='receivedDate'
                        type='date'
                        value={receiveData.receivedDate}
                        onChange={(e) =>
                          setReceiveData((prev) => ({
                            ...prev,
                            receivedDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='receiveNotes'>Notes</Label>
                    <Textarea
                      id='receiveNotes'
                      placeholder='Any additional notes about the received material...'
                      value={receiveData.notes}
                      onChange={(e) =>
                        setReceiveData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsReceiveDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReceiveMaterial}
                    disabled={
                      !receiveData.receivedQuantity || !receiveData.receivedDate
                    }
                    className='bg-orange-600 hover:bg-orange-700'
                  >
                    <Package className='w-4 h-4 mr-2' />
                    Receive Material
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestDetails;
