import { useState, useEffect } from 'react';
import { MaterialIssue, MaterialIssueItem } from '../lib/api/types';
import { materialIssuesApi } from '../lib/api/material-issues';
import {
  Plus,
  Search,
  List,
  Table,
  Edit,
  Eye,
  Package,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  FileText,
  Building2,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { MaterialIssueForm } from './MaterialIssueForm';
import { toast } from '../hooks/use-toast';
import { useRole } from '../contexts/RoleContext';
import { Label } from './ui/label';
import { branchesApi } from '../lib/api/branches';
import { Branch } from '../lib/api/types';

type SortField = 'id' | 'issueDate' | 'issuedBy' | 'branch' | 'uniqueId';
type SortOrder = 'ASC' | 'DESC';

export const MaterialIssuesTab = () => {
  const { currentUser, hasPermission } = useRole();
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<TransformedIssue | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<TransformedIssue | null>(
    null
  );

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('issueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  // Helper function to format date as dd-mm-yyyy
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Define interface for transformed issue data
  interface TransformedIssueItem {
    materialId: number;
    materialName: string;
    specifications: string;
    existingStock: number;
    issuedQuantity: number;
    stockAfterIssue: number;
    recipientName: string;
    purpose: string;
    imagePath?: string;
    machineId: number;
    machineName: string;
    originalItem: MaterialIssueItem;
  }

  interface TransformedIssue {
    id: string;
    materialIssueFormSrNo: string;
    issuingPersonName: string;
    issuingPersonDesignation: string;
    issuedDate: string;
    status: string;
    unit: string;
    unitName: string;
    additionalNotes?: string;
    items: TransformedIssueItem[];
    originalIssue: MaterialIssue;
  }

  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialIssues, setMaterialIssues] = useState<MaterialIssue[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Changed back to 5 to match MaterialsTab
  const [materialIssuesData, setMaterialIssuesData] = useState<{
    data?: unknown;
    meta?: {
      page: number;
      limit: number;
      itemCount: number;
      pageCount: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    };
  } | null>(null);

  // Available branches (units) for company owner - fetched from API
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      if (currentUser?.role !== 'company_owner') return;
      setIsLoadingBranches(true);
      try {
        const response = await branchesApi.getAll({ limit: 100 });
        setAvailableBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load units. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [currentUser?.role]);

  // Fetch material issues from API
  const fetchMaterialIssues = async (page = 1, limit = 10) => { // Changed back to default 10
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        sortBy: sortField,
        sortOrder: sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(filterUnit !== 'all' &&
          currentUser?.role === 'company_owner' && {
            branchId: filterUnit,
          }),
      };

      const response = await materialIssuesApi.getAll(params);

      // Validate response structure
      if (!response || !response.data || !response.meta) {
        throw new Error('Invalid response format from API');
      }

      setMaterialIssuesData(response);
      setMaterialIssues(response.data);

      // Transform API data to match component data structure
      const transformedIssues = response.data.map(transformApiIssueToUiFormat);
      setIssuedMaterials(transformedIssues);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: { message?: string };
          status?: number;
        };
        request?: unknown;
        message?: string;
      };

      // More detailed error handling
      let errorMessage = 'Failed to load material issues. Please try again.';

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error: ${err.response.status}. ${
          err.response.data?.message || ''
        }`;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage =
          'No response received from server. Please check your connection.';
      } else {
        // Something happened in setting up the request
        errorMessage = `Request error: ${err.message || 'Unknown error'}`;
      }

      setError(errorMessage);
      setIssuedMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Set new field with ascending order
      setSortField(field);
      setSortOrder('ASC');
    }
  };

  // Get sort icon for column header
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className='w-4 h-4 text-muted-foreground' />;
    }
    return sortOrder === 'ASC' ? (
      <ArrowUp className='w-4 h-4 text-primary' />
    ) : (
      <ArrowDown className='w-4 h-4 text-primary' />
    );
  };

  // Transform API response to UI format
  const transformApiIssueToUiFormat = (
    issue: MaterialIssue
  ): TransformedIssue => {
    // Transform each item in the issue
    const transformedItems = issue.items.map((item) => ({
      materialId: item.material.id,
      materialName: item.material.name,
      specifications: item.material.specifications || '',
      existingStock: item.stockBeforeIssue,
      issuedQuantity: item.issuedQuantity,
      stockAfterIssue: item.stockAfterIssue,
      recipientName: item.receiverName,
      purpose: item.purpose,
      imagePath: item.imagePath,
      machineId: item.machineId,
      machineName: item.machineName,
      originalItem: item,
    }));

    // Create a transformed issue with all items
    return {
      id: issue.uniqueId.toString(),
      materialIssueFormSrNo: issue.uniqueId.toString(),
      issuingPersonName:
        issue.issuedBy?.name || `User ID: ${issue.issuedBy?.id || 'Unknown'}`,
      issuingPersonDesignation: issue.issuedBy?.email || '',
      issuedDate: issue.issueDate,
      status: 'Issued',
      unit: issue.branch?.code || '',
      unitName: issue.branch?.name || '',
      additionalNotes: issue.additionalNotes || '',
      items: transformedItems,
      originalIssue: issue,
    };
  };

  // Generate formatted Issue ID: SSRMF/UNIT-I/YYMMDDSQ
  const generateFormattedIssueId = (issue: MaterialIssue): string => {
    const date = new Date(issue.issueDate);

    // Format date as YYMMDD
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Get unit number and convert to Roman numeral
    const unitNumber = issue.branch?.id || 1;
    const unitRoman = convertToRoman(unitNumber);

    // Generate sequence number (using issue ID as sequence)
    const sequence = issue.id.toString().padStart(2, '0');

    // Format: SSRMF/UNIT-I/YYMMDDSQ
    return `SSRMF/UNIT-${unitRoman}/${dateStr}${sequence}`;
  };

  // Convert number to Roman numeral
  const convertToRoman = (num: number): string => {
    const romanNumerals = [
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' },
    ];

    let result = '';
    for (const { value, numeral } of romanNumerals) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  };

  // Load material issues on component mount
  useEffect(() => {
    fetchMaterialIssues(); // Use default parameters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when search, filter, or sorting changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMaterialIssues(1, itemsPerPage);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterUnit, sortField, sortOrder, itemsPerPage]);

  // Load material issues when pagination changes
  useEffect(() => {
    fetchMaterialIssues(currentPage, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  // Helper function to check if issue can be edited (within 7 days)
  const canEditIssue = (issuedDate: string) => {
    const issueDate = new Date(issuedDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - issueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const handleViewIssue = (issue: TransformedIssue) => {
    // Instead of opening view dialog, open edit form directly
    handleEditIssue(issue);
  };

  const handleEditIssue = (issue: TransformedIssue) => {
    if (canEditIssue(issue.issuedDate)) {
      // Transform the TransformedIssue to the format expected by MaterialIssueForm
      const editingData = {
        issuedDate: issue.issuedDate,
        additionalNotes: issue.additionalNotes || '',
        allItems: issue.items.map((item) => ({
          material: {
            id: item.materialId,
            name: item.materialName,
            makerBrand: item.specifications, // Using specifications as measure unit
          },
          stockBeforeIssue: item.existingStock,
          issuedQuantity: item.issuedQuantity,
          stockAfterIssue: item.stockAfterIssue,
          receiverName: item.recipientName,
          purpose: item.purpose,
          imagePath: item.imagePath,
          machineId: item.machineId,
          machineName: item.machineName,
        })),
      };

      setEditingIssue(editingData as unknown as TransformedIssue);
      setIsIssueFormOpen(true);
    } else {
      // Show message when trying to edit after 7 days
      toast({
        title: 'Cannot Edit Issue',
        description:
          "This issue cannot be edited as it's more than 7 days old. Only recent issues (within 7 days) can be modified.",
        variant: 'destructive',
      });
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Transformed material issues for UI display
  const [issuedMaterials, setIssuedMaterials] = useState<TransformedIssue[]>(
    []
  );

  interface IssuedItem {
    materialId: number;
    nameOfMaterial: string;
    specifications: string;
    unit: string;
    existingStock: number;
    issuedQty: string;
    stockAfterIssue: number;
  }

  interface IssueFormData {
    date: string;
    purpose: string;
    receiverName: string;
    receiverDesignation: string;
    receiverId: string;
    issuingPersonName: string;
    issuingPersonDesignation: string;
    department: string;
    machineName: string;
    unit: string;
    issuedItems: IssuedItem[];
  }

  const handleIssueMaterial = async (issueData: IssueFormData) => {
    try {
      // Get current user ID from context
      const userId = currentUser?.id || 1;

      // Prepare data for API
      const materialIssueData = {
        issueDate: issueData.date,
        additionalNotes: issueData.purpose || '',
        // Use the current user's ID
        issuedBy: userId,
        branchId: 1, // Default to first branch, should be selected by user or from context
        // Map the items with the structure expected by the API
        items: issueData.issuedItems.map((item) => ({
          materialId: item.materialId,
          issuedQuantity: parseInt(item.issuedQty),
          stockBeforeIssue: item.existingStock,
          stockAfterIssue: item.stockAfterIssue,
          receiverName: issueData.receiverName,
          purpose: issueData.purpose || '',
        })),
      };

      // Call API to create material issue
      await materialIssuesApi.create(
        materialIssueData as unknown as Partial<MaterialIssue>
      );

      // Refresh the list
      fetchMaterialIssues(currentPage, itemsPerPage);

      toast({
        title: 'Success',
        description: 'Material issue created successfully',
      });

      // Close the form
      setIsIssueFormOpen(false);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: { message?: string };
          status?: number;
        };
        message?: string;
      };

      let errorMessage = 'Failed to create material issue. Please try again.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Filter issues based on search and unit
  const filteredIssues = issuedMaterials.filter((issue) => {
    if (!issue) return false;

    // Search in all items' material names and recipient names
    const materialNameMatch = issue.items.some((item) =>
      item.materialName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const recipientNameMatch = issue.items.some((item) =>
      item.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Also search in issue ID
    const idMatch = issue.id.toLowerCase().includes(searchQuery.toLowerCase());

    return materialNameMatch || recipientNameMatch || idMatch;
  });

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header with Actions */}
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4'>
        {/* Left side: Title and View Toggle Buttons */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
          {/* View Toggle Buttons - Moved to left side */}
          <div className='flex rounded-lg border border-secondary overflow-hidden bg-secondary/10 w-fit shadow-sm'>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='rounded-none px-3 sm:px-4'
            >
              <List className='w-4 h-4' />
              <span className='ml-1 sm:ml-2 text-xs sm:text-sm'>List</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('table')}
              className='rounded-none px-3 sm:px-4'
            >
              <Table className='w-4 h-4' />
              <span className='ml-1 sm:ml-2 text-xs sm:text-sm'>Table</span>
            </Button>
          </div>
        </div>

        {/* Right side: Search, Unit Filter and Issue Material Button */}
        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input
              placeholder='Search issues, materials, recipients...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 rounded-lg border-secondary focus:border-secondary focus:ring-0 outline-none h-10 w-64'
            />
          </div>

          {/* Unit Filter - Only for Company Owner */}
          {currentUser?.role === 'company_owner' && (
            <Select value={filterUnit} onValueChange={setFilterUnit}>
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
                        {branch.location && (
                          <div className='text-xs text-muted-foreground'>
                            {branch.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            className='btn-primary w-full sm:w-auto text-sm sm:text-base'
            onClick={() => setIsIssueFormOpen(true)}
          >
            <Plus className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
            Issue Materials
          </Button>
        </div>
      </div>

      {/* Content - Rest of the component remains exactly the same */}
      {isLoading ? (
        <div className='flex items-center justify-center p-12'>
          <div className='flex items-center gap-3'>
            <Loader2 className='w-6 h-6 animate-spin text-primary' />
            <span className='text-muted-foreground'>
              Loading material issues...
            </span>
          </div>
        </div>
      ) : error ? (
        <Card className='rounded-lg shadow-sm p-8 text-center'>
          <AlertCircle className='w-12 h-12 text-destructive mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-foreground mb-2'>Error</h3>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <Button onClick={() => fetchMaterialIssues()}>Try Again</Button>
        </Card>
      ) : filteredIssues.length > 0 ? (
        viewMode === 'table' ? (
          // Table View for Material Issues - Individual Items
          <Card className='rounded-lg shadow-sm border border-primary/10'>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <TableComponent>
                  <TableHeader>
                    <TableRow className='bg-gradient-to-r from-primary/5 to-primary/10 border-b-2 border-primary/20'>
                      <TableHead className='w-[100px] text-foreground font-semibold text-sm'>
                        <Button
                          variant='ghost'
                          onClick={() => handleSort('uniqueId')}
                          className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                        >
                          Issue ID
                          {getSortIcon('uniqueId')}
                        </Button>
                      </TableHead>
                      <TableHead className='w-[140px] text-foreground font-semibold text-sm'>
                        Issued Material
                      </TableHead>
                      <TableHead className='w-[120px] text-foreground font-semibold text-sm'>
                        Specifications
                      </TableHead>
                      <TableHead className='w-[120px] text-foreground font-semibold text-sm'>
                        Stock Info
                      </TableHead>
                      <TableHead className='w-[100px] text-foreground font-semibold text-sm'>
                        <Button
                          variant='ghost'
                          onClick={() => handleSort('issueDate')}
                          className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                        >
                         Issued Date
                          {getSortIcon('issueDate')}
                        </Button>
                      </TableHead>
                      <TableHead className='w-[120px] text-foreground font-semibold text-sm'>
                        Issued For
                      </TableHead>
                      <TableHead className='w-[120px] text-foreground font-semibold text-sm'>
                        Issued To
                      </TableHead>
                      <TableHead className='w-[130px] text-foreground font-semibold text-sm'>
                        <Button
                          variant='ghost'
                          onClick={() => handleSort('issuedBy')}
                          className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                        >
                          Issued By
                          {getSortIcon('issuedBy')}
                        </Button>
                      </TableHead>
                      <TableHead className='w-[100px] text-foreground font-semibold text-sm'>
                        <Button
                          variant='ghost'
                          onClick={() => handleSort('branch')}
                          className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                        >
                          Unit
                          {getSortIcon('branch')}
                        </Button>
                      </TableHead>
                      <TableHead className='w-[100px] text-foreground font-semibold text-sm'>
                        Purpose
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.flatMap((issue) =>
                      issue.items.map((item, itemIndex) => (
                        <TableRow
                          key={`${issue.id}-item-${itemIndex}`}
                          className='hover:bg-primary/5 border-b border-border/50 cursor-pointer transition-colors duration-200'
                          onClick={() => handleViewIssue(issue)}
                        >
                          <TableCell className='font-medium text-sm py-3'>
                            <Button
                              variant='link'
                              className='p-0 h-auto text-left font-semibold text-primary hover:text-primary/80 text-sm uppercase'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditIssue(issue);
                              }}
                            >
                              {issue.id}
                            </Button>
                          </TableCell>
                          <TableCell className='text-sm py-3'>
                            <div className='flex items-center gap-2'>
                              <div className='w-2 h-2 bg-primary rounded-full'></div>
                              <div className='font-semibold text-foreground capitalize'>
                              {item.materialName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm py-3'>
                            <div className='text-muted-foreground max-w-[120px] truncate' title={item.specifications}>
                            {item.specifications}
                            </div>
                          </TableCell>
                          <TableCell className='text-sm py-3'>
                            <div className='space-y-1'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-muted-foreground'>Existing:</span>
                                <span className='font-semibold text-foreground'>{item.existingStock}</span>
                              </div>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-muted-foreground'>Issued:</span>
                                <span className='font-semibold text-primary'>{item.issuedQuantity}</span>
                              </div>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-muted-foreground'>After:</span>
                                <span className='font-semibold text-foreground'>{item.stockAfterIssue}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm py-3'>
                            <span className='text-foreground'>
                            {formatDate(issue.issuedDate)}
                            </span>
                          </TableCell>
                          <TableCell className='text-sm py-3'>
                            <div className='flex items-center gap-2'>
                              {item.machineName ? (
                                <div className='font-medium text-foreground truncate' title={item.machineName}>
                                  {item.machineName}
                                </div>
                              ) : (
                                <div className='font-medium text-amber-600 text-xs'>
                                  No machine selected
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className='text-sm py-3'>
                            <div className='font-medium text-foreground truncate'>
                              {item.recipientName}
                            </div>
                          </TableCell>
                          <TableCell className='text-sm py-3'>
                            <div className='space-y-1'>
                              <div className='font-semibold text-foreground truncate'>
                                {issue.issuingPersonName}
                              </div>
                              <div className='text-xs text-muted-foreground truncate'>
                                {issue.issuingPersonDesignation}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm py-3'>
                            <Badge variant='outline' className='text-xs bg-primary/10 text-primary border-primary/30'>
                              {issue.unitName}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-sm py-3'>
                            <div className='text-muted-foreground truncate max-w-[100px]' title={item.purpose}>
                            {item.purpose}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </TableComponent>
              </div>
            </CardContent>
          </Card>
        ) : (
          // List View for Material Issues - Individual Items
          <Card className='rounded-lg shadow-sm'>
            <CardContent className='p-0'>
              <div className='overflow-hidden'>
                <TableComponent>
                  <TableHeader>
                    <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                      <TableHead className='w-8'></TableHead>
                      <TableHead className='w-[80px] text-foreground font-semibold'>
                        Issue ID
                      </TableHead>
                      <TableHead className='w-[120px] text-foreground font-semibold'>
                        Issued Material
                      </TableHead>
                      <TableHead className='w-[80px] text-foreground font-semibold'>
                        Specifications
                      </TableHead>
                      <TableHead className='w-[90px] text-foreground font-semibold'>
                        Stock Info
                      </TableHead>
                      <TableHead className='w-[100px] text-foreground font-semibold'>
                        Issued To
                      </TableHead>
                      <TableHead className='w-[100px] text-foreground font-semibold'>
                        Issuing Person
                      </TableHead>
                      <TableHead className='w-[70px] text-foreground font-semibold'>
                        Unit
                      </TableHead>
                      <TableHead className='w-[80px] text-foreground font-semibold'>
                        Date
                      </TableHead>
                      <TableHead className='w-[100px] text-foreground font-semibold'>
                        Issued For
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .flatMap((issue) =>
                        issue.items.map((item, itemIndex) => (
                          <TableRow
                            key={`${issue.id}-item-${itemIndex}`}
                            className='hover:bg-muted/30 border-b border-secondary/20 cursor-pointer'
                            onClick={() => handleViewIssue(issue)}
                          >
                            <TableCell>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 p-0'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(
                                    `${issue.id}-item-${itemIndex}`
                                  );
                                }}
                              >
                                {expandedRows.has(
                                  `${issue.id}-item-${itemIndex}`
                                ) ? (
                                  <ChevronDown className='w-4 h-4' />
                                ) : (
                                  <ChevronRight className='w-4 h-4' />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className='font-medium text-xs'>
                              <Button
                                variant='link'
                                className='p-0 h-auto text-left font-medium text-primary hover:text-primary/80 uppercase text-xs'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditIssue(issue);
                                }}
                              >
                                {issue.id}
                              </Button>
                              <div className='text-xs mt-1'>
                                <Badge variant='outline' className='text-xs'>
                                  Item {itemIndex + 1}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className='text-sm'>
                              <div className='font-medium capitalize truncate'>
                                {item.materialName}
                              </div>
                            </TableCell>
                            <TableCell className='text-xs text-muted-foreground truncate'>
                              {item.specifications}
                            </TableCell>
                            <TableCell className='text-xs'>
                              <div className='space-y-0.5'>
                                <div>
                                  <span className='text-muted-foreground'>Existing:</span> {item.existingStock}
                                </div>
                                <div className='font-medium text-primary'>
                                  <span className='text-muted-foreground'>Issued:</span> {item.issuedQuantity}
                                </div>
                                <div>
                                  <span className='text-muted-foreground'>After:</span> {item.stockAfterIssue}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className='text-sm'>
                              <div className='font-medium truncate'>
                                {item.recipientName}
                              </div>
                            </TableCell>
                            <TableCell className='text-sm'>
                              <div>
                                <div className='font-medium truncate'>
                                  {issue.issuingPersonName}
                                </div>
                                <div className='text-xs text-muted-foreground truncate'>
                                  {issue.issuingPersonDesignation}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className='text-xs'>
                              <Badge variant='outline' className='text-xs'>{issue.unitName}</Badge>
                            </TableCell>
                            <TableCell className='text-xs'>
                              {formatDate(issue.issuedDate)}
                            </TableCell>
                            <TableCell className='text-xs'>
                              <div className='font-medium truncate' title={item.machineName}>
                                {item.machineName || 'No machine selected'}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                  </TableBody>
                </TableComponent>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className='rounded-lg shadow-sm p-8 text-center'>
          <Package className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            No Material Issues Found
          </h3>
          <p className='text-muted-foreground mb-4'>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'No materials have been issued yet.'}
          </p>
        </Card>
      )}

      {/* Pagination - Restore the pagination section */}
      {materialIssuesData && materialIssuesData.meta && (
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
          {/* Page Info */}
          <div className='text-sm text-muted-foreground'>
            Showing{' '}
            {(materialIssuesData.meta.page - 1) *
              materialIssuesData.meta.limit +
              1}{' '}
            to{' '}
            {Math.min(
              materialIssuesData.meta.page * materialIssuesData.meta.limit,
              materialIssuesData.meta.itemCount
            )}{' '}
            of {materialIssuesData.meta.itemCount} entries
          </div>

          {/* Pagination Controls */}
          <div className='flex items-center gap-2'>
            {/* Items per page selector */}
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Show:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  const newLimit = parseInt(value);
                  setItemsPerPage(newLimit);
                  setCurrentPage(1);
                  fetchMaterialIssues(1, newLimit);
                }}
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
              <span className='text-sm text-muted-foreground'>per page</span>
            </div>

            {/* Page navigation */}
            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setCurrentPage(1);
                  fetchMaterialIssues(1, itemsPerPage);
                }}
                disabled={
                  !materialIssuesData.meta.hasPreviousPage ||
                  materialIssuesData.meta.page === 1
                }
                className='h-8 w-8 p-0'
              >
                <ChevronsLeft className='w-4 h-4' />
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setCurrentPage((prev) => prev - 1);
                  fetchMaterialIssues(currentPage - 1, itemsPerPage);
                }}
                disabled={!materialIssuesData.meta.hasPreviousPage}
                className='h-8 w-8 p-0'
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>

              {/* Page numbers */}
              <div className='flex items-center gap-1 mx-2'>
                {Array.from(
                  { length: Math.min(5, materialIssuesData.meta.pageCount) },
                  (_, i) => {
                    let pageNum;
                    if (materialIssuesData.meta.pageCount <= 5) {
                      pageNum = i + 1;
                    } else if (materialIssuesData.meta.page <= 3) {
                      pageNum = i + 1;
                    } else if (
                      materialIssuesData.meta.page >=
                      materialIssuesData.meta.pageCount - 2
                    ) {
                      pageNum = materialIssuesData.meta.pageCount - 4 + i;
                    } else {
                      pageNum = materialIssuesData.meta.page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          materialIssuesData.meta.page === pageNum
                            ? 'default'
                            : 'outline'
                        }
                        size='sm'
                        onClick={() => {
                          setCurrentPage(pageNum);
                          fetchMaterialIssues(pageNum, itemsPerPage);
                        }}
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
                onClick={() => {
                  setCurrentPage((prev) => prev + 1);
                  fetchMaterialIssues(currentPage + 1, itemsPerPage);
                }}
                disabled={!materialIssuesData.meta.hasNextPage}
                className='h-8 w-8 p-0'
              >
                <ChevronRight className='w-4 h-4' />
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setCurrentPage(materialIssuesData.meta.pageCount);
                  fetchMaterialIssues(
                    materialIssuesData.meta.pageCount,
                    itemsPerPage
                  );
                }}
                disabled={
                  !materialIssuesData.meta.hasNextPage ||
                  materialIssuesData.meta.page ===
                    materialIssuesData.meta.pageCount
                }
                className='h-8 w-8 p-0'
              >
                <ChevronsRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Material Issue Form */}
      <MaterialIssueForm
        isOpen={isIssueFormOpen}
        onClose={() => {
          setIsIssueFormOpen(false);
          setEditingIssue(null);
        }}
        onSubmit={(data) =>
          handleIssueMaterial(data as unknown as IssueFormData)
        }
        editingIssue={
          editingIssue
            ? (editingIssue as unknown as Record<string, unknown>)
            : undefined
        }
      />
    </div>
  );
};
