import { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Shield,
  FileText,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from '../../hooks/use-toast';
import { useRole } from '../../contexts/RoleContext';
import { VehicleOnboardingForm, VehicleOnboardingData } from './VehicleOnboardingForm';

export interface VehicleData extends VehicleOnboardingData {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalTrips?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  totalDistance?: number;
  averageFuelEfficiency?: number;
}

export const VehicleTab = () => {
  const { currentUser, hasPermission } = useRole();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVehicleType, setFilterVehicleType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form states
  const [isOnboardFormOpen, setIsOnboardFormOpen] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState<VehicleData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Mock data - Replace with actual API calls
  const mockVehicles: VehicleData[] = [
    {
      id: '1',
      vehicleRegistrationNumber: 'MH-12-AB-1234',
      vehicleMake: 'Tata',
      vehicleModel: 'Ace',
      vehicleType: 'truck',
      vehicleYear: '2023',
      engineNumber: 'ENG123456789',
      chassisNumber: 'CHS987654321',
      fuelType: 'diesel',
      loadCapacity: '10000',
      mileage: '8.5',
      color: 'White',
      purchaseDate: '2023-01-15',
      insuranceProvider: 'ICICI Lombard',
      insurancePolicyNumber: 'POL123456789',
      insuranceExpiryDate: '2024-12-31',
      documents: [],
      additionalNotes: 'Regular maintenance vehicle',
      status: 'active',
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2023-01-15T10:00:00Z',
      totalTrips: 45,
      lastMaintenanceDate: '2023-11-15',
      nextMaintenanceDate: '2024-02-15',
      totalDistance: 12500,
      averageFuelEfficiency: 8.2,
    },
    {
      id: '2',
      vehicleRegistrationNumber: 'MH-12-CD-5678',
      vehicleMake: 'Ashok Leyland',
      vehicleModel: '407',
      vehicleType: 'lorry',
      vehicleYear: '2022',
      engineNumber: 'ENG987654321',
      chassisNumber: 'CHS123456789',
      fuelType: 'diesel',
      loadCapacity: '15000',
      mileage: '7.8',
      color: 'Blue',
      purchaseDate: '2022-08-20',
      insuranceProvider: 'Bajaj Allianz',
      insurancePolicyNumber: 'POL987654321',
      insuranceExpiryDate: '2024-08-31',
      documents: [],
      additionalNotes: 'Heavy duty vehicle',
      status: 'maintenance',
      createdAt: '2022-08-20T14:30:00Z',
      updatedAt: '2022-08-20T14:30:00Z',
      totalTrips: 78,
      lastMaintenanceDate: '2023-12-01',
      nextMaintenanceDate: '2024-03-01',
      totalDistance: 18750,
      averageFuelEfficiency: 7.5,
    },
    {
      id: '3',
      vehicleRegistrationNumber: 'MH-12-EF-9012',
      vehicleMake: 'Mahindra',
      vehicleModel: 'Bolero Pickup',
      vehicleType: 'truck',
      vehicleYear: '2023',
      engineNumber: 'ENG456789123',
      chassisNumber: 'CHS456789123',
      fuelType: 'diesel',
      loadCapacity: '8000',
      mileage: '9.2',
      color: 'Red',
      purchaseDate: '2023-03-10',
      insuranceProvider: 'HDFC ERGO',
      insurancePolicyNumber: 'POL456789123',
      insuranceExpiryDate: '2024-03-31',
      documents: [],
      additionalNotes: 'New vehicle, good performance',
      status: 'active',
      createdAt: '2023-03-10T09:00:00Z',
      updatedAt: '2023-03-10T09:00:00Z',
      totalTrips: 32,
      lastMaintenanceDate: '2023-11-20',
      nextMaintenanceDate: '2024-02-20',
      totalDistance: 8900,
      averageFuelEfficiency: 9.1,
    },
    {
      id: '4',
      vehicleRegistrationNumber: 'MH-12-GH-3456',
      vehicleMake: 'Eicher',
      vehicleModel: 'Pro 2049',
      vehicleType: 'lorry',
      vehicleYear: '2022',
      engineNumber: 'ENG789123456',
      chassisNumber: 'CHS789123456',
      fuelType: 'diesel',
      loadCapacity: '12000',
      mileage: '7.5',
      color: 'Green',
      purchaseDate: '2022-05-15',
      insuranceProvider: 'New India Assurance',
      insurancePolicyNumber: 'POL789123456',
      insuranceExpiryDate: '2024-05-31',
      documents: [],
      additionalNotes: 'Reliable vehicle for long distances',
      status: 'active',
      createdAt: '2022-05-15T11:30:00Z',
      updatedAt: '2022-05-15T11:30:00Z',
      totalTrips: 67,
      lastMaintenanceDate: '2023-10-15',
      nextMaintenanceDate: '2024-01-15',
      totalDistance: 15600,
      averageFuelEfficiency: 7.3,
    },
    {
      id: '5',
      vehicleRegistrationNumber: 'MH-12-IJ-7890',
      vehicleMake: 'Force',
      vehicleModel: 'Traveller',
      vehicleType: 'truck',
      vehicleYear: '2021',
      engineNumber: 'ENG321654987',
      chassisNumber: 'CHS321654987',
      fuelType: 'diesel',
      loadCapacity: '6000',
      mileage: '8.8',
      color: 'Yellow',
      purchaseDate: '2021-12-01',
      insuranceProvider: 'Oriental Insurance',
      insurancePolicyNumber: 'POL321654987',
      insuranceExpiryDate: '2024-12-31',
      documents: [],
      additionalNotes: 'Small vehicle for local deliveries',
      status: 'inactive',
      createdAt: '2021-12-01T08:00:00Z',
      updatedAt: '2021-12-01T08:00:00Z',
      totalTrips: 89,
      lastMaintenanceDate: '2023-09-01',
      nextMaintenanceDate: '2024-12-01',
      totalDistance: 22300,
      averageFuelEfficiency: 8.5,
    },
  ];

  // Fetch vehicles data
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVehicles(mockVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vehicles. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Filter and search vehicles
  useEffect(() => {
    let filtered = vehicles;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(vehicle =>
        vehicle.vehicleRegistrationNumber.toLowerCase().includes(searchLower) ||
        vehicle.vehicleMake.toLowerCase().includes(searchLower) ||
        vehicle.vehicleModel.toLowerCase().includes(searchLower) ||
        vehicle.insuranceProvider.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === filterStatus);
    }

    // Apply vehicle type filter
    if (filterVehicleType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.vehicleType === filterVehicleType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof VehicleData];
      let bValue: any = b[sortBy as keyof VehicleData];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredVehicles(filtered);
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [vehicles, searchTerm, filterStatus, filterVehicleType, sortBy, sortOrder]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className='w-4 h-4' />;
      case 'inactive':
        return <AlertTriangle className='w-4 h-4' />;
      case 'maintenance':
        return <Wrench className='w-4 h-4' />;
      default:
        return <Clock className='w-4 h-4' />;
    }
  };


  const handleOnboardVehicle = (vehicleData: VehicleOnboardingData) => {
    const newVehicle: VehicleData = {
      ...vehicleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalTrips: 0,
      totalDistance: 0,
      averageFuelEfficiency: 0,
    };
    
    setVehicles(prev => [newVehicle, ...prev]);
    setIsOnboardFormOpen(false);
    
    toast({
      title: '✅ Vehicle Onboarded Successfully!',
      description: `Vehicle ${vehicleData.vehicleRegistrationNumber} has been added to the fleet.`,
      variant: 'default',
    });
  };


  const handleViewVehicle = (vehicle: VehicleData) => {
    setViewingVehicle(vehicle);
    setIsViewDialogOpen(true);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className='space-y-4 p-2 sm:space-y-6 sm:p-0'>
      {/* Header */}
    

      {/* Search, Filters and Actions - Single Line */}
      <Card>
        <CardContent className='p-3 sm:p-4'>
          {/* Mobile Layout */}
          <div className='flex flex-col gap-3 sm:hidden'>
            {/* Search and Action Buttons Row */}
            <div className='flex gap-2'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                  <Input
                    placeholder='Search vehicles...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <Button
                variant='outline'
                onClick={fetchVehicles}
                disabled={isLoading}
                size='sm'
                className='gap-1 text-xs'
              >
                <RefreshCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Ref
              </Button>
              <Button
                onClick={() => {
                  setIsOnboardFormOpen(true);
                }}
                size='sm'
                className='gap-1 text-xs'
                disabled={!hasPermission('inventory:material-indents:create')}
              >
                <Plus className='w-3 h-3' />
                Add
              </Button>
            </div>
            
            {/* Filters Row */}
            <div className='flex gap-2'>
              <div className='flex-1'>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className='text-sm'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                    <SelectItem value='maintenance'>Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex-1'>
                <Select value={filterVehicleType} onValueChange={setFilterVehicleType}>
                  <SelectTrigger className='text-sm'>
                    <SelectValue placeholder='Vehicle Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='truck'>Truck</SelectItem>
                    <SelectItem value='lorry'>Lorry</SelectItem>
                    <SelectItem value='container'>Container</SelectItem>
                    <SelectItem value='trailer'>Trailer</SelectItem>
                    <SelectItem value='tanker'>Tanker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className='hidden sm:flex xl:flex-row gap-3 sm:gap-4'>
            {/* Search */}
            <div className='flex-1 min-w-0'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  placeholder='Search vehicles...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className='w-full xl:w-40'>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className='text-sm'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                  <SelectItem value='maintenance'>Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Type Filter */}
            <div className='w-full xl:w-40'>
              <Select value={filterVehicleType} onValueChange={setFilterVehicleType}>
                <SelectTrigger className='text-sm'>
                  <SelectValue placeholder='Vehicle Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='truck'>Truck</SelectItem>
                  <SelectItem value='lorry'>Lorry</SelectItem>
                  <SelectItem value='container'>Container</SelectItem>
                  <SelectItem value='trailer'>Trailer</SelectItem>
                  <SelectItem value='tanker'>Tanker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={fetchVehicles}
                disabled={isLoading}
                size='sm'
                className='gap-2 text-sm'
              >
                <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={() => {
                  setIsOnboardFormOpen(true);
                }}
                size='sm'
                className='gap-2 text-sm'
                disabled={!hasPermission('inventory:material-indents:create')}
              >
                <Plus className='w-4 h-4' />
                Onboard Vehicle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <RefreshCcw className='w-8 h-8 animate-spin text-primary mx-auto mb-4' />
                <p className='text-muted-foreground'>Loading vehicles...</p>
              </div>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className='text-center py-12'>
              <Truck className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No Vehicles Found</h3>
              <p className='text-muted-foreground mb-4'>
                {searchTerm || filterStatus !== 'all' || filterVehicleType !== 'all'
                  ? 'No vehicles match your current filters.'
                  : 'Get started by onboarding your first vehicle.'}
              </p>
              {(!searchTerm && filterStatus === 'all' && filterVehicleType === 'all') && (
                <Button
                  onClick={() => setIsOnboardFormOpen(true)}
                  className='gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Onboard First Vehicle
                </Button>
              )}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-secondary/20'>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('vehicleRegistrationNumber')}
                    >
                      <div className='flex items-center gap-2'>
                        Registration Number
                        {getSortIcon('vehicleRegistrationNumber')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('vehicleMake')}
                    >
                      <div className='flex items-center gap-2'>
                        Vehicle
                        {getSortIcon('vehicleMake')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('status')}
                    >
                      <div className='flex items-center gap-2'>
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead>Insurance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} className='hover:bg-muted/30'>
                        <TableCell className='font-medium'>
                        <button
                          onClick={() => handleViewVehicle(vehicle)}
                          className='text-left hover:text-primary transition-colors'
                        >
                          <div className='flex flex-col'>
                            <span className='font-semibold text-primary hover:text-primary/80 underline'>
                              {vehicle.vehicleRegistrationNumber}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {vehicle.vehicleType.toUpperCase()} • {vehicle.vehicleYear}
                            </span>
                          </div>
                        </button>
                        </TableCell>
                        
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium'>{vehicle.vehicleMake} {vehicle.vehicleModel}</span>
                            <span className='text-xs text-muted-foreground'>
                              {vehicle.loadCapacity}kg • {vehicle.fuelType}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={`${getStatusColor(vehicle.status)} border flex items-center gap-1 w-fit`}>
                            {getStatusIcon(vehicle.status)}
                            <span className='capitalize'>{vehicle.status.replace('_', ' ')}</span>
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='text-sm font-medium'>{vehicle.insuranceProvider}</span>
                            <span className='text-xs text-muted-foreground'>
                              Expires: {formatDate(vehicle.insuranceExpiryDate)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {filteredVehicles.length > 0 && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
              {/* Page Info */}
              <div className='text-xs sm:text-sm text-muted-foreground'>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length} entries
              </div>

              {/* Pagination Controls */}
              <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full sm:w-auto'>
                {/* Items per page selector - Mobile optimized */}
                <div className='flex items-center gap-2 w-full sm:w-auto justify-center'>
                  <span className='text-xs sm:text-sm text-muted-foreground whitespace-nowrap'>Show:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      const newLimit = parseInt(value);
                      setItemsPerPage(newLimit);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className='w-16 sm:w-20 h-8 text-xs sm:text-sm'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='20'>20</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                      <SelectItem value='100'>100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className='text-xs sm:text-sm text-muted-foreground whitespace-nowrap'>per page</span>
                </div>

                {/* Page navigation - Mobile optimized */}
                <div className='flex items-center gap-1'>
                  {/* First page button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronsLeft className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>

                  {/* Previous page button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronLeft className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>

                  {/* Page numbers - Show up to 5 pages */}
                  <div className='flex items-center gap-1 mx-1 sm:mx-2'>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => setCurrentPage(pageNum)}
                          className='h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm'
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Next page button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>

                  {/* Last page button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronsRight className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Onboarding Form */}
      <VehicleOnboardingForm
        isOpen={isOnboardFormOpen}
        onClose={() => {
          setIsOnboardFormOpen(false);
        }}
        onSubmit={handleOnboardVehicle}
        editingVehicle={null}
      />

      {/* View Vehicle Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) {
          setViewingVehicle(null);
        }
      }}>
        <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader className='pb-2'>
            <DialogTitle className='flex items-center gap-2 text-lg'>
              <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
                <Truck className='w-4 h-4 text-primary' />
              </div>
              Vehicle Details - {viewingVehicle?.vehicleRegistrationNumber}
            </DialogTitle>
          </DialogHeader>
          
          {viewingVehicle && (
            <div className='space-y-4'>
              {/* Single Card for all content */}
              <Card className='border-0 shadow-sm'>
                <CardContent className='space-y-4'>
              {/* Vehicle Information */}
                  <div className='space-y-3'>
                    <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                    Vehicle Information
                    </h4>

                    {/* First Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Registration Number
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingVehicle.vehicleRegistrationNumber}
                    </div>
                    </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Make & Model
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingVehicle.vehicleMake} {viewingVehicle.vehicleModel}
                    </div>
                    </div>
                    </div>

                    {/* Second Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Vehicle Type
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center capitalize'>
                          {viewingVehicle.vehicleType.replace('_', ' ')}
                    </div>
                    </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Fuel Type
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center capitalize'>
                          {viewingVehicle.fuelType}
                    </div>
                  </div>
                    </div>

                    {/* Third Row - Status */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Status</Label>
                        <Badge className={`${getStatusColor(viewingVehicle.status)} border flex items-center gap-1 w-fit`}>
                          {getStatusIcon(viewingVehicle.status)}
                          <span className='capitalize'>{viewingVehicle.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Specifications */}
                  <div className='space-y-3'>
                    <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                      Vehicle Specifications
                    </h4>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Year
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingVehicle.vehicleYear}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Load Capacity (kg)
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingVehicle.loadCapacity}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Engine Number
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center font-mono'>
                          {viewingVehicle.engineNumber}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Chassis Number
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center font-mono'>
                          {viewingVehicle.chassisNumber}
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Purchase Date
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {formatDate(viewingVehicle.purchaseDate)}
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Insurance Information */}
                  <div className='space-y-3'>
                    <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                    Insurance Information
                    </h4>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Insurance Provider
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingVehicle.insuranceProvider}
                    </div>
                    </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Policy Number
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center font-mono'>
                          {viewingVehicle.insurancePolicyNumber}
                    </div>
                  </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                          Expiry Date
                        </Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {formatDate(viewingVehicle.insuranceExpiryDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className='space-y-3'>
                    <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                      Additional Information
                    </h4>

              {viewingVehicle.additionalNotes && (
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>
                      Additional Notes
                        </Label>
                        <div className='min-h-[40px] px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-start'>
                          {viewingVehicle.additionalNotes}
                        </div>
                      </div>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Created Date</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-center font-semibold text-xs border border-input rounded-[5px] flex items-center justify-center'>
                          {formatDate(viewingVehicle.createdAt)}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Last Updated</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-center font-semibold text-xs border border-input rounded-[5px] flex items-center justify-center'>
                          {formatDate(viewingVehicle.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
