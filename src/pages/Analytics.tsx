import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Activity, Package, AlertTriangle, IndianRupee, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("30-days");
  const [selectedMetric, setSelectedMetric] = useState("inventory-value");

  const kpiMetrics = [
    {
      title: "Total Inventory Value",
      value: "₹8.47M",
      change: "+12.5%",
      trend: "up",
      icon: IndianRupee,
      color: "success"
    },
    {
      title: "Stock Turnover Rate",
      value: "4.2x",
      change: "+0.8x",
      trend: "up",
      icon: Activity,
      color: "primary"
    },
    {
      title: "Average Stock Level",
      value: "847 items",
      change: "-23 items",
      trend: "down",
      icon: Package,
      color: "info"
    },
    {
      title: "Critical Stock Items",
      value: "18",
      change: "-5 items",
      trend: "down",
      icon: AlertTriangle,
      color: "warning"
    }
  ];

  const categoryData = [
    { name: "Raw Materials", value: 35, amount: "₹2.96M", color: "#3b82f6" },
    { name: "Components", value: 25, amount: "₹2.12M", color: "#10b981" },
    { name: "Consumables", value: 20, amount: "₹1.69M", color: "#f59e0b" },
    { name: "Safety Equipment", value: 12, amount: "₹1.02M", color: "#ef4444" },
    { name: "Tools & Hardware", value: 8, amount: "₹0.68M", color: "#8b5cf6" }
  ];

  const monthlyTrends = [
    { month: "Aug", requests: 120, fulfilled: 115, value: 7.2 },
    { month: "Sep", requests: 135, fulfilled: 128, value: 7.8 },
    { month: "Oct", requests: 142, fulfilled: 140, value: 8.1 },
    { month: "Nov", requests: 158, fulfilled: 152, value: 8.3 },
    { month: "Dec", requests: 164, fulfilled: 159, value: 8.4 },
    { month: "Jan", requests: 156, fulfilled: 151, value: 8.47 }
  ];

  const topMaterials = [
    { name: "Steel Rods (20mm)", usage: 85, trend: "up", value: "₹245K" },
    { name: "Hydraulic Oil", usage: 78, trend: "stable", value: "₹189K" },
    { name: "Industrial Bearings", usage: 72, trend: "up", value: "₹167K" },
    { name: "Welding Electrodes", usage: 68, trend: "down", value: "₹145K" },
    { name: "Safety Helmets", usage: 65, trend: "up", value: "₹123K" }
  ];

  const supplierPerformance = [
    { name: "SteelCorp Industries", score: 95, deliveries: 24, onTime: 96 },
    { name: "FluidTech Solutions", score: 92, deliveries: 18, onTime: 94 },
    { name: "Precision Parts Co", score: 89, deliveries: 15, onTime: 87 },
    { name: "WeldTech Supply", score: 87, deliveries: 12, onTime: 92 },
    { name: "SafeGuard Equipment", score: 85, deliveries: 10, onTime: 80 }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      success: "bg-success/10 text-success border-success/20",
      primary: "bg-primary/10 text-primary border-primary/20",
      info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      warning: "bg-warning/10 text-warning border-warning/20"
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive inventory insights and performance metrics
          </p>
        </div>
        
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7-days">Last 7 Days</SelectItem>
              <SelectItem value="30-days">Last 30 Days</SelectItem>
              <SelectItem value="90-days">Last 90 Days</SelectItem>
              <SelectItem value="6-months">Last 6 Months</SelectItem>
              <SelectItem value="1-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((metric, index) => (
          <Card key={index} className="card-friendly">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(metric.color)}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className={`text-sm font-semibold ${
                  metric.trend === "up" ? "text-success" : "text-destructive"
                }`}>
                  {metric.change} vs last period
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trends Chart */}
        <Card className="lg:col-span-2 card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span>Fulfilled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span>Value (₹M)</span>
                </div>
              </div>
              
              {/* Simplified chart representation */}
              <div className="space-y-3">
                {monthlyTrends.map((data, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium">{data.month}</div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 relative">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(data.requests / 180) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{data.requests}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 relative">
                        <div 
                          className="bg-success h-2 rounded-full" 
                          style={{ width: `${(data.fulfilled / 180) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{data.fulfilled}</span>
                    </div>
                    <div className="w-16 text-xs font-medium">₹{data.value}M</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">{category.value}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${category.value}%`, 
                        backgroundColor: category.color 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">{category.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Materials */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Materials by Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMaterials.map((material, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{material.name}</p>
                      <p className="text-sm text-muted-foreground">{material.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{material.usage}%</span>
                    {getTrendIcon(material.trend)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Performance */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Supplier Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplierPerformance.map((supplier, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{supplier.name}</span>
                    <Badge variant={supplier.score >= 90 ? "default" : "secondary"}>
                      {supplier.score}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <span>Deliveries: {supplier.deliveries}</span>
                    <span>On-time: {supplier.onTime}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        supplier.score >= 90 ? 'bg-success' : 
                        supplier.score >= 80 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${supplier.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card className="card-friendly">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="font-semibold text-success">Optimization Opportunity</span>
              </div>
              <p className="text-sm">Steel Rods usage increased 15%. Consider bulk ordering to reduce unit costs by ₹12K/month.</p>
            </div>
            
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="font-semibold text-warning">Stock Alert</span>
              </div>
              <p className="text-sm">18 items below minimum stock. Automated reordering could prevent stockouts and save 8% in rush costs.</p>
            </div>
            
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">Trend Analysis</span>
              </div>
              <p className="text-sm">Safety equipment demand up 23% this quarter. Consider expanding supplier base for better pricing.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics; 