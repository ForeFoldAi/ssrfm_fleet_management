import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  List,
  Table,
  Edit,
  Eye,
  Settings,
  MapPin,
  FileText,
  Building2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
import { AddMachineForm } from './AddMachineForm';
import { useRole } from '../contexts/RoleContext';
import { Machine, PaginatedResponse } from '../lib/api/types';
import { machinesApi } from '../lib/api/machines';
import { branchesApi } from '../lib/api/branches';
import { Branch } from '../lib/api/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { toast } from '../hooks/use-toast';

export const MachinesTab = () => {
  const { currentUser } = useRole();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<TransformedMachine | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [machinesData, setMachinesData] =
    useState<PaginatedResponse<Machine> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Changed default to 5 to match MaterialOrderBookTab
  const [error, setError] = useState<string | null>(null);

  // Available branches (units) for company owner - fetched from API
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

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

  // Fetch machines from API
  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'id',
        sortOrder: 'ASC' as const,
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

  // Load machines on component mount and when pagination changes
  useEffect(() => {
    fetchMachines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchQuery, filterUnit]);

  const handleAddMachine = (machineData: Machine) => {
    // After successfully adding a machine, refresh the data
    fetchMachines();
  };

  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.branch.toLowerCase().includes(searchQuery.toLowerCase());

    // Simple search filtering
    const shouldInclude = matchesSearch;

    return shouldInclude;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      Active: 'badge-status bg-success/10 text-success ring-1 ring-success/20',
      Maintenance:
        'badge-status bg-warning/10 text-warning ring-1 ring-warning/20',
      Inactive:
        'badge-status bg-destructive/10 text-destructive ring-1 ring-destructive/20',
    };
    return (
      badges[status as keyof typeof badges] ||
      'badge-status bg-muted text-muted-foreground'
    );
  };

  // Handle machine name click
  const handleMachineClick = (machine: TransformedMachine) => {
    setSelectedMachine(machine);
    setIsViewModalOpen(true);
  };

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

        {/* Right side: Search, Unit Filter and Add Machine Button */}
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
          <AlertDescription>{error}</AlertDescription>
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
                      Machine
                    </TableHead>
                    <TableHead className='min-w-[150px] text-foreground font-semibold'>
                      Type
                    </TableHead>
                    <TableHead className='min-w-[120px] text-foreground font-semibold'>
                      Unit
                    </TableHead>
                    <TableHead className='min-w-[100px] text-foreground font-semibold'>
                      Status
                    </TableHead>
                    <TableHead className='min-w-[120px] text-foreground font-semibold'>
                      Last Service
                    </TableHead>
                    <TableHead className='min-w-[140px] text-foreground font-semibold'>
                      Next Maintenance Due
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
          <Button
            className='btn-primary text-sm sm:text-base'
            onClick={() => setIsAddMachineOpen(true)}
          >
            <FileText className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
            {searchQuery ? 'Clear Search and Try Again' : 'Add First Machine'}
          </Button>
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

      {/* Machine View/Edit Modal */}
      {selectedMachine && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-3 text-xl'>
                <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
                  <Settings className='w-6 h-6 text-primary' />
                </div>
                Machine Details - {selectedMachine.name}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Machine Name</Label>
                    <p className='text-lg font-semibold text-foreground'>{selectedMachine.name}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Type</Label>
                    <p className='text-foreground'>{selectedMachine.type}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Status</Label>
                    <Badge className={`${getStatusBadge(selectedMachine.status)} text-xs`}>
                      {selectedMachine.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Unit</Label>
                    <p className='text-foreground'>{selectedMachine.unitName}</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Branch</Label>
                    <p className='text-foreground'>{selectedMachine.branch}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Created Date</Label>
                    <p className='text-foreground'>{selectedMachine.createdDate}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Last Service</Label>
                    <p className='text-foreground'>{selectedMachine.lastMaintenance}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Next Maintenance Due</Label>
                    <p className='text-foreground'>{selectedMachine.nextMaintenanceDue}</p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Specifications</Label>
                <p className='text-foreground mt-2 p-4 bg-muted/30 rounded-lg'>
                  {selectedMachine.specifications}
                </p>
              </div>
            </div>

            <div className='flex justify-end gap-4 pt-6 border-t'>
              <Button
                variant='outline'
                onClick={() => {
                  // Handle edit action - you can navigate to edit page or open edit modal
                  console.log('Edit machine:', selectedMachine.id);
                  // Example: navigate(`/machines/${selectedMachine.id}/edit`);
                }}
                className='gap-2'
              >
                <Edit className='w-4 h-4' />
                Edit Machine
              </Button>
              <Button
                variant='outline'
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Machine Form */}
      <AddMachineForm
        isOpen={isAddMachineOpen}
        onClose={() => setIsAddMachineOpen(false)}
        onSubmit={handleAddMachine}
      />
    </div>
  );
};
