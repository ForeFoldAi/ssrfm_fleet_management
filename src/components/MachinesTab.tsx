import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  List,
  Table,
  Settings,
  MapPin,
  Building2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  WifiOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
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
import { AddMachineForm } from './AddMachineForm';
import { useRole } from '../contexts/RoleContext';
import type { Machine, PaginatedResponse } from '../lib/api/types.d';
import { MachineStatus } from '../lib/api/types.d';
import { machinesApi } from '../lib/api/machines';
import { branchesApi } from '../lib/api/branches';
import type { Branch } from '../lib/api/types.d';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { toast } from '../hooks/use-toast';

type SortField = 'name' | 'status' | 'lastService' | 'nextMaintenanceDue' | 'createdAt';
type SortOrder = 'ASC' | 'DESC';

export const MachinesTab = () => {
  const { currentUser } = useRole();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<TransformedMachine | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [machinesData, setMachinesData] =
    useState<PaginatedResponse<Machine> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // Available branches (units) for company owner - fetched from API
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  // Define interface for transformed machine data
  interface TransformedMachine {
    id: number;
    name: string;
    type: string;
    status: string;
    createdDate: string;
    lastMaintenance: string;
    nextMaintenanceDue: string;
    specifications: string;
    unit: string;
    unitName: string;
    branch: string;
    // Manufacturing Details
    manufacturer: string;
    model: string;
    serialNumber: string;
    capacity: string;
    purchaseDate: string;
    warrantyExpiry: string;
    installationDate: string;
    additionalNotes: string;
  }

  // Helper function to format date to dd-mm-yyyy
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Transformed machines data for UI - initialize with empty array to avoid showing dummy data
  const [machines, setMachines] = useState<TransformedMachine[]>([]);

  // Handle column sorting - only for API-supported fields
  const handleSort = (field: SortField) => {
    // Only allow sorting on fields that the API supports
    const supportedSortFields: SortField[] = ['name', 'status', 'lastService', 'nextMaintenanceDue', 'createdAt'];
    
    if (!supportedSortFields.includes(field)) {
      // Show a message for unsupported sort fields
      toast({
        title: 'Sorting Not Available',
        description: 'Sorting is not available for this column.',
        variant: 'destructive',
      });
      return;
    }

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

  // Fetch branches for company owner
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

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch machines from API
  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortField,
        sortOrder: sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(filterUnit !== 'all' &&
          currentUser?.role === 'company_owner' && {
            branchId: filterUnit,
          }),
      };

      const response = await machinesApi.getAll(params);
      setMachinesData(response);

      // Transform API data to match component data structure
      const transformedMachines = response.data.map((machine) => {
        return {
          id: machine.id,
          name: machine.name,
          type: machine.type?.name || 'Unknown Type',
          status: machine.status,
          createdDate: formatDate(machine.createdAt),
          lastMaintenance: machine.lastService
            ? formatDate(machine.lastService)
            : 'Not serviced',
          nextMaintenanceDue: machine.nextMaintenanceDue
            ? formatDate(machine.nextMaintenanceDue)
            : 'Not scheduled',
          specifications:
            machine.specifications || 'No specifications available',
          unit: `unit-${machine.unit?.id || 1}`,
          unitName: machine.unit?.name || 'Unknown Unit',
          branch: machine.branch?.name || 'Unknown Location',
          // Manufacturing Details
          manufacturer: machine.manufacturer || '',
          model: machine.model || '',
          serialNumber: machine.serialNumber || '',
          capacity: machine.capacity || '',
          purchaseDate: machine.purchaseDate ? formatDate(machine.purchaseDate) : '',
          warrantyExpiry: machine.warrantyExpiry ? formatDate(machine.warrantyExpiry) : '',
          installationDate: machine.installationDate ? formatDate(machine.installationDate) : '',
          additionalNotes: machine.additionalNotes || '',
        };
      });

      setMachines(transformedMachines);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      // Cast to a common API error structure
      interface ApiErrorResponse {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
      const apiError = (error as ApiErrorResponse)?.response?.data?.message;
      console.error('Error fetching machines:', error);
      setError(
        apiError || errorMessage || 'Failed to load machines. Please try again.'
      );
      setMachines([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load machines on component mount and when pagination/sorting changes
  useEffect(() => {
    fetchMachines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchQuery, filterUnit, sortField, sortOrder]);

  // Update the handleAddMachine function to be async and add refresh to other operations
  const handleAddMachine = async (machineData: Machine) => {
    // After successfully adding/updating a machine, refresh the data
    await fetchMachines();
    setIsEditMode(false); // Reset edit mode
  };

  // Add function to handle machine updates
  const handleUpdateMachine = async (machineData: Machine) => {
    // After successfully updating a machine, refresh the data
    await fetchMachines();
    setIsEditMode(false);
  };

  // Add function to handle machine deletion (if needed)
  const handleDeleteMachine = async (machineId: number) => {
    try {
      await machinesApi.delete(machineId);
      await fetchMachines(); // Refresh the data
      toast({
        title: 'Success',
        description: 'Machine deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting machine:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete machine. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Add function to handle edit
  const handleEditMachine = (machine: TransformedMachine) => {
    setSelectedMachine(machine);
    setIsEditMode(true);
    setIsAddMachineOpen(true);
  };

  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.branch.toLowerCase().includes(searchQuery.toLowerCase());

    // Unit filtering - only apply if not 'all' and user is company owner
    const matchesUnit = 
      filterUnit === 'all' || 
      currentUser?.role !== 'company_owner' ||
      machine.unit === `unit-${filterUnit}`;

    return matchesSearch && matchesUnit;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      [MachineStatus.ACTIVE]: 'badge-status bg-success/10 text-success ring-1 ring-success/20',
      [MachineStatus.UNDER_MAINTENANCE]:
        'badge-status bg-warning/10 text-warning ring-1 ring-warning/20',
      [MachineStatus.INACTIVE]:
        'badge-status bg-destructive/10 text-destructive ring-1 ring-destructive/20',
    };
    return (
      badges[status as keyof typeof badges] ||
      'badge-status bg-muted text-muted-foreground'
    );
  };

  // Handle machine name click - open edit form with pre-filled data
  const handleMachineClick = (machine: TransformedMachine) => {
    setSelectedMachine(machine);
    setIsEditMode(true);
    setIsAddMachineOpen(true);
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Network Status Alert */}
      {!isOnline && (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Some features may not work properly. Please check your internet connection.
          </AlertDescription>
        </Alert>
      )}
      
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

        {/* Right side: Search, Unit Filter, Reload and Add Machine Button */}
        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input
              placeholder='Search machines...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 rounded-lg border-secondary focus:border-secondary focus:ring-0 outline-none h-10 w-64'
            />
          </div>

          {/* Unit Filter - Only for Company Owner */}
          {currentUser?.role === 'company_owner' && (
            <Select value={filterUnit} onValueChange={setFilterUnit}>
              <SelectTrigger className='w-full sm:w-48 rounded-lg border-secondary focus:border-secondary focus:ring-0'>
                <SelectValue placeholder={isLoadingBranches ? 'Loading...' : 'Select Unit'} />
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

          {/* Reload Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={fetchMachines}
            disabled={isLoading}
            className='w-full sm:w-auto'
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <RotateCcw className='w-4 h-4' />
            )}
            <span className='ml-2'>Reload</span>
          </Button>

          <Button
            className='btn-primary w-full sm:w-auto text-sm sm:text-base'
            onClick={() => setIsAddMachineOpen(true)}
          >
            <Plus className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
            Add New Machine
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant='destructive' className='mb-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className='flex items-center justify-between'>
            <span>{error}</span>
            <Button
              variant='outline'
              size='sm'
              onClick={fetchMachines}
              disabled={isLoading}
              className='ml-4'
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <RotateCcw className='w-4 h-4' />
              )}
              <span className='ml-2'>Retry</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className='flex justify-center items-center p-12'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
          <span className='ml-2 text-lg'>Loading machines...</span>
        </div>
      ) : /* Content */
      viewMode === 'list' ? (
        <div className='space-y-3'>
          {filteredMachines.map((machine) => (
            <div
              key={machine.id}
              className='card-friendly p-3 sm:p-4 hover:bg-secondary/30 transition-colors duration-200'
            >
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div className='flex items-start gap-3 flex-1 min-w-0'>
                  <div className='w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Settings className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-2 mb-2'>
                      <button
                        onClick={() => handleMachineClick(machine)}
                        className='font-semibold text-foreground text-sm sm:text-base text-left hover:text-primary hover:underline cursor-pointer transition-colors duration-200'
                      >
                        {machine.name}
                      </button>
                      <span className='text-primary font-semibold text-xs sm:text-sm'>
                        {machine.type}
                      </span>
                      <span
                        className={`${getStatusBadge(machine.status)} text-xs`}
                      >
                        {machine.status}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2'>
                      <MapPin className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                      <span className='truncate'>{machine.branch}</span>
                    </div>
                    <div className='flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2'>
                      <Building2 className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                      <span className='truncate'>{machine.unitName}</span>
                    </div>
                    <p className='text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2'>
                      {machine.specifications}
                    </p>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6 text-xs sm:text-sm'>
                      <span className='text-muted-foreground'>
                        Added:{' '}
                        <span className='font-medium text-foreground'>
                          {machine.createdDate}
                        </span>
                      </span>
                      <span className='text-muted-foreground'>
                        Last Service:{' '}
                        <span className='font-medium text-foreground'>
                          {machine.lastMaintenance}
                        </span>
                      </span>
                      <span className='text-muted-foreground'>
                        Next Due:{' '}
                        <span className='font-medium text-foreground'>
                          {machine.nextMaintenanceDue}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className='rounded-lg shadow-sm'>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <TableComponent>
                <TableHeader>
                  <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                    <TableHead className='min-w-[150px] text-foreground font-semibold'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('name')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Machine
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[150px] text-foreground font-semibold'>
                      Type
                    </TableHead>
                    <TableHead className='min-w-[120px] text-foreground font-semibold'>
                      Unit
                    </TableHead>
                    <TableHead className='min-w-[100px] text-foreground font-semibold'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('status')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Status
                        {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[120px] text-foreground font-semibold'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('lastService')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Last Service
                        {getSortIcon('lastService')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[140px] text-foreground font-semibold'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('nextMaintenanceDue')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Next Maintenance Due
                        {getSortIcon('nextMaintenanceDue')}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMachines.map((machine) => (
                    <TableRow
                      key={machine.id}
                      className='hover:bg-muted/30 border-b border-secondary/20'
                    >
                      <TableCell className='font-semibold text-foreground'>
                        <button
                          onClick={() => handleMachineClick(machine)}
                          className='text-primary hover:text-primary/80 hover:underline font-semibold cursor-pointer transition-colors duration-200'
                        >
                          {machine.name}
                        </button>
                      </TableCell>
                      <TableCell className='text-primary font-semibold'>
                        {machine.type}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                          <Building2 className='w-4 h-4' />
                          <span className='truncate max-w-24 sm:max-w-none'>
                            {machine.branch}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusBadge(
                            machine.status
                          )} text-xs`}
                        >
                          {machine.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {machine.lastMaintenance}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {machine.nextMaintenanceDue}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableComponent>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && filteredMachines.length === 0 && (
        <Card className='rounded-lg shadow-sm p-8 text-center'>
          <div className='w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4'>
            <Settings className='w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground' />
          </div>
          <h3 className='text-base sm:text-lg font-semibold text-foreground mb-2'>
            No machines found
          </h3>
          <p className='text-sm sm:text-base text-muted-foreground mb-4'>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Start by adding your first machine'}
          </p>
          
        </Card>
      )}

      {/* Pagination */}
      {machinesData && machinesData.meta && (
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
          {/* Page Info */}
          <div className='text-sm text-muted-foreground'>
            Showing {((machinesData.meta.page - 1) * machinesData.meta.limit) + 1} to{' '}
            {Math.min(machinesData.meta.page * machinesData.meta.limit, machinesData.meta.itemCount)} of{' '}
            {machinesData.meta.itemCount} entries
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
                  fetchMachines();
                }}
              >
                <SelectTrigger className='w-20 h-8'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                  fetchMachines();
                }}
                disabled={!machinesData.meta.hasPreviousPage || machinesData.meta.page === 1}
                className='h-8 w-8 p-0'
              >
                <ChevronsLeft className='w-4 h-4' />
              </Button>
              
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setCurrentPage(prev => prev - 1);
                  fetchMachines();
                }}
                disabled={!machinesData.meta.hasPreviousPage}
                className='h-8 w-8 p-0'
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>

              {/* Page numbers */}
              <div className='flex items-center gap-1 mx-2'>
                {Array.from({ length: Math.min(5, machinesData.meta.pageCount) }, (_, i) => {
                  let pageNum;
                  if (machinesData.meta.pageCount <= 5) {
                    pageNum = i + 1;
                  } else if (machinesData.meta.page <= 3) {
                    pageNum = i + 1;
                  } else if (machinesData.meta.page >= machinesData.meta.pageCount - 2) {
                    pageNum = machinesData.meta.pageCount - 4 + i;
                  } else {
                    pageNum = machinesData.meta.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={machinesData.meta.page === pageNum ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => {
                        setCurrentPage(pageNum);
                        fetchMachines();
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
                  fetchMachines();
                }}
                disabled={!machinesData.meta.hasNextPage}
                className='h-8 w-8 p-0'
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
              
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setCurrentPage(machinesData.meta.pageCount);
                  fetchMachines();
                }}
                disabled={!machinesData.meta.hasNextPage || machinesData.meta.page === machinesData.meta.pageCount}
                className='h-8 w-8 p-0'
              >
                <ChevronsRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Add/Edit Machine Form */}
      <AddMachineForm
        isOpen={isAddMachineOpen}
        onClose={() => {
          setIsAddMachineOpen(false);
          setIsEditMode(false);
          setSelectedMachine(null);
        }}
        onSubmit={isEditMode ? handleUpdateMachine : handleAddMachine}
        editingData={isEditMode ? selectedMachine : null}
      />
    </div>
  );
};
