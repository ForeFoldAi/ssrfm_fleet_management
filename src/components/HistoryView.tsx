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

  // Filter data to show only received materials and relevant statuses
  const filteredHistoryData = historyData.filter((item) => 
    item.status === 'fully_received' || 
    item.status === 'partially_received' ||
    item.status === 'ordered' ||
    item.status === 'approved' ||
    item.status === 'completed'
  );

  const renderOwnerHistory = () => (
    <Card className='rounded-lg shadow-sm'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Building2 className='w-5 h-5 text-primary' />
          {title || `Last 5 Material Transactions`}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        {filteredHistoryData.length > 0 ? (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-foreground font-semibold'>
                    Purchased ID
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Purchased Date
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Purchased Price
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Purchased From
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistoryData.map((item) => (
                  <TableRow key={item.id} className='hover:bg-muted/30'>
                    <TableCell className='font-medium text-foreground'>
                      {item.id}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3 text-muted-foreground' />
                        <span>{formatDateToDDMMYYYY(item.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium text-foreground'>
                      ₹{item.purchaseValue}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {item.purchasedFrom || 'No Vendor'}
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
    <Card className='rounded-lg shadow-sm'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Package className='w-5 h-5 text-primary' />
          {title || `Last 5 Material Transactions`}
          {requestId && <Badge variant='secondary'>{requestId}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        {filteredHistoryData.length > 0 ? (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-foreground font-semibold'>
                    Purchased ID
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Purchased Date
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Purchased Price
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Purchased From
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistoryData.map((item) => (
                  <TableRow key={item.id} className='hover:bg-muted/30'>
                    <TableCell className='font-medium text-foreground'>
                      {item.id}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3 text-muted-foreground' />
                        <span>{formatDateToDDMMYYYY(item.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium text-foreground'>
                      ₹{item.purchaseValue}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {item.purchasedFrom || 'No Vendor'}
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