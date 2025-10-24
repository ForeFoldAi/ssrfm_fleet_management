import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Loader2, 
  Plus, 
  X, 
  Calendar as CalendarIcon,
  Settings,
  Save,
  Trash2,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Zap,
  FileText,
  Download,
  Upload,
  MapPin,
  Building
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { format, addDays, startOfYear, endOfYear, isWithinInterval, isSameDay } from 'date-fns';

interface HolidaySetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (holidayData: any) => void;
  existingHolidays?: HolidayData[];
  year?: number;
}

interface HolidayData {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'regional' | 'company' | 'emergency' | 'religious';
  description?: string;
  isRecurring: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

interface PredefinedHoliday {
  name: string;
  date: string;
  type: 'national' | 'regional' | 'religious';
  description: string;
  isRecurring: boolean;
}

export const HolidaySetup = ({
  isOpen,
  onClose,
  onSubmit,
  existingHolidays = [],
  year = new Date().getFullYear(),
}: HolidaySetupProps) => {
  const { currentUser } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedYear, setSelectedYear] = useState(year);
  const [activeTab, setActiveTab] = useState('predefined');
  const [holidays, setHolidays] = useState<HolidayData[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Form data for custom holiday
  const [customHolidayForm, setCustomHolidayForm] = useState({
    name: '',
    date: '',
    type: 'company' as const,
    description: '',
    isRecurring: false,
  });

  // Predefined holidays for the year
  const predefinedHolidays: PredefinedHoliday[] = [
    // National Holidays
    { name: 'New Year\'s Day', date: `${selectedYear}-01-01`, type: 'national', description: 'New Year celebration', isRecurring: true },
    { name: 'Republic Day', date: `${selectedYear}-01-26`, type: 'national', description: 'India Republic Day', isRecurring: true },
    { name: 'Independence Day', date: `${selectedYear}-08-15`, type: 'national', description: 'India Independence Day', isRecurring: true },
    { name: 'Gandhi Jayanti', date: `${selectedYear}-10-02`, type: 'national', description: 'Mahatma Gandhi\'s birthday', isRecurring: true },
    
    // Religious Holidays (approximate dates - should be calculated based on lunar calendar)
    { name: 'Holi', date: `${selectedYear}-03-08`, type: 'religious', description: 'Festival of colors', isRecurring: true },
    { name: 'Diwali', date: `${selectedYear}-11-01`, type: 'religious', description: 'Festival of lights', isRecurring: true },
    { name: 'Dussehra', date: `${selectedYear}-10-12`, type: 'religious', description: 'Victory of good over evil', isRecurring: true },
    { name: 'Eid al-Fitr', date: `${selectedYear}-04-10`, type: 'religious', description: 'End of Ramadan', isRecurring: true },
    { name: 'Christmas', date: `${selectedYear}-12-25`, type: 'religious', description: 'Christmas Day', isRecurring: true },
    
    // Regional Holidays (example for Maharashtra)
    { name: 'Gudi Padwa', date: `${selectedYear}-04-09`, type: 'regional', description: 'Maharashtrian New Year', isRecurring: true },
    { name: 'Ganesh Chaturthi', date: `${selectedYear}-09-07`, type: 'regional', description: 'Lord Ganesha\'s birthday', isRecurring: true },
  ];

  const holidayTypes = [
    { value: 'national', label: 'National Holiday', color: 'bg-red-100 text-red-800', icon: Star },
    { value: 'regional', label: 'Regional Holiday', color: 'bg-blue-100 text-blue-800', icon: MapPin },
    { value: 'company', label: 'Company Holiday', color: 'bg-green-100 text-green-800', icon: Building },
    { value: 'emergency', label: 'Emergency Holiday', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    { value: 'religious', label: 'Religious Holiday', color: 'bg-purple-100 text-purple-800', icon: Star },
  ];

  // Initialize holidays when component mounts or year changes
  useEffect(() => {
    if (isOpen) {
      initializeHolidays();
    }
  }, [isOpen, selectedYear, existingHolidays]);

  const initializeHolidays = () => {
    // Start with existing holidays for the selected year
    const yearHolidays = existingHolidays.filter(holiday => 
      new Date(holiday.date).getFullYear() === selectedYear
    );

    // Add predefined holidays that aren't already in the list
    const predefinedToAdd = predefinedHolidays.filter(predefined => 
      !yearHolidays.some(existing => 
        existing.name === predefined.name && 
        new Date(existing.date).getFullYear() === selectedYear
      )
    ).map(predefined => ({
      id: `predefined-${predefined.name}-${selectedYear}`,
      name: predefined.name,
      date: predefined.date,
      type: predefined.type,
      description: predefined.description,
      isRecurring: predefined.isRecurring,
      isActive: true,
      createdBy: 'System',
      createdAt: new Date().toISOString(),
    }));

    setHolidays([...yearHolidays, ...predefinedToAdd]);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setCustomHolidayForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddCustomHoliday = () => {
    const newErrors: Record<string, string> = {};

    if (!customHolidayForm.name.trim()) newErrors.name = 'Holiday name is required';
    if (!customHolidayForm.date) newErrors.date = 'Date is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const newHoliday: HolidayData = {
        id: `custom-${Date.now()}`,
        name: customHolidayForm.name.trim(),
        date: customHolidayForm.date,
        type: customHolidayForm.type,
        description: customHolidayForm.description.trim(),
        isRecurring: customHolidayForm.isRecurring,
        isActive: true,
        createdBy: currentUser?.name || 'Unknown',
        createdAt: new Date().toISOString(),
      };

      setHolidays(prev => [...prev, newHoliday]);
      
      // Reset form
      setCustomHolidayForm({
        name: '',
        date: '',
        type: 'company',
        description: '',
        isRecurring: false,
      });

      toast({
        title: 'Holiday Added',
        description: `${newHoliday.name} has been added to the holiday calendar.`,
      });
    }
  };

  const handleToggleHoliday = (holidayId: string) => {
    setHolidays(prev => prev.map(holiday => 
      holiday.id === holidayId 
        ? { ...holiday, isActive: !holiday.isActive }
        : holiday
    ));
  };

  const handleDeleteHoliday = (holidayId: string) => {
    setHolidays(prev => prev.filter(holiday => holiday.id !== holidayId));
    toast({
      title: 'Holiday Removed',
      description: 'Holiday has been removed from the calendar.',
    });
  };

  const handleBulkToggle = (type: string, isActive: boolean) => {
    setHolidays(prev => prev.map(holiday => 
      holiday.type === type 
        ? { ...holiday, isActive }
        : holiday
    ));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const activeHolidays = holidays.filter(holiday => holiday.isActive);
      
      const holidayData = {
        year: selectedYear,
        holidays: activeHolidays,
        totalHolidays: activeHolidays.length,
        submittedBy: currentUser?.name || '',
        submittedAt: new Date().toISOString(),
      };

      // Here you would typically call an API to save the holiday setup
      console.log('Holiday setup data to be submitted:', holidayData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSubmit(holidayData);

      toast({
        title: 'Holiday Setup Saved',
        description: `Holiday calendar for ${selectedYear} has been saved successfully.`,
      });

      onClose();
    } catch (error) {
      console.error('Error saving holiday setup:', error);
      toast({
        title: 'Error',
        description: 'Failed to save holiday setup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setHolidays([]);
    setCustomHolidayForm({
      name: '',
      date: '',
      type: 'company',
      description: '',
      isRecurring: false,
    });
    setErrors({});
    setSelectedDates([]);
    onClose();
  };

  const getHolidaysForDate = (date: Date) => {
    return holidays.filter(holiday => 
      isSameDay(new Date(holiday.date), date) && holiday.isActive
    );
  };

  const getHolidayTypeConfig = (type: string) => {
    return holidayTypes.find(t => t.value === type) || holidayTypes[0];
  };

  const activeHolidaysCount = holidays.filter(h => h.isActive).length;
  const inactiveHolidaysCount = holidays.filter(h => !h.isActive).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
              <Settings className='w-4 h-4 text-primary' />
            </div>
            Holiday Setup - {selectedYear}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Year Selection and Summary */}
          <Card className='border-0 shadow-sm'>
            <CardContent className='space-y-4'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-4'>
                  <div className='space-y-1'>
                    <Label htmlFor='year' className='text-sm font-medium'>
                      Select Year
                    </Label>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) => setSelectedYear(parseInt(value))}
                    >
                      <SelectTrigger className='w-32'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='flex items-center gap-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-600'>{activeHolidaysCount}</div>
                    <div className='text-xs text-muted-foreground'>Active Holidays</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-400'>{inactiveHolidaysCount}</div>
                    <div className='text-xs text-muted-foreground'>Inactive Holidays</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='predefined'>Predefined Holidays</TabsTrigger>
              <TabsTrigger value='custom'>Custom Holidays</TabsTrigger>
              <TabsTrigger value='calendar'>Calendar View</TabsTrigger>
              <TabsTrigger value='management'>Bulk Management</TabsTrigger>
            </TabsList>

            {/* Predefined Holidays Tab */}
            <TabsContent value='predefined' className='space-y-4'>
              <Card className='border-0 shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <Star className='w-4 h-4' />
                    Predefined Holidays
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='grid gap-3'>
                    {holidays.filter(h => ['national', 'regional', 'religious'].includes(h.type)).map((holiday) => {
                      const typeConfig = getHolidayTypeConfig(holiday.type);
                      return (
                        <div
                          key={holiday.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            holiday.isActive ? 'bg-background' : 'bg-muted/30'
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            <input
                              type='checkbox'
                              checked={holiday.isActive}
                              onChange={() => handleToggleHoliday(holiday.id)}
                              className='w-4 h-4'
                            />
                            <div>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium'>{holiday.name}</span>
                                <Badge className={typeConfig.color}>
                                  {React.createElement(typeConfig.icon, { className: 'w-3 h-3 mr-1' })}
                                  {typeConfig.label}
                                </Badge>
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                {format(new Date(holiday.date), 'MMMM dd, yyyy')}
                                {holiday.description && ` • ${holiday.description}`}
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            {holiday.isRecurring && (
                              <Badge variant='outline' className='text-xs'>
                                <Clock className='w-3 h-3 mr-1' />
                                Recurring
                              </Badge>
                            )}
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                            >
                              <Trash2 className='w-3 h-3' />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Holidays Tab */}
            <TabsContent value='custom' className='space-y-4'>
              <Card className='border-0 shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <Plus className='w-4 h-4' />
                    Add Custom Holiday
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                      <Label htmlFor='holidayName' className='text-sm font-medium'>
                        Holiday Name *
                      </Label>
                      <Input
                        id='holidayName'
                        placeholder='Enter holiday name'
                        value={customHolidayForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className='h-9'
                      />
                      {errors.name && (
                        <p className='text-destructive text-xs mt-1'>{errors.name}</p>
                      )}
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='holidayDate' className='text-sm font-medium'>
                        Date *
                      </Label>
                      <Input
                        id='holidayDate'
                        type='date'
                        value={customHolidayForm.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className='h-9'
                      />
                      {errors.date && (
                        <p className='text-destructive text-xs mt-1'>{errors.date}</p>
                      )}
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='holidayType' className='text-sm font-medium'>
                      Holiday Type
                    </Label>
                    <Select
                      value={customHolidayForm.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger className='h-9'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {holidayTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className='flex items-center gap-2'>
                              {React.createElement(type.icon, { className: 'w-4 h-4' })}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='holidayDescription' className='text-sm font-medium'>
                      Description
                    </Label>
                    <Textarea
                      id='holidayDescription'
                      placeholder='Enter holiday description (optional)'
                      value={customHolidayForm.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className='min-h-[60px]'
                    />
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='isRecurring'
                      checked={customHolidayForm.isRecurring}
                      onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                      className='w-4 h-4'
                    />
                    <Label htmlFor='isRecurring' className='text-sm'>
                      Recurring holiday (applies to future years)
                    </Label>
                  </div>

                  <Button onClick={handleAddCustomHoliday} className='w-full'>
                    <Plus className='w-4 h-4 mr-2' />
                    Add Holiday
                  </Button>
                </CardContent>
              </Card>

              {/* Custom Holidays List */}
              <Card className='border-0 shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <FileText className='w-4 h-4' />
                    Custom Holidays
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {holidays.filter(h => ['company', 'emergency'].includes(h.type)).length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      <CalendarIcon className='w-8 h-8 mx-auto mb-2 opacity-50' />
                      <p>No custom holidays added yet</p>
                    </div>
                  ) : (
                    <div className='grid gap-3'>
                      {holidays.filter(h => ['company', 'emergency'].includes(h.type)).map((holiday) => {
                        const typeConfig = getHolidayTypeConfig(holiday.type);
                        return (
                          <div
                            key={holiday.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              holiday.isActive ? 'bg-background' : 'bg-muted/30'
                            }`}
                          >
                            <div className='flex items-center gap-3'>
                              <input
                                type='checkbox'
                                checked={holiday.isActive}
                                onChange={() => handleToggleHoliday(holiday.id)}
                                className='w-4 h-4'
                              />
                              <div>
                                <div className='flex items-center gap-2'>
                                  <span className='font-medium'>{holiday.name}</span>
                                  <Badge className={typeConfig.color}>
                                    {React.createElement(typeConfig.icon, { className: 'w-3 h-3 mr-1' })}
                                    {typeConfig.label}
                                  </Badge>
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  {format(new Date(holiday.date), 'MMMM dd, yyyy')}
                                  {holiday.description && ` • ${holiday.description}`}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  Added by {holiday.createdBy}
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              {holiday.isRecurring && (
                                <Badge variant='outline' className='text-xs'>
                                  <Clock className='w-3 h-3 mr-1' />
                                  Recurring
                                </Badge>
                              )}
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleDeleteHoliday(holiday.id)}
                                className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                              >
                                <Trash2 className='w-3 h-3' />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar View Tab */}
            <TabsContent value='calendar' className='space-y-4'>
              <Card className='border-0 shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <CalendarIcon className='w-4 h-4' />
                    Holiday Calendar - {selectedYear}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex justify-center'>
                    <Calendar
                      mode='single'
                      selected={selectedDates[0]}
                      onSelect={(date) => setSelectedDates(date ? [date] : [])}
                      className='rounded-md border'
                      modifiers={{
                        holiday: holidays.filter(h => h.isActive).map(h => new Date(h.date))
                      }}
                      modifiersStyles={{
                        holiday: {
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  </div>
                  
                  {selectedDates.length > 0 && (
                    <div className='mt-4 p-3 bg-muted/30 rounded-lg'>
                      <h4 className='font-medium mb-2'>
                        Holidays on {format(selectedDates[0], 'MMMM dd, yyyy')}
                      </h4>
                      {getHolidaysForDate(selectedDates[0]).length === 0 ? (
                        <p className='text-sm text-muted-foreground'>No holidays on this date</p>
                      ) : (
                        <div className='space-y-2'>
                          {getHolidaysForDate(selectedDates[0]).map((holiday) => {
                            const typeConfig = getHolidayTypeConfig(holiday.type);
                            return (
                              <div key={holiday.id} className='flex items-center gap-2'>
                                <Badge className={typeConfig.color}>
                                  {React.createElement(typeConfig.icon, { className: 'w-3 h-3 mr-1' })}
                                  {holiday.name}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bulk Management Tab */}
            <TabsContent value='management' className='space-y-4'>
              <Card className='border-0 shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <Zap className='w-4 h-4' />
                    Bulk Management
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {holidayTypes.map((type) => {
                      const typeHolidays = holidays.filter(h => h.type === type.value);
                      const activeCount = typeHolidays.filter(h => h.isActive).length;
                      const totalCount = typeHolidays.length;

                      return (
                        <div key={type.value} className='p-4 border rounded-lg'>
                          <div className='flex items-center gap-2 mb-3'>
                            {React.createElement(type.icon, { className: 'w-4 h-4' })}
                            <span className='font-medium'>{type.label}</span>
                            <Badge variant='outline'>{activeCount}/{totalCount}</Badge>
                          </div>
                          
                          <div className='space-y-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleBulkToggle(type.value, true)}
                              className='w-full'
                              disabled={activeCount === totalCount}
                            >
                              <CheckCircle className='w-3 h-3 mr-1' />
                              Enable All
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleBulkToggle(type.value, false)}
                              className='w-full'
                              disabled={activeCount === 0}
                            >
                              <X className='w-3 h-3 mr-1' />
                              Disable All
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className='pt-4 border-t'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <h4 className='font-medium'>Quick Actions</h4>
                        <p className='text-sm text-muted-foreground'>
                          Manage all holidays at once
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          onClick={() => setHolidays(prev => prev.map(h => ({ ...h, isActive: true })))}
                        >
                          <CheckCircle className='w-4 h-4 mr-1' />
                          Enable All
                        </Button>
                        <Button
                          variant='outline'
                          onClick={() => setHolidays(prev => prev.map(h => ({ ...h, isActive: false })))}
                        >
                          <X className='w-4 h-4 mr-1' />
                          Disable All
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              className='h-9 px-4'
            >
              <X className='w-4 h-4 mr-1' />
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleSubmit}
              className='h-9 px-4 bg-primary hover:bg-primary/90'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='w-4 h-4 mr-1' />
                  Save Holiday Setup
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
