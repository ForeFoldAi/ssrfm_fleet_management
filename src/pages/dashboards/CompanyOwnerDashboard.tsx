import { useState } from "react";
import { IndianRupee, TrendingUp, TrendingDown, Minus, Calendar, Filter, Clock, AlertCircle } from "lucide-react";
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
      percentageChanges: {
        allUnits: period === "1m" ? 12.5 : period === "3m" ? 8.3 : period === "6m" ? 15.2 : 22.1,
        unit1: period === "1m" ? 8.3 : period === "3m" ? 5.2 : period === "6m" ? 12.8 : 18.5,
        unit2: period === "1m" ? -2.1 : period === "3m" ? 3.4 : period === "6m" ? 7.9 : 14.2,
      }
    };
  };

  const currentData = getDataForPeriod(selectedPeriod);
  const pendingApprovalsData = getPendingApprovalsData(selectedPeriod);
  const { materialExpensesByUnit, expensesTable, percentageChanges } = currentData;

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
    if (value > 0) return <TrendingUp className="h-4 w-4 text-primary" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-primary";
    if (value < 0) return "text-red-500";
    return "text-muted-foreground";
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Expenses Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Comprehensive overview of total and category-wise expenses across all units
            </p>
          </div>
          
          {/* Right Side - Time Period Filter */}
          <Card className="p-4 bg-card shadow-lg border border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="h-4 w-4" />
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
                        : "hover:bg-secondary/10 border-border text-foreground"
                    }`}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards - Back to 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <StatsCard
              title="Total Expenses - All Units"
              value={`₹${allUnitsTotal.toLocaleString()}`}
              description={`${getPeriodLabel()} period`}
              icon={IndianRupee}
              trend="vs previous period"
              color="success"
            />
            <div className="absolute -top-2 -right-2">
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 bg-secondary/20 text-foreground">
                {getTrendIcon(percentageChanges.allUnits)}
                <span className={`text-xs font-medium ${getTrendColor(percentageChanges.allUnits)}`}>
                  {Math.abs(percentageChanges.allUnits)}%
                </span>
              </Badge>
            </div>
          </div>
          
          <div className="relative">
            <StatsCard
              title="Total Expenses - Unit-I"
              value={`₹${totals.unit1.toLocaleString()}`}
              description={`${getPeriodLabel()} period`}
              icon={IndianRupee}
              trend="vs previous period"
              color="primary"
            />
            <div className="absolute -top-2 -right-2">
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 bg-secondary/20 text-foreground">
                {getTrendIcon(percentageChanges.unit1)}
                <span className={`text-xs font-medium ${getTrendColor(percentageChanges.unit1)}`}>
                  {Math.abs(percentageChanges.unit1)}%
                </span>
              </Badge>
            </div>
          </div>
          
          <div className="relative">
            <StatsCard
              title="Total Expenses - Unit-II"
              value={`₹${totals.unit2.toLocaleString()}`}
              description={`${getPeriodLabel()} period`}
              icon={IndianRupee}
              trend="vs previous period"
              color="warning"
            />
            <div className="absolute -top-2 -right-2">
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 bg-secondary/20 text-foreground">
                {getTrendIcon(percentageChanges.unit2)}
                <span className={`text-xs font-medium ${getTrendColor(percentageChanges.unit2)}`}>
                  {Math.abs(percentageChanges.unit2)}%
                </span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Machine Expenses Chart */}
          <Card className="card-friendly shadow-lg border-0 bg-card border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                Machine Expenses by Unit
                <Badge variant="outline" className="ml-auto text-xs bg-secondary/20 text-foreground border-border">
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
                    fill="hsl(var(--primary))" 
                    barSize={24} 
                    radius={[6, 6, 0, 0]}
                    name="Unit-I"
                  />
                  <Bar 
                    dataKey="Unit-II" 
                    fill="hsl(var(--secondary))" 
                    barSize={24} 
                    radius={[6, 6, 0, 0]}
                    name="Unit-II"
                  />
                </ReBarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Material Expenses Chart */}
          <Card className="card-friendly shadow-lg border-0 bg-card border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                Material Expenses
                <Badge variant="outline" className="ml-auto text-xs bg-secondary/20 text-foreground border-border">
                  {getPeriodLabel()}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Material-wise expense breakdown across units
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="w-full h-80">
                <ReBarChart data={materialExpensesByUnit} layout="vertical" margin={{ left: 40, right: 20, bottom: 20, top: 20 }}>
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
                    width={100}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                    />} 
                  />
                  <ChartLegend />
                  <Bar 
                    dataKey="Unit-I" 
                    fill="hsl(var(--primary))" 
                    barSize={20} 
                    radius={[0, 6, 6, 0]}
                    name="Unit-I"
                  />
                  <Bar 
                    dataKey="Unit-II" 
                    fill="hsl(var(--secondary))" 
                    barSize={20} 
                    radius={[0, 6, 6, 0]}
                    name="Unit-II"
                  />
                </ReBarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Table Section */}
        <Card className="card-friendly shadow-lg border-0 bg-card border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              Detailed Expenses by Machine and Unit
              <Badge variant="outline" className="ml-auto text-xs bg-secondary/20 text-foreground border-border">
                {getPeriodLabel()}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete breakdown of expenses across all machines and units
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-border">
                    <TableHead className="font-semibold text-foreground">Machine</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Unit-I</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Unit-II</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expensesTable.map((row, index) => {
                    const total = row["Unit-1"] + row["Unit-2"] + row["Unit-3"];
                    return (
                      <TableRow key={row.machine} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              index === 0 ? 'bg-primary' : 
                              index === 1 ? 'bg-secondary' : 
                              index === 2 ? 'bg-primary/70' : 'bg-secondary/70'
                            }`}></div>
                            {row.machine}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">₹{row["Unit-1"].toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">₹{row["Unit-2"].toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">₹{row["Unit-3"].toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold text-foreground">₹{total.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Total Row */}
                  <TableRow className="border-t-2 border-border bg-muted/30">
                    <TableCell className="font-bold text-foreground">Total</TableCell>
                    <TableCell className="text-right font-bold text-foreground">₹{totals.unit1.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-foreground">₹{totals.unit2.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-foreground">₹{totals.unit3.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary">₹{allUnitsTotal.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals Details Card - Moved to last position */}
        {pendingApprovalsData.pendingApprovals > 0 && (
          <Card className="card-friendly shadow-lg border-0 bg-gradient-to-r from-secondary/10 to-primary/10 border-l-4 border-primary">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5 text-primary" />
                Pending Approvals Overview
                <Badge variant="outline" className="ml-auto text-xs bg-secondary/20 text-foreground border-border">
                  {getPeriodLabel()}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Action required for pending material requests and approvals
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-card/60 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {pendingApprovalsData.pendingApprovals}
                  </div>
                  <div className="text-sm font-medium text-foreground">Total Pending</div>
                  <div className="text-xs text-muted-foreground mt-1">Material Requests</div>
                </div>
                <div className="text-center p-4 bg-card/60 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {pendingApprovalsData.averageApprovalTime}
                  </div>
                  <div className="text-sm font-medium text-foreground">Avg. Time</div>
                  <div className="text-xs text-muted-foreground mt-1">To Approve</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompanyOwnerDashboard;
