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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Plus, 
  X, 
  User, 
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Eye,
  Edit
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';

interface LeaveFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leaveData: any) => void;
  editingLeave?: any | null;
  mode?: 'create' | 'approve' | 'view';
}

interface LeaveFormData {
  // Employee Information
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  
  // Leave Details
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  
  // Approval Information
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedBy: string;
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  
  // Additional Information
  attachments: File[];
  notes: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  employeeId: string;
}

export const LeaveForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingLeave,
  mode = 'create',
}: LeaveFormProps) => {
  const { currentUser } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // New state for custom leave type
  const [showCustomLeaveTypeInput, setShowCustomLeaveTypeInput] = useState(false);
  const [customLeaveTypeName, setCustomLeaveTypeName] = useState('');

  const [formData, setFormData] = useState<LeaveFormData>({
    employeeId: '',
    employeeName: '',
    employeeEmail: '',
    department: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    totalDays: 0,
    reason: '',
    status: 'pending',
    submittedBy: currentUser?.name || '',
    submittedDate: new Date().toISOString(),
    attachments: [],
    notes: '',
  });

  // Mock employee data - in real app, this would come from API
  const mockEmployees: Employee[] = [
    { id: '1', name: 'John Doe', email: 'john.doe@company.com', department: 'Engineering', employeeId: 'EMP001' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Marketing', employeeId: 'EMP002' },
    { id: '3', name: 'Mike Johnson', email: 'mike.johnson@company.com', department: 'Sales', employeeId: 'EMP003' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah.wilson@company.com', department: 'HR', employeeId: 'EMP004' },
    { id: '5', name: 'David Brown', email: 'david.brown@company.com', department: 'Finance', employeeId: 'EMP005' },
  ];

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', description: 'Regular vacation leave' },
    { value: 'sick', label: 'Sick Leave', description: 'Medical leave for illness' },
    { value: 'personal', label: 'Personal Leave', description: 'Personal matters' },
    { value: 'maternity', label: 'Maternity Leave', description: 'Maternity/paternity leave' },
    { value: 'emergency', label: 'Emergency Leave', description: 'Urgent personal matters' },
    { value: 'study', label: 'Study Leave', description: 'Educational purposes' },
    { value: 'bereavement', label: 'Bereavement Leave', description: 'Death of family member' },
    { value: 'compensatory', label: 'Compensatory Leave', description: 'Compensation for overtime' },
    { value: 'other', label: 'Other', description: 'Custom leave type' },
  ];

  const statusConfig = {
    pending: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  };

  // Load employees when form opens
  useEffect(() => {
    if (isOpen && mode === 'create') {
      loadEmployees();
    }
  }, [isOpen, mode]);

  // Prefill form data when editing or viewing
  useEffect(() => {
    if (editingLeave && isOpen) {
      setFormData({
        employeeId: editingLeave.employeeId || '',
        employeeName: editingLeave.employeeName || '',
        employeeEmail: editingLeave.employeeEmail || '',
        department: editingLeave.department || '',
        leaveType: editingLeave.leaveType || '',
        startDate: editingLeave.startDate || '',
        endDate: editingLeave.endDate || '',
        totalDays: editingLeave.totalDays || 0,
        reason: editingLeave.reason || '',
        status: editingLeave.status || 'pending',
        submittedBy: editingLeave.submittedBy || currentUser?.name || '',
        submittedDate: editingLeave.submittedDate || new Date().toISOString(),
        approvedBy: editingLeave.approvedBy || '',
        approvedDate: editingLeave.approvedDate || '',
        rejectionReason: editingLeave.rejectionReason || '',
        approvalNotes: editingLeave.approvalNotes || '',
        attachments: editingLeave.attachments || [],
        notes: editingLeave.notes || '',
      });
    } else if (!editingLeave && isOpen && mode === 'create') {
      // Reset form when creating new leave
      setFormData({
        employeeId: '',
        employeeName: '',
        employeeEmail: '',
        department: '',
        leaveType: '',
        startDate: '',
        endDate: '',
        totalDays: 0,
        reason: '',
        status: 'pending',
        submittedBy: currentUser?.name || '',
        submittedDate: new Date().toISOString(),
        attachments: [],
        notes: '',
      });
    }
  }, [editingLeave, isOpen, mode, currentUser]);

  // Calculate total days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      setFormData(prev => ({ ...prev, totalDays: diffDays }));
    }
  }, [formData.startDate, formData.endDate]);

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
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
      setIsLoadingEmployees(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Handle "Other" selection for leave type
    if (field === 'leaveType' && value === 'other') {
      setShowCustomLeaveTypeInput(true);
    } else {
      setShowCustomLeaveTypeInput(false);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeEmail: employee.email,
        department: employee.department,
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ 
      ...prev, 
      attachments: prev.attachments.filter((_, i) => i !== index) 
    }));
  };

  // Function to create new leave type
  const handleCreateLeaveType = async () => {
    if (!customLeaveTypeName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a leave type name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating leave type:', customLeaveTypeName.trim());
      
      // In a real app, this would be an API call to create a new leave type
      // const newLeaveType = await createLeaveType({ name: customLeaveTypeName.trim() });
      
      // For now, we'll just add it to the local leaveTypes array
      const newLeaveType = {
        value: customLeaveTypeName.trim().toLowerCase().replace(/\s+/g, '_'),
        label: customLeaveTypeName.trim(),
        description: 'Custom leave type'
      };
      
      console.log('Leave type created:', newLeaveType);
      
      // Add to leaveTypes array (in a real app, this would be handled by the API)
      leaveTypes.push(newLeaveType);
      
      setFormData(prev => ({ ...prev, leaveType: newLeaveType.value }));
      setShowCustomLeaveTypeInput(false);
      setCustomLeaveTypeName('');
      
      toast({
        title: 'Success',
        description: `Leave type "${newLeaveType.label}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating leave type:', error);
      
      toast({
        title: 'Error',
        description: `Failed to create leave type: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.employeeId) newErrors.employeeId = 'Employee selection is required';
    if (!formData.leaveType) newErrors.leaveType = 'Leave type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for leave is required';

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare leave data for submission
      const leaveData = {
        ...formData,
        submittedBy: currentUser?.name || '',
        submittedDate: new Date().toISOString(),
        status: mode === 'create' ? 'pending' : formData.status,
      };

      // Here you would typically call an API to create/update the leave request
      console.log('Leave data to be submitted:', leaveData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSubmit(leaveData);

      const actionText = mode === 'create' ? 'submitted' : 
                        formData.status === 'approved' ? 'approved' : 'rejected';
      
      toast({
        title: 'Success',
        description: `Leave request has been ${actionText} successfully.`,
      });

      // Reset form for create mode
      if (mode === 'create') {
        setFormData({
          employeeId: '',
          employeeName: '',
          employeeEmail: '',
          department: '',
          leaveType: '',
          startDate: '',
          endDate: '',
          totalDays: 0,
          reason: '',
          status: 'pending',
          submittedBy: currentUser?.name || '',
          submittedDate: new Date().toISOString(),
          attachments: [],
          notes: '',
        });
        setErrors({});
        setUploadedFiles([]);
        setShowCustomLeaveTypeInput(false);
        setCustomLeaveTypeName('');
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting leave form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit leave request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = () => {
    setFormData(prev => ({
      ...prev,
      status: 'approved',
      approvedBy: currentUser?.name || '',
      approvedDate: new Date().toISOString(),
    }));
  };

  const handleReject = () => {
    setFormData(prev => ({
      ...prev,
      status: 'rejected',
      approvedBy: currentUser?.name || '',
      approvedDate: new Date().toISOString(),
    }));
  };

  const handleClose = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      employeeEmail: '',
      department: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      totalDays: 0,
      reason: '',
      status: 'pending',
      submittedBy: currentUser?.name || '',
      submittedDate: new Date().toISOString(),
      attachments: [],
      notes: '',
    });
    setErrors({});
    setUploadedFiles([]);
    setShowCustomLeaveTypeInput(false);
    setCustomLeaveTypeName('');
    onClose();
  };

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Submit Leave Request';
      case 'approve':
        return 'Review Leave Request';
      case 'view':
        return 'Leave Request Details';
      default:
        return 'Leave Request';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'create':
        return <Plus className='w-4 h-4 text-primary' />;
      case 'approve':
        return <CheckCircle className='w-4 h-4 text-primary' />;
      case 'view':
        return <Eye className='w-4 h-4 text-primary' />;
      default:
        return <FileText className='w-4 h-4 text-primary' />;
    }
  };

  const canApprove = () => {
    return currentUser?.role === 'company_owner' && 
           formData.status === 'pending' && 
           mode === 'approve';
  };

  const canReject = () => {
    return currentUser?.role === 'company_owner' && 
           formData.status === 'pending' && 
           mode === 'approve';
  };

  const canSubmit = () => {
    return currentUser?.role === 'supervisor' && mode === 'create';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
              {getIcon()}
            </div>
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <Card className='border-0 shadow-sm'>
            <CardContent className='space-y-4'>
              {/* Status Badge for View/Approve modes */}
              {(mode === 'view' || mode === 'approve') && (
                <div className='flex justify-between items-center p-3 bg-muted/30 rounded-lg'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>Status:</span>
                    <Badge className={statusConfig[formData.status].color}>
                      {React.createElement(statusConfig[formData.status].icon, { className: 'w-3 h-3 mr-1' })}
                      {statusConfig[formData.status].label}
                    </Badge>
                  </div>
                  {formData.submittedDate && (
                    <span className='text-xs text-muted-foreground'>
                      Submitted: {new Date(formData.submittedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {/* Employee Information */}
              <div className='space-y-3'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1 flex items-center gap-2'>
                  <User className='w-3 h-3' />
                  Employee Information
                </h4>

                {mode === 'create' ? (
                  <div className='space-y-1'>
                    <Label htmlFor='employeeId' className='text-xs font-medium'>
                      Select Employee *
                    </Label>
                    <Select
                      value={formData.employeeId}
                      onValueChange={handleEmployeeSelect}
                      disabled={isLoadingEmployees}
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder={isLoadingEmployees ? 'Loading employees...' : 'Select employee'} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className='flex flex-col'>
                              <span>{employee.name}</span>
                              <span className='text-xs text-muted-foreground'>
                                {employee.employeeId} - {employee.department}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.employeeId && (
                      <p className='text-destructive text-xs mt-1'>{errors.employeeId}</p>
                    )}
                  </div>
                ) : (
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <Label className='text-xs font-medium'>Employee Name</Label>
                      <div className='h-8 px-2 py-1 bg-muted/30 rounded-[5px] text-xs flex items-center'>
                        {formData.employeeName}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs font-medium'>Employee ID</Label>
                      <div className='h-8 px-2 py-1 bg-muted/30 rounded-[5px] text-xs flex items-center'>
                        {formData.employeeId}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs font-medium'>Email</Label>
                      <div className='h-8 px-2 py-1 bg-muted/30 rounded-[5px] text-xs flex items-center'>
                        {formData.employeeEmail}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs font-medium'>Department</Label>
                      <div className='h-8 px-2 py-1 bg-muted/30 rounded-[5px] text-xs flex items-center'>
                        {formData.department}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Leave Details */}
              <div className='space-y-3'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1 flex items-center gap-2'>
                  <Calendar className='w-3 h-3' />
                  Leave Details
                </h4>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='leaveType' className='text-xs font-medium'>
                      Leave Type *
                    </Label>
                    <Select
                      value={formData.leaveType}
                      onValueChange={(value) => handleSelectChange('leaveType', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder='Select leave type' />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className='flex flex-col'>
                              <span>{type.label}</span>
                              <span className='text-xs text-muted-foreground'>{type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.leaveType && (
                      <p className='text-destructive text-xs mt-1'>{errors.leaveType}</p>
                    )}
                  </div>

                  {/* Custom Leave Type Input */}
                  {showCustomLeaveTypeInput && (
                    <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2'>
                      <Label className='text-xs font-medium text-blue-800'>
                        Add New Leave Type
                      </Label>
                      <div className='flex gap-2'>
                        <Input
                          placeholder='Enter leave type name'
                          value={customLeaveTypeName}
                          onChange={(e) => setCustomLeaveTypeName(e.target.value)}
                          className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                        />
                        <Button
                          type='button'
                          onClick={handleCreateLeaveType}
                          size='sm'
                          className='h-8 px-3 bg-blue-600 hover:bg-blue-700'
                        >
                          <Plus className='w-3 h-3 mr-1' />
                          Add
                        </Button>
                        <Button
                          type='button'
                          onClick={() => {
                            setShowCustomLeaveTypeInput(false);
                            setCustomLeaveTypeName('');
                            setFormData(prev => ({ ...prev, leaveType: '' }));
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

                  <div className='space-y-1'>
                    <Label className='text-xs font-medium'>Total Days</Label>
                    <div className='h-8 px-2 py-1 bg-muted/30 rounded-[5px] text-xs flex items-center'>
                      {formData.totalDays} day{formData.totalDays !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='startDate' className='text-xs font-medium'>
                      Start Date *
                    </Label>
                    <Input
                      id='startDate'
                      type='date'
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      disabled={mode === 'view'}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                    {errors.startDate && (
                      <p className='text-destructive text-xs mt-1'>{errors.startDate}</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='endDate' className='text-xs font-medium'>
                      End Date *
                    </Label>
                    <Input
                      id='endDate'
                      type='date'
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      disabled={mode === 'view'}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                    {errors.endDate && (
                      <p className='text-destructive text-xs mt-1'>{errors.endDate}</p>
                    )}
                  </div>
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='reason' className='text-xs font-medium'>
                    Reason for Leave *
                  </Label>
                  <Textarea
                    id='reason'
                    placeholder='Please provide a detailed reason for your leave request'
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    disabled={mode === 'view'}
                    className='min-h-[60px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200'
                  />
                  {errors.reason && (
                    <p className='text-destructive text-xs mt-1'>{errors.reason}</p>
                  )}
                </div>
              </div>

              {/* Approval Section - Only for approve mode */}
              {mode === 'approve' && (
                <div className='space-y-3'>
                  <h4 className='text-xs font-medium text-muted-foreground border-b pb-1 flex items-center gap-2'>
                    <CheckCircle className='w-3 h-3' />
                    Approval Decision
                  </h4>

                  <div className='space-y-1'>
                    <Label htmlFor='approvalNotes' className='text-xs font-medium'>
                      Approval Notes
                    </Label>
                    <Textarea
                      id='approvalNotes'
                      placeholder='Add any notes or comments about your decision'
                      value={formData.approvalNotes || ''}
                      onChange={(e) => handleInputChange('approvalNotes', e.target.value)}
                      className='min-h-[60px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200'
                    />
                  </div>

                  {formData.status === 'rejected' && (
                    <div className='space-y-1'>
                      <Label htmlFor='rejectionReason' className='text-xs font-medium'>
                        Rejection Reason *
                      </Label>
                      <Textarea
                        id='rejectionReason'
                        placeholder='Please provide a reason for rejection'
                        value={formData.rejectionReason || ''}
                        onChange={(e) => handleInputChange('rejectionReason', e.target.value)}
                        className='min-h-[60px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200'
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Additional Notes */}
              <div className='space-y-3'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                  Additional Information
                </h4>

                <div className='space-y-1'>
                  <Label htmlFor='notes' className='text-xs font-medium'>
                    Additional Notes
                  </Label>
                  <Textarea
                    id='notes'
                    placeholder='Any additional information or special requests'
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    disabled={mode === 'view'}
                    className='min-h-[40px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200'
                  />
                </div>
              </div>

              {/* Approval History - Only for view/approve modes */}
              {(mode === 'view' || mode === 'approve') && (
                <div className='space-y-3'>
                  <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                    Approval History
                  </h4>

                  <div className='space-y-2'>
                    <div className='flex justify-between items-center p-2 bg-muted/30 rounded-lg'>
                      <span className='text-xs font-medium'>Submitted by:</span>
                      <span className='text-xs'>{formData.submittedBy}</span>
                    </div>
                    {formData.submittedDate && (
                      <div className='flex justify-between items-center p-2 bg-muted/30 rounded-lg'>
                        <span className='text-xs font-medium'>Submitted on:</span>
                        <span className='text-xs'>{new Date(formData.submittedDate).toLocaleString()}</span>
                      </div>
                    )}
                    {formData.approvedBy && (
                      <div className='flex justify-between items-center p-2 bg-muted/30 rounded-lg'>
                        <span className='text-xs font-medium'>Approved by:</span>
                        <span className='text-xs'>{formData.approvedBy}</span>
                      </div>
                    )}
                    {formData.approvedDate && (
                      <div className='flex justify-between items-center p-2 bg-muted/30 rounded-lg'>
                        <span className='text-xs font-medium'>Approved on:</span>
                        <span className='text-xs'>{new Date(formData.approvedDate).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
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
              className='h-8 px-4'
            >
              <X className='w-3 h-3 mr-1' />
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>

            {/* Approval Actions */}
            {mode === 'approve' && canReject() && (
              <Button
                type='button'
                variant='destructive'
                onClick={handleReject}
                className='h-8 px-4'
              >
                <XCircle className='w-3 h-3 mr-1' />
                Reject
              </Button>
            )}

            {mode === 'approve' && canApprove() && (
              <Button
                type='button'
                onClick={handleApprove}
                className='h-8 px-4 bg-green-600 hover:bg-green-700'
              >
                <CheckCircle className='w-3 h-3 mr-1' />
                Approve
              </Button>
            )}

            {/* Submit Action */}
            {canSubmit() && (
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
                    <Send className='w-3 h-3 mr-1' />
                    Submit Request
                  </>
                )}
              </Button>
            )}

            {/* Update Action for approve mode */}
            {mode === 'approve' && (canApprove() || canReject()) && (
              <Button
                type='submit'
                className='h-8 px-4 bg-primary hover:bg-primary/90'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className='w-3 h-3 mr-1' />
                    Update Decision
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
