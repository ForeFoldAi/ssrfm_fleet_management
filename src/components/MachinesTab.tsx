import { useState, useEffect } from 'react';
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
import { machinesApi, Machine, PaginatedResponse } from '../lib/api';
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

export const MachinesTab = () => {
  const { currentUser } = useRole();
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [machinesData, setMachinesData] =
    useState<PaginatedResponse<Machine> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // Define interface for transformed machine data
  interface TransformedMachine {
    id: number;
    name: string;
    type: string;
    location: string;
    status: string;
    createdDate: string;
    lastMaintenance: string;
    specifications: string;
    unit: string;
    unitName: string;
  }

  // Transformed machines data for UI - initialize with empty array to avoid showing dummy data
  const [machines, setMachines] = useState<TransformedMachine[]>([]);

  // Fetch machines from API
  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await machinesApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'id',
        sortOrder: 'ASC',
      });
      setMachinesData(response);

      // Transform API data to match component data structure
      const transformedMachines = response.data.map((machine) => {
        return {
          id: machine.id,
          name: machine.name,
          type: machine.type?.name || 'Unknown Type',
          location: machine.additionalNotes || 'No location specified',
          status: machine.status,
          createdDate: new Date(machine.createdAt).toISOString().split('T')[0],
          lastMaintenance: machine.lastService
            ? new Date(machine.lastService).toISOString().split('T')[0]
            : 'Not serviced',
          specifications:
            machine.specifications || 'No specifications available',
          unit: `unit-${machine.unit?.id || 1}`,
          unitName: machine.unit?.name || 'Unknown Unit',
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
  }, [currentPage, itemsPerPage]);

  const handleAddMachine = (machineData: TransformedMachine) => {
    // After successfully adding a machine, refresh the data
    fetchMachines();
  };

  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchQuery.toLowerCase());

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
                      <h3 className='font-semibold text-foreground text-sm sm:text-base'>
                        {machine.name}
                      </h3>
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
                      <span className='truncate'>{machine.location}</span>
                    </div>
                    <div className='flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2'>
                      <Building2 className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                      <span className='truncate'>{machine.unitName}</span>
                    </div>
                    <p className='text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2'>
                      {machine.specifications}
                    </p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-6 text-xs sm:text-sm'>
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
                    </div>
                  </div>
                </div>

                <div className='flex gap-2 sm:ml-4 justify-end sm:justify-start'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 px-2 sm:px-3'
                  >
                    <Edit className='w-3 h-3 sm:w-4 sm:h-4' />
                    <span className='ml-1 sm:hidden text-xs'>Edit</span>
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 px-2 sm:px-3'
                  >
                    <Eye className='w-3 h-3 sm:w-4 sm:h-4' />
                    <span className='ml-1 sm:hidden text-xs'>View</span>
                  </Button>
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
                    <TableHead className='min-w-[100px] text-foreground font-semibold'>
                      Actions
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
                        <span className='font-semibold text-foreground'>
                          {machine.name}
                        </span>
                      </TableCell>
                      <TableCell className='text-primary font-semibold'>
                        {machine.type}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                          <Building2 className='w-4 h-4' />
                          <span className='truncate max-w-24 sm:max-w-none'>
                            {machine.unitName}
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
                      <TableCell>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                          >
                            <Eye className='w-4 h-4' />
                          </Button>
                        </div>
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
        <div className='mt-4 flex justify-center'>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    !machinesData.meta.hasPreviousPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {/* Show pages based on API metadata */}
              {Array.from(
                { length: machinesData.meta.pageCount },
                (_, i) => i + 1
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                    className='cursor-pointer'
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className={
                    !machinesData.meta.hasNextPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
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
