import React, { useState, useEffect, useRef } from 'react';
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
  terminated: string;
}

export const EmployeeOnboardForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingEmployee,
}: EmployeeOnboardFormProps) => {
  const { currentUser } = useRole();
  const sequenceCounterRef = useRef(1);

  const sanitizeUnit = (unit?: string) => {
    const normalized = (unit || '').toUpperCase().replace(/\s+/g, '');
    return normalized || 'UNIT';
  };

  const deriveUnitCode = (unit?: string) => {
    const sanitizedUnit = sanitizeUnit(unit);
    const unitMatch = sanitizedUnit.match(/UNIT(\d+)/);

    if (unitMatch) {
      return `U${unitMatch[1]}`;
    }

    return sanitizedUnit || 'U0';
  };

  const generateEmployeeId = (unit?: string) => {
    const unitCode = deriveUnitCode(unit);
    const sequence = sequenceCounterRef.current.toString().padStart(3, '0');
    sequenceCounterRef.current += 1;
    return `E${unitCode}${sequence}`;
  };

  const buildInitialFormData = (unit = ''): EmployeeFormData => ({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    unit,
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
    terminated: 'no',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customDepartment, setCustomDepartment] = useState('');
  const [showCustomDepartmentInput, setShowCustomDepartmentInput] = useState(false);
  const [customPosition, setCustomPosition] = useState('');
  const [showCustomPositionInput, setShowCustomPositionInput] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>(() => buildInitialFormData());

  // TODO: Populate from API
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [contractTypes, setContractTypes] = useState<Array<{ value: string; label: string; description: string }>>([]);
  const [genders, setGenders] = useState<Array<{ value: string; label: string }>>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<Array<{ value: string; label: string }>>([]);

  // Prefill form data when editing
  useEffect(() => {
    if (editingEmployee && isOpen) {
      const unit = sanitizeUnit(editingEmployee.unit);
      const employeeDepartment = editingEmployee.department || '';
      const employeePosition = editingEmployee.position || '';
      
      // Check if department is in the list (will be populated from API)
      const isDepartmentCustom = employeeDepartment && departments.length > 0 && !departments.includes(employeeDepartment);
      // Check if position is in the list (will be populated from API)
      const isPositionCustom = employeePosition && positions.length > 0 && !positions.includes(employeePosition);

      setFormData({
        firstName: editingEmployee.firstName || '',
        lastName: editingEmployee.lastName || '',
        email: editingEmployee.email || '',
        phone: editingEmployee.phone || '',
        dateOfBirth: editingEmployee.dateOfBirth || '',
        gender: editingEmployee.gender || '',
        maritalStatus: editingEmployee.maritalStatus || '',
        unit,
        address: editingEmployee.address || '',
        city: editingEmployee.city || '',
        state: editingEmployee.state || '',
        postalCode: editingEmployee.postalCode || '',
        country: editingEmployee.country || '',
        employeeId: editingEmployee.employeeId || generateEmployeeId(unit),
        department: isDepartmentCustom ? 'Add Department' : employeeDepartment,
        position: isPositionCustom ? 'Add Position' : employeePosition,
        joiningDate: editingEmployee.joiningDate || '',
        contractType: editingEmployee.contractType || '',
        terminated: editingEmployee.terminated ?? 'no',
      });
      
      // Set custom department and position if needed
      if (isDepartmentCustom) {
        setCustomDepartment(employeeDepartment);
        setShowCustomDepartmentInput(true);
      } else {
        setCustomDepartment('');
        setShowCustomDepartmentInput(false);
      }
      
      if (isPositionCustom) {
        setCustomPosition(employeePosition);
        setShowCustomPositionInput(true);
      } else {
        setCustomPosition('');
        setShowCustomPositionInput(false);
      }
    } else if (!editingEmployee && isOpen) {
      setFormData(buildInitialFormData());
      setCustomDepartment('');
      setShowCustomDepartmentInput(false);
      setCustomPosition('');
      setShowCustomPositionInput(false);
    }
  }, [editingEmployee, isOpen, departments, positions]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => {
      const nextValue = field === 'unit' ? sanitizeUnit(value) : value;
      const nextState = { ...prev, [field]: nextValue };

      if (field === 'unit' && !editingEmployee) {
        nextState.employeeId = generateEmployeeId(nextValue);
      }

      return nextState;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    
    // Handle custom department
    if (field === 'department' && value === 'Add Department') {
      setShowCustomDepartmentInput(true);
      setCustomDepartment('');
    } else if (field === 'department' && value !== 'Add Department') {
      setShowCustomDepartmentInput(false);
      setCustomDepartment('');
    }
    
    // Handle custom position
    if (field === 'position' && value === 'Add Position') {
      setShowCustomPositionInput(true);
      setCustomPosition('');
    } else if (field === 'position' && value !== 'Add Position') {
      setShowCustomPositionInput(false);
      setCustomPosition('');
    }
  };

  const handleAddDepartment = () => {
    if (!customDepartment.trim()) {
      setErrors((prev) => ({ ...prev, customDepartment: 'Department name is required' }));
      return;
    }
    setFormData((prev) => ({ ...prev, department: customDepartment }));
    setShowCustomDepartmentInput(false);
    setCustomDepartment('');
    setErrors((prev) => ({ ...prev, customDepartment: '' }));
  };

  const handleAddPosition = () => {
    if (!customPosition.trim()) {
      setErrors((prev) => ({ ...prev, customPosition: 'Position name is required' }));
      return;
    }
    setFormData((prev) => ({ ...prev, position: customPosition }));
    setShowCustomPositionInput(false);
    setCustomPosition('');
    setErrors((prev) => ({ ...prev, customPosition: '' }));
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.department === 'Add Department' && !customDepartment.trim()) newErrors.customDepartment = 'Department name is required';
    if (formData.position === 'Add Position' && !customPosition.trim()) newErrors.customPosition = 'Position name is required';

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
      const resolvedEmployeeId = editingEmployee
        ? formData.employeeId
        : formData.employeeId || generateEmployeeId(formData.unit);

      const employeeData = {
        ...formData,
        employeeId: resolvedEmployeeId,
        department: formData.department === 'Add Department' ? customDepartment : formData.department,
        position: formData.position === 'Add Position' ? customPosition : formData.position,
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
      setFormData(buildInitialFormData());
      setErrors({});
      setCustomDepartment('');
      setShowCustomDepartmentInput(false);
      setCustomPosition('');
      setShowCustomPositionInput(false);
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
    setFormData(buildInitialFormData());
    setErrors({});
    setCustomDepartment('');
    setShowCustomDepartmentInput(false);
    setCustomPosition('');
    setShowCustomPositionInput(false);
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

        <form onSubmit={handleSubmit} className='space-y-3'>
          <Card className='border-0 shadow-sm'>
            <CardContent className='space-y-3'>
              {/* Personal Information */}
              <div className='space-y-2'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                  Personal Information
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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
                    Factory Location*
                    </Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => handleSelectChange('unit', value)}
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder='Select unit' />
                      </SelectTrigger>
                      <SelectContent>
                        {/* TODO: Populate from API */}
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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
                        {/* TODO: Populate from API */}
                        {genders.map((gender) => (
                          <SelectItem key={gender.value} value={gender.value}>
                            {gender.label}
                          </SelectItem>
                        ))}
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
                        {/* TODO: Populate from API */}
                        {maritalStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className='space-y-2'>
               

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

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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
              <div className='space-y-2'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                  Employment Information
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4'>
                  <div className='space-y-1'>
                    <Label htmlFor='employeeId' className='text-xs font-medium'>
                      {editingEmployee ? 'Employee ID' : 'Employee ID'}
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
                        {/* TODO: Populate from API */}
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                        <SelectItem value='Add Department'>Add Department</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className='text-destructive text-xs mt-1'>{errors.department}</p>
                    )}
                    
                    {/* Custom Department Input */}
                    {showCustomDepartmentInput && (
                      <div className='p-3 bg-blue-50 rounded-lg space-y-2 mt-2 w-full'>
                        <Label className='text-xs font-medium text-blue-800'>
                          Add New Department
                        </Label>
                        <div className='flex gap-2'>
                          <Input
                            placeholder='Enter department name'
                            value={customDepartment}
                            onChange={(e) => {
                              setCustomDepartment(e.target.value);
                              if (errors.customDepartment) {
                                setErrors((prev) => ({ ...prev, customDepartment: '' }));
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddDepartment();
                              }
                            }}
                            className='flex-1 min-w-[200px] h-8 px-3 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                          />
                          <Button
                            type='button'
                            onClick={handleAddDepartment}
                            variant='default'
                            size='sm'
                            className='h-8 px-3'
                          >
                            Add
                          </Button>
                          <Button
                            type='button'
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowCustomDepartmentInput(false);
                              setCustomDepartment('');
                              setFormData(prev => ({ ...prev, department: '' }));
                              setErrors((prev) => ({ ...prev, customDepartment: '' }));
                            }}
                            variant='outline'
                            size='sm'
                            className='h-8 px-3 relative z-10'
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

                  <div className='space-y-1'>
                    <Label htmlFor='position' className='text-xs font-medium'>
                      Position/Job Title
                    </Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => handleSelectChange('position', value)}
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder='Select position' />
                      </SelectTrigger>
                      <SelectContent>
                        {/* TODO: Populate from API */}
                        {positions.map((position) => (
                          <SelectItem key={position} value={position} className='text-left'>
                            {position}
                          </SelectItem>
                        ))}
                        <SelectItem value='Add Position'>Add Position</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.position && (
                      <p className='text-destructive text-xs mt-1'>{errors.position}</p>
                    )}
                    
                    {/* Custom Position Input */}
                    {showCustomPositionInput && (
                      <div className='p-3 bg-blue-50 rounded-lg space-y-2 mt-2 w-full'>
                        <Label className='text-xs font-medium text-blue-800'>
                          Add New Position
                        </Label>
                        <div className='flex gap-2'>
                          <Input
                            placeholder='Enter position name'
                            value={customPosition}
                            onChange={(e) => {
                              setCustomPosition(e.target.value);
                              if (errors.customPosition) {
                                setErrors((prev) => ({ ...prev, customPosition: '' }));
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddPosition();
                              }
                            }}
                            className='flex-1 min-w-[200px] h-8 px-3 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                          />
                          <Button
                            type='button'
                            onClick={handleAddPosition}
                            variant='default'
                            size='sm'
                            className='h-8 px-3'
                          >
                            Add
                          </Button>
                          <Button
                            type='button'
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowCustomPositionInput(false);
                              setCustomPosition('');
                              setFormData(prev => ({ ...prev, position: '' }));
                              setErrors((prev) => ({ ...prev, customPosition: '' }));
                            }}
                            variant='outline'
                            size='sm'
                            className='h-8 px-3 relative z-10'
                          >
                            <X className='w-3 h-3' />
                          </Button>
                        </div>
                        {errors.customPosition && (
                          <p className='text-destructive text-xs mt-1'>{errors.customPosition}</p>
                        )}
                      </div>
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

                  {editingEmployee && (
                    <div className='space-y-1'>
                      <Label htmlFor='terminated' className='text-xs font-medium'>
                        Terminated
                      </Label>
                      <Select
                        value={formData.terminated}
                        onValueChange={(value) => handleSelectChange('terminated', value)}
                      >
                        <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='no'>No</SelectItem>
                          <SelectItem value='yes'>Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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
                        {/* TODO: Populate from API */}
                        {contractTypes.map((contract) => (
                          <SelectItem key={contract.value} value={contract.value} className='text-left'>
                            {contract.label}
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
