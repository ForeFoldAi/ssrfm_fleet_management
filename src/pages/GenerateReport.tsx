import { useState } from "react";
import { FileText, Download, Calendar, Filter, Package, TrendingUp, AlertTriangle, Users, BarChart3, PieChart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { toast } from "../hooks/use-toast";

const GenerateReport = () => {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [format, setFormat] = useState("pdf");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  const reportTypes = [
    {
      id: "inventory-summary",
      title: "Inventory Summary Report",
      description: "Complete overview of current stock levels, values, and status",
      icon: Package,
      color: "primary"
    },
    {
      id: "low-stock",
      title: "Low Stock Alert Report",
      description: "Items that need immediate attention and reordering",
      icon: AlertTriangle,
      color: "warning"
    },
    {
      id: "usage-trends",
      title: "Usage Trends Report",
      description: "Historical consumption patterns and forecasting",
      icon: TrendingUp,
      color: "success"
    },
    {
      id: "supplier-performance",
      title: "Supplier Performance Report",
      description: "Delivery times, quality metrics, and reliability scores",
      icon: Users,
      color: "info"
    },
    {
      id: "cost-analysis",
      title: "Cost Analysis Report",
      description: "Procurement costs, budget analysis, and savings opportunities",
      icon: BarChart3,
      color: "secondary"
    },
    {
      id: "category-breakdown",
      title: "Category Breakdown Report",
      description: "Material distribution and value analysis by category",
      icon: PieChart,
      color: "accent"
    }
  ];

  const categories = [
    "Raw Materials",
    "Fluids & Lubricants",
    "Consumables",
    "Components",
    "Safety Equipment",
    "Tools & Hardware",
    "Electrical Components",
    "Mechanical Parts"
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleGenerateReport = () => {
    if (!reportType) {
      toast({
        title: "Please select a report type",
        description: "Choose the type of report you want to generate.",
        variant: "destructive"
      });
      return;
    }

    if (!dateRange) {
      toast({
        title: "Please select a date range",
        description: "Choose the time period for your report.",
        variant: "destructive"
      });
      return;
    }

    const selectedReport = reportTypes.find(r => r.id === reportType);
    
    toast({
      title: "Report Generation Started",
      description: `Generating ${selectedReport?.title} in ${format.toUpperCase()} format...`,
    });

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report Generated Successfully",
        description: `Your ${selectedReport?.title} is ready for download.`,
      });
    }, 3000);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      primary: "bg-primary/10 text-primary border-primary/20",
      warning: "bg-warning/10 text-warning border-warning/20",
      success: "bg-success/10 text-success border-success/20",
      info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      secondary: "bg-secondary/10 text-secondary-foreground border-secondary/20",
      accent: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Generate Reports
        </h1>
        <p className="text-lg text-muted-foreground">
          Create comprehensive inventory and analytics reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <Card className="card-friendly">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Select Report Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      reportType === report.id
                        ? getColorClasses(report.color)
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => setReportType(report.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        reportType === report.id ? "bg-current/20" : "bg-primary/10"
                      }`}>
                        <report.icon className={`w-5 h-5 ${
                          reportType === report.id ? "text-current" : "text-primary"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Range & Filters */}
          <Card className="card-friendly">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {dateRange === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom">From Date</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateTo">To Date</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Categories Filter */}
              <div className="space-y-3">
                <Label>Material Categories (Optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label htmlFor={category} className="text-sm font-normal cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategories.map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview & Export */}
        <div className="space-y-6">
          {/* Export Options */}
          <Card className="card-friendly">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleGenerateReport}
              >
                <FileText className="w-5 h-5" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="card-friendly">
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Materials:</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Suppliers:</span>
                  <span className="font-semibold">34</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="font-semibold">₹8.47M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Low Stock Items:</span>
                  <span className="font-semibold text-warning">18</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="card-friendly">
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Monthly Inventory Summary", date: "2024-01-15", format: "PDF" },
                  { name: "Low Stock Alert", date: "2024-01-12", format: "Excel" },
                  { name: "Supplier Performance", date: "2024-01-10", format: "PDF" }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                    <div>
                      <p className="text-sm font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.date}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {report.format}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GenerateReport; 