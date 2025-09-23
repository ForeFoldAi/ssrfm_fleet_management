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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
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
import { getUnits } from '../lib/api/common';
import { getMaterialCategories } from '../lib/api/common';
import { toast } from '../hooks/use-toast';

type SortField = 'name' | 'specifications' | 'currentStock' | 'makerBrand' | 'createdAt';
type SortOrder = 'ASC' | 'DESC';

export const MaterialsTab = () => {
  const { currentUser, hasPermission } = useRole();
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isViewEditOpen, setIsViewEditOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC');

  // API state management - updated to match MachinesTab structure
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Changed default to 5 to match MachinesTab
  const [materialsData, setMaterialsData] = useState<any>(null);

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
            unitId: filterUnit,
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

  // Fetch units for filtering (only for company owners)
  const fetchUnits = async () => {
    if (currentUser?.role !== 'company_owner') return;

    try {
      const response = await getUnits({ limit: 100 });
      setUnits(response.data);
    } catch (err) {
      console.error('Error fetching units:', err);
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

  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Initial data fetch
  useEffect(() => {
    fetchMaterials();
    fetchUnits();
  }, []);

  // Refetch when search, filter, or sorting changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMaterials(1, itemsPerPage);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterUnit, sortField, sortOrder]);

  // Load materials when pagination changes
  useEffect(() => {
    fetchMaterials(currentPage, itemsPerPage);
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
    setSelectedMaterial(material);
    setIsEditMode(false);
    setIsViewEditOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, material: Material) => {
    e.stopPropagation();
    setSelectedMaterial(material);
    setIsEditMode(true);
    setIsViewEditOpen(true);
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
              placeholder='Search materials, specifications, make/brand...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 rounded-lg border-secondary focus:border-secondary focus:ring-0 outline-none h-10 w-64'
            />
          </div>

          {/* Unit Filter - Only for Company Owner */}
          {currentUser?.role === 'company_owner' && units.length > 0 && (
            <Select value={filterUnit} onValueChange={setFilterUnit}>
              <SelectTrigger className='w-full sm:w-48 rounded-lg border-secondary focus:border-secondary focus:ring-0 h-10'>
                <SelectValue placeholder='Select Unit' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Units</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    <div className='flex items-center gap-2'>
                      <Building2 className='w-4 h-4' />
                      <div>
                        <div className='font-medium'>{unit.name}</div>
                        {unit.description && (
                          <div className='text-xs text-muted-foreground'>
                            {unit.description}
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
                    <TableHead className='min-w-[150px] text-foreground font-semibold'>
                      Material Name
                    </TableHead>
                    <TableHead className='min-w-[200px] text-foreground font-semibold'>
                      Specifications
                    </TableHead>
                    <TableHead className='min-w-[100px] text-foreground font-semibold'>
                      Current Stock
                    </TableHead>
                    <TableHead className='min-w-[100px] text-foreground font-semibold'>
                      Stock Status
                    </TableHead>
                    <TableHead className='min-w-[120px] text-foreground font-semibold'>
                      Make/Brand
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
                            {material.currentStock} {material.unit}
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
                    <TableHead className='min-w-[150px] text-foreground font-semibold'>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2"
                      >
                        Material
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[200px] text-foreground font-semibold'>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('specifications')}
                        className="h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2"
                      >
                        Specifications
                        {getSortIcon('specifications')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[100px] text-foreground font-semibold'>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('currentStock')}
                        className="h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2"
                      >
                        Current Stock
                        {getSortIcon('currentStock')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[100px] text-foreground font-semibold'>
                      Stock Status
                    </TableHead>
                    <TableHead className='min-w-[120px] text-foreground font-semibold'>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('makerBrand')}
                        className="h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2"
                      >
                        Make/Brand
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
                          {material.currentStock} {material.unit}
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
            Showing {((materialsData.meta.page - 1) * materialsData.meta.limit) + 1} to{' '}
            {Math.min(materialsData.meta.page * materialsData.meta.limit, materialsData.meta.itemCount)} of{' '}
            {materialsData.meta.itemCount} entries
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
                disabled={!materialsData.meta.hasPreviousPage || materialsData.meta.page === 1}
                className='h-8 w-8 p-0'
              >
                <ChevronsLeft className='w-4 h-4' />
              </Button>
              
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setCurrentPage(prev => prev - 1);
                  fetchMaterials(currentPage - 1, itemsPerPage);
                }}
                disabled={!materialsData.meta.hasPreviousPage}
                className='h-8 w-8 p-0'
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>

              {/* Page numbers */}
              <div className='flex items-center gap-1 mx-2'>
                {Array.from({ length: Math.min(5, materialsData.meta.pageCount) }, (_, i) => {
                  let pageNum;
                  if (materialsData.meta.pageCount <= 5) {
                    pageNum = i + 1;
                  } else if (materialsData.meta.page <= 3) {
                    pageNum = i + 1;
                  } else if (materialsData.meta.page >= materialsData.meta.pageCount - 2) {
                    pageNum = materialsData.meta.pageCount - 4 + i;
                  } else {
                    pageNum = materialsData.meta.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={materialsData.meta.page === pageNum ? 'default' : 'outline'}
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
                })}
              </div>

              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setCurrentPage(prev => prev + 1);
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
                disabled={!materialsData.meta.hasNextPage || materialsData.meta.page === materialsData.meta.pageCount}
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
          <Button
            className='btn-primary text-sm sm:text-base'
            onClick={() => setIsAddMaterialOpen(true)}
          >
            <FileText className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
            Add First Material
          </Button>
        </Card>
      )}

      {/* Add Material Form */}
      <AddMaterialForm
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        onSubmit={handleAddMaterial}
      />

      {/* View/Edit Material Dialog */}
      <Dialog open={isViewEditOpen} onOpenChange={handleViewEditClose}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold'>
              {isEditMode ? 'Edit Material' : 'View Material'}
            </DialogTitle>
          </DialogHeader>

          {selectedMaterial && (
            <div className='space-y-6 py-4'>
              {/* Material Information */}
              <div className='space-y-4'>
                {/* First Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Material Name *
                    </Label>
                    {isEditMode ? (
                      <Input
                        defaultValue={selectedMaterial.name}
                        className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                      />
                    ) : (
                      <p className='text-sm text-foreground py-2'>{selectedMaterial.name}</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Make/Brand
                    </Label>
                    {isEditMode ? (
                      <Input
                        defaultValue={selectedMaterial.makerBrand}
                        className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                      />
                    ) : (
                      <p className='text-sm text-foreground py-2'>{selectedMaterial.makerBrand}</p>
                    )}
                  </div>
                </div>

                {/* Second Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Current Stock *
                    </Label>
                    <p className='text-sm text-foreground py-2 font-semibold'>
                      {selectedMaterial.currentStock} {selectedMaterial.unit}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Current stock cannot be edited from here
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Measure Unit
                    </Label>
                    <p className='text-sm text-foreground py-2'>{selectedMaterial.unit}</p>
                  </div>
                </div>

                {/* Third Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Min Stock Level
                    </Label>
                    {isEditMode ? (
                      <Input
                        type='number'
                        defaultValue={selectedMaterial.minStockLevel || ''}
                        className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                      />
                    ) : (
                      <p className='text-sm text-foreground py-2'>
                        {selectedMaterial.minStockLevel || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Max Stock Level
                    </Label>
                    {isEditMode ? (
                      <Input
                        type='number'
                        defaultValue={selectedMaterial.maxStockLevel || ''}
                        className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                      />
                    ) : (
                      <p className='text-sm text-foreground py-2'>
                        {selectedMaterial.maxStockLevel || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Specifications */}
                <div className='space-y-1'>
                  <Label className='text-sm font-medium'>
                    Specifications *
                  </Label>
                  {isEditMode ? (
                    <Textarea
                      defaultValue={selectedMaterial.specifications}
                      className='min-h-[80px] px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                    />
                  ) : (
                    <p className='text-sm text-foreground py-2 whitespace-pre-wrap'>
                      {selectedMaterial.specifications}
                    </p>
                  )}
                </div>

                {/* Additional Notes */}
                {selectedMaterial.additionalNotes && (
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium'>
                      Additional Notes
                    </Label>
                    {isEditMode ? (
                      <Textarea
                        defaultValue={selectedMaterial.additionalNotes}
                        className='min-h-[60px] px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                      />
                    ) : (
                      <p className='text-sm text-foreground py-2 whitespace-pre-wrap'>
                        {selectedMaterial.additionalNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end space-x-2 pt-4 border-t'>
                <Button variant='outline' onClick={handleViewEditClose}>
                  {isEditMode ? 'Cancel' : 'Close'}
                </Button>
                {!isEditMode && (
                  <Button onClick={() => setIsEditMode(true)}>
                    <Edit className='w-4 h-4 mr-2' />
                    Edit Material
                  </Button>
                )}
                {isEditMode && (
                  <Button>
                    <Edit className='w-4 h-4 mr-2' />
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
