import { useState } from "react";
import { CheckCircle, XCircle, Package, AlertTriangle, Clock, Truck, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useRole } from "../contexts/RoleContext";
import { RequestStatusManager } from "./RequestStatusManager";

export const WorkflowDemo = () => {
  const { currentUser } = useRole();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isStatusManagerOpen, setIsStatusManagerOpen] = useState(false);

  // Demo request data
  const [demoRequest, setDemoRequest] = useState({
    id: "REQ-DEMO-001",
    materialName: "Industrial Bearings",
    specifications: "SKF Deep Grove Ball Bearing 6205-2RS",
    maker: "SKF",
    quantity: "6 pieces",
    value: "₹4,200",
    priority: "high",
    materialPurpose: "Emergency replacement for critical bearing failure",
    machineId: "MACHINE-001",
    machineName: "Primary Flour Mill #1",
    date: "2024-01-20",
    status: "pending_approval",
    statusDescription: "Awaiting approval from Owner",
    currentStage: "Pending Approval",
    progressStage: 1,
    requestedBy: "John Martinez",
    department: "Production",
    statusHistory: [
      {
        status: "pending_approval",
        date: "2024-01-20",
        description: "Request submitted for approval",
        user: "John Martinez"
      }
    ]
  });

  const handleStatusUpdate = (requestId: string, newStatus: string, updateData: any) => {
    setDemoRequest(prev => ({
      ...prev,
      status: newStatus,
      statusDescription: updateData.statusDescription || prev.statusDescription,
      currentStage: updateData.currentStage || prev.currentStage,
      progressStage: updateData.progressStage || prev.progressStage,
      statusHistory: [
        {
          status: newStatus,
          date: new Date().toISOString(),
          description: updateData.statusDescription || `Status updated to ${newStatus}`,
          user: currentUser?.name || 'System'
        },
        ...prev.statusHistory
      ],
      ...updateData
    }));
  };

  const openStatusManager = () => {
    setSelectedRequest(demoRequest);
    setIsStatusManagerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending_approval': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending Approval' },
      'approved': { color: 'bg-secondary/20 text-foreground', icon: CheckCircle, text: 'Approved' },
      'ordered': { color: 'bg-purple-100 text-purple-800', icon: Package, text: 'Ordered' },
      'partially_received': { color: 'bg-orange-100 text-accent-foreground', icon: Truck, text: 'Partially Received' },
      'material_received': { color: 'bg-primary/10 text-primary', icon: CheckCircle, text: 'Material Received' },
      'reverted': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Reverted' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['pending_approval'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getWorkflowSteps = () => {
    const steps = [
      { key: 'pending_approval', label: 'Pending Approval', stage: 1 },
      { key: 'approved', label: 'Approved', stage: 2 },
      { key: 'ordered', label: 'Ordered', stage: 3 },
      { key: 'partially_received', label: 'Partially Received', stage: 4 },
      { key: 'material_received', label: 'Material Received', stage: 5 }
    ];

    return steps.map((step, index) => {
      const isActive = demoRequest.progressStage >= step.stage;
      const isCurrent = demoRequest.progressStage === step.stage;
      
      return (
        <div key={step.key} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
            isActive 
              ? isCurrent 
                ? 'bg-primary text-white' 
                : 'bg-primary text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step.stage}
          </div>
          <div className={`ml-2 text-sm ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
            {step.label}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-2 ${isActive ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-foreground" />
            Material Request Workflow Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Request Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{demoRequest.materialName}</h3>
                <p className="text-sm text-muted-foreground">
                  Request ID: {demoRequest.id} • Quantity: {demoRequest.quantity}
                </p>
              </div>
              {getStatusBadge(demoRequest.status)}
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">{demoRequest.statusDescription}</p>
            </div>
          </div>

          {/* Workflow Progress */}
          <div className="space-y-3">
            <h4 className="font-medium">Workflow Progress</h4>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {getWorkflowSteps()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={openStatusManager} className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Manage Status
            </Button>
            
            {currentUser?.role && (
              <div className="text-sm text-muted-foreground flex items-center">
                Current Role: <Badge variant="outline" className="ml-1">{currentUser.role.replace('_', ' ')}</Badge>
              </div>
            )}
          </div>

          {/* Status History */}
          {demoRequest.statusHistory && demoRequest.statusHistory.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Status History</h4>
              <div className="space-y-2">
                {demoRequest.statusHistory.map((history: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(history.status)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(history.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm">{history.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        By: {history.user}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflow Instructions */}
          <div className="p-4 bg-secondary/10 border border-secondary rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Workflow Instructions</h4>
            <div className="text-sm text-foreground space-y-1">
              <p><strong>Owner:</strong> Can approve or revert requests in "Pending Approval" status</p>
              <p><strong>Supervisor (after approval):</strong> Updates status from "Approved" to "Ordered"</p>
              <p><strong>Supervisor (after ordering):</strong> Updates material receipt details for "Ordered" requests</p>
              <p><strong>If reverted:</strong> The indent form must be resubmitted with corrections</p>
              <p><strong>Partial receipt:</strong> Status becomes "Partially Received" until complete</p>
              <p><strong>Complete receipt:</strong> Status becomes "Material Received"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Status Manager */}
      {selectedRequest && (
        <RequestStatusManager
          request={selectedRequest}
          onStatusUpdate={handleStatusUpdate}
          isOpen={isStatusManagerOpen}
          onClose={() => {
            setIsStatusManagerOpen(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};