import { useState } from "react";
import { Shield, CheckCircle, XCircle, Clock, FileText, AlertTriangle, User, Calendar, IndianRupee, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "../hooks/use-toast";

const ApprovalCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Requests pending manager approval (first stage)


  // Requests approved by manager, pending company owner approval (second stage)
  const pendingOwnerApproval = [
    {
      id: "REQ-2024-189",
      material: "CNC Machine Upgrade Kit",
      quantity: "1 unit",
      requestedBy: "John Martinez",
      role: "Site Supervisor",
      department: "Production Floor A",
      value: "₹28,500",
      priority: "high",
      businessCase: "Increase production capacity by 15% and reduce downtime",
      justification: "Current machine is 8 years old and requires frequent maintenance",
      expectedROI: "18 months",
      date: "2024-01-16",
      urgency: "Critical for Q2 production targets",
      status: "manager_approved",
      managerApprovedBy: "Sarah Chen",
      managerApprovedDate: "2024-01-17",
      managerComments: "Approved - Essential for production efficiency"
    },
    {
      id: "REQ-2024-190",
      material: "Advanced Testing Equipment",
      quantity: "1 set",
      requestedBy: "Carol Williams", 
      role: "Site Supervisor",
      department: "Quality Control",
      value: "₹35,200",
      priority: "medium",
      businessCase: "Reduce quality inspection time by 40% and improve accuracy",
      justification: "Current testing equipment is outdated and slowing production",
      expectedROI: "14 months",
      date: "2024-01-15",
      urgency: "Needed before next quality audit",
      status: "manager_approved",
      managerApprovedBy: "Sarah Chen",
      managerApprovedDate: "2024-01-16",
      managerComments: "Approved - Will improve quality processes significantly"
    },
    {
      id: "REQ-2024-191",
      material: "Automated Material Handler",
      quantity: "2 units",
      requestedBy: "Maria Santos",
      role: "Site Supervisor", 
      department: "Production Floor B",
      value: "₹42,800",
      priority: "high",
      businessCase: "Eliminate manual handling, improve safety and efficiency",
      justification: "Recent safety incidents require automation upgrade",
      expectedROI: "22 months",
      date: "2024-01-14",
      urgency: "Safety compliance requirement",
      status: "manager_approved",
      managerApprovedBy: "Sarah Chen",
      managerApprovedDate: "2024-01-15",
      managerComments: "Approved - Critical for safety compliance"
    }
  ];

  // Fully approved requests
  const approvedRequests = [
    {
      id: "REQ-2024-180",
      material: "Industrial Lubricants",
      quantity: "100 liters",
      requestedBy: "Sam Wilson",
      role: "Site Supervisor",
      department: "Maintenance",
      value: "₹15,000",
      priority: "medium",
      date: "2024-01-10",
      status: "fully_approved",
      managerApprovedBy: "Sarah Chen",
      managerApprovedDate: "2024-01-11",
      ownerApprovedBy: "Robert Williams",
      ownerApprovedDate: "2024-01-12",
      procurementStatus: "In Progress"
    },
    {
      id: "REQ-2024-181",
      material: "Replacement Filters",
      quantity: "20 units",
      requestedBy: "Lisa Chen",
      role: "Site Supervisor",
      department: "Quality Control",
      value: "₹6,500",
      priority: "low",
      date: "2024-01-09",
      status: "fully_approved",
      managerApprovedBy: "Sarah Chen",
      managerApprovedDate: "2024-01-10",
      ownerApprovedBy: "Robert Williams",
      ownerApprovedDate: "2024-01-11",
      procurementStatus: "Completed"
    }
  ];

  // Rejected requests
  const rejectedRequests = [
    {
      id: "REQ-2024-185",
      material: "Premium Tool Set",
      quantity: "5 sets",
      requestedBy: "Mike Johnson",
      role: "Site Supervisor",
      department: "Maintenance",
      value: "₹15,200",
      priority: "low",
      rejectedDate: "2024-01-12",
      rejectedBy: "Robert Williams",
      rejectedAt: "owner_level",
      reason: "Insufficient budget justification - existing tools adequate",
      originalDate: "2024-01-10"
    },
    {
      id: "REQ-2024-186",
      material: "Office Furniture Upgrade",
      quantity: "1 set",
      requestedBy: "Lisa Chen",
      role: "Site Supervisor",
      department: "Administration",
      value: "₹22,500",
      priority: "low",
      rejectedDate: "2024-01-11",
      rejectedBy: "Sarah Chen",
      rejectedAt: "manager_level",
      reason: "Non-essential expense - defer to next fiscal year",
      originalDate: "2024-01-08"
    }
  ];

  const handleManagerApprove = (requestId: string) => {
    toast({
      title: "Request Approved by Manager",
      description: `Request ${requestId} has been approved and forwarded to Company Owner.`,
    });
  };

  const handleManagerReject = (requestId: string) => {
    toast({
      title: "Request Rejected by Manager", 
      description: `Request ${requestId} has been rejected and supervisor will be notified.`,
      variant: "destructive",
    });
  };

  const handleOwnerApprove = (requestId: string) => {
    toast({
      title: "Request Fully Approved",
      description: `Request ${requestId} has been approved and will proceed to procurement.`,
    });
  };

  const handleOwnerReject = (requestId: string) => {
    toast({
      title: "Request Rejected by Owner", 
      description: `Request ${requestId} has been rejected and will be sent back to supervisor.`,
      variant: "destructive",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_manager': return 'bg-blue-500 text-white';
      case 'manager_approved': return 'bg-purple-500 text-white';
      case 'fully_approved': return 'bg-blue-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getProcurementStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-blue-600';
      case 'Completed': return 'text-blue-600';
      case 'Pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };



  const filteredOwnerRequests = pendingOwnerApproval.filter(request => {
    const matchesSearch = request.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || request.department === filterDepartment;
    const matchesPriority = filterPriority === "all" || request.priority === filterPriority;
    
    return matchesSearch && matchesDepartment && matchesPriority;
  });

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
           Approval Center
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Manage material requests through Manager → Company Owner approval workflow
        </p>
      </div>

      {/* Filters */}
      <Card className="card-friendly">
        <CardContent className="p-4 sm:pt-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by material, supervisor, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 sm:h-auto"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-full sm:w-48 h-10 sm:h-auto">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Production Floor A">Production Floor A</SelectItem>
                  <SelectItem value="Production Floor B">Production Floor B</SelectItem>
                  <SelectItem value="Quality Control">Quality Control</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Facilities">Facilities</SelectItem>
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
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="owner-approval" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-1 sm:p-2 bg-secondary rounded-xl">
          <TabsTrigger 
            value="owner-approval" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Owner Approval ({filteredOwnerRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Approved ({approvedRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rejected" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Rejected ({rejectedRequests.length})</span>
          </TabsTrigger>
        </TabsList>



        {/* Owner Approval Tab */}
        <TabsContent value="owner-approval" className="space-y-3 sm:space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 mb-4">
            <h3 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Stage 2: Company Owner Approval</h3>
            <p className="text-xs sm:text-sm text-purple-800">Requests approved by manager, pending final company owner approval.</p>
          </div>
          
          {filteredOwnerRequests.map((request) => (
            <Card key={request.id} className="card-friendly border-purple-200">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{request.material}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${getPriorityColor(request.priority)} text-xs`}>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {request.value}
                          </Badge>
                          <Badge className={`${getStatusColor(request.status)} text-xs`}>
                            Manager Approved
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{request.requestedBy} ({request.role})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          {request.date}
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                        <strong>Department:</strong> {request.department} • <strong>Quantity:</strong> {request.quantity}
                      </div>
                    </div>
                  </div>

                  {/* Manager Approval Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <strong className="text-blue-800 text-xs sm:text-sm">Manager Approved:</strong>
                        <p className="text-blue-700 text-xs sm:text-sm mt-1 break-words">{request.managerComments}</p>
                        <p className="text-blue-600 text-xs mt-2">
                          Approved by {request.managerApprovedBy} on {request.managerApprovedDate}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <strong className="text-xs sm:text-sm">Business Case:</strong>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{request.businessCase}</p>
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm">Justification:</strong>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{request.justification}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <strong>Expected ROI:</strong> {request.expectedROI}
                      </div>
                      <div>
                        <strong>Urgency:</strong> <span className="break-words">{request.urgency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                    <Button 
                      onClick={() => handleOwnerApprove(request.id)}
                      className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Final Approval
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleOwnerReject(request.id)}
                      className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Reject Request
                    </Button>
                    <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Full Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-3 sm:space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Fully Approved Requests</h3>
            <p className="text-xs sm:text-sm text-blue-800">Requests that have completed both approval stages and are in procurement.</p>
          </div>
          
          {approvedRequests.map((request) => (
            <Card key={request.id} className="card-friendly border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{request.material}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${getPriorityColor(request.priority)} text-xs`}>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {request.value}
                          </Badge>
                          <Badge className={`${getStatusColor(request.status)} text-xs`}>
                            Fully Approved
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{request.requestedBy} ({request.role})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          {request.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xs sm:text-sm font-medium">Procurement Status</div>
                      <div className={`text-xs sm:text-sm ${getProcurementStatusColor(request.procurementStatus)}`}>
                        {request.procurementStatus}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm">
                      <strong>Manager Approved:</strong> {request.managerApprovedBy} on {request.managerApprovedDate}
                    </div>
                    <div className="text-xs sm:text-sm">
                      <strong>Owner Approved:</strong> {request.ownerApprovedBy} on {request.ownerApprovedDate}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                    <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Details
                    </Button>
                    <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      Track Procurement
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
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{request.material}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="destructive" className="text-xs">
                            Rejected at {request.rejectedAt.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {request.value}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{request.requestedBy} ({request.role})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          Rejected: {request.rejectedDate}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <strong className="text-red-800 text-xs sm:text-sm">Rejection Reason:</strong>
                        <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">{request.reason}</p>
                        <p className="text-red-600 text-xs mt-2">
                          Rejected by {request.rejectedBy} on {request.rejectedDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                    <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Original Request
                    </Button>
                    <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      Contact Supervisor
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

export default ApprovalCenter; 