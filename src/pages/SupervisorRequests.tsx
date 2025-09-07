import { useState } from "react";
import { Clock, CheckCircle, XCircle, Eye, FileText, Plus, AlertTriangle, User, Calendar, Package, Truck, CheckSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Link } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";

const SupervisorRequests = () => {
  const { currentUser } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

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

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
          My Requests
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Track all your material requisition requests and their status - SSRFM
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="card-friendly">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{pendingRequests.length}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-friendly">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {filteredRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-friendly">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Ordered</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  {filteredRequests.filter(r => r.status === 'ordered').length}
                </p>
              </div>
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-friendly">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Issued</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">
                  {filteredRequests.filter(r => r.status === 'issued').length}
                </p>
              </div>
              <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-friendly col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  ₹{(filteredRequests.reduce((sum, req) => 
                    sum + parseInt(req.value.replace('₹', '').replace(',', '')), 0
                  ) / 1000).toFixed(0)}K
                </p>
              </div>
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
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
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full sm:w-32 h-10 sm:h-auto">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button asChild className="gap-2 w-full sm:w-auto sm:self-start h-10 sm:h-auto">
              <Link to="/material-request">
                <Plus className="w-4 h-4" />
                New Requisition
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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
          {filteredRequests.map((request) => (
            <Card key={request.id} className="card-friendly">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">{request.materialName}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getPriorityColor(request.priority)} variant="secondary">
                            {request.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            {request.value}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              <span className="text-xs sm:text-sm">{request.currentStage}</span>
                            </span>
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs sm:text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          Submitted: {request.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                          Request ID: {request.id}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                          Maker: {request.maker}
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-3 space-y-1">
                        <div><strong>Quantity:</strong> {request.quantity}</div>
                        <div><strong>Machine:</strong> {request.machineName}</div>
                        <div><strong>Status:</strong> {request.statusDescription}</div>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-3">
                        <strong>Purpose:</strong> {request.materialPurpose}
                      </div>
                      {request.specifications && (
                        <div className="text-xs sm:text-sm text-muted-foreground mb-3">
                          <strong>Specifications:</strong> {request.specifications}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <ProgressBar stage={request.progressStage} />

                  {/* Additional Status Info */}
                  {request.status === 'approved' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs sm:text-sm">
                        <strong className="text-blue-800">Approved:</strong> {request.approvedBy} on {request.approvedDate}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">Ready for procurement</div>
                    </div>
                  )}

                  {request.status === 'ordered' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="text-xs sm:text-sm space-y-1">
                        <div><strong className="text-purple-800">Ordered:</strong> {request.orderedDate}</div>
                        <div><strong className="text-purple-800">Supplier:</strong> {request.supplierName}</div>
                        <div><strong className="text-purple-800">Expected Delivery:</strong> {request.expectedDelivery}</div>
                      </div>
                    </div>
                  )}

                  {request.status === 'issued' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="text-xs sm:text-sm space-y-1">
                        <div><strong className="text-orange-800">Issued:</strong> {request.issuedDate}</div>
                        <div><strong className="text-orange-800">Received By:</strong> {request.receivedBy}</div>
                        <div><strong className="text-orange-800">Delivered:</strong> {request.deliveredDate}</div>
                      </div>
                    </div>
                  )}

                  {request.status === 'completed' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs sm:text-sm space-y-1">
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
                          <strong className="text-red-800 text-xs sm:text-sm">Rejected:</strong>
                          <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">{request.reason}</p>
                          <p className="text-red-600 text-xs mt-2">
                            Rejected by {request.rejectedBy} on {request.rejectedDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                    <Button variant="outline" className="gap-2 text-xs sm:text-sm h-9 sm:h-auto">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Details
                    </Button>
                    {request.status === 'rejected' && (
                      <Button variant="outline" className="gap-2 text-xs sm:text-sm h-9 sm:h-auto">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Resubmit Request
                      </Button>
                    )}
                    {(request.status === 'ordered' || request.status === 'issued' || request.status === 'completed') && (
                      <Button variant="outline" className="gap-2 text-xs sm:text-sm h-9 sm:h-auto">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        Track Status
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-3 sm:space-y-4">
          {pendingRequests.map((request) => (
            <Card key={request.id} className="card-friendly border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">{request.materialName}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            {request.value}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              <span className="text-xs sm:text-sm">{request.currentStage}</span>
                            </span>
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-3 space-y-1">
                        <div><strong>Status:</strong> {request.statusDescription}</div>
                        <div><strong>Purpose:</strong> {request.materialPurpose}</div>
                      </div>
                    </div>
                  </div>

                  <ProgressBar stage={request.progressStage} />

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                    <Button variant="outline" className="gap-2 text-xs sm:text-sm h-9 sm:h-auto">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* In Progress Tab */}
        <TabsContent value="approved" className="space-y-3 sm:space-y-4">
          {approvedRequests.map((request) => (
            <Card key={request.id} className="card-friendly border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">{request.materialName}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            {request.value}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              <span className="text-xs sm:text-sm">{request.currentStage}</span>
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ProgressBar stage={request.progressStage} />

                  {request.status === 'ordered' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="text-xs sm:text-sm">
                        <strong className="text-purple-800">Expected Delivery:</strong> {request.expectedDelivery}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                    <Button variant="outline" className="gap-2 text-xs sm:text-sm h-9 sm:h-auto">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Details
                    </Button>
                    <Button variant="outline" className="gap-2 text-xs sm:text-sm h-9 sm:h-auto">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      Track Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-3 sm:space-y-4">
          {rejectedRequests.map((request) => (
            <Card key={request.id} className="card-friendly border-red-200">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">{request.materialName}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            {request.value}
                          </Badge>
                          <Badge variant="destructive">
                            Rejected
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <strong className="text-red-800 text-xs sm:text-sm">Rejection Reason:</strong>
                        <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">{request.reason}</p>
                        <p className="text-red-600 text-xs mt-2">
                          Rejected by {request.rejectedBy} on {request.rejectedDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                    <Button variant="outline" className="gap-2 text-xs sm:text-sm h-9 sm:h-auto">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Details
                    </Button>
                    <Button className="gap-2 text-xs sm:text-sm h-9 sm:h-auto">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Resubmit Request
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisorRequests; 