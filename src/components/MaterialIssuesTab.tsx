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
import { MaterialIssueForm } from './MaterialIssueForm';
import { toast } from '../hooks/use-toast';
import { useRole } from '../contexts/RoleContext';

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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

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
      const response = await materialIssuesApi.getAll({
        page,
        limit,
        sortBy: 'id',
        sortOrder: 'DESC', // Most recent first
      });
      // Validate response structure
      if (!response || !response.data || !response.meta) {
        throw new Error('Invalid response format from API');
      }

      setPagination({
        page: response.meta.page,
        limit: response.meta.limit,
        itemCount: response.meta.itemCount,
        pageCount: response.meta.pageCount,
        hasPreviousPage: response.meta.hasPreviousPage,
        hasNextPage: response.meta.hasNextPage,
      });

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
      originalItem: item,
    }));

    // Create a transformed issue with all items
    return {
      id: issue.uniqueId,
      materialIssueFormSrNo: issue.uniqueId,
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

  // Load material issues on component mount
  useEffect(() => {
    fetchMaterialIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setEditingIssue(issue);
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
      fetchMaterialIssues();

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

  // Refetch when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMaterialIssues(pagination.page, pagination.limit);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterUnit]);

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
              placeholder='Search issues...'
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
            Issued Materials
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
                        Issue ID
                      </TableHead>
                      <TableHead className='min-w-[150px] text-foreground font-semibold'>
                        Issued Material
                      </TableHead>
                      <TableHead className='min-w-[100px] text-foreground font-semibold'>
                        Stock Info
                      </TableHead>
                      <TableHead className='min-w-[100px] text-foreground font-semibold'>
                        Issued Date
                      </TableHead>

                      <TableHead className='min-w-[120px] text-foreground font-semibold'>
                        Issued To
                      </TableHead>
                      <TableHead className='min-w-[120px] text-foreground font-semibold'>
                        Issued By
                      </TableHead>
                      <TableHead className='min-w-[100px] text-foreground font-semibold'>
                        Unit
                      </TableHead>
                      <TableHead className='min-w-[80px] text-foreground font-semibold'>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <>
                        {/* Parent row showing issue information */}
                        <TableRow
                          key={issue.id}
                          className='bg-secondary/10 hover:bg-secondary/20 border-b border-secondary/20'
                        >
                          <TableCell className='font-medium'>
                            <Button
                              variant='link'
                              className='p-0 h-auto text-left font-medium text-primary hover:text-primary/80 uppercase'
                              onClick={() => handleViewIssue(issue)}
                            >
                              {issue.id}
                            </Button>
                            <div className='text-xs text-muted-foreground uppercase'>
                              Form: {issue.materialIssueFormSrNo}
                            </div>
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
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => toggleRowExpansion(issue.id)}
                                className='h-8 w-8 p-0'
                                title='View items'
                              >
                                {expandedRows.has(issue.id) ? (
                                  <ChevronDown className='w-4 h-4' />
                                ) : (
                                  <ChevronRight className='w-4 h-4' />
                                )}
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleEditIssue(issue)}
                                disabled={!canEditIssue(issue.issuedDate)}
                                className='h-8 w-8 p-0'
                                title={
                                  canEditIssue(issue.issuedDate)
                                    ? 'Edit issue'
                                    : 'Cannot edit after 7 days'
                                }
                              >
                                <Edit className='w-4 h-4' />
                              </Button>
                            </div>
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
                              <TableCell>
                                {item.imagePath && (
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='h-8 w-8 p-0'
                                    title='View image'
                                  >
                                    <Eye className='w-4 h-4' />
                                  </Button>
                                )}
                              </TableCell>
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
                        Issue ID
                      </TableHead>
                      <TableHead className='min-w-[150px] text-foreground font-semibold'>
                        Materials
                      </TableHead>
                      <TableHead className='min-w-[100px] text-foreground font-semibold'>
                        Items
                      </TableHead>
                      <TableHead className='min-w-[120px] text-foreground font-semibold'>
                        Recipients
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
                      <TableHead className='min-w-[80px] text-foreground font-semibold'>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <>
                        <TableRow
                          key={issue.id}
                          className='hover:bg-muted/30 border-b border-secondary/20'
                        >
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-6 w-6 p-0'
                              onClick={() => toggleRowExpansion(issue.id)}
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
                              className='p-0 h-auto text-left font-medium text-primary hover:text-primary/80'
                              onClick={() => handleViewIssue(issue)}
                            >
                              {issue.id}
                            </Button>
                            <div className='text-xs text-muted-foreground'>
                              Form: {issue.materialIssueFormSrNo}
                            </div>
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
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleEditIssue(issue)}
                                disabled={!canEditIssue(issue.issuedDate)}
                                className='h-8 w-8 p-0'
                                title={
                                  canEditIssue(issue.issuedDate)
                                    ? 'Edit issue'
                                    : 'Cannot edit after 7 days'
                                }
                              >
                                <Edit className='w-4 h-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Detail Row */}
                        {expandedRows.has(issue.id) && (
                          <TableRow>
                            <TableCell colSpan={9} className='p-0'>
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
                                            <div className='font-medium'>
                                              {issue.id}
                                            </div>
                                          </div>
                                          <div>
                                            <span className='font-medium text-muted-foreground'>
                                              Form Number:
                                            </span>
                                            <div className='font-medium'>
                                              {issue.materialIssueFormSrNo}
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

      {/* Issue Details View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Package className='w-5 h-5' />
              Material Issue Details - {selectedIssue?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedIssue && (
            <div className='space-y-6'>
              {/* Issue Information */}
              <div className='grid grid-cols-1 gap-6'>
                <Card>
                  <CardContent className='p-4'>
                    <h3 className='font-semibold mb-3'>Issue Information</h3>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Issue ID:</span>
                        <span className='font-medium'>{selectedIssue.id}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Form Number:
                        </span>
                        <span className='font-medium'>
                          {selectedIssue.materialIssueFormSrNo}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Issue Date:
                        </span>
                        <span className='font-medium'>
                          {new Date(
                            selectedIssue.issuedDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Additional Notes:
                        </span>
                        <span className='font-medium text-right max-w-48'>
                          {selectedIssue.additionalNotes || 'None'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Personnel Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card>
                  <CardContent className='p-4'>
                    <h3 className='font-semibold mb-3'>Issuing Person</h3>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Name:</span>
                        <span className='font-medium'>
                          {selectedIssue.issuingPersonName}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Designation:
                        </span>
                        <span className='font-medium'>
                          {selectedIssue.issuingPersonDesignation}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-4'>
                    <h3 className='font-semibold mb-3'>Unit Information</h3>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Unit:</span>
                        <span className='font-medium'>
                          {selectedIssue.unitName}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Unit Code:
                        </span>
                        <span className='font-medium'>
                          {selectedIssue.unit}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Material Items Table */}
              <Card>
                <CardContent className='p-4'>
                  <h3 className='font-semibold mb-3'>
                    Material Items ({selectedIssue.items.length})
                  </h3>

                  <div className='overflow-x-auto'>
                    <TableComponent>
                      <TableHeader>
                        <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                          <TableHead className='w-10'>#</TableHead>
                          <TableHead>Material</TableHead>
                          <TableHead>Specifications</TableHead>
                          <TableHead>Stock Before</TableHead>
                          <TableHead>Issued Qty</TableHead>
                          <TableHead>Stock After</TableHead>
                          <TableHead>Receiver</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Image</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedIssue.items.map((item, index) => (
                          <TableRow
                            key={`item-${index}`}
                            className='hover:bg-muted/30'
                          >
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className='font-medium'>
                              {item.materialName}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {item.specifications}
                            </TableCell>
                            <TableCell>{item.existingStock}</TableCell>
                            <TableCell className='font-medium text-primary'>
                              {item.issuedQuantity}
                            </TableCell>
                            <TableCell>{item.stockAfterIssue}</TableCell>
                            <TableCell>{item.recipientName}</TableCell>
                            <TableCell className='text-sm'>
                              {item.purpose}
                            </TableCell>
                            <TableCell>
                              {item.imagePath ? (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='h-8 w-8 p-0'
                                  title='View image'
                                >
                                  <Eye className='w-4 h-4' />
                                </Button>
                              ) : (
                                <span className='text-xs text-muted-foreground'>
                                  No image
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableComponent>
                  </div>
                </CardContent>
              </Card>
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
            ? ({ ...editingIssue } as unknown as Record<string, unknown>)
            : undefined
        }
      />
    </div>
  );
};
