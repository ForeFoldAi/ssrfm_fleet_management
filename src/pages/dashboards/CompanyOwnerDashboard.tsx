import { useState, useEffect } from "react";
import { IndianRupee, TrendingUp, TrendingDown, Minus, Calendar, Filter, Clock, AlertCircle, CheckCircle, Users, Building2, Loader2, WifiOff } from "lucide-react";
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
import { materialIndentsApi } from "../../lib/api/material-indents";
import { Branch, Machine, Material } from "../../lib/api/types";
import { useCache } from "../../contexts/CacheContext";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useNavigate } from "react-router-dom";

const CompanyOwnerDashboard = () => {
  const cache = useCache();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    return localStorage.getItem('dashboard-selected-period') || "this_month";
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [expensesData, setExpensesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Time period options
  const timePeriods = [
    { value: "this_month", label: "This Month", months: 1, dateRangeType: "this_month" },
    { value: "3m", label: "3 Months", months: 3, dateRangeType: "last_3_months" },
    { value: "6m", label: "6 Months", months: 6, dateRangeType: "last_6_months" },
    { value: "1y", label: "1 Year", months: 12, dateRangeType: "custom" },
  ];

  // Fetch branches from API with caching
  const fetchBranches = async (useCache: boolean = true) => {
    const cacheKey = 'dashboard-branches';
    
    if (useCache && cache.has(cacheKey)) {
      setBranches(cache.get(cacheKey));
      return;
    }

    try {
      const response = await branchesApi.getAll({
        page: 1,
        limit: 2,
        sortBy: 'id',
        sortOrder: 'ASC'
      });
      setBranches(response.data);
      cache.set(cacheKey, response.data, 10 * 60 * 1000); // Cache for 10 minutes
    } catch (err) {
      console.error('Error fetching branches:', err);
      throw new Error('Failed to load branches');
    }
  };

  // Fetch machines from API with caching
  const fetchMachines = async (useCache: boolean = true) => {
    const cacheKey = 'dashboard-machines';
    
    if (useCache && cache.has(cacheKey)) {
      setMachines(cache.get(cacheKey));
      return;
    }

    try {
      const response = await machinesApi.getAll({
        page: 1,
        limit: 100, // Get more machines for better data
        sortBy: 'name',
        sortOrder: 'ASC'
      });
      setMachines(response.data);
      cache.set(cacheKey, response.data, 10 * 60 * 1000); // Cache for 10 minutes
    } catch (err) {
      console.error('Error fetching machines:', err);
      throw new Error('Failed to load machines');
    }
  };

  // Fetch materials from API with caching
  const fetchMaterials = async (useCache: boolean = true) => {
    const cacheKey = 'dashboard-materials';
    
    if (useCache && cache.has(cacheKey)) {
      setMaterials(cache.get(cacheKey));
      return;
    }

    try {
      const response = await materialsApi.getMaterials({
        page: 1,
        limit: 100, // Get more materials for better data
        sortBy: 'name',
        sortOrder: 'ASC'
      });
      setMaterials(response.data);
      cache.set(cacheKey, response.data, 10 * 60 * 1000); // Cache for 10 minutes
    } catch (err) {
      console.error('Error fetching materials:', err);
      throw new Error('Failed to load materials');
    }
  };

  // Fetch pending approvals count
  const fetchPendingApprovals = async (useCache: boolean = true) => {
    const cacheKey = 'dashboard-pending-approvals';
    
    if (useCache && cache.has(cacheKey)) {
      setPendingApprovalsCount(cache.get(cacheKey));
      return;
    }

    try {
      const response = await materialIndentsApi.getAll({
        page: 1,
        limit: 1,
        status: 'pending_approval', // Only get pending_approval status, exclude approved
        sortBy: 'id',
        sortOrder: 'DESC',
      });
      
      // Debug logging to verify we're only getting pending approvals
      console.log('Pending approvals API response:', {
        itemCount: response.meta.itemCount,
        status: 'pending_approval',
        data: response.data
      });
      
      // Verify that all returned items have pending_approval status
      if (response.data && response.data.length > 0) {
        const nonPendingItems = response.data.filter(item => item.status !== 'pending_approval');
        if (nonPendingItems.length > 0) {
          console.warn('Warning: Found non-pending items in pending approvals response:', nonPendingItems);
        }
      }
      
      setPendingApprovalsCount(response.meta.itemCount);
      cache.set(cacheKey, response.meta.itemCount, 2 * 60 * 1000); // Cache for 2 minutes
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
      // Keep the current count on error
    }
  };

  // Fetch expenses data from dashboard API with caching
  const fetchExpensesData = async (useCache: boolean = true) => {
    const cacheKey = `dashboard-expenses-${selectedPeriod}`;
    
    if (useCache && cache.has(cacheKey)) {
      setExpensesData(cache.get(cacheKey));
      return;
    }

    try {
      const currentPeriod = timePeriods.find(p => p.value === selectedPeriod);
      const params: any = {
        dateRangeType: (currentPeriod?.dateRangeType || 'this_month') as 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'custom'
      };

      // For custom date ranges, calculate start and end dates
      if (params.dateRangeType === 'custom') {
        const endDate = new Date();
        const startDate = new Date();
        
        if (selectedPeriod === '1y') {
          startDate.setFullYear(endDate.getFullYear() - 1);
        }
        
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }
      
      const response = await dashboardApi.getExpenses(params);
      setExpensesData(response);
      cache.set(cacheKey, response, 5 * 60 * 1000); // Cache for 5 minutes
    } catch (err) {
      console.error('Error fetching expenses data:', err);
      throw new Error('Failed to load expenses data');
    }
  };

  // Fetch all data with smart loading
  const fetchData = async (showLoading: boolean = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      // Load cached data first, then update in background
      await Promise.all([
        fetchBranches(true), 
        fetchMachines(true), 
        fetchMaterials(true),
        fetchExpensesData(true),
        fetchPendingApprovals(true)
      ]);
      
      // If this is the initial load and we have cached data, mark as initialized
      if (!isInitialized) {
        setIsInitialized(true);
      }
      
      // Update data in background without showing loading
      setTimeout(async () => {
        try {
          await Promise.all([
            fetchBranches(false), 
            fetchMachines(false), 
            fetchMaterials(false),
            fetchExpensesData(false),
            fetchPendingApprovals(false)
          ]);
        } catch (err) {
          console.warn('Background data update failed:', err);
        }
      }, 100);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Get pending approvals data from API or fallback to mock
  const getPendingApprovalsData = (period: string) => {
    // Use real pending approvals count from API
    const baseCount = pendingApprovalsCount || 0;

    return {
      pendingApprovals: baseCount,
      averageApprovalTime: "2.5 days",
      approvalTrend: period === "this_month" ? 12.5 : period === "1m" ? 15.2 : period === "3m" ? 8.7 : period === "6m" ? -5.3 : -12.1,
    };
  };

  // Handle navigation to pending approvals
  const handlePendingApprovalsClick = () => {
    // Navigate to materials inventory with material-order-book tab and pending filter
    navigate('/materials-inventory?tab=material-order-book&filter=pending_approval');
  };

  // Generate machine expenses data based on API data or fallback to calculated data
  const generateMachineExpensesData = () => {
    // If we have API data, use it with actual branch names
    if (expensesData?.machineExpensesByUnit && expensesData.machineExpensesByUnit.length > 0) {
      return expensesData.machineExpensesByUnit.map((machine: any) => {
        const chartData: any = { machine: machine.machineType || machine.machineName || 'Unknown Machine' };
        
        // Use actual branch names from the branches array
        branches.forEach((branch, index) => {
          const branchKey = index === 0 ? 'unitOneAmount' : 'unitTwoAmount';
          const branchLabel = `${branch.name}${branch.location ? ` (${branch.location})` : ''}`;
          chartData[branchLabel] = machine[branchKey] || 0;
        });
        
        return chartData;
      });
    }

    // Fallback to calculated data
    if (machines.length === 0 || branches.length === 0) return [];

    const multiplier = {
      "this_month": 1,
      "1m": 1,
      "3m": 2.8,
      "6m": 5.5,
      "1y": 11.2,
    }[selectedPeriod] || 1;

    // Group machines by name for chart display
    const machineGroups = machines.reduce((acc, machine) => {
      const machineName = machine.name || 'Unknown Machine';
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
        if (branch && branch.id && branch.name) {
          // Count machines in this branch for this machine type
          const machinesInBranch = machineList.filter(m => m.branch && m.branch.id === branch.id);
          const baseExpense = 15000; // Base expense per machine
          const expense = machinesInBranch.length * baseExpense * multiplier;
          const branchLabel = `${branch.name}${branch.location ? ` (${branch.location})` : ''}`;
          chartData[branchLabel] = Math.round(expense);
        }
      });
      
      return chartData;
    });

    return machineExpensesData;
  };

  // Generate material expenses data based on API data or fallback to calculated data
  const generateMaterialExpensesData = () => {
    // If we have API data, use it with actual branch names
    if (expensesData?.materialExpensesByUnit && expensesData.materialExpensesByUnit.length > 0) {
      return expensesData.materialExpensesByUnit.map((material: any) => {
        const chartData: any = { material: material.materialType };
        
        // Use actual branch names from the branches array
        branches.forEach((branch, index) => {
          const branchKey = index === 0 ? 'unitOneAmount' : 'unitTwoAmount';
          const branchLabel = `${branch.name}${branch.location ? ` (${branch.location})` : ''}`;
          chartData[branchLabel] = material[branchKey] || 0;
        });
        
        return chartData;
      });
    }

    // Fallback to calculated data
    if (materials.length === 0 || branches.length === 0) return [];

    const multiplier = {
      "this_month": 1,
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
        if (branch && branch.id && branch.name) {
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
          const branchLabel = `${branch.name}${branch.location ? ` (${branch.location})` : ''}`;
          chartData[branchLabel] = Math.round(expense);
        }
      });
      
      return chartData;
    });

    return materialExpensesData;
  };

  const machineExpensesByUnit = generateMachineExpensesData();
  const materialExpensesByUnit = generateMaterialExpensesData();
  const pendingApprovalsData = getPendingApprovalsData(selectedPeriod);

  // Debug logging for machine expenses data
  console.log('Machine Expenses Data:', {
    machineExpensesByUnit,
    machines: machines.map(m => ({ id: m.id, name: m.name, type: m.type?.name })),
    branches: branches.map(b => ({ id: b.id, name: b.name })),
    expensesData: expensesData?.machineExpensesByUnit
  });

  // Get totals from API data or calculate from chart data
  const allUnitsTotal = expensesData?.totalExpenses?.total || 0;
  const unitOneTotal = expensesData?.unitOneExpenses?.total || 0;
  const unitTwoTotal = expensesData?.unitTwoExpenses?.total || 0;

  // Calculate totals for actual branches based on machine expenses (fallback)
  const totals = machineExpensesByUnit.reduce(
    (acc, row) => {
      branches.forEach(branch => {
        if (branch && branch.id) {
          if (!acc[branch.id]) acc[branch.id] = 0;
          acc[branch.id] += row[branch.name] || 0;
        }
      });
      return acc;
    },
    {} as Record<number, number>
  );

  // Use API data for unit totals if available, otherwise use calculated totals
  const finalTotals = expensesData ? {
    1: unitOneTotal,
    2: unitTwoTotal
  } : totals;

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
    return timePeriods.find(p => p.value === selectedPeriod)?.label || "This Month";
  };

  // Persist selected period to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-selected-period', selectedPeriod);
  }, [selectedPeriod]);

  // Fetch data on component mount and when period changes
  useEffect(() => {
    // Only show loading on initial load or when period changes
    const showLoading = !isInitialized;
    fetchData(showLoading);
  }, [selectedPeriod]);

  // Initial load
  useEffect(() => {
    fetchData(true);
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show loading on initial load, not on background updates
  if (loading && !isInitialized) {
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
          <Button onClick={() => fetchData(true)} className="btn-primary">
            Reload
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-4 sm:space-y-8 p-0 sm:p-6 max-w-7xl mx-auto">
        {/* Network Status Alert */}
        {!isOnline && (
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You are currently offline. Some features may not work properly. Please check your internet connection.
            </AlertDescription>
          </Alert>
        )}
        {/* Header Section - Left/Right Layout */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-6">
          {/* Left Side - Title and Description */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
              Expenses Dashboard
            </h1>
          </div>
          
          {/* Right Side - Time Period Filter */}
          <Card className="p-3 sm:p-4 bg-card shadow-lg border border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                Time Period:
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto">
                {timePeriods.map((period) => (
                  <Button
                    key={period.value}
                    variant={selectedPeriod === period.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto transition-all duration-200 ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Total Expenses - All Units */}
          <Card className="p-4 sm:p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Expenses - All Units</p>
                <p className="text-xl sm:text-2xl font-bold truncate">₹{allUnitsTotal.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
                  {branches.length > 0 ? branches.map(b => b.name).join(', ') : 'All Branches'}
                </p>
              </div>
              <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            </div>
          </Card>

          {/* Dynamic Branch Cards */}
          {branches.map((branch, index) => {
            const branchTotal = index === 0 ? unitOneTotal : unitTwoTotal;
            const borderColor = index === 0 ? 'border-l-blue-500' : 'border-l-orange-500';
            const iconColor = index === 0 ? 'text-blue-500' : 'text-orange-500';
            const periodData = index === 0 ? expensesData?.unitOneExpenses : expensesData?.unitTwoExpenses;
            
            return (
              <Card key={branch.id} className={`p-4 sm:p-6 border-l-4 ${borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      Total Expenses - {branch.name}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold truncate">₹{branchTotal.toLocaleString()}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
                      {branch.location || periodData?.period || 'N/A'}
                    </p>
                  </div>
                  <Building2 className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor} flex-shrink-0`} />
                </div>
              </Card>
            );
          })}

          {/* Pending Approvals */}
          <Card 
            className="p-4 sm:p-6 border-l-4 border-l-amber-500 cursor-pointer hover:shadow-lg transition-all duration-200 hover:bg-amber-50/50"
            onClick={handlePendingApprovalsClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Pending Approvals</p>
                <p className="text-xl sm:text-2xl font-bold">{pendingApprovalsData.pendingApprovals}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">Material Requests</p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 flex-shrink-0" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="space-y-4 sm:space-y-8">
          {/* Machine Expenses Chart */}
          <Card className="card-friendly shadow-lg border border-primary/20">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-lg lg:text-xl font-semibold flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full"></div>
                  <span className="text-sm sm:text-base lg:text-xl">Machine Expenses by Unit</span>
                </div>
                <Badge variant="outline" className="sm:ml-auto text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/30 w-fit">
                  {getPeriodLabel()}
                </Badge>
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Comparative analysis of machine expenses across different units
              </p>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              {machineExpensesByUnit.length > 0 ? (
                <ChartContainer config={{}} className="w-full h-64 sm:h-80">
                  <ReBarChart data={machineExpensesByUnit} margin={{ left: 10, right: 10, bottom: 40, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="machine" 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(value) => `₹${(value / 1000)}k`}
                      width={40}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                        labelFormatter={(label) => `Machine: ${label}`}
                      />} 
                    />
                    <ChartLegend />
                    {branches.map((branch, index) => {
                      const branchLabel = `${branch.name}${branch.location ? ` (${branch.location})` : ''}`;
                      const fillColor = index === 0 ? '#3B82F6' : '#F59E0B';
                      
                      return (
                        <Bar 
                          key={branch.id}
                          dataKey={branchLabel} 
                          fill={fillColor} 
                          barSize={20} 
                          radius={[6, 6, 0, 0]}
                          name={branchLabel}
                        />
                      );
                    })}
                  </ReBarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-64 sm:h-80 text-muted-foreground">
                  <div className="text-center">
                    <Building2 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs sm:text-sm">No machine data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Material Expenses Chart */}
          <Card className="card-friendly shadow-lg border border-primary/20">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-lg lg:text-xl font-semibold flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full"></div>
                  <span className="text-sm sm:text-base lg:text-xl">Material Expenses</span>
                </div>
                <Badge variant="outline" className="sm:ml-auto text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/30 w-fit">
                  {getPeriodLabel()}
                </Badge>
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Material-wise expense breakdown across units
              </p>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              {materialExpensesByUnit.length > 0 ? (
                <ChartContainer config={{}} className="w-full h-80 sm:h-96 lg:h-[28rem]">
                  <ReBarChart data={materialExpensesByUnit} layout="vertical" margin={{ left: 10, right: 10, bottom: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(value) => `₹${(value / 1000)}k`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="material" 
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      width={80}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                      />} 
                    />
                    <ChartLegend />
                    {branches.map((branch, index) => {
                      const branchLabel = `${branch.name}${branch.location ? ` (${branch.location})` : ''}`;
                      const fillColor = index === 0 ? '#3B82F6' : '#F59E0B';
                      
                      return (
                        <Bar 
                          key={branch.id}
                          dataKey={branchLabel} 
                          fill={fillColor} 
                          barSize={20} 
                          radius={[0, 6, 6, 0]}
                          name={branchLabel}
                        />
                      );
                    })}
                  </ReBarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-80 sm:h-96 lg:h-[28rem] text-muted-foreground">
                  <div className="text-center">
                    <Building2 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs sm:text-sm">No material data available</p>
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


