import { useState, useEffect } from 'react';
import {
  IndianRupee,
  Save,
  X,
  Truck,
  Calendar,
  FileText,
  Upload,
  Loader2,
  Fuel,
  Wrench,
  CreditCard,
  MapPin,
  Receipt,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
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
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (editingExpense && isOpen) {
      setFormData(editingExpense);
    } else if (!editingExpense && isOpen) {
      // Reset form for new expense
      setFormData({
        expenseNumber: `EXP-${Date.now()}`,
        vehicleId: '',
        vehicleRegistrationNumber: '',
        driverId: '',
        driverName: '',
        expenseDate: new Date().toISOString().split('T')[0],
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
      });
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    // Basic Information Validation
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

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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

    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
      hasErrors = true;
    }

    if (!formData.paymentMethod.trim()) {
      newErrors.paymentMethod = 'Payment method is required';
      hasErrors = true;
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
        expenseDate: new Date().toISOString().split('T')[0],
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
      });

      setErrors({});
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleInputChange('receipts', [...formData.receipts, ...files]);
  };

  const removeReceipt = (index: number) => {
    const newReceipts = formData.receipts.filter((_, i) => i !== index);
    handleInputChange('receipts', newReceipts);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-[95vw] max-h-[90vh] overflow-y-auto p-6'>
        <DialogHeader className='pb-4'>
          <DialogTitle className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center'>
              <IndianRupee className='w-4 h-4 text-primary' />
            </div>
            <div>
              <div className='text-lg font-bold'>
                {editingExpense ? 'EDIT VEHICLE EXPENSE' : 'VEHICLE EXPENSE FORM'}
              </div>
              <div className='text-sm text-muted-foreground'>
                {editingExpense ? 'Update expense information' : 'Record new vehicle expense'}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Truck className='w-5 h-5' />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='expenseNumber'>Expense Number</Label>
                  <Input
                    id='expenseNumber'
                    value={formData.expenseNumber}
                    onChange={(e) => handleInputChange('expenseNumber', e.target.value)}
                    placeholder='Auto-generated'
                    readOnly
                    className='bg-gray-50'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='vehicleId'>Vehicle *</Label>
                  <Select
                    value={formData.vehicleId}
                    onValueChange={(value) => handleInputChange('vehicleId', value)}
                  >
                    <SelectTrigger className={errors.vehicleId ? 'border-red-500' : ''}>
                      <SelectValue placeholder='Select vehicle' />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.registrationNumber} - {vehicle.driverName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vehicleId && (
                    <p className='text-sm text-red-500'>{errors.vehicleId}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='expenseDate'>Expense Date *</Label>
                  <Input
                    id='expenseDate'
                    type='date'
                    value={formData.expenseDate}
                    onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                    className={errors.expenseDate ? 'border-red-500' : ''}
                  />
                  {errors.expenseDate && (
                    <p className='text-sm text-red-500'>{errors.expenseDate}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='expenseCategory'>Expense Category *</Label>
                  <Select
                    value={formData.expenseCategory}
                    onValueChange={(value: 'fuel' | 'maintenance' | 'repair' | 'insurance' | 'toll' | 'parking' | 'driver_salary' | 'permit' | 'other') => 
                      handleInputChange('expenseCategory', value)
                    }
                  >
                    <SelectTrigger className={errors.expenseCategory ? 'border-red-500' : ''}>
                      <SelectValue />
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
                    <p className='text-sm text-red-500'>{errors.expenseCategory}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='expenseType'>Expense Type *</Label>
                  <Input
                    id='expenseType'
                    value={formData.expenseType}
                    onChange={(e) => handleInputChange('expenseType', e.target.value)}
                    placeholder='e.g., Diesel, Engine Oil, Brake Repair'
                    className={errors.expenseType ? 'border-red-500' : ''}
                  />
                  {errors.expenseType && (
                    <p className='text-sm text-red-500'>{errors.expenseType}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='amount'>Amount (₹) *</Label>
                  <Input
                    id='amount'
                    type='number'
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder='e.g., 2500.00'
                    min='0'
                    step='0.01'
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && (
                    <p className='text-sm text-red-500'>{errors.amount}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='location'>Location *</Label>
                  <Input
                    id='location'
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder='Where was the expense incurred?'
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className='text-sm text-red-500'>{errors.location}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='odometerReading'>Odometer Reading (km)</Label>
                  <Input
                    id='odometerReading'
                    type='number'
                    value={formData.odometerReading}
                    onChange={(e) => handleInputChange('odometerReading', e.target.value)}
                    placeholder='e.g., 125000'
                    min='0'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description *</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder='Detailed description of the expense...'
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className='text-sm text-red-500'>{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Receipt className='w-5 h-5' />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='vendorName'>Vendor Name *</Label>
                  <Input
                    id='vendorName'
                    value={formData.vendorName}
                    onChange={(e) => handleInputChange('vendorName', e.target.value)}
                    placeholder='e.g., Bharat Petroleum, Local Mechanic'
                    className={errors.vendorName ? 'border-red-500' : ''}
                  />
                  {errors.vendorName && (
                    <p className='text-sm text-red-500'>{errors.vendorName}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='vendorContact'>Vendor Contact</Label>
                  <Input
                    id='vendorContact'
                    type='tel'
                    value={formData.vendorContact}
                    onChange={(e) => handleInputChange('vendorContact', e.target.value)}
                    placeholder='+91 9876543210'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='paymentMethod'>Payment Method *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: 'cash' | 'card' | 'upi' | 'cheque' | 'bank_transfer') => 
                      handleInputChange('paymentMethod', value)
                    }
                  >
                    <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='cash'>Cash</SelectItem>
                      <SelectItem value='card'>Credit/Debit Card</SelectItem>
                      <SelectItem value='upi'>UPI</SelectItem>
                      <SelectItem value='cheque'>Cheque</SelectItem>
                      <SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && (
                    <p className='text-sm text-red-500'>{errors.paymentMethod}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='paymentReference'>Payment Reference</Label>
                  <Input
                    id='paymentReference'
                    value={formData.paymentReference}
                    onChange={(e) => handleInputChange('paymentReference', e.target.value)}
                    placeholder='Transaction ID, Cheque No., etc.'
                  />
                </div>

                <div className='space-y-2 md:col-span-2 lg:col-span-3'>
                  <Label htmlFor='vendorAddress'>Vendor Address</Label>
                  <Textarea
                    id='vendorAddress'
                    value={formData.vendorAddress}
                    onChange={(e) => handleInputChange('vendorAddress', e.target.value)}
                    placeholder='Complete vendor address'
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipts Upload */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Upload className='w-5 h-5' />
                Receipts & Documents
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='receipts'>Upload Receipts</Label>
                <Input
                  id='receipts'
                  type='file'
                  multiple
                  accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                  onChange={handleFileUpload}
                  className='cursor-pointer'
                />
                <p className='text-sm text-muted-foreground'>
                  Upload expense receipts, invoices, and related documents
                </p>
              </div>

              {formData.receipts.length > 0 && (
                <div className='space-y-2'>
                  <Label>Uploaded Documents</Label>
                  <div className='space-y-2'>
                    {formData.receipts.map((file, index) => (
                      <div key={index} className='flex items-center justify-between p-2 border rounded'>
                        <div className='flex items-center gap-2'>
                          <FileText className='w-4 h-4' />
                          <span className='text-sm'>{file.name}</span>
                          <span className='text-xs text-muted-foreground'>
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => removeReceipt(index)}
                          className='h-6 w-6 p-0'
                        >
                          <X className='w-3 h-3' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <CheckCircle className='w-5 h-5' />
                Approval Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='approvalStatus'>Approval Status</Label>
                  <Select
                    value={formData.approvalStatus}
                    onValueChange={(value: 'pending' | 'approved' | 'rejected') => 
                      handleInputChange('approvalStatus', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='pending'>Pending</SelectItem>
                      <SelectItem value='approved'>Approved</SelectItem>
                      <SelectItem value='rejected'>Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='approvedBy'>Approved By</Label>
                  <Input
                    id='approvedBy'
                    value={formData.approvedBy}
                    onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                    placeholder='Approver name'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='approvedDate'>Approval Date</Label>
                  <Input
                    id='approvedDate'
                    type='date'
                    value={formData.approvedDate}
                    onChange={(e) => handleInputChange('approvedDate', e.target.value)}
                  />
                </div>

                {formData.approvalStatus === 'rejected' && (
                  <div className='space-y-2 md:col-span-2 lg:col-span-3'>
                    <Label htmlFor='rejectionReason'>Rejection Reason</Label>
                    <Textarea
                      id='rejectionReason'
                      value={formData.rejectionReason}
                      onChange={(e) => handleInputChange('rejectionReason', e.target.value)}
                      placeholder='Reason for rejection...'
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <FileText className='w-5 h-5' />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder='Any additional notes about the expense...'
                  rows={3}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label>Recorded By</Label>
                  <div className='input-friendly bg-secondary text-center py-2 font-semibold text-sm'>
                    {currentUser?.name || 'Current User'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Date</Label>
                  <div className='input-friendly bg-secondary text-center py-2 font-semibold text-sm'>
                    {new Date().toLocaleDateString()}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Current Status</Label>
                  <div className='flex justify-center'>
                    <Badge className={`${getApprovalStatusColor(formData.approvalStatus)} border flex items-center gap-1`}>
                      {getApprovalStatusIcon(formData.approvalStatus)}
                      <span className='text-xs'>{formData.approvalStatus.toUpperCase()}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className='w-4 h-4 mr-2' />
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='gap-2'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {editingExpense ? 'Updating...' : 'Recording...'}
                </>
              ) : (
                <>
                  <Save className='w-4 h-4' />
                  {editingExpense ? 'Update Expense' : 'Record Expense'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
