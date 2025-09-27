import { useState } from "react";
import { IndianRupee, TrendingUp, TrendingDown, Minus, Calendar, Filter, Clock, AlertCircle, CheckCircle, Users, Building2 } from "lucide-react";
import { StatsCard } from "../../components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "../../components/ui/chart";
import { BarChart as ReBarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";

const CompanyOwnerDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("1m");

  // Time period options
  const timePeriods = [
    { value: "1m", label: "1 Month", months: 1 },
    { value: "3m", label: "3 Months", months: 3 },
    { value: "6m", label: "6 Months", months: 6 },
    { value: "1y", label: "1 Year", months: 12 },
  ];

  // Mock data for pending approvals (would come from API)
  const getPendingApprovalsData = (period: string) => {
    const baseCount = {
      "1m": 8,
      "3m": 24,
      "6m": 45,
      "1y": 89,
    }[period] || 8;

    return {
      pendingApprovals: baseCount,
      averageApprovalTime: "2.5 days",
      approvalTrend: period === "1m" ? 15.2 : period === "3m" ? 8.7 : period === "6m" ? -5.3 : -12.1,
    };
  };

  // Mock data that would change based on selected period
  const getDataForPeriod = (period: string) => {
    const multiplier = {
      "1m": 1,
      "3m": 2.8,
      "6m": 5.5,
      "1y": 11.2,
    }[period] || 1;

    return {
      materialExpensesByUnit: [
        { material: "Bearings", "Unit-I": Math.round(220000 * multiplier), "Unit-II": Math.round(200000 * multiplier) },
        { material: "Belts", "Unit-I": Math.round(160000 * multiplier), "Unit-II": Math.round(140000 * multiplier) },
        { material: "Fevicol", "Unit-I": Math.round(120000 * multiplier), "Unit-II": Math.round(100000 * multiplier) },
        { material: "Repairs", "Unit-I": Math.round(80000 * multiplier), "Unit-II": Math.round(70000 * multiplier) },
        { material: "Other Works", "Unit-I": Math.round(60000 * multiplier), "Unit-II": Math.round(55000 * multiplier) },
      ],
      expensesTable: [
        { machine: "CNC", "Unit-1": Math.round(32000 * multiplier), "Unit-2": Math.round(21000 * multiplier), "Unit-3": Math.round(12000 * multiplier) },
        { machine: "Lathe", "Unit-1": Math.round(18000 * multiplier), "Unit-2": Math.round(11000 * multiplier), "Unit-3": Math.round(6000 * multiplier) },
        { machine: "Milling", "Unit-1": Math.round(15000 * multiplier), "Unit-2": Math.round(9000 * multiplier), "Unit-3": Math.round(4000 * multiplier) },
        { machine: "Drill", "Unit-1": Math.round(8000 * multiplier), "Unit-2": Math.round(6000 * multiplier), "Unit-3": Math.round(4000 * multiplier) },
      ],
      
    };
  };

  const currentData = getDataForPeriod(selectedPeriod);
  const pendingApprovalsData = getPendingApprovalsData(selectedPeriod);
  const { materialExpensesByUnit, expensesTable } = currentData;

  const machineExpensesByUnit = expensesTable.map((row) => ({
    machine: row.machine,
    "Unit-I": row["Unit-1"],
    "Unit-II": row["Unit-2"],
  }));

  const totals = expensesTable.reduce(
    (acc, row) => {
      acc.unit1 += row["Unit-1"] || 0;
      acc.unit2 += row["Unit-2"] || 0;
      acc.unit3 += row["Unit-3"] || 0;
      return acc;
    },
    { unit1: 0, unit2: 0, unit3: 0 }
  );
  const allUnitsTotal = totals.unit1 + totals.unit2 + totals.unit3;

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-500";
    return "text-gray-400";
  };

  const getPeriodLabel = () => {
    return timePeriods.find(p => p.value === selectedPeriod)?.label || "1 Month";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Section - Left/Right Layout */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Side - Title and Description */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary">
              Expenses Dashboard
            </h1>
          </div>
          
          {/* Right Side - Time Period Filter */}
          <Card className="p-4 bg-card shadow-lg border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                Time Period:
              </div>
              <div className="flex gap-2">
                {timePeriods.map((period) => (
                  <Button
                    key={period.value}
                    variant={selectedPeriod === period.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`transition-all duration-200 ${
                      selectedPeriod === period.value
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                        : "hover:bg-primary/10 border-primary/30 text-foreground"
                    }`}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards with Colored Borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Expenses - All Units */}
          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses - All Units</p>
                <p className="text-2xl font-bold">₹{allUnitsTotal.toLocaleString()}</p>
                
              </div>
              <IndianRupee className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          {/* Total Expenses - Unit-I */}
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses - Unit-I</p>
                <p className="text-2xl font-bold">₹{totals.unit1.toLocaleString()}</p>
                
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          {/* Total Expenses - Unit-II */}
          <Card className="p-6 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses - Unit-II</p>
                <p className="text-2xl font-bold">₹{totals.unit2.toLocaleString()}</p>
                
              </div>
              <Building2 className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          {/* Pending Approvals */}
          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{pendingApprovalsData.pendingApprovals}</p>
                <p className="text-sm text-muted-foreground mt-1">Material Requests</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Machine Expenses Chart */}
          <Card className="card-friendly shadow-lg border border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                Machine Expenses by Unit
                <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary border-primary/30">
                  {getPeriodLabel()}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Comparative analysis of machine expenses across different units
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="w-full h-80">
                <ReBarChart data={machineExpensesByUnit} margin={{ left: 20, right: 20, bottom: 20, top: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="machine" 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `₹${(value / 1000)}k`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                    />} 
                  />
                  <ChartLegend />
                  <Bar 
                    dataKey="Unit-I" 
                    fill="#3B82F6" 
                    barSize={24} 
                    radius={[6, 6, 0, 0]}
                    name="Unit-I"
                  />
                  <Bar 
                    dataKey="Unit-II" 
                    fill="#F59E0B" 
                    barSize={24} 
                    radius={[6, 6, 0, 0]}
                    name="Unit-II"
                  />
                </ReBarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Material Expenses Chart */}
          <Card className="card-friendly shadow-lg border border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                Material Expenses
                <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary border-primary/30">
                  {getPeriodLabel()}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Material-wise expense breakdown across units
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="w-full h-80">
                <ReBarChart data={materialExpensesByUnit} layout="vertical" margin={{ left: 20, right: 20, bottom: 20, top: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `₹${(value / 1000)}k`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="material" 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    width={120}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                    />} 
                  />
                  <ChartLegend />
                  <Bar 
                    dataKey="Unit-I" 
                    fill="#3B82F6" 
                    barSize={24} 
                    radius={[0, 6, 6, 0]}
                    name="Unit-I"
                  />
                  <Bar 
                    dataKey="Unit-II" 
                    fill="#F59E0B" 
                    barSize={24} 
                    radius={[0, 6, 6, 0]}
                    name="Unit-II"
                  />
                </ReBarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

       
      </div>
    </div>
  );
};

export default CompanyOwnerDashboard;


