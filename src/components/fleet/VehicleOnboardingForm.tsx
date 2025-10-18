import { useState, useEffect } from 'react';
import {
  Truck,
  Save,
  X,
  User,
  Calendar,
  FileText,
  Upload,
  Loader2,
  Building2,
  CreditCard,
  Shield,
  MapPin,
  Phone,
  Mail,
  IdCard,
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
  mileage: string;
  color: string;
  purchaseDate: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  documents: File[];
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
    mileage: '',
    color: '',
    purchaseDate: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiryDate: '',
    documents: [],
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
        mileage: '',
        color: '',
        purchaseDate: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceExpiryDate: '',
        documents: [],
        additionalNotes: '',
        status: 'active',
      });
    }
  }, [editingVehicle, isOpen]);

  const handleInputChange = (field: keyof VehicleOnboardingData, value: string | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    // Vehicle Information Validation
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

    if (!formData.vehicleYear.trim()) {
      newErrors.vehicleYear = 'Vehicle year is required';
      hasErrors = true;
    }

    if (!formData.engineNumber.trim()) {
      newErrors.engineNumber = 'Engine number is required';
      hasErrors = true;
    }

    if (!formData.chassisNumber.trim()) {
      newErrors.chassisNumber = 'Chassis number is required';
      hasErrors = true;
    }

    if (!formData.fuelType.trim()) {
      newErrors.fuelType = 'Fuel type is required';
      hasErrors = true;
    }

    if (!formData.loadCapacity.trim()) {
      newErrors.loadCapacity = 'Load capacity is required';
      hasErrors = true;
    }

    // Insurance Information Validation
    if (!formData.insuranceProvider.trim()) {
      newErrors.insuranceProvider = 'Insurance provider is required';
      hasErrors = true;
    }

    if (!formData.insurancePolicyNumber.trim()) {
      newErrors.insurancePolicyNumber = 'Insurance policy number is required';
      hasErrors = true;
    }

    if (!formData.insuranceExpiryDate.trim()) {
      newErrors.insuranceExpiryDate = 'Insurance expiry date is required';
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
        mileage: '',
        color: '',
        purchaseDate: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceExpiryDate: '',
        documents: [],
        additionalNotes: '',
        status: 'active',
      });

      setErrors({});
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleInputChange('documents', [...formData.documents, ...files]);
  };

  const removeDocument = (index: number) => {
    const newDocuments = formData.documents.filter((_, i) => i !== index);
    handleInputChange('documents', newDocuments);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-[95vw] max-h-[90vh] overflow-y-auto p-6'>
        <DialogHeader className='pb-4'>
          <DialogTitle className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center'>
              <Truck className='w-4 h-4 text-primary' />
            </div>
            <div>
              <div className='text-lg font-bold'>
                {editingVehicle ? 'EDIT VEHICLE DETAILS' : 'VEHICLE ONBOARDING FORM'}
              </div>
              <div className='text-sm text-muted-foreground'>
                {editingVehicle ? 'Update vehicle information' : 'Add new vehicle to fleet'}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Truck className='w-5 h-5' />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='vehicleRegistrationNumber'>Registration Number *</Label>
                  <Input
                    id='vehicleRegistrationNumber'
                    value={formData.vehicleRegistrationNumber}
                    onChange={(e) => handleInputChange('vehicleRegistrationNumber', e.target.value.toUpperCase())}
                    placeholder='e.g., MH-12-AB-1234'
                    className={errors.vehicleRegistrationNumber ? 'border-red-500' : ''}
                  />
                  {errors.vehicleRegistrationNumber && (
                    <p className='text-sm text-red-500'>{errors.vehicleRegistrationNumber}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='vehicleMake'>Make *</Label>
                  <Input
                    id='vehicleMake'
                    value={formData.vehicleMake}
                    onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                    placeholder='e.g., Tata, Ashok Leyland'
                    className={errors.vehicleMake ? 'border-red-500' : ''}
                  />
                  {errors.vehicleMake && (
                    <p className='text-sm text-red-500'>{errors.vehicleMake}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='vehicleModel'>Model *</Label>
                  <Input
                    id='vehicleModel'
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                    placeholder='e.g., Ace, 407'
                    className={errors.vehicleModel ? 'border-red-500' : ''}
                  />
                  {errors.vehicleModel && (
                    <p className='text-sm text-red-500'>{errors.vehicleModel}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='vehicleType'>Vehicle Type *</Label>
                  <Select
                    value={formData.vehicleType}
                    onValueChange={(value) => handleInputChange('vehicleType', value)}
                  >
                    <SelectTrigger className={errors.vehicleType ? 'border-red-500' : ''}>
                      <SelectValue placeholder='Select vehicle type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='truck'>Truck</SelectItem>
                      <SelectItem value='lorry'>Lorry</SelectItem>
                      <SelectItem value='container'>Container</SelectItem>
                      <SelectItem value='trailer'>Trailer</SelectItem>
                      <SelectItem value='tanker'>Tanker</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.vehicleType && (
                    <p className='text-sm text-red-500'>{errors.vehicleType}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='vehicleYear'>Year *</Label>
                  <Input
                    id='vehicleYear'
                    type='number'
                    value={formData.vehicleYear}
                    onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                    placeholder='e.g., 2023'
                    min='1900'
                    max='2030'
                    className={errors.vehicleYear ? 'border-red-500' : ''}
                  />
                  {errors.vehicleYear && (
                    <p className='text-sm text-red-500'>{errors.vehicleYear}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='fuelType'>Fuel Type *</Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(value) => handleInputChange('fuelType', value)}
                  >
                    <SelectTrigger className={errors.fuelType ? 'border-red-500' : ''}>
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
                    <p className='text-sm text-red-500'>{errors.fuelType}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='loadCapacity'>Load Capacity (kg) *</Label>
                  <Input
                    id='loadCapacity'
                    type='number'
                    value={formData.loadCapacity}
                    onChange={(e) => handleInputChange('loadCapacity', e.target.value)}
                    placeholder='e.g., 10000'
                    min='0'
                    className={errors.loadCapacity ? 'border-red-500' : ''}
                  />
                  {errors.loadCapacity && (
                    <p className='text-sm text-red-500'>{errors.loadCapacity}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='mileage'>Mileage (km/l)</Label>
                  <Input
                    id='mileage'
                    type='number'
                    value={formData.mileage}
                    onChange={(e) => handleInputChange('mileage', e.target.value)}
                    placeholder='e.g., 8.5'
                    min='0'
                    step='0.1'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='color'>Color</Label>
                  <Input
                    id='color'
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder='e.g., White, Blue'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='engineNumber'>Engine Number *</Label>
                  <Input
                    id='engineNumber'
                    value={formData.engineNumber}
                    onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                    placeholder='Engine number'
                    className={errors.engineNumber ? 'border-red-500' : ''}
                  />
                  {errors.engineNumber && (
                    <p className='text-sm text-red-500'>{errors.engineNumber}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='chassisNumber'>Chassis Number *</Label>
                  <Input
                    id='chassisNumber'
                    value={formData.chassisNumber}
                    onChange={(e) => handleInputChange('chassisNumber', e.target.value)}
                    placeholder='Chassis number'
                    className={errors.chassisNumber ? 'border-red-500' : ''}
                  />
                  {errors.chassisNumber && (
                    <p className='text-sm text-red-500'>{errors.chassisNumber}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='purchaseDate'>Purchase Date</Label>
                  <Input
                    id='purchaseDate'
                    type='date'
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Shield className='w-5 h-5' />
                Insurance Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='insuranceProvider'>Insurance Provider *</Label>
                  <Input
                    id='insuranceProvider'
                    value={formData.insuranceProvider}
                    onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                    placeholder='e.g., ICICI Lombard, Bajaj Allianz'
                    className={errors.insuranceProvider ? 'border-red-500' : ''}
                  />
                  {errors.insuranceProvider && (
                    <p className='text-sm text-red-500'>{errors.insuranceProvider}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='insurancePolicyNumber'>Policy Number *</Label>
                  <Input
                    id='insurancePolicyNumber'
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                    placeholder='Policy number'
                    className={errors.insurancePolicyNumber ? 'border-red-500' : ''}
                  />
                  {errors.insurancePolicyNumber && (
                    <p className='text-sm text-red-500'>{errors.insurancePolicyNumber}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='insuranceExpiryDate'>Expiry Date *</Label>
                  <Input
                    id='insuranceExpiryDate'
                    type='date'
                    value={formData.insuranceExpiryDate}
                    onChange={(e) => handleInputChange('insuranceExpiryDate', e.target.value)}
                    className={errors.insuranceExpiryDate ? 'border-red-500' : ''}
                  />
                  {errors.insuranceExpiryDate && (
                    <p className='text-sm text-red-500'>{errors.insuranceExpiryDate}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Documents Upload */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <FileText className='w-5 h-5' />
                Documents Upload
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='documents'>Upload Documents</Label>
                <Input
                  id='documents'
                  type='file'
                  multiple
                  accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                  onChange={handleFileUpload}
                  className='cursor-pointer'
                />
                <p className='text-sm text-muted-foreground'>
                  Upload vehicle documents like RC, Insurance, PUC, etc.
                </p>
              </div>

              {formData.documents.length > 0 && (
                <div className='space-y-2'>
                  <Label>Uploaded Documents</Label>
                  <div className='space-y-2'>
                    {formData.documents.map((file, index) => (
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
                          onClick={() => removeDocument(index)}
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
                <Label htmlFor='additionalNotes'>Additional Notes</Label>
                <Textarea
                  id='additionalNotes'
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder='Any additional information about the vehicle or driver...'
                  rows={4}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label>Onboarded By</Label>
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
                  <Label htmlFor='status'>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive' | 'maintenance') => 
                      handleInputChange('status', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='inactive'>Inactive</SelectItem>
                      <SelectItem value='maintenance'>Under Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {editingVehicle ? 'Updating...' : 'Onboarding...'}
                </>
              ) : (
                <>
                  <Save className='w-4 h-4' />
                  {editingVehicle ? 'Update Vehicle' : 'Onboard Vehicle'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
