import { useState } from "react";
import { Plus, Search, List, Table, Filter, Check, X, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";

const RequestsList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"table" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const requests = [
    {
      id: "REQ-001",
      material: "Steel Rods (20mm)",
      quantity: "500 kg",
      machine: "Machine #45",
      location: "Production Line A",
      priority: "High",
      status: "Pending",
      requestedDate: "2024-01-15",
      requestedBy: "John Smith",
      purpose: "Maintenance replacement for worn parts"
    },
    {
      id: "REQ-002", 
      material: "Hydraulic Oil",
      quantity: "20 liters",
      machine: "Machine #12",
      location: "Production Line B",
      priority: "Medium",
      status: "Approved",
      requestedDate: "2024-01-14",
      requestedBy: "Maria Garcia",
      purpose: "Regular maintenance oil change"
    },
    {
      id: "REQ-003",
      material: "Industrial Bolts",
      quantity: "100 pieces",
      machine: "Machine #33",
      location: "Assembly Line",
      priority: "Low",
      status: "In Progress",
      requestedDate: "2024-01-13",
      requestedBy: "Ahmed Hassan",
      purpose: "Assembly line equipment upgrade"
    },
    {
      id: "REQ-004",
      material: "Concrete Mix",
      quantity: "2 tons",
      machine: "Machine #78",
      location: "Construction Site",
      priority: "High",
      status: "Rejected",
      requestedDate: "2024-01-12",
      requestedBy: "Sarah Johnson",
      purpose: "Foundation repair work"
    }
  ];

  const statusFilters = ["All", "Pending", "Approved", "Rejected", "In Progress"];

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.machine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      "Pending": "badge-status bg-warning/10 text-warning ring-1 ring-warning/20",
      "Approved": "badge-status bg-success/10 text-success ring-1 ring-success/20",
      "In Progress": "badge-status bg-primary/10 text-primary ring-1 ring-primary/20",
      "Rejected": "badge-status bg-destructive/10 text-destructive ring-1 ring-destructive/20"
    };
    return badges[status as keyof typeof badges] || "badge-status bg-muted text-muted-foreground";
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      "High": "badge-status bg-destructive/10 text-destructive ring-1 ring-destructive/20",
      "Medium": "badge-status bg-warning/10 text-warning ring-1 ring-warning/20",
      "Low": "badge-status bg-primary/10 text-primary ring-1 ring-primary/20"
    };
    return badges[priority as keyof typeof badges] || "badge-status bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            All Material Requests
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Manage and track all material requests from your team
          </p>
        </div>
        
        <Button 
          onClick={() => navigate("/material-request")}
          className="btn-primary w-full sm:w-auto text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          New Request
        </Button>
      </div>

      {/* Filters and Controls */}
      <div className="card-friendly p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="rounded-full text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
              >
                {status}
                {status !== "All" && (
                  <span className="ml-1 sm:ml-2 bg-white/20 px-1 sm:px-2 py-0.5 rounded-full text-xs">
                    {requests.filter(r => r.status === status).length}
                  </span>
                )}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-friendly h-10 sm:h-auto"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex rounded-xl border border-border overflow-hidden bg-secondary w-fit">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none px-3 sm:px-4"
              >
                <List className="w-4 h-4" />
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm">List</span>
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-none px-3 sm:px-4"
              >
                <Table className="w-4 h-4" />
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm">Table</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-xs sm:text-sm text-muted-foreground">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </div>

      {/* Content */}
      <div className="card-friendly p-4 sm:p-6">
        {viewMode === "list" ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border border-border rounded-xl p-4 sm:p-6 hover:bg-secondary/30 transition-colors duration-200">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="text-base sm:text-lg font-bold text-foreground">{request.id}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`${getStatusBadge(request.status)} text-xs`}>
                        {request.status}
                      </span>
                        <span className={`${getPriorityBadge(request.priority)} text-xs`}>
                        {request.priority} Priority
                      </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Material & Quantity</p>
                        <p className="font-semibold text-foreground text-sm sm:text-base truncate">{request.material}</p>
                        <p className="text-primary font-bold text-sm sm:text-base">{request.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Machine & Location</p>
                        <p className="font-semibold text-foreground text-sm sm:text-base truncate">{request.machine}</p>
                        <p className="text-muted-foreground text-sm truncate">{request.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-0">
                      <span className="truncate">Requested by {request.requestedBy}</span>
                      <span>{request.requestedDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {request.status === "Pending" && (
                      <>
                        <Button variant="default" size="sm" className="bg-success hover:bg-secondary/30 text-xs sm:text-sm w-full sm:w-auto">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Request ID</th>
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Material</th>
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Quantity</th>
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Machine</th>
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Priority</th>
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Status</th>
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Date</th>
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-border hover:bg-[#E5E5E5] transition-colors duration-200">
                      <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium text-foreground text-xs sm:text-sm">{request.id}</td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2 text-muted-foreground text-xs sm:text-sm truncate max-w-32">{request.material}</td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2 font-semibold text-primary text-xs sm:text-sm">{request.quantity}</td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2 text-muted-foreground text-xs sm:text-sm truncate max-w-24">{request.machine}</td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2">
                        <span className={`${getPriorityBadge(request.priority)} text-xs`}>
                        {request.priority}
                      </span>
                    </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2">
                        <span className={`${getStatusBadge(request.status)} text-xs`}>
                        {request.status}
                      </span>
                    </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2 text-muted-foreground text-xs sm:text-sm">{request.requestedDate}</td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2">
                      <div className="flex gap-1">
                        {request.status === "Pending" && (
                          <>
                              <Button variant="ghost" size="sm" className="text-success hover:bg-secondary/30 h-7 w-7 sm:h-8 sm:w-8 p-0">
                                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-7 w-7 sm:h-8 sm:w-8 p-0">
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </>
                        )}
                          <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No requests found</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "No requests match the selected filters"}
            </p>
            <Button 
              onClick={() => navigate("/material-request")}
              className="btn-primary text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Create First Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsList;