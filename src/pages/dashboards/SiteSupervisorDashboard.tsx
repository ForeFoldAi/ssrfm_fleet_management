import { Plus, Clock, CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useRole } from "../../contexts/RoleContext";
import { Link } from "react-router-dom";

const SiteSupervisorDashboard = () => {
  const { currentUser } = useRole();

  const myRequests = [
    {
      id: "REQ-2024-201",
      material: "Steel Cutting Blades",
      quantity: "25 pieces",
      value: "₹12,500",
      priority: "medium",
      date: "2024-01-17",
      status: "pending_manager",
      statusDescription: "Waiting for manager approval",
      currentStage: "Manager Review"
    },
    {
      id: "REQ-2024-189",
      material: "CNC Machine Upgrade Kit",
      quantity: "1 unit",
      value: "₹28,500",
      priority: "high",
      date: "2024-01-16",
      status: "manager_approved",
      statusDescription: "Approved by manager, pending owner approval",
      currentStage: "Owner Review"
    },
    {
      id: "REQ-2024-180",
      material: "Industrial Lubricants",
      quantity: "100 liters",
      value: "₹15,000",
      priority: "medium",
      date: "2024-01-10",
      status: "fully_approved",
      statusDescription: "Fully approved and in procurement",
      currentStage: "Procurement"
    },
    {
      id: "REQ-2024-175",
      material: "Safety Equipment Bundle",
      quantity: "30 sets",
      value: "₹45,000",
      priority: "high",
      date: "2024-01-08",
      status: "completed",
      statusDescription: "Request completed and delivered",
      currentStage: "Completed"
    },
    {
      id: "REQ-2024-185",
      material: "Premium Tool Set",
      quantity: "5 sets",
      value: "₹15,200",
      priority: "low",
      date: "2024-01-05",
      status: "rejected",
      statusDescription: "Rejected by company owner",
      currentStage: "Rejected"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_manager': return 'bg-blue-500 text-white';
      case 'manager_approved': return 'bg-purple-500 text-white';
      case 'fully_approved': return 'bg-blue-500 text-white';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_manager':
      case 'manager_approved':
        return <Clock className="w-4 h-4" />;
      case 'fully_approved':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Welcome back, {currentUser?.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          {currentUser?.department} • Manage your material requests
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 lg:gap-8">
        {/* New Request Section */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-6 h-6 text-primary" />
              New Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Submit New Material Request
              </h3>
              <p className="text-muted-foreground mb-6">
                Request materials, tools, or equipment for your operations. 
                Track approval status in real-time.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link to="/material-request">
                  <Plus className="w-5 h-5" />
                  Create New Request
                </Link>
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-foreground mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to="/my-requests">
                    <Eye className="w-4 h-4" />
                    View All My Requests
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to="/materials">
                    <CheckCircle className="w-4 h-4" />
                    Browse Materials Catalog
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Status Section */}
        <Card className="card-friendly">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Request Status
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/my-requests">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRequests.slice(0, 4).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{request.material}</span>
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {request.quantity} • {request.value} • {request.date}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.statusDescription}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(request.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(request.status)}
                      {request.currentStage}
                    </span>
                  </Badge>
                </div>
              </div>
            ))}
            
            {myRequests.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No requests yet. Create your first material request to get started.
                </p>
                <Button asChild className="mt-4 gap-2">
                  <Link to="/material-request">
                    <Plus className="w-4 h-4" />
                    Create Request
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card className="card-friendly">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {myRequests.filter(r => r.status === 'pending_manager' || r.status === 'manager_approved').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {myRequests.filter(r => r.status === 'fully_approved' || r.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {myRequests.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {myRequests.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ₹{(myRequests.reduce((sum, req) => 
                  sum + parseInt(req.value.replace('₹', '').replace(',', '')), 0
                ) / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSupervisorDashboard;