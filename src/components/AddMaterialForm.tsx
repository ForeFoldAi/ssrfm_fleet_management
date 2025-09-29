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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, X } from 'lucide-react';
import { useStock } from '@/contexts/StockContext';
import { materialsApi } from '@/lib/api/materials';
import { Material, MaterialCategory, Unit } from '@/lib/api/types';
import { getMaterialCategories, getUnits, createMaterialCategory, createUnit } from '@/lib/api/common';
import { toast } from '@/hooks/use-toast';

interface AddMaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (materialData: Material) => void;
}

interface ApiMaterial {
  name: string;
  categoryId: number;
  measureUnitId: number;
  makerBrand: string;
  currentStock: number;
  totalValue: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  specifications: string;
  additionalNotes?: string;
}

export const AddMaterialForm = ({
  isOpen,
  onClose,
  onSubmit,
}: AddMaterialFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [materialCategories, setMaterialCategories] = useState<
    MaterialCategory[]
  >([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // New state for custom inputs
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [showCustomUnitInput, setShowCustomUnitInput] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customUnitName, setCustomUnitName] = useState('');
  const [customUnitDescription, setCustomUnitDescription] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    customCategory: '',
    specifications: '',
    measureUnit: '',
    customMeasureUnit: '',
    maker: '',
    supplier: '',
    supplierContact: '',
    currentStock: '',
    totalValue: '',
    minStock: '',
    maxStock: '',
    reorderLevel: '',
    leadTime: '',
    location: '',
    customLocation: '',
    partNumber: '',
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch material categories and units when the form opens
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      try {
        // Fetch material categories
        const categoriesResponse = await getMaterialCategories({ limit: 100 });
        setMaterialCategories(categoriesResponse.data || []);

        // Fetch units
        const unitsResponse = await getUnits({ limit: 100 });
        setUnits(unitsResponse.data || []);
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Dummy data for categories and measure units in case API fails
  const categories = [
    'Mechanical Components',
    'Lubricants',
    'Adhesives & Sealants',
    'Processing Equipment',
    'Electrical',
    'Safety',
    'Raw Materials',
    'Consumables',
    'Spare Parts',
    'Tools',
    'Other',
  ];

  const measureUnits = [
    'pieces',
    'kg',
    'liters',
    'tons',
    'meters',
    'boxes',
    'sets',
    'rolls',
    'bottles',
    'packets',
    'units',
    'gallons',
    'feet',
    'inches',
    'other',
  ];

  const locations = [
    'Parts Storage A-1',
    'Parts Storage A-2',
    'Chemical Storage B-1',
    'Chemical Storage B-2',
    'Equipment Storage C-1',
    'Equipment Storage C-2',
    'Raw Material Storage',
    'Finished Goods Storage',
    'Maintenance Workshop',
    'Production Floor A',
    'Production Floor B',
    'Other',
  ];

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

    // Handle "Other" selection
    if (field === 'category' && value === 'Other') {
      setShowCustomCategoryInput(true);
      setShowCustomUnitInput(false);
    } else if (field === 'measureUnit' && value === 'other') {
      setShowCustomUnitInput(true);
      setShowCustomCategoryInput(false);
    } else {
      setShowCustomCategoryInput(false);
      setShowCustomUnitInput(false);
    }
  };

  // Function to create new material category
  const handleCreateCategory = async () => {
    if (!customCategoryName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a category name.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingCategory(true);
    try {
      const newCategory = await createMaterialCategory({ name: customCategoryName.trim() });
      setMaterialCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, category: newCategory.name }));
      setShowCustomCategoryInput(false);
      setCustomCategoryName('');
      
      toast({
        title: 'Success',
        description: `Category "${newCategory.name}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description: 'Failed to create category. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingCategory(false);
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

    setIsCreatingUnit(true);
    try {
      const newUnit = await createUnit({ 
        name: customUnitName.trim(),
        description: customUnitDescription.trim() || 'Custom unit'
      });
      setUnits(prev => [...prev, newUnit]);
      setFormData(prev => ({ ...prev, measureUnit: newUnit.name }));
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
    } finally {
      setIsCreatingUnit(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.name.trim()) newErrors.name = 'Material name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.category === 'Other' && !formData.customCategory.trim()) {
      newErrors.customCategory = 'Custom category is required';
    }
    if (!formData.specifications.trim())
      newErrors.specifications = 'Specifications are required';
    if (!formData.measureUnit)
      newErrors.measureUnit = 'Measure Unit is required';
    if (
      formData.measureUnit === 'other' &&
      !formData.customMeasureUnit.trim()
    ) {
      newErrors.customMeasureUnit = 'Custom measure unit is required';
    }
    if (!formData.currentStock.trim())
      newErrors.currentStock = 'Current stock is required';
    if (!formData.totalValue.trim())
      newErrors.totalValue = 'Total value is required';

    // Numeric validations
    if (formData.currentStock && isNaN(Number(formData.currentStock))) {
      newErrors.currentStock = 'Current stock must be a number';
    }
    if (formData.totalValue && isNaN(Number(formData.totalValue))) {
      newErrors.totalValue = 'Total value must be a number';
    }
    if (formData.totalValue && Number(formData.totalValue) <= 0) {
      newErrors.totalValue = 'Total value must be greater than 0';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors:', validationErrors);
      setErrors(validationErrors);
      return;
    }

    console.log('Form data being submitted:', formData);
    setIsSubmitting(true);

    try {
      // Prepare API data
      const categoryId =
        materialCategories.find((cat) => cat.name === formData.category)?.id ||
        (formData.category === 'Other' ? 0 : 0);

      const measureUnitId =
        units.find((unit) => unit.name === formData.measureUnit)?.id ||
        (formData.measureUnit === 'other' ? 0 : 0);

      // Log for debugging
      console.log('Selected category:', formData.category, 'ID:', categoryId);
      console.log('Selected unit:', formData.measureUnit, 'ID:', measureUnitId);

      const currentStockNum = Number(formData.currentStock);
      const totalValueNum = Number(formData.totalValue);

      const apiMaterial: ApiMaterial = {
        name: formData.name,
        categoryId: categoryId,
        measureUnitId: measureUnitId,
        makerBrand: formData.maker,
        currentStock: currentStockNum,
        totalValue: totalValueNum,
        minStockLevel: formData.minStock
          ? Number(formData.minStock)
          : undefined,
        maxStockLevel: formData.maxStock
          ? Number(formData.maxStock)
          : undefined,
        specifications: formData.specifications,
        additionalNotes: formData.notes,
      };

      // Call the API
      const response = await materialsApi.create(apiMaterial);

      // Call onSubmit with the response
      onSubmit(response);

      // Reset form
      setFormData({
        name: '',
        category: '',
        customCategory: '',
        specifications: '',
        measureUnit: '',
        customMeasureUnit: '',
        maker: '',
        supplier: '',
        supplierContact: '',
        currentStock: '',
        totalValue: '',
        minStock: '',
        maxStock: '',
        reorderLevel: '',
        leadTime: '',
        location: '',
        customLocation: '',
        partNumber: '',
        description: '',
        notes: '',
      });
      setErrors({});
      setShowCustomCategoryInput(false);
      setShowCustomUnitInput(false);
      setCustomCategoryName('');
      setCustomUnitName('');
      setCustomUnitDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating material:', error);
      // Show more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);

        // Show toast with error message
        toast({
          title: 'Error',
          description: `Failed to create material: ${
            error.response?.data?.message || 'Unknown error'
          }`,
          variant: 'destructive',
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        toast({
          title: 'Network Error',
          description:
            'No response received from server. Please check your connection.',
          variant: 'destructive',
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        toast({
          title: 'Error',
          description: `Request failed: ${error.message}`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: '',
      customCategory: '',
      specifications: '',
      measureUnit: '',
      customMeasureUnit: '',
      maker: '',
      supplier: '',
      supplierContact: '',
      currentStock: '',
      totalValue: '',
      minStock: '',
      maxStock: '',
      reorderLevel: '',
      leadTime: '',
      location: '',
      customLocation: '',
      partNumber: '',
      description: '',
      notes: '',
    });
    setErrors({});
    setShowCustomCategoryInput(false);
    setShowCustomUnitInput(false);
    setCustomCategoryName('');
    setCustomUnitName('');
    setCustomUnitDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='flex flex-row items-center justify-between'>
          <DialogTitle className='text-xl font-semibold'>
            Add New Material
          </DialogTitle>
        
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className='space-y-6 py-4'
        >
          {/* Material Information Section */}
          <div className='space-y-4'>
            {/* First Row */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <Label htmlFor='name' className='text-sm font-medium'>
                  Material Name *
                </Label>
                <Input
                  id='name'
                  placeholder='Enter material name'
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                />
                {errors.name && (
                  <p className='text-destructive text-xs mt-1'>{errors.name}</p>
                )}
              </div>

              <div className='space-y-1'>
                <Label htmlFor='category' className='text-sm font-medium'>
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange('category', value)
                  }
                >
                  <SelectTrigger className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    {materialCategories.length > 0
                      ? [
                          ...materialCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          )),
                          <SelectItem key="other" value="Other">
                            Other
                          </SelectItem>
                        ]
                      : // Fallback to dummy data if API fails
                        [
                          ...categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          )),
                          <SelectItem key="other" value="Other">
                            Other
                          </SelectItem>
                        ]}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            {/* Custom Category Input */}
            {showCustomCategoryInput && (
              <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2'>
                <Label className='text-xs font-medium text-blue-800'>
                  Add New Category
                </Label>
                <div className='flex gap-2'>
                  <Input
                    placeholder='Enter category name'
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    className='h-8 px-2 py-1 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-xs transition-all duration-200'
                  />
                  <Button
                    type='button'
                    onClick={handleCreateCategory}
                    size='sm'
                    className='h-8 px-3 bg-blue-600 hover:bg-blue-700'
                    disabled={isCreatingCategory}
                  >
                    {isCreatingCategory ? (
                      <>
                        <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className='w-3 h-3 mr-1' />
                        Add
                      </>
                    )}
                  </Button>
                  <Button
                    type='button'
                    onClick={() => {
                      setShowCustomCategoryInput(false);
                      setCustomCategoryName('');
                      setFormData(prev => ({ ...prev, category: '' }));
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
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <Label htmlFor='measureUnit' className='text-sm font-medium'>
                  Measure Unit *
                </Label>
                <Select
                  value={formData.measureUnit}
                  onValueChange={(value) =>
                    handleSelectChange('measureUnit', value)
                  }
                >
                  <SelectTrigger className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'>
                    <SelectValue placeholder='Select Measure unit' />
                  </SelectTrigger>
                  <SelectContent>
                    {units.length > 0
                      ? [
                          ...units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.name}>
                              {unit.name}
                            </SelectItem>
                          )),
                          <SelectItem key="other" value="other">
                            Other
                          </SelectItem>
                        ]
                      : // Fallback to dummy data if API fails
                        [
                          ...measureUnits.map((measureUnit) => (
                            <SelectItem key={measureUnit} value={measureUnit}>
                              {measureUnit}
                            </SelectItem>
                          )),
                          <SelectItem key="other" value="other">
                            Other
                          </SelectItem>
                        ]}
                  </SelectContent>
                </Select>
                {errors.measureUnit && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.measureUnit}
                  </p>
                )}
              </div>

              <div className='space-y-1'>
                <Label htmlFor='maker' className='text-sm font-medium'>
                  Maker/Brand
                </Label>
                <Input
                  id='maker'
                  placeholder='Enter maker or brand name'
                  value={formData.maker}
                  onChange={(e) => handleInputChange('maker', e.target.value)}
                  className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                />
                {errors.maker && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.maker}
                  </p>
                )}
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
                      disabled={isCreatingUnit}
                    >
                      {isCreatingUnit ? (
                        <>
                          <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className='w-3 h-3 mr-1' />
                          Add
                        </>
                      )}
                    </Button>
                    <Button
                      type='button'
                      onClick={() => {
                        setShowCustomUnitInput(false);
                        setCustomUnitName('');
                        setCustomUnitDescription('');
                        setFormData(prev => ({ ...prev, measureUnit: '' }));
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

            {/* Third Row - Current Stock and Total Value */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <Label htmlFor='currentStock' className='text-sm font-medium'>
                Current Stock *
              </Label>
              <Input
                id='currentStock'
                type='number'
                placeholder='0'
                value={formData.currentStock}
                onChange={(e) =>
                  handleInputChange('currentStock', e.target.value)
                }
                className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
              />
              {errors.currentStock && (
                <p className='text-destructive text-xs mt-1'>
                  {errors.currentStock}
                </p>
              )}
              </div>

              <div className='space-y-1'>
                <Label htmlFor='totalValue' className='text-sm font-medium'>
                  Total Value (₹) *
                </Label>
                <Input
                  id='totalValue'
                  type='number'
                  step='0.01'
                  placeholder='0.00'
                  value={formData.totalValue}
                  onChange={(e) =>
                    handleInputChange('totalValue', e.target.value)
                  }
                  className='h-9 px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
                />
                {errors.totalValue && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.totalValue}
                  </p>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className='space-y-1'>
              <Label htmlFor='specifications' className='text-sm font-medium'>
                Specifications *
              </Label>
              <Textarea
                id='specifications'
                placeholder='Enter detailed specifications and technical details'
                value={formData.specifications}
                onChange={(e) =>
                  handleInputChange('specifications', e.target.value)
                }
                className='min-h-[80px] px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
              />
              {errors.specifications && (
                <p className='text-destructive text-xs mt-1'>
                  {errors.specifications}
                </p>
              )}
            </div>

            <div className='space-y-1'>
              <Label htmlFor='notes' className='text-sm font-medium'>
                Additional Notes
              </Label>
              <Textarea
                id='notes'
                placeholder='Additional notes and remarks'
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className='min-h-[60px] px-3 py-2 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm transition-all duration-200'
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-2 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting || isLoading}>
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Material
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
