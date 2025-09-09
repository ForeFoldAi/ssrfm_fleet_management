import { useState } from "react";
import { Clock, CheckCircle, XCircle, Eye, FileText, Plus, AlertTriangle, User, Calendar, Package, Truck, CheckSquare, List, Table as TableIcon, ChevronRight, ChevronDown, MoreVertical } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Link } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";

const SupervisorRequests = () => {
  const { currentUser } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "table">("table");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // SSRFM Status workflow: Pending Approval → Approved → Ordered → Issued → Completed
  const allRequests = [
    {
      id: "REQ-2024-201",
      materialName: "Bearings",
      specifications: "SKF Deep Grove Ball Bearing 6205-2RS, Inner Dia: 25mm, Outer Dia: 52mm",
      maker: "SKF",
      quantity: "4 pieces",
      value: "₹2,800",
      priority: "medium",
      materialPurpose: "Replace worn bearings in flour grinding machine #3",
      machineId: "MACHINE-003",
      machineName: "Flour Grinding Unit #3",
      date: "2024-01-17",
      status: "pending_approval",
      statusDescription: "Waiting for management approval",
      currentStage: "Pending Approval",
      progressStage: 1,
      requestedBy: "John Martinez",
      additionalNotes: "Urgent replacement needed to avoid production downtime"
    },
    {
      id: "REQ-2024-189",
      materialName: "Conveyor Belts",
      specifications: "Rubber Conveyor Belt, Width: 600mm, Length: 15m, Food Grade",
      maker: "Continental Belting",
      quantity: "15 meters",
      value: "₹18,500",
      priority: "high",
      materialPurpose: "Replace damaged conveyor belt in packaging line",
      machineId: "MACHINE-001",
      machineName: "Packaging Conveyor System",
      date: "2024-01-16",
      status: "approved",
      statusDescription: "Approved by management, ready for procurement",
      currentStage: "Approved",
      progressStage: 2,
      requestedBy: "John Martinez",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-17",
      additionalNotes: "High priority for production continuity"
    },
    {
      id: "REQ-2024-180",
      materialName: "Motor Oil",
      specifications: "SAE 20W-50 Heavy Duty Motor Oil, API CF-4/SG Grade",
      maker: "Castrol",
      quantity: "20 liters",
      value: "₹3,200",
      priority: "medium",
      materialPurpose: "Routine maintenance for grinding motors",
      machineId: "MACHINE-002",
      machineName: "Primary Grinding Motors",
      date: "2024-01-10",
      status: "ordered",
      statusDescription: "Materials ordered from supplier",
      currentStage: "Ordered",
      progressStage: 3,
      requestedBy: "John Martinez",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-12",
      orderedDate: "2024-01-13",
      expectedDelivery: "2024-01-20",
      supplierName: "Industrial Supplies Co."
    },
    {
      id: "REQ-2024-175",
      materialName: "Grinding Stones",
      specifications: "Natural Grinding Stone, Diameter: 1200mm, Thickness: 150mm",
      maker: "Stone Craft Industries",
      quantity: "2 pieces",
      value: "₹45,000",
      priority: "high",
      materialPurpose: "Replace worn grinding stones in main mill",
      machineId: "MACHINE-004",
      machineName: "Main Flour Mill",
      date: "2024-01-08",
      status: "issued",
      statusDescription: "Materials issued and installed",
      currentStage: "Issued",
      progressStage: 4,
      requestedBy: "John Martinez",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-09",
      orderedDate: "2024-01-10",
      deliveredDate: "2024-01-14",
      issuedDate: "2024-01-15",
      receivedBy: "Maintenance Team"
    },
    {
      id: "REQ-2024-170",
      materialName: "Safety Equipment",
      specifications: "Safety Helmets Class A, Safety Goggles, Work Gloves - Complete Set",
      maker: "3M Safety",
      quantity: "10 sets",
      value: "₹8,500",
      priority: "medium",
      materialPurpose: "Annual safety equipment replacement for mill workers",
      machineId: "GENERAL",
      machineName: "General Safety Requirements",
      date: "2024-01-05",
      status: "completed",
      statusDescription: "Request completed with documentation",
      currentStage: "Completed",
      progressStage: 5,
      requestedBy: "John Martinez",
      approvedBy: "Robert Williams",
      approvedDate: "2024-01-06",
      orderedDate: "2024-01-07",
      deliveredDate: "2024-01-12",
      issuedDate: "2024-01-13",
      completedDate: "2024-01-14",
      receivedBy: "Production Workers",
      completionNotes: "All safety equipment distributed and documented"
    },
    {
      id: "REQ-2024-185",
      materialName: "Electrical Wires",
      specifications: "Copper Wire 2.5mm² XLPE Insulated, IS 694 Standard",
      maker: "Havells",
      quantity: "50 meters",
      value: "₹2,250",
      priority: "low",
      materialPurpose: "Electrical maintenance and rewiring",
      machineId: "MACHINE-005",
      machineName: "Control Panel Systems",
      date: "2024-01-03",
      status: "rejected",
      statusDescription: "Rejected - insufficient justification",
      currentStage: "Rejected",
      progressStage: 0,
      requestedBy: "John Martinez",
      rejectedBy: "Sarah Chen",
      rejectedDate: "2024-01-05",
      rejectedAt: "manager_level",
      reason: "Current wiring is adequate. Defer to next maintenance cycle."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-blue-500 text-white';
      case 'approved': return 'bg-blue-500 text-white';
      case 'ordered': return 'bg-purple-500 text-white';
      case 'issued': return 'bg-orange-500 text-white';
      case 'completed': return 'bg-blue-600 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getProgressColor = (stage: number) => {
    switch (stage) {
      case 1: return 'bg-blue-500';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-purple-500';
      case 4: return 'bg-orange-500';
      case 5: return 'bg-blue-600';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'ordered':
        return <Package className="w-4 h-4" />;
      case 'issued':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckSquare className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const toggleRowExpansion = (requestId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(requestId)) {
      newExpandedRows.delete(requestId);
    } else {
      newExpandedRows.add(requestId);
    }
    setExpandedRows(newExpandedRows);
  };

  const filteredRequests = allRequests.filter(request => {
    const matchesSearch = request.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.maker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesPriority = filterPriority === "all" || request.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingRequests = filteredRequests.filter(req => 
    req.status === 'pending_approval'
  );
  const approvedRequests = filteredRequests.filter(req => 
    req.status === 'approved' || req.status === 'ordered' || req.status === 'issued' || req.status === 'completed'
  );
  const rejectedRequests = filteredRequests.filter(req => req.status === 'rejected');

  // SSRFM Progress Bar: Submit → Approval → Ordered → Issued → Completed
  const ProgressBar = ({ stage }: { stage: number }) => {
    const stages = ['Submit', 'Approved', 'Ordered', 'Issued', 'Complete'];
    return (
      <div className="my-3">
        {/* Desktop Progress Bar */}
        <div className="hidden sm:flex items-center space-x-2">
        {stages.map((stageName, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              index < stage ? getProgressColor(index + 1) : 'bg-gray-300'
            }`}>
              {index + 1}
            </div>
            {index < stages.length - 1 && (
              <div className={`w-12 h-1 mx-2 ${
                index < stage - 1 ? getProgressColor(index + 1) : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
        </div>

        {/* Mobile Progress Bar - Vertical */}
        <div className="sm:hidden space-y-2">
          {stages.map((stageName, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                index < stage ? getProgressColor(index + 1) : 'bg-gray-300'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <span className={`text-xs font-medium ${
                  index < stage ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {stageName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced List View Component - Table-like format with expandable details
  const ListView = ({ requests }: { requests: any[] }) => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="min-w-[200px]">REQUEST</TableHead>
                <TableHead className="min-w-[120px]">CONTACT</TableHead>
                <TableHead className="min-w-[120px]">COMPANY</TableHead>
                <TableHead className="min-w-[100px]">STATUS</TableHead>
                <TableHead className="min-w-[140px]">SUBMITTED DATE</TableHead>
                <TableHead className="min-w-[140px]">LAST UPDATED</TableHead>
                <TableHead className="min-w-[140px]">NEXT ACTION DATE</TableHead>
                <TableHead className="min-w-[100px]">PRIORITY</TableHead>
                <TableHead className="min-w-[100px]">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <>
                  <TableRow key={request.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => toggleRowExpansion(request.id)}
                      >
                        {expandedRows.has(request.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-sm">{request.materialName}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {request.materialPurpose}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {request.machineName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.requestedBy}</div>
                      <div className="text-xs text-muted-foreground">{request.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.maker}</div>
                      <div className="text-xs text-muted-foreground">Supplier</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)} variant="secondary">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          <span className="text-xs">{request.currentStage}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.date}</div>
                      <div className="text-xs text-muted-foreground">Submitted</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {request.approvedDate || request.orderedDate || request.issuedDate || request.completedDate || request.rejectedDate || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.approvedBy || request.rejectedBy || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm px-2 py-1 rounded ${
                        request.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'ordered' ? 'bg-purple-100 text-purple-800' :
                        request.status === 'issued' ? 'bg-orange-100 text-orange-800' :
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.expectedDelivery || request.issuedDate || request.completedDate || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(request.priority)} variant="outline">
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Detail Row */}
                  {expandedRows.has(request.id) && (
                    <TableRow>
                      <TableCell colSpan={10} className="p-0">
                        <div className="bg-muted/30 p-6 border-t">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Request Details */}
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-lg mb-3">Request Details</h3>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-muted-foreground">Request ID:</span>
                                      <div className="font-medium">{request.id}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Quantity:</span>
                                      <div className="font-medium">{request.quantity}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Value:</span>
                                      <div className="font-medium">{request.value}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Machine ID:</span>
                                      <div className="font-medium">{request.machineId}</div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-muted-foreground">Specifications:</span>
                                    <div className="text-sm mt-1 p-3 bg-background rounded border">
                                      {request.specifications}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-muted-foreground">Purpose:</span>
                                    <div className="text-sm mt-1">{request.materialPurpose}</div>
                                  </div>
                                  
                                  {request.additionalNotes && (
                                    <div>
                                      <span className="font-medium text-muted-foreground">Additional Notes:</span>
                                      <div className="text-sm mt-1 p-3 bg-background rounded border">
                                        {request.additionalNotes}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Column - Status & Progress */}
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-lg mb-3">Status & Progress</h3>
                                
                                {/* Progress Bar */}
                                <ProgressBar stage={request.progressStage} />
                                
                                {/* Status Information */}
                                <div className="space-y-3">
                                  <div className="p-3 bg-background rounded border">
                                    <div className="text-sm font-medium mb-2">Current Status</div>
                                    <div className="text-sm text-muted-foreground">{request.statusDescription}</div>
                                  </div>
                                  
                                  {/* Status-specific information */}
                                  {request.status === 'approved' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <div className="text-sm">
                                        <strong className="text-blue-800">Approved:</strong> {request.approvedBy} on {request.approvedDate}
                                      </div>
                                      <div className="text-xs text-blue-600 mt-1">Ready for procurement</div>
                                    </div>
                                  )}

                                  {request.status === 'ordered' && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                      <div className="text-sm space-y-1">
                                        <div><strong className="text-purple-800">Ordered:</strong> {request.orderedDate}</div>
                                        <div><strong className="text-purple-800">Supplier:</strong> {request.supplierName}</div>
                                        <div><strong className="text-purple-800">Expected Delivery:</strong> {request.expectedDelivery}</div>
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'issued' && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                      <div className="text-sm space-y-1">
                                        <div><strong className="text-orange-800">Issued:</strong> {request.issuedDate}</div>
                                        <div><strong className="text-orange-800">Received By:</strong> {request.receivedBy}</div>
                                        <div><strong className="text-orange-800">Delivered:</strong> {request.deliveredDate}</div>
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'completed' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <div className="text-sm space-y-1">
                                        <div><strong className="text-blue-800">Completed:</strong> {request.completedDate}</div>
                                        <div><strong className="text-blue-800">Received By:</strong> {request.receivedBy}</div>
                                        {request.completionNotes && (
                                          <div><strong className="text-blue-800">Notes:</strong> {request.completionNotes}</div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {request.status === 'rejected' && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                          <strong className="text-red-800 text-sm">Rejected:</strong>
                                          <p className="text-red-700 text-sm mt-1 break-words">{request.reason}</p>
                                          <p className="text-red-600 text-xs mt-2">
                                            Rejected by {request.rejectedBy} on {request.rejectedDate}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t mt-6">
                            <Button variant="outline" className="gap-2">
                              <Eye className="w-4 h-4" />
                              View Full Details
                            </Button>
                            {request.status === 'rejected' && (
                              <Button variant="outline" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Resubmit Request
                              </Button>
                            )}
                            {(request.status === 'ordered' || request.status === 'issued' || request.status === 'completed') && (
                              <Button variant="outline" className="gap-2">
                                <FileText className="w-4 h-4" />
                                Track Status
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  // Compact Table View Component
  const TableView = ({ requests }: { requests: any[] }) => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Request ID</TableHead>
                <TableHead className="min-w-[150px]">Material</TableHead>
                <TableHead className="min-w-[100px]">Quantity</TableHead>
                <TableHead className="min-w-[100px]">Value</TableHead>
                <TableHead className="min-w-[100px]">Priority</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Date</TableHead>
                <TableHead className="min-w-[100px]">Machine</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.materialName}</div>
                      <div className="text-xs text-muted-foreground">{request.maker}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{request.quantity}</TableCell>
                  <TableCell className="text-sm font-medium">{request.value}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(request.priority)} variant="secondary">
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        <span className="text-xs">{request.currentStage}</span>
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{request.date}</TableCell>
                  <TableCell className="text-sm">{request.machineName}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                        <Eye className="w-3 h-3" />
                      </Button>
                      {request.status === 'rejected' && (
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                          <Plus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
          My Requests
        </h1>
      </div>

      {/* Filters and New Request Button */}
      <Card className="card-friendly">
        <CardContent className="p-4 sm:pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              <div className="flex-1">
                <Input
                  placeholder="Search by material, request ID, or maker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 sm:h-auto"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48 h-10 sm:h-auto">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild className="gap-2 w-full sm:w-auto sm:self-start h-10 sm:h-auto">
              <Link to="/material-request">
                <Plus className="w-4 h-4" />
                New Request
              </Link>
            </Button>
            </div>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="flex items-center gap-2"
          >
            <TableIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 sm:p-2 bg-secondary rounded-xl">
          <TabsTrigger 
            value="all" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="sm:hidden">All</span>
            <span className="hidden sm:inline">All</span> ({filteredRequests.length})
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="sm:hidden">Pending</span>
            <span className="hidden sm:inline">Pending</span> ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="sm:hidden">Progress</span>
            <span className="hidden sm:inline">In Progress</span> ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger 
            value="rejected" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="sm:hidden">Rejected</span>
            <span className="hidden sm:inline">Rejected</span> ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* All Requests Tab */}
        <TabsContent value="all" className="space-y-3 sm:space-y-4">
          {viewMode === "table" ? (
            <TableView requests={filteredRequests} />
          ) : (
            <ListView requests={filteredRequests} />
          )}
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-3 sm:space-y-4">
          {viewMode === "table" ? (
            <TableView requests={pendingRequests} />
          ) : (
            <ListView requests={pendingRequests} />
          )}
        </TabsContent>

        {/* In Progress Tab */}
        <TabsContent value="approved" className="space-y-3 sm:space-y-4">
          {viewMode === "table" ? (
            <TableView requests={approvedRequests} />
          ) : (
            <ListView requests={approvedRequests} />
          )}
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-3 sm:space-y-4">
          {viewMode === "table" ? (
            <TableView requests={rejectedRequests} />
          ) : (
            <ListView requests={rejectedRequests} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisorRequests;
