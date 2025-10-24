import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Loader2, 
  Plus, 
  Save,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Upload,
  User,
  Building,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, isToday, isWeekend } from 'date-fns';

interface AttendanceTabProps {
  // Props can be added here if needed
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  unit: string;
  email: string;
  phone: string;
  isActive: boolean;
}

interface AttendanceRecord {
  employeeId: string;
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'on_leave';
  notes?: string;
  markedBy: string;
  markedAt: string;
}

interface AttendanceSummary {
  totalEmployees: number;
  present: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  attendancePercentage: number;
}

export const AttendenceTab = ({}: AttendanceTabProps) => {
  const { currentUser } = useRole();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting states
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Mock employee data - Replace with actual API call
  const mockEmployees: Employee[] = [
    { id: '1', name: 'John Doe', employeeId: 'EMP001', department: 'Engineering', position: 'Software Engineer', unit: 'Main Office', email: 'john@company.com', phone: '+1234567890', isActive: true },
    { id: '2', name: 'Jane Smith', employeeId: 'EMP002', department: 'Marketing', position: 'Marketing Manager', unit: 'Branch Office', email: 'jane@company.com', phone: '+1234567891', isActive: true },
    { id: '3', name: 'Mike Johnson', employeeId: 'EMP003', department: 'Sales', position: 'Sales Executive', unit: 'Remote Office', email: 'mike@company.com', phone: '+1234567892', isActive: true },
    { id: '4', name: 'Sarah Wilson', employeeId: 'EMP004', department: 'HR', position: 'HR Manager', unit: 'Head Office', email: 'sarah@company.com', phone: '+1234567893', isActive: true },
    { id: '5', name: 'David Brown', employeeId: 'EMP005', department: 'Finance', position: 'Accountant', unit: 'Main Office', email: 'david@company.com', phone: '+1234567894', isActive: true },
    { id: '6', name: 'Lisa Davis', employeeId: 'EMP006', department: 'Engineering', position: 'Senior Developer', unit: 'Branch Office', email: 'lisa@company.com', phone: '+1234567895', isActive: true },
    { id: '7', name: 'Tom Wilson', employeeId: 'EMP007', department: 'Operations', position: 'Operations Manager', unit: 'Head Office', email: 'tom@company.com', phone: '+1234567896', isActive: true },
    { id: '8', name: 'Emma Taylor', employeeId: 'EMP008', department: 'Customer Service', position: 'Support Agent', unit: 'Remote Office', email: 'emma@company.com', phone: '+1234567897', isActive: true },
  ];

  const departments = ['all', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Customer Service'];

  // Sorting functions
  const handleSort = (field: string) => {
    let newSortOrder = sortOrder;

    if (sortField === field) {
      // Toggle sort order if same field
      newSortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      // Set new field with ascending order
      newSortOrder = 'ASC';
    }

    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className='w-4 h-4 text-muted-foreground' />;
    }
    return sortOrder === 'ASC' ? (
      <ArrowUp className='w-4 h-4 text-primary' />
    ) : (
      <ArrowDown className='w-4 h-4 text-primary' />
    );
  };

  // Function to get approved leaves for a specific date
  const getApprovedLeavesForDate = async (date: Date): Promise<any[]> => {
    try {
      // In a real app, this would be an API call to get approved leaves
      // For now, we'll use mock data that matches the LeavesViewTab structure
      const mockApprovedLeaves = [
        {
          id: '1',
          employeeId: 'EMP001',
          startDate: '2024-02-15',
          endDate: '2024-02-20',
          status: 'approved'
        },
        {
          id: '4',
          employeeId: 'EMP004',
          startDate: '2024-03-01',
          endDate: '2024-08-31',
          status: 'approved'
        }
      ];
      
      // Filter leaves that are approved and cover the given date
      return mockApprovedLeaves.filter(leave => 
        leave.status === 'approved' &&
        new Date(leave.startDate) <= date &&
        new Date(leave.endDate) >= date
      );
    } catch (error) {
      console.error('Error fetching approved leaves:', error);
      return [];
    }
  };

  const attendanceStatuses = [
    { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'half_day', label: 'Half Day', color: 'bg-blue-100 text-blue-800', icon: Clock },
    { value: 'on_leave', label: 'On Leave', color: 'bg-purple-100 text-purple-800', icon: Calendar },
  ];

  // Load employees and attendance data
  useEffect(() => {
    loadEmployees();
    loadAttendanceForDate(selectedDate);
  }, [selectedDate]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await employeesApi.getAll();
      // setEmployees(response.data);
      
      // Mock data for now
      setEmployees(mockEmployees);
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

  const loadAttendanceForDate = async (date: Date) => {
    try {
      // In a real app, this would be an API call
      // const response = await attendanceApi.getByDate(format(date, 'yyyy-MM-dd'));
      // setAttendanceRecords(response.data);
      
      // Check for approved leaves for this date
      const approvedLeaves = await getApprovedLeavesForDate(date);
      
      // Mock data for now - simulate some existing attendance records
      const mockRecords: AttendanceRecord[] = employees
        .filter(emp => emp.isActive)
        .map(emp => {
          // Check if employee is on approved leave for this date
          const isOnLeave = approvedLeaves.some(leave => 
            leave.employeeId === emp.id && 
            new Date(leave.startDate) <= date && 
            new Date(leave.endDate) >= date
          );
          
          return {
            employeeId: emp.id,
            date: format(date, 'yyyy-MM-dd'),
            status: isOnLeave ? 'on_leave' as const : 'present' as const,
            markedBy: currentUser?.name || 'System',
            markedAt: new Date().toISOString(),
          };
        });
      
      setAttendanceRecords(mockRecords);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next' 
      ? addDays(selectedDate, 1)
      : subDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  // Check if attendance is editable (only for today)
  const isAttendanceEditable = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  };


  const handleEmployeeAttendanceChange = (employeeId: string, status: string) => {
    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(record => record.employeeId === employeeId);
      
      if (existingIndex >= 0) {
        // Update existing record
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: status as AttendanceRecord['status'],
          markedBy: currentUser?.name || 'System',
          markedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        // Add new record
        return [...prev, {
          employeeId,
          date: format(selectedDate, 'yyyy-MM-dd'),
          status: status as AttendanceRecord['status'],
          markedBy: currentUser?.name || 'System',
          markedAt: new Date().toISOString(),
        }];
      }
    });
  };

  const getAttendanceStatus = (employeeId: string): string => {
    const record = attendanceRecords.find(r => r.employeeId === employeeId);
    return record?.status || 'present';
  };

  const getAttendanceSummary = (): AttendanceSummary => {
    const activeEmployees = employees.filter(emp => emp.isActive);
    const totalEmployees = activeEmployees.length;
    
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const halfDay = attendanceRecords.filter(r => r.status === 'half_day').length;
    const onLeave = attendanceRecords.filter(r => r.status === 'on_leave').length;
    
    const attendancePercentage = totalEmployees > 0 ? (present / totalEmployees) * 100 : 0;
    
    return {
      totalEmployees,
      present,
      absent,
      halfDay,
      onLeave,
      attendancePercentage,
    };
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    
    try {
      // In a real app, this would be an API call
      // await attendanceApi.saveBatch(attendanceRecords);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Attendance Saved',
        description: `Attendance for ${format(selectedDate, 'MMMM dd, yyyy')} has been saved successfully.`,
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to save attendance. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    return matchesSearch && matchesDepartment && emp.isActive;
  });

  // Apply sorting to filtered employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue: any = a[sortField as keyof Employee];
    let bValue: any = b[sortField as keyof Employee];

    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'ASC' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'ASC' ? 1 : -1;
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = sortedEmployees.slice(startIndex, endIndex);

  const summary = getAttendanceSummary();

  return (
    <div className='space-y-6'>

    

     

      {/* Main Content */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle className='text-base flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className='ml-2 text-primary hover:text-primary/80 underline cursor-pointer flex items-center gap-2'
                  >
                    {format(selectedDate, 'MMMM dd, yyyy')} ({format(selectedDate, 'EEEE')})
                    {isToday(selectedDate) && (
                      <Badge variant='outline' className='ml-1 text-xs'>
                        Today
                      </Badge>
                    )}
                    {isWeekend(selectedDate) && (
                      <Badge variant='outline' className='ml-1 text-xs bg-yellow-50 text-yellow-700'>
                        Weekend
                      </Badge>
                    )}
                    {!isAttendanceEditable() && (
                      <Badge variant='outline' className='ml-1 text-xs bg-gray-50 text-gray-700'>
                        View Only
                      </Badge>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <CalendarComponent
                    mode='single'
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardTitle>
            
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground' />
                <Input 
                  placeholder='Search employees...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-64 pl-10'
                />
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Department' />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Action Buttons */}
              <div className='flex items-center gap-2 ml-2'>
                <Button variant='outline' size='sm'>
                  <Download className='w-4 h-4 mr-2' />
                  Export
                </Button>
                <Button variant='outline' size='sm'>
                  <Upload className='w-4 h-4 mr-2' />
                  Import
                </Button>
                <Button
                  onClick={handleSaveAttendance}
                  disabled={isSaving || !isAttendanceEditable()}
                  className='bg-primary hover:bg-primary/90'
                >
                  {isSaving ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className='w-4 h-4 mr-2' />
                      Save Attendance
                    </>
                  )}
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
                    <TableHead className='min-w-[200px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('name')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Employee
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[120px]'>
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
                        onClick={() => handleSort('position')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Position
                        {getSortIcon('position')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[120px]'>
                      <Button
                        variant='ghost'
                        onClick={() => handleSort('unit')}
                        className='h-auto p-0 font-semibold text-foreground hover:text-primary flex items-center gap-2'
                      >
                        Unit/Location
                        {getSortIcon('unit')}
                      </Button>
                    </TableHead>
                    <TableHead className='min-w-[100px]'>Status</TableHead>
                    <TableHead className='min-w-[200px]'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map((employee) => {
                    const currentStatus = getAttendanceStatus(employee.id);
                    const statusConfig = attendanceStatuses.find(s => s.value === currentStatus);
                    
                    return (
                      <TableRow key={employee.id} className='hover:bg-muted/30'>
                        <TableCell>
                          <div>
                            <div className='font-medium'>{employee.name}</div>
                            <div className='text-sm text-muted-foreground'>{employee.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {employee.department}
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {employee.position}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <MapPin className='w-4 h-4 text-muted-foreground' />
                            {employee.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          {statusConfig && (
                            <Badge className={statusConfig.color}>
                              {React.createElement(statusConfig.icon, { className: 'w-3 h-3 mr-1' })}
                              {statusConfig.label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            {attendanceStatuses.map((status) => (
                              <Button
                                key={status.value}
                                variant={currentStatus === status.value ? 'default' : 'outline'}
                                size='sm'
                                onClick={() => handleEmployeeAttendanceChange(employee.id, status.value)}
                                disabled={!isAttendanceEditable()}
                                className={`h-7 px-2 text-xs ${
                                  currentStatus === status.value 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-muted'
                                } ${!isAttendanceEditable() ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {React.createElement(status.icon, { className: 'w-3 h-3 mr-1' })}
                                {status.label}
                              </Button>
                            ))}
                          </div>
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
                Showing {startIndex + 1} to {Math.min(endIndex, sortedEmployees.length)} of {sortedEmployees.length} entries
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

      {/* Search Results Info - Show when searching */}
      {searchQuery.trim() && sortedEmployees.length > 0 && (
        <div className='text-sm text-muted-foreground text-center py-2'>
          Showing {sortedEmployees.length} employee
          {sortedEmployees.length !== 1 ? 's' : ''} matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};
