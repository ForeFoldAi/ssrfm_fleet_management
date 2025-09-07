import { Shield, Users, Settings, Activity, Database, AlertTriangle, TrendingUp, Server } from "lucide-react";
import { StatsCard } from "../../components/StatsCard";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useRole } from "../../contexts/RoleContext";
import { Link } from "react-router-dom";

const SystemAdministratorDashboard = () => {
  const { currentUser } = useRole();

  const adminStats = [
    {
      title: "System Health",
      value: "99.8%",
      description: "Uptime this month",
      icon: Server,
      trend: "All systems operational",
      color: "success" as const
    },
    {
      title: "Active Users",
      value: "147",
      description: "Currently online",
      icon: Users,
      trend: "+8 new this week",
      color: "primary" as const
    },
    {
      title: "High-Value Requests",
      value: "12",
      description: "Pending admin approval",
      icon: Shield,
      trend: "$85K total value",
      color: "warning" as const
    },
    {
      title: "System Alerts",
      value: "3",
      description: "Require attention",
      icon: AlertTriangle,
      trend: "2 resolved today",
      color: "warning" as const
    }
  ];

  const highValueRequests = [
    {
      id: "REQ-2024-162",
      material: "CNC Replacement Parts Kit",
      quantity: "1 kit",
      requestedBy: "Production Manager",
      department: "Production Floor A",
      value: "$15,750",
      priority: "critical",
      date: "2024-01-16",
      reason: "Machine breakdown affecting production line"
    },
    {
      id: "REQ-2024-163", 
      material: "Industrial Generator 50kW",
      quantity: "1 unit",
      requestedBy: "Maintenance Head",
      department: "Facilities",
      value: "$28,500",
      priority: "high",
      date: "2024-01-15",
      reason: "Backup power system upgrade"
    },
    {
      id: "REQ-2024-164",
      material: "Safety Equipment Bundle",
      quantity: "50 sets",
      requestedBy: "Safety Officer",
      department: "Safety & Compliance",
      value: "$8,200",
      priority: "medium",
      date: "2024-01-15",
      reason: "Annual safety equipment refresh"
    }
  ];

  const systemAlerts = [
    {
      type: "security",
      title: "Multiple failed login attempts",
      description: "IP: 192.168.1.100 - 15 attempts in last hour",
      severity: "high",
      time: "10 minutes ago",
      action: "Block IP"
    },
    {
      type: "performance", 
      title: "Database query performance degraded",
      description: "Response time increased by 45% in materials table",
      severity: "medium",
      time: "2 hours ago",
      action: "Optimize"
    },
    {
      type: "storage",
      title: "Storage space warning",
      description: "File storage at 85% capacity",
      severity: "low",
      time: "1 day ago", 
      action: "Archive"
    }
  ];

  const recentUsers = [
    {
      name: "Alice Johnson",
      role: "Inventory Manager",
      department: "Warehouse A",
      lastActive: "5 minutes ago",
      status: "online",
      requests: 23
    },
    {
      name: "Bob Chen",
      role: "Site Supervisor", 
      department: "Production Floor B",
      lastActive: "1 hour ago",
      status: "away",
      requests: 45
    },
    {
      name: "Carol Williams",
      role: "Site Supervisor",
      department: "Quality Control",
      lastActive: "3 hours ago",
      status: "offline",
      requests: 12
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-blue-500 text-white';
      case 'away': return 'bg-yellow-500 text-white';
      case 'offline': return 'bg-gray-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          System Administration Center
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome {currentUser?.name} • Full system control and monitoring
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        <Button size="lg" className="gap-2">
          <Users className="w-5 h-5" />
          Manage Users
        </Button>
        <Button variant="outline" size="lg" className="gap-2">
          <Settings className="w-5 h-5" />
          System Config
        </Button>
        <Button variant="outline" size="lg" className="gap-2">
          <Database className="w-5 h-5" />
          Database Admin
        </Button>
        <Button variant="outline" size="lg" className="gap-2">
          <Activity className="w-5 h-5" />
          Audit Logs
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* High-Value Requests */}
        <Card className="card-friendly">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-warning" />
              High-Value Approvals
            </CardTitle>
            <Button variant="outline" size="sm">
              View All Requests
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {highValueRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{request.material}</span>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Value: {request.value} • By: {request.requestedBy}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.department} • {request.date}
                    </div>
                    <div className="text-sm text-muted-foreground italic mt-1">
                      Reason: {request.reason}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="gap-1">
                    <Shield className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button variant="destructive" size="sm">
                    Reject
                  </Button>
                  <Button variant="ghost" size="sm">
                    Review Details
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemAlerts.map((alert, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{alert.title}</span>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {alert.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alert.time}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    {alert.action}
                  </Button>
                  <Button variant="ghost" size="sm">
                    Investigate
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* User Activity */}
      <Card className="card-friendly">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Recent User Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUsers.map((user, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.role}</div>
                  </div>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {user.department} • {user.requests} requests
                </div>
                <div className="text-xs text-muted-foreground">
                  Last active: {user.lastActive}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAdministratorDashboard;