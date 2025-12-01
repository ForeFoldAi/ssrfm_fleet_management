import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Loader2, 
  Search,
  Filter,
  Upload,
  Eye,
  Edit,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  DollarSign,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Users,
  UserPlus,
  Settings,
  FileText,
  Star,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { format } from 'date-fns';
import { EmployeeOnboardForm } from './EmployeeOnboardForm';

interface EmployeeViewTabProps {
  // Props can be added here if needed
}

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  nationality: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Employment Information
  department: string;
  position: string;
  reportingManager: string;
  joiningDate: string;
  contractType: 'permanent' | 'contract' | 'temporary' | 'intern';
  unit: string;
  
  // Contract Details
  probationPeriod?: string;
  noticePeriod?: string;
  salary?: string;
  benefits?: string;
  workingHours?: string;
  workLocation?: string;
  
  // Status and Additional Information
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  skills: string;
  experience: string;
  education: string;
  notes: string;
  
  // System Information
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastLogin?: string;
}

interface EmployeeLeaveRecord {
  year: number;
  month: string;
  leavesTaken: number;
}

type SortField = 'fullName' | 'employeeId' | 'department' | 'position' | 'unit' | 'phone' | 'contractType' | 'joiningDate' | 'status' | 'createdAt' | 'updatedAt';
type SortOrder = 'ASC' | 'DESC';

export const EmployeeViewTab = ({}: EmployeeViewTabProps) => {
  const { currentUser, hasPermission } = useRole();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const [leaveRecords, setLeaveRecords] = useState<EmployeeLeaveRecord[]>([]);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');
  const [filterContractType, setFilterContractType] = useState('all');
  
  // Sorting and pagination
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // TODO: Populate from API
  const [units, setUnits] = useState<string[]>([]);
  const [contractTypes, setContractTypes] = useState<string[]>([]);


  const contractTypeConfig = {
    permanent: { label: 'Permanent', color: 'bg-blue-100 text-blue-800', icon: Shield },
    contract: { label: 'Contract', color: 'bg-orange-100 text-orange-800', icon: FileText },
    temporary: { label: 'Temporary', color: 'bg-purple-100 text-purple-800', icon: Clock },
    intern: { label: 'Intern', color: 'bg-green-100 text-green-800', icon: Star },
  };

  // Load employees
  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter and search employees
  useEffect(() => {
    let filtered = employees;

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.fullName.toLowerCase().includes(searchLower) ||
        employee.employeeId.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower) ||
        employee.department.toLowerCase().includes(searchLower) ||
        employee.position.toLowerCase().includes(searchLower)
      );
    }

    // Apply unit filter
    if (filterUnit !== 'all') {
      filtered = filtered.filter(employee => employee.unit === filterUnit);
    }


    // Apply contract type filter
    if (filterContractType !== 'all') {
      filtered = filtered.filter(employee =>
        filterContractType === 'terminated'
          ? employee.status === 'terminated'
          : employee.contractType === filterContractType
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'joiningDate' || sortField === 'createdAt' || sortField === 'updatedAt') {
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

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [employees, searchQuery, filterUnit, filterContractType, sortField, sortOrder]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await employeesApi.getAll();
      // setEmployees(response.data);
      
      // Placeholder - will be populated from API
      setEmployees([]);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: SortField) => {
    if (sortField === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(column);
      setSortOrder('DESC');
    }
  };

  const getSortIcon = (column: SortField) => {
    if (sortField !== column) {
      return <ArrowUpDown className='w-4 h-4 text-muted-foreground' />;
    }
    return sortOrder === 'ASC' ? (
      <ChevronUp className='w-4 h-4 text-primary' />
    ) : (
      <ChevronDown className='w-4 h-4 text-primary' />
    );
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleViewEmployeeLeaves = async (employee: Employee) => {
    setSelectedEmployee(employee);
    try {
      // TODO: Replace with actual API call
      // const response = await employeesApi.getLeaveHistory(employee.id);
      // setLeaveRecords(response.data);
      
      // Placeholder - will be populated from API
      setLeaveRecords([]);
    } catch (error) {
      console.error('Error loading leave history:', error);
      setLeaveRecords([]);
    } finally {
    setIsLeaveDialogOpen(true);
    }
  };

  const handleCloseViewDialog = () => {
    setSelectedEmployee(null);
    setIsViewDialogOpen(false);
  };

  const handleCloseLeaveDialog = () => {
    setSelectedEmployee(null);
    setLeaveRecords([]);
    setIsLeaveDialogOpen(false);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsAddEmployeeDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsAddEmployeeDialogOpen(true);
  };

  const handleCloseAddEmployeeDialog = () => {
    setEditingEmployee(null);
    setIsAddEmployeeDialogOpen(false);
  };

  const handleEmployeeSubmit = (employeeData: any) => {
    console.log('Employee submitted:', employeeData);
    // Here you would typically call an API to save the employee
    // For now, we'll just close the dialog and show a success message
    setIsAddEmployeeDialogOpen(false);
    setEditingEmployee(null);
    
    // Reload employees to show the new one
    loadEmployees();
  };

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);


  return (
    <div className='space-y-6'>
      {/* Main Content */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <div className='flex flex-col gap-4'>
            <div className='hidden sm:flex flex-col gap-4 md:flex-row md:justify-between md:items-end'>
              <CardTitle className='text-base flex items-center gap-2'>
                
              </CardTitle>

              <div className='flex flex-wrap items-end gap-2'>
                <div className='relative'>
                  <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search employees...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10 w-64 h-9'
                  />
                </div>

                <div className='flex flex-col'>
                  <Label className='text-xs text-muted-foreground mb-1'>Factory Location</Label>
                  <Select value={filterUnit} onValueChange={setFilterUnit}>
                    <SelectTrigger className='w-40 h-9'>
                      <SelectValue placeholder='Unit' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Populate from API */}
                      <SelectItem value='all'>All Units</SelectItem>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex flex-col'>
                  <Label className='text-xs text-muted-foreground mb-1'>Employment Type</Label>
                  <Select value={filterContractType} onValueChange={setFilterContractType}>
                    <SelectTrigger className='w-36 h-9'>
                      <SelectValue placeholder='Contract' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Populate from API */}
                      <SelectItem value='all'>All Types</SelectItem>
                      {contractTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center gap-2 ml-0 md:ml-2'>
                  <Button variant='outline' size='sm' className='h-9'>
                    <Upload className='w-4 h-4 mr-2' />
                    Export
                  </Button>
                  <Button size='sm' onClick={handleAddEmployee} className='h-9'>
                    <UserPlus className='w-4 h-4 mr-2' />
                    Add Employee
                  </Button>
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-3 sm:hidden'>
              {/* Search Bar - Full Width */}
              <div className='relative w-full'>
                <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search employees...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9 w-full h-10'
                />
              </div>

              {/* Filters Row */}
              <div className='flex items-end gap-2'>
                <div className='flex flex-col flex-1'>
                  <Label className='text-xs text-muted-foreground mb-1'>Factory Location</Label>
                  <Select value={filterUnit} onValueChange={setFilterUnit}>
                    <SelectTrigger className='w-full h-10 text-xs'>
                      <SelectValue placeholder='Unit' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Populate from API */}
                      <SelectItem value='all'>All Units</SelectItem>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex flex-col flex-1'>
                  <Label className='text-xs text-muted-foreground mb-1'>Employment Type</Label>
                  <Select value={filterContractType} onValueChange={setFilterContractType}>
                    <SelectTrigger className='w-full h-10 text-xs'>
                      <SelectValue placeholder='Type' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Populate from API */}
                      <SelectItem value='all'>All Types</SelectItem>
                      {contractTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='sm' className='flex-1 h-10'>
                  <Upload className='w-4 h-4 mr-1.5' />
                  Export
                </Button>
                <Button size='sm' onClick={handleAddEmployee} className='flex-1 h-10'>
                  <UserPlus className='w-4 h-4 mr-1.5' />
                  Add Employee
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <Loader2 className='w-6 h-6 animate-spin' />
              <span className='ml-2'>Loading employees...</span>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                    <TableHead className='min-w-[120px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('employeeId')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Employee ID
                        {getSortIcon('employeeId')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[200px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('fullName')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Employee Name
                        {getSortIcon('fullName')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[120px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('unit')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Factory Location
                        {getSortIcon('unit')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[150px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('department')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Department
                        {getSortIcon('department')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[120px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('phone')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Phone Number
                        {getSortIcon('phone')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[100px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('contractType')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Employment Type
                        {getSortIcon('contractType')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[120px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('position')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Position/Job Title
                        {getSortIcon('position')}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map((employee) => {
                    const employeeContractConfig = contractTypeConfig[employee.contractType];
                    
                    return (
                      <TableRow key={employee.id} className='hover:bg-muted/30'>
                        <TableCell className='font-mono text-sm'>
                          <div className='inline-flex flex-col items-start group'>
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className='text-primary hover:text-primary/80 hover:underline cursor-pointer'
                            >
                              {employee.employeeId}
                            </button>
                            <span className='text-[10px] uppercase text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150'>
                              Edit
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='inline-flex flex-col items-start group'>
                            <button
                              onClick={() => handleViewEmployeeLeaves(employee)}
                              className='font-medium text-primary hover:text-primary/80 hover:underline'
                            >
                              {employee.fullName}
                            </button>
                            <span className='text-[10px] uppercase text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150'>
                              View leave history
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <MapPin className='w-4 h-4 text-muted-foreground' />
                            {employee.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Building className='w-4 h-4 text-muted-foreground' />
                            {employee.department}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1 text-sm'>
                            <Phone className='w-3 h-3 text-muted-foreground' />
                            <span>{employee.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <Badge className={employeeContractConfig.color}>
                              {React.createElement(employeeContractConfig.icon, { className: 'w-3 h-3 mr-1' })}
                              {employeeContractConfig.label}
                            </Badge>
                            {employee.status === 'terminated' && (
                              <span className='text-[10px] uppercase text-destructive font-semibold mt-1'>
                                Terminated
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {employee.position}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination - Hide when searching */}
          {!searchQuery.trim() && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
              {/* Page Info */}
              <div className='text-xs sm:text-sm text-muted-foreground'>
                {filteredEmployees.length > 0 
                  ? `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredEmployees.length)} of ${filteredEmployees.length} entries`
                  : 'Showing 0 to 0 of 0 entries'
                }
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
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronLeft className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>

                  {/* Page numbers - Show up to 6 pages */}
                  <div className='flex items-center gap-1 mx-1 sm:mx-2'>
                    {Array.from(
                      { length: Math.min(6, totalPages) },
                      (_, i) => {
                        let pageNum;
                        
                        if (totalPages <= 6) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = currentPage - 3 + i;
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
                      }
                    )}
                  </div>

                  {/* Next page button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

      {/* Search Results Info - Show when searching and no error */}
      {searchQuery.trim() && filteredEmployees.length > 0 && (
        <div className='text-sm text-muted-foreground text-center py-2'>
          Showing {filteredEmployees.length} employee
          {filteredEmployees.length !== 1 ? 's' : ''} matching "{searchQuery}"
        </div>
      )}

      {/* Employee Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={handleCloseViewDialog}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <User className='w-5 h-5' />
              Employee Details - {selectedEmployee?.fullName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className='space-y-6'>
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Full Name</Label>
                    <p className='font-medium'>{selectedEmployee.fullName}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Employee ID</Label>
                    <p className='font-mono'>{selectedEmployee.employeeId}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Email</Label>
                    <p>{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Phone</Label>
                    <p>{selectedEmployee.phone}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Date of Birth</Label>
                    <p>{format(new Date(selectedEmployee.dateOfBirth), 'dd-MM-yyyy')}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Gender</Label>
                    <p className='capitalize'>{selectedEmployee.gender}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Marital Status</Label>
                    <p className='capitalize'>{selectedEmployee.maritalStatus}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Nationality</Label>
                    <p>{selectedEmployee.nationality}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Employment Information</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Factory Location</Label>
                    <p>{selectedEmployee.unit}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Department</Label>
                    <p>{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Position</Label>
                    <p>{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Reporting Manager</Label>
                    <p>{selectedEmployee.reportingManager}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Joining Date</Label>
                    <p>{format(new Date(selectedEmployee.joiningDate), 'dd-MM-yyyy')}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Contract Type</Label>
                    <Badge className={contractTypeConfig[selectedEmployee.contractType].color}>
                      {contractTypeConfig[selectedEmployee.contractType].label}
                    </Badge>
                  </div>
                  {selectedEmployee.salary && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Salary</Label>
                      <p>${selectedEmployee.salary}</p>
                    </div>
                  )}
                  {selectedEmployee.workingHours && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Working Hours</Label>
                      <p>{selectedEmployee.workingHours}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Address Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <p>{selectedEmployee.address}</p>
                    <p>{selectedEmployee.city}, {selectedEmployee.state} {selectedEmployee.postalCode}</p>
                    <p>{selectedEmployee.country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Name</Label>
                    <p>{selectedEmployee.emergencyContactName}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Phone</Label>
                    <p>{selectedEmployee.emergencyContactPhone}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Relationship</Label>
                    <p>{selectedEmployee.emergencyContactRelation}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              {(selectedEmployee.skills || selectedEmployee.experience || selectedEmployee.education || selectedEmployee.notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {selectedEmployee.skills && (
                      <div>
                        <Label className='text-sm font-medium text-muted-foreground'>Skills</Label>
                        <p>{selectedEmployee.skills}</p>
                      </div>
                    )}
                    {selectedEmployee.experience && (
                      <div>
                        <Label className='text-sm font-medium text-muted-foreground'>Experience</Label>
                        <p>{selectedEmployee.experience}</p>
                      </div>
                    )}
                    {selectedEmployee.education && (
                      <div>
                        <Label className='text-sm font-medium text-muted-foreground'>Education</Label>
                        <p>{selectedEmployee.education}</p>
                      </div>
                    )}
                    {selectedEmployee.notes && (
                      <div>
                        <Label className='text-sm font-medium text-muted-foreground'>Notes</Label>
                        <p>{selectedEmployee.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Leave History Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={handleCloseLeaveDialog}>
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Calendar className='w-5 h-5' />
              {selectedEmployee ? `${selectedEmployee.fullName} - Leave History` : 'Leave History'}
            </DialogTitle>
          </DialogHeader>

          {leaveRecords.length > 0 ? (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className='text-right'>Leaves Taken</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRecords.map((record, index) => (
                    <TableRow key={`${record.year}-${record.month}-${index}`}>
                      <TableCell>{record.year}</TableCell>
                      <TableCell>{record.month}</TableCell>
                      <TableCell className='text-right font-medium'>{record.leavesTaken}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className='py-6 text-center text-sm text-muted-foreground'>
              No leave records found for this employee.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Onboard Form Dialog */}
      <EmployeeOnboardForm
        isOpen={isAddEmployeeDialogOpen}
        onClose={handleCloseAddEmployeeDialog}
        onSubmit={handleEmployeeSubmit}
        editingEmployee={editingEmployee}
      />
    </div>
  );
};
