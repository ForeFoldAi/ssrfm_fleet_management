import { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Truck,
  User,
  Fuel,
  Wrench,
  CreditCard,
  MapPin,
  Receipt,
  FileText,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Filter,
  Download,
  Upload,
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
import { ExpensesForm, VehicleExpenseData } from './ExpensesForm';

export const ExpensesTab = () => {
  const { currentUser, hasPermission } = useRole();
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<VehicleExpenseData[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<VehicleExpenseData[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Array<{ id: string; registrationNumber: string; driverName: string; driverId: string }>>([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('expenseDate');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form states
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<VehicleExpenseData | null>(null);
  const [viewingExpense, setViewingExpense] = useState<VehicleExpenseData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Mock data - Replace with actual API calls
  const mockExpenses: VehicleExpenseData[] = [
    {
      id: '1',
      expenseNumber: 'EXP-1703123456789',
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
      createdAt: '2023-12-21T10:30:00Z',
      updatedAt: '2023-12-21T10:30:00Z',
    },
    {
      id: '2',
      expenseNumber: 'EXP-1703123456790',
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
      createdAt: '2023-12-20T14:00:00Z',
      updatedAt: '2023-12-20T14:00:00Z',
    },
    {
      id: '3',
      expenseNumber: 'EXP-1703123456791',
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
      createdAt: '2023-12-19T16:45:00Z',
      updatedAt: '2023-12-19T16:45:00Z',
    },
    {
      id: '4',
      expenseNumber: 'EXP-1703123456792',
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
      createdAt: '2023-12-18T11:20:00Z',
      updatedAt: '2023-12-18T11:20:00Z',
    },
    {
      id: '5',
      expenseNumber: 'EXP-1703123456793',
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

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(expense => expense.approvalStatus === filterStatus);
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
  }, [expenses, searchTerm, filterStatus, filterCategory, filterVehicle, filterDateRange, sortBy, sortOrder]);

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

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className='w-4 h-4' />;
      case 'approved':
        return <CheckCircle className='w-4 h-4' />;
      case 'rejected':
        return <XCircle className='w-4 h-4' />;
      default:
        return <AlertTriangle className='w-4 h-4' />;
    }
  };

  const toggleRowExpansion = (expenseId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(expenseId)) {
      newExpandedRows.delete(expenseId);
    } else {
      newExpandedRows.add(expenseId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleCreateExpense = (expenseData: VehicleExpenseData) => {
    const newExpense: VehicleExpenseData = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    setIsExpenseFormOpen(false);
    
    toast({
      title: '✅ Expense Recorded Successfully!',
      description: `Expense ${expenseData.expenseNumber} has been recorded and added to the system.`,
      variant: 'default',
    });
  };

  const handleEditExpense = (expense: VehicleExpenseData) => {
    setEditingExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleViewExpense = (expense: VehicleExpenseData) => {
    setViewingExpense(expense);
    setIsViewDialogOpen(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this expense? This action cannot be undone.');
    if (confirmed) {
      try {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
        toast({
          title: '✅ Expense Deleted',
          description: 'Expense has been successfully removed from the system.',
          variant: 'default',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete expense. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB');
  };

  const formatCurrency = (amount: string) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
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
                onClick={() => {
                  setEditingExpense(null);
                  setIsExpenseFormOpen(true);
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
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='approved'>Approved</SelectItem>
                    <SelectItem value='rejected'>Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </div>
            
            <div className='flex gap-2'>
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

            {/* Status Filter */}
            <div className='w-full xl:w-32'>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className='text-sm'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='approved'>Approved</SelectItem>
                  <SelectItem value='rejected'>Rejected</SelectItem>
                </SelectContent>
              </Select>
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
                onClick={() => {
                  setEditingExpense(null);
                  setIsExpenseFormOpen(true);
                }}
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
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' || filterVehicle !== 'all' || filterDateRange !== 'all'
                  ? 'No expenses match your current filters.'
                  : 'Get started by recording your first expense.'}
              </p>
              {(!searchTerm && filterStatus === 'all' && filterCategory === 'all' && filterVehicle === 'all' && filterDateRange === 'all') && (
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
                    <TableHead className='w-12'></TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('expenseNumber')}
                    >
                      <div className='flex items-center gap-2'>
                        Expense Number
                        {getSortIcon('expenseNumber')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('vehicleRegistrationNumber')}
                    >
                      <div className='flex items-center gap-2'>
                        Vehicle & Driver
                        {getSortIcon('vehicleRegistrationNumber')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('expenseCategory')}
                    >
                      <div className='flex items-center gap-2'>
                        Category
                        {getSortIcon('expenseCategory')}
                      </div>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead 
                      className='cursor-pointer hover:bg-secondary/30'
                      onClick={() => handleSort('expenseDate')}
                    >
                      <div className='flex items-center gap-2'>
                        Date
                        {getSortIcon('expenseDate')}
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
                      onClick={() => handleSort('approvalStatus')}
                    >
                      <div className='flex items-center gap-2'>
                        Status
                        {getSortIcon('approvalStatus')}
                      </div>
                    </TableHead>
                    <TableHead className='w-12'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpenses.map((expense) => (
                    <>
                      <TableRow key={expense.id} className='hover:bg-muted/30'>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={() => toggleRowExpansion(expense.id!)}
                          >
                            {expandedRows.has(expense.id!) ? (
                              <ChevronUp className='w-4 h-4' />
                            ) : (
                              <ChevronDown className='w-4 h-4' />
                            )}
                          </Button>
                        </TableCell>
                        
                        <TableCell className='font-medium'>
                          <div className='flex flex-col'>
                            <span className='font-semibold text-sm'>{expense.expenseNumber}</span>
                            <span className='text-xs text-muted-foreground'>
                              {formatDate(expense.createdAt!)}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium text-sm'>{expense.vehicleRegistrationNumber}</span>
                            <span className='text-xs text-muted-foreground'>
                              {expense.driverName}
                            </span>
                          </div>
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
                            <span className='font-medium'>{formatDate(expense.expenseDate)}</span>
                            <span className='text-xs text-muted-foreground'>
                              {expense.location}
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
                          <Badge className={`${getApprovalStatusColor(expense.approvalStatus)} border flex items-center gap-1 w-fit`}>
                            {getApprovalStatusIcon(expense.approvalStatus)}
                            <span className='text-xs'>{expense.approvalStatus.toUpperCase()}</span>
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                                <MoreVertical className='w-4 h-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleViewExpense(expense)}>
                                <Eye className='w-4 h-4 mr-2' />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                                <Edit className='w-4 h-4 mr-2' />
                                Edit Expense
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteExpense(expense.id!)}
                                className='text-destructive'
                              >
                                <Trash2 className='w-4 h-4 mr-2' />
                                Delete Expense
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Row Details */}
                      {expandedRows.has(expense.id!) && (
                        <TableRow>
                          <TableCell colSpan={9} className='p-0'>
                            <div className='bg-muted/20 p-4'>
                              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                                <div>
                                  <h4 className='font-semibold mb-2'>Vendor Details</h4>
                                  <div className='space-y-1 text-sm'>
                                    <p><span className='font-medium'>Name:</span> {expense.vendorName}</p>
                                    <p><span className='font-medium'>Contact:</span> {expense.vendorContact || 'N/A'}</p>
                                    <p><span className='font-medium'>Address:</span> {expense.vendorAddress || 'N/A'}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className='font-semibold mb-2'>Payment Details</h4>
                                  <div className='space-y-1 text-sm'>
                                    <p><span className='font-medium'>Method:</span> {expense.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                                    <p><span className='font-medium'>Reference:</span> {expense.paymentReference || 'N/A'}</p>
                                    <p><span className='font-medium'>Odometer:</span> {expense.odometerReading ? `${expense.odometerReading} km` : 'N/A'}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className='font-semibold mb-2'>Approval Details</h4>
                                  <div className='space-y-1 text-sm'>
                                    <p><span className='font-medium'>Status:</span> {expense.approvalStatus.toUpperCase()}</p>
                                    <p><span className='font-medium'>Approved By:</span> {expense.approvedBy || 'N/A'}</p>
                                    <p><span className='font-medium'>Date:</span> {expense.approvedDate ? formatDate(expense.approvedDate) : 'N/A'}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className='font-semibold mb-2'>Additional Info</h4>
                                  <div className='space-y-1 text-sm'>
                                    <p><span className='font-medium'>Created:</span> {formatDateTime(expense.createdAt!)}</p>
                                    {expense.notes && (
                                      <p><span className='font-medium'>Notes:</span> {expense.notes}</p>
                                    )}
                                    {expense.rejectionReason && (
                                      <p><span className='font-medium'>Rejection Reason:</span> <span className='text-red-600'>{expense.rejectionReason}</span></p>
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
          {filteredExpenses.length > 0 && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 border-t'>
              <div className='flex flex-col sm:flex-row items-center gap-2'>
                <span className='text-xs sm:text-sm text-muted-foreground'>
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length} expenses
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

      {/* Expense Form */}
      <ExpensesForm
        isOpen={isExpenseFormOpen}
        onClose={() => {
          setIsExpenseFormOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleCreateExpense}
        editingExpense={editingExpense}
        availableVehicles={availableVehicles}
      />

      {/* View Expense Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <IndianRupee className='w-5 h-5' />
              Expense Details - {viewingExpense?.expenseNumber}
            </DialogTitle>
            <DialogDescription>
              Complete information about the expense and its approval status
            </DialogDescription>
          </DialogHeader>
          
          {viewingExpense && (
            <div className='space-y-6'>
              {/* Expense Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Receipt className='w-4 h-4' />
                    Expense Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Expense Number</Label>
                      <p className='text-sm font-mono'>{viewingExpense.expenseNumber}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Category</Label>
                      <Badge className={`${getExpenseCategoryColor(viewingExpense.expenseCategory)} border flex items-center gap-1 w-fit`}>
                        {getExpenseCategoryIcon(viewingExpense.expenseCategory)}
                        <span className='text-xs'>{viewingExpense.expenseCategory.replace('_', ' ').toUpperCase()}</span>
                      </Badge>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Expense Type</Label>
                      <p className='text-sm'>{viewingExpense.expenseType}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Amount</Label>
                      <p className='text-lg font-semibold'>{formatCurrency(viewingExpense.amount)}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Date</Label>
                      <p className='text-sm'>{formatDate(viewingExpense.expenseDate)}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Location</Label>
                      <p className='text-sm'>{viewingExpense.location}</p>
                    </div>
                    <div className='space-y-2 md:col-span-2'>
                      <Label className='text-sm font-medium'>Description</Label>
                      <p className='text-sm'>{viewingExpense.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle & Driver Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Truck className='w-4 h-4' />
                    Vehicle & Driver Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Vehicle Registration</Label>
                      <p className='text-sm'>{viewingExpense.vehicleRegistrationNumber}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Driver Name</Label>
                      <p className='text-sm'>{viewingExpense.driverName}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Odometer Reading</Label>
                      <p className='text-sm'>{viewingExpense.odometerReading ? `${viewingExpense.odometerReading} km` : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='w-4 h-4' />
                    Vendor Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Vendor Name</Label>
                      <p className='text-sm'>{viewingExpense.vendorName}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Contact</Label>
                      <p className='text-sm'>{viewingExpense.vendorContact || 'N/A'}</p>
                    </div>
                    <div className='space-y-2 md:col-span-2'>
                      <Label className='text-sm font-medium'>Address</Label>
                      <p className='text-sm'>{viewingExpense.vendorAddress || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <CreditCard className='w-4 h-4' />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Payment Method</Label>
                      <p className='text-sm'>{viewingExpense.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Payment Reference</Label>
                      <p className='text-sm'>{viewingExpense.paymentReference || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <CheckCircle className='w-4 h-4' />
                    Approval Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Status</Label>
                      <Badge className={`${getApprovalStatusColor(viewingExpense.approvalStatus)} border flex items-center gap-1 w-fit`}>
                        {getApprovalStatusIcon(viewingExpense.approvalStatus)}
                        <span className='text-xs'>{viewingExpense.approvalStatus.toUpperCase()}</span>
                      </Badge>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Approved By</Label>
                      <p className='text-sm'>{viewingExpense.approvedBy || 'N/A'}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Approval Date</Label>
                      <p className='text-sm'>{viewingExpense.approvedDate ? formatDate(viewingExpense.approvedDate) : 'N/A'}</p>
                    </div>
                    {viewingExpense.rejectionReason && (
                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Rejection Reason</Label>
                        <p className='text-sm text-red-600'>{viewingExpense.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              {viewingExpense.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <FileText className='w-4 h-4' />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>Notes</Label>
                      <p className='text-sm'>{viewingExpense.notes}</p>
                    </div>
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
