import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Users, IndianRupee, Package, AlertTriangle, CheckCircle, Calendar, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const StrategicAnalytics = () => {
  const [timeRange, setTimeRange] = useState("quarterly");

  const kpiMetrics = [
    {
      title: "Revenue Growth",
      value: "24.8%",
      change: "+4.2%",
      trend: "up",
      icon: TrendingUp,
      color: "success",
      target: "25% Target"
    },
    {
      title: "Operational Efficiency",
      value: "87.3%",
      change: "+2.1%",
      trend: "up",
      icon: Target,
      color: "primary",
      target: "90% Target"
    },
    {
      title: "Cost Optimization",
      value: "₹2.1M Saved",
      change: "+15.4%",
      trend: "up",
      icon: IndianRupee,
      color: "success",
      target: "₹2.5M Target"
    },
    {
      title: "Market Share",
      value: "18.5%",
      change: "+1.2%",
      trend: "up",
      icon: BarChart3,
      color: "info",
      target: "20% Target"
    }
  ];

  const departmentPerformance = [
    { name: "Production", efficiency: 92, revenue: "₹4.2M", growth: "+8.5%", status: "excellent" },
    { name: "Quality Control", efficiency: 88, revenue: "₹1.8M", growth: "+12.3%", status: "good" },
    { name: "Logistics", efficiency: 85, revenue: "₹2.1M", growth: "+6.7%", status: "good" },
    { name: "Maintenance", efficiency: 79, revenue: "₹0.9M", growth: "+3.2%", status: "fair" },
    { name: "Administration", efficiency: 94, revenue: "₹1.5M", growth: "+15.1%", status: "excellent" }
  ];

  const strategicGoals = [
    {
      title: "Digital Transformation",
      progress: 78,
      status: "on-track",
      deadline: "Q2 2024",
      investment: "₹15M",
      roi: "Expected 35%"
    },
    {
      title: "Market Expansion",
      progress: 65,
      status: "on-track",
      deadline: "Q3 2024",
      investment: "₹25M",
      roi: "Expected 42%"
    },
    {
      title: "Sustainability Initiative",
      progress: 45,
      status: "behind",
      deadline: "Q4 2024",
      investment: "₹8M",
      roi: "Expected 18%"
    },
    {
      title: "Workforce Development",
      progress: 89,
      status: "ahead",
      deadline: "Q1 2024",
      investment: "₹5M",
      roi: "Expected 28%"
    }
  ];

  const competitorAnalysis = [
    { name: "Competitor A", marketShare: 22.3, growth: "+5.2%", strength: "Technology" },
    { name: "Competitor B", marketShare: 19.8, growth: "+3.1%", strength: "Price" },
    { name: "Competitor C", marketShare: 15.4, growth: "+7.8%", strength: "Quality" },
    { name: "Our Company", marketShare: 18.5, growth: "+8.5%", strength: "Innovation" }
  ];

  const riskAssessment = [
    { category: "Market Risk", level: "Medium", impact: "High", mitigation: "Diversification Strategy" },
    { category: "Operational Risk", level: "Low", impact: "Medium", mitigation: "Process Automation" },
    { category: "Financial Risk", level: "Low", impact: "High", mitigation: "Cash Flow Management" },
    { category: "Technology Risk", level: "Medium", impact: "Medium", mitigation: "Regular Updates" },
    { category: "Regulatory Risk", level: "High", impact: "High", mitigation: "Compliance Program" }
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
      case "on-track": return "bg-secondary/100 text-white";
      case "ahead": return "bg-secondary/100 text-white";
      case "behind": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "text-foreground";
      case "Medium": return "text-yellow-600";
      case "High": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Strategic Analytics
          </h1>
          <p className="text-lg text-muted-foreground">
            Executive insights and strategic business intelligence
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
            Export Report
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
                <p className="text-sm font-semibold text-success">{metric.change} vs last period</p>
                <p className="text-xs text-muted-foreground">{metric.target}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentPerformance.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{dept.name}</span>
                    <Badge className={getStatusColor(dept.status)}>
                      {dept.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <span>Efficiency: {dept.efficiency}%</span>
                    <span>Revenue: {dept.revenue}</span>
                    <span>Growth: {dept.growth}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${dept.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategic Goals */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Strategic Goals Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategicGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.title}</span>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <span>Investment: {goal.investment}</span>
                    <span>Deadline: {goal.deadline}</span>
                    <span>{goal.roi}</span>
                    <span>Progress: {goal.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        goal.status === 'ahead' ? 'bg-secondary/100' :
                        goal.status === 'on-track' ? 'bg-secondary/100' : 'bg-red-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor Analysis */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Competitive Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competitorAnalysis.map((competitor, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium">{competitor.name}</p>
                    <p className="text-sm text-muted-foreground">Strength: {competitor.strength}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{competitor.marketShare}%</p>
                    <p className="text-sm text-success">{competitor.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card className="card-friendly">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskAssessment.map((risk, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{risk.category}</span>
                    <span className={`font-semibold ${getRiskColor(risk.level)}`}>
                      {risk.level}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Impact: {risk.impact}</p>
                    <p>Mitigation: {risk.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Insights */}
      <Card className="card-friendly">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Executive Summary & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-foreground" />
                <span className="font-semibold text-foreground">Key Achievements</span>
              </div>
              <p className="text-sm text-foreground">Revenue growth exceeded targets by 4.2%. Digital transformation initiative ahead of schedule with 89% completion.</p>
            </div>
            
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Areas of Focus</span>
              </div>
              <p className="text-sm text-yellow-700">Sustainability initiative behind schedule. Maintenance department efficiency needs improvement. Monitor regulatory risk closely.</p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-foreground" />
                <span className="font-semibold text-foreground">Strategic Recommendations</span>
              </div>
              <p className="text-sm text-foreground">Accelerate market expansion to capture 20% market share. Invest in maintenance automation. Strengthen compliance framework.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategicAnalytics; 