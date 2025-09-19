import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar, Package, CheckCircle, Clock, User, Building2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  date: string;
  materialName: string;
  quantity: string;
  value: string;
  requestedBy: string;
  status: string;
  receivedQuantity?: string;
  receivedDate?: string;
  notes?: string;
}

interface HistoryViewProps {
  userRole: 'company_owner' | 'site_supervisor';
  historyData: HistoryItem[];
  title?: string;
  requestId?: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  userRole,
  historyData,
  title,
  requestId
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'completed': return 'bg-green-600 text-white';
      case 'material_received': return 'bg-emerald-500 text-white';
      case 'partially_received': return 'bg-orange-500 text-white';
      case 'ordered': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'material_received': return <Package className="w-3 h-3" />;
      case 'partially_received': return <Package className="w-3 h-3" />;
      case 'ordered': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const renderOwnerHistory = () => (
    <Card className="border border-gray-200 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5 text-primary" />
          {title || "Last 5 Approved Requests"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {historyData.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold whitespace-nowrap">Purchase ID</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Purchased Date</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Materials</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Quantity</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Total Value</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Requested By</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>{item.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.materialName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="font-medium">{item.value}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span>{item.requestedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(item.status)} border`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          <span className="text-xs">{item.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No approved requests found</p>
            <p className="text-sm">Recent approvals will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSupervisorHistory = () => (
    <Card className="border border-gray-200 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5 text-primary" />
          {title || "Receipt History"}
          {requestId && <Badge variant="secondary">{requestId}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {historyData.length > 0 ? (
          <div className="space-y-4">
            {historyData.map((item) => (
              <Card key={item.id} className="border border-gray-100 w-full">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Materials</div>
                        <div className="font-semibold">{item.materialName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <Badge className={`${getStatusColor(item.status)} border mt-1`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            <span className="text-xs">{item.status.replace('_', ' ').toUpperCase()}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Ordered Quantity</div>
                          <div className="font-medium">{item.quantity}</div>
                        </div>
                        {item.receivedQuantity && (
                          <div>
                            <div className="text-sm text-muted-foreground">Received Quantity</div>
                            <div className="font-medium text-primary">{item.receivedQuantity}</div>
                          </div>
                        )}
                      </div>
                      
                      {item.receivedDate && (
                        <div>
                          <div className="text-sm text-muted-foreground">Received Date</div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>{item.receivedDate}</span>
                          </div>
                        </div>
                      )}
                      
                      {item.notes && (
                        <div>
                          <div className="text-sm text-muted-foreground">Notes</div>
                          <div className="text-sm bg-gray-50 p-2 rounded border mt-1">
                            {item.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No receipt history found</p>
            <p className="text-sm">Material receipts will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return userRole === 'company_owner' ? renderOwnerHistory() : renderSupervisorHistory();
}; 