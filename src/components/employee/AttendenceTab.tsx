import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  
  // Drag state for date range selection
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartEmployeeId, setDragStartEmployeeId] = useState<string | null>(null);
  const [dragStartDay, setDragStartDay] = useState<number | null>(null);
  const [dragStatus, setDragStatus] = useState<AttendanceStatus | null>(null);
  
  // Shift+Click state for range selection
  const [lastSelectedDate, setLastSelectedDate] = useState<{ employeeId: string; day: number } | null>(null);

  const today = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // TODO: Populate from API
  const [units, setUnits] = useState<string[]>([]);
  const [months, setMonths] = useState<Array<{ value: number; label: string }>>([]);
  const [yearOptions, setYearOptions] = useState<number[]>([]);

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

    loadEmployees();
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

  // Global mouse handlers for better trackpad support
  useEffect(() => {
    if (!isDragging || !dragStartEmployeeId || dragStartDay === null || dragStatus === null) {
      return;
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest('td[data-day]') as HTMLElement;
      
      if (cell) {
        const dayAttr = cell.getAttribute('data-day');
        const employeeIdAttr = cell.getAttribute('data-employee-id');
        
        if (dayAttr && employeeIdAttr && employeeIdAttr === dragStartEmployeeId) {
          const targetDay = parseInt(dayAttr, 10);
          markDateRange(dragStartEmployeeId, dragStartDay, targetDay, dragStatus);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging && dragStartEmployeeId && dragStartDay !== null) {
        setLastSelectedDate({ employeeId: dragStartEmployeeId, day: dragStartDay });
      }
      
      setIsDragging(false);
      setDragStartEmployeeId(null);
      setDragStartDay(null);
      setDragStatus(null);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mouseleave', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, [isDragging, dragStartEmployeeId, dragStartDay, dragStatus]);

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
      
      const monthName = months.find(m => m.value === selectedMonth)?.label || `Month ${selectedMonth + 1}`;
      toast({
        title: 'Attendance Saved',
        description: `Attendance for ${monthName} ${selectedYear} has been saved successfully.`,
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
    
    // Update last selected date for Shift+Click functionality
    setLastSelectedDate({ employeeId, day });
  };

  const markDateRange = (employeeId: string, startDay: number, endDay: number, status: AttendanceStatus) => {
    setAttendanceMap((prev) => {
      const existing = prev[employeeId] || {};
      const updated = { ...existing };
      
      const minDay = Math.min(startDay, endDay);
      const maxDay = Math.max(startDay, endDay);
      
      for (let day = minDay; day <= maxDay; day++) {
        updated[day] = status;
      }

      return {
        ...prev,
        [employeeId]: updated,
      };
    });
  };

  const handleDragStart = (employeeId: string, day: number, e: React.MouseEvent) => {
    // Handle Shift+Click for range selection
    if (e.shiftKey && lastSelectedDate && lastSelectedDate.employeeId === employeeId) {
      e.preventDefault();
      e.stopPropagation();
      
      // Use the status of the last selected date (don't toggle)
      const lastStatus = attendanceMap[employeeId]?.[lastSelectedDate.day] ?? 'unmarked';
      // If unmarked, default to present; otherwise use the same status
      const newStatus: AttendanceStatus = lastStatus === 'unmarked' ? 'present' : lastStatus;
      
      // Mark range from last selected date to current date with the same status
      markDateRange(employeeId, lastSelectedDate.day, day, newStatus);
      setLastSelectedDate({ employeeId, day });
      return;
    }
    
    // Don't start drag if clicking directly on checkbox (let checkbox handle single clicks)
    // But allow Shift+Click which is handled above
    if ((e.target as HTMLElement).closest('button[role="checkbox"]') && !e.shiftKey) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const currentStatus = attendanceMap[employeeId]?.[day] ?? 'unmarked';
    // Determine the status to apply: if unmarked or absent, mark as present; if present, mark as absent
    const newStatus: AttendanceStatus = currentStatus === 'present' ? 'absent' : 'present';
    
    setIsDragging(true);
    setDragStartEmployeeId(employeeId);
    setDragStartDay(day);
    setDragStatus(newStatus);
    
    // Mark the initial day
    markDateRange(employeeId, day, day, newStatus);
  };

  const handleDragEnter = (employeeId: string, day: number) => {
    if (!isDragging || !dragStartEmployeeId || dragStartDay === null || dragStatus === null) {
      return;
    }
    
    // Only allow dragging within the same employee row
    if (employeeId !== dragStartEmployeeId) {
      return;
    }
    
    // Mark the range from start to current day
    markDateRange(employeeId, dragStartDay, day, dragStatus);
  };

  const handleDragEnd = () => {
    if (isDragging && dragStartEmployeeId && dragStartDay !== null) {
      // Update last selected date when drag ends
      setLastSelectedDate({ employeeId: dragStartEmployeeId, day: dragStartDay });
    }
    
    setIsDragging(false);
    setDragStartEmployeeId(null);
    setDragStartDay(null);
    setDragStatus(null);
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
            <div className='hidden sm:flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
              <div className='flex flex-wrap items-end gap-2'>
                <Button variant='secondary' size='sm' onClick={handleMarkAllPresent} disabled={!filteredEmployees.length}>
                  <CheckCircle className='w-4 h-4 mr-2' />
                  {isAllSelected ? 'Unmark All Present' : 'Mark All Present'}
                </Button>

                <Button variant='default' size='sm' onClick={handleSaveAttendance} disabled={isSaving}>
                  {isSaving ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Save className='w-4 h-4 mr-2' />}
                  Save
                </Button>

                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value, 10))}>
                  <SelectTrigger className='w-[140px] h-9'>
                    <SelectValue placeholder='Month' />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Populate from API */}
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value, 10))}>
                  <SelectTrigger className='w-[120px] h-9'>
                    <SelectValue placeholder='Year' />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Populate from API */}
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex flex-wrap items-end gap-2'>
                <div className='relative'>
                  <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground' />
                  <Input 
                    placeholder='Search employees...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-64 pl-10 h-9'
                  />
                </div>
                <div className='flex flex-col'>
                  <Label className='text-xs text-muted-foreground mb-1'>Factory Location</Label>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
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
                <Button variant='outline' size='sm' className='h-9'>
                  <Upload className='w-4 h-4 mr-2' />
                  Export
                </Button>
              </div>
            </div>

            <div className='flex flex-col gap-3 sm:hidden'>
              {/* Search and Filters Row */}
              <div className='flex flex-col gap-2'>
                <div className='relative w-full'>
                  <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search employees...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full pl-9 h-10'
                  />
                </div>
                <div className='flex items-end gap-2'>
                  <div className='flex flex-col flex-1'>
                    <Label className='text-xs text-muted-foreground mb-1'>Factory Location</Label>
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger className='w-full h-10 text-xs'>
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
                  </div>
                  <Button variant='outline' size='sm' className='h-10 px-4'>
                    <Upload className='w-4 h-4 mr-1.5' />
                    Export
                  </Button>
                </div>
              </div>

              {/* Month, Year, and Action Buttons Row */}
              <div className='flex flex-col gap-2'>
                <div className='flex gap-2'>
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value, 10))}>
                    <SelectTrigger className='flex-1 h-10 text-sm'>
                      <SelectValue placeholder='Month' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Populate from API */}
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value, 10))}>
                    <SelectTrigger className='flex-1 h-10 text-sm'>
                      <SelectValue placeholder='Year' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Populate from API */}
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex gap-2'>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={handleMarkAllPresent}
                    disabled={!filteredEmployees.length}
                    className='flex-1 h-10 text-xs'
                  >
                    <CheckCircle className='w-4 h-4 mr-1.5' />
                    {isAllSelected ? 'Unmark All Present' : 'Mark All Present'}
                  </Button>

                  <Button
                    variant='default'
                    size='sm'
                    onClick={handleSaveAttendance}
                    disabled={isSaving}
                    className='flex-1 h-10'
                  >
                    {isSaving ? <Loader2 className='w-4 h-4 mr-1.5 animate-spin' /> : <Save className='w-4 h-4 mr-1.5' />}
                    Save
                  </Button>
                </div>
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
            <div className='overflow-x-auto' style={{ userSelect: isDragging ? 'none' : 'auto' }}>
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
                            <TableCell 
                              key={day} 
                              className={`text-center px-3 ${isDragging && dragStartEmployeeId === employee.id ? 'cursor-grabbing' : 'cursor-pointer'}`}
                              onMouseDown={(e) => handleDragStart(employee.id, day, e)}
                              onMouseEnter={() => {
                                if (isDragging && dragStartEmployeeId === employee.id) {
                                  handleDragEnter(employee.id, day);
                                }
                              }}
                              data-day={day}
                              data-employee-id={employee.id}
                              style={{ userSelect: 'none' }}
                            >
                              <div className='relative flex justify-center'>
                                <Checkbox
                                  checked={isPresent}
                                  onCheckedChange={(value) => {
                                    // Handle single click toggle when not dragging
                                    if (!isDragging) {
                                      toggleSingleDay(employee.id, day, value === true);
                                    }
                                  }}
                                  onMouseDown={(e) => {
                                    // Handle Shift+Click before checkbox processes it
                                    if (e.shiftKey && lastSelectedDate && lastSelectedDate.employeeId === employee.id) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      
                                      // Use the status of the last selected date (don't toggle)
                                      const lastStatus = attendanceMap[employee.id]?.[lastSelectedDate.day] ?? 'unmarked';
                                      // If unmarked, default to present; otherwise use the same status
                                      const newStatus: AttendanceStatus = lastStatus === 'unmarked' ? 'present' : lastStatus;
                                      
                                      markDateRange(employee.id, lastSelectedDate.day, day, newStatus);
                                      setLastSelectedDate({ employeeId: employee.id, day });
                                    }
                                  }}
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
                        No employees found
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
