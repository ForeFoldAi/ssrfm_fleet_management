import { useState } from "react";
import { IndianRupee, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, CreditCard, Wallet, Building, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const FinancialDashboard = () => {
  const [timeRange, setTimeRange] = useState("monthly");

  const financialKPIs = [
    {
      title: "Total Revenue",
      value: "₹18.7M",
      change: "+12.4%",
      trend: "up",
      icon: IndianRupee,
      color: "success",
      period: "This Quarter"
    },
    {
      title: "Net Profit",
      value: "₹4.2M",
      change: "+8.7%",
      trend: "up",
      icon: TrendingUp,
      color: "primary",
      period: "This Quarter"
    },
    {
      title: "Operating Costs",
      value: "₹12.1M",
      change: "-3.2%",
      trend: "down",
      icon: Wallet,
      color: "success",
      period: "This Quarter"
    },
    {
      title: "Cash Flow",
      value: "₹6.8M",
      change: "+15.6%",
      trend: "up",
      icon: Building,
      color: "info",
      period: "This Quarter"
    }
  ];

  const revenueBreakdown = [
    { category: "Product Sales", amount: "₹12.5M", percentage: 67, growth: "+14.2%" },
    { category: "Services", amount: "₹3.8M", percentage: 20, growth: "+8.9%" },
    { category: "Licensing", amount: "₹1.9M", percentage: 10, growth: "+22.1%" },
    { category: "Other", amount: "₹0.5M", percentage: 3, growth: "+5.3%" }
  ];

  const expenseCategories = [
    { category: "Raw Materials", amount: "₹6.2M", percentage: 51, budget: "₹6.5M", status: "under" },
    { category: "Labor Costs", amount: "₹2.8M", percentage: 23, budget: "₹2.7M", status: "over" },
    { category: "Utilities", amount: "₹1.5M", percentage: 12, budget: "₹1.6M", status: "under" },
    { category: "Marketing", amount: "₹0.9M", percentage: 8, budget: "₹1.0M", status: "under" },
    { category: "Administration", amount: "₹0.7M", percentage: 6, budget: "₹0.8M", status: "under" }
  ];

  const monthlyFinancials = [
    { month: "Jan", revenue: 5.8, expenses: 4.2, profit: 1.6 },
    { month: "Feb", revenue: 6.1, expenses: 4.0, profit: 2.1 },
    { month: "Mar", revenue: 6.8, expenses: 3.9, profit: 2.9 },
    { month: "Apr", revenue: 7.2, expenses: 4.5, profit: 2.7 },
    { month: "May", revenue: 7.8, expenses: 4.8, profit: 3.0 },
    { month: "Jun", revenue: 8.2, expenses: 4.6, profit: 3.6 }
  ];

  const budgetTracking = [
    { department: "Production", allocated: "₹8.5M", spent: "₹7.2M", remaining: "₹1.3M", utilization: 85 },
    { department: "Marketing", allocated: "₹2.0M", spent: "₹1.6M", remaining: "₹0.4M", utilization: 80 },
    { department: "R&D", allocated: "₹3.5M", spent: "₹2.8M", remaining: "₹0.7M", utilization: 80 },
    { department: "Operations", allocated: "₹4.0M", spent: "₹3.9M", remaining: "₹0.1M", utilization: 98 },
    { department: "HR", allocated: "₹1.5M", spent: "₹1.1M", remaining: "₹0.4M", utilization: 73 }
  ];

  const cashFlowAnalysis = [
    { type: "Operating Activities", inflow: "₹8.2M", outflow: "₹6.1M", net: "+₹2.1M" },
    { type: "Investing Activities", inflow: "₹0.5M", outflow: "₹2.8M", net: "-₹2.3M" },
    { type: "Financing Activities", inflow: "₹3.0M", outflow: "₹1.2M", net: "+₹1.8M" }
  ];

  const financialRatios = [
    { metric: "Current Ratio", value: "2.4", benchmark: "2.0", status: "good" },
    { metric: "Quick Ratio", value: "1.8", benchmark: "1.0", status: "excellent" },
    { metric: "Debt-to-Equity", value: "0.3", benchmark: "0.5", status: "excellent" },
    { metric: "ROI", value: "22.5%", benchmark: "15%", status: "excellent" },
    { metric: "Profit Margin", value: "22.5%", benchmark: "18%", status: "good" },
    { metric: "Asset Turnover", value: "1.4", benchmark: "1.2", status: "good" }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      success: "bg-success/10 text-success border-success/20",
      primary: "bg-primary/10 text-primary border-primary/20",
      info: "bg-secondary/100/10 text-primary border-primary/20",
      warning: "bg-warning/10 text-warning border-warning/20"
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-secondary/100 text-white";
      case "good": return "bg-secondary/100 text-white";
      case "fair": return "bg-yellow-500 text-white";
      case "poor": return "bg-red-500 text-white";
      case "under": return "text-foreground";
      case "over": return "text-red-600";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Financial Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive financial analytics and performance metrics
          </p>
        </div>
        
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Financial Report
          </Button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialKPIs.map((metric, index) => (
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
                <p className={`text-sm font-semibold ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                  {metric.change} vs last period
                </p>
                <p className="text-xs text-muted-foreground">{metric.period}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueBreakdown.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.category}</span>
                    <div className="text-right">
                      <span className="font-semibold">{item.amount}</span>
                      <span className="text-sm text-success ml-2">{item.growth}</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">{item.percentage}% of total revenue</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Expense Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseCategories.map((expense, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{expense.category}</span>
                    <div className="text-right">
                      <span className="font-semibold">{expense.amount}</span>
                      <span className={`text-sm ml-2 ${getStatusColor(expense.status)}`}>
                        vs {expense.budget}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${expense.status === 'under' ? 'bg-secondary/100' : 'bg-red-500'}`}
                      style={{ width: `${expense.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Financial Trends */}
      <Card className="card-friendly">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Financial Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary/100 rounded-full"></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Expenses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary/100 rounded-full"></div>
                <span>Profit</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {monthlyFinancials.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium">{data.month}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2 relative">
                      <div 
                        className="bg-secondary/100 h-2 rounded-full" 
                        style={{ width: `${(data.revenue / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">₹{data.revenue}M</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2 relative">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(data.expenses / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">₹{data.expenses}M</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2 relative">
                      <div 
                        className="bg-secondary/100 h-2 rounded-full" 
                        style={{ width: `${(data.profit / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">₹{data.profit}M</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Tracking */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Budget Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetTracking.map((budget, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{budget.department}</span>
                    <span className="text-sm font-semibold">{budget.utilization}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <span>Allocated: {budget.allocated}</span>
                    <span>Spent: {budget.spent}</span>
                    <span>Remaining: {budget.remaining}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        budget.utilization > 95 ? 'bg-red-500' :
                        budget.utilization > 85 ? 'bg-yellow-500' : 'bg-secondary/100'
                      }`}
                      style={{ width: `${budget.utilization}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Ratios */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Key Financial Ratios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialRatios.map((ratio, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium">{ratio.metric}</p>
                    <p className="text-sm text-muted-foreground">Benchmark: {ratio.benchmark}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{ratio.value}</p>
                    <Badge className={getStatusColor(ratio.status)}>
                      {ratio.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Analysis */}
      <Card className="card-friendly">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Cash Flow Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cashFlowAnalysis.map((flow, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary/30">
                <h3 className="font-semibold mb-3">{flow.type}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inflow:</span>
                    <span className="font-medium text-foreground">{flow.inflow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outflow:</span>
                    <span className="font-medium text-red-600">{flow.outflow}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net:</span>
                    <span className={`font-bold ${flow.net.startsWith('+') ? 'text-foreground' : 'text-red-600'}`}>
                      {flow.net}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard; 