import { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Upload,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Shield,
  FileText,
  Save,
  X,
  Loader2,
} from 'lucide-react';

// Date utility functions for DD-MM-YYYY format
const formatDateToString = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const stringToDateInputFormat = (dateString: string): string => {
  if (!dateString) return '';
  
  // Handle DD-MM-YYYY format
  if (dateString.includes('-') && dateString.length === 10) {
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
  }
  
  // If already in YYYY-MM-DD format, return as is
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  return '';
};

const dateInputFormatToString = (inputDate: string): string => {
  if (!inputDate) return '';
  
  // Convert YYYY-MM-DD to DD-MM-YYYY
  if (inputDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = inputDate.split('-');
    return `${day}-${month}-${year}`;
  }
  
  return inputDate;
};
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Custom vehicle type states
  const [showCustomVehicleTypeInput, setShowCustomVehicleTypeInput] = useState(false);
  const [customVehicleTypeName, setCustomVehicleTypeName] = useState('');

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
      loadCapacity: '10',
      purchaseDate: '15-01-2023',
      insuranceProvider: 'ICICI Lombard',
      insurancePolicyNumber: 'POL123456789',
      insuranceExpiryDate: '31-12-2024',
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
      loadCapacity: '15',
      purchaseDate: '20-08-2022',
      insuranceProvider: 'Bajaj Allianz',
      insurancePolicyNumber: 'POL987654321',
      insuranceExpiryDate: '31-08-2024',
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
      loadCapacity: '8',
      purchaseDate: '10-03-2023',
      insuranceProvider: 'HDFC ERGO',
      insurancePolicyNumber: 'POL456789123',
      insuranceExpiryDate: '31-03-2024',
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
      loadCapacity: '12',
      purchaseDate: '15-05-2022',
      insuranceProvider: 'New India Assurance',
      insurancePolicyNumber: 'POL789123456',
      insuranceExpiryDate: '31-05-2024',
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
      loadCapacity: '6',
      purchaseDate: '01-12-2021',
      insuranceProvider: 'Oriental Insurance',
      insurancePolicyNumber: 'POL321654987',
      insuranceExpiryDate: '31-12-2024',
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
    setShowCustomVehicleTypeInput(false);
    setCustomVehicleTypeName('');
    setErrors({});
  };

  const handleInputChange = (field: keyof VehicleData, value: string) => {
    if (viewingVehicle) {
      setViewingVehicle((prev) => prev ? { ...prev, [field]: value } : null);
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleVehicleTypeChange = (value: string) => {
    handleInputChange('vehicleType', value);
    
    // Handle "Other" selection for vehicle type
    if (value === 'other') {
      setShowCustomVehicleTypeInput(true);
    } else {
      setShowCustomVehicleTypeInput(false);
    }
  };

  const handleCreateVehicleType = async () => {
    if (!customVehicleTypeName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a vehicle type name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      handleInputChange('vehicleType', customVehicleTypeName.trim());
      setShowCustomVehicleTypeInput(false);
      setCustomVehicleTypeName('');

        toast({
        title: 'Success',
        description: `Vehicle type "${customVehicleTypeName.trim()}" has been added.`,
        });
      } catch (error) {
      console.error('Error creating vehicle type:', error);
        toast({
          title: 'Error',
        description: 'Failed to add vehicle type. Please try again.',
          variant: 'destructive',
        });
      }
  };

  const validateForm = () => {
    if (!viewingVehicle) return false;
    
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    // Only validate mandatory fields
    if (!viewingVehicle.vehicleRegistrationNumber.trim()) {
      newErrors.vehicleRegistrationNumber = 'Vehicle registration number is required';
      hasErrors = true;
    }

    if (!viewingVehicle.vehicleMake.trim()) {
      newErrors.vehicleMake = 'Vehicle make is required';
      hasErrors = true;
    }

    if (!viewingVehicle.vehicleModel.trim()) {
      newErrors.vehicleModel = 'Vehicle model is required';
      hasErrors = true;
    }

    if (!viewingVehicle.vehicleType.trim()) {
      newErrors.vehicleType = 'Vehicle type is required';
      hasErrors = true;
    }

    if (!viewingVehicle.fuelType.trim()) {
      newErrors.fuelType = 'Fuel type is required';
      hasErrors = true;
    }

    setErrors(newErrors);

    if (hasErrors) {
      toast({
        title: '❌ Form Validation Failed',
        description: 'Please fix the highlighted fields before submitting.',
        variant: 'destructive',
      });
    }

    return !hasErrors;
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!viewingVehicle || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the vehicle in the list
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === viewingVehicle.id 
          ? { ...viewingVehicle, updatedAt: new Date().toISOString() }
          : vehicle
      ));
      
      toast({
        title: '✅ Vehicle Updated Successfully!',
        description: `Vehicle ${viewingVehicle.vehicleRegistrationNumber} has been successfully updated.`,
          variant: 'default',
        });

      setErrors({});
      setShowCustomVehicleTypeInput(false);
      setCustomVehicleTypeName('');
      setIsViewDialogOpen(false);
      setViewingVehicle(null);
      } catch (error) {
      console.error('Error updating vehicle:', error);
        toast({
          title: 'Error',
        description: 'Failed to update vehicle. Please try again.',
          variant: 'destructive',
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportVehicles = () => {
    try {
      // Prepare CSV data
      const csvHeaders = [
        'Registration Number',
        'Make',
        'Model',
        'Vehicle Type',
        'Year',
        'Fuel Type',
        'Load Capacity (MT)',
        'Status',
        'Insurance Provider',
        'Insurance Expiry Date',
        'Purchase Date',
        'Created Date'
      ];

      const csvData = filteredVehicles.map(vehicle => [
        vehicle.vehicleRegistrationNumber,
        vehicle.vehicleMake,
        vehicle.vehicleModel,
        vehicle.vehicleType,
        vehicle.vehicleYear,
        vehicle.fuelType,
        vehicle.loadCapacity,
        vehicle.status,
        vehicle.insuranceProvider,
        formatDate(vehicle.insuranceExpiryDate),
        formatDate(vehicle.purchaseDate),
        formatDate(vehicle.createdAt)
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vehicles_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: '✅ Export Successful!',
        description: `Exported ${filteredVehicles.length} vehicles to CSV file.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error exporting vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to export vehicles. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Handle DD-MM-YYYY format
    if (dateString.includes('-') && dateString.length === 10) {
      const parts = dateString.split('-');
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        // Already in DD-MM-YYYY format
        return dateString;
      }
    }
    
    // Convert from other formats to DD-MM-YYYY
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return formatDateToString(date);
      }
    } catch (error) {
      // If parsing fails, return original string
    }
    
    return dateString;
  };

  const statusOptions = [
    { value: 'active', label: 'Active', description: 'Vehicle is operational' },
    { value: 'inactive', label: 'Inactive', description: 'Not in use' },
    { value: 'maintenance', label: 'Under Maintenance', description: 'Currently being serviced' },
  ];

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
                onClick={handleExportVehicles}
                size='sm'
                className='gap-1 text-xs'
                disabled={filteredVehicles.length === 0}
              >
                <Upload className='w-3 h-3' />
                Export
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
                onClick={handleExportVehicles}
                size='sm'
                className='gap-2 text-sm'
                disabled={filteredVehicles.length === 0}
              >
                <Upload className='w-4 h-4' />
                Export
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
                <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
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
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('loadCapacity')}
                    >
                      <div className='flex items-center gap-2'>
                        Load Capacity (MT)
                        {getSortIcon('loadCapacity')}
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
                            <span className='font-semibold text-black hover:text-primary/80 underline'>
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
                              {vehicle.fuelType}
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
                          <div className='text-sm font-medium'>
                            {vehicle.loadCapacity} MT
                          </div>
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

      {/* Edit Vehicle Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) {
          setViewingVehicle(null);
          setShowCustomVehicleTypeInput(false);
          setCustomVehicleTypeName('');
          setErrors({});
        }
      }}>
        <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader className='pb-2'>
            <DialogTitle className='flex items-center gap-2 text-lg'>
              <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
                <Truck className='w-4 h-4 text-primary' />
              </div>
              Edit Vehicle - {viewingVehicle?.vehicleRegistrationNumber}
            </DialogTitle>
          </DialogHeader>
          
          {viewingVehicle && (
            <form onSubmit={handleUpdateVehicle} className='space-y-4'>
              {/* Single Card for all form content */}
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
                        <Label htmlFor='vehicleRegistrationNumber' className='text-xs font-medium'>
                          Registration Number *
                        </Label>
                        <Input
                          id='vehicleRegistrationNumber'
                          placeholder='e.g., MH-12-AB-1234'
                          value={viewingVehicle.vehicleRegistrationNumber}
                          onChange={(e) => handleInputChange('vehicleRegistrationNumber', e.target.value.toUpperCase())}
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                        {errors.vehicleRegistrationNumber && (
                          <p className='text-destructive text-xs mt-1'>
                            {errors.vehicleRegistrationNumber}
                          </p>
                        )}
                    </div>

                      <div className='space-y-1'>
                        <Label htmlFor='vehicleMake' className='text-xs font-medium'>
                          Make *
                        </Label>
                        <Input
                          id='vehicleMake'
                          placeholder='e.g., Tata, Ashok Leyland'
                          value={viewingVehicle.vehicleMake}
                          onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                        {errors.vehicleMake && (
                          <p className='text-destructive text-xs mt-1'>
                            {errors.vehicleMake}
                          </p>
                        )}
                    </div>
                    </div>

                    {/* Second Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label htmlFor='vehicleModel' className='text-xs font-medium'>
                          Model *
                        </Label>
                        <Input
                          id='vehicleModel'
                          placeholder='e.g., Ace, 407'
                          value={viewingVehicle.vehicleModel}
                          onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                        {errors.vehicleModel && (
                          <p className='text-destructive text-xs mt-1'>
                            {errors.vehicleModel}
                          </p>
                        )}
                    </div>

                      <div className='space-y-1'>
                        <Label htmlFor='vehicleType' className='text-xs font-medium'>
                          Vehicle Type *
                        </Label>
                        <Select
                          value={viewingVehicle.vehicleType}
                          onValueChange={handleVehicleTypeChange}
                        >
                          <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                            <SelectValue placeholder='Select vehicle type' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='truck'>Truck</SelectItem>
                            <SelectItem value='lorry'>Lorry</SelectItem>
                            <SelectItem value='container'>Container</SelectItem>
                            <SelectItem value='trailer'>Trailer</SelectItem>
                            <SelectItem value='tanker'>Tanker</SelectItem>
                            <SelectItem value='other'>Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.vehicleType && (
                          <p className='text-destructive text-xs mt-1'>
                            {errors.vehicleType}
                          </p>
                        )}
                    </div>
                    </div>

                    {/* Custom Vehicle Type Input */}
                    {showCustomVehicleTypeInput && (
                      <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2'>
                        <Label className='text-xs font-medium text-blue-800'>
                          Add New Vehicle Type
                        </Label>
                        <div className='flex gap-2'>
                          <Input
                            placeholder='Enter vehicle type name'
                            value={customVehicleTypeName}
                            onChange={(e) => setCustomVehicleTypeName(e.target.value)}
                            className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                          />
                          <Button
                            type='button'
                            onClick={handleCreateVehicleType}
                            size='sm'
                            className='h-8 px-3 bg-blue-600 hover:bg-blue-700'
                          >
                            <Plus className='w-3 h-3 mr-1' />
                            Add
                          </Button>
                          <Button
                            type='button'
                            onClick={() => {
                              setShowCustomVehicleTypeInput(false);
                              setCustomVehicleTypeName('');
                              handleInputChange('vehicleType', '');
                            }}
                            variant='outline'
                            size='sm'
                            className='h-8 px-3'
                          >
                            <X className='w-3 h-3' />
                          </Button>
                    </div>
                    </div>
                    )}

                    {/* Third Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label htmlFor='fuelType' className='text-xs font-medium'>
                          Fuel Type *
                        </Label>
                        <Select
                          value={viewingVehicle.fuelType}
                          onValueChange={(value) => handleInputChange('fuelType', value)}
                        >
                          <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                            <SelectValue placeholder='Select fuel type' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='diesel'>Diesel</SelectItem>
                            <SelectItem value='petrol'>Petrol</SelectItem>
                            <SelectItem value='cng'>CNG</SelectItem>
                            <SelectItem value='electric'>Electric</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.fuelType && (
                          <p className='text-destructive text-xs mt-1'>
                            {errors.fuelType}
                          </p>
                        )}
                  </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Status</Label>
                        <div className='flex gap-1'>
                          {statusOptions.map((status) => (
                            <button
                              key={status.value}
                              type='button'
                              onClick={() => handleInputChange('status', status.value)}
                              className={`h-7 px-2 py-1 rounded-[5px] border text-left transition-all duration-200 text-xs font-medium ${
                                viewingVehicle.status === status.value
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-input bg-background hover:border-primary/50 hover:bg-muted/30'
                              }`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
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
                        <Label htmlFor='vehicleYear' className='text-xs font-medium'>
                          Year
                        </Label>
                        <Input
                          id='vehicleYear'
                          type='number'
                          placeholder='e.g., 2023'
                          value={viewingVehicle.vehicleYear}
                          onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                          min='1900'
                          max='2030'
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                      </div>

                      <div className='space-y-1'>
                        <Label htmlFor='engineNumber' className='text-xs font-medium'>
                          Engine Number
                        </Label>
                        <Input
                          id='engineNumber'
                          placeholder='Engine number'
                          value={viewingVehicle.engineNumber}
                          onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                      </div>

                      <div className='space-y-1'>
                        <Label htmlFor='chassisNumber' className='text-xs font-medium'>
                          Chassis Number
                        </Label>
                        <Input
                          id='chassisNumber'
                          placeholder='Chassis number'
                          value={viewingVehicle.chassisNumber}
                          onChange={(e) => handleInputChange('chassisNumber', e.target.value)}
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                      </div>

                      <div className='space-y-1'>
                        <Label htmlFor='loadCapacity' className='text-xs font-medium'>
                          Load Capacity (MT)
                        </Label>
                        <Input
                          id='loadCapacity'
                          type='number'
                          placeholder='e.g., 10'
                          value={viewingVehicle.loadCapacity}
                          onChange={(e) => handleInputChange('loadCapacity', e.target.value)}
                          min='0'
                          step='0.1'
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label htmlFor='purchaseDate' className='text-xs font-medium'>
                          Purchase Date
                        </Label>
                        <Input
                          id='purchaseDate'
                          type='date'
                          value={stringToDateInputFormat(viewingVehicle.purchaseDate)}
                          onChange={(e) => handleInputChange('purchaseDate', dateInputFormatToString(e.target.value))}
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
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
                        <Label htmlFor='insuranceProvider' className='text-xs font-medium'>
                          Insurance Provider
                        </Label>
                        <Input
                          id='insuranceProvider'
                          placeholder='e.g., ICICI Lombard, Bajaj Allianz'
                          value={viewingVehicle.insuranceProvider}
                          onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                    </div>

                      <div className='space-y-1'>
                        <Label htmlFor='insurancePolicyNumber' className='text-xs font-medium'>
                          Policy Number
                        </Label>
                        <Input
                          id='insurancePolicyNumber'
                          placeholder='Policy number'
                          value={viewingVehicle.insurancePolicyNumber}
                          onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                    </div>

                      <div className='space-y-1'>
                        <Label htmlFor='insuranceExpiryDate' className='text-xs font-medium'>
                          Expiry Date
                        </Label>
                        <Input
                          id='insuranceExpiryDate'
                          type='date'
                          value={stringToDateInputFormat(viewingVehicle.insuranceExpiryDate)}
                          onChange={(e) => handleInputChange('insuranceExpiryDate', dateInputFormatToString(e.target.value))}
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                    </div>
                  </div>
                  </div>

                  {/* Additional Information */}
                  <div className='space-y-3'>
                   
                    <div className='space-y-1'>
                      <Label htmlFor='additionalNotes' className='text-xs font-medium'>
                      Additional Notes
                      </Label>
                      <Textarea
                        id='additionalNotes'
                        placeholder='Any additional information about the vehicle...'
                        value={viewingVehicle.additionalNotes}
                        onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                        className='min-h-[40px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200'
                      />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Updated By</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-center font-semibold text-xs border border-input rounded-[5px] flex items-center justify-center'>
                          {currentUser?.name || 'Current User'}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Date</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-center font-semibold text-xs border border-input rounded-[5px] flex items-center justify-center'>
                          {formatDateToString(new Date())}
                        </div>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>

              {/* Form Actions */}
              <div className='flex justify-end gap-3 pt-4 border-t'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsViewDialogOpen(false)}
                  className='h-8 px-4'
                  disabled={isSubmitting}
                >
                  <X className='w-3 h-3 mr-1' />
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='h-8 px-4 bg-primary hover:bg-primary/90'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className='w-3 h-3 mr-1' />
                      Update Vehicle
                    </>
                  )}
                </Button>
            </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
