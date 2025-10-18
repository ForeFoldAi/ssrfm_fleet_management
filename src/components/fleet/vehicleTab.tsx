import { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Filter,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  User,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form states
  const [isOnboardFormOpen, setIsOnboardFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleData | null>(null);
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

  const toggleRowExpansion = (vehicleId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(vehicleId)) {
      newExpandedRows.delete(vehicleId);
    } else {
      newExpandedRows.add(vehicleId);
    }
    setExpandedRows(newExpandedRows);
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

  const handleEditVehicle = (vehicle: VehicleData) => {
    setEditingVehicle(vehicle);
    setIsOnboardFormOpen(true);
  };

  const handleViewVehicle = (vehicle: VehicleData) => {
    setViewingVehicle(vehicle);
    setIsViewDialogOpen(true);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.');
    if (confirmed) {
      try {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
        toast({
          title: '✅ Vehicle Deleted',
          description: 'Vehicle has been successfully removed from the fleet.',
          variant: 'default',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete vehicle. Please try again.',
          variant: 'destructive',
        });
      }
    }
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
                  setEditingVehicle(null);
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
                  setEditingVehicle(null);
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
                    <TableHead className='w-12'></TableHead>
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
                    <TableHead>Performance</TableHead>
                    <TableHead className='w-12'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVehicles.map((vehicle) => (
                    <>
                      <TableRow key={vehicle.id} className='hover:bg-muted/30'>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={() => toggleRowExpansion(vehicle.id)}
                          >
                            {expandedRows.has(vehicle.id) ? (
                              <ChevronUp className='w-4 h-4' />
                            ) : (
                              <ChevronDown className='w-4 h-4' />
                            )}
                          </Button>
                        </TableCell>
                        
                        <TableCell className='font-medium'>
                          <div className='flex flex-col'>
                            <span className='font-semibold'>{vehicle.vehicleRegistrationNumber}</span>
                            <span className='text-xs text-muted-foreground'>
                              {vehicle.vehicleType.toUpperCase()} • {vehicle.vehicleYear}
                            </span>
                          </div>
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
                        
                        <TableCell>
                          <div className='flex flex-col text-sm'>
                            <span>{vehicle.totalTrips || 0} trips</span>
                            <span className='text-xs text-muted-foreground'>
                              {vehicle.averageFuelEfficiency || 0} km/l avg
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                                <MoreVertical className='w-4 h-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleViewVehicle(vehicle)}>
                                <Eye className='w-4 h-4 mr-2' />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditVehicle(vehicle)}>
                                <Edit className='w-4 h-4 mr-2' />
                                Edit Vehicle
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                className='text-destructive'
                              >
                                <Trash2 className='w-4 h-4 mr-2' />
                                Delete Vehicle
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Row Details */}
                      {expandedRows.has(vehicle.id) && (
                        <TableRow>
                          <TableCell colSpan={7} className='p-0'>
                            <div className='bg-muted/20 p-4'>
                              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                <div>
                                  <h4 className='font-semibold mb-2'>Vehicle Details</h4>
                                  <div className='space-y-1 text-sm'>
                                    <p><span className='font-medium'>Engine:</span> {vehicle.engineNumber}</p>
                                    <p><span className='font-medium'>Chassis:</span> {vehicle.chassisNumber}</p>
                                    <p><span className='font-medium'>Color:</span> {vehicle.color}</p>
                                    <p><span className='font-medium'>Mileage:</span> {vehicle.mileage} km/l</p>
                                  </div>
                                </div>
                                
                                
                                <div>
                                  <h4 className='font-semibold mb-2'>Performance</h4>
                                  <div className='space-y-1 text-sm'>
                                    <p><span className='font-medium'>Total Distance:</span> {vehicle.totalDistance?.toLocaleString()} km</p>
                                    <p><span className='font-medium'>Last Maintenance:</span> {vehicle.lastMaintenanceDate ? formatDate(vehicle.lastMaintenanceDate) : 'N/A'}</p>
                                    <p><span className='font-medium'>Next Maintenance:</span> {vehicle.nextMaintenanceDate ? formatDate(vehicle.nextMaintenanceDate) : 'N/A'}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className='font-semibold mb-2'>Additional Info</h4>
                                  <div className='space-y-1 text-sm'>
                                    <p><span className='font-medium'>Purchase Date:</span> {formatDate(vehicle.purchaseDate)}</p>
                                    <p><span className='font-medium'>Added:</span> {formatDate(vehicle.createdAt)}</p>
                                    {vehicle.additionalNotes && (
                                      <p><span className='font-medium'>Notes:</span> {vehicle.additionalNotes}</p>
                                    )}
                                  </div>
                                </div>
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
          )}
          
          {/* Pagination Controls */}
          {filteredVehicles.length > 0 && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 border-t'>
              <div className='flex flex-col sm:flex-row items-center gap-2'>
                <span className='text-xs sm:text-sm text-muted-foreground'>
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length} vehicles
                </span>
                <div className='flex items-center gap-2'>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className='w-16 sm:w-20 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='5'>5</SelectItem>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='25'>25</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className='text-xs text-muted-foreground'>per page</span>
                </div>
              </div>
              
              <div className='flex items-center gap-1 sm:gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className='text-xs px-2 sm:px-3'
                >
                  <span className='hidden sm:inline'>Previous</span>
                  <span className='sm:hidden'>Prev</span>
                </Button>
                
                <div className='flex items-center gap-1'>
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
                        className='w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs'
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className='text-xs px-2 sm:px-3'
                >
                  <span className='hidden sm:inline'>Next</span>
                  <span className='sm:hidden'>Next</span>
                </Button>
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
          setEditingVehicle(null);
        }}
        onSubmit={handleOnboardVehicle}
        editingVehicle={editingVehicle}
      />

      {/* View Vehicle Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Truck className='w-5 h-5' />
              Vehicle Details - {viewingVehicle?.vehicleRegistrationNumber}
            </DialogTitle>
            <DialogDescription>
              Complete information about the vehicle and driver
            </DialogDescription>
          </DialogHeader>
          
          {viewingVehicle && (
            <div className='space-y-6'>
              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Truck className='w-4 h-4' />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Registration Number</Label>
                      <p className='text-sm'>{viewingVehicle.vehicleRegistrationNumber}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Make & Model</Label>
                      <p className='text-sm'>{viewingVehicle.vehicleMake} {viewingVehicle.vehicleModel}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Vehicle Type</Label>
                      <p className='text-sm capitalize'>{viewingVehicle.vehicleType.replace('_', ' ')}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Year</Label>
                      <p className='text-sm'>{viewingVehicle.vehicleYear}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Load Capacity</Label>
                      <p className='text-sm'>{viewingVehicle.loadCapacity} kg</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Fuel Type</Label>
                      <p className='text-sm capitalize'>{viewingVehicle.fuelType}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Engine Number</Label>
                      <p className='text-sm font-mono'>{viewingVehicle.engineNumber}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Chassis Number</Label>
                      <p className='text-sm font-mono'>{viewingVehicle.chassisNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* Insurance Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Shield className='w-4 h-4' />
                    Insurance Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Provider</Label>
                      <p className='text-sm'>{viewingVehicle.insuranceProvider}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Policy Number</Label>
                      <p className='text-sm font-mono'>{viewingVehicle.insurancePolicyNumber}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Expiry Date</Label>
                      <p className='text-sm'>{formatDate(viewingVehicle.insuranceExpiryDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {viewingVehicle.additionalNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <FileText className='w-4 h-4' />
                      Additional Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm'>{viewingVehicle.additionalNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
