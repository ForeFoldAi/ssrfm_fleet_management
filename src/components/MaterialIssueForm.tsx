import logo from '/logo.png';
import { useState, useEffect, useRef } from 'react';
import {
  Package,
  Save,
  X,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Building2,
  Trash2,
  Plus,
  Edit,
  Loader2,
  Upload,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from '../hooks/use-toast';
import { useRole } from '../contexts/RoleContext';
import { Material, MaterialIssue, Machine } from '../lib/api/types';
import { materialsApi } from '../lib/api/materials';
import { materialIssuesApi } from '../lib/api/material-issues';
import { machinesApi } from '../lib/api/machines';

interface MaterialIssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issueData: MaterialIssue) => void;
  editingIssue?: Record<string, unknown>;
}

interface MaterialItemFormData {
  srNo: number;
  materialId: number;
  nameOfMaterial: string;
  existingStock: number;
  issuedQty: string;
  stockAfterIssue: number;
  measureUnit: string;
  receiverName: string;
  image: File | null;
  imagePreview?: string;
  purpose: string;
  machineId: number;
  machineName: string;
}

export const MaterialIssueForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingIssue,
}: MaterialIssueFormProps) => {
  const { currentUser } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to format date as dd-mm-yyyy
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [formData, setFormData] = useState({
    // Document Information
    date: new Date().toISOString().split('T')[0],
    // Material items (supporting multiple items)
    items: [
      {
        srNo: 1,
        materialId: 0,
        nameOfMaterial: '',
        existingStock: 0,
        issuedQty: '',
        stockAfterIssue: 0,
        measureUnit: '',
        receiverName: '',
        image: null as File | null,
        imagePreview: '',
        purpose: '',
        machineId: 0,
        machineName: '',
      } as MaterialItemFormData,
    ],
    // Additional fields
    additionalNotes: '',
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (editingIssue && isOpen) {
      const issuedDate = String(editingIssue.issuedDate || '');

      // If we have allItems from the API response, use them
      const items = editingIssue.allItems
        ? (editingIssue.allItems as Array<Record<string, unknown>>).map(
            (item, index) =>
              ({
                srNo: index + 1,
                materialId: Number(
                  item.material
                    ? (item.material as Record<string, unknown>).id
                    : 0
                ),
                nameOfMaterial: String(
                  item.material
                    ? (item.material as Record<string, unknown>).name
                    : ''
                ),
                existingStock: Number(item.stockBeforeIssue || 0),
                issuedQty: String(item.issuedQuantity || 0),
                stockAfterIssue: Number(item.stockAfterIssue || 0),
                measureUnit: String(
                  item.material
                    ? (item.material as Record<string, unknown>).makerBrand ||
                        ''
                    : ''
                ),
                receiverName: String(item.receiverName || ''),
                image: null as File | null,
                imagePreview: item.imagePath
                  ? `http://localhost:3000/${String(item.imagePath)}`
                  : '',
                purpose: String(item.purpose || ''),
                machineId: Number(item.machineId || 0),
                machineName: String(item.machineName || ''),
              } as MaterialItemFormData)
          )
        : [
            {
              srNo: 1,
              materialId: Number(editingIssue.materialId || 0),
              nameOfMaterial: String(editingIssue.materialName || ''),
              existingStock: Number(editingIssue.existingStock || 0),
              issuedQty: String(editingIssue.issuedQuantity || 0),
              stockAfterIssue: Number(editingIssue.stockAfterIssue || 0),
              measureUnit: String(editingIssue.measureUnit || ''),
              receiverName: String(editingIssue.recipientName || ''),
              image: null,
              imagePreview: '',
              purpose: String(editingIssue.purpose || ''),
              machineId: Number(editingIssue.machineId || 0),
              machineName: String(editingIssue.machineName || ''),
            } as MaterialItemFormData,
          ];

      setFormData({
        date: issuedDate,
        items,
        additionalNotes: String(editingIssue.additionalNotes || ''),
      });
    } else if (!editingIssue && isOpen) {
      // Reset form for new issue
      setFormData({
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            srNo: 1,
            materialId: 0,
            nameOfMaterial: '',
            existingStock: 0,
            issuedQty: '',
            stockAfterIssue: 0,
            measureUnit: '',
            receiverName: '',
            image: null,
            imagePreview: '',
            purpose: '',
            machineId: 0,
            machineName: '',
          } as MaterialItemFormData,
        ],
        additionalNotes: '',
      });
    }
  }, [editingIssue, isOpen, currentUser]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);
  const [isLoadingMachines, setIsLoadingMachines] = useState<boolean>(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [machinesError, setMachinesError] = useState<string | null>(null);

  // Fetch materials and machines from API
  useEffect(() => {
    const fetchData = async () => {
      // Fetch materials
      setIsLoadingMaterials(true);
      setMaterialsError(null);
      try {
        const response = await materialsApi.getMaterials({
          limit: 100,
          sortBy: 'name',
          sortOrder: 'ASC',
        });
        setAvailableMaterials(response.data);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setMaterialsError('Failed to load materials. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load materials. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingMaterials(false);
      }

      // Fetch machines
      setIsLoadingMachines(true);
      setMachinesError(null);
      try {
        const response = await machinesApi.getAll({
          limit: 100,
          sortBy: 'name',
          sortOrder: 'ASC',
        });
        setAvailableMachines(response.data);
      } catch (error) {
        console.error('Error fetching machines:', error);
        setMachinesError('Failed to load machines. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load machines. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingMachines(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate each item in the items array
    formData.items.forEach((item, index) => {
      if (!item.nameOfMaterial.trim()) {
        newErrors[
          `nameOfMaterial_${index}`
        ] = `Material name is required for item ${index + 1}`;
      }

      if (!item.materialId) {
        newErrors[
          `materialId_${index}`
        ] = `Please select a valid material for item ${index + 1}`;
      }

      if (!item.issuedQty.trim()) {
        newErrors[
          `issuedQty_${index}`
        ] = `Issued quantity is required for item ${index + 1}`;
      }

      const issuedQty = Number(item.issuedQty);
      if (issuedQty <= 0) {
        newErrors[
          `issuedQty_${index}`
        ] = `Issued quantity must be greater than 0 for item ${index + 1}`;
      }

      if (issuedQty > item.existingStock) {
        newErrors[
          `issuedQty_${index}`
        ] = `Issued quantity cannot exceed existing stock for item ${
          index + 1
        }`;
      }

      if (!item.receiverName.trim()) {
        newErrors[
          `receiverName_${index}`
        ] = `Receiver name is required for item ${index + 1}`;
      }

      if (!item.purpose.trim()) {
        newErrors[`purpose_${index}`] = `Purpose is required for item ${
          index + 1
        }`;
      }

      if (!item.machineId) {
        newErrors[
          `machineId_${index}`
        ] = `Machine selection is required for item ${index + 1}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      // Prepare valid items
      const validItems = formData.items.filter(
        (item) => item.nameOfMaterial && item.issuedQty
      );

      let successCount = 0;
      let failureCount = 0;
      let lastSuccessResponse: MaterialIssue | null = null;

      // Submit one API request per item (sequentially)
      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];

        const singleItemForm = new FormData();
        singleItemForm.append('additionalNotes', formData.additionalNotes);
        singleItemForm.append('issueDate', formData.date);
        singleItemForm.append(
          'items',
          JSON.stringify([
            {
              materialId: item.materialId,
              issuedQuantity: parseInt(item.issuedQty),
              receiverName: item.receiverName,
              purpose: item.purpose,
              machineId: item.machineId,
            },
          ])
        );
        if (item.image) {
          singleItemForm.append('files', item.image);
        }

        try {
          const resp = await materialIssuesApi.create(singleItemForm);
          lastSuccessResponse = resp;
          successCount++;
        } catch (err) {
          console.error('Error issuing item:', err);
          failureCount++;
        }
      }

      // Notify parent with last successful response (if any)
      if (lastSuccessResponse) {
        onSubmit(lastSuccessResponse);
      }

      // Toast summary
      const total = validItems.length;
      if (successCount === total) {
        toast({
          title: 'Material Issues Created',
          description: `${successCount} material item(s) issued successfully`,
        });
      } else if (successCount > 0) {
        toast({
          title: 'Partial Success',
          description: `${successCount} succeeded, ${failureCount} failed.`,
          variant: 'default',
        });
      } else {
        throw new Error('All item submissions failed.');
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            srNo: 1,
            materialId: 0,
            nameOfMaterial: '',
            existingStock: 0,
            issuedQty: '',
            stockAfterIssue: 0,
            measureUnit: '',
            receiverName: '',
            image: null,
            imagePreview: '',
            purpose: '',
            machineId: 0,
            machineName: '',
          } as MaterialItemFormData,
        ],
        additionalNotes: '',
      });

      setSelectedMaterial(null);
      setErrors({});
      onClose();
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: { message?: string };
          status?: number;
        };
        message?: string;
      };

      console.error('Error creating material issue:', error);

      let errorMessage = 'Failed to create material issue. Please try again.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-6xl max-h-[95vh] overflow-y-auto p-4'>
        <DialogHeader className='pb-3'>
          <DialogTitle className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center'>
              <FileText className='w-4 h-4 text-foreground' />
            </div>
            <div>
              <div className='text-base font-bold'>
                {editingIssue
                  ? 'EDIT MATERIAL ISSUE FORM'
                  : 'MATERIAL ISSUE FORM'}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-3'>
          {/* Add Item Button - Only show when not editing */}
          {!editingIssue && (
          <div className='flex justify-end'>
            <Button
              type='button'
              onClick={() => {
                const newItem = {
                  srNo: formData.items.length + 1,
                  nameOfMaterial: '',
                  existingStock: 0,
                  issuedQty: '',
                  stockAfterIssue: 0,
                  measureUnit: '',
                  receiverName: '',
                  image: null,
                  imagePreview: '',
                  materialId: 0,
                  purpose: '',
                  machineId: 0,
                  machineName: '',
                };
                setFormData((prev) => ({
                  ...prev,
                  items: [...prev.items, newItem],
                }));
              }}
              className='gap-1 h-8 text-xs'
              size='sm'
            >
              <Plus className='w-3 h-3' />
              Add Item
            </Button>
          </div>
          )}

          {/* Material Items Table - Compact */}
          <Card>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-gray-50'>
                      <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                        SR.NO.
                      </TableHead>
                      <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                        ISSUING MATERIAL
                      </TableHead>
                      <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                        CURRENT STOCK
                      </TableHead>
                      <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                        ISSUING QTY
                      </TableHead>
                      <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                        STOCK AFTER ISSUE
                      </TableHead>
                      <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                        ISSUING TO
                      </TableHead>
                      <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                        ISSUING FOR
                      </TableHead>
                      <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                        UPLOAD IMAGE
                      </TableHead>
                      <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                        PURPOSE OF ISSUE
                      </TableHead>
                      <TableHead className='border border-gray-300 font-semibold text-xs px-2 py-1'>
                        ACTIONS
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className='border border-gray-300 text-center font-semibold text-xs px-2 py-1'>
                          {item.srNo}
                        </TableCell>
                        <TableCell className='border border-gray-300 px-2 py-1'>
                          <Select
                            value={item.nameOfMaterial}
                            onValueChange={(value) => {
                              const material = availableMaterials.find(
                                (m) => m.name === value
                              );
                              if (material) {
                                const newItems = [...formData.items];
                                newItems[index] = {
                                  ...item,
                                  nameOfMaterial: material.name,
                                  existingStock: material.currentStock,
                                  measureUnit: material.makerBrand || '',
                                  stockAfterIssue:
                                    material.currentStock -
                                    Number(item.issuedQty || 0),
                                  materialId: material.id,
                                };
                                setFormData((prev) => ({
                                  ...prev,
                                  items: newItems,
                                }));
                              }
                            }}
                            disabled={isLoadingMaterials}
                          >
                            <SelectTrigger className='border-0 p-0 h-auto text-xs'>
                              {isLoadingMaterials ? (
                                <div className='flex items-center gap-2'>
                                  <Loader2 className='h-3 w-3 animate-spin' />
                                  <span>Loading...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder='Select Material' />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {materialsError ? (
                                <div className='p-2 text-xs text-destructive'>
                                  {materialsError}
                                </div>
                              ) : (
                                availableMaterials.map((material) => (
                                  <SelectItem
                                    key={material.id}
                                    value={material.name}
                                  >
                                    <div className='flex flex-col'>
                                      <span>{material.name}</span>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {errors[`nameOfMaterial_${index}`] && (
                            <p className='text-destructive text-xs mt-1'>
                              {errors[`nameOfMaterial_${index}`]}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className='border border-gray-300 text-center px-2 py-1'>
                          <div className='font-semibold text-xs'>
                            {item.existingStock}
                          </div>
                        </TableCell>
                        <TableCell className='border border-gray-300 text-center px-2 py-1'>
                          <div className='flex items-center gap-1'>
                            <Input
                              type='number'
                              value={item.issuedQty}
                              onChange={(e) => {
                                const issuedQty = Number(e.target.value) || 0;
                                const newItems = [...formData.items];
                                newItems[index] = {
                                  ...item,
                                  issuedQty: e.target.value,
                                  stockAfterIssue:
                                    item.existingStock - issuedQty,
                                };
                                setFormData((prev) => ({
                                  ...prev,
                                  items: newItems,
                                }));
                              }}
                              placeholder='Qty'
                              min='0'
                              max={item.existingStock}
                              className='border-0 p-2 h-10 w-16 text-center text-sm outline-none focus:outline-none hover:outline-none active:outline-none focus:ring-0 rounded-sm'
                            />
                          </div>
                          {errors[`issuedQty_${index}`] && (
                            <p className='text-destructive text-xs mt-1'>
                              {errors[`issuedQty_${index}`]}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className='border border-gray-300 text-center px-2 py-1'>
                          <div className='font-semibold text-xs'>
                            {item.stockAfterIssue}
                          </div>
                        </TableCell>
                        <TableCell className='border border-gray-300 px-2 py-1'>
                          <Input
                            value={item.receiverName}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index] = {
                                ...item,
                                receiverName: e.target.value,
                              };
                              setFormData((prev) => ({
                                ...prev,
                                items: newItems,
                              }));
                            }}
                            placeholder='Receiver Name'
                            className='border-0 p-1 h-8 text-xs outline-none focus:outline-none focus:ring-0 rounded-sm'
                          />
                        </TableCell>
                        <TableCell className='border border-gray-300 px-2 py-1'>
                          <Select
                            value={item.machineName}
                            onValueChange={(value) => {
                              const machine = availableMachines.find(
                                (m) => m.name === value
                              );
                              if (machine) {
                                const newItems = [...formData.items];
                                newItems[index] = {
                                  ...item,
                                  machineName: machine.name,
                                  machineId: machine.id,
                                };
                                setFormData((prev) => ({
                                  ...prev,
                                  items: newItems,
                                }));
                              }
                            }}
                            disabled={isLoadingMachines}
                          >
                            <SelectTrigger className='border-0 p-0 h-auto text-xs'>
                              {isLoadingMachines ? (
                                <div className='flex items-center gap-2'>
                                  <Loader2 className='h-3 w-3 animate-spin' />
                                  <span>Loading...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder='Select Machine *' />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {machinesError ? (
                                <div className='p-2 text-xs text-destructive'>
                                  {machinesError}
                                </div>
                              ) : (
                                [
                                  ...availableMachines.map((machine) => (
                                    <SelectItem
                                      key={machine.id}
                                      value={machine.name}
                                    >
                                      <div className='flex flex-col'>
                                        <span>{machine.name}</span>
                                        <span className='text-xs text-muted-foreground'>
                                          {machine.model} - {machine.serialNumber}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  )),
                                  <SelectItem key="other" value="Other">
                                    <div className='flex flex-col'>
                                      <span>Other</span>
                                      <span className='text-xs text-muted-foreground'>
                                        Custom machine or equipment
                                      </span>
                                    </div>
                                  </SelectItem>
                                ]
                              )}
                            </SelectContent>
                          </Select>
                          {errors[`machineId_${index}`] && (
                            <p className='text-destructive text-xs mt-1'>
                              {errors[`machineId_${index}`]}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className='border border-gray-300 px-2 py-1'>
                          <div className='flex flex-col gap-1'>
                            {item.imagePreview ? (
                              <div className='relative w-full h-16 mb-1'>
                                <img
                                  src={item.imagePreview}
                                  alt='Preview'
                                  className='h-full object-contain rounded-sm'
                                />
                                <Button
                                  type='button'
                                  variant='destructive'
                                  size='sm'
                                  className='absolute top-0 right-0 h-5 w-5 p-0'
                                  onClick={() => {
                                    const newItems = [
                                      ...formData.items,
                                    ] as MaterialItemFormData[];
                                    newItems[index] = {
                                      ...item,
                                      image: null,
                                      imagePreview: '',
                                    } as MaterialItemFormData;
                                    setFormData((prev) => ({
                                      ...prev,
                                      items: newItems,
                                    }));
                                  }}
                                >
                                  <X className='h-3 w-3' />
                                </Button>
                              </div>
                            ) : (
                              <div className='flex items-center gap-1'>
                                <Input
                                  type='file'
                                  accept='image/*'
                                  id={`file-upload-${index}`}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // Create a preview URL
                                      const previewUrl =
                                        URL.createObjectURL(file);

                                      const newItems = [
                                        ...formData.items,
                                      ] as MaterialItemFormData[];
                                      newItems[index] = {
                                        ...item,
                                        image: file,
                                        imagePreview: previewUrl,
                                      } as MaterialItemFormData;
                                      setFormData((prev) => ({
                                        ...prev,
                                        items: newItems,
                                      }));
                                    }
                                  }}
                                  className='hidden'
                                />
                                <Label
                                  htmlFor={`file-upload-${index}`}
                                  className='flex items-center justify-center gap-1 cursor-pointer text-xs bg-secondary/20 hover:bg-secondary/30 rounded-sm p-1 w-full'
                                >
                                  <Upload className='h-3 w-3' />
                                  Upload Image
                                </Label>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='border border-gray-300 px-2 py-1'>
                          <Input
                            value={item.purpose}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index] = {
                                ...item,
                                purpose: e.target.value,
                              };
                              setFormData((prev) => ({
                                ...prev,
                                items: newItems,
                              }));
                            }}
                            placeholder='Purpose'
                            className='border-0 p-1 h-8 text-xs outline-none focus:outline-none focus:ring-0 rounded-sm'
                          />
                        </TableCell>
                        <TableCell className='border border-gray-300 px-2 py-1'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              if (formData.items.length > 1) {
                                const newItems = formData.items.filter(
                                  (_, i) => i !== index
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  items: newItems,
                                }));
                              }
                            }}
                            disabled={formData.items.length === 1 || !!editingIssue}
                            className='gap-1 text-xs h-6 w-6 p-0'
                          >
                            <Trash2 className='w-3 h-3' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Signature Section - Compact */}
            </CardContent>
          </Card>

          {/* Additional Information - Compact */}
          <Card>
            <CardContent className='space-y-3'>
              <div className='space-y-1'>
                <Label htmlFor='additionalNotes' className='text-xs'>
                  Additional Notes
                </Label>
                <Textarea
                  id='additionalNotes'
                  placeholder='Any additional notes or special instructions'
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    handleInputChange('additionalNotes', e.target.value)
                  }
                  className='min-h-[60px] px-4 py-3 border border-input bg-background hover:border-primary/50 focus:border-transparent focus:ring-0 outline-none rounded-[5px] text-sm resize-none transition-all duration-200'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <div className='space-y-1'>
                  <Label className='text-xs'>Issued By</Label>
                  <div className='input-friendly bg-secondary text-center py-2 font-semibold text-xs'>
                    {currentUser?.name || 'Current User'}
                  </div>
                </div>

                <div className='space-y-1'>
                  <Label className='text-xs'>Date</Label>
                  <div className='input-friendly bg-secondary text-center py-2 font-semibold text-xs'>
                    {formatDate(formData.date)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions - Compact */}
          <div className='flex justify-center gap-3 pt-3'>
            <Button
              type='submit'
              size='sm'
              className='gap-2'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className='w-4 h-4' />
                  {editingIssue ? 'Update' : 'Issue'}
                </>
              )}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='gap-2'
              size='sm'
              disabled={isSubmitting}
            >
              <X className='w-4 h-4' />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
