import { useState } from "react";
import { Building2, Users, UserCheck, TrendingUp, Award, Clock, Calendar, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const OrganizationalManagement = () => {
  const [timeRange, setTimeRange] = useState("quarterly");

  const organizationalKPIs = [
    {
      title: "Total Employees",
      value: "247",
      change: "+12",
      trend: "up",
      icon: Users,
      color: "primary",
      period: "This Quarter"
    },
    {
      title: "Employee Satisfaction",
      value: "87.5%",
      change: "+3.2%",
      trend: "up",
      icon: Award,
      color: "success",
      period: "Latest Survey"
    },
    {
      title: "Retention Rate",
      value: "94.2%",
      change: "+1.8%",
      trend: "up",
      icon: UserCheck,
      color: "success",
      period: "Annual Rate"
    },
    {
      title: "Productivity Index",
      value: "92.1%",
      change: "+5.7%",
      trend: "up",
      icon: TrendingUp,
      color: "info",
      period: "This Quarter"
    }
  ];

  const departmentBreakdown = [
    { name: "Production", employees: 89, satisfaction: 85, productivity: 94, turnover: 3.2 },
    { name: "Quality Control", employees: 24, satisfaction: 91, productivity: 88, turnover: 1.8 },
    { name: "Maintenance", employees: 18, satisfaction: 82, productivity: 87, turnover: 4.1 },
    { name: "Administration", employees: 32, satisfaction: 93, productivity: 96, turnover: 2.1 },
    { name: "Logistics", employees: 28, satisfaction: 86, productivity: 89, turnover: 3.5 },
    { name: "R&D", employees: 21, satisfaction: 95, productivity: 91, turnover: 1.2 },
    { name: "Sales & Marketing", employees: 19, satisfaction: 88, productivity: 93, turnover: 2.8 },
    { name: "HR", employees: 16, satisfaction: 90, productivity: 85, turnover: 1.9 }
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
    return trend === "up" ? <TrendingUp className="w-4 h-4 text-success" /> : 
           trend === "down" ? <TrendingUp className="w-4 h-4 text-success rotate-180" /> :
           <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Organizational Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Human resources analytics and organizational insights
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
            HR Report
          </Button>
        </div>
      </div>

      {/* Organizational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {organizationalKPIs.map((metric, index) => (
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
                <p className="text-xs text-muted-foreground">{metric.period}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Breakdown */}
      <Card className="card-friendly">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Department Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-semibold">Department</th>
                  <th className="text-left py-3 px-2 font-semibold">Employees</th>
                  <th className="text-left py-3 px-2 font-semibold">Satisfaction</th>
                  <th className="text-left py-3 px-2 font-semibold">Productivity</th>
                  <th className="text-left py-3 px-2 font-semibold">Turnover Rate</th>
                </tr>
              </thead>
              <tbody>
                {departmentBreakdown.map((dept, index) => (
                  <tr key={index} className="border-b border-border hover:bg-secondary/30">
                    <td className="py-3 px-2 font-medium">{dept.name}</td>
                    <td className="py-3 px-2">{dept.employees}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dept.satisfaction}%</span>
                        <div className="w-16 bg-secondary rounded-full h-1.5">
                          <div 
                            className="bg-secondary/100 h-1.5 rounded-full" 
                            style={{ width: `${dept.satisfaction}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dept.productivity}%</span>
                        <div className="w-16 bg-secondary rounded-full h-1.5">
                          <div 
                            className="bg-secondary/100 h-1.5 rounded-full" 
                            style={{ width: `${dept.productivity}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`font-medium ${dept.turnover > 4 ? 'text-red-600' : dept.turnover > 2 ? 'text-yellow-600' : 'text-foreground'}`}>
                        {dept.turnover}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Organizational Insights */}
      <Card className="card-friendly">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Organizational Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-foreground" />
                <span className="font-semibold text-foreground">Strengths</span>
              </div>
              <p className="text-sm text-foreground">High employee satisfaction (87.5%) and retention rate (94.2%). R&D department showing exceptional performance with 95% satisfaction.</p>
            </div>
            
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Areas of Focus</span>
              </div>
              <p className="text-sm text-yellow-700">Maintenance department shows higher turnover (4.1%). Need to accelerate hiring for 12 open positions across departments.</p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-foreground" />
                <span className="font-semibold text-foreground">Recommendations</span>
              </div>
              <p className="text-sm text-foreground">Implement retention strategies for maintenance team. Expand leadership development program. Fast-track technical skills training.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationalManagement; 