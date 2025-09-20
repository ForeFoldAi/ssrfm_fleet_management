import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileEdit, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useRole } from '../contexts/RoleContext';
import { toast } from '../hooks/use-toast';
import { RequisitionIndentForm } from '../components/RequisitionIndentForm';
import { CompanyOwnerRequestForm } from '../components/CompanyOwnerRequestForm';
import { SupervisorRequestForm } from '../components/SupervisorRequestForm';
import { VendorQuotationSelector } from '../components/VendorQuotationSelector';
import { StatusDropdown } from '../components/StatusDropdown';
import { HistoryView } from '../components/HistoryView';
import { generatePurchaseId, parseLocationFromId } from '../lib/utils';

interface VendorQuotation {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  quotedPrice: string;
  notes: string;
  quotationFile?: File | null;
}

interface RequestItem {
  id: string;
  srNo: number;
  productName: string;
  machineName: string;
  specifications: string;
  oldStock: number;
  reqQuantity: string;
  measureUnit: string;
  images?: File[];
  imagePreviews?: string[];
  notes?: string;
  vendorQuotations: VendorQuotation[];
}

interface RequestData {
  id: string;
  items: RequestItem[];
  requestedBy: string;
  location: string; // Changed from department
  date: string;
  status: string;
  selectedVendors?: Record<string, string>;
  receiptHistory?: any[];
}

const RequestDetails: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useRole();

  // Decode the requestId to handle URL encoded characters
  const decodedRequestId = requestId ? decodeURIComponent(requestId) : null;

  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [selectedVendors, setSelectedVendors] = useState<
    Record<string, string>
  >({});
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, string>
  >({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would be fetched from API
  const availableMaterials = [
    {
      name: 'FEVICOL',
      specifications: 'SH adhesive',
      measureUnit: 'kg',
      category: 'Adhesives',
    },
    {
      name: 'COPPER WIRE BRUSH',
      specifications: '0.01 mm thickness of wire',
      measureUnit: 'pieces',
      category: 'Tools',
    },
    // ... more materials
  ];

  const machines = [
    'BLENDER',
    'MAIN FLOUR MILL #01',
    'SECONDARY MILL #02',
    'FLOUR SIFTER #01',
    'MAIN CONVEYOR #01',
  ];

  useEffect(() => {
    // Mock data loading - replace with actual API call
    const loadRequestData = async () => {
      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        // Mock different request statuses based on requestId
        const getStatusFromRequestId = (id: string) => {
          // Updated to use new ID format
          if (id.includes('R-250115004') || id.includes('R-250114005'))
            return 'approved';
          if (id.includes('R-250112006') || id.includes('R-250111007'))
            return 'partially_received';
          if (id.includes('R-250108008') || id.includes('R-250107009'))
            return 'material_received';
          if (id.includes('R-250110010') || id.includes('R-250109011'))
            return 'ordered';
          if (id.includes('R-250105012') || id.includes('R-250104013'))
            return 'issued';
          if (id.includes('R-250102014') || id.includes('R-250101015'))
            return 'completed';
          if (
            id.includes('R-250116016') ||
            id.includes('R-250114017') ||
            id.includes('R-250112018')
          )
            return 'reverted';
          if (id.includes('R-250108019') || id.includes('R-250107020'))
            return 'rejected';
          return 'pending_approval'; // Default for other requests
        };

        const mockRequestData: RequestData = {
          id: decodedRequestId || 'SSRFM/unit-I/I-250120001',
          requestedBy: 'John Martinez',
          location: parseLocationFromId(
            decodedRequestId || 'SSRFM/unit-I/I-250120001'
          ), // Use utility function
          date: '2024-01-20',
          status: getStatusFromRequestId(
            decodedRequestId || 'SSRFM/unit-I/I-250120001'
          ), // ✅ Dynamic status
          items: [
            {
              id: '1',
              srNo: 1,
              productName: 'FEVICOL',
              machineName: 'BLENDER',
              specifications: 'SH adhesive',
              oldStock: 5,
              reqQuantity: '10',
              measureUnit: 'kg',
              notes: 'Urgent requirement for production',
              vendorQuotations: [
                {
                  id: 'v1',
                  vendorName: 'ABC Suppliers',
                  contactPerson: 'Raj Kumar',
                  phone: '+91-9876543210',
                  quotedPrice: '₹500/kg',
                  notes: 'Best quality adhesive',
                  quotationFile: null,
                },
                {
                  id: 'v2',
                  vendorName: 'XYZ Industries',
                  contactPerson: 'Suresh Patel',
                  phone: '+91-9876543211',
                  quotedPrice: '₹480/kg',
                  notes: 'Bulk discount available',
                  quotationFile: null,
                },
              ],
            },
          ],
          selectedVendors: {},
          receiptHistory: [],
        };

        setRequestData(mockRequestData);
        setLoading(false);
      }, 1000);
    };

    loadRequestData();
  }, [decodedRequestId]); // Use decodedRequestId in dependency array

  const handleItemChange = (itemId: string, field: string, value: string) => {
    if (!requestData) return;

    setRequestData((prev) => ({
      ...prev!,
      items: prev!.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleVendorSelect = (itemId: string, vendorId: string) => {
    setSelectedVendors((prev) => ({
      ...prev,
      [itemId]: vendorId,
    }));
  };

  const handleStatusSelect = (itemId: string, status: string) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [itemId]: status,
    }));
  };

  const handleCompanyOwnerSubmit = () => {
    if (!requestData) return;

    // Process the decisions
    const decisions = requestData.items.map((item) => ({
      itemId: item.id,
      materialName: item.productName,
      selectedVendor: selectedVendors[item.id],
      status: selectedStatuses[item.id],
    }));

    // Count different statuses
    const approvedItems = decisions.filter((d) => d.status === 'approved');
    const rejectedItems = decisions.filter((d) => d.status === 'rejected');
    const revertedItems = decisions.filter((d) => d.status === 'reverted');

    // Update request data based on decisions
    let finalStatus = 'pending_approval';
    if (approvedItems.length === decisions.length) {
      finalStatus = 'approved';
    } else if (rejectedItems.length === decisions.length) {
      finalStatus = 'rejected';
    } else if (revertedItems.length === decisions.length) {
      finalStatus = 'reverted';
    } else {
      // Mixed decisions - handle as needed
      finalStatus = 'partially_processed';
    }

    const updatedData = {
      ...requestData,
      status: finalStatus,
      selectedVendors,
      decisions,
    };

    setRequestData(updatedData);

    // Show success message
    const successMessage = `Successfully processed ${decisions.length} item${
      decisions.length > 1 ? 's' : ''
    }: ${approvedItems.length} approved, ${rejectedItems.length} rejected, ${
      revertedItems.length
    } reverted`;

    toast({
      title: 'Request Processed',
      description: successMessage,
    });

    // In real app, save to backend here
    console.log('Company Owner Decisions:', {
      requestId: requestData.id,
      decisions,
    });
  };

  const handleSupervisorSubmit = () => {
    if (!requestData) return;

    // Process the supervisor status updates
    const updates = requestData.items.map((item) => ({
      itemId: item.id,
      materialName: item.productName,
      newStatus: selectedStatuses[item.id],
    }));

    // Determine the overall request status
    const statusValues = Object.values(selectedStatuses);
    let finalStatus = requestData.status;

    if (statusValues.every((status) => status === 'ordered')) {
      finalStatus = 'ordered';
    } else if (statusValues.every((status) => status === 'material_received')) {
      finalStatus = 'material_received';
    } else if (statusValues.every((status) => status === 'issued')) {
      finalStatus = 'issued';
    } else if (statusValues.every((status) => status === 'completed')) {
      finalStatus = 'completed';
    } else if (statusValues.every((status) => status === 'pending_approval')) {
      finalStatus = 'pending_approval';
    } else if (statusValues.some((status) => status === 'partially_received')) {
      finalStatus = 'partially_received';
    }

    const updatedData = {
      ...requestData,
      status: finalStatus,
      statusUpdates: updates,
    };

    setRequestData(updatedData);

    // Show success message
    const orderedCount = statusValues.filter(
      (status) => status === 'ordered'
    ).length;
    const partialCount = statusValues.filter(
      (status) => status === 'partially_received'
    ).length;
    const receivedCount = statusValues.filter(
      (status) => status === 'material_received'
    ).length;
    const issuedCount = statusValues.filter(
      (status) => status === 'issued'
    ).length;
    const completedCount = statusValues.filter(
      (status) => status === 'completed'
    ).length;
    const resubmitCount = statusValues.filter(
      (status) => status === 'pending_approval'
    ).length;

    let successMessage = `Successfully updated ${updates.length} item${
      updates.length > 1 ? 's' : ''
    }`;
    if (orderedCount > 0) successMessage += ` - ${orderedCount} ordered`;
    if (partialCount > 0)
      successMessage += ` - ${partialCount} partially received`;
    if (receivedCount > 0)
      successMessage += ` - ${receivedCount} fully received`;
    if (issuedCount > 0) successMessage += ` - ${issuedCount} issued`;
    if (completedCount > 0) successMessage += ` - ${completedCount} completed`;
    if (resubmitCount > 0) successMessage += ` - ${resubmitCount} resubmitted`;

    toast({
      title: 'Status Updated',
      description: successMessage,
    });

    // In real app, save to backend here
    console.log('Supervisor Status Updates:', {
      requestId: requestData.id,
      updates,
    });
  };

  const handleStatusChange = (newStatus: string, additionalData?: any) => {
    if (!requestData) return;

    const updatedData = {
      ...requestData,
      status: newStatus,
      selectedVendors:
        newStatus === 'approved'
          ? selectedVendors
          : requestData.selectedVendors,
    };

    if (additionalData) {
      // Add receipt history or other additional data
      if (
        newStatus === 'partially_received' ||
        newStatus === 'material_received'
      ) {
        updatedData.receiptHistory = [
          ...(requestData.receiptHistory || []),
          {
            id: `receipt-${Date.now()}`,
            date: additionalData.receivedDate,
            materialName: requestData.items[0].productName,
            quantity: requestData.items[0].reqQuantity,
            receivedQuantity: additionalData.receivedQuantity,
            receivedDate: additionalData.receivedDate,
            notes: additionalData.notes,
            status: newStatus,
          },
        ];
      }
    }

    setRequestData(updatedData);

    toast({
      title: 'Status Updated',
      description: `Request status changed to ${newStatus.replace('_', ' ')}`,
    });

    // In real app, save to backend here
  };

  const handleSave = () => {
    if (!requestData) return;

    // Save changes to backend
    toast({
      title: 'Changes Saved',
      description: 'Request has been updated successfully',
    });

    setIsEditing(false);
  };

  const handleResubmit = () => {
    if (!requestData) return;

    // Update status to pending_approval for resubmission
    const updatedData = {
      ...requestData,
      status: 'pending_approval',
      resubmittedAt: new Date().toISOString(),
      resubmittedBy: currentUser?.name || 'Supervisor',
    };

    setRequestData(updatedData);

    toast({
      title: 'Request Resubmitted',
      description:
        'Request has been resubmitted for approval with updated vendor quotations',
    });

    // In real app, save to backend here
    console.log('Request Resubmitted:', {
      requestId: requestData.id,
      updatedData,
    });
  };

  const handleVendorQuotationChange = (
    itemId: string,
    quotations: VendorQuotation[]
  ) => {
    if (!requestData) return;

    setRequestData((prev) => ({
      ...prev!,
      items: prev!.items.map((item) =>
        item.id === itemId ? { ...item, vendorQuotations: quotations } : item
      ),
    }));
  };

  const canEdit = () => {
    if (!currentUser || !requestData) return false;

    if (currentUser.role === 'company_owner') {
      return false; // Owner can't edit, only approve/reject/revert
    }

    if (currentUser.role === 'supervisor') {
      // Can only edit reverted requests
      return requestData.status === 'reverted';
    }

    return false;
  };

  const isReadOnly = () => {
    if (!currentUser || !requestData) return true;

    if (currentUser.role === 'company_owner') {
      return true; // Always read-only for owner
    }

    if (currentUser.role === 'supervisor') {
      // Only allow editing for reverted requests, read-only for all others
      return requestData.status !== 'reverted';
    }

    return true;
  };

  const shouldShowVendorSelector = () => {
    return (
      currentUser?.role === 'company_owner' &&
      requestData?.status === 'pending_approval' &&
      requestData.items.some((item) => item.vendorQuotations.length > 0)
    );
  };

  const shouldShowStatusDropdown = () => {
    if (!currentUser || !requestData) return false;

    if (currentUser.role === 'company_owner') {
      return requestData.status === 'pending_approval';
    }

    if (currentUser.role === 'supervisor') {
      return ['approved', 'ordered', 'partially_received'].includes(
        requestData.status
      );
    }

    return false;
  };

  const getHistoryData = () => {
    if (!requestData) return [];

    if (currentUser?.role === 'company_owner') {
      // Return last 5 approved requests (mock data)
      return [
        {
          id: 'SSRFM/unit-I/I-250115004',
          date: '2024-01-15',
          materialName: 'Conveyor Belts',
          quantity: '25 meters',
          value: '₹32,500',
          requestedBy: 'John Martinez',
          location: 'Unit I',
          status: 'approved',
        },
        {
          id: 'SSRFM/unit-II/I-250114005',
          date: '2024-01-14',
          materialName: 'Air Filters',
          quantity: '12 pieces',
          value: '₹18,600',
          requestedBy: 'Lisa Anderson',
          location: 'Unit II',
          status: 'approved',
        },
        {
          id: 'SSRFM/unit-I/I-250108008',
          date: '2024-01-08',
          materialName: 'Industrial Lubricants',
          quantity: '20 cartridges',
          value: '₹4,800',
          requestedBy: 'Sarah Wilson',
          location: 'Unit I',
          status: 'material_received',
        },
        {
          id: 'SSRFM/unit-II/I-250107009',
          date: '2024-01-07',
          materialName: 'Safety Gloves',
          quantity: '50 pairs',
          value: '₹7,500',
          requestedBy: 'John Martinez',
          location: 'Unit II',
          status: 'material_received',
        },
        {
          id: 'SSRFM/unit-III/I-250102014',
          date: '2024-01-02',
          materialName: 'Safety Equipment',
          quantity: '25 sets',
          value: '₹21,250',
          requestedBy: 'John Martinez',
          location: 'Unit III',
          status: 'completed',
        },
      ];
    } else {
      // Return receipt history for supervisor
      return requestData.receiptHistory || [];
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
          <p className='mt-4 text-muted-foreground'>
            Loading request details...
          </p>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-foreground mb-2'>
            Request Not Found
          </h2>
          <p className='text-muted-foreground mb-4'>
            The requested item could not be found.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-4 sm:p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate(-1)}
            className='gap-2'
          >
            <ArrowLeft className='w-4 h-4' />
            Back
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>
              Request Details
            </h1>
            <p className='text-muted-foreground'>
              {currentUser?.role === 'company_owner'
                ? 'Review and approve request'
                : 'Manage request status'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {canEdit() && !isEditing && (
            <Button onClick={() => setIsEditing(true)} className='gap-2'>
              <FileEdit className='w-4 h-4' />
              Edit Request
            </Button>
          )}

          {isEditing && (
            <Button onClick={handleSave} className='gap-2'>
              <Save className='w-4 h-4' />
              Save Changes
            </Button>
          )}

          {shouldShowStatusDropdown() &&
            currentUser?.role !== 'company_owner' && (
              <StatusDropdown
                currentStatus={requestData.status}
                userRole={currentUser?.role as 'company_owner' | 'supervisor'}
                onStatusChange={handleStatusChange}
                requestId={requestData.id}
                hasVendorSelected={
                  Object.keys(selectedVendors).length ===
                  requestData.items.length
                }
              />
            )}

          {currentUser?.role === 'supervisor' &&
            requestData.status === 'reverted' && (
              <Button onClick={handleResubmit} className='gap-2'>
                <Package className='w-4 h-4' />
                Resubmit for Approval
              </Button>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className='w-full'>
        {/* Request Form - Full Width */}
        <div className='space-y-6'>
          {currentUser?.role === 'company_owner' &&
          requestData.status === 'pending_approval' ? (
            <CompanyOwnerRequestForm
              requestData={requestData}
              selectedVendors={selectedVendors}
              onVendorSelect={handleVendorSelect}
              selectedStatuses={selectedStatuses}
              onStatusSelect={handleStatusSelect}
              onSubmit={handleCompanyOwnerSubmit}
            />
          ) : currentUser?.role === 'supervisor' &&
            requestData.status === 'reverted' ? (
            // For reverted requests, show full editable form like MaterialRequest.tsx
            <RequisitionIndentForm
              requestData={requestData}
              isReadOnly={false} // Allow editing for reverted requests
              onItemChange={handleItemChange}
              onVendorQuotationChange={handleVendorQuotationChange}
              availableMaterials={availableMaterials}
              machines={machines}
            />
          ) : currentUser?.role === 'supervisor' &&
            ['approved', 'ordered', 'partially_received', 'issued'].includes(
              requestData.status
            ) ? (
            <SupervisorRequestForm
              requestData={requestData}
              selectedStatuses={selectedStatuses}
              onStatusSelect={handleStatusSelect}
              onSubmit={handleSupervisorSubmit}
            />
          ) : (
            // For all other cases (including material_received, completed, rejected), show read-only form
            <>
              <RequisitionIndentForm
                requestData={requestData}
                isReadOnly={true} // Always read-only for completed/final statuses
                onItemChange={handleItemChange}
                availableMaterials={availableMaterials}
                machines={machines}
              />

              {shouldShowVendorSelector() && (
                <VendorQuotationSelector
                  requestItems={requestData.items}
                  onVendorSelect={handleVendorSelect}
                  selectedVendors={selectedVendors}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Section - Status and History */}
      <div className='mt-8 space-y-6'>
        {/* Request Status Card */}

        {/* History Section */}
        <HistoryView
          userRole={currentUser?.role as 'company_owner' | 'supervisor'}
          historyData={getHistoryData()}
          requestId={requestData.id}
        />
      </div>
    </div>
  );
};

export default RequestDetails;
