import { useState, useEffect } from 'react';
import {
  Truck,
  Save,
  X,
  Loader2,
  Plus,
} from 'lucide-react';

// Date utility functions for DD-MM-YYYY format
const formatDateToString = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const stringToDateInputFormat = (dateString: string): string => {
  if (!dateString) return '';
  
  // Handle DD-MM-YYYY format
  if (dateString.includes('-') && dateString.length === 10) {
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
  }
  
  // If already in YYYY-MM-DD format, return as is
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  return '';
};

const dateInputFormatToString = (inputDate: string): string => {
  if (!inputDate) return '';
  
  // Convert YYYY-MM-DD to DD-MM-YYYY
  if (inputDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = inputDate.split('-');
    return `${day}-${month}-${year}`;
  }
  
  return inputDate;
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

export interface VehicleOnboardingData {
  id?: string;
  vehicleRegistrationNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleType: string;
  vehicleYear: string;
  engineNumber: string;
  chassisNumber: string;
  fuelType: string;
  loadCapacity: string;
  purchaseDate: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  additionalNotes: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt?: string;
  updatedAt?: string;
}

interface VehicleOnboardingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleData: VehicleOnboardingData) => void;
  editingVehicle?: VehicleOnboardingData | null;
}

export const VehicleOnboardingForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingVehicle,
}: VehicleOnboardingFormProps) => {
  const { currentUser } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // New state for custom vehicle type input
  const [showCustomVehicleTypeInput, setShowCustomVehicleTypeInput] = useState(false);
  const [customVehicleTypeName, setCustomVehicleTypeName] = useState('');

  const [formData, setFormData] = useState<VehicleOnboardingData>({
    vehicleRegistrationNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleType: '',
    vehicleYear: '',
    engineNumber: '',
    chassisNumber: '',
    fuelType: '',
    loadCapacity: '',
    purchaseDate: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiryDate: '',
    additionalNotes: '',
    status: 'active',
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (editingVehicle && isOpen) {
      setFormData(editingVehicle);
    } else if (!editingVehicle && isOpen) {
      // Reset form for new vehicle
      setFormData({
        vehicleRegistrationNumber: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleType: '',
        vehicleYear: '',
        engineNumber: '',
        chassisNumber: '',
        fuelType: '',
        loadCapacity: '',
        purchaseDate: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceExpiryDate: '',
        additionalNotes: '',
        status: 'active',
      });
      setShowCustomVehicleTypeInput(false);
      setCustomVehicleTypeName('');
    }
  }, [editingVehicle, isOpen]);

  const handleInputChange = (field: keyof VehicleOnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleVehicleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, vehicleType: value }));
    if (errors.vehicleType) {
      setErrors((prev) => ({ ...prev, vehicleType: '' }));
    }

    // Handle "Other" selection for vehicle type
    if (value === 'other') {
      setShowCustomVehicleTypeInput(true);
    } else {
      setShowCustomVehicleTypeInput(false);
    }
  };

  // Function to create new vehicle type
  const handleCreateVehicleType = async () => {
    if (!customVehicleTypeName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a vehicle type name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // For now, we'll just set the custom vehicle type name directly
      // In a real implementation, you might want to save this to a backend
      setFormData((prev) => ({ ...prev, vehicleType: customVehicleTypeName.trim() }));
      setShowCustomVehicleTypeInput(false);
      setCustomVehicleTypeName('');

      toast({
        title: 'Success',
        description: `Vehicle type "${customVehicleTypeName.trim()}" has been added.`,
      });
    } catch (error) {
      console.error('Error creating vehicle type:', error);
      toast({
        title: 'Error',
        description: 'Failed to add vehicle type. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    // Only validate mandatory fields
    if (!formData.vehicleRegistrationNumber.trim()) {
      newErrors.vehicleRegistrationNumber = 'Vehicle registration number is required';
      hasErrors = true;
    }

    if (!formData.vehicleMake.trim()) {
      newErrors.vehicleMake = 'Vehicle make is required';
      hasErrors = true;
    }

    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = 'Vehicle model is required';
      hasErrors = true;
    }

    if (!formData.vehicleType.trim()) {
      newErrors.vehicleType = 'Vehicle type is required';
      hasErrors = true;
    }

    if (!formData.fuelType.trim()) {
      newErrors.fuelType = 'Fuel type is required';
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
        title: '✅ Vehicle Onboarded Successfully!',
        description: `Vehicle ${formData.vehicleRegistrationNumber} has been successfully onboarded to the fleet.`,
        variant: 'default',
      });

      // Reset form
      setFormData({
        vehicleRegistrationNumber: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleType: '',
        vehicleYear: '',
        engineNumber: '',
        chassisNumber: '',
        fuelType: '',
        loadCapacity: '',
        purchaseDate: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceExpiryDate: '',
        additionalNotes: '',
        status: 'active',
      });

      setErrors({});
      setShowCustomVehicleTypeInput(false);
      setCustomVehicleTypeName('');
      onClose();
    } catch (error) {
      console.error('Error onboarding vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to onboard vehicle. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Active', description: 'Vehicle is operational' },
    { value: 'inactive', label: 'Inactive', description: 'Not in use' },
    { value: 'maintenance', label: 'Under Maintenance', description: 'Currently being serviced' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
              {editingVehicle ? <Truck className='w-4 h-4 text-primary' /> : <Plus className='w-4 h-4 text-primary' />}
            </div>
            {editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Single Card for all form content */}
          <Card className='border-0 shadow-sm'>
            <CardContent className='space-y-4'>
              {/* Vehicle Information */}
              <div className='space-y-3'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                  Vehicle Information
                </h4>

                {/* First Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='vehicleRegistrationNumber' className='text-xs font-medium'>
                      Registration Number *
                    </Label>
                  <Input
                    id='vehicleRegistrationNumber'
                      placeholder='e.g., MH-12-AB-1234'
                    value={formData.vehicleRegistrationNumber}
                    onChange={(e) => handleInputChange('vehicleRegistrationNumber', e.target.value.toUpperCase())}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                  />
                  {errors.vehicleRegistrationNumber && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.vehicleRegistrationNumber}
                      </p>
                  )}
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='vehicleMake' className='text-xs font-medium'>
                      Make *
                    </Label>
                  <Input
                    id='vehicleMake'
                      placeholder='e.g., Tata, Ashok Leyland'
                    value={formData.vehicleMake}
                    onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                  />
                  {errors.vehicleMake && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.vehicleMake}
                      </p>
                  )}
                  </div>
                </div>

                {/* Second Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='vehicleModel' className='text-xs font-medium'>
                      Model *
                    </Label>
                  <Input
                    id='vehicleModel'
                      placeholder='e.g., Ace, 407'
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                  />
                  {errors.vehicleModel && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.vehicleModel}
                      </p>
                  )}
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='vehicleType' className='text-xs font-medium'>
                      Vehicle Type *
                    </Label>
                  <Select
                    value={formData.vehicleType}
                    onValueChange={handleVehicleTypeChange}
                  >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                      <SelectValue placeholder='Select vehicle type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='truck'>Truck</SelectItem>
                      <SelectItem value='lorry'>Lorry</SelectItem>
                      <SelectItem value='container'>Container</SelectItem>
                      <SelectItem value='trailer'>Trailer</SelectItem>
                      <SelectItem value='tanker'>Tanker</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.vehicleType && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.vehicleType}
                      </p>
                  )}
                </div>
                </div>

                {/* Custom Vehicle Type Input */}
                {showCustomVehicleTypeInput && (
                  <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2'>
                    <Label className='text-xs font-medium text-blue-800'>
                      Add New Vehicle Type
                    </Label>
                    <div className='flex gap-2'>
                      <Input
                        placeholder='Enter vehicle type name'
                        value={customVehicleTypeName}
                        onChange={(e) => setCustomVehicleTypeName(e.target.value)}
                        className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                      />
                      <Button
                        type='button'
                        onClick={handleCreateVehicleType}
                        size='sm'
                        className='h-8 px-3 bg-blue-600 hover:bg-blue-700'
                      >
                        <Plus className='w-3 h-3 mr-1' />
                        Add
                      </Button>
                      <Button
                        type='button'
                        onClick={() => {
                          setShowCustomVehicleTypeInput(false);
                          setCustomVehicleTypeName('');
                          setFormData(prev => ({ ...prev, vehicleType: '' }));
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
                    <Label htmlFor='fuelType' className='text-xs font-medium'>
                      Fuel Type *
                    </Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(value) => handleInputChange('fuelType', value)}
                  >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                      <SelectValue placeholder='Select fuel type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='diesel'>Diesel</SelectItem>
                      <SelectItem value='petrol'>Petrol</SelectItem>
                      <SelectItem value='cng'>CNG</SelectItem>
                      <SelectItem value='electric'>Electric</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.fuelType && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.fuelType}
                      </p>
                  )}
                </div>

                  <div className='space-y-1'>
                    <Label className='text-xs font-medium'>Status</Label>
                    <div className='flex gap-1'>
                      {statusOptions.map((status) => (
                        <button
                          key={status.value}
                          type='button'
                          onClick={() =>
                            handleInputChange('status', status.value)
                          }
                          className={`h-7 px-2 py-1 rounded-[5px] border text-left transition-all duration-200 text-xs font-medium ${
                            formData.status === status.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-input bg-background hover:border-primary/50 hover:bg-muted/30'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                </div>

              {/* Vehicle Specifications */}
              <div className='space-y-3'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                  Vehicle Specifications
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                  <div className='space-y-1'>
                    <Label
                      htmlFor='vehicleYear'
                      className='text-xs font-medium'
                    >
                      Year
                    </Label>
                  <Input
                      id='vehicleYear'
                      type='number'
                      placeholder='e.g., 2023'
                      value={formData.vehicleYear}
                      onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                      min='1900'
                      max='2030'
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                  />
                </div>

                  <div className='space-y-1'>
                    <Label htmlFor='engineNumber' className='text-xs font-medium'>
                      Engine Number
                    </Label>
                  <Input
                    id='engineNumber'
                      placeholder='Engine number'
                    value={formData.engineNumber}
                    onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                  />
                </div>

                  <div className='space-y-1'>
                    <Label
                      htmlFor='chassisNumber'
                      className='text-xs font-medium'
                    >
                      Chassis Number
                    </Label>
                  <Input
                    id='chassisNumber'
                      placeholder='Chassis number'
                    value={formData.chassisNumber}
                    onChange={(e) => handleInputChange('chassisNumber', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='loadCapacity' className='text-xs font-medium'>
                      Load Capacity (kg)
                    </Label>
                    <Input
                      id='loadCapacity'
                      type='number'
                      placeholder='e.g., 10000'
                      value={formData.loadCapacity}
                      onChange={(e) => handleInputChange('loadCapacity', e.target.value)}
                      min='0'
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label
                      htmlFor='purchaseDate'
                      className='text-xs font-medium'
                    >
                      Purchase Date
                    </Label>
                  <Input
                    id='purchaseDate'
                    type='date'
                    value={stringToDateInputFormat(formData.purchaseDate)}
                    onChange={(e) => handleInputChange('purchaseDate', dateInputFormatToString(e.target.value))}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                  />
                  </div>
                </div>
              </div>

          {/* Insurance Information */}
              <div className='space-y-3'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                Insurance Information
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                  <div className='space-y-1'>
                    <Label
                      htmlFor='insuranceProvider'
                      className='text-xs font-medium'
                    >
                      Insurance Provider
                    </Label>
                  <Input
                    id='insuranceProvider'
                      placeholder='e.g., ICICI Lombard, Bajaj Allianz'
                    value={formData.insuranceProvider}
                    onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                  />
                </div>

                  <div className='space-y-1'>
                    <Label
                      htmlFor='insurancePolicyNumber'
                      className='text-xs font-medium'
                    >
                      Policy Number
                    </Label>
                  <Input
                    id='insurancePolicyNumber'
                      placeholder='Policy number'
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                  />
                </div>

                  <div className='space-y-1'>
                    <Label
                      htmlFor='insuranceExpiryDate'
                      className='text-xs font-medium'
                    >
                      Expiry Date
                    </Label>
                  <Input
                    id='insuranceExpiryDate'
                    type='date'
                    value={stringToDateInputFormat(formData.insuranceExpiryDate)}
                    onChange={(e) => handleInputChange('insuranceExpiryDate', dateInputFormatToString(e.target.value))}
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>
                </div>
              </div>

          {/* Additional Information */}
              <div className='space-y-3'>
                

                <div className='space-y-1'>
                  <Label
                    htmlFor='additionalNotes'
                    className='text-xs font-medium'
                  >
                    Additional Notes
                  </Label>
                <Textarea
                  id='additionalNotes'
                    placeholder='Any additional information about the vehicle...'
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    className='min-h-[40px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200'
                />
              </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label className='text-xs font-medium'>Onboarded By</Label>
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
