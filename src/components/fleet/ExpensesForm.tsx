import { useState, useEffect } from 'react';
import {
  IndianRupee,
  Save,
  X,
  Loader2,
  Plus,
} from 'lucide-react';

// Date utility functions
const formatDateToString = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const stringToDateInputFormat = (dateString: string): string => {
  // Convert DD-MM-YYYY to YYYY-MM-DD for HTML date input
  if (dateString && dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      // Check if first part is day (2 digits) vs year (4 digits)
      if (parts[0].length === 2 && parts[2].length === 4) {
        // DD-MM-YYYY format
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
      } else if (parts[0].length === 4 && parts[2].length === 2) {
        // Already YYYY-MM-DD format
        return dateString;
      }
    }
  }
  return dateString;
};

const dateInputFormatToString = (dateInputValue: string): string => {
  // Convert YYYY-MM-DD from HTML date input to DD-MM-YYYY
  if (dateInputValue && dateInputValue.includes('-')) {
    const parts = dateInputValue.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      // YYYY-MM-DD format
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
  }
  return dateInputValue;
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
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from '../../hooks/use-toast';
import { useRole } from '../../contexts/RoleContext';

export interface VehicleExpenseData {
  id?: string;
  expenseNumber: string;
  vehicleId: string;
  vehicleRegistrationNumber: string;
  driverId: string;
  driverName: string;
  expenseDate: string;
  expenseCategory: 'fuel' | 'maintenance' | 'repair' | 'insurance' | 'toll' | 'parking' | 'driver_salary' | 'permit' | 'other';
  expenseType: string;
  description: string;
  amount: string;
  vendorName: string;
  vendorContact: string;
  vendorAddress: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'cheque' | 'bank_transfer';
  paymentReference: string;
  location: string;
  odometerReading: string;
  receipts: File[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy: string;
  approvedDate: string;
  rejectionReason: string;
  notes: string;
  requestedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ExpensesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expenseData: VehicleExpenseData) => void;
  editingExpense?: VehicleExpenseData | null;
  availableVehicles?: Array<{ id: string; registrationNumber: string; driverName: string; driverId: string }>;
}

export const ExpensesForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingExpense,
  availableVehicles = [],
}: ExpensesFormProps) => {
  const { currentUser } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for custom expense category input
  const [showCustomExpenseCategoryInput, setShowCustomExpenseCategoryInput] = useState(false);
  const [customExpenseCategoryName, setCustomExpenseCategoryName] = useState('');

  const [formData, setFormData] = useState<VehicleExpenseData>({
    expenseNumber: '',
    vehicleId: '',
    vehicleRegistrationNumber: '',
    driverId: '',
    driverName: '',
    expenseDate: '',
    expenseCategory: 'fuel',
    expenseType: '',
    description: '',
    amount: '',
    vendorName: '',
    vendorContact: '',
    vendorAddress: '',
    paymentMethod: 'cash',
    paymentReference: '',
    location: '',
    odometerReading: '',
    receipts: [],
    approvalStatus: 'pending',
    approvedBy: '',
    approvedDate: '',
    rejectionReason: '',
    notes: '',
    requestedBy: '',
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (editingExpense && isOpen) {
      // Ensure date format is DD-MM-YYYY when editing
      const expenseData = { ...editingExpense };
      if (expenseData.expenseDate && !expenseData.expenseDate.includes('-')) {
        // If date is in a different format, convert it
        const date = new Date(expenseData.expenseDate);
        if (!isNaN(date.getTime())) {
          expenseData.expenseDate = formatDateToString(date);
        }
      }
      setFormData(expenseData);
    } else if (!editingExpense && isOpen) {
      // Reset form for new expense
      setFormData({
        expenseNumber: `EXP-${Date.now()}`,
        vehicleId: '',
        vehicleRegistrationNumber: '',
        driverId: '',
        driverName: '',
        expenseDate: formatDateToString(new Date()),
        expenseCategory: 'fuel',
        expenseType: '',
        description: '',
        amount: '',
        vendorName: '',
        vendorContact: '',
        vendorAddress: '',
        paymentMethod: 'cash',
        paymentReference: '',
        location: '',
        odometerReading: '',
        receipts: [],
        approvalStatus: 'pending',
        approvedBy: '',
        approvedDate: '',
        rejectionReason: '',
        notes: '',
        requestedBy: '',
      });
      setShowCustomExpenseCategoryInput(false);
      setCustomExpenseCategoryName('');
    }
  }, [editingExpense, isOpen]);

  // Auto-fill driver details when vehicle is selected
  useEffect(() => {
    if (formData.vehicleId && availableVehicles.length > 0) {
      const selectedVehicle = availableVehicles.find(v => v.id === formData.vehicleId);
      if (selectedVehicle) {
        setFormData(prev => ({
          ...prev,
          vehicleRegistrationNumber: selectedVehicle.registrationNumber,
          driverId: selectedVehicle.driverId,
          driverName: selectedVehicle.driverName,
        }));
      }
    }
  }, [formData.vehicleId, availableVehicles]);

  const handleInputChange = (field: keyof VehicleExpenseData, value: string | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleExpenseCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, expenseCategory: value as any }));
    if (errors.expenseCategory) {
      setErrors((prev) => ({ ...prev, expenseCategory: '' }));
    }

    // Handle "Other" selection for expense category
    if (value === 'other') {
      setShowCustomExpenseCategoryInput(true);
    } else {
      setShowCustomExpenseCategoryInput(false);
    }
  };

  // Function to create new expense category
  const handleCreateExpenseCategory = async () => {
    if (!customExpenseCategoryName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an expense category name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // For now, we'll just set the custom expense category name directly
      // In a real implementation, you might want to save this to a backend
      setFormData((prev) => ({ ...prev, expenseCategory: customExpenseCategoryName.trim() as any }));
      setShowCustomExpenseCategoryInput(false);
      setCustomExpenseCategoryName('');

      toast({
        title: 'Success',
        description: `Expense category "${customExpenseCategoryName.trim()}" has been added.`,
      });
    } catch (error) {
      console.error('Error creating expense category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    // Only validate mandatory fields
    if (!formData.vehicleId.trim()) {
      newErrors.vehicleId = 'Please select a vehicle';
      hasErrors = true;
    }

    if (!formData.expenseDate.trim()) {
      newErrors.expenseDate = 'Expense date is required';
      hasErrors = true;
    }

    if (!formData.expenseCategory.trim()) {
      newErrors.expenseCategory = 'Expense category is required';
      hasErrors = true;
    }

    if (!formData.expenseType.trim()) {
      newErrors.expenseType = 'Expense type is required';
      hasErrors = true;
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
      hasErrors = true;
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
        hasErrors = true;
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit(formData);
      
      toast({
        title: '✅ Vehicle Expense Recorded Successfully!',
        description: `Expense ${formData.expenseNumber} has been successfully recorded.`,
        variant: 'default',
      });

      // Reset form
      setFormData({
        expenseNumber: `EXP-${Date.now()}`,
        vehicleId: '',
        vehicleRegistrationNumber: '',
        driverId: '',
        driverName: '',
        expenseDate: formatDateToString(new Date()),
        expenseCategory: 'fuel',
        expenseType: '',
        description: '',
        amount: '',
        vendorName: '',
        vendorContact: '',
        vendorAddress: '',
        paymentMethod: 'cash',
        paymentReference: '',
        location: '',
        odometerReading: '',
        receipts: [],
        approvalStatus: 'pending',
        approvedBy: '',
        approvedDate: '',
        rejectionReason: '',
        notes: '',
        requestedBy: '',
      });

      setErrors({});
      setShowCustomExpenseCategoryInput(false);
      setCustomExpenseCategoryName('');
      onClose();
    } catch (error) {
      console.error('Error recording expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to record expense. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
              <IndianRupee className='w-4 h-4 text-primary' />
            </div>
            {editingExpense ? 'Edit Vehicle Expense' : 'Add New Vehicle Expense'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Single Card for all form content */}
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
                    <Label htmlFor='expenseNumber' className='text-xs font-medium'>
                      Expense Number
                    </Label>
                  <Input
                    id='expenseNumber'
                    value={formData.expenseNumber}
                    onChange={(e) => handleInputChange('expenseNumber', e.target.value)}
                    placeholder='Auto-generated'
                    readOnly
                      className='h-8 px-2 py-1 border border-input bg-secondary hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 placeholder:text-muted-foreground'
                  />
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='vehicleId' className='text-xs font-medium'>
                      Vehicle *
                    </Label>
                  <Select
                    value={formData.vehicleId}
                    onValueChange={(value) => handleInputChange('vehicleId', value)}
                  >
                      <SelectTrigger className={`h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 [&>span]:text-muted-foreground ${errors.vehicleId ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder='Select vehicle' />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.registrationNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vehicleId && (
                      <p className='text-destructive text-xs mt-1'>{errors.vehicleId}</p>
                  )}
                  </div>
                </div>

                {/* Second Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='expenseDate' className='text-xs font-medium'>
                      Expense Date *
                    </Label>
                  <Input
                    id='expenseDate'
                    type='date'
                    value={stringToDateInputFormat(formData.expenseDate)}
                    onChange={(e) => handleInputChange('expenseDate', dateInputFormatToString(e.target.value))}
                      className={`h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 ${errors.expenseDate ? 'border-red-500' : ''}`}
                  />
                  {errors.expenseDate && (
                      <p className='text-destructive text-xs mt-1'>{errors.expenseDate}</p>
                  )}
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='expenseCategory' className='text-xs font-medium'>
                      Expense Category *
                    </Label>
                  <Select
                    value={formData.expenseCategory}
                    onValueChange={handleExpenseCategoryChange}
                  >
                      <SelectTrigger className={`h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 [&>span]:text-muted-foreground ${errors.expenseCategory ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder='Select expense category' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='fuel'>Fuel</SelectItem>
                      <SelectItem value='maintenance'>Maintenance</SelectItem>
                      <SelectItem value='repair'>Repair</SelectItem>
                      <SelectItem value='insurance'>Insurance</SelectItem>
                      <SelectItem value='toll'>Toll Charges</SelectItem>
                      <SelectItem value='parking'>Parking</SelectItem>
                      <SelectItem value='driver_salary'>Driver Salary</SelectItem>
                      <SelectItem value='permit'>Permit/License</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.expenseCategory && (
                      <p className='text-destructive text-xs mt-1'>{errors.expenseCategory}</p>
                  )}
                  </div>
                </div>

                {/* Custom Expense Category Input */}
                {showCustomExpenseCategoryInput && (
                  <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2'>
                    <Label className='text-xs font-medium text-blue-800'>
                      Add New Expense Category
                    </Label>
                    <div className='flex gap-2'>
                      <Input
                        placeholder='Enter expense category name'
                        value={customExpenseCategoryName}
                        onChange={(e) => setCustomExpenseCategoryName(e.target.value)}
                        className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 placeholder:text-muted-foreground'
                      />
                      <Button
                        type='button'
                        onClick={handleCreateExpenseCategory}
                        size='sm'
                        className='h-8 px-3 bg-blue-600 hover:bg-blue-700'
                      >
                        <Plus className='w-3 h-3 mr-1' />
                        Add
                      </Button>
                      <Button
                        type='button'
                        onClick={() => {
                          setShowCustomExpenseCategoryInput(false);
                          setCustomExpenseCategoryName('');
                          setFormData(prev => ({ ...prev, expenseCategory: 'fuel' }));
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
                    <Label htmlFor='expenseType' className='text-xs font-medium'>
                      Expense Type *
                    </Label>
                  <Input
                    id='expenseType'
                    value={formData.expenseType}
                    onChange={(e) => handleInputChange('expenseType', e.target.value)}
                    placeholder='e.g., Diesel, Engine Oil, Brake Repair'
                      className={`h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 placeholder:text-muted-foreground ${errors.expenseType ? 'border-red-500' : ''}`}
                  />
                  {errors.expenseType && (
                      <p className='text-destructive text-xs mt-1'>{errors.expenseType}</p>
                  )}
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='amount' className='text-xs font-medium'>
                      Amount (₹) *
                    </Label>
                  <Input
                    id='amount'
                    type='number'
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder='e.g., 2500.00'
                    min='0'
                    step='0.01'
                      className={`h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 placeholder:text-muted-foreground ${errors.amount ? 'border-red-500' : ''}`}
                  />
                  {errors.amount && (
                      <p className='text-destructive text-xs mt-1'>{errors.amount}</p>
                  )}
                  </div>
                </div>

                {/* Fourth Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='location' className='text-xs font-medium'>
                      Location *
                    </Label>
                  <Input
                    id='location'
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder='Where was the expense incurred?'
                      className={`h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 placeholder:text-muted-foreground ${errors.location ? 'border-red-500' : ''}`}
                  />
                  {errors.location && (
                      <p className='text-destructive text-xs mt-1'>{errors.location}</p>
                  )}
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='requestedBy' className='text-xs font-medium'>Requested By</Label>
                  <Input
                      id='requestedBy'
                      value={formData.requestedBy}
                      onChange={(e) => handleInputChange('requestedBy', e.target.value)}
                      placeholder='Enter the requested by'
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 placeholder:text-muted-foreground'
                    />
                  </div>
                </div>
              </div>

          {/* Vendor Information */}
              <div className='space-y-3'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                Vendor Information
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='vendorName' className='text-xs font-medium'>
                      Vendor Name
                    </Label>
                  <Input
                    id='vendorName'
                    value={formData.vendorName}
                    onChange={(e) => handleInputChange('vendorName', e.target.value)}
                    placeholder='e.g., Bharat Petroleum, Local Mechanic'
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 placeholder:text-muted-foreground'
                  />
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='vendorContact' className='text-xs font-medium'>
                      Vendor Contact
                    </Label>
                  <Input
                    id='vendorContact'
                    type='tel'
                    value={formData.vendorContact}
                    onChange={(e) => handleInputChange('vendorContact', e.target.value)}
                    placeholder='+91 9876543210'
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 placeholder:text-muted-foreground'
                  />
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='paymentMethod' className='text-xs font-medium'>
                      Payment Method
                    </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: 'cash' | 'card' | 'upi' | 'cheque' | 'bank_transfer') => 
                      handleInputChange('paymentMethod', value)
                    }
                  >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 [&>span]:text-muted-foreground'>
                      <SelectValue placeholder='Select payment method' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='cash'>Cash</SelectItem>
                      <SelectItem value='card'>Credit/Debit Card</SelectItem>
                      <SelectItem value='upi'>UPI</SelectItem>
                      <SelectItem value='cheque'>Cheque</SelectItem>
                      <SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='paymentReference' className='text-xs font-medium'>
                      Payment Reference
                    </Label>
                  <Input
                    id='paymentReference'
                    value={formData.paymentReference}
                    onChange={(e) => handleInputChange('paymentReference', e.target.value)}
                    placeholder='Transaction ID, Cheque No., etc.'
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200 placeholder:text-muted-foreground'
                  />
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='vendorAddress' className='text-xs font-medium'>
                      Vendor Address
                    </Label>
                  <Textarea
                    id='vendorAddress'
                    value={formData.vendorAddress}
                    onChange={(e) => handleInputChange('vendorAddress', e.target.value)}
                    placeholder='Complete vendor address'
                      className='min-h-[40px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200 placeholder:text-muted-foreground'
                    />
                  </div>
                </div>
                </div>

              {/* Additional Information */}
              <div className='space-y-3'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                  Additional Information
                </h4>

                <div className='space-y-1'>
                  <Label htmlFor='description' className='text-xs font-medium'>
                    Description
                  </Label>
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder='Detailed description of the expense...'
                    className='min-h-[40px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200 placeholder:text-muted-foreground'
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='notes' className='text-xs font-medium'>
                    Notes
                  </Label>
                <Textarea
                  id='notes'
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder='Any additional notes about the expense...'
                    className='min-h-[40px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200 placeholder:text-muted-foreground'
                />
              </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label className='text-xs font-medium'>Recorded By</Label>
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
              onClick={onClose}
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
                  Submitting...
                </>
              ) : (
                <>
                  <Save className='w-3 h-3 mr-1' />
                  Submit
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
