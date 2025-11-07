import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, CheckCircle, Search, Calendar, Upload, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getDaysInMonth } from 'date-fns';

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
  contractType: string;
  isActive: boolean;
}

type AttendanceStatus = 'present' | 'absent' | 'unmarked';

  const mockEmployees: Employee[] = [
    { id: '1', name: 'John Doe', employeeId: 'EU1001', department: 'Engineering', position: 'Software Engineer', unit: 'UNIT1', email: 'john@company.com', phone: '+1234567890', contractType: 'permanent', isActive: true },
    { id: '2', name: 'Jane Smith', employeeId: 'EU2001', department: 'Marketing', position: 'Marketing Manager', unit: 'UNIT2', email: 'jane@company.com', phone: '+1234567891', contractType: 'contract', isActive: true },
    { id: '3', name: 'Mike Johnson', employeeId: 'EU3001', department: 'Sales', position: 'Sales Executive', unit: 'UNIT3', email: 'mike@company.com', phone: '+1234567892', contractType: 'temporary', isActive: true },
    { id: '4', name: 'Sarah Wilson', employeeId: 'EU1002', department: 'HR', position: 'HR Manager', unit: 'UNIT1', email: 'sarah@company.com', phone: '+1234567893', contractType: 'permanent', isActive: true },
    { id: '5', name: 'David Brown', employeeId: 'EU2002', department: 'Finance', position: 'Accountant', unit: 'UNIT2', email: 'david@company.com', phone: '+1234567894', contractType: 'contract', isActive: true },
    { id: '6', name: 'Lisa Davis', employeeId: 'EU3002', department: 'Engineering', position: 'Senior Developer', unit: 'UNIT3', email: 'lisa@company.com', phone: '+1234567895', contractType: 'permanent', isActive: true },
    { id: '7', name: 'Tom Wilson', employeeId: 'EU1003', department: 'Operations', position: 'Operations Manager', unit: 'UNIT1', email: 'tom@company.com', phone: '+1234567896', contractType: 'temporary', isActive: true },
    { id: '8', name: 'Emma Taylor', employeeId: 'EU2003', department: 'Customer Service', position: 'Support Agent', unit: 'UNIT2', email: 'emma@company.com', phone: '+1234567897', contractType: 'contract', isActive: true },
  ];

export const AttendenceTab = ({}: AttendanceTabProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Record<number, AttendanceStatus>>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const today = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const units = ['all', 'UNIT1', 'UNIT2', 'UNIT3'];
  const months = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    []
  );

  const yearOptions = useMemo(() => {
    const startYear = today.getFullYear();
    return Array.from({ length: 6 }, (_, index) => startYear + index);
  }, [today]);

  const daysInSelectedMonth = useMemo(() => {
    const totalDays = getDaysInMonth(new Date(selectedYear, selectedMonth));
    return Array.from({ length: totalDays }, (_, index) => index + 1);
  }, [selectedMonth, selectedYear]);

  const totalDaysInMonth = daysInSelectedMonth.length;

  const filteredEmployees = useMemo(
    () =>
      employees.filter((emp) => {
        const matchesSearch =
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.phone.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUnit = filterDepartment === 'all' || emp.unit === filterDepartment;

        return matchesSearch && matchesUnit && emp.isActive;
      }),
    [employees, searchQuery, filterDepartment]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDepartment, selectedMonth, selectedYear]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredEmployees, itemsPerPage, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  useEffect(() => {
    setIsLoading(true);
      
    const timeout = setTimeout(() => {
      setEmployees(mockEmployees);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!employees.length) {
      return;
    }

    setAttendanceMap((prev) => {
      const next: Record<string, Record<number, AttendanceStatus>> = {};

      employees.forEach((employee) => {
        if (!employee.isActive) {
          return;
        }

        const existing = prev[employee.id] || {};
        const row: Record<number, AttendanceStatus> = {};

        daysInSelectedMonth.forEach((day) => {
          row[day] = existing[day] ?? 'unmarked';
        });
      
        next[employee.id] = row;
      });

      return next;
    });

    setRemarks((prev) => {
      const next: Record<string, string> = {};

      employees.forEach((employee) => {
        if (!employee.isActive) {
          return;
        }

        next[employee.id] = prev[employee.id] || '';
      });

      return next;
    });
  }, [employees, daysInSelectedMonth]);

  const handleMarkAllPresent = () => {
    if (!filteredEmployees.length) {
      return;
    }
    
    const shouldMarkAll = !filteredEmployees.every((employee) => {
      const dayMap = attendanceMap[employee.id];
      if (!dayMap) {
        return false;
      }
      return daysInSelectedMonth.every((day) => dayMap[day] === 'present');
    });

    toggleAllEmployees(shouldMarkAll);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: 'Attendance Saved',
        description: `Attendance for ${months[selectedMonth]} ${selectedYear} has been saved successfully.`,
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

  const toggleAllEmployees = (value: boolean) => {
    if (!filteredEmployees.length) {
      return;
    }

    setAttendanceMap((prev) => {
      const next = { ...prev };

      filteredEmployees.forEach((employee) => {
        const row: Record<number, AttendanceStatus> = { ...(next[employee.id] || {}) };
        daysInSelectedMonth.forEach((day) => {
          row[day] = value ? 'present' : 'unmarked';
        });
        next[employee.id] = row;
      });

      return next;
    });
  };

  const toggleEmployeeRow = (employeeId: string, value: boolean) => {
    setAttendanceMap((prev) => {
      const existing = prev[employeeId] || {};
      const row: Record<number, AttendanceStatus> = { ...existing };

      daysInSelectedMonth.forEach((day) => {
        row[day] = value ? 'present' : 'unmarked';
      });

      return {
        ...prev,
        [employeeId]: row,
      };
    });
  };

  const toggleSingleDay = (employeeId: string, day: number, value: boolean) => {
    setAttendanceMap((prev) => {
      const existing = prev[employeeId] || {};
      const nextStatus: AttendanceStatus = value ? 'present' : 'absent';

      return {
        ...prev,
        [employeeId]: {
          ...existing,
          [day]: nextStatus,
        },
      };
    });
  };

  const isAllSelected = filteredEmployees.length > 0 && filteredEmployees.every((employee) => {
    const dayMap = attendanceMap[employee.id];

    if (!dayMap) {
      return false;
    }

    return daysInSelectedMonth.every((day) => dayMap[day] === 'present');
  });

  const isPartiallySelected = !isAllSelected && filteredEmployees.some((employee) => {
    const dayMap = attendanceMap[employee.id];

    if (!dayMap) {
      return false;
    }

    return daysInSelectedMonth.some((day) => dayMap[day] === 'present');
  });

  const getRowTotals = (employeeId: string) => {
    const dayMap = attendanceMap[employeeId] || {};
    const totalPresent = daysInSelectedMonth.reduce((count, day) => (dayMap[day] === 'present' ? count + 1 : count), 0);
    const totalAbsent = daysInSelectedMonth.reduce((count, day) => (dayMap[day] === 'absent' ? count + 1 : count), 0);

    return { totalPresent, totalAbsent };
  };

  const headerCheckedState = isAllSelected ? true : isPartiallySelected ? 'indeterminate' : false;

  return (
    <div className='space-y-6'>
      <Card className='border-0 shadow-sm'>
        <CardHeader className='px-4 sm:px-6'>
          <div className='flex flex-col gap-4'>
            <div className='hidden sm:flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div className='flex flex-wrap items-center gap-2'>
                <Button variant='secondary' size='sm' onClick={handleMarkAllPresent} disabled={!filteredEmployees.length}>
                  <CheckCircle className='w-4 h-4 mr-2' />
                  {isAllSelected ? 'Unmark All Present' : 'Mark All Present'}
                </Button>

                <Button variant='default' size='sm' onClick={handleSaveAttendance} disabled={isSaving}>
                  {isSaving ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Save className='w-4 h-4 mr-2' />}
                  Save
                </Button>

                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value, 10))}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Month' />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value, 10))}>
                  <SelectTrigger className='w-[120px]'>
                    <SelectValue placeholder='Year' />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
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
                    <SelectValue placeholder='Unit' />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit === 'all' ? 'All Units' : unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant='outline' size='sm'>
                  <Upload className='w-4 h-4 mr-2' />
                  Export
                </Button>
              </div>
            </div>

            <div className='flex flex-col gap-3 sm:hidden'>
              <div className='flex items-center gap-2'>
                <div className='relative flex-1'>
                  <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search employees...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full pl-9'
                  />
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className='w-28 h-10 text-xs'>
                    <SelectValue placeholder='Unit' />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit === 'all' ? 'All Units' : unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant='outline' size='sm' className='h-10 px-3'>
                  <Upload className='w-4 h-4 mr-1.5' />
                  Export
                </Button>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value, 10))}>
                  <SelectTrigger className='flex-1 min-w-[140px] h-10 text-sm'>
                    <SelectValue placeholder='Month' />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value, 10))}>
                  <SelectTrigger className='flex-1 min-w-[120px] h-10 text-sm'>
                    <SelectValue placeholder='Year' />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant='secondary'
                  size='sm'
                  onClick={handleMarkAllPresent}
                  disabled={!filteredEmployees.length}
                  className='flex-1 min-w-[150px] h-10'
                >
                  <CheckCircle className='w-4 h-4 mr-1.5' />
                  {isAllSelected ? 'Unmark All Present' : 'Mark All Present'}
                </Button>

                <Button
                  variant='default'
                  size='sm'
                  onClick={handleSaveAttendance}
                  disabled={isSaving}
                  className='flex-1 min-w-[120px] h-10'
                >
                  {isSaving ? <Loader2 className='w-4 h-4 mr-1.5 animate-spin' /> : <Save className='w-4 h-4 mr-1.5' />}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='px-4 sm:px-6'>
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
                    <TableHead className='w-12 text-center'>
                      <div className='flex justify-center'>
                        <Checkbox
                          checked={headerCheckedState}
                          onCheckedChange={(value) => toggleAllEmployees(value === true)}
                          disabled={!filteredEmployees.length}
                          className='h-4 w-4'
                        />
                      </div>
                    </TableHead>
                    <TableHead className='min-w-[140px]'>Employee Name</TableHead>
                    <TableHead className='w-36 text-center'>
                      <div className='flex flex-col items-center leading-4'>
                        <span>Present</span>
                        <span className='text-xs text-muted-foreground'>Total</span>
                      </div>
                    </TableHead>
                    <TableHead className='w-36 text-center'>
                      <div className='flex flex-col items-center leading-4'>
                        <span>Absent</span>
                        <span className='text-xs text-muted-foreground'>Total</span>
                      </div>
                    </TableHead>
                    {daysInSelectedMonth.map((day) => (
                      <TableHead key={day} className='text-center w-20 px-3'>
                        {day}
                    </TableHead>
                    ))}
                    <TableHead className='min-w-[200px]'>Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map((employee) => {
                    const totals = getRowTotals(employee.id);
                    const rowDayMap = attendanceMap[employee.id] || {};
                    const isRowSelected = daysInSelectedMonth.every((day) => rowDayMap[day] === 'present');
                    const isRowPartiallySelected = !isRowSelected && daysInSelectedMonth.some((day) => rowDayMap[day] === 'present');
                    const rowCheckedState = isRowSelected ? true : isRowPartiallySelected ? 'indeterminate' : false;
                    
                    return (
                      <TableRow key={employee.id} className='hover:bg-muted/30'>
                        <TableCell className='w-12'>
                          <div className='flex justify-center'>
                            <Checkbox
                              checked={rowCheckedState}
                              onCheckedChange={(value) => toggleEmployeeRow(employee.id, value === true)}
                              className='h-4 w-4'
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className='font-medium'>{employee.name}</div>
                            <div className='text-sm text-muted-foreground'>{employee.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell className='text-center px-3'>{totals.totalPresent}</TableCell>
                        <TableCell className='text-center px-3'>{totals.totalAbsent}</TableCell>
                        {daysInSelectedMonth.map((day) => {
                          const status = rowDayMap[day] ?? 'unmarked';
                          const isPresent = status === 'present';
                          const isAbsent = status === 'absent';
                              
                              return (
                            <TableCell key={day} className='text-center px-3'>
                              <div className='relative flex justify-center'>
                                <Checkbox
                                  checked={isPresent}
                                  onCheckedChange={(value) => toggleSingleDay(employee.id, day, value === true)}
                                  className={`h-5 w-5 [&_svg]:hidden transition-colors duration-150 ${
                                    isPresent
                                      ? '!border-green-600 !bg-green-600'
                                      : isAbsent
                                        ? '!border-red-600 !bg-red-600'
                                        : '!border-yellow-400 !bg-transparent'
                                  }`}
                                />
                                <span
                                  className={`pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-semibold ${
                                    isPresent || isAbsent ? 'text-white' : 'text-transparent'
                                  }`}
                                >
                                  {isPresent ? 'P' : isAbsent ? 'A' : ''}
                                </span>
                              </div>
                            </TableCell>
                              );
                            })}
                        <TableCell>
                          <Input
                            placeholder='Add remark'
                            value={remarks[employee.id] || ''}
                            maxLength={30}
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              setRemarks((prev) => ({
                                ...prev,
                                [employee.id]: nextValue,
                              }));
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!filteredEmployees.length && (
                    <TableRow>
                      <TableCell colSpan={4 + totalDaysInMonth + 2} className='text-center py-8 text-muted-foreground'>
                        No employees found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {!searchQuery.trim() && filteredEmployees.length > 0 && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
              <div className='text-xs sm:text-sm text-muted-foreground'>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} entries
              </div>

              <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full sm:w-auto'>
                <div className='flex items-center gap-2 w-full sm:w-auto justify-center'>
                  <span className='text-xs sm:text-sm text-muted-foreground whitespace-nowrap'>Show:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      const newLimit = parseInt(value, 10);
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

                <div className='flex items-center gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronsLeft className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronLeft className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>

                  <div className='flex items-center gap-1 mx-1 sm:mx-2'>
                    {Array.from({ length: Math.min(6, totalPages) }, (_, index) => {
                        let pageNum;
                        
                        if (totalPages <= 6) {
                        pageNum = index + 1;
                        } else if (currentPage <= 3) {
                        pageNum = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 5 + index;
                        } else {
                        pageNum = currentPage - 3 + index;
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

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                  >
                    <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4' />
                  </Button>
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
    </div>
  );
};
