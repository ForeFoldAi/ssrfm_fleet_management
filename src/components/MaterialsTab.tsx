import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  List,
  Table,
  Edit,
  Eye,
  Package,
  FileText,
  Building2,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { AddMaterialForm } from './AddMaterialForm';
import { useRole } from '../contexts/RoleContext';
import { materialsApi } from '../lib/api/materials';
import { Material, MaterialCategory, Unit } from '../lib/api/types';
import { getMaterialCategories, getUnits } from '../lib/api/common';
import { branchesApi } from '../lib/api/branches';
import { Branch } from '../lib/api/types';
import { toast } from '../hooks/use-toast';

type SortField =
  | 'name'
  | 'specifications'
  | 'currentStock'
  | 'makerBrand'
  | 'createdAt';
type SortOrder = 'ASC' | 'DESC';

export const MaterialsTab = () => {
  const { currentUser, hasPermission } = useRole();
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isViewEditOpen, setIsViewEditOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC');

  // API state management - updated to match MachinesTab structure
  const [materials, setMaterials] = useState<Material[]>([]);
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Changed default to 5 to match MachinesTab
  const [materialsData, setMaterialsData] = useState<{
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

  // Add state for material categories
  const [materialCategories, setMaterialCategories] = useState<MaterialCategory[]>([]);

  // Fetch materials from API
  const fetchMaterials = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

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

      const response = await materialsApi.getMaterials(params);
      setMaterialsData(response);
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches for filtering (only for company owners)
  const fetchBranches = async () => {
    if (currentUser?.role !== 'company_owner') return;

    try {
      setIsLoadingBranches(true);
      const response = await branchesApi.getAll({ limit: 100 });
      setAvailableBranches(response.data);
    } catch (err) {
      console.error('Error fetching units:', err);
      toast({
        title: 'Error',
        description: 'Failed to load units. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBranches(false);
    }
  };

  // Fetch units for measure unit display
  const fetchUnits = async () => {
    try {
      const response = await getUnits({ limit: 100 });
      console.log('Fetched units:', response.data);
      setUnits(response.data || []);
    } catch (err) {
      console.error('Error fetching units:', err);
    }
  };

  // Fetch material categories
  const fetchMaterialCategories = async () => {
    try {
      const response = await getMaterialCategories({ limit: 100 });
      setMaterialCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Get unit name by ID
  const getUnitName = (unitId?: number) => {
    if (!unitId) return '';
    const unit = units.find(u => u.id === unitId);
    console.log('Looking for unitId:', unitId, 'Found unit:', unit, 'All units:', units);
    return unit?.name || '';
  };

  // Get category name by ID
  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return '';
    const category = materialCategories.find(cat => cat.id === categoryId);
    return category?.name || '';
  };

  // Remove the calculateAveragePrice function and replace with this:
  const getAveragePrice = (material: Material) => {
    // Use averageValue from API if available, otherwise fallback to calculation
    if (material.averageValue !== undefined && material.averageValue !== null) {
      return material.averageValue.toFixed(2);
    }
    
    // Fallback calculation if averageValue is not provided
    const totalValue = material.totalValue || 0;
    const currentStock = material.currentStock || 0;
    
    if (currentStock === 0) return '0.00';
    return (totalValue / currentStock).toFixed(2);
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

  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Helper function to check if material can be edited (within 7 days)
  const canEditMaterial = (createdAt: string) => {
    const createDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Initial data fetch
  useEffect(() => {
    fetchMaterials();
    fetchBranches();
    fetchUnits();
    fetchMaterialCategories(); // Add this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when search, filter, or sorting changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMaterials(1, itemsPerPage);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterUnit, sortField, sortOrder, itemsPerPage]);

  // Load materials when pagination changes
  useEffect(() => {
    fetchMaterials(currentPage, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  const handleAddMaterial = (materialData: Material) => {
    // Refresh the materials list after adding
    fetchMaterials(currentPage, itemsPerPage);
  };

  const getStockStatus = (currentStock: number, minStockLevel: number) => {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock <= minStockLevel) return 'Low Stock';
    return 'In Stock';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'In Stock':
        'bg-green-500 text-white border-green-600 hover:bg-green-500 hover:text-white',
      'Low Stock':
        'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-500 hover:text-white',
      'Out of Stock':
        'bg-red-500 text-white border-red-600 hover:bg-red-500 hover:text-white',
    };
    return (
      badges[status as keyof typeof badges] ||
      'bg-gray-500 text-white border-gray-600 hover:bg-gray-500 hover:text-white'
    );
  };

  const handleMaterialClick = (material: Material) => {
    if (canEditMaterial(material.createdAt)) {
      setSelectedMaterial(material);
      setIsEditMode(true);
      setIsViewEditOpen(true);
    } else {
      toast({
        title: 'Cannot Edit Material',
        description: "This material cannot be edited as it's more than 7 days old. Only recent materials (within 7 days) can be modified.",
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (e: React.MouseEvent, material: Material) => {
    e.stopPropagation();
    if (canEditMaterial(material.createdAt)) {
      setSelectedMaterial(material);
      setIsEditMode(true);
      setIsViewEditOpen(true);
    } else {
      toast({
        title: 'Cannot Edit Material',
        description: "This material cannot be edited as it's more than 7 days old. Only recent materials (within 7 days) can be modified.",
        variant: 'destructive',
      });
    }
  };

  const handleViewEditClose = () => {
    setIsViewEditOpen(false);
    setSelectedMaterial(null);
    setIsEditMode(false);
  };

  if (loading && materials.length === 0) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='flex items-center gap-3'>
          <Loader2 className='w-6 h-6 animate-spin text-primary' />
          <span className='text-muted-foreground'>Loading materials...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className='rounded-lg shadow-sm p-8 text-center'>
        <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Package className='w-6 h-6 text-red-600' />
        </div>
        <h3 className='text-lg font-semibold text-foreground mb-2'>
          Error Loading Materials
        </h3>
        <p className='text-muted-foreground mb-4'>{error}</p>
        <Button onClick={() => fetchMaterials()} className='btn-primary'>
          Try Again
        </Button>
      </Card>
    );
  }

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

        {/* Right side: Search, Unit Filter and Add Material Button */}
        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input
              placeholder='Search materials, specifications, model/version...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 rounded-lg border-secondary focus:border-secondary focus:ring-0 outline-none h-10 w-64'
            />
          </div>

          {/* Unit Filter - Only for Company Owner */}
          {currentUser?.role === 'company_owner' && (
            <Select value={filterUnit} onValueChange={setFilterUnit}>
              <SelectTrigger className='w-full sm:w-48 rounded-lg border-secondary focus:border-secondary focus:ring-0 h-10'>
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
            onClick={() => setIsAddMaterialOpen(true)}
          >
            <Plus className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
            Add New Material
          </Button>
        </div>
      </div>

      {/* Loading indicator for subsequent loads */}
      {loading && materials.length > 0 && (
        <div className='flex items-center justify-center p-4'>
          <Loader2 className='w-5 h-5 animate-spin text-primary' />
        </div>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        // List View for Materials - Matching MaterialIssuesTab structure
        <Card className='rounded-lg shadow-sm'>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <TableComponent>
                <TableHeader>
                  <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                    <TableHead className='w-12'></TableHead>
                    <TableHead className='w-48 text-foreground font-semibold'>
                      Material Name
                    </TableHead>
                    <TableHead className='w-64 text-foreground font-semibold'>
                      Specifications
                    </TableHead>
                    <TableHead className='w-32 text-foreground font-semibold'>
                      Current Stock
                    </TableHead>
                    <TableHead className='w-40 text-foreground font-semibold'>
                      Avg.Purchased Price (₹)
                    </TableHead>
                    <TableHead className='w-32 text-foreground font-semibold'>
                    Stock Indicator
                    </TableHead>
                    <TableHead className='w-36 text-foreground font-semibold'>
                      Model/Version
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => {
                    const stockStatus = getStockStatus(
                      material.currentStock,
                      material.minStockLevel
                    );
                    return (
                      <TableRow
                        key={material.id}
                        className='hover:bg-muted/30 border-b border-secondary/20 cursor-pointer'
                        onClick={() => handleMaterialClick(material)}
                      >
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(material.id.toString());
                            }}
                          >
                            {expandedRows.has(material.id.toString()) ? (
                              <ChevronDown className='w-4 h-4' />
                            ) : (
                              <ChevronRight className='w-4 h-4' />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className='font-medium'>
                          <span className='font-medium text-foreground hover:text-primary transition-colors'>
                            {material.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm text-muted-foreground truncate max-w-40'>
                            {material.specifications}
                          </div>
                        </TableCell>
                        <TableCell className='text-sm'>
                          <div className='font-semibold text-foreground'>
                            {material.currentStock} {material.unit || getUnitName(material.unitId) || 'units'}
                          </div>
                        </TableCell>
                        <TableCell className='text-sm'>
                          <div className='font-semibold text-foreground'>
                            ₹{getAveragePrice(material)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(stockStatus)}>
                            {stockStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm text-muted-foreground'>
                            {material.makerBrand}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableComponent>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className='rounded-lg shadow-sm'>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <TableComponent>
                <TableHeader>
                  <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                    <TableHead className='w-48 text-foreground font-semibold'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('name')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Material
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead className='w-64 text-foreground font-semibold'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('specifications')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Specifications
                        {getSortIcon('specifications')}
                      </Button>
                    </TableHead>
                    <TableHead className='w-32 text-foreground font-semibold'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('currentStock')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Current Stock
                        {getSortIcon('currentStock')}
                      </Button>
                    </TableHead>
                    <TableHead className='w-40 text-foreground font-semibold'>
                    Avg.Purchased Price (₹)
                    </TableHead>
                    <TableHead className='w-32 text-foreground font-semibold'>
                    Stock Indicator
                    </TableHead>
                    <TableHead className='w-36 text-foreground font-semibold'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('makerBrand')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Model/Version
                        {getSortIcon('makerBrand')}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => {
                    const stockStatus = getStockStatus(
                      material.currentStock,
                      material.minStockLevel
                    );
                    return (
                      <TableRow
                        key={material.id}
                        className='hover:bg-muted/30 border-b border-secondary/20 cursor-pointer'
                        onClick={() => handleMaterialClick(material)}
                      >
                        <TableCell className='font-semibold text-foreground'>
                          <span className='font-semibold text-foreground hover:text-primary transition-colors'>
                            {material.name}
                          </span>
                        </TableCell>
                        <TableCell className='text-muted-foreground max-w-xs truncate hover:text-primary transition-colors'>
                          {material.specifications}
                        </TableCell>
                        <TableCell className='font-semibold text-foreground'>
                          {material.currentStock} {material.unit || getUnitName(material.unitId) || 'units'}
                        </TableCell>
                        <TableCell className='font-semibold text-foreground'>
                          ₹{getAveragePrice(material)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(stockStatus)}>
                            {stockStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground truncate max-w-32 hover:text-primary transition-colors'>
                          {material.makerBrand}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableComponent>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination - Updated to match MachinesTab */}
      {materialsData && materialsData.meta && (
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
          {/* Page Info */}
          <div className='text-sm text-muted-foreground'>
            Showing{' '}
            {(materialsData.meta.page - 1) * materialsData.meta.limit + 1} to{' '}
            {Math.min(
              materialsData.meta.page * materialsData.meta.limit,
              materialsData.meta.itemCount
            )}{' '}
            of {materialsData.meta.itemCount} entries
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
                  fetchMaterials(1, newLimit);
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
                  fetchMaterials(1, itemsPerPage);
                }}
                disabled={
                  !materialsData.meta.hasPreviousPage ||
                  materialsData.meta.page === 1
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
                  fetchMaterials(currentPage - 1, itemsPerPage);
                }}
                disabled={!materialsData.meta.hasPreviousPage}
                className='h-8 w-8 p-0'
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>

              {/* Page numbers */}
              <div className='flex items-center gap-1 mx-2'>
                {Array.from(
                  { length: Math.min(5, materialsData.meta.pageCount) },
                  (_, i) => {
                    let pageNum;
                    if (materialsData.meta.pageCount <= 5) {
                      pageNum = i + 1;
                    } else if (materialsData.meta.page <= 3) {
                      pageNum = i + 1;
                    } else if (
                      materialsData.meta.page >=
                      materialsData.meta.pageCount - 2
                    ) {
                      pageNum = materialsData.meta.pageCount - 4 + i;
                    } else {
                      pageNum = materialsData.meta.page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          materialsData.meta.page === pageNum
                            ? 'default'
                            : 'outline'
                        }
                        size='sm'
                        onClick={() => {
                          setCurrentPage(pageNum);
                          fetchMaterials(pageNum, itemsPerPage);
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
                  fetchMaterials(currentPage + 1, itemsPerPage);
                }}
                disabled={!materialsData.meta.hasNextPage}
                className='h-8 w-8 p-0'
              >
                <ChevronRight className='w-4 h-4' />
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setCurrentPage(materialsData.meta.pageCount);
                  fetchMaterials(materialsData.meta.pageCount, itemsPerPage);
                }}
                disabled={
                  !materialsData.meta.hasNextPage ||
                  materialsData.meta.page === materialsData.meta.pageCount
                }
                className='h-8 w-8 p-0'
              >
                <ChevronsRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {materials.length === 0 && !loading && (
        <Card className='rounded-lg shadow-sm p-8 text-center'>
          <div className='w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4'>
            <Package className='w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground' />
          </div>
          <h3 className='text-base sm:text-lg font-semibold text-foreground mb-2'>
            No materials found
          </h3>
          <p className='text-sm sm:text-base text-muted-foreground mb-4'>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Start by adding your first material'}
          </p>
         
        </Card>
      )}

      {/* Add Material Form */}
      <AddMaterialForm
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        onSubmit={handleAddMaterial}
      />

      {/* Edit Material Dialog */}
      <Dialog open={isViewEditOpen} onOpenChange={handleViewEditClose}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader className='flex flex-row items-center justify-between'>
            <DialogTitle className='text-xl font-semibold'>
              Edit Material
            </DialogTitle>
          </DialogHeader>

          {selectedMaterial && (
            <form className='space-y-6 py-4'>
              {/* Material Information Section */}
              <div className='space-y-4'>
                {/* First Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Material Name *
                    </Label>
                    <Input
                      defaultValue={selectedMaterial.name}
                      className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>Category *</Label>
                    <Select defaultValue={getCategoryName(selectedMaterial.categoryId)}>
                      <SelectTrigger className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'>
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <SelectContent>
                        {materialCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Second Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Measure Unit *
                    </Label>
                    <Select defaultValue={getUnitName(selectedMaterial.unitId)}>
                      <SelectTrigger className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'>
                        <SelectValue placeholder='Select Measure unit' />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.name}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>Make/Brand</Label>
                    <Input
                      defaultValue={selectedMaterial.makerBrand}
                      className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                    />
                  </div>
                </div>

                {/* Third Row - Current Stock (Read-only) and Total Value */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Current Stock *
                    </Label>
                    <Input
                      type='number'
                      step='0.01'
                      defaultValue={selectedMaterial.currentStock}
                      disabled={!canEditMaterial(selectedMaterial.createdAt)}
                      className={`h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200 ${
                        !canEditMaterial(selectedMaterial.createdAt) 
                          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                          : ''
                      }`}
                    />
                    {!canEditMaterial(selectedMaterial.createdAt) && (
                      <p className='text-xs text-muted-foreground'>
                        Current stock cannot be edited for materials older than 7 days
                      </p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Total Value (₹) *
                    </Label>
                    <Input
                      type='number'
                      step='0.01'
                      defaultValue={(selectedMaterial as any).totalValue || '0.00'}
                      className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                    />
                  </div>
                </div>

                {/* Specifications */}
                <div className='space-y-1'>
                  <Label className='text-sm font-medium'>
                    Specifications *
                  </Label>
                  <Textarea
                    defaultValue={selectedMaterial.specifications}
                    className='min-h-[80px] px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                  />
                </div>

                {/* Additional Notes */}
                <div className='space-y-1'>
                  <Label className='text-sm font-medium'>
                    Additional Notes
                  </Label>
                  <Textarea
                    defaultValue={selectedMaterial.additionalNotes || ''}
                    className='min-h-[60px] px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end space-x-2 pt-4 border-t'>
                <Button type='button' variant='outline' onClick={handleViewEditClose}>
                  Cancel
                </Button>
                <Button type='submit'>
                  <Edit className='w-4 h-4 mr-2' />
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
