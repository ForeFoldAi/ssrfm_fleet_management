import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  X,
  Calendar,
  MapPin,
  Wrench,
  
  Loader2,
  Plus,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from '../hooks/use-toast';
import { machinesApi } from '../lib/api/machines';
import { Machine, MachineType, Unit } from '../lib/api/types';
import { useRole } from '../contexts/RoleContext';
import { getMachineTypes, getUnits, createMachineType, createUnit } from '@/lib/api/common';

interface AddMachineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (machineData: Machine) => void;
  editingData?: {
    id: number;
    name: string;
    type: string;
    status: string;
    createdDate: string;
    lastMaintenance: string;
    nextMaintenanceDue: string;
    specifications: string;
    unit: string;
    unitName: string;
    branch: string;
  } | null;
}

export const AddMachineForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingData,
}: AddMachineFormProps) => {
  const { currentUser } = useRole();
  const [formData, setFormData] = useState({
    name: '',
    typeId: 0,
    unitId: 0,
    status: 'Active',
    specifications: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpiry: '',
    capacity: '',
    installationDate: '',
    lastService: '',
    nextMaintenanceDue: '',
    additionalNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New state for custom inputs
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [showCustomUnitInput, setShowCustomUnitInput] = useState(false);
  const [customTypeName, setCustomTypeName] = useState('');
  const [customUnitName, setCustomUnitName] = useState('');
  const [customUnitDescription, setCustomUnitDescription] = useState('');

  // Prefill form data when editing
  useEffect(() => {
    if (editingData && isOpen) {
      // Find the typeId and unitId from the fetched data
      const typeId = machineTypes.find(type => type.name === editingData.type)?.id || 0;
      const unitId = units.find(unit => unit.name === editingData.unitName)?.id || 0;
      
      setFormData({
        name: editingData.name,
        typeId: typeId,
        unitId: unitId,
        status: editingData.status,
        specifications: editingData.specifications,
        manufacturer: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        warrantyExpiry: '',
        capacity: '',
        installationDate: '',
        lastService: editingData.lastMaintenance !== 'Not serviced' ? editingData.lastMaintenance : '',
        nextMaintenanceDue: editingData.nextMaintenanceDue !== 'Not scheduled' ? editingData.nextMaintenanceDue : '',
        additionalNotes: '',
      });
    } else if (!editingData && isOpen) {
      // Reset form when adding new machine
      setFormData({
        name: '',
        typeId: 0,
        unitId: 0,
        status: 'Active',
        specifications: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        warrantyExpiry: '',
        capacity: '',
        installationDate: '',
        lastService: '',
        nextMaintenanceDue: '',
        additionalNotes: '',
      });
    }
  }, [editingData, isOpen, machineTypes, units]);

  // Fetch machine types and units on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const typesResponse = await getMachineTypes({
          limit: 100,
        });
        setMachineTypes(typesResponse.data || []);

        const unitsResponse = await getUnits({
          limit: 100,
        });
        setUnits(unitsResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load machine types and units.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const statusOptions = [
    { value: 'Active', label: 'Active', description: 'Machine is operational' },
    {
      value: 'Maintenance',
      label: 'Under Maintenance',
      description: 'Currently being serviced',
    },
    { value: 'Inactive', label: 'Inactive', description: 'Not in use' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Handle "Other" selection
    if (field === 'typeId' && value === 0) {
      setShowCustomTypeInput(true);
      setShowCustomUnitInput(false);
    } else if (field === 'unitId' && value === 0) {
      setShowCustomUnitInput(true);
      setShowCustomTypeInput(false);
    } else {
      setShowCustomTypeInput(false);
      setShowCustomUnitInput(false);
    }
  };

  // Function to create new machine type
  const handleCreateMachineType = async () => {
    if (!customTypeName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a machine type name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating machine type:', customTypeName.trim());
      
      const newType = await createMachineType({ name: customTypeName.trim() });
      
      console.log('Machine type created:', newType);
      
      setMachineTypes(prev => [...prev, newType]);
      setFormData(prev => ({ ...prev, typeId: newType.id }));
      setShowCustomTypeInput(false);
      setCustomTypeName('');
      
      toast({
        title: 'Success',
        description: `Machine type "${newType.name}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating machine type:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      }
      
      toast({
        title: 'Error',
        description: `Failed to create machine type: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Function to create new unit
  const handleCreateUnit = async () => {
    if (!customUnitName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a unit name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newUnit = await createUnit({ 
        name: customUnitName.trim(),
        description: customUnitDescription.trim() || 'Custom unit'
      });
      setUnits(prev => [...prev, newUnit]);
      setFormData(prev => ({ ...prev, unitId: newUnit.id }));
      setShowCustomUnitInput(false);
      setCustomUnitName('');
      setCustomUnitDescription('');
      
      toast({
        title: 'Success',
        description: `Unit "${newUnit.name}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating unit:', error);
      toast({
        title: 'Error',
        description: 'Failed to create unit. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Machine name is required';
    if (!formData.typeId) newErrors.typeId = 'Machine type is required';
    if (!formData.unitId) newErrors.unitId = 'Unit is required';
    if (!formData.specifications.trim())
      newErrors.specifications = 'Specifications are required';
    if (!formData.manufacturer.trim())
      newErrors.manufacturer = 'Manufacturer is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Call the API to create the machine
        const response = await machinesApi.create({
          name: formData.name,
          typeId: Number(formData.typeId),
          unitId: Number(formData.unitId),
          status: formData.status,
          specifications: formData.specifications,
          manufacturer: formData.manufacturer,
          model: formData.model,
          serialNumber: formData.serialNumber,
          capacity: formData.capacity,
          purchaseDate: formData.purchaseDate
            ? new Date(formData.purchaseDate).toISOString()
            : undefined,
          warrantyExpiry: formData.warrantyExpiry
            ? new Date(formData.warrantyExpiry).toISOString()
            : undefined,
          installationDate: formData.installationDate
            ? new Date(formData.installationDate).toISOString()
            : undefined,
          lastService: formData.lastService
            ? new Date(formData.lastService).toISOString()
            : undefined,
          nextMaintenanceDue: formData.nextMaintenanceDue
            ? new Date(formData.nextMaintenanceDue).toISOString()
            : undefined,
          additionalNotes: formData.additionalNotes,
        });

        // Call the onSubmit callback with the created machine
        onSubmit(response);

        toast({
          title: 'Machine Added Successfully',
          description: `${formData.name} has been added to the inventory.`,
        });

        // Reset form
        setFormData({
          name: '',
          typeId: 0,
          unitId: 0,
          status: 'Active',
          specifications: '',
          manufacturer: '',
          model: '',
          serialNumber: '',
          purchaseDate: '',
          warrantyExpiry: '',
          capacity: '',
          installationDate: '',
          lastService: '',
          nextMaintenanceDue: '',
          additionalNotes: '',
        });
        setErrors({});
        setShowCustomTypeInput(false);
        setShowCustomUnitInput(false);
        setCustomTypeName('');
        setCustomUnitName('');
        setCustomUnitDescription('');
        onClose();
      } catch (error) {
        console.error('Error creating machine:', error);
        toast({
          title: 'Error',
          description: 'Failed to create machine. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
              {editingData ? <Settings className='w-4 h-4 text-primary' /> : <Plus className='w-4 h-4 text-primary' />}
            </div>
            {editingData ? 'Edit Machine Details' : 'Add New Machine'}
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
                    <Label htmlFor='name' className='text-xs font-medium'>
                      Machine Name *
                    </Label>
                    <Input
                      id='name'
                      placeholder='e.g., Main Flour Mill #01'
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                    {errors.name && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='type' className='text-xs font-medium'>
                      Machine Type *
                    </Label>
                    <Select
                      value={formData.typeId > 0 ? formData.typeId.toString() : ''}
                      onValueChange={(value) =>
                        handleSelectChange('typeId', parseInt(value))
                      }
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder='Select machine type' />
                      </SelectTrigger>
                      <SelectContent>
                        {machineTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                        <SelectItem key="other" value="0">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.typeId && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.typeId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Custom Machine Type Input */}
                {showCustomTypeInput && (
                  <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2'>
                    <Label className='text-xs font-medium text-blue-800'>
                      Add New Machine Type
                    </Label>
                    <div className='flex gap-2'>
                      <Input
                        placeholder='Enter Issue For'
                        value={customTypeName}
                        onChange={(e) => setCustomTypeName(e.target.value)}
                        className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                      />
                      <Button
                        type='button'
                        onClick={handleCreateMachineType}
                        size='sm'
                        className='h-8 px-3 bg-blue-600 hover:bg-blue-700'
                      >
                        <Plus className='w-3 h-3 mr-1' />
                        Add
                      </Button>
                      <Button
                        type='button'
                        onClick={() => {
                          setShowCustomTypeInput(false);
                          setCustomTypeName('');
                          setFormData(prev => ({ ...prev, typeId: 0 }));
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

                {/* Second Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='unit' className='text-xs font-medium'>
                      Unit *
                    </Label>
                    <Select
                      value={formData.unitId > 0 ? formData.unitId.toString() : ''}
                      onValueChange={(value) =>
                        handleSelectChange('unitId', parseInt(value))
                      }
                    >
                      <SelectTrigger className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'>
                        <SelectValue placeholder='Select Unit' />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.name}
                          </SelectItem>
                        ))}
                        <SelectItem key="other" value="0">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.unitId && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.unitId}
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

                {/* Custom Unit Input */}
                {showCustomUnitInput && (
                  <div className='p-3 bg-green-50 border border-green-200 rounded-lg space-y-2'>
                    <Label className='text-xs font-medium text-green-800'>
                      Add New Unit
                    </Label>
                    <div className='space-y-2'>
                      <Input
                        placeholder='Enter unit name'
                        value={customUnitName}
                        onChange={(e) => setCustomUnitName(e.target.value)}
                        className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                      />
                      <Input
                        placeholder='Enter unit description (optional)'
                        value={customUnitDescription}
                        onChange={(e) => setCustomUnitDescription(e.target.value)}
                        className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                      />
                      <div className='flex gap-2'>
                        <Button
                          type='button'
                          onClick={handleCreateUnit}
                          size='sm'
                          className='h-8 px-3 bg-green-600 hover:bg-green-700'
                        >
                          <Plus className='w-3 h-3 mr-1' />
                          Add
                        </Button>
                        <Button
                          type='button'
                          onClick={() => {
                            setShowCustomUnitInput(false);
                            setCustomUnitName('');
                            setCustomUnitDescription('');
                            setFormData(prev => ({ ...prev, unitId: 0 }));
                          }}
                          variant='outline'
                          size='sm'
                          className='h-8 px-3'
                        >
                          <X className='w-3 h-3' />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Specifications */}
                <div className='space-y-1'>
                  <Label
                    htmlFor='specifications'
                    className='text-xs font-medium'
                  >
                    Specifications *
                  </Label>
                  <Textarea
                    id='specifications'
                    placeholder='Enter detailed specifications (capacity, dimensions, technical details, etc.)'
                    value={formData.specifications}
                    onChange={(e) =>
                      handleInputChange('specifications', e.target.value)
                    }
                    className='min-h-[40px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200'
                  />
                  {errors.specifications && (
                    <p className='text-destructive text-xs mt-1'>
                      {errors.specifications}
                    </p>
                  )}
                </div>
              </div>

              {/* Manufacturing Details */}
              <div className='space-y-3'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                  Manufacturing Details
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                  <div className='space-y-1'>
                    <Label
                      htmlFor='manufacturer'
                      className='text-xs font-medium'
                    >
                      Manufacturer *
                    </Label>
                    <Input
                      id='manufacturer'
                      placeholder='e.g., Bosch, Siemens, etc.'
                      value={formData.manufacturer}
                      onChange={(e) =>
                        handleInputChange('manufacturer', e.target.value)
                      }
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                    {errors.manufacturer && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.manufacturer}
                      </p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='model' className='text-xs font-medium'>
                      Model
                    </Label>
                    <Input
                      id='model'
                      placeholder='Model number'
                      value={formData.model}
                      onChange={(e) =>
                        handleInputChange('model', e.target.value)
                      }
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label
                      htmlFor='serialNumber'
                      className='text-xs font-medium'
                    >
                      Serial Number
                    </Label>
                    <Input
                      id='serialNumber'
                      placeholder='Serial number'
                      value={formData.serialNumber}
                      onChange={(e) =>
                        handleInputChange('serialNumber', e.target.value)
                      }
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='capacity' className='text-xs font-medium'>
                      Capacity
                    </Label>
                    <Input
                      id='capacity'
                      placeholder='e.g., 500kg/hour'
                      value={formData.capacity}
                      onChange={(e) =>
                        handleInputChange('capacity', e.target.value)
                      }
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
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
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        handleInputChange('purchaseDate', e.target.value)
                      }
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label
                      htmlFor='warrantyExpiry'
                      className='text-xs font-medium'
                    >
                      Warranty Expiry
                    </Label>
                    <Input
                      id='warrantyExpiry'
                      type='date'
                      value={formData.warrantyExpiry}
                      onChange={(e) =>
                        handleInputChange('warrantyExpiry', e.target.value)
                      }
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label
                      htmlFor='installationDate'
                      className='text-xs font-medium'
                    >
                      Installation Date
                    </Label>
                    <Input
                      id='installationDate'
                      type='date'
                      value={formData.installationDate}
                      onChange={(e) =>
                        handleInputChange('installationDate', e.target.value)
                      }
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Information */}
              <div className='space-y-3'>
                <h4 className='text-xs font-medium text-muted-foreground border-b pb-1'>
                  Maintenance Information
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label
                      htmlFor='lastService'
                      className='text-xs font-medium'
                    >
                      Last Service
                    </Label>
                    <Input
                      id='lastService'
                      type='date'
                      value={formData.lastService}
                      onChange={(e) =>
                        handleInputChange('lastService', e.target.value)
                      }
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label
                      htmlFor='nextMaintenanceDue'
                      className='text-xs font-medium'
                    >
                      Next Maintenance Due
                    </Label>
                    <Input
                      id='nextMaintenanceDue'
                      type='date'
                      value={formData.nextMaintenanceDue}
                      onChange={(e) =>
                        handleInputChange('nextMaintenanceDue', e.target.value)
                      }
                      className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                    />
                  </div>
                </div>

                <div className='space-y-1'>
                  <Label
                    htmlFor='additionalNotes'
                    className='text-xs font-medium'
                  >
                    Additional Notes
                  </Label>
                  <Textarea
                    id='additionalNotes'
                    placeholder='Any additional information about the machine'
                    value={formData.additionalNotes}
                    onChange={(e) =>
                      handleInputChange('additionalNotes', e.target.value)
                    }
                    className='min-h-[40px] px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs resize-none transition-all duration-200'
                  />
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
            >
              <X className='w-3 h-3 mr-1' />
              Cancel
            </Button>
            <Button
              type='submit'
              className='h-8 px-4 bg-primary hover:bg-primary/90'
              disabled={isSubmitting || isLoading}
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
