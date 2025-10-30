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
import { 
  Loader2, 
  Plus, 
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';

interface EmployeeOnboardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employeeData: any) => void;
  editingEmployee?: any | null;
}

interface EmployeeFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  unit: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  
  // Employment Information
  employeeId: string;
  department: string;
  position: string;
  joiningDate: string;
  contractType: string;
  
  // Contract Details (for permanent contracts)
  probationPeriod: string;
  noticePeriod: string;
  salary: string;
  benefits: string;
  workingHours: string;
  workLocation: string;
}

export const EmployeeOnboardForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingEmployee,
}: EmployeeOnboardFormProps) => {
  const { currentUser } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customDepartment, setCustomDepartment] = useState('');
  const [showCustomDepartmentInput, setShowCustomDepartmentInput] = useState(false);

  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    unit: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    employeeId: '',
    department: '',
    position: '',
    joiningDate: '',
    contractType: '',
    probationPeriod: '',
    noticePeriod: '',
    salary: '',
    benefits: '',
    workingHours: '',
    workLocation: '',
  });

  // Prefill form data when editing
  useEffect(() => {
    if (editingEmployee && isOpen) {
      setFormData({
        firstName: editingEmployee.firstName || '',
        lastName: editingEmployee.lastName || '',
        email: editingEmployee.email || '',
        phone: editingEmployee.phone || '',
        dateOfBirth: editingEmployee.dateOfBirth || '',
        gender: editingEmployee.gender || '',
        maritalStatus: editingEmployee.maritalStatus || '',
        unit: editingEmployee.unit || '',
        address: editingEmployee.address || '',
        city: editingEmployee.city || '',
        state: editingEmployee.state || '',
        postalCode: editingEmployee.postalCode || '',
        country: editingEmployee.country || '',
        employeeId: editingEmployee.employeeId || '',
        department: editingEmployee.department || '',
        position: editingEmployee.position || '',
        joiningDate: editingEmployee.joiningDate || '',
        contractType: editingEmployee.contractType || '',
        probationPeriod: editingEmployee.probationPeriod || '',
        noticePeriod: editingEmployee.noticePeriod || '',
        salary: editingEmployee.salary || '',
        benefits: editingEmployee.benefits || '',
        workingHours: editingEmployee.workingHours || '',
        workLocation: editingEmployee.workLocation || '',
      });
    } else if (!editingEmployee && isOpen) {
      // Reset form when adding new employee
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        unit: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        employeeId: generateEmployeeId(),
        department: '',
        position: '',
        joiningDate: '',
        contractType: '',
        probationPeriod: '',
        noticePeriod: '',
        salary: '',
        benefits: '',
        workingHours: '',
        workLocation: '',
      });
    }
  }, [editingEmployee, isOpen]);

  const contractTypes = [
    { value: 'permanent', label: 'Permanent', description: 'Full-time permanent employment' },
    { value: 'contract', label: 'Contract', description: 'Fixed-term contract' },
    { value: 'temporary', label: 'Temporary', description: 'Temporary employment' },
    { value: 'intern', label: 'Intern', description: 'Internship position' },
  ];

  const departments = [
    'Human Resources',
    'Finance',
    'Operations',
    'IT',
    'Marketing',
    'Sales',
    'Customer Service',
    'Maintenance',
    'Fleet Management',
    'Procurement',
    'Quality Assurance',
    'Administration',
    'Other',
  ];

  const units = [
    'Head Office',
    'Regional Office - North',
    'Regional Office - South',
    'Regional Office - East',
    'Regional Office - West',
    'Branch Office - Mumbai',
    'Branch Office - Delhi',
    'Branch Office - Bangalore',
    'Branch Office - Chennai',
    'Branch Office - Kolkata',
    'Field Office',
    'Remote Location',
    'Other',
  ];

  // Auto-generate Employee ID
  const generateEmployeeId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EMP${timestamp}${random}`;
  };

  const handleInputChange = (field: string, value: string) => {
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
    
    // Handle custom department
    if (field === 'department' && value === 'Other') {
      setShowCustomDepartmentInput(true);
      setCustomDepartment('');
    } else if (field === 'department' && value !== 'Other') {
      setShowCustomDepartmentInput(false);
      setCustomDepartment('');
    }
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.department === 'Other' && !customDepartment.trim()) newErrors.customDepartment = 'Department name is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Permanent contract specific validations
    if (formData.contractType === 'permanent') {
      if (!formData.probationPeriod) newErrors.probationPeriod = 'Probation period is required for permanent contracts';
      if (!formData.noticePeriod) newErrors.noticePeriod = 'Notice period is required for permanent contracts';
      if (!formData.salary.trim()) newErrors.salary = 'Salary is required for permanent contracts';
      if (!formData.workingHours.trim()) newErrors.workingHours = 'Working hours are required for permanent contracts';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // Prepare employee data for submission
      const employeeData = {
        ...formData,
        employeeId: generateEmployeeId(), // Auto-generate Employee ID
        department: formData.department === 'Other' ? customDepartment : formData.department,
        fullName: `${formData.firstName} ${formData.lastName}`,
        submittedBy: currentUser?.id,
        submittedAt: new Date().toISOString(),
        status: 'pending_approval',
      };

      // Here you would typically call an API to create the employee
      // For now, we'll simulate the API call
      console.log('Employee data to be submitted:', employeeData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSubmit(employeeData);

      toast({
        title: 'Success',
        description: 'Employee onboarding form submitted successfully.',
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        unit: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        employeeId: generateEmployeeId(),
        department: '',
        position: '',
        joiningDate: '',
        contractType: '',
        probationPeriod: '',
        noticePeriod: '',
        salary: '',
        benefits: '',
        workingHours: '',
        workLocation: '',
      });
      setErrors({});
      setCustomDepartment('');
      setShowCustomDepartmentInput(false);
      onClose();
    } catch (error) {
      console.error('Error submitting employee form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit employee onboarding form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      unit: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      employeeId: generateEmployeeId(),
      department: '',
      position: '',
      joiningDate: '',
      contractType: '',
      probationPeriod: '',
      noticePeriod: '',
      salary: '',
      benefits: '',
      workingHours: '',
      workLocation: '',
    });
    setErrors({});
    setCustomDepartment('');
    setShowCustomDepartmentInput(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
              <Plus className='w-4 h-4 text-primary' />
            </div>
            {editingEmployee ? 'Edit Employee Details' : 'Employee Onboarding Form'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-2'>
          <Card className='border-0 shadow-sm'>
            <CardContent className='space-y-2'>
              {/* Personal Information */}
              <div className='space-y-1'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                  Personal Information
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='firstName' className='text-xs font-medium'>
                      First Name *
                    </Label>
                    <Input
                      id='firstName'
                      placeholder='Enter first name'
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                    {errors.firstName && (
                      <p className='text-destructive text-xs mt-1'>{errors.firstName}</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='lastName' className='text-xs font-medium'>
                      Last Name *
                    </Label>
                    <Input
                      id='lastName'
                      placeholder='Enter last name'
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                    {errors.lastName && (
                      <p className='text-destructive text-xs mt-1'>{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='phone' className='text-xs font-medium'>
                      Phone Number *
                    </Label>
                    <Input
                      id='phone'
                      type='tel'
                      placeholder='Enter phone number'
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                    {errors.phone && (
                      <p className='text-destructive text-xs mt-1'>{errors.phone}</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='unit' className='text-xs font-medium'>
                      Unit/Location *
                    </Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => handleSelectChange('unit', value)}
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder='Select unit' />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='email' className='text-xs font-medium'>
                      Email Address
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='Enter email address'
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                    {errors.email && (
                      <p className='text-destructive text-xs mt-1'>{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='dateOfBirth' className='text-xs font-medium'>
                      Date of Birth
                    </Label>
                    <Input
                      id='dateOfBirth'
                      type='date'
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='gender' className='text-xs font-medium'>
                      Gender
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder='Select gender' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='male'>Male</SelectItem>
                        <SelectItem value='female'>Female</SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                        <SelectItem value='prefer-not-to-say'>Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='maritalStatus' className='text-xs font-medium'>
                      Marital Status
                    </Label>
                    <Select
                      value={formData.maritalStatus}
                      onValueChange={(value) => handleSelectChange('maritalStatus', value)}
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='single'>Single</SelectItem>
                        <SelectItem value='married'>Married</SelectItem>
                        <SelectItem value='divorced'>Divorced</SelectItem>
                        <SelectItem value='widowed'>Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className='space-y-1'>
                <div className='space-y-1'>
                  <Label htmlFor='address' className='text-xs font-medium'>
                    Address
                  </Label>
                  <Textarea
                    id='address'
                    placeholder='Enter full address'
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className='min-h-[40px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='city' className='text-xs font-medium'>
                      City
                    </Label>
                    <Input
                      id='city'
                      placeholder='Enter city'
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='state' className='text-xs font-medium'>
                      State/Province
                    </Label>
                    <Input
                      id='state'
                      placeholder='Enter state'
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='postalCode' className='text-xs font-medium'>
                      Postal Code
                    </Label>
                    <Input
                      id='postalCode'
                      placeholder='Enter postal code'
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='country' className='text-xs font-medium'>
                      Country
                    </Label>
                    <Input
                      id='country'
                      placeholder='Enter country'
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>
                </div>
              </div>


              {/* Employment Information */}
              <div className='space-y-1'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                  Employment Information
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='employeeId' className='text-xs font-medium'>
                      Employee ID (Auto-generated)
                    </Label>
                    <div className='h-8 px-2 py-1 bg-muted/30 rounded-[5px] text-xs flex items-center border border-input'>
                      {formData.employeeId}
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='department' className='text-xs font-medium'>
                      Department
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleSelectChange('department', value)}
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder='Select department' />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className='text-destructive text-xs mt-1'>{errors.department}</p>
                    )}
                    
                    {/* Custom Department Input */}
                    {showCustomDepartmentInput && (
                      <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2'>
                        <Label className='text-xs font-medium text-blue-800'>
                          Add New Department
                        </Label>
                        <div className='flex gap-2'>
                          <Input
                            placeholder='Enter department name'
                            value={customDepartment}
                            onChange={(e) => setCustomDepartment(e.target.value)}
                            className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                          />
                          <Button
                            type='button'
                            onClick={() => {
                              setShowCustomDepartmentInput(false);
                              setCustomDepartment('');
                              setFormData(prev => ({ ...prev, department: '' }));
                            }}
                            variant='outline'
                            size='sm'
                            className='h-8 px-3'
                          >
                            <X className='w-3 h-3' />
                          </Button>
                        </div>
                        {errors.customDepartment && (
                          <p className='text-destructive text-xs mt-1'>{errors.customDepartment}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='position' className='text-xs font-medium'>
                      Position/Job Title
                    </Label>
                    <Input
                      id='position'
                      placeholder='Enter job title'
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                    {errors.position && (
                      <p className='text-destructive text-xs mt-1'>{errors.position}</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='joiningDate' className='text-xs font-medium'>
                      Joining Date
                    </Label>
                    <Input
                      id='joiningDate'
                      type='date'
                      value={formData.joiningDate}
                      onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                    {errors.joiningDate && (
                      <p className='text-destructive text-xs mt-1'>{errors.joiningDate}</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='contractType' className='text-xs font-medium'>
                      Employment Type
                    </Label>
                    <Select
                      value={formData.contractType}
                      onValueChange={(value) => handleSelectChange('contractType', value)}
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder='Select employment type' />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map((contract) => (
                          <SelectItem key={contract.value} value={contract.value}>
                            <div className='flex flex-col'>
                              <span>{contract.label}</span>
                              <span className='text-xs text-muted-foreground'>{contract.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.contractType && (
                      <p className='text-destructive text-xs mt-1'>{errors.contractType}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contract Details - Show only for permanent contracts */}
              {formData.contractType === 'permanent' && (
                <div className='space-y-1'>
                  <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                    Permanent Contract Details
                  </h4>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <Label htmlFor='probationPeriod' className='text-xs font-medium'>
                        Probation Period *
                      </Label>
                      <Select
                        value={formData.probationPeriod}
                        onValueChange={(value) => handleSelectChange('probationPeriod', value)}
                      >
                        <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                          <SelectValue placeholder='Select probation period' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='1-month'>1 Month</SelectItem>
                          <SelectItem value='2-months'>2 Months</SelectItem>
                          <SelectItem value='3-months'>3 Months</SelectItem>
                          <SelectItem value='6-months'>6 Months</SelectItem>
                          <SelectItem value='1-year'>1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.probationPeriod && (
                        <p className='text-destructive text-xs mt-1'>{errors.probationPeriod}</p>
                      )}
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='noticePeriod' className='text-xs font-medium'>
                        Notice Period *
                      </Label>
                      <Select
                        value={formData.noticePeriod}
                        onValueChange={(value) => handleSelectChange('noticePeriod', value)}
                      >
                        <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                          <SelectValue placeholder='Select notice period' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='1-month'>1 Month</SelectItem>
                          <SelectItem value='2-months'>2 Months</SelectItem>
                          <SelectItem value='3-months'>3 Months</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.noticePeriod && (
                        <p className='text-destructive text-xs mt-1'>{errors.noticePeriod}</p>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                      <Label htmlFor='salary' className='text-xs font-medium'>
                        Salary *
                      </Label>
                      <Input
                        id='salary'
                        type='number'
                        placeholder='Enter salary amount'
                        value={formData.salary}
                        onChange={(e) => handleInputChange('salary', e.target.value)}
                        className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                      />
                      {errors.salary && (
                        <p className='text-destructive text-xs mt-1'>{errors.salary}</p>
                      )}
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='workingHours' className='text-xs font-medium'>
                        Working Hours *
                      </Label>
                      <Input
                        id='workingHours'
                        placeholder='e.g., 9:00 AM - 5:00 PM'
                        value={formData.workingHours}
                        onChange={(e) => handleInputChange('workingHours', e.target.value)}
                        className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                      />
                      {errors.workingHours && (
                        <p className='text-destructive text-xs mt-1'>{errors.workingHours}</p>
                      )}
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='benefits' className='text-xs font-medium'>
                      Benefits & Perks
                    </Label>
                    <Textarea
                      id='benefits'
                      placeholder='Enter benefits and perks (health insurance, vacation days, etc.)'
                      value={formData.benefits}
                      onChange={(e) => handleInputChange('benefits', e.target.value)}
                      className='min-h-[40px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='workLocation' className='text-xs font-medium'>
                      Work Location
                    </Label>
                    <Input
                      id='workLocation'
                      placeholder='Enter work location'
                      value={formData.workLocation}
                      onChange={(e) => handleInputChange('workLocation', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className='flex justify-end gap-3 pt-2 border-t sticky bottom-0 bg-background pb-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              className='h-8 px-4'
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
