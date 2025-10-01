/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Plus,
  AlertTriangle,
  User,
  Calendar,
  Package,
  Truck,
  CheckSquare,
  List,
  Table as TableIcon,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Send,
  Search,
  FileEdit,
  Building2,
  Loader2,
  ChevronUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ShoppingCart,
  CheckCircle2,
  X,
  
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';
import { MaterialIssueForm } from '../components/MaterialIssueForm';
import { RequestStatusManager } from '../components/RequestStatusManager';
import { ResubmitForm } from '../components/ResubmitForm';
import { useRequestWorkflow } from '../hooks/useRequestWorkflow';
import { HistoryView } from '../components/HistoryView';
import { generatePurchaseId, parseLocationFromId, formatDateToDDMMYYYY } from '../lib/utils';
import materialIndentsApi, { IndentStatus } from '../lib/api/material-indents';
import {
  materialPurchasesApi,
  MaterialPurchaseStatus,
} from '../lib/api/materials-purchases';
import { branchesApi } from '../lib/api/branches';
import {
  Branch,
  MaterialIndent,
  PaginationMeta,
  MaterialPurchase,
  ApproveRejectMaterialIndentRequest,
  ReceiveMaterialPurchaseItemRequest,
} from '../lib/api/types';
import { toast } from '../hooks/use-toast';

export const MaterialOrderBookTab = () => {
  const { currentUser, hasPermission } = useRole();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterUnit, setFilterUnit] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'table'>('table');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);
  const [selectedRequestForStatus, setSelectedRequestForStatus] =
    useState<MaterialIndent | null>(null);
  const [isStatusManagerOpen, setIsStatusManagerOpen] = useState(false);
  const [selectedRequestForResubmit, setSelectedRequestForResubmit] =
    useState<MaterialIndent | null>(null);
  const [isResubmitFormOpen, setIsResubmitFormOpen] = useState(false);

  // New state for approval/rejection workflow
  const [selectedIndentForApproval, setSelectedIndentForApproval] =
    useState<MaterialIndent | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedQuotationId, setSelectedQuotationId] = useState<number | null>(
    null
  );

  // New state for material purchase workflow
  const [selectedIndentForOrder, setSelectedIndentForOrder] =
    useState<MaterialIndent | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<MaterialPurchase | null>(null);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [receiveData, setReceiveData] =
    useState<ReceiveMaterialPurchaseItemRequest>({
      receivedQuantity: 0,
      receivedDate: new Date().toISOString().split('T')[0],
      notes: '',
    });

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialIndents, setMaterialIndents] = useState<MaterialIndent[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 5, // Changed default to 5
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // Available branches
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Add this after line 293 (after the useRequestWorkflow hook)
  const [issuedMaterials, setIssuedMaterials] = useState<IssuedMaterial[]>([]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      setIsLoadingBranches(true);
      try {
        const response = await branchesApi.getAll({ limit: 100 });
        setAvailableBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load branches. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  // Fetch material indents
  const fetchMaterialIndents = useCallback(
    async (page = 1, limit = 5) => {
      // Changed default to 5
      setIsLoading(true);
      setError(null);

      try {
        const params: {
          page: number;
          limit: number;
          sortBy: string;
          sortOrder: 'ASC' | 'DESC';
          status?: string;
          branchId?: string;
        } = {
          page,
          limit,
          sortBy,
          sortOrder,
        };

        // Add status filter if not 'all' (for all roles including company owner)
        if (filterStatus !== 'all') {
          params.status = filterStatus;
        }

        // Add branch filter if not 'all'
        if (filterUnit !== 'all') {
          params.branchId = filterUnit;
        }

        const response = await materialIndentsApi.getAll(params);

        setPagination({
          page: response.meta.page,
          limit: response.meta.limit,
          itemCount: response.meta.itemCount,
          pageCount: response.meta.pageCount,
          hasPreviousPage: response.meta.hasPreviousPage,
          hasNextPage: response.meta.hasNextPage,
        });

        setMaterialIndents(response.data);
      } catch (error) {
        console.error('Error fetching material indents:', error);

        let errorMessage = 'Failed to load material indents. Please try again.';

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        // Check for Axios error response
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }

        setError(errorMessage);
        setMaterialIndents([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filterStatus, filterUnit, sortBy, sortOrder, currentUser?.role] // Added currentUser?.role to dependencies
  );

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Set new column and default to ASC
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  // Get sort icon for column
  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className='w-4 h-4 text-muted-foreground' />;
    }
    return sortOrder === 'ASC' ? (
      <ChevronUp className='w-4 h-4 text-primary' />
    ) : (
      <ChevronDown className='w-4 h-4 text-primary' />
    );
  };

  // Workflow management
  const {
    initializeRequest,
    updateRequestStatus,
    approveRequest,
    revertRequest,
    updateMaterialReceipt,
    getRequestWorkflow,
    canPerformAction,
  } = useRequestWorkflow();
  interface IssuedMaterial {
    id: string;
    materialId: string;
    materialName: string;
    specifications: string;
    MeasureUnit: string;
    existingStock: number;
    issuedQuantity: string;
    stockAfterIssue: number;
    recipientName: string;
    recipientId: string;
    recipientDesignation: string;
    department: string;
    machineId: string;
    machineName: string;
    purpose: string;
    issuingPersonName: string;
    issuingPersonDesignation: string;
    issuedBy: string;
    issuedDate: string;
    materialIssueFormSrNo: string;
    reqFormSrNo: string;
    indFormSrNo: string;
    status: string;
    type: string;
    timestamp: string;
    unit: string;
    unitName: string;
    [key: string]: unknown; // For other properties
  }



  // Fetch material indents when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMaterialIndents(pagination.page, pagination.limit);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    filterStatus,
    filterUnit,
    pagination.page,
    pagination.limit,
    fetchMaterialIndents,
  ]);

  // Legacy state for backward compatibility
  interface LegacyRequest {
    id: string;
    originalId: number;
    materialName: string;
    specifications: string;
    maker: string;
    quantity: string;
    unitPrice?: string;
    value: string;
    priority: string;
    materialPurpose: string;
    machineId: string;
    machineName: string;
    date: string;
    status: string;
    statusDescription: string;
    currentStage: string;
    progressStage: number;
    requestedBy: string;
    department?: string; // Make optional since some entries don't have it
    unit: string;
    unitName: string;
    approvedBy?: string;
    approvedDate?: string;
    additionalNotes?: string;
    rejectionReason?: string;
    [key: string]: unknown; // For other legacy fields
  }

  const [allRequests, setAllRequests] = useState<LegacyRequest[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case IndentStatus.DRAFT:
        return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-500 hover:text-white';
      case IndentStatus.PENDING_APPROVAL:
        return 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-500 hover:text-white';
      case IndentStatus.APPROVED:
        return 'bg-green-500 text-white border-green-600 hover:bg-green-500 hover:text-white';
      case IndentStatus.ORDERED:
        return 'bg-blue-500 text-white border-blue-600 hover:bg-blue-500 hover:text-white';
      case IndentStatus.PARTIALLY_RECEIVED:
        return 'bg-orange-500 text-white border-orange-600 hover:bg-orange-500 hover:text-white';
      case IndentStatus.FULLY_RECEIVED:
        return 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-500 hover:text-white';
      case IndentStatus.CLOSED:
        return 'bg-green-600 text-white border-green-700 hover:bg-green-600 hover:text-white';
      case IndentStatus.REJECTED:
        return 'bg-red-500 text-white border-red-600 hover:bg-red-500 hover:text-white';
      default:
        return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-500 hover:text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-secondary/100 text-white';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getProgressColor = (stage: number) => {
    switch (stage) {
      case 1: // DRAFT or PENDING_APPROVAL
        return 'bg-secondary/100';
      case 2: // APPROVED
        return 'bg-secondary/100';
      case 3: // ORDERED
        return 'bg-purple-500';
      case 4: // PARTIALLY_RECEIVED or FULLY_RECEIVED
        return 'bg-orange-500';
      case 5: // CLOSED
        return 'bg-primary';
      default:
        return 'bg-gray-300';
    }
  };

  const getProgressStage = (status: string): number => {
    switch (status) {
      case IndentStatus.DRAFT:
        return 1;
      case IndentStatus.PENDING_APPROVAL:
        return 1;
      case IndentStatus.APPROVED:
        return 2;
      case IndentStatus.ORDERED:
        return 3;
      case IndentStatus.PARTIALLY_RECEIVED:
        return 4;
      case IndentStatus.FULLY_RECEIVED:
        return 4;
      case IndentStatus.CLOSED:
        return 5;
      case IndentStatus.REJECTED:
        return 0;
      default:
        return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case IndentStatus.DRAFT:
        return <FileEdit className='w-4 h-4' />;
      case IndentStatus.PENDING_APPROVAL:
        return <Clock className='w-4 h-4' />;
      case IndentStatus.APPROVED:
        return <CheckCircle className='w-4 h-4' />;
      case IndentStatus.ORDERED:
        return <Package className='w-4 h-4' />;
      case IndentStatus.PARTIALLY_RECEIVED:
        return <Truck className='w-4 h-4' />;
      case IndentStatus.FULLY_RECEIVED:
        return <CheckSquare className='w-4 h-4' />;
      case IndentStatus.CLOSED:
        return <CheckSquare className='w-4 h-4' />;
      case IndentStatus.REJECTED:
        return <XCircle className='w-4 h-4' />;
      default:
        return <AlertTriangle className='w-4 h-4' />;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case IndentStatus.DRAFT:
        return 'Draft';
      case IndentStatus.PENDING_APPROVAL:
        return 'Pending Approval';
      case IndentStatus.APPROVED:
        return 'Approved';
      case IndentStatus.ORDERED:
        return 'Ordered';
      case IndentStatus.PARTIALLY_RECEIVED:
        return 'Partially Received';
      case IndentStatus.FULLY_RECEIVED:
        return 'Fully Received';
      case IndentStatus.CLOSED:
        return 'Closed';
      case IndentStatus.REJECTED:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const toggleRowExpansion = (requestId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(requestId)) {
      newExpandedRows.delete(requestId);
    } else {
      newExpandedRows.add(requestId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleMaterialIssue = (issueData: Record<string, unknown>) => {
    // Cast the issueData to IssuedMaterial to satisfy TypeScript
    setIssuedMaterials((prev) => [
      ...prev,
      issueData as unknown as IssuedMaterial,
    ]);
  };

  // Add missing functions
  const openStatusManager = (request: MaterialIndent | LegacyRequest) => {
    setSelectedRequestForStatus(request as MaterialIndent);
    setIsStatusManagerOpen(true);
  };

  const openResubmitForm = (request: MaterialIndent | LegacyRequest) => {
    setSelectedRequestForResubmit(request as MaterialIndent);
    setIsResubmitFormOpen(true);
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      // Call the API to update the status
      await materialIndentsApi.update(parseInt(requestId), { status: newStatus });
      
      // Refresh the data from API
      await fetchMaterialIndents(pagination.page, pagination.limit);
      
      toast({
        title: 'Success',
        description: 'Request status updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResubmitRequest = async (requestData: Record<string, unknown>) => {
    try {
      // Call the API to resubmit the request
      await materialIndentsApi.create(requestData);
      
      // Refresh the data from API
      await fetchMaterialIndents(pagination.page, pagination.limit);
      
      toast({
        title: 'Success',
        description: 'Request resubmitted successfully.',
      });
    } catch (error) {
      console.error('Failed to resubmit request:', error);
      toast({
        title: 'Error',
        description: 'Failed to resubmit request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // New function to handle approval
  const handleApproveIndent = async () => {
    if (!selectedIndentForApproval || !selectedItemId || !selectedQuotationId) {
      toast({
        title: 'Error',
        description: 'Please select an item and quotation to approve.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const approvalData: ApproveRejectMaterialIndentRequest = {
        status: 'approved',
        itemId: selectedItemId,
        quotationId: selectedQuotationId,
      };

      await materialIndentsApi.approve(
        selectedIndentForApproval.id,
        approvalData
      );

      toast({
        title: 'Success',
        description: 'Material indent approved successfully.',
      });

      setIsApprovalDialogOpen(false);
      setSelectedIndentForApproval(null);
      setSelectedItemId(null);
      setSelectedQuotationId(null);
      fetchMaterialIndents(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Error approving indent:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve material indent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // New function to handle rejection
  const handleRejectIndent = async () => {
    if (!selectedIndentForApproval || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await materialIndentsApi.reject(
        selectedIndentForApproval.id,
        rejectionReason
      );

      toast({
        title: 'Success',
        description: 'Material indent rejected successfully.',
      });

      setIsRejectionDialogOpen(false);
      setSelectedIndentForApproval(null);
      setRejectionReason('');
      fetchMaterialIndents(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Error rejecting indent:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject material indent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // New function to create material purchase order
  const handleCreatePurchaseOrder = async () => {
    if (!selectedIndentForOrder) {
      toast({
        title: 'Error',
        description: 'No indent selected for ordering.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create purchase order from approved indent
      const purchaseData = {
        purchaseOrderNumber: `PO-${selectedIndentForOrder.uniqueId}`,
        orderDate: new Date().toISOString().split('T')[0],
        totalValue: selectedIndentForOrder.items
          .reduce((total, item) => {
            const quotation = item.selectedQuotation || item.quotations[0];
            return (
              total +
              (quotation
                ? Number(quotation.quotationAmount) * item.requestedQuantity
                : 0)
            );
          }, 0)
          .toString(),
        additionalNotes: selectedIndentForOrder.additionalNotes || '',
        items: selectedIndentForOrder.items.map((item) => ({
          materialId: item.material.id,
          orderedQuantity: item.requestedQuantity,
          unitPrice:
            item.selectedQuotation?.quotationAmount ||
            item.quotations[0]?.quotationAmount ||
            '0',
          notes: item.notes || '',
        })),
      };

      await materialPurchasesApi.create({
        ...purchaseData,
        indentId: selectedIndentForOrder.id,
      });

      // Update indent status to ordered
      // Note: You might need to add an update status API call here

      toast({
        title: 'Success',
        description: 'Purchase order created successfully.',
      });

      setIsOrderDialogOpen(false);
      setSelectedIndentForOrder(null);
      fetchMaterialIndents(pagination.page, pagination.limit);
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
    if (
      !selectedPurchase ||
      !receiveData.receivedQuantity ||
      !receiveData.receivedDate
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // For now, we'll assume we're receiving the first item
      // In a real implementation, you'd select which item to receive
      const firstItem = selectedPurchase.items[0];
      if (!firstItem) {
        toast({
          title: 'Error',
          description: 'No items found in this purchase order.',
          variant: 'destructive',
        });
        return;
      }

      await materialPurchasesApi.receiveItem(
        selectedPurchase.id,
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
      fetchMaterialIndents(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Error receiving material:', error);
      toast({
        title: 'Error',
        description: 'Failed to receive material. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Helper function to format Purchase ID
  const formatPurchaseId = (uniqueId: string, branchCode?: string) => {
    // Convert to uppercase and keep numeric unit format (UNIT1, UNIT2, etc.)
    let formattedId = uniqueId.toUpperCase();

    // Remove any hyphens between UNIT and number
    formattedId = formattedId.replace(/UNIT-(\d+)/g, 'UNIT$1');

    return formattedId;
  };

  // Transform API data to UI format
  const transformApiIndentToUiFormat = (indent: MaterialIndent) => {
    // Get the first item for display purposes (if available)
    const firstItem =
      indent.items && indent.items.length > 0 ? indent.items[0] : null;
    const firstQuotation =
      firstItem?.selectedQuotation ||
      (firstItem?.quotations && firstItem.quotations.length > 0
        ? firstItem.quotations[0]
        : null);

    // Only show price and value for fully_received or partially_received status
    const shouldShowPrice = 
      indent.status === IndentStatus.FULLY_RECEIVED || 
      indent.status === IndentStatus.PARTIALLY_RECEIVED;

    return {
      id: formatPurchaseId(indent.uniqueId, indent.branch?.code),
      originalId: indent.id,
      materialName: firstItem?.material.name || 'N/A',
      specifications:
        firstItem?.specifications || firstItem?.material.specifications || '',
      maker: firstItem?.material.makerBrand || 'N/A',
      quantity: firstItem ? `${firstItem.requestedQuantity} units` : '0',
      unitPrice: shouldShowPrice && firstQuotation ? `₹${firstQuotation.quotationAmount}` : '',
      value: shouldShowPrice && firstQuotation
        ? `₹${
            Number(firstQuotation.quotationAmount) *
            (firstItem?.requestedQuantity || 0)
          }`
        : '',
      priority: 'medium', // Not available in API, using default
      materialPurpose: firstItem?.notes || indent.additionalNotes || '',
      machineId: firstItem?.machine?.id.toString() || 'N/A',
      machineName: firstItem?.machine?.name || 'N/A',
      date: formatDateToDDMMYYYY(indent.requestDate),
      status: indent.status,
      statusDescription: `${getStatusLabel(indent.status)} - ${
        indent.additionalNotes || ''
      }`,
      currentStage: getStatusLabel(indent.status),
      progressStage: getProgressStage(indent.status),
      requestedBy: indent.requestedBy?.name || 'Unknown',
      department: 'Production', // Not available in API, using default
      unit: indent.branch?.code || '',
      unitName: indent.branch?.name || '',
      approvedBy: indent.approvedBy?.name,
      approvedDate: indent.approvalDate
        ? formatDateToDDMMYYYY(indent.approvalDate)
        : undefined,
      additionalNotes: indent.additionalNotes,
      rejectionReason: indent.rejectionReason,
      // Include the original data for reference
      originalIndent: indent,
    };
  };

  // Client-side filtering for search
  const filterIndents = (indents: MaterialIndent[]) => {
    if (!searchTerm) return indents;

    return indents.filter((indent) => {
      // Search in indent uniqueId
      if (indent.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }

      // Search in items
      return indent.items.some((item) => {
        return (
          item.material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.material.makerBrand
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  };

  // Get filtered and transformed indents for UI
  const getFilteredIndents = () => {
    const filteredData = filterIndents(materialIndents);
    return filteredData.map(transformApiIndentToUiFormat);
  };

  const filteredRequests = getFilteredIndents();

  // Get last 5 approved requests for Company Owner
  const getApprovedHistory = () => {
    if (currentUser?.role !== 'company_owner') return [];

    return allRequests
      .filter((req) => req.status === 'approved')
      .slice(0, 5)
      .map((req) => ({
        id: req.id,
        date: req.date,
        materialName: req.materialName,
        quantity: req.quantity,
        purchaseValue: req.value,
        previousMaterialValue: '₹0', // Default value
        perMeasureQuantity: '1', // Default value
        requestedValue: req.value,
        currentValue: req.value,
        requestedBy: req.requestedBy,
        status: req.status,
      }));
  };

  // Navigation handler for request details
  const handleRequestClick = (requestId: string) => {
    // URL encode the requestId to handle special characters like '/'
    const encodedRequestId = encodeURIComponent(requestId);
    navigate(`/request-details/${encodedRequestId}`);
  };

  const pendingRequests = filteredRequests.filter(
    (req) => req.status === 'pending_approval'
  );
  const approvedRequests = filteredRequests.filter(
    (req) =>
      req.status === 'approved' ||
      req.status === 'ordered' ||
      req.status === 'issued' ||
      req.status === 'completed'
  );
  const rejectedRequests = filteredRequests.filter(
    (req) => req.status === 'rejected'
  );

  // SSRFM Progress Bar: Submit → Approved → Ordered → Received → Complete
  const ProgressBar = ({ stage }: { stage: number }) => {
    const stages = ['Submit', 'Approved', 'Ordered', 'Received', 'Complete'];
    return (
      <div className='my-3'>
        {/* Desktop Progress Bar */}
        <div className='hidden sm:flex items-center space-x-2'>
          {stages.map((stageName, index) => (
            <div key={index} className='flex items-center'>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                  index < stage ? getProgressColor(index + 1) : 'bg-gray-300'
                }`}
              >
                {index + 1}
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 rounded-full ${
                    index < stage - 1
                      ? getProgressColor(index + 1)
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile Progress Bar - Vertical */}
        <div className='sm:hidden space-y-2'>
          {stages.map((stageName, index) => (
            <div key={index} className='flex items-center space-x-3'>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                  index < stage ? getProgressColor(index + 1) : 'bg-gray-300'
                }`}
              >
                {index + 1}
              </div>
              <div className='flex-1'>
                <span
                  className={`text-xs font-medium ${
                    index < stage ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {stageName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced List View Component - Table-like format with expandable details
  const ListView = ({ requests }: { requests: any[] }) => (
    <Card className='rounded-lg shadow-sm'>
      <CardContent className='p-0'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                <TableHead className='w-12 text-foreground font-semibold'></TableHead>
                <TableHead
                  className='min-w-[120px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('uniqueId')}
                >
                  <div className='flex items-center gap-2'>
                    Purchase ID
                    {getSortIcon('uniqueId')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[150px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('materialName')}
                >
                  <div className='flex items-center gap-2'>
                    Materials
                    {getSortIcon('materialName')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('quantity')}
                >
                  <div className='flex items-center gap-2'>
                    Quantity
                    {getSortIcon('quantity')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('unitPrice')}
                >
                  <div className='flex items-center gap-2'>
                    Price
                    {getSortIcon('unitPrice')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('value')}
                >
                  <div className='flex items-center gap-2'>
                    Total Value
                    {getSortIcon('value')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('status')}
                >
                  <div className='flex items-center gap-2'>
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('requestDate')}
                >
                  <div className='flex items-center gap-2'>
                    Purchased Date
                    {getSortIcon('requestDate')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('machineName')}
                >
                  <div className='flex items-center gap-2'>
                    Purchased For
                    {getSortIcon('machineName')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <>
                  <TableRow
                    key={request.id}
                    className='hover:bg-muted/30 border-b border-secondary/20'
                  >
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0 rounded-lg'
                        onClick={() => toggleRowExpansion(request.id)}
                      >
                        {expandedRows.has(request.id) ? (
                          <ChevronDown className='w-4 h-4' />
                        ) : (
                          <ChevronRight className='w-4 h-4' />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className='font-medium'>
                      <Button
                        variant='link'
                        className='p-0 h-auto font-medium text-primary hover:underline'
                        onClick={() => handleRequestClick(request.id)}
                      >
                        {request.id}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>
                        {request.materialName}
                      </div>
                    </TableCell>
                    <TableCell className='text-sm'>
                      {request.quantity}
                    </TableCell>
                    <TableCell className='text-sm font-medium'>
                      {request.unitPrice || '-'}
                    </TableCell>
                    <TableCell className='text-sm font-medium'>
                      {request.value || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(request.status)} border`}
                      >
                        <span className='flex items-center gap-1'>
                          {getStatusIcon(request.status)}
                          <span className='text-xs'>
                            {request.currentStage}
                          </span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm'>{request.date}</TableCell>
                    <TableCell className='text-sm'>
                      {request.machineName}
                    </TableCell>
                  </TableRow>

                  {/* Expanded Detail Row */}
                  {expandedRows.has(request.id) && (
                    <TableRow>
                      <TableCell colSpan={9} className='p-0'>
                        <div className='bg-muted/30 p-6 border-t'>
                          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            {/* Left Column - Request Details */}
                            <div className='space-y-4'>
                              <div>
                                <h3 className='font-semibold text-lg mb-3'>
                                  Request Details
                                </h3>
                                <div className='space-y-3'>
                                  <div className='grid grid-cols-2 gap-4 text-sm'>
                                    <div>
                                      <span className='font-medium text-muted-foreground'>
                                        Purchase ID:
                                      </span>
                                      <div className='font-medium'>
                                        {request.id}
                                      </div>
                                    </div>
                                    <div>
                                      <span className='font-medium text-muted-foreground'>
                                        Quantity:
                                      </span>
                                      <div className='font-medium'>
                                        {request.quantity}
                                      </div>
                                    </div>
                                    <div>
                                      <span className='font-medium text-muted-foreground'>
                                        Total Value:
                                      </span>
                                      <div className='font-medium'>
                                        {request.value}
                                      </div>
                                    </div>
                                    <div>
                                      <span className='font-medium text-muted-foreground'>
                                        Purchased For:
                                      </span>
                                      <div className='font-medium'>
                                        {request.machineId}
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <span className='font-medium text-muted-foreground'>
                                      Specifications:
                                    </span>
                                    <div className='text-sm mt-1 p-3 bg-background rounded border'>
                                      {request.specifications}
                                    </div>
                                  </div>

                                  <div>
                                    <span className='font-medium text-muted-foreground'>
                                      Purpose:
                                    </span>
                                    <div className='text-sm mt-1'>
                                      {request.materialPurpose}
                                    </div>
                                  </div>

                                  {request.additionalNotes && (
                                    <div>
                                      <span className='font-medium text-muted-foreground'>
                                        Additional Notes:
                                      </span>
                                      <div className='text-sm mt-1 p-3 bg-background rounded border'>
                                        {request.additionalNotes}
                                      </div>
                                    </div>
                                  )}

                                  {/* Vendor Quotations Section - Only for Company Owners and Pending Approval */}
                                  {currentUser?.role === 'company_owner' && 
                                   request.status === 'pending_approval' && 
                                   request.originalIndent?.items && (
                                    <div>
                                      <span className='font-medium text-muted-foreground'>
                                        Vendor Quotations:
                                      </span>
                                      <div className='mt-2 space-y-3'>
                                        {request.originalIndent.items.map((item) => (
                                          <div key={item.id} className='p-3 bg-background rounded border'>
                                            <div className='font-medium text-sm mb-2'>
                                              {item.material.name} - Qty: {item.requestedQuantity}
                                            </div>
                                            {item.quotations && item.quotations.length > 0 ? (
                                              <div className='space-y-2'>
                                                {item.quotations.map((quotation) => (
                                                  <div 
                                                    key={quotation.id} 
                                                    className={`p-2 rounded border cursor-pointer transition-colors ${
                                                      item.selectedQuotation?.id === quotation.id
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                                    onClick={() => {
                                                      // Update the selected quotation for this item
                                                      const updatedIndent = {
                                                        ...request.originalIndent,
                                                        items: request.originalIndent.items.map(i => 
                                                          i.id === item.id 
                                                            ? { ...i, selectedQuotation: quotation }
                                                            : i
                                                        )
                                                      };
                                                      setSelectedIndentForApproval(updatedIndent);
                                                    }}
                                                  >
                                                    <div className='flex items-center justify-between'>
                                                      <div>
                                                        <div className='font-medium text-sm'>
                                                          {quotation.vendorName}
                                                        </div>
                                                        <div className='text-xs text-muted-foreground'>
                                                          {quotation.contactPerson && `Contact: ${quotation.contactPerson}`}
                                                        </div>
                                                      </div>
                                                      <div className='text-right'>
                                                        <div className='font-bold text-primary'>
                                                          ₹{quotation.quotationAmount}
                                                        </div>
                                                        <div className='text-xs text-muted-foreground'>
                                                          per unit
                                                        </div>
                                                      </div>
                                                    </div>
                                                    {item.selectedQuotation?.id === quotation.id && (
                                                      <div className='mt-1 flex items-center gap-1 text-green-600'>
                                                        <CheckCircle className='w-3 h-3' />
                                                        <span className='text-xs'>Selected</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className='text-center py-4 text-muted-foreground'>
                                                <FileText className='w-6 h-6 mx-auto mb-2 opacity-50' />
                                                <div className='text-xs'>No quotations available</div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Column - Status & Progress */}
                            <div className='space-y-4'>
                              <div>
                                <h3 className='font-semibold text-lg mb-3'>
                                  Status & Progress
                                </h3>

                                {/* Progress Bar */}
                                <ProgressBar stage={request.progressStage} />

                                {/* Status Information */}
                                <div className='space-y-3'>
                                  <div className='p-3 bg-background rounded border'>
                                    <div className='text-sm font-medium mb-2'>
                                      Current Status
                                    </div>
                                    <div className='text-sm text-muted-foreground'>
                                      {request.statusDescription}
                                    </div>
                                  </div>

                                  {/* Status-specific information */}
                                  {request.status === 'approved' && (
                                    <div className='bg-secondary/10 border border-secondary rounded-lg p-3'>
                                      <div className='text-sm'>
                                        <strong className='text-foreground'>
                                          Approved:
                                        </strong>{' '}
                                        {request.approvedBy} on{' '}
                                        {request.approvedDate}
                                      </div>
                                      <div className='text-xs text-foreground mt-1'>
                                        Ready for procurement
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'ordered' && (
                                    <div className='bg-purple-50 border border-purple-200 rounded-lg p-3'>
                                      <div className='text-sm space-y-1'>
                                        <div>
                                          <strong className='text-purple-800'>
                                            Ordered:
                                          </strong>{' '}
                                          {request.orderedDate}
                                        </div>
                                        <div>
                                          <strong className='text-purple-800'>
                                            Supplier:
                                          </strong>{' '}
                                          {request.supplierName}
                                        </div>
                                        <div>
                                          <strong className='text-purple-800'>
                                            Expected Delivery:
                                          </strong>{' '}
                                          {request.expectedDelivery}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'partially_received' && (
                                    <div className='bg-orange-50 border border-orange-200 rounded-lg p-3'>
                                      <div className='text-sm space-y-1'>
                                        <div>
                                          <strong className='text-orange-800'>
                                            Partially Received:
                                          </strong>{' '}
                                          {request.receivedDate}
                                        </div>
                                        <div>
                                          <strong className='text-orange-800'>
                                            Received Quantity:
                                          </strong>{' '}
                                          {request.purchasedQuantity} of{' '}
                                          {request.quantity}
                                        </div>
                                        <div>
                                          <strong className='text-orange-800'>
                                            Supplier:
                                          </strong>{' '}
                                          {request.purchasedFrom}
                                        </div>
                                        <div>
                                          <strong className='text-orange-800'>
                                            Invoice:
                                          </strong>{' '}
                                          {request.invoiceNumber}
                                        </div>
                                        {request.notes && (
                                          <div>
                                            <strong className='text-orange-800'>
                                              Notes:
                                            </strong>{' '}
                                            {request.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'material_received' && (
                                    <div className='bg-primary/5 border border-primary/20 rounded-lg p-3'>
                                      <div className='text-sm space-y-1'>
                                        <div>
                                          <strong className='text-primary'>
                                            Received:
                                          </strong>{' '}
                                          {request.receivedDate}
                                        </div>
                                        <div>
                                          <strong className='text-primary'>
                                            Quantity:
                                          </strong>{' '}
                                          {request.purchasedQuantity}{' '}
                                          {request.quantity
                                            .split(' ')
                                            .slice(1)
                                            .join(' ')}
                                        </div>
                                        <div>
                                          <strong className='text-primary'>
                                            Total Cost:
                                          </strong>{' '}
                                          ₹{request.purchasedPrice}
                                        </div>
                                        <div>
                                          <strong className='text-primary'>
                                            Supplier:
                                          </strong>{' '}
                                          {request.purchasedFrom}
                                        </div>
                                        <div>
                                          <strong className='text-primary'>
                                            Quality Check:
                                          </strong>{' '}
                                          {request.qualityCheck}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'issued' && (
                                    <div className='bg-orange-50 border border-orange-200 rounded-lg p-3'>
                                      <div className='text-sm space-y-1'>
                                        <div>
                                          <strong className='text-orange-800'>
                                            Issued:
                                          </strong>{' '}
                                          {request.issuedDate}
                                        </div>
                                        <div>
                                          <strong className='text-orange-800'>
                                            Received By:
                                          </strong>{' '}
                                          {request.receivedBy}
                                        </div>
                                        <div>
                                          <strong className='text-orange-800'>
                                            Delivered:
                                          </strong>{' '}
                                          {request.deliveredDate}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'completed' && (
                                    <div className='bg-secondary/10 border border-secondary rounded-lg p-3'>
                                      <div className='text-sm space-y-1'>
                                        <div>
                                          <strong className='text-foreground'>
                                            Completed:
                                          </strong>{' '}
                                          {request.completedDate}
                                        </div>
                                        <div>
                                          <strong className='text-foreground'>
                                            Received By:
                                          </strong>{' '}
                                          {request.receivedBy}
                                        </div>
                                        {request.completionNotes && (
                                          <div>
                                            <strong className='text-foreground'>
                                              Notes:
                                            </strong>{' '}
                                            {request.completionNotes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'rejected' && (
                                    <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                                      <div className='flex items-start gap-2'>
                                        <AlertTriangle className='w-4 h-4 text-red-600 mt-0.5 flex-shrink-0' />
                                        <div className='min-w-0'>
                                          <strong className='text-red-800 text-sm'>
                                            Rejected:
                                          </strong>
                                          <p className='text-red-700 text-sm mt-1 break-words'>
                                            {request.reason}
                                          </p>
                                          <p className='text-red-600 text-xs mt-2'>
                                            Rejected by {request.rejectedBy} on{' '}
                                            {request.rejectedDate}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'reverted' && (
                                    <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                                      <div className='flex items-start gap-2'>
                                        <XCircle className='w-4 h-4 text-red-600 mt-0.5 flex-shrink-0' />
                                        <div className='min-w-0'>
                                          <strong className='text-red-800 text-sm'>
                                            Reverted:
                                          </strong>
                                          <p className='text-red-700 text-sm mt-1 break-words'>
                                            {request.revertReason}
                                          </p>
                                          <p className='text-red-600 text-xs mt-2'>
                                            Reverted by {request.revertedBy} on{' '}
                                            {request.revertedDate}
                                          </p>
                                          <p className='text-red-600 text-xs mt-1'>
                                            Indent form must be resubmitted with
                                            corrections.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex gap-3 pt-4 border-t mt-6'>
                            <Button
                              variant='outline'
                              className='gap-2 rounded-lg'
                            >
                              <Eye className='w-4 h-4' />
                              View Full Details
                            </Button>

                            {/* Status Management Button */}
                            {(hasPermission(
                              'inventory:material-indents:approve'
                            ) ||
                              hasPermission(
                                'inventory:material-indents:update'
                              )) && (
                              <Button
                                variant='outline'
                                className='gap-2 rounded-lg'
                                onClick={() => openStatusManager(request)}
                              >
                                <CheckSquare className='w-4 h-4' />
                                Manage Status
                              </Button>
                            )}

                            {(request.status === 'rejected' ||
                              request.status === 'reverted') && (
                              <Button
                                variant='outline'
                                className='gap-2 rounded-lg'
                                onClick={() =>
                                  request.status === 'reverted'
                                    ? openResubmitForm(request)
                                    : null
                                }
                              >
                                <Plus className='w-4 h-4' />
                                {request.status === 'reverted'
                                  ? 'Resubmit Indent Form'
                                  : 'Resubmit Request'}
                              </Button>
                            )}
                            {(request.status === 'ordered' ||
                              request.status === 'issued' ||
                              request.status === 'completed') && (
                              <Button
                                variant='outline'
                                className='gap-2 rounded-lg'
                              >
                                <FileText className='w-4 h-4' />
                                Track Status
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  // Compact Table View Component
  const TableView = ({ requests }: { requests: any[] }) => (
    <Card className='rounded-lg shadow-sm'>
      <CardContent className='p-0'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                <TableHead
                  className='min-w-[120px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('uniqueId')}
                >
                  <div className='flex items-center gap-2'>
                    Purchase ID
                    {getSortIcon('uniqueId')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[150px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('materialName')}
                >
                  <div className='flex items-center gap-2'>
                    Materials
                    {getSortIcon('materialName')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('quantity')}
                >
                  <div className='flex items-center gap-2'>
                    Quantity
                    {getSortIcon('quantity')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('unitPrice')}
                >
                  <div className='flex items-center gap-2'>
                    Price
                    {getSortIcon('unitPrice')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('value')}
                >
                  <div className='flex items-center gap-2'>
                    Total Value
                    {getSortIcon('value')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('status')}
                >
                  <div className='flex items-center gap-2'>
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('requestDate')}
                >
                  <div className='flex items-center gap-2'>
                    Purchased Date
                    {getSortIcon('requestDate')}
                  </div>
                </TableHead>
                <TableHead
                  className='min-w-[100px] text-foreground font-semibold cursor-pointer hover:bg-secondary/30'
                  onClick={() => handleSort('machineName')}
                >
                  <div className='flex items-center gap-2'>
                    Purchased For
                    {getSortIcon('machineName')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow
                  key={request.id}
                  className='hover:bg-muted/30 border-b border-secondary/20'
                >
                  <TableCell className='font-medium'>
                    <Button
                      variant='link'
                      className='p-0 h-auto font-medium text-primary hover:underline'
                      onClick={() => handleRequestClick(request.originalId)}
                    >
                      {request.id}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className='font-medium'>{request.materialName}</div>
                  </TableCell>
                  <TableCell className='text-sm'>{request.quantity}</TableCell>
                  <TableCell className='text-sm font-medium'>
                    {request.unitPrice || '-'}
                  </TableCell>
                  <TableCell className='text-sm font-medium'>
                    {request.value || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(request.status)} border`}
                    >
                      <span className='flex items-center gap-1'>
                        {getStatusIcon(request.status)}
                        <span className='text-xs'>{request.currentStage}</span>
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className='text-sm'>{request.date}</TableCell>
                  <TableCell className='text-sm'>
                    {request.machineName}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  // Add pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchMaterialIndents(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    fetchMaterialIndents(1, newLimit);
  };

  // Enhanced action buttons in the expanded detail row
  const renderActionButtons = (request: any) => {
    const canApprove =
      hasPermission('inventory:material-indents:approve') &&
      request.status === 'pending_approval';
    const canReject =
      hasPermission('inventory:material-indents:approve') &&
      request.status === 'pending_approval';
    const canOrder =
      hasPermission('inventory:material-indents:update') &&
      request.status === 'approved';
    const canReceive =
      hasPermission('inventory:material-purchases:receive') &&
      (request.status === 'ordered' || request.status === 'partially_received');

    return (
      <div className='flex flex-wrap gap-2 pt-4 border-t mt-6'>
        <Button
          variant='outline'
          className='gap-2 rounded-lg'
          onClick={() => handleRequestClick(request.id)}
        >
          <Eye className='w-4 h-4' />
          View Full Details
        </Button>

        {canApprove && (
          <Button
            variant='outline'
            className={`gap-2 rounded-lg ${
              // Check if all items have selected quotations
              request.originalIndent?.items?.every(item => item.selectedQuotation)
                ? 'text-green-600 border-green-600 hover:bg-green-50'
                : 'text-gray-400 border-gray-300 cursor-not-allowed'
            }`}
            disabled={!request.originalIndent?.items?.every(item => item.selectedQuotation)}
            onClick={() => {
              setSelectedIndentForApproval(request.originalIndent);
              setIsApprovalDialogOpen(true);
            }}
          >
            <CheckCircle className='w-4 h-4' />
            {request.originalIndent?.items?.every(item => item.selectedQuotation) 
              ? 'Approve' 
              : 'Select Vendor to Approve'
            }
          </Button>
        )}

        {canReject && (
          <Button
            variant='outline'
            className='gap-2 rounded-lg text-red-600 border-red-600 hover:bg-red-50'
            onClick={() => {
              setSelectedIndentForApproval(request.originalIndent);
              setIsRejectionDialogOpen(true);
            }}
          >
            <XCircle className='w-4 h-4' />
            Reject
          </Button>
        )}

        {canOrder && (
          <Button
            variant='outline'
            className='gap-2 rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50'
            onClick={() => {
              setSelectedIndentForOrder(request.originalIndent);
              setIsOrderDialogOpen(true);
            }}
          >
            <ShoppingCart className='w-4 h-4' />
            Create Order
          </Button>
        )}

        {canReceive && (
          <Button
            variant='outline'
            className='gap-2 rounded-lg text-orange-600 border-orange-600 hover:bg-orange-50'
            onClick={() => {
              // In a real implementation, you'd fetch the purchase order
              // For now, we'll create a mock purchase object
              setSelectedPurchase({
                id: 1,
                uniqueId: request.id,
                orderDate: request.date,
                totalValue: request.value,
                purchaseOrderNumber: `PO-${request.id}`,
                status: 'pending',
                additionalNotes: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                items: [
                  {
                    id: 1,
                    materialId: 1,
                    materialName: request.materialName,
                    specifications: request.specifications,
                    orderedQuantity: parseInt(request.quantity),
                    receivedQuantity: 0,
                    pendingQuantity: parseInt(request.quantity),
                    unitPrice: request.unitPrice,
                    totalPrice: request.value,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    material: {
                      id: 1,
                      name: request.materialName,
                      specifications: request.specifications,
                      makerBrand: request.maker,
                      currentStock: 0,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  },
                ],
                branch: {
                  id: 1,
                  name: request.unitName,
                  location: '',
                  contactPhone: null,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                createdBy: {
                  id: 1,
                  name: request.requestedBy,
                  email: '',
                  company: {} as any,
                  branch: {} as any,
                  userType: {} as any,
                  roles: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              });
              setIsReceiveDialogOpen(true);
            }}
          >
            <Package className='w-4 h-4' />
            Receive Material
          </Button>
        )}

        {/* Status Management Button */}
        {(hasPermission('inventory:material-indents:approve') ||
          hasPermission('inventory:material-indents:update')) && (
          <Button
            variant='outline'
            className='gap-2 rounded-lg'
            onClick={() => openStatusManager(request)}
          >
            <CheckSquare className='w-4 h-4' />
            Manage Status
          </Button>
        )}

        {(request.status === 'rejected' || request.status === 'reverted') && (
          <Button
            variant='outline'
            className='gap-2 rounded-lg'
            onClick={() =>
              request.status === 'reverted' ? openResubmitForm(request) : null
            }
          >
            <Plus className='w-4 h-4' />
            {request.status === 'reverted'
              ? 'Resubmit Indent Form'
              : 'Resubmit Request'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-6 p-4 sm:p-0'>
      {/* Main Heading */}

      {/* Search, Views, Status and Actions Row */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
        <div className='flex items-center gap-4'>
          {/* List/Table Toggle */}
          <div className='flex rounded-lg border border-secondary overflow-hidden bg-secondary/10 w-fit shadow-sm'>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
              className={`rounded-none px-3 sm:px-4 ${
                viewMode === 'list'
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'text-foreground hover:text-foreground hover:bg-secondary/20'
              }`}
            >
              <List className='w-4 h-4' />
              <span className='ml-1 sm:ml-2 text-xs sm:text-sm'>List</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('table')}
              className={`rounded-none px-3 sm:px-4 ${
                viewMode === 'table'
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'text-foreground hover:text-foreground hover:bg-secondary/20'
              }`}
            >
              <TableIcon className='w-4 h-4' />
              <span className='ml-1 sm:ml-2 text-xs sm:text-sm'>Table</span>
            </Button>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3 lg:flex-1 lg:max-w-4xl lg:justify-end'>
          {/* Search Bar */}
          <div className='flex-1 lg:max-w-md'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/80 w-4 h-4' />
              <Input
                placeholder='Search by materials, purchase ID, or maker...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 rounded-lg border-secondary focus:border-secondary focus:ring-0 outline-none'
              />
            </div>
          </div>

          {/* Unit Filter - Only for company owners */}
          {currentUser?.role === 'company_owner' && (
            <Select
              value={filterUnit}
              onValueChange={setFilterUnit}
              disabled={isLoadingBranches}
            >
              <SelectTrigger className='w-full sm:w-48 rounded-lg border-secondary focus:border-secondary focus:ring-0'>
                <SelectValue placeholder='Select Unit'>
                  {isLoadingBranches ? 'Loading...' : 'Select Unit'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Units</SelectItem>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    <div className='flex items-center gap-2'>
                      <Building2 className='w-4 h-4' />
                      <div>
                        <div className='font-medium'>{branch.name}</div>
                        <div className='text-xs text-muted-foreground'>
                          {branch.location}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Status Filter - Show all statuses for all roles */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className='w-full sm:w-48 rounded-lg border-secondary focus:border-secondary focus:ring-0'>
              <SelectValue placeholder='All Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value={IndentStatus.DRAFT}>Draft</SelectItem>
              <SelectItem value={IndentStatus.PENDING_APPROVAL}>
                Pending Approval
              </SelectItem>
              <SelectItem value={IndentStatus.APPROVED}>Approved</SelectItem>
              <SelectItem value={IndentStatus.REVERTED}>Reverted</SelectItem>
              <SelectItem value={IndentStatus.ORDERED}>Ordered</SelectItem>
              <SelectItem value={IndentStatus.PARTIALLY_RECEIVED}>
                Partially Received
              </SelectItem>
              <SelectItem value={IndentStatus.FULLY_RECEIVED}>
                Fully Received
              </SelectItem>
              <SelectItem value={IndentStatus.CLOSED}>Closed</SelectItem>
              <SelectItem value={IndentStatus.REJECTED}>Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <div className='flex gap-2'>
            <Button
              asChild
              className='w-full sm:w-auto text-sm sm:text-base'
              size='sm'
            >
              <Link to='/materials-inventory/material-request'>
                <Plus className='w-4 h-4' />
                <span className='hidden sm:inline'>INDENT FORM</span>
                <span className='sm:hidden'>INDENT FORM</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='order-status' className='w-full'>
        {/* All Requests Tab */}
        <TabsContent value='all' className='space-y-3 sm:space-y-4'>
          {viewMode === 'table' ? (
            <TableView requests={filteredRequests} />
          ) : (
            <ListView requests={filteredRequests} />
          )}
        </TabsContent>

        {/* Order Request Status Tab */}
        <TabsContent value='order-status' className='space-y-3 sm:space-y-4'>
          {/* Loading State */}
          {isLoading ? (
            <Card className='rounded-lg shadow-sm p-8 text-center'>
              <Loader2 className='w-12 h-12 text-primary mx-auto mb-4 animate-spin' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                Loading Material Indents
              </h3>
              <p className='text-muted-foreground mb-4'>
                Please wait while we fetch the data...
              </p>
            </Card>
          ) : error ? (
            <Card className='rounded-lg shadow-sm p-8 text-center'>
              <AlertTriangle className='w-12 h-12 text-red-500 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                Error Loading Data
              </h3>
              <p className='text-muted-foreground mb-4'>{error}</p>
              <Button variant='outline' onClick={() => fetchMaterialIndents()}>
                <AlertTriangle className='w-4 h-4 mr-2' />
                Try Again
              </Button>
            </Card>
          ) : filteredRequests.length > 0 ? (
            <>
              {viewMode === 'table' ? (
                <TableView requests={filteredRequests} />
              ) : (
                <ListView requests={filteredRequests} />
              )}

              {/* Pagination Controls */}
              <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
                {/* Page Info */}
                <div className='text-sm text-muted-foreground'>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.itemCount
                  )}{' '}
                  of {pagination.itemCount} entries
                </div>

                {/* Pagination Controls */}
                <div className='flex items-center gap-2'>
                  {/* Items per page selector */}
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>Show:</span>
                    <Select
                      value={pagination.limit.toString()}
                      onValueChange={(value) =>
                        handleLimitChange(parseInt(value))
                      }
                    >
                      <SelectTrigger className='w-20 h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='5'>5</SelectItem>
                        <SelectItem value='10'>10</SelectItem>
                        <SelectItem value='20'>20</SelectItem>
                        <SelectItem value='50'>50</SelectItem>
                        <SelectItem value='100'>100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className='text-sm text-muted-foreground'>
                      per page
                    </span>
                  </div>

                  {/* Page navigation */}
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(1)}
                      disabled={
                        !pagination.hasPreviousPage || pagination.page === 1
                      }
                      className='h-8 w-8 p-0'
                    >
                      <ChevronsLeft className='w-4 h-4' />
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className='h-8 w-8 p-0'
                    >
                      <ChevronLeft className='w-4 h-4' />
                    </Button>

                    {/* Page numbers */}
                    <div className='flex items-center gap-1 mx-2'>
                      {Array.from(
                        { length: Math.min(5, pagination.pageCount) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.pageCount <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (
                            pagination.page >=
                            pagination.pageCount - 2
                          ) {
                            pageNum = pagination.pageCount - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pagination.page === pageNum
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={() => handlePageChange(pageNum)}
                              className='h-8 w-8 p-0'
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className='h-8 w-8 p-0'
                    >
                      <ChevronRight className='w-4 h-4' />
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(pagination.pageCount)}
                      disabled={
                        !pagination.hasNextPage ||
                        pagination.page === pagination.pageCount
                      }
                      className='h-8 w-8 p-0'
                    >
                      <ChevronsRight className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Card className='rounded-lg shadow-sm p-8 text-center'>
              <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                No Material Indents Found
              </h3>
              <p className='text-muted-foreground mb-4'>
                No material indents match your current filters.
              </p>
              
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Material Issue Form */}
      <MaterialIssueForm
        isOpen={isIssueFormOpen}
        onClose={() => setIsIssueFormOpen(false)}
        onSubmit={(data) =>
          handleMaterialIssue(data as unknown as Record<string, unknown>)
        }
      />

      {/* Request Status Manager */}
      {selectedRequestForStatus && (
        <RequestStatusManager
          request={selectedRequestForStatus}
          onStatusUpdate={handleStatusUpdate}
          isOpen={isStatusManagerOpen}
          onClose={() => {
            setIsStatusManagerOpen(false);
            setSelectedRequestForStatus(null);
          }}
        />
      )}

      {/* Resubmit Form */}
      {selectedRequestForResubmit && (
        <ResubmitForm
          request={selectedRequestForResubmit}
          isOpen={isResubmitFormOpen}
          onClose={() => {
            setIsResubmitFormOpen(false);
            setSelectedRequestForResubmit(null);
          }}
          onSubmit={handleResubmitRequest}
        />
      )}

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
            {selectedIndentForApproval && (
              <div className='space-y-4'>
                <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <h3 className='font-semibold text-green-800 mb-2'>
                    Indent Details
                  </h3>
                  <p>
                    <strong>ID:</strong> {selectedIndentForApproval.uniqueId}
                  </p>
                  <p>
                    <strong>Requested By:</strong>{' '}
                    {selectedIndentForApproval.requestedBy?.name}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {formatDateToDDMMYYYY(selectedIndentForApproval.requestDate)}
                  </p>
                </div>

                <div className='space-y-3'>
                  <Label>Select Item to Approve</Label>
                  <Select
                    onValueChange={(value) =>
                      setSelectedItemId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select an item' />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedIndentForApproval.items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.material.name} - Qty: {item.requestedQuantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedItemId && (
                  <div className='space-y-3'>
                    <Label>Select Quotation</Label>
                    <Select
                      onValueChange={(value) =>
                        setSelectedQuotationId(parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a quotation' />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedIndentForApproval.items
                          .find((item) => item.id === selectedItemId)
                          ?.quotations.map((quotation) => (
                            <SelectItem
                              key={quotation.id}
                              value={quotation.id.toString()}
                            >
                              {quotation.vendorName} - ₹
                              {quotation.quotationAmount}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsApprovalDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApproveIndent}
                    disabled={!selectedItemId || !selectedQuotationId}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <CheckCircle className='w-4 h-4 mr-2' />
                    Approve
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
            {selectedIndentForApproval && (
              <div className='space-y-4'>
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <h3 className='font-semibold text-red-800 mb-2'>
                    Indent Details
                  </h3>
                  <p>
                    <strong>ID:</strong> {selectedIndentForApproval.uniqueId}
                  </p>
                  <p>
                    <strong>Requested By:</strong>{' '}
                    {selectedIndentForApproval.requestedBy?.name}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {formatDateToDDMMYYYY(selectedIndentForApproval.requestDate)}
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
                    onClick={handleRejectIndent}
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
            {selectedIndentForOrder && (
              <div className='space-y-4'>
                <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <h3 className='font-semibold text-blue-800 mb-2'>
                    Indent Details
                  </h3>
                  <p>
                    <strong>ID:</strong> {selectedIndentForOrder.uniqueId}
                  </p>
                  <p>
                    <strong>Requested By:</strong>{' '}
                    {selectedIndentForOrder.requestedBy?.name}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {formatDateToDDMMYYYY(selectedIndentForOrder.requestDate)}
                  </p>
                </div>

                <div className='space-y-3'>
                  <h4 className='font-semibold'>Items to Order:</h4>
                  <div className='space-y-2'>
                    {selectedIndentForOrder.items.map((item) => (
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
            {selectedPurchase && (
              <div className='space-y-4'>
                <div className='p-4 bg-orange-50 border border-orange-200 rounded-lg'>
                  <h3 className='font-semibold text-orange-800 mb-2'>
                    Purchase Order Details
                  </h3>
                  <p>
                    <strong>PO Number:</strong>{' '}
                    {selectedPurchase.purchaseOrderNumber}
                  </p>
                  <p>
                    <strong>Order Date:</strong>{' '}
                    {formatDateToDDMMYYYY(selectedPurchase.orderDate)}
                  </p>
                  <p>
                    <strong>Total Value:</strong> ₹{selectedPurchase.totalValue}
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
