import { TrendingUp, IndianRupee, Users, Package, Activity, AlertTriangle, Building2, Target, Shield, Settings, FileText, BarChart3, PieChart, Zap } from "lucide-react";
import { StatsCard } from "../../components/StatsCard";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useRole } from "../../contexts/RoleContext";
import { Link } from "react-router-dom";

const CompanyOwnerDashboard = () => {
  const { currentUser } = useRole();

  const executiveSummaryStats = [
    {
      title: "Total Materials Investment",
      value: "₹8.2M",
      description: "Current inventory value",
      icon: Package,
      trend: "+5.8% vs last quarter",
      color: "primary" as const
    },
    {
      title: "Monthly Operational Costs",
      value: "₹485K",
      description: "All departments combined",
      icon: IndianRupee,
      trend: "-2.3% cost reduction",
      color: "success" as const
    },
    {
      title: "Overall Equipment Effectiveness",
      value: "87.4%",
      description: "Company-wide OEE",
      icon: Zap,
      trend: "+1.8% improvement",
      color: "primary" as const
    },
    {
      title: "Pending High-Value Approvals",
      value: "12",
      description: "Requests >₹10K awaiting approval",
      icon: Shield,
      trend: "₹127K total value",
      color: "warning" as const
    }
  ];

  const departmentPerformance = [
    {
      department: "Production Floor A",
      manager: "John Martinez",
      budgetUtilization: "78%",
      efficiency: "94%",
              monthlySpend: "₹125K",
      status: "excellent",
      savings: "+₹8.2K"
    },
    {
      department: "Production Floor B", 
      manager: "Maria Santos",
      budgetUtilization: "82%",
      efficiency: "91%",
              monthlySpend: "₹118K",
      status: "good",
      savings: "+₹3.1K"
    },
    {
      department: "Quality Control",
      manager: "Carol Williams",
      budgetUtilization: "65%",
      efficiency: "96%",
              monthlySpend: "₹28K",
      status: "excellent",
      savings: "+₹12.8K"
    },
    {
      department: "Inventory Management",
      manager: "Sarah Chen",
      budgetUtilization: "88%",
      efficiency: "89%",
      monthlySpend: "₹45K",
      status: "good",
      savings: "+₹2.4K"
    }
  ];

  const strategicAnalytics = [
    {
      metric: "Material Cost Trends",
      value: "↓ 3.2%",
      description: "Quarterly reduction",
      status: "positive"
    },
    {
      metric: "Supplier Performance",
      value: "92.1%",
      description: "On-time delivery rate",
      status: "good"
    },
    {
      metric: "Machine Utilization",
      value: "84.7%",
      description: "Average across all equipment",
      status: "normal"
    },
    {
      metric: "Waste & Loss Analysis",
      value: "2.1%",
      description: "Of total materials",
      status: "good"
    }
  ];

  const highValueApprovals = [
    {
      id: "REQ-2024-189",
      department: "Production Floor A",
      item: "CNC Machine Upgrade Kit",
      requestedBy: "John Martinez",
      value: "$28,500",
      priority: "high",
      businessCase: "Increase production capacity by 15%",
      roi: "18 months",
      date: "2024-01-16"
    },
    {
      id: "REQ-2024-190",
      department: "Quality Control",
      item: "Advanced Testing Equipment",
      requestedBy: "Carol Williams",
      value: "$35,200",
      priority: "medium",
      businessCase: "Reduce quality inspection time by 40%",
      roi: "14 months",
      date: "2024-01-15"
    },
    {
      id: "REQ-2024-191",
      department: "Production Floor B",
      item: "Automated Material Handler",
      requestedBy: "Maria Santos",
      value: "$42,800",
      priority: "high",
      businessCase: "Eliminate manual handling, improve safety",
      roi: "22 months",
      date: "2024-01-14"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-blue-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'normal': return 'bg-yellow-500 text-white';
      case 'warning': return 'bg-orange-500 text-white';
      case 'critical': return 'bg-red-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getAnalyticsStatusColor = (status: string) => {
    switch (status) {
      case 'positive': return 'text-blue-600 bg-blue-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'normal': return 'text-yellow-600 bg-yellow-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
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

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      {/* Executive Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
          Executive Command Center
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Welcome {currentUser?.name} • Strategic oversight and comprehensive business control
        </p>
      </div>

      {/* Strategic Quick Actions */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <Button size="lg" className="gap-2 w-full sm:w-auto text-sm sm:text-base">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          Approve High-Value Requests
        </Button>
        <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto text-sm sm:text-base" asChild>
          <Link to="/strategic-analytics">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Strategic Analytics
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto text-sm sm:text-base" asChild>
          <Link to="/financial-dashboard">
            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            Financial Dashboard
          </Link>
        </Button>
       
        <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto text-sm sm:text-base" asChild>
          <Link to="/organizational-management">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            Organizational Management
          </Link>
        </Button>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {executiveSummaryStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Department Performance Comparison */}
        <Card className="lg:col-span-2 card-friendly">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <span className="text-sm sm:text-base">Department Performance & Budget Utilization</span>
            </CardTitle>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
              <Link to="/analytics">Detailed Report</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {departmentPerformance.map((dept, index) => (
              <div key={index} className="p-3 sm:p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <span className="font-medium text-foreground text-sm sm:text-base truncate">{dept.department}</span>
                      <Badge className={`${getStatusColor(dept.status)} text-xs w-fit`}>
                        {dept.status}
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Manager: {dept.manager} • Monthly Spend: {dept.monthlySpend}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-medium text-blue-600">{dept.savings}</div>
                    <div className="text-xs text-muted-foreground">vs budget</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <div className="text-muted-foreground">Budget Utilization</div>
                    <div className="font-medium">{dept.budgetUtilization}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Efficiency</div>
                    <div className="font-medium">{dept.efficiency}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strategic Analytics */}
        <Card className="card-friendly">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              Strategic Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {strategicAnalytics.map((metric, index) => (
              <div key={index} className={`p-3 rounded-lg ${getAnalyticsStatusColor(metric.status)}`}>
                <div className="font-medium text-xs sm:text-sm">{metric.metric}</div>
                <div className="text-xl sm:text-2xl font-bold">{metric.value}</div>
                <div className="text-xs opacity-75">{metric.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* High-Value Approvals */}
      <Card className="card-friendly">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            <span className="text-sm sm:text-base">High-Value Approvals Required (Ultimate Authority)</span>
          </CardTitle>
          <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
            Bulk Actions
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {highValueApprovals.map((request, index) => (
            <div key={index} className="p-3 sm:p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 space-y-2 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="font-medium text-foreground text-sm sm:text-base truncate">{request.item}</span>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getPriorityColor(request.priority)} text-xs`}>
                      {request.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {request.value}
                    </Badge>
                  </div>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                    {request.department} • Requested by {request.requestedBy} • {request.date}
                  </div>
                  <div className="text-xs sm:text-sm space-y-1">
                    <div><strong>Business Case:</strong> {request.businessCase}</div>
                    <div><strong>Expected ROI:</strong> {request.roi}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <Button size="sm" className="gap-1 w-full sm:w-auto text-xs sm:text-sm">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="gap-1 w-full sm:w-auto text-xs sm:text-sm">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                  Review Details
                </Button>
                <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700 w-full sm:w-auto text-xs sm:text-sm">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                  Request Changes
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Company-Wide KPIs */}
      <Card className="card-friendly">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            Company-Wide Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4 border rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">15.3%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Net Profit Margin</div>
            </div>
            <div className="text-center p-3 sm:p-4 border rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">87.4%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Overall Equipment Effectiveness</div>
            </div>
            <div className="text-center p-3 sm:p-4 border rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">1.8 days</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Avg. Request Fulfillment</div>
            </div>
            <div className="text-center p-3 sm:p-4 border rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">2.1%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Material Waste Rate</div>
            </div>
            <div className="text-center p-3 sm:p-4 border rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="text-xl sm:text-2xl font-bold text-red-600">₹127K</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Cost Savings This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizational Control Panel */}
      <Card className="card-friendly">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            Organizational Control & Policy Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-start text-left">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">Department Management</span>
              </div>
              <div className="text-xs text-muted-foreground text-left">
                Create departments, assign managers, set hierarchies
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-start text-left">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">Approval Workflows</span>
              </div>
              <div className="text-xs text-muted-foreground text-left">
                Configure approval chains and spending limits
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-start text-left sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">Budget Controls</span>
              </div>
              <div className="text-xs text-muted-foreground text-left">
                Set department budgets and spending policies
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyOwnerDashboard; 