import { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee,
  Search,
  Plus,
  Eye,
  Truck,
  User,
  Fuel,
  Wrench,
  CreditCard,
  MapPin,
  Receipt,
  FileText,
  Upload,
  RefreshCcw,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Image,
  Trash2,
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

// Date utility functions
const formatDateToString = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Generate Expense ID in format: SSRFM/UNIT-1/F-YYMMDD/001
const generateExpenseId = (date: string, sequence: number = 1): string => {
  const expenseDate = new Date(date);
  const year = expenseDate.getFullYear().toString().slice(-2);
  const month = (expenseDate.getMonth() + 1).toString().padStart(2, '0');
  const day = expenseDate.getDate().toString().padStart(2, '0');
  const sequenceStr = sequence.toString().padStart(3, '0');
  return `SSRFM/UNIT-1/F-${year}${month}${day}/${sequenceStr}`;
};

const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  // Handle different date formats
  if (dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      // Check if first part is day (2 digits) vs year (4 digits)
      if (parts[0].length === 2 && parts[2].length === 4) {
        // Already DD-MM-YYYY format
        return dateString;
      } else if (parts[0].length === 4 && parts[2].length === 2) {
        // YYYY-MM-DD format, convert to DD-MM-YYYY
        const [year, month, day] = parts;
        return `${day}-${month}-${year}`;
      }
    }
  }
  
  // Try to parse as Date and format
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from '../../hooks/use-toast';
import { useRole } from '../../contexts/RoleContext';
import { ExpensesForm, VehicleExpenseData } from './ExpensesForm';

export const ExpensesTab = () => {
  const { currentUser, hasPermission } = useRole();
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<VehicleExpenseData[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<VehicleExpenseData[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Array<{ id: string; registrationNumber: string; driverName: string; driverId: string }>>([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('expenseDate');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form states
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState<VehicleExpenseData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    from: '',
    to: '',
  });
  const [selectedExportPreset, setSelectedExportPreset] = useState<string>('all');

  // Mock data - Replace with actual API calls
  const mockExpenses: VehicleExpenseData[] = [
    {
      id: '1',
      expenseNumber: generateExpenseId('2023-12-21', 1),
      vehicleId: '1',
      vehicleRegistrationNumber: 'MH-12-AB-1234',
      driverId: '1',
      driverName: 'Rajesh Kumar',
      expenseDate: '2023-12-21',
      expenseCategory: 'fuel',
      expenseType: 'Diesel',
      description: 'Fuel refill at Bharat Petroleum',
      amount: '2500.00',
      vendorName: 'Bharat Petroleum',
      vendorContact: '+91 9876543210',
      vendorAddress: 'Mumbai Highway, Pune',
      paymentMethod: 'card',
      paymentReference: 'TXN123456789',
      location: 'Pune Highway',
      odometerReading: '125000',
      receipts: [],
      approvalStatus: 'approved',
      approvedBy: 'Manager Name',
      approvedDate: '2023-12-21',
      rejectionReason: '',
      notes: 'Regular fuel refill',
      requestedBy: 'Rajesh Kumar',
      createdAt: '2023-12-21T10:30:00Z',
      updatedAt: '2023-12-21T10:30:00Z',
    },
    {
      id: '2',
      expenseNumber: generateExpenseId('2023-12-20', 2),
      vehicleId: '1',
      vehicleRegistrationNumber: 'MH-12-AB-1234',
      driverId: '1',
      driverName: 'Rajesh Kumar',
      expenseDate: '2023-12-20',
      expenseCategory: 'maintenance',
      expenseType: 'Engine Oil Change',
      description: 'Regular engine oil change and filter replacement',
      amount: '1800.00',
      vendorName: 'Auto Care Center',
      vendorContact: '+91 8765432109',
      vendorAddress: 'Industrial Area, Mumbai',
      paymentMethod: 'cash',
      paymentReference: 'CASH001',
      location: 'Mumbai Service Center',
      odometerReading: '124500',
      receipts: [],
      approvalStatus: 'pending',
      approvedBy: '',
      approvedDate: '',
      rejectionReason: '',
      notes: 'Scheduled maintenance',
      requestedBy: 'Rajesh Kumar',
      createdAt: '2023-12-20T14:00:00Z',
      updatedAt: '2023-12-20T14:00:00Z',
    },
    {
      id: '3',
      expenseNumber: generateExpenseId('2023-12-19', 3),
      vehicleId: '2',
      vehicleRegistrationNumber: 'MH-12-CD-5678',
      driverId: '2',
      driverName: 'Suresh Patel',
      expenseDate: '2023-12-19',
      expenseCategory: 'toll',
      expenseType: 'Highway Toll',
      description: 'Toll charges for Mumbai-Pune expressway',
      amount: '450.00',
      vendorName: 'NHAI',
      vendorContact: '',
      vendorAddress: 'Mumbai-Pune Expressway',
      paymentMethod: 'upi',
      paymentReference: 'UPI789012345',
      location: 'Mumbai-Pune Expressway',
      odometerReading: '89000',
      receipts: [],
      approvalStatus: 'approved',
      approvedBy: 'Supervisor Name',
      approvedDate: '2023-12-19',
      rejectionReason: '',
      notes: 'Regular toll charges',
      requestedBy: 'Suresh Patel',
      createdAt: '2023-12-19T16:45:00Z',
      updatedAt: '2023-12-19T16:45:00Z',
    },
    {
      id: '4',
      expenseNumber: generateExpenseId('2023-12-18', 4),
      vehicleId: '1',
      vehicleRegistrationNumber: 'MH-12-AB-1234',
      driverId: '1',
      driverName: 'Rajesh Kumar',
      expenseDate: '2023-12-18',
      expenseCategory: 'repair',
      expenseType: 'Brake Repair',
      description: 'Brake pad replacement and brake fluid change',
      amount: '3200.00',
      vendorName: 'Mechanic Raj',
      vendorContact: '+91 7654321098',
      vendorAddress: 'Local Garage, Pune',
      paymentMethod: 'cheque',
      paymentReference: 'CHQ001234',
      location: 'Pune Local Garage',
      odometerReading: '124200',
      receipts: [],
      approvalStatus: 'approved',
      approvedBy: 'Manager Name',
      approvedDate: '2023-12-18',
      rejectionReason: '',
      notes: 'Urgent brake repair',
      requestedBy: 'Rajesh Kumar',
      createdAt: '2023-12-18T11:20:00Z',
      updatedAt: '2023-12-18T11:20:00Z',
    },
    {
      id: '5',
      expenseNumber: generateExpenseId('2023-12-17', 5),
      vehicleId: '2',
      vehicleRegistrationNumber: 'MH-12-CD-5678',
      driverId: '2',
      driverName: 'Suresh Patel',
      expenseDate: '2023-12-17',
      expenseCategory: 'driver_salary',
      expenseType: 'Monthly Salary',
      description: 'Driver salary for December 2023',
      amount: '15000.00',
      vendorName: 'Suresh Patel',
      vendorContact: '+91 6543210987',
      vendorAddress: 'Driver Address',
      paymentMethod: 'bank_transfer',
      paymentReference: 'BTN567890123',
      location: 'Office',
      odometerReading: '88900',
      receipts: [],
      approvalStatus: 'approved',
      approvedBy: 'HR Manager',
      approvedDate: '2023-12-17',
      rejectionReason: '',
      notes: 'Monthly salary payment',
      requestedBy: 'HR Manager',
      createdAt: '2023-12-17T09:00:00Z',
      updatedAt: '2023-12-17T09:00:00Z',
    },
  ];

  const mockVehicles: Array<{ id: string; registrationNumber: string; driverName: string; driverId: string }> = [
    { id: '1', registrationNumber: 'MH-12-AB-1234', driverName: 'Rajesh Kumar', driverId: '1' },
    { id: '2', registrationNumber: 'MH-12-CD-5678', driverName: 'Suresh Patel', driverId: '2' },
  ];

  // Fetch expenses and vehicles data
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExpenses(mockExpenses);
      setAvailableVehicles(mockVehicles);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Filter and search expenses
  useEffect(() => {
    let filtered = expenses;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.expenseNumber.toLowerCase().includes(searchLower) ||
        expense.vehicleRegistrationNumber.toLowerCase().includes(searchLower) ||
        expense.driverName.toLowerCase().includes(searchLower) ||
        expense.vendorName.toLowerCase().includes(searchLower) ||
        expense.expenseType.toLowerCase().includes(searchLower) ||
        expense.description.toLowerCase().includes(searchLower)
      );
    }


    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(expense => expense.expenseCategory === filterCategory);
    }

    // Apply vehicle filter
    if (filterVehicle !== 'all') {
      filtered = filtered.filter(expense => expense.vehicleId === filterVehicle);
    }

    // Apply date range filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterDateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(expense => 
            new Date(expense.expenseDate) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(expense => 
            new Date(expense.expenseDate) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(expense => 
            new Date(expense.expenseDate) >= filterDate
          );
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          filtered = filtered.filter(expense => 
            new Date(expense.expenseDate) >= filterDate
          );
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof VehicleExpenseData];
      let bValue: any = b[sortBy as keyof VehicleExpenseData];

      if (sortBy === 'expenseDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === 'amount') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
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

    setFilteredExpenses(filtered);
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [expenses, searchTerm, filterCategory, filterVehicle, filterDateRange, sortBy, sortOrder]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

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

  const getExpenseCategoryIcon = (category: string) => {
    switch (category) {
      case 'fuel':
        return <Fuel className='w-4 h-4' />;
      case 'maintenance':
      case 'repair':
        return <Wrench className='w-4 h-4' />;
      case 'insurance':
        return <CreditCard className='w-4 h-4' />;
      case 'toll':
      case 'parking':
        return <MapPin className='w-4 h-4' />;
      case 'driver_salary':
        return <IndianRupee className='w-4 h-4' />;
      case 'permit':
        return <FileText className='w-4 h-4' />;
      default:
        return <Receipt className='w-4 h-4' />;
    }
  };

  const getExpenseCategoryColor = (category: string) => {
    switch (category) {
      case 'fuel':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'repair':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'insurance':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'toll':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'parking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'driver_salary':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'permit':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  const handleCreateExpense = (expenseData: VehicleExpenseData) => {
    // Generate new expense ID with the new format
    const newExpenseId = generateExpenseId(expenseData.expenseDate, expenses.length + 1);
    
    const newExpense: VehicleExpenseData = {
      ...expenseData,
      expenseNumber: newExpenseId,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    setIsExpenseFormOpen(false);
    
    toast({
      title: '✅ Expense Recorded Successfully!',
      description: `Expense ${newExpenseId} has been recorded and added to the system.`,
      variant: 'default',
    });
  };

  const handleViewExpense = (expense: VehicleExpenseData) => {
    setViewingExpense(expense);
    setIsViewDialogOpen(true);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB');
  };

  const formatCurrency = (amount: string) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  // File handling functions
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className='w-4 h-4' />;
    }
    return <FileText className='w-4 h-4' />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Export functionality
  const exportToCSV = async () => {
    try {
      setIsExporting(true);

      // Filter expenses by date range if specified
      let filteredExpenses = expenses;
      if (exportDateRange.from || exportDateRange.to) {
        filteredExpenses = expenses.filter((expense) => {
          const expenseDate = new Date(expense.expenseDate);

          if (exportDateRange.from && exportDateRange.to) {
            const fromDate = new Date(exportDateRange.from);
            const toDate = new Date(exportDateRange.to);
            return expenseDate >= fromDate && expenseDate <= toDate;
          } else if (exportDateRange.from) {
            const fromDate = new Date(exportDateRange.from);
            return expenseDate >= fromDate;
          } else if (exportDateRange.to) {
            const toDate = new Date(exportDateRange.to);
            return expenseDate <= toDate;
          }

          return true;
        });
      }

      // Apply current filters to the filtered expenses
      let exportData = filteredExpenses;

      // Apply category filter
      if (filterCategory !== 'all') {
        exportData = exportData.filter(expense => expense.expenseCategory === filterCategory);
      }

      // Apply vehicle filter
      if (filterVehicle !== 'all') {
        exportData = exportData.filter(expense => expense.vehicleId === filterVehicle);
      }

      // Apply date range filter
      if (filterDateRange !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch (filterDateRange) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            exportData = exportData.filter(expense => 
              new Date(expense.expenseDate) >= filterDate
            );
            break;
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            exportData = exportData.filter(expense => 
              new Date(expense.expenseDate) >= filterDate
            );
            break;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            exportData = exportData.filter(expense => 
              new Date(expense.expenseDate) >= filterDate
            );
            break;
          case 'quarter':
            filterDate.setMonth(now.getMonth() - 3);
            exportData = exportData.filter(expense => 
              new Date(expense.expenseDate) >= filterDate
            );
            break;
        }
      }

      // Prepare CSV headers
      const headers = [
        'Expense ID',
        'Vehicle Registration Number',
        'Expense Date',
        'Expense Category',
        'Expense Type',
        'Description',
        'Amount (₹)',
        'Location',
        'Vendor Name',
        'Vendor Contact',
        'Vendor Address',
        'Payment Method',
        'Payment Reference',
        'Requested By',
        'Notes',
        'Created Date',
        'Updated Date'
      ];

      // Prepare CSV data
      const csvData = exportData.map((expense) => [
        `"${expense.expenseNumber}"`,
        `"${expense.vehicleRegistrationNumber}"`,
        `"${formatDateDisplay(expense.expenseDate)}"`,
        `"${expense.expenseCategory.replace('_', ' ').toUpperCase()}"`,
        `"${expense.expenseType}"`,
        `"${expense.description}"`,
        parseFloat(expense.amount).toFixed(2),
        `"${expense.location}"`,
        `"${expense.vendorName}"`,
        `"${expense.vendorContact}"`,
        `"${expense.vendorAddress}"`,
        `"${expense.paymentMethod.replace('_', ' ').toUpperCase()}"`,
        `"${expense.paymentReference}"`,
        `"${expense.requestedBy}"`,
        `"${expense.notes}"`,
        `"${formatDateDisplay(expense.createdAt || new Date().toISOString())}"`,
        `"${formatDateDisplay(expense.updatedAt || new Date().toISOString())}"`
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvData.map((row) => row.join(',')),
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);

      // Generate filename with current date and date range
      const currentDate = new Date().toISOString().split('T')[0];
      let filename = `ssrfm_expenses_export_${currentDate}`;

      if (exportDateRange.from || exportDateRange.to) {
        if (exportDateRange.from && exportDateRange.to) {
          filename += `_${exportDateRange.from}_to_${exportDateRange.to}`;
        } else if (exportDateRange.from) {
          filename += `_from_${exportDateRange.from}`;
        } else if (exportDateRange.to) {
          filename += `_to_${exportDateRange.to}`;
        }
      } else {
        filename += '_all_data';
      }

      link.setAttribute('download', `${filename}.csv`);

      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close dialog
      setIsExportDialogOpen(false);
      resetExportDateRange(); // Reset date range and preset after successful export

        toast({
        title: 'Export Successful',
        description: `Expenses data exported successfully. ${csvData.length} records downloaded.`,
          variant: 'default',
        });
      } catch (error) {
      console.error('Error exporting expenses:', error);
        toast({
        title: 'Export Failed',
        description: 'Failed to export expenses data. Please try again.',
          variant: 'destructive',
        });
    } finally {
      setIsExporting(false);
    }
  };

  // Reset export date range
  const resetExportDateRange = () => {
    setExportDateRange({
      from: '',
      to: '',
    });
    setSelectedExportPreset('all');
  };

  return (
    <div className='space-y-4 p-2 sm:space-y-6 sm:p-0'>
      {/* Search, Filters and Actions */}
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
                    placeholder='Search expenses...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <Button
                variant='outline'
                onClick={fetchExpenses}
                disabled={isLoading}
                size='sm'
                className='gap-1 text-xs'
              >
                <RefreshCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Ref
              </Button>
              <Button
                variant='outline'
                onClick={() => setIsExportDialogOpen(true)}
                size='sm'
                className='gap-1 text-xs'
                disabled={filteredExpenses.length === 0}
              >
                <Upload className='w-3 h-3' />
                Export
              </Button>
              <Button
                onClick={() => setIsExpenseFormOpen(true)}
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
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className='text-sm'>
                    <SelectValue placeholder='Category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    <SelectItem value='fuel'>Fuel</SelectItem>
                    <SelectItem value='maintenance'>Maintenance</SelectItem>
                    <SelectItem value='repair'>Repair</SelectItem>
                    <SelectItem value='insurance'>Insurance</SelectItem>
                    <SelectItem value='toll'>Toll</SelectItem>
                    <SelectItem value='parking'>Parking</SelectItem>
                    <SelectItem value='driver_salary'>Driver Salary</SelectItem>
                    <SelectItem value='permit'>Permit</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex-1'>
                <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                  <SelectTrigger className='text-sm'>
                    <SelectValue placeholder='Vehicle' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Vehicles</SelectItem>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.registrationNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className='flex gap-2'>
              <div className='flex-1'>
                <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                  <SelectTrigger className='text-sm'>
                    <SelectValue placeholder='Date Range' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Time</SelectItem>
                    <SelectItem value='today'>Today</SelectItem>
                    <SelectItem value='week'>This Week</SelectItem>
                    <SelectItem value='month'>This Month</SelectItem>
                    <SelectItem value='quarter'>This Quarter</SelectItem>
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
                  placeholder='Search expenses...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>


            {/* Category Filter */}
            <div className='w-full xl:w-36'>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className='text-sm'>
                  <SelectValue placeholder='Category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Categories</SelectItem>
                  <SelectItem value='fuel'>Fuel</SelectItem>
                  <SelectItem value='maintenance'>Maintenance</SelectItem>
                  <SelectItem value='repair'>Repair</SelectItem>
                  <SelectItem value='insurance'>Insurance</SelectItem>
                  <SelectItem value='toll'>Toll</SelectItem>
                  <SelectItem value='parking'>Parking</SelectItem>
                  <SelectItem value='driver_salary'>Driver Salary</SelectItem>
                  <SelectItem value='permit'>Permit</SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Filter */}
            <div className='w-full xl:w-36'>
              <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                <SelectTrigger className='text-sm'>
                  <SelectValue placeholder='Vehicle' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Vehicles</SelectItem>
                  {availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className='w-full xl:w-32'>
              <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                <SelectTrigger className='text-sm'>
                  <SelectValue placeholder='Date' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Time</SelectItem>
                  <SelectItem value='today'>Today</SelectItem>
                  <SelectItem value='week'>This Week</SelectItem>
                  <SelectItem value='month'>This Month</SelectItem>
                  <SelectItem value='quarter'>This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={fetchExpenses}
                disabled={isLoading}
                size='sm'
                className='gap-2 text-sm'
              >
                <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant='outline'
                onClick={() => setIsExportDialogOpen(true)}
                size='sm'
                className='gap-2 text-sm'
                disabled={filteredExpenses.length === 0}
              >
                <Upload className='w-4 h-4' />
                Export
              </Button>
              
              <Button
                onClick={() => setIsExpenseFormOpen(true)}
                size='sm'
                className='gap-2 text-sm'
                disabled={!hasPermission('inventory:material-indents:create')}
              >
                <Plus className='w-4 h-4' />
                Add Expense
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <RefreshCcw className='w-8 h-8 animate-spin text-primary mx-auto mb-4' />
                <p className='text-muted-foreground'>Loading expenses...</p>
              </div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className='text-center py-12'>
              <IndianRupee className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No Expenses Found</h3>
              <p className='text-muted-foreground mb-4'>
                {searchTerm || filterCategory !== 'all' || filterVehicle !== 'all' || filterDateRange !== 'all'
                  ? 'No expenses match your current filters.'
                  : 'Get started by recording your first expense.'}
              </p>
              {(!searchTerm && filterCategory === 'all' && filterVehicle === 'all' && filterDateRange === 'all') && (
                <Button
                  onClick={() => setIsExpenseFormOpen(true)}
                  className='gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Record First Expense
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
                      onClick={() => handleSort('expenseNumber')}
                    >
                      <div className='flex items-center gap-2'>
                        Expense ID
                        {getSortIcon('expenseNumber')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('vehicleRegistrationNumber')}
                    >
                      <div className='flex items-center gap-2'>
                        Vehicle
                        {getSortIcon('vehicleRegistrationNumber')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('expenseCategory')}
                    >
                      <div className='flex items-center gap-2'>
                        Expense Category
                        {getSortIcon('expenseCategory')}
                      </div>
                    </TableHead>
                    <TableHead>Expense Details</TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('expenseDate')}
                    >
                      <div className='flex items-center gap-2'>
                        Expense Date
                        {getSortIcon('expenseDate')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className='flex items-center gap-2'>
                        Recorded Date
                        {getSortIcon('createdAt')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('amount')}
                    >
                      <div className='flex items-center gap-2'>
                        Amount
                        {getSortIcon('amount')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('requestedBy')}
                    >
                      <div className='flex items-center gap-2'>
                      Reported By
                        {getSortIcon('requestedBy')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className='flex items-center gap-2'>
                        Submitted By
                        {getSortIcon('createdAt')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpenses.map((expense) => (
                    <>
                      <TableRow key={expense.id} className='hover:bg-muted/30'>
                        <TableCell className='font-medium'>
                          <button
                            onClick={() => handleViewExpense(expense)}
                            className='text-black hover:text-primary/80 hover:underline font-semibold text-sm cursor-pointer transition-colors duration-200'
                          >
                            {expense.expenseNumber}
                          </button>
                        </TableCell>
                        
                        <TableCell>
                            <span className='font-medium text-sm'>{expense.vehicleRegistrationNumber}</span>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={`${getExpenseCategoryColor(expense.expenseCategory)} border flex items-center gap-1 w-fit`}>
                            {getExpenseCategoryIcon(expense.expenseCategory)}
                            <span className='text-xs'>{expense.expenseCategory.replace('_', ' ').toUpperCase()}</span>
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className='flex flex-col text-sm max-w-xs'>
                            <span className='font-medium truncate'>{expense.expenseType}</span>
                            <span className='text-xs text-muted-foreground truncate'>{expense.description}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className='flex flex-col text-sm'>
                            <span className='font-medium'>{formatDateDisplay(expense.expenseDate)}</span>
                            <span className='text-xs text-muted-foreground'>
                              {expense.location}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className='flex flex-col text-sm'>
                            <span className='font-medium'>{formatDateDisplay(expense.createdAt || new Date().toISOString())}</span>
                            <span className='text-xs text-muted-foreground'>
                              {expense.createdAt ? 'System User' : 'Current User'}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className='flex flex-col text-sm'>
                            <span className='font-medium'>{formatCurrency(expense.amount)}</span>
                            <span className='text-xs text-muted-foreground'>
                              {expense.paymentMethod.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className='flex flex-col text-sm'>
                            <span className='font-medium'>{expense.requestedBy || 'N/A'}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className='flex flex-col text-sm'>
                            <span className='font-medium'>{expense.createdAt ? 'System User' : 'Current User'}</span>
                            <span className='text-xs text-muted-foreground'>
                              {formatDateDisplay(expense.createdAt || new Date().toISOString())}
                            </span>
                          </div>
                        </TableCell>
                        </TableRow>
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {filteredExpenses.length > 0 && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
              {/* Page Info */}
              <div className='text-xs sm:text-sm text-muted-foreground'>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length} entries
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
                      <SelectItem value='30'>30</SelectItem>
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

      {/* Expense Form */}
      <ExpensesForm
        isOpen={isExpenseFormOpen}
        onClose={() => {
          setIsExpenseFormOpen(false);
        }}
        onSubmit={handleCreateExpense}
        editingExpense={null}
        availableVehicles={availableVehicles}
      />

      {/* View Expense Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) {
          setViewingExpense(null);
        }
      }}>
        <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader className='pb-2'>
            <DialogTitle className='flex items-center gap-2 text-lg'>
              <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
                <IndianRupee className='w-4 h-4 text-primary' />
              </div>
              Expense Details - {viewingExpense?.expenseNumber}
            </DialogTitle>
          </DialogHeader>
          
          {viewingExpense && (
            <div className='space-y-4'>
              {/* Single Card for all content */}
              <Card className='border-0 shadow-sm'>
                <CardContent className='space-y-4'>
                  {/* Basic Information */}
                  <div className='space-y-3'>
                    <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                      Basic Information
                    </h4>

                    {/* First Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Expense ID</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingExpense.expenseNumber}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Vehicle</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingExpense.vehicleRegistrationNumber}
                        </div>
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Expense Date</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {formatDateDisplay(viewingExpense.expenseDate)}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Expense Category</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          <Badge className={`${getExpenseCategoryColor(viewingExpense.expenseCategory)} border flex items-center gap-1 w-fit`}>
                            {getExpenseCategoryIcon(viewingExpense.expenseCategory)}
                            <span className='text-xs'>{viewingExpense.expenseCategory.replace('_', ' ').toUpperCase()}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Third Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Expense Type</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingExpense.expenseType}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Amount (₹)</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {formatCurrency(viewingExpense.amount)}
                        </div>
                      </div>
                    </div>

                    {/* Fourth Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Location</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingExpense.location}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Requested By</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingExpense.requestedBy || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Uploads Proofs */}
                  <div className='space-y-2'>
                    <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                      Uploaded Proofs
                    </h4>

                    {/* Receipts/Attachments Display */}
                    {viewingExpense.receipts && viewingExpense.receipts.length > 0 ? (
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-muted-foreground'>
                          Files ({viewingExpense.receipts.length})
                        </p>
                        <div className='space-y-1'>
                          {viewingExpense.receipts.map((file, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between p-2 bg-secondary rounded border'
                            >
                              <div className='flex items-center gap-2'>
                                {getFileIcon(file)}
                                <div className='flex flex-col'>
                                  <span className='text-xs font-medium truncate max-w-[180px]'>
                                    {file.name}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    {formatFileSize(file.size)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className='text-center py-4 text-muted-foreground'>
                        <FileText className='w-8 h-8 mx-auto mb-2 opacity-50' />
                        <p className='text-xs'>No attachments uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* Vendor Information */}
                  <div className='space-y-3'>
                    <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                      Vendor Information
                    </h4>

                    {/* First Row - Vendor Name, Contact, Payment Method */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Vendor Name</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingExpense.vendorName || 'N/A'}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Vendor Contact</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingExpense.vendorContact || 'N/A'}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Payment Method</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingExpense.paymentMethod.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Second Row - Payment Reference and Vendor Address */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Payment Reference</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingExpense.paymentReference || 'N/A'}
                        </div>
                      </div>

                      <div className='space-y-1 md:col-span-2'>
                        <Label className='text-xs font-medium'>Vendor Address</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                          {viewingExpense.vendorAddress || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className='space-y-3'>
                    <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                      Additional Notes
                    </h4>

                    <div className='space-y-1'>
                      <div className='min-h-[40px] px-2 py-1 bg-secondary text-xs border border-input rounded-[5px] flex items-center'>
                        {viewingExpense.notes || 'N/A'}
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Recorded By</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-center font-semibold text-xs border border-input rounded-[5px] flex items-center justify-center'>
                          {viewingExpense.createdAt ? 'System User' : 'Current User'}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Date</Label>
                        <div className='h-8 px-2 py-1 bg-secondary text-center font-semibold text-xs border border-input rounded-[5px] flex items-center justify-center'>
                          {viewingExpense.createdAt ? formatDateDisplay(viewingExpense.createdAt) : formatDateToString(new Date())}
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

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Upload className='w-5 h-5 text-primary' />
              Export Expenses to CSV
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Export Options</Label>

                    <div className='space-y-2'>
                <Label htmlFor='exportFromDate' className='text-sm'>
                  From Date (Optional)
                </Label>
                <Input
                  id='exportFromDate'
                  type='date'
                  value={exportDateRange.from}
                  onChange={(e) => {
                    setExportDateRange((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }));
                    setSelectedExportPreset('');
                  }}
                  className='w-full'
                />
                    </div>

                    <div className='space-y-2'>
                <Label htmlFor='exportToDate' className='text-sm'>
                  To Date (Optional)
                </Label>
                <Input
                  id='exportToDate'
                  type='date'
                  value={exportDateRange.to}
                  onChange={(e) => {
                    setExportDateRange((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }));
                    setSelectedExportPreset('');
                  }}
                  className='w-full'
                />
                    </div>

              <div className='text-xs text-muted-foreground'>
                Select dates for filtered export, or use "All Data" for complete
                export. Current filters (category, vehicle, date range) will be applied.
                    </div>

              {/* Quick preset buttons */}
              <div className='pt-2 border-t space-y-2'>
                <div className='text-xs font-medium text-muted-foreground'>
                  Quick Presets:
                      </div>
                <div className='grid grid-cols-2 gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      // All Data - clear both dates
                      setExportDateRange({
                        from: '',
                        to: '',
                      });
                      setSelectedExportPreset('all');
                    }}
                    className={`text-xs ${
                      selectedExportPreset === 'all'
                        ? 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    All
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      // This Month
                      const now = new Date();
                      const firstDay = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1
                      );
                      const lastDay = new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        0
                      );

                      setExportDateRange({
                        from: firstDay.toISOString().split('T')[0],
                        to: lastDay.toISOString().split('T')[0],
                      });
                      setSelectedExportPreset('this_month');
                    }}
                    className={`text-xs ${
                      selectedExportPreset === 'this_month'
                        ? 'bg-primary border-primary text-white hover:bg-primary/90'
                        : 'hover:bg-muted'
                    }`}
                  >
                    This Month
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      // Last Month
                      const now = new Date();
                      const firstDayLastMonth = new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        1
                      );
                      const lastDayLastMonth = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        0
                      );

                      setExportDateRange({
                        from: firstDayLastMonth.toISOString().split('T')[0],
                        to: lastDayLastMonth.toISOString().split('T')[0],
                      });
                      setSelectedExportPreset('last_month');
                    }}
                    className={`text-xs ${
                      selectedExportPreset === 'last_month'
                        ? 'bg-primary border-primary text-white hover:bg-primary/90'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Last Month
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      // Last 3 Months
                      const now = new Date();
                      const threeMonthsAgo = new Date(
                        now.getFullYear(),
                        now.getMonth() - 3,
                        1
                      );
                      const lastDay = new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        0
                      );

                      setExportDateRange({
                        from: threeMonthsAgo.toISOString().split('T')[0],
                        to: lastDay.toISOString().split('T')[0],
                      });
                      setSelectedExportPreset('last_3_months');
                    }}
                    className={`text-xs ${
                      selectedExportPreset === 'last_3_months'
                        ? 'bg-primary border-primary text-white hover:bg-primary/90'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Last 3 Months
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      // This Year
                      const now = new Date();
                      const firstDay = new Date(now.getFullYear(), 0, 1);
                      const lastDay = new Date(now.getFullYear(), 11, 31);

                      setExportDateRange({
                        from: firstDay.toISOString().split('T')[0],
                        to: lastDay.toISOString().split('T')[0],
                      });
                      setSelectedExportPreset('this_year');
                    }}
                    className={`text-xs ${
                      selectedExportPreset === 'this_year'
                        ? 'bg-primary border-primary text-white hover:bg-primary/90'
                        : 'hover:bg-muted'
                    }`}
                  >
                    This Year
                  </Button>
                    </div>
            </div>
            </div>

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsExportDialogOpen(false);
                  resetExportDateRange();
                }}
                disabled={isExporting}
              >
                Cancel
              </Button>

              <Button
                onClick={exportToCSV}
                disabled={isExporting}
                className='bg-primary hover:bg-primary/90 text-white'
              >
                {isExporting ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Upload className='w-4 h-4 mr-2' />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
