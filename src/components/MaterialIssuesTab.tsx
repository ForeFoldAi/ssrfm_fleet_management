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
  const [itemsPerPage, setItemsPerPage] = useState(5); // Changed default to 5 to match MachinesTab
  const [materialIssuesData, setMaterialIssuesData] = useState<any>(null);

  // Available units for company owner
  const availableUnits = [
    { id: 'unit-1', name: 'SSRFM Unit 1', location: 'Mumbai' },
    { id: 'unit-2', name: 'SSRFM Unit 2', location: 'Delhi' },
    { id: 'unit-3', name: 'SSRFM Unit 3', location: 'Bangalore' },
    { id: 'unit-4', name: 'SSRFM Unit 4', location: 'Chennai' },
  ];

  // Fetch material issues from API
  const fetchMaterialIssues = async (page = 1, limit = 10) => {
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
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortOrder === 'ASC' 
      ? <ArrowUp className="w-4 h-4 text-primary" />
      : <ArrowDown className="w-4 h-4 text-primary" />;
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

    // Generate formatted Issue ID: SSRMF/UNIT-I/YYMMDDSQ
    const formattedIssueId = generateFormattedIssueId(issue);

    // Create a transformed issue with all items
    return {
      id: formattedIssueId,
      materialIssueFormSrNo: formattedIssueId,
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
      { value: 1, numeral: 'I' }
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
    fetchMaterialIssues();
  }, []);

  // Refetch when search, filter, or sorting changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMaterialIssues(1, itemsPerPage);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterUnit, sortField, sortOrder]);

  // Load material issues when pagination changes
  useEffect(() => {
    fetchMaterialIssues(currentPage, itemsPerPage);
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
    setSelectedIssue(issue);
    setIsViewDialogOpen(true);
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
                <SelectValue placeholder='Select Unit' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Units</SelectItem>
                {availableUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    <div className='flex items-center gap-2'>
                      <Building2 className='w-4 h-4' />
                      <div>
                        <div className='font-medium'>{unit.name}</div>
                        <div className='text-xs text-muted-foreground'>
                          {unit.location}
                        </div>
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
          // Table View for Material Issues
          <Card className='rounded-lg shadow-sm'>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <TableComponent>
                  <TableHeader>
                    <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                      <TableHead className='min-w-[120px] text-foreground font-semibold'>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('uniqueId')}
                          className="h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2"
                        >
                          Issue ID
                          {getSortIcon('uniqueId')}
                        </Button>
                      </TableHead>
                      <TableHead className='min-w-[150px] text-foreground font-semibold'>
                        Issued Material
                      </TableHead>
                      <TableHead className='min-w-[100px] text-foreground font-semibold'>
                        Stock Info
                      </TableHead>
                      <TableHead className='min-w-[100px] text-foreground font-semibold'>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('issueDate')}
                          className="h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2"
                        >
                          Issued Date
                          {getSortIcon('issueDate')}
                        </Button>
                      </TableHead>
                      <TableHead className='min-w-[120px] text-foreground font-semibold'>
                        Issued To
                      </TableHead>
                      <TableHead className='min-w-[120px] text-foreground font-semibold'>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('issuedBy')}
                          className="h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2"
                        >
                          Issued By
                          {getSortIcon('issuedBy')}
                        </Button>
                      </TableHead>
                      <TableHead className='min-w-[100px] text-foreground font-semibold'>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('branch')}
                          className="h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2"
                        >
                          Unit
                          {getSortIcon('branch')}
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <>
                        {/* Parent row showing issue information */}
                        <TableRow
                          key={issue.id}
                          className='bg-secondary/10 hover:bg-secondary/20 border-b border-secondary/20 cursor-pointer'
                          onClick={() => handleViewIssue(issue)}
                        >
                          <TableCell className='font-medium'>
                            <Button
                              variant='link'
                              className='p-0 h-auto text-left font-medium text-primary hover:text-primary/80 uppercase'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewIssue(issue);
                              }}
                            >
                              {issue.id}
                            </Button>
                            <div className='text-xs mt-1'>
                              <Badge variant='outline' className='text-xs'>
                                {issue.items.length}{' '}
                                {issue.items.length === 1 ? 'item' : 'items'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell colSpan={2}>
                            <div className='font-semibold'>
                              Multiple Materials
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              Click to view all {issue.items.length} items
                            </div>
                          </TableCell>
                          <TableCell className='text-sm'>
                            {new Date(issue.issuedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium'>
                                {issue.items.length > 0
                                  ? issue.items[0].recipientName
                                  : 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium'>
                                {issue.issuingPersonName}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {issue.issuingPersonDesignation}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm'>
                            <Badge variant='outline'>{issue.unitName}</Badge>
                          </TableCell>
                        </TableRow>

                        {/* Expanded rows showing individual items */}
                        {expandedRows.has(issue.id) &&
                          issue.items.map((item, index) => (
                            <TableRow
                              key={`${issue.id}-item-${index}`}
                              className='hover:bg-muted/30 border-b border-secondary/10'
                            >
                              <TableCell className='pl-8'>
                                <div className='text-xs text-muted-foreground'>
                                  Item {index + 1}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className='font-medium capitalize'>
                                    {item.materialName}
                                  </div>
                                  <div className='text-xs text-muted-foreground truncate max-w-40'>
                                    {item.specifications}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className='text-sm'>
                                <div className='space-y-1'>
                                  <div className='text-xs'>
                                    <span className='text-muted-foreground'>
                                      Existing:
                                    </span>{' '}
                                    {item.existingStock}
                                  </div>
                                  <div className='text-xs font-medium'>
                                    <span className='text-muted-foreground'>
                                      Issued:
                                    </span>{' '}
                                    {item.issuedQuantity}
                                  </div>
                                  <div className='text-xs'>
                                    <span className='text-muted-foreground'>
                                      After:
                                    </span>{' '}
                                    {item.stockAfterIssue}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell></TableCell>
                              <TableCell>
                                <div className='font-medium'>
                                  {item.recipientName}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {item.purpose}
                                </div>
                              </TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          ))}
                      </>
                    ))}
                  </TableBody>
                </TableComponent>
              </div>
            </CardContent>
          </Card>
        ) : (
          // List View for Material Issues - Matching Table View
          <Card className='rounded-lg shadow-sm'>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <TableComponent>
                  <TableHeader>
                    <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                      <TableHead className='w-12'></TableHead>
                      <TableHead className='min-w-[120px] text-foreground font-semibold'>
                        Issued ID
                      </TableHead>
                      <TableHead className='min-w-[150px] text-foreground font-semibold'>
                        Issued Materials
                      </TableHead>
                      <TableHead className='min-w-[100px] text-foreground font-semibold'>
                        Items
                      </TableHead>
                      <TableHead className='min-w-[120px] text-foreground font-semibold'>
                        Issued To
                      </TableHead>
                      <TableHead className='min-w-[120px] text-foreground font-semibold'>
                        Issuing Person
                      </TableHead>
                      <TableHead className='min-w-[100px] text-foreground font-semibold'>
                        Unit
                      </TableHead>
                      <TableHead className='min-w-[100px] text-foreground font-semibold'>
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <>
                        <TableRow
                          key={issue.id}
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
                                toggleRowExpansion(issue.id);
                              }}
                            >
                              {expandedRows.has(issue.id) ? (
                                <ChevronDown className='w-4 h-4' />
                              ) : (
                                <ChevronRight className='w-4 h-4' />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className='font-medium'>
                            <Button
                              variant='link'
                              className='p-0 h-auto text-left font-medium text-primary hover:text-primary/80 uppercase'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewIssue(issue);
                              }}
                            >
                              {issue.id}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium capitalize'>
                                {issue.items.length > 0
                                  ? issue.items[0].materialName
                                  : 'No materials'}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {issue.items.length > 1
                                  ? `+${issue.items.length - 1} more`
                                  : ''}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm'>
                            <Badge>{issue.items.length}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium'>
                                {issue.items.length > 0
                                  ? issue.items[0].recipientName
                                  : 'N/A'}
                              </div>
                              {issue.items.length > 1 && (
                                <div className='text-xs text-muted-foreground'>
                                  Multiple recipients
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium'>
                                {issue.issuingPersonName}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {issue.issuingPersonDesignation}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm'>
                            <Badge variant='outline'>{issue.unitName}</Badge>
                          </TableCell>
                          <TableCell className='text-sm'>
                            {new Date(issue.issuedDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>

                        {/* Expanded Detail Row */}
                        {expandedRows.has(issue.id) && (
                          <TableRow>
                            <TableCell colSpan={8} className='p-0'>
                              <div className='bg-muted/30 p-6 border-t'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                  {/* Left Column - Issue Details */}
                                  <div className='space-y-4'>
                                    <div>
                                      <h3 className='font-semibold text-lg mb-3'>
                                        Issue Details
                                      </h3>
                                      <div className='space-y-3'>
                                        <div className='grid grid-cols-2 gap-4 text-sm'>
                                          <div>
                                            <span className='font-medium text-muted-foreground'>
                                              Issue ID:
                                            </span>
                                            <div className='font-medium uppercase'>
                                              {issue.id}
                                            </div>
                                          </div>
                                          <div>
                                            <span className='font-medium text-muted-foreground'>
                                              Issue Date:
                                            </span>
                                            <div className='font-medium'>
                                              {new Date(
                                                issue.issuedDate
                                              ).toLocaleDateString()}
                                            </div>
                                          </div>
                                          <div>
                                            <span className='font-medium text-muted-foreground'>
                                              Items Count:
                                            </span>
                                            <div className='font-medium'>
                                              {issue.items.length}
                                            </div>
                                          </div>
                                        </div>

                                        {issue.additionalNotes && (
                                          <div>
                                            <span className='font-medium text-muted-foreground'>
                                              Additional Notes:
                                            </span>
                                            <div className='text-sm mt-1 p-3 bg-background rounded border'>
                                              {issue.additionalNotes}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Column - Personnel & Status */}
                                  <div className='space-y-4'>
                                    <div>
                                      <h3 className='font-semibold text-lg mb-3'>
                                        Personnel & Status
                                      </h3>

                                      {/* Status Information */}
                                      <div className='space-y-3'>
                                        <div className='p-3 bg-background rounded border'>
                                          <div className='text-sm font-medium mb-2'>
                                            Current Status
                                          </div>
                                          <div className='text-sm text-muted-foreground'>
                                            Material successfully issued and
                                            delivered
                                          </div>
                                        </div>

                                        {/* Issuing Person Info */}
                                        <div className='bg-primary/10 border border-primary/20 rounded-lg p-3'>
                                          <div className='text-sm'>
                                            <strong className='text-primary'>
                                              Issued By:
                                            </strong>{' '}
                                            {issue.issuingPersonName}
                                          </div>
                                          <div className='text-xs text-primary/80 mt-1'>
                                            {issue.issuingPersonDesignation}
                                          </div>
                                        </div>

                                        {/* Unit Info */}
                                        <div className='bg-secondary/10 border border-secondary rounded-lg p-3'>
                                          <div className='text-sm space-y-1'>
                                            <div>
                                              <strong className='text-foreground'>
                                                Unit:
                                              </strong>{' '}
                                              {issue.unitName}
                                            </div>
                                            <div>
                                              <strong className='text-foreground'>
                                                Code:
                                              </strong>{' '}
                                              {issue.unit}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className='flex gap-3 pt-4 border-t mt-6'>
                                  <Button
                                    variant='outline'
                                    className='gap-2'
                                    onClick={() => handleViewIssue(issue)}
                                  >
                                    <Eye className='w-4 h-4' />
                                    View Issue Details
                                  </Button>
                                  <Button variant='outline' className='gap-2'>
                                    <FileText className='w-4 h-4' />
                                    Print Receipt
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
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

      {/* Pagination */}
      {materialIssuesData && materialIssuesData.meta && (
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
          {/* Page Info */}
          <div className='text-sm text-muted-foreground'>
            Showing {((materialIssuesData.meta.page - 1) * materialIssuesData.meta.limit) + 1} to{' '}
            {Math.min(materialIssuesData.meta.page * materialIssuesData.meta.limit, materialIssuesData.meta.itemCount)} of{' '}
            {materialIssuesData.meta.itemCount} entries
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
                disabled={!materialIssuesData.meta.hasPreviousPage || materialIssuesData.meta.page === 1}
                className='h-8 w-8 p-0'
              >
                <ChevronsLeft className='w-4 h-4' />
              </Button>
              
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setCurrentPage(prev => prev - 1);
                  fetchMaterialIssues(currentPage - 1, itemsPerPage);
                }}
                disabled={!materialIssuesData.meta.hasPreviousPage}
                className='h-8 w-8 p-0'
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>

              {/* Page numbers */}
              <div className='flex items-center gap-1 mx-2'>
                {Array.from({ length: Math.min(5, materialIssuesData.meta.pageCount) }, (_, i) => {
                  let pageNum;
                  if (materialIssuesData.meta.pageCount <= 5) {
                    pageNum = i + 1;
                  } else if (materialIssuesData.meta.page <= 3) {
                    pageNum = i + 1;
                  } else if (materialIssuesData.meta.page >= materialIssuesData.meta.pageCount - 2) {
                    pageNum = materialIssuesData.meta.pageCount - 4 + i;
                  } else {
                    pageNum = materialIssuesData.meta.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={materialIssuesData.meta.page === pageNum ? 'default' : 'outline'}
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
                })}
              </div>

              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setCurrentPage(prev => prev + 1);
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
                  fetchMaterialIssues(materialIssuesData.meta.pageCount, itemsPerPage);
                }}
                disabled={!materialIssuesData.meta.hasNextPage || materialIssuesData.meta.page === materialIssuesData.meta.pageCount}
                className='h-8 w-8 p-0'
              >
                <ChevronsRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Details View Dialog - Matching MaterialIssueForm UI */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className='max-w-6xl max-h-[95vh] overflow-y-auto p-4'>
          <DialogHeader className='pb-3'>
            <DialogTitle className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center'>
                <FileText className='w-4 h-4 text-foreground' />
              </div>
              <div>
                <div className='text-base font-bold'>
                  MATERIAL ISSUE DETAILS - {selectedIssue?.id}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedIssue && (
            <div className='space-y-3'>
              {/* Material Items Table - Matching MaterialIssueForm */}
              <Card>
                <CardContent className='p-0'>
                  <div className='overflow-x-auto'>
                    <TableComponent>
                      <TableHeader>
                        <TableRow className='bg-gray-50'>
                          <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                            SR.NO.
                          </TableHead>
                          <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                           ISSUING MATERIAL
                          </TableHead>
                          <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                            CURRENT STOCK
                          </TableHead>
                          <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                            ISSUED QTY
                          </TableHead>
                          <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                            STOCK AFTER ISSUE
                          </TableHead>
                          <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                             ISSUING TO
                          </TableHead>
                          <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                            UPLOAD IMAGE
                          </TableHead>
                          <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                            PURPOSE OF ISSUE
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedIssue.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className='border border-gray-300 text-center font-semibold text-xs px-2 py-1'>
                              {index + 1}
                            </TableCell>
                            <TableCell className='border border-gray-300 px-2 py-1'>
                              <div className='flex flex-col'>
                                <span className='font-medium'>{item.materialName}</span>
                                {item.specifications && (
                                  <span className='text-xs text-muted-foreground'>
                                    {item.specifications}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className='border border-gray-300 text-center px-2 py-1'>
                              <div className='font-semibold text-xs'>
                                {item.existingStock}
                              </div>
                            </TableCell>
                            <TableCell className='border border-gray-300 text-center px-2 py-1'>
                              <div className='font-semibold text-xs text-primary'>
                                {item.issuedQuantity}
                              </div>
                            </TableCell>
                            <TableCell className='border border-gray-300 text-center px-2 py-1'>
                              <div className='font-semibold text-xs'>
                                {item.stockAfterIssue}
                              </div>
                            </TableCell>
                            <TableCell className='border border-gray-300 px-2 py-1'>
                              <div className='font-medium text-xs'>
                                {item.recipientName}
                              </div>
                            </TableCell>
                            <TableCell className='border border-gray-300 px-2 py-1'>
                              {item.imagePath ? (
                                <div className='relative w-full h-16 mb-1'>
                                  <img
                                    src={`http://localhost:3000/${item.imagePath}`}
                                    alt='Material Image'
                                    className='h-full object-contain rounded-sm'
                                  />
                                </div>
                              ) : (
                                <span className='text-xs text-muted-foreground'>
                                  No image
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='border border-gray-300 px-2 py-1'>
                              <div className='text-xs'>
                                {item.purpose}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableComponent>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information - Matching MaterialIssueForm */}
              <Card>
                <CardContent className='space-y-3'>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Additional Notes</Label>
                    <div className='min-h-[60px] px-4 py-3 border border-input bg-background rounded-[5px] text-sm'>
                      {selectedIssue.additionalNotes || 'No additional notes'}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Issued By</Label>
                      <div className='input-friendly bg-secondary text-center py-2 font-semibold text-xs'>
                        {selectedIssue.issuingPersonName}
                      </div>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs'>Date</Label>
                      <div className='input-friendly bg-secondary text-center py-2 font-semibold text-xs'>
                        {new Date(selectedIssue.issuedDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs'>Unit</Label>
                      <div className='input-friendly bg-secondary text-center py-2 font-semibold text-xs'>
                        {selectedIssue.unitName}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions - Matching MaterialIssueForm */}
              <div className='flex justify-center gap-3 pt-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-2'
                  onClick={() => handleEditIssue(selectedIssue)}
                  disabled={!canEditIssue(selectedIssue.issuedDate)}
                  title={
                    canEditIssue(selectedIssue.issuedDate)
                      ? 'Edit issue'
                      : 'Cannot edit after 7 days'
                  }
                >
                  <Edit className='w-4 h-4' />
                  {canEditIssue(selectedIssue.issuedDate) ? 'Edit Form' : 'Cannot Edit (7+ days)'}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-2'
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  <X className='w-4 h-4' />
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
