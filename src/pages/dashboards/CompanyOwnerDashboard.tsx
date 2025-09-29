import { useState, useEffect } from "react";
import { IndianRupee, TrendingUp, TrendingDown, Minus, Calendar, Filter, Clock, AlertCircle, CheckCircle, Users, Building2, Loader2 } from "lucide-react";
import { StatsCard } from "../../components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "../../components/ui/chart";
import { BarChart as ReBarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { branchesApi } from "../../lib/api/branches";
import { machinesApi } from "../../lib/api/machines";
import { materialsApi } from "../../lib/api/materials";
import { dashboardApi } from "../../lib/api/dashboard";
import { Branch, Machine, Material } from "../../lib/api/types";

const CompanyOwnerDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("1m");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [expensesData, setExpensesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Time period options
  const timePeriods = [
    { value: "1m", label: "1 Month", months: 1, dateRangeType: "this_month" },
    { value: "3m", label: "3 Months", months: 3, dateRangeType: "custom" },
    { value: "6m", label: "6 Months", months: 6, dateRangeType: "custom" },
    { value: "1y", label: "1 Year", months: 12, dateRangeType: "custom" },
  ];

  // Fetch branches from API
  const fetchBranches = async () => {
    try {
      const response = await branchesApi.getAll({
        page: 1,
        limit: 2,
        sortBy: 'id',
        sortOrder: 'ASC'
      });
      setBranches(response.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
      throw new Error('Failed to load branches');
    }
  };

  // Fetch machines from API
  const fetchMachines = async () => {
    try {
      const response = await machinesApi.getAll({
        page: 1,
        limit: 100, // Get more machines for better data
        sortBy: 'name',
        sortOrder: 'ASC'
      });
      setMachines(response.data);
    } catch (err) {
      console.error('Error fetching machines:', err);
      throw new Error('Failed to load machines');
    }
  };

  // Fetch materials from API
  const fetchMaterials = async () => {
    try {
      const response = await materialsApi.getMaterials({
        page: 1,
        limit: 100, // Get more materials for better data
        sortBy: 'name',
        sortOrder: 'ASC'
      });
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      throw new Error('Failed to load materials');
    }
  };

  // Fetch expenses data from dashboard API
  const fetchExpensesData = async () => {
    try {
      const currentPeriod = timePeriods.find(p => p.value === selectedPeriod);
      let params: any = {
        dateRangeType: (currentPeriod?.dateRangeType || 'this_month') as 'this_month' | 'this_quarter' | 'this_year' | 'last_month' | 'custom'
      };

      // For custom date ranges, calculate start and end dates
      if (params.dateRangeType === 'custom') {
        const endDate = new Date();
        const startDate = new Date();
        
        if (selectedPeriod === '3m') {
          startDate.setMonth(endDate.getMonth() - 3);
        } else if (selectedPeriod === '6m') {
          startDate.setMonth(endDate.getMonth() - 6);
        } else if (selectedPeriod === '1y') {
          startDate.setFullYear(endDate.getFullYear() - 1);
        }
        
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }
      
      const response = await dashboardApi.getExpenses(params);
      setExpensesData(response);
    } catch (err) {
      console.error('Error fetching expenses data:', err);
      throw new Error('Failed to load expenses data');
    }
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchBranches(), 
        fetchMachines(), 
        fetchMaterials(),
        fetchExpensesData()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Get pending approvals data from API or fallback to mock
  const getPendingApprovalsData = (period: string) => {
    if (expensesData?.pendingApprovals !== undefined) {
      return {
        pendingApprovals: expensesData.pendingApprovals,
        averageApprovalTime: "2.5 days",
        approvalTrend: period === "1m" ? 15.2 : period === "3m" ? 8.7 : period === "6m" ? -5.3 : -12.1,
      };
    }

    // Fallback to mock data
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

  // Generate machine expenses data based on API data or fallback to calculated data
  const generateMachineExpensesData = () => {
    // If we have API data, use it
    if (expensesData?.machineExpenses) {
      return expensesData.machineExpenses.map((machine: any) => {
        const chartData: any = { machine: machine.machineName };
        branches.forEach(branch => {
          chartData[branch.name] = machine.branchExpenses[branch.id] || 0;
        });
        return chartData;
      });
    }

    // Fallback to calculated data
    if (machines.length === 0 || branches.length === 0) return [];

    const multiplier = {
      "1m": 1,
      "3m": 2.8,
      "6m": 5.5,
      "1y": 11.2,
    }[selectedPeriod] || 1;

    // Group machines by name/type for chart display
    const machineGroups = machines.reduce((acc, machine) => {
      const machineName = machine.name;
      if (!acc[machineName]) {
        acc[machineName] = [];
      }
      acc[machineName].push(machine);
      return acc;
    }, {} as Record<string, Machine[]>);

    // Generate expenses data for each machine group
    const machineExpensesData = Object.entries(machineGroups).map(([machineName, machineList]) => {
      const chartData: any = { machine: machineName };
      
      // Calculate expenses for each branch
      branches.forEach(branch => {
        // Count machines in this branch for this machine type
        const machinesInBranch = machineList.filter(m => m.branch.id === branch.id);
        const baseExpense = 15000; // Base expense per machine
        const expense = machinesInBranch.length * baseExpense * multiplier;
        chartData[branch.name] = Math.round(expense);
      });
      
      return chartData;
    });

    return machineExpensesData;
  };

  // Generate material expenses data based on API data or fallback to calculated data
  const generateMaterialExpensesData = () => {
    // If we have API data, use it
    if (expensesData?.materialExpenses) {
      return expensesData.materialExpenses.map((material: any) => {
        const chartData: any = { material: material.materialName };
        branches.forEach(branch => {
          chartData[branch.name] = material.branchExpenses[branch.id] || 0;
        });
        return chartData;
      });
    }

    // Fallback to calculated data
    if (materials.length === 0 || branches.length === 0) return [];

    const multiplier = {
      "1m": 1,
      "3m": 2.8,
      "6m": 5.5,
      "1y": 11.2,
    }[selectedPeriod] || 1;

    // Group materials by name for chart display
    const materialGroups = materials.reduce((acc, material) => {
      const materialName = material.name;
      if (!acc[materialName]) {
        acc[materialName] = [];
      }
      acc[materialName].push(material);
      return acc;
    }, {} as Record<string, Material[]>);

    // Generate expenses data for each material group
    const materialExpensesData = Object.entries(materialGroups).map(([materialName, materialList]) => {
      const chartData: any = { material: materialName };
      
      // Calculate expenses for each branch
      branches.forEach(branch => {
        // Calculate total value for materials in this branch
        const materialsInBranch = materialList.filter(m => {
          // Since materials don't have branch info directly, we'll distribute them evenly
          // or you can add branch filtering logic based on your business rules
          return true; // For now, include all materials
        });
        
        // Calculate expense based on total value and current stock
        const totalValue = materialsInBranch.reduce((sum, material) => {
          const materialValue = (material as any).totalValue || 0;
          const currentStock = material.currentStock || 0;
          return sum + (materialValue * currentStock);
        }, 0);
        
        // Apply time period multiplier and distribute across branches
        const expense = (totalValue / branches.length) * multiplier;
        chartData[branch.name] = Math.round(expense);
      });
      
      return chartData;
    });

    return materialExpensesData;
  };

  const machineExpensesByUnit = generateMachineExpensesData();
  const materialExpensesByUnit = generateMaterialExpensesData();
  const pendingApprovalsData = getPendingApprovalsData(selectedPeriod);

  // Calculate totals for actual branches based on machine expenses
  const totals = machineExpensesByUnit.reduce(
    (acc, row) => {
      branches.forEach(branch => {
        if (!acc[branch.id]) acc[branch.id] = 0;
        acc[branch.id] += row[branch.name] || 0;
      });
      return acc;
    },
    {} as Record<number, number>
  );

  const allUnitsTotal = Object.values(totals).reduce((sum: number, total: number) => sum + total, 0);

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

  // Fetch data on component mount and when period changes
  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchData} className="btn-primary">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

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

          {/* Dynamic Branch Cards */}
          {branches.map((branch, index) => {
            const colors = ['blue-500', 'orange-500', 'purple-500', 'pink-500', 'indigo-500'];
            const color = colors[index % colors.length];
            const total = totals[branch.id] || 0;
            
            return (
              <Card key={branch.id} className={`p-6 border-l-4 border-l-${color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Expenses - {branch.name}</p>
                    <p className="text-2xl font-bold">₹{total.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{branch.location}</p>
                  </div>
                  <Building2 className={`h-8 w-8 text-${color}`} />
                </div>
              </Card>
            );
          })}

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
              {machineExpensesByUnit.length > 0 ? (
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
                    {branches.map((branch, index) => {
                      const colors = ['#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
                      const color = colors[index % colors.length];
                      return (
                        <Bar 
                          key={branch.id}
                          dataKey={branch.name} 
                          fill={color} 
                          barSize={24} 
                          radius={[6, 6, 0, 0]}
                          name={branch.name}
                        />
                      );
                    })}
                  </ReBarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  <div className="text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No machine data available</p>
                  </div>
                </div>
              )}
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
              {materialExpensesByUnit.length > 0 ? (
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
                    {branches.map((branch, index) => {
                      const colors = ['#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
                      const color = colors[index % colors.length];
                      return (
                        <Bar 
                          key={branch.id}
                          dataKey={branch.name} 
                          fill={color} 
                          barSize={24} 
                          radius={[0, 6, 6, 0]}
                          name={branch.name}
                        />
                      );
                    })}
                  </ReBarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  <div className="text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No material data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyOwnerDashboard;


