import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Loader2, 
  Plus, 
  X, 
  Upload,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface HolidaySetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (holidayData: any) => void;
}

interface Holiday {
  id: string;
  festival: string;
  date: string;
}

export const HolidaySetup = ({
  isOpen,
  onClose,
  onSubmit,
}: HolidaySetupProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [formData, setFormData] = useState({
    festival: '',
    date: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddHoliday = () => {
    if (!formData.festival.trim() || !formData.date) {
      toast({
        title: 'Error',
        description: 'Please fill in both festival name and date.',
        variant: 'destructive',
      });
      return;
    }

    const newHoliday: Holiday = {
      id: `holiday-${Date.now()}`,
      festival: formData.festival.trim(),
      date: formData.date,
    };

    setHolidays(prev => [...prev, newHoliday]);
    
    // Reset form
    setFormData({
      festival: '',
      date: '',
    });

    toast({
      title: 'Holiday Added',
      description: `${newHoliday.festival} has been added to the holiday list.`,
    });
  };

  const handleDeleteHoliday = (holidayId: string) => {
    setHolidays(prev => prev.filter(holiday => holiday.id !== holidayId));
    toast({
      title: 'Holiday Removed',
      description: 'Holiday has been removed from the list.',
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        const importedHolidays: Holiday[] = lines.map((line, index) => {
          const [festival, date] = line.split(',').map(item => item.trim());
          return {
            id: `imported-${Date.now()}-${index}`,
            festival: festival || `Holiday ${index + 1}`,
            date: date || new Date().toISOString().split('T')[0],
          };
        });

        setHolidays(prev => [...prev, ...importedHolidays]);
        
        toast({
          title: 'Import Successful',
          description: `${importedHolidays.length} holidays have been imported.`,
        });
      } catch (error) {
        toast({
          title: 'Import Error',
          description: 'Failed to import holidays. Please check the file format.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const csvContent = holidays.map(holiday => 
      `${holiday.festival},${holiday.date}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'holidays.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Holidays have been exported to CSV file.',
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const holidayData = {
        holidays,
        totalHolidays: holidays.length,
        submittedAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSubmit(holidayData);

      toast({
        title: 'Holiday Setup Saved',
        description: `${holidays.length} holidays have been saved successfully.`,
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
    setFormData({
      festival: '',
      date: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            Holiday Setup
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Add Holiday Form */}
          <Card className='border-0 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                Add Holiday
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <Label htmlFor='festival' className='text-sm font-medium'>
                    Festival Name *
                  </Label>
                  <Input
                    id='festival'
                    placeholder='Enter festival name'
                    value={formData.festival}
                    onChange={(e) => handleInputChange('festival', e.target.value)}
                    className='h-9'
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='date' className='text-sm font-medium'>
                    Date *
                  </Label>
                  <Input
                    id='date'
                    type='date'
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className='h-9'
                  />
                </div>
              </div>

              <Button onClick={handleAddHoliday} className='w-full'>
                <Plus className='w-4 h-4 mr-2' />
                Add Holiday
              </Button>
            </CardContent>
          </Card>

          {/* Import/Export Actions */}
          <Card className='border-0 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <Upload className='w-4 h-4' />
                Import/Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex gap-3'>
                <div className='flex-1'>
                  <Label htmlFor='import-file' className='text-sm font-medium mb-2 block'>
                    Import from CSV
                  </Label>
                  <Input
                    id='import-file'
                    type='file'
                    accept='.csv'
                    onChange={handleImport}
                    className='h-9'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    CSV format: Festival Name, Date (YYYY-MM-DD)
                  </p>
                </div>
                <div className='flex items-end'>
                  <Button variant='outline' onClick={handleExport} disabled={holidays.length === 0}>
                    <Download className='w-4 h-4 mr-2' />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holidays Table */}
          <Card className='border-0 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                Holidays List ({holidays.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {holidays.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <Plus className='w-8 h-8 mx-auto mb-2 opacity-50' />
                  <p>No holidays added yet</p>
                  <p className='text-sm'>Add holidays using the form above or import from CSV</p>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-secondary/20 border-b-2 border-secondary/30'>
                        <TableHead className='min-w-[200px]'>Festival Name</TableHead>
                        <TableHead className='min-w-[120px]'>Date</TableHead>
                        <TableHead className='min-w-[100px]'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holidays.map((holiday) => (
                        <TableRow key={holiday.id} className='hover:bg-muted/30'>
                          <TableCell className='font-medium'>
                            {holiday.festival}
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {format(new Date(holiday.date), 'dd-MM-yyyy')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                            >
                              <Trash2 className='w-3 h-3' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

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
              disabled={isSubmitting || holidays.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className='w-4 h-4 mr-1' />
                  Save Holidays ({holidays.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
