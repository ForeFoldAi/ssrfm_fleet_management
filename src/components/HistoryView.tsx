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
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Building2 className='w-5 h-5 text-primary' />
          {title || `Last 5 Material Received`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredHistoryData.length > 0 ? (
          <div className='overflow-x-auto w-full'>
            <Table className='min-w-full'>
              <TableHeader>
                <TableRow className='bg-gray-50'>
                  <TableHead className='font-semibold whitespace-nowrap'>
                    Purchase ID
                  </TableHead>
                  <TableHead className='font-semibold whitespace-nowrap'>
                    Date
                  </TableHead>
                  <TableHead className='font-semibold whitespace-nowrap'>
                    Purchase Value
                  </TableHead>
                  <TableHead className='font-semibold whitespace-nowrap'>
                    Requested Value
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistoryData.map((item) => (
                  <TableRow key={item.id} className='hover:bg-gray-50'>
                    <TableCell className='font-medium'>{item.id}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Calendar className='w-3 h-3 text-muted-foreground' />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>
                      ₹{item.purchaseValue}
                    </TableCell>
                    <TableCell className='font-medium'>
                      ₹{item.requestedValue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            <Package className='w-12 h-12 mx-auto mb-4 opacity-50' />
            <p>No material receipts found</p>
            <p className='text-sm'>
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
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Package className='w-5 h-5 text-primary' />
          {title || `Last 5 Material Received`}
          {requestId && <Badge variant='secondary'>{requestId}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredHistoryData.length > 0 ? (
          <div className='overflow-x-auto w-full'>
            <Table className='min-w-full'>
              <TableHeader>
                <TableRow className='bg-gray-50'>
                  <TableHead className='font-semibold whitespace-nowrap'>
                    Purchase ID
                  </TableHead>
                  <TableHead className='font-semibold whitespace-nowrap'>
                    Date
                  </TableHead>
                  <TableHead className='font-semibold whitespace-nowrap'>
                          Purchase Value
                  </TableHead>
                  <TableHead className='font-semibold whitespace-nowrap'>
                          Requested Value
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistoryData.map((item) => (
                  <TableRow key={item.id} className='hover:bg-gray-50'>
                    <TableCell className='font-medium'>{item.id}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Calendar className='w-3 h-3 text-muted-foreground' />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>
                      ₹{item.purchaseValue}
                    </TableCell>
                    <TableCell className='font-medium'>
                      ₹{item.requestedValue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            <Package className='w-12 h-12 mx-auto mb-4 opacity-50' />
            <p>No material receipts found</p>
            <p className='text-sm'>
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
