import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Calendar,
  Package,
  CheckCircle,
  Clock,
  User,
  Building2,
} from 'lucide-react';
import { generatePurchaseId, parseLocationFromId, formatDateToDDMMYYYY } from '../lib/utils';

interface HistoryItem {
  id: string;
  date: string;
  materialName: string;
  quantity: string;
  purchaseValue: string;
  previousMaterialValue: string;
  perMeasureQuantity: string;
  requestedValue: string;
  currentValue: string;
  status: string;
  receivedQuantity?: string;
  receivedDate?: string;
  notes?: string;
  requestedBy?: string;
  location?: string;
  purchasedFrom?: string; // Add this field
}

interface HistoryViewProps {
  userRole: 'company_owner' | 'supervisor';
  historyData: HistoryItem[];
  title?: string;
  requestId?: string;
  materialName?: string;
  location?: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  userRole,
  historyData,
  title,
  requestId,
  materialName,
  location,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-green-600 text-white';
      case 'material_received':
        return 'bg-emerald-500 text-white';
      case 'partially_received':
        return 'bg-orange-500 text-white';
      case 'fully_received':
        return 'bg-emerald-500 text-white';
      case 'ordered':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className='w-3 h-3' />;
      case 'completed':
        return <CheckCircle className='w-3 h-3' />;
      case 'material_received':
        return <Package className='w-3 h-3' />;
      case 'partially_received':
        return <Package className='w-3 h-3' />;
      case 'fully_received':
        return <Package className='w-3 h-3' />;
      case 'ordered':
        return <Clock className='w-3 h-3' />;
      default:
        return <Clock className='w-3 h-3' />;
    }
  };

  // Filter data to show only received materials
  const filteredHistoryData = historyData.filter((item) => 
    item.status === 'material_received' || 
    item.status === 'fully_received' || 
    item.status === 'partially_received' ||
    item.status === 'completed'
  );

  const renderOwnerHistory = () => (
    <Card className='border border-gray-200 w-full'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Building2 className='w-5 h-5 text-primary' />
          {title || `Last 5 Material Received`}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        {filteredHistoryData.length > 0 ? (
          <div className='overflow-x-auto w-full border border-gray-300 rounded-md'>
            <Table className='min-w-full'>
              <TableHeader>
                <TableRow className='bg-gray-100 border-b border-gray-300'>
                  <TableHead className='font-semibold text-sm border-r border-gray-300'>
                    Purchased ID
                  </TableHead>
                  <TableHead className='font-semibold text-sm border-r border-gray-300'>
                    Purchased Date
                  </TableHead>
                  <TableHead className='font-semibold text-sm border-r border-gray-300'>
                    Purchased Price
                  </TableHead>
                  <TableHead className='font-semibold text-sm'>
                    Purchased From
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistoryData.map((item) => (
                  <TableRow key={item.id} className='border-b border-gray-200 hover:bg-gray-50'>
                    <TableCell className='font-medium text-sm border-r border-gray-300'>{item.id}</TableCell>
                    <TableCell className='text-sm border-r border-gray-300'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3 text-muted-foreground' />
                        <span>{formatDateToDDMMYYYY(item.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium text-sm border-r border-gray-300'>
                      ₹{item.purchaseValue}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {item.purchasedFrom || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className='text-center py-6 text-muted-foreground'>
            <Package className='w-10 h-10 mx-auto mb-3 opacity-50' />
            <p className='text-sm'>No material receipts found</p>
            <p className='text-xs'>
              Recent material receipts for {materialName || 'this material'}{' '}
              will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSupervisorHistory = () => (
    <Card className='border border-gray-200 w-full'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Package className='w-5 h-5 text-primary' />
          {title || `Last 5 Material Received`}
          {requestId && <Badge variant='secondary'>{requestId}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        {filteredHistoryData.length > 0 ? (
          <div className='overflow-x-auto w-full border border-gray-300 rounded-md'>
            <Table className='min-w-full'>
              <TableHeader>
                <TableRow className='bg-gray-100 border-b border-gray-300'>
                  <TableHead className='font-semibold text-sm border-r border-gray-300'>
                    Purchased ID
                  </TableHead>
                  <TableHead className='font-semibold text-sm border-r border-gray-300'>
                    Purchased Date
                  </TableHead>
                  <TableHead className='font-semibold text-sm border-r border-gray-300'>
                    Purchased Price
                  </TableHead>
                  <TableHead className='font-semibold text-sm'>
                    Purchased From
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistoryData.map((item) => (
                  <TableRow key={item.id} className='border-b border-gray-200 hover:bg-gray-50'>
                    <TableCell className='font-medium text-sm border-r border-gray-300'>{item.id}</TableCell>
                    <TableCell className='text-sm border-r border-gray-300'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3 text-muted-foreground' />
                        <span>{formatDateToDDMMYYYY(item.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium text-sm border-r border-gray-300'>
                      ₹{item.purchaseValue}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {item.purchasedFrom || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className='text-center py-6 text-muted-foreground'>
            <Package className='w-10 h-10 mx-auto mb-3 opacity-50' />
            <p className='text-sm'>No material receipts found</p>
            <p className='text-xs'>
              Material receipts for {materialName || 'this material'} will
              appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return userRole === 'company_owner'
    ? renderOwnerHistory()
    : renderSupervisorHistory();
};
