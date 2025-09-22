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
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';
import { MaterialIssueForm } from '../components/MaterialIssueForm';
import { RequestStatusManager } from '../components/RequestStatusManager';
import { ResubmitForm } from '../components/ResubmitForm';
import { useRequestWorkflow } from '../hooks/useRequestWorkflow';
import { HistoryView } from '../components/HistoryView';
import { generatePurchaseId, parseLocationFromId } from '../lib/utils';
import materialIndentsApi, { IndentStatus } from '../lib/api/material-indents';
import { branchesApi } from '../lib/api/branches';
import { Branch, MaterialIndent, PaginationMeta } from '../lib/api/types';
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

  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialIndents, setMaterialIndents] = useState<MaterialIndent[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // Available branches
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

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
    async (page = 1, limit = 10) => {
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
          sortBy: 'id',
          sortOrder: 'DESC',
        };

        // Add status filter if not 'all'
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
    [filterStatus, filterUnit]
  );

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

  const [issuedMaterials, setIssuedMaterials] = useState<IssuedMaterial[]>([
    // Recent Material Issues - Including items from physical form
    {
      id: 'ISS-2024-012',
      materialId: 'MAT-001',
      materialName: 'fevicol',
      specifications: 'SH adhesive, MARINE brand',
      MeasureUnit: 'KG',
      existingStock: 1,
      issuedQuantity: '1',
      stockAfterIssue: 0,
      recipientName: 'DBLU KUMAR (AJEET)',
      recipientId: 'EMP-CH001',
      recipientDesignation: 'CH-MISTRI',
      department: 'Maintenance',
      machineId: 'GENERAL',
      machineName: 'General Maintenance',
      purpose: 'Adhesive work for equipment repair',
      issuingPersonName: 'SHARWAN',
      issuingPersonDesignation: 'MAINTANCE -SUPERVISOR',
      issuedBy: 'SHARWAN',
      issuedDate: '2024-01-22',
      materialIssueFormSrNo: 'SSFM/IISFN/007',
      reqFormSrNo: 'SSFM/MNT/RQ/0012',
      indFormSrNo: 'SSFM/MNT/IND./0012',
      status: 'issued',
      type: 'material_issue',
      timestamp: '2024-01-22T09:15:00Z',
      unit: 'unit-1',
      unitName: 'SSRFM Unit 1',
    },
    {
      id: 'ISS-2024-011',
      materialId: 'MAT-002',
      materialName: 'wire brush',
      specifications: '0.01 mm thickness of wire, INDUSTRIAL',
      MeasureUnit: 'pieces',
      existingStock: 2,
      issuedQuantity: '2',
      stockAfterIssue: 0,
      recipientName: 'RAVI SHARMA',
      recipientId: 'EMP-MT002',
      recipientDesignation: 'MAINTENANCE TECHNICIAN',
      department: 'Maintenance',
      machineId: 'MACHINE-003',
      machineName: 'Flour Sifter #01',
      purpose: 'Cleaning and maintenance of sifter components',
      issuingPersonName: 'SHARWAN',
      issuingPersonDesignation: 'MAINTANCE -SUPERVISOR',
      issuedBy: 'SHARWAN',
      issuedDate: '2024-01-21',
      materialIssueFormSrNo: 'SSFM/IISFN/006',
      reqFormSrNo: 'SSFM/MNT/RQ/0011',
      indFormSrNo: 'SSFM/MNT/IND./0011',
      status: 'issued',
      type: 'material_issue',
      timestamp: '2024-01-21T14:30:00Z',
      unit: 'unit-2',
      unitName: 'SSRFM Unit 2',
    },
    {
      id: 'ISS-2024-010',
      materialId: 'MAT-003',
      materialName: 'dholak ball',
      specifications: 'PVC transparent, INDUSTRIAL',
      MeasureUnit: 'pieces',
      existingStock: 200,
      issuedQuantity: '200',
      stockAfterIssue: 0,
      recipientName: 'SURESH KUMAR',
      recipientId: 'EMP-OP003',
      recipientDesignation: 'MACHINE OPERATOR',
      department: 'Production Floor A',
      machineId: 'MACHINE-001',
      machineName: 'Main Flour Mill #01',
      purpose: 'Production line component replacement',
      issuingPersonName: 'SHARWAN',
      issuingPersonDesignation: 'MAINTANCE -SUPERVISOR',
      issuedBy: 'SHARWAN',
      issuedDate: '2024-01-20',
      materialIssueFormSrNo: 'SSFM/IISFN/005',
      reqFormSrNo: 'SSFM/MNT/RQ/0010',
      indFormSrNo: 'SSFM/MNT/IND./0010',
      status: 'issued',
      type: 'material_issue',
      timestamp: '2024-01-20T11:45:00Z',
      unit: 'unit-1',
      unitName: 'SSRFM Unit 1',
    },
    {
      id: 'ISS-2024-009',
      materialId: 'MAT-004',
      materialName: 'triangle brush',
      specifications: 'Cleaning brush, INDUSTRIAL',
      MeasureUnit: 'pieces',
      existingStock: 130,
      issuedQuantity: '60',
      stockAfterIssue: 70,
      recipientName: 'MOHAN LAL',
      recipientId: 'EMP-CL001',
      recipientDesignation: 'CLEANING SUPERVISOR',
      department: 'Housekeeping',
      machineId: 'ALL-MACHINES',
      machineName: 'General Cleaning Operations',
      purpose: 'Daily cleaning and maintenance of all equipment',
      issuingPersonName: 'SHARWAN',
      issuingPersonDesignation: 'MAINTANCE -SUPERVISOR',
      issuedBy: 'SHARWAN',
      issuedDate: '2024-01-19',
      materialIssueFormSrNo: 'SSFM/IISFN/004',
      reqFormSrNo: 'SSFM/MNT/RQ/0009',
      indFormSrNo: 'SSFM/MNT/IND./0009',
      status: 'issued',
      type: 'material_issue',
      timestamp: '2024-01-19T16:20:00Z',
      unit: 'unit-2',
      unitName: 'SSRFM Unit 2',
    },
    {
      id: 'ISS-2024-008',
      materialId: 'MAT-005',
      materialName: 'gum tape',
      specifications: '1 inch width adhesive tape, INDUSTRIAL',
      MeasureUnit: 'pieces',
      existingStock: 14,
      issuedQuantity: '2',
      stockAfterIssue: 12,
      recipientName: 'PRAKASH SINGH',
      recipientId: 'EMP-PK001',
      recipientDesignation: 'PACKAGING SUPERVISOR',
      department: 'Packaging',
      machineId: 'MACHINE-004',
      machineName: 'Main Conveyor #01',
      purpose: 'Packaging and sealing operations',
      issuingPersonName: 'SHARWAN',
      issuingPersonDesignation: 'MAINTANCE -SUPERVISOR',
      issuedBy: 'SHARWAN',
      issuedDate: '2024-01-18',
      materialIssueFormSrNo: 'SSFM/IISFN/003',
      reqFormSrNo: 'SSFM/MNT/RQ/0008',
      indFormSrNo: 'SSFM/MNT/IND./0008',
      status: 'issued',
      type: 'material_issue',
      timestamp: '2024-01-18T13:10:00Z',
      unit: 'unit-3',
      unitName: 'SSRFM Unit 3',
    },
    {
      id: 'ISS-2024-007',
      materialId: 'MAT-006',
      materialName: 'Bearings (SKF 6205-2RS)',
      specifications: 'Deep Grove Ball Bearing, Inner: 25mm, Outer: 52mm',
      MeasureUnit: 'pieces',
      existingStock: 24,
      issuedQuantity: '4',
      stockAfterIssue: 20,
      recipientName: 'RAJESH KUMAR',
      recipientId: 'EMP-ME001',
      recipientDesignation: 'MECHANICAL ENGINEER',
      department: 'Production Floor A',
      machineId: 'MACHINE-001',
      machineName: 'Main Flour Mill #01',
      purpose: 'Replace worn bearings in main grinding unit',
      issuingPersonName: 'SHARWAN',
      issuingPersonDesignation: 'MAINTANCE -SUPERVISOR',
      issuedBy: 'SHARWAN',
      issuedDate: '2024-01-17',
      materialIssueFormSrNo: 'SSFM/IISFN/002',
      reqFormSrNo: 'SSFM/MNT/RQ/0007',
      indFormSrNo: 'SSFM/MNT/IND./0007',
      status: 'issued',
      type: 'material_issue',
      timestamp: '2024-01-17T10:30:00Z',
      unit: 'unit-4',
      unitName: 'SSRFM Unit 4',
    },
    {
      id: 'ISS-2024-006',
      materialId: 'MAT-007',
      materialName: 'Motor Oil (SAE 10W-30)',
      specifications: 'Industrial grade lubricant for machinery',
      MeasureUnit: 'liters',
      existingStock: 65,
      issuedQuantity: '15',
      stockAfterIssue: 50,
      recipientName: 'VIKRAM SINGH',
      recipientId: 'EMP-MT003',
      recipientDesignation: 'MAINTENANCE TECHNICIAN',
      department: 'Maintenance',
      machineId: 'MACHINE-002',
      machineName: 'Secondary Mill #02',
      purpose: 'Scheduled maintenance and lubrication',
      issuingPersonName: 'SHARWAN',
      issuingPersonDesignation: 'MAINTANCE -SUPERVISOR',
      issuedBy: 'SHARWAN',
      issuedDate: '2024-01-16',
      materialIssueFormSrNo: 'SSFM/IISFN/001',
      reqFormSrNo: 'SSFM/MNT/RQ/0006',
      indFormSrNo: 'SSFM/MNT/IND./0006',
      status: 'issued',
      type: 'material_issue',
      timestamp: '2024-01-16T14:45:00Z',
      unit: 'unit-1',
      unitName: 'SSRFM Unit 1',
    },
    {
      id: 'ISS-2024-005',
      materialId: 'MAT-008',
      materialName: 'Conveyor Belts',
      specifications: 'Rubber belt, 600mm width, food grade',
      MeasureUnit: 'meters',
      existingStock: 45,
      issuedQuantity: '8',
      stockAfterIssue: 37,
      recipientName: 'ANIL KUMAR',
      recipientId: 'EMP-CV001',
      recipientDesignation: 'CONVEYOR TECHNICIAN',
      department: 'Production Line',
      machineId: 'MACHINE-004',
      machineName: 'Main Conveyor #01',
      purpose: 'Conveyor belt maintenance and repair',
      issuingPersonName: 'SHARWAN',
      issuingPersonDesignation: 'MAINTANCE -SUPERVISOR',
      issuedBy: 'SHARWAN',
      issuedDate: '2024-01-15',
      materialIssueFormSrNo: 'SSFM/IISFN/000',
      reqFormSrNo: 'SSFM/MNT/RQ/0005',
      indFormSrNo: 'SSFM/MNT/IND./0005',
      status: 'issued',
      type: 'material_issue',
      timestamp: '2024-01-15T11:20:00Z',
      unit: 'unit-2',
      unitName: 'SSRFM Unit 2',
    },
  ]);

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

  const handleStatusUpdate = (requestId: string, newStatus: string) => {
    setAllRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );

    // In a real implementation, we would call the API to update the status
    // materialIndentsApi.updateStatus(requestId, newStatus)
    //   .then(() => fetchMaterialIndents())
    //   .catch(error => console.error('Failed to update status:', error));
  };

  const handleResubmitRequest = (requestData: Record<string, unknown>) => {
    // Handle resubmit logic here
    console.log('Resubmitting request:', requestData);

    // In a real implementation, we would call the API to resubmit the request
    // materialIndentsApi.create(requestData)
    //   .then(() => fetchMaterialIndents())
    //   .catch(error => console.error('Failed to resubmit request:', error));
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

    return {
      id: indent.uniqueId,
      originalId: indent.id,
      materialName: firstItem?.material.name || 'N/A',
      specifications:
        firstItem?.specifications || firstItem?.material.specifications || '',
      maker: firstItem?.material.makerBrand || 'N/A',
      quantity: firstItem ? `${firstItem.requestedQuantity} units` : '0',
      unitPrice: firstQuotation ? `₹${firstQuotation.quotationAmount}` : 'N/A',
      value: firstQuotation
        ? `₹${
            Number(firstQuotation.quotationAmount) *
            (firstItem?.requestedQuantity || 0)
          }`
        : 'N/A',
      priority: 'medium', // Not available in API, using default
      materialPurpose: firstItem?.notes || indent.additionalNotes || '',
      machineId: firstItem?.machine?.id.toString() || 'N/A',
      machineName: firstItem?.machine?.name || 'N/A',
      date: new Date(indent.requestDate).toLocaleDateString(),
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
        ? new Date(indent.approvalDate).toLocaleDateString()
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
                <TableHead className='min-w-[120px] text-foreground font-semibold'>
                  Purchase ID
                </TableHead>
                <TableHead className='min-w-[150px] text-foreground font-semibold'>
                  Materials
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Quantity
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Price
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Total Value
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Status
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Purchased Date
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Purchased For
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
                      <div>
                        <div className='font-medium'>
                          {request.materialName}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {request.maker}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='text-sm'>
                      {request.quantity}
                    </TableCell>
                    <TableCell className='text-sm font-medium'>
                      {request.unitPrice || 'N/A'}
                    </TableCell>
                    <TableCell className='text-sm font-medium'>
                      {request.value}
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
                <TableHead className='min-w-[120px] text-foreground font-semibold'>
                  Purchase ID
                </TableHead>
                <TableHead className='min-w-[150px] text-foreground font-semibold'>
                  Materials
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Quantity
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Price
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Total Value
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Status
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Purchased Date
                </TableHead>
                <TableHead className='min-w-[100px] text-foreground font-semibold'>
                  Purchased For
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
                    <div>
                      <div className='font-medium'>{request.materialName}</div>
                      <div className='text-xs text-muted-foreground'>
                        {request.maker}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-sm'>{request.quantity}</TableCell>
                  <TableCell className='text-sm font-medium'>
                    {request.unitPrice || 'N/A'}
                  </TableCell>
                  <TableCell className='text-sm font-medium'>
                    {request.value}
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

          {/* Unit Filter - Only for users with global read */}
          {hasPermission('inventory:material-indents:read:all') && (
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

          {/* Status Filter */}
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
              <Link to='/material-request'>
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
            viewMode === 'table' ? (
              <TableView requests={filteredRequests} />
            ) : (
              <ListView requests={filteredRequests} />
            )
          ) : (
            <Card className='rounded-lg shadow-sm p-8 text-center'>
              <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                No Material Indents Found
              </h3>
              <p className='text-muted-foreground mb-4'>
                No material indents match your current filters.
              </p>
              <Button asChild variant='outline'>
                <Link to='/material-request'>
                  <FileEdit className='w-4 h-4 mr-2' />
                  Create Material Indent
                </Link>
              </Button>
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

      {/* Owner-like History Section */}
      {(hasPermission('inventory:material-indents:approve') ||
        hasPermission('inventory:material-indents:read:all')) && (
        <div className='mt-8'>
          <HistoryView
            userRole='company_owner'
            historyData={getApprovedHistory()}
            title='Recently Approved Requests'
          />
        </div>
      )}
    </div>
  );
};
