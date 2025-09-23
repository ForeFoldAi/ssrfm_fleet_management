import { IndianRupee } from "lucide-react";
import { StatsCard } from "../../components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "../../components/ui/chart";
import { BarChart as ReBarChart, Bar, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

const CompanyOwnerDashboard = () => {
  // Example/demo data. Replace with live API data later if needed.

  const materialExpensesByUnit = [
    { material: "Bearings", "Unit-I": 220000, "Unit-II": 200000 },
    { material: "Belts", "Unit-I": 160000, "Unit-II": 140000 },
    { material: "Fevicol", "Unit-I": 120000, "Unit-II": 100000 },
    { material: "Repairs", "Unit-I": 80000, "Unit-II": 70000 },
    { material: "Other Works", "Unit-I": 60000, "Unit-II": 55000 },
  ];

  const expensesTable = [
    { machine: "CNC", "Unit-1": 32000, "Unit-2": 21000, "Unit-3": 12000 },
    { machine: "Lathe", "Unit-1": 18000, "Unit-2": 11000, "Unit-3": 6000 },
    { machine: "Milling", "Unit-1": 15000, "Unit-2": 9000, "Unit-3": 4000 },
    { machine: "Drill", "Unit-1": 8000, "Unit-2": 6000, "Unit-3": 4000 },
  ];

  const machineExpensesByUnit = expensesTable.map((row) => ({
    machine: row.machine,
    "Unit-I": row["Unit-1"],
    "Unit-II": row["Unit-2"],
  }));

  // Calculate total expenses by machine for pie chart
  const machineExpensesForPie = expensesTable.map((row) => ({
    name: row.machine,
    value: row["Unit-1"] + row["Unit-2"] + row["Unit-3"],
  }));

  // Colors for pie chart segments
  const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444'];

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

  return (
    <div className="space-y-6 p-4 sm:p-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Expenses Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of total and category-wise expenses</p>
      </div>

      {/* Total Expenses for Units and All Units */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Expenses - All Units"
          value={`₹${allUnitsTotal.toLocaleString()}`}
          description="This month"
          icon={IndianRupee}
          trend="vs last month"
          color="success"
        />
        <StatsCard
          title="Total Expenses - Unit-I"
          value={`₹${totals.unit1.toLocaleString()}`}
          description="This month"
          icon={IndianRupee}
          trend="vs last month"
          color="primary"
        />
        <StatsCard
          title="Total Expenses - Unit-II"
          value={`₹${totals.unit2.toLocaleString()}`}
          description="This month"
          icon={IndianRupee}
          trend="vs last month"
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Expenses (Vertical Grouped Bar) */}
        <Card className="card-friendly">
          <CardHeader className="pb-2">
            <CardTitle>Machine Expenses by Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full">
              <ReBarChart data={machineExpensesByUnit} margin={{ left: 0, right: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="machine" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend />
                <Bar dataKey="Unit-I" fill="#2563eb" barSize={16} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Unit-II" fill="#f59e0b" barSize={16} radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Total Machine Expenses Pie Chart */}
        <Card className="card-friendly">
          <CardHeader className="pb-2">
            <CardTitle>Total Machine Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={machineExpensesForPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {machineExpensesForPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Total Expenses']}
                  />} 
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Material Expenses (Horizontal Grouped Bar) */}
        <Card className="card-friendly">
          <CardHeader className="pb-2">
            <CardTitle>Material Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full">
              <ReBarChart data={materialExpensesByUnit} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="material" width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend />
                <Bar dataKey="Unit-I" fill="#2563eb" barSize={16} radius={[0, 4, 4, 0]} />
                <Bar dataKey="Unit-II" fill="#f59e0b" barSize={16} radius={[0, 4, 4, 0]} />
              </ReBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table of expenses: Machine, Unit-1, Unit-2, Unit-3 */}
      <Card className="card-friendly">
        <CardHeader className="pb-2">
          <CardTitle>Expenses by Machine and Unit</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Machine</TableHead>
                <TableHead className="text-right">Unit-1</TableHead>
                <TableHead className="text-right">Unit-2</TableHead>
                <TableHead className="text-right">Unit-3</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expensesTable.map((row) => (
                <TableRow key={row.machine}>
                  <TableCell className="font-medium">{row.machine}</TableCell>
                  <TableCell className="text-right">₹{row["Unit-1"].toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{row["Unit-2"].toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{row["Unit-3"].toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyOwnerDashboard;
