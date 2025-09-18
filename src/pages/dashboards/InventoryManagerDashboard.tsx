import { Package, TrendingUp, AlertTriangle, Users, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { StatsCard } from "../../components/StatsCard";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useRole } from "../../contexts/RoleContext";
import { Link } from "react-router-dom";

const InventoryManagerDashboard = () => {
  const { currentUser } = useRole();

  const managerStats = [
    {
      title: "Pending Approvals",
      value: "24",
      description: "Requests waiting",
      icon: Clock,
      trend: "+6 today",
      color: "warning" as const
    },
    {
      title: "Total Stock Value", 
      value: "₹847K",
      description: "Current inventory",
      icon: Package,
      trend: "+2.3% this month",
      color: "success" as const
    },
    {
      title: "Low Stock Items",
      value: "18",
      description: "Need reordering",
      icon: AlertTriangle,
      trend: "-3 resolved",
      color: "warning" as const
    },
    {
      title: "Monthly Requests",
      value: "156",
      description: "All departments", 
      icon: TrendingUp,
      trend: "+12% vs last month",
      color: "primary" as const
    }
  ];

  const pendingRequests = [
    {
      id: "REQ-2024-159",
      material: "Industrial Steel Bars",
      quantity: "100 pcs",
      requestedBy: "John Martinez",
      department: "Production Floor A",
      priority: "high",
      value: "$2,400",
      date: "2024-01-16"
    },
    {
      id: "REQ-2024-160",
      material: "Hydraulic Fluid Premium",
      quantity: "50L",
      requestedBy: "Maria Santos",
      department: "Production Floor B",
      priority: "medium", 
      value: "$850",
      date: "2024-01-16"
    },
    {
      id: "REQ-2024-161",
      material: "Safety Helmets Class A",
      quantity: "25 pcs", 
      requestedBy: "Carlos Rodriguez",
      department: "Safety & Maintenance",
      priority: "low",
      value: "$375",
      date: "2024-01-15"
    }
  ];

  const lowStockAlerts = [
    {
      material: "Steel Plates 5mm",
      currentStock: 12,
      minStock: 50,
      MeasureUnit: "pcs",
      supplier: "SteelCorp Industries",
      lastOrdered: "2024-01-10",
      status: "critical"
    },
    {
      material: "Welding Wire ER70S-6",
      currentStock: 8,
      minStock: 20,
      MeasureUnit: "kg",
      supplier: "WeldTech Supply",
      lastOrdered: "2024-01-12",
      status: "low"
    },
    {
      material: "Cutting Oil Premium",
      currentStock: 25,
      minStock: 40,
      MeasureUnit: "L",
      supplier: "Industrial Oils Ltd",
      lastOrdered: "2024-01-08",
      status: "low"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-secondary/100 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500 text-white';
      case 'low': return 'bg-orange-500 text-white';
      case 'sufficient': return 'bg-secondary/100 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      {/* Welcome Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
          Inventory Control Center
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Welcome {currentUser?.name} • Manage approvals, stock levels, and procurement
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <Button size="lg" className="gap-2 w-full sm:w-auto text-sm sm:text-base">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          Bulk Approve
        </Button>
       
        <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto text-sm sm:text-base" asChild>
          <Link to="/generate-report">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            Generate Report
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto text-sm sm:text-base" asChild>
          <Link to="/analytics">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Analytics
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {managerStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Pending Approvals */}
        <Card className="card-friendly">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
              Pending Approvals
            </CardTitle>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
              <Link to="/requests">Manage All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-3 sm:p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <span className="font-medium text-foreground text-sm sm:text-base truncate">{request.material}</span>
                      <Badge className={`${getPriorityColor(request.priority)} text-xs w-fit`}>
                        {request.priority}
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <div>{request.quantity} • Requested by {request.requestedBy}</div>
                      <div className="truncate">{request.department} • Value: {request.value}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <Button size="sm" className="gap-1 w-full sm:w-auto text-xs sm:text-sm">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    Approve
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto text-xs sm:text-sm">
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    Reject
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="card-friendly">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {lowStockAlerts.map((item, index) => (
              <div key={index} className="p-3 sm:p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <span className="font-medium text-foreground text-sm sm:text-base truncate">{item.material}</span>
                      <Badge className={`${getStockStatusColor(item.status)} text-xs w-fit`}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <div>Current: {item.currentStock} {item.MeasureUnit} • Min: {item.minStock} {item.MeasureUnit}</div>
                      <div className="truncate">Supplier: {item.supplier} • Last ordered: {item.lastOrdered}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    Reorder Now
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                    Update Stock
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryManagerDashboard;