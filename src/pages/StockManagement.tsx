import { useState } from "react";
import { Package, Plus, Search, Filter, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, FileText, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../hooks/use-toast";

const StockManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMaterial, setFilterMaterial] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  // Current Stock Data (SSRFM Materials)
  const stockData = [
    {
      id: "STK-001",
      name: "Bearings",
      category: "Mechanical Components",
      currentStock: 24,
      minStock: 10,
      maxStock: 50,
      unit: "pieces",
      location: "Parts Storage A-1",
      supplier: "SKF Industries",
      unitPrice: "₹700",
      totalValue: "₹16,800",
      lastUpdated: "2024-01-20",
      status: "good",
      reorderLevel: 10,
      leadTime: "5 days"
    },
    {
      id: "STK-002", 
      name: "Motor Oil",
      category: "Lubricants",
      currentStock: 65,
      minStock: 20,
      maxStock: 100,
      unit: "liters",
      location: "Chemical Storage B-1",
      supplier: "Castrol Distributors",
      unitPrice: "₹160",
      totalValue: "₹10,400",
      lastUpdated: "2024-01-18",
      status: "good",
      reorderLevel: 20,
      leadTime: "3 days"
    },
    {
      id: "STK-003",
      name: "Conveyor Belts",
      category: "Mechanical Components",
      currentStock: 45,
      minStock: 15,
      maxStock: 60,
      unit: "meters",
      location: "Equipment Storage C-1",
      supplier: "Continental Belting",
      unitPrice: "₹1,233",
      totalValue: "₹55,485",
      lastUpdated: "2024-01-16",
      status: "good",
      reorderLevel: 15,
      leadTime: "7 days"
    },
    {
      id: "STK-004",
      name: "Grinding Stones",
      category: "Processing Equipment",
      currentStock: 4,
      minStock: 2,
      maxStock: 10,
      unit: "pieces",
      location: "Mill Equipment D-1",
      supplier: "Stone Craft Industries",
      unitPrice: "₹22,500",
      totalValue: "₹90,000",
      lastUpdated: "2024-01-15",
      status: "good",
      reorderLevel: 2,
      leadTime: "14 days"
    },
    {
      id: "STK-005",
      name: "Safety Equipment",
      category: "Safety",
      currentStock: 15,
      minStock: 20,
      maxStock: 50,
      unit: "sets",
      location: "Safety Storage E-1",
      supplier: "3M Safety Solutions",
      unitPrice: "₹850",
      totalValue: "₹12,750",
      lastUpdated: "2024-01-14",
      status: "low",
      reorderLevel: 20,
      leadTime: "4 days"
    },
    {
      id: "STK-006",
      name: "Fevicol",
      category: "Adhesives & Sealants",
      currentStock: 8,
      minStock: 15,
      maxStock: 40,
      unit: "bottles",
      location: "Chemical Storage B-2",
      supplier: "Pidilite Industries",
      unitPrice: "₹120",
      totalValue: "₹960",
      lastUpdated: "2024-01-12",
      status: "critical",
      reorderLevel: 15,
      leadTime: "2 days"
    },
    {
      id: "STK-007",
      name: "Electrical Wires",
      category: "Electrical",
      currentStock: 85,
      minStock: 50,
      maxStock: 200,
      unit: "meters",
      location: "Electrical Storage F-1",
      supplier: "Havells",
      unitPrice: "₹45",
      totalValue: "₹3,825",
      lastUpdated: "2024-01-11",
      status: "good",
      reorderLevel: 50,
      leadTime: "3 days"
    }
  ];

  // Transaction Register Data
  const stockTransactions = [
    {
      id: "SR-001",
      date: "2024-01-20",
      material: "Bearings",
      type: "received",
      receivedFrom: "SKF Industries",
      invoiceNo: "INV-2024-156",
      rate: "₹700",
      amount: "₹2,800",
      receiptQuantity: 4,
      issuedQuantity: 0,
      balanceQuantity: 24,
      unit: "pieces",
      remarks: "Premium quality bearings for grinding machines"
    },
    {
      id: "SR-002",
      date: "2024-01-19",
      material: "Bearings",
      type: "issued",
      issuedTo: "Maintenance Team - Machine #3",
      issueNo: "ISS-2024-089",
      rate: "₹700",
      amount: "₹2,800",
      receiptQuantity: 0,
      issuedQuantity: 4,
      balanceQuantity: 20,
      unit: "pieces",
      remarks: "Issued for flour grinding machine #3 bearing replacement"
    },
    {
      id: "SR-003",
      date: "2024-01-18",
      material: "Motor Oil",
      type: "received",
      receivedFrom: "Castrol Distributors",
      invoiceNo: "INV-2024-145",
      rate: "₹160",
      amount: "₹3,200",
      receiptQuantity: 20,
      issuedQuantity: 0,
      balanceQuantity: 85,
      unit: "liters",
      remarks: "SAE 20W-50 Heavy Duty Motor Oil for routine maintenance"
    },
    {
      id: "SR-004",
      date: "2024-01-17",
      material: "Motor Oil",
      type: "issued",
      issuedTo: "Maintenance Team - Motors",
      issueNo: "ISS-2024-087",
      rate: "₹160",
      amount: "₹800",
      receiptQuantity: 0,
      issuedQuantity: 5,
      balanceQuantity: 65,
      unit: "liters",
      remarks: "Monthly maintenance for grinding motors"
    },
    {
      id: "SR-005",
      date: "2024-01-16",
      material: "Conveyor Belts",
      type: "received",
      receivedFrom: "Continental Belting",
      invoiceNo: "INV-2024-134",
      rate: "₹1,233",
      amount: "₹18,500",
      receiptQuantity: 15,
      issuedQuantity: 0,
      balanceQuantity: 45,
      unit: "meters",
      remarks: "Food grade rubber conveyor belts for packaging line"
    },
    {
      id: "SR-006",
      date: "2024-01-15",
      material: "Grinding Stones",
      type: "issued",
      issuedTo: "Production Team - Main Mill",
      issueNo: "ISS-2024-085",
      rate: "₹22,500",
      amount: "₹45,000",
      receiptQuantity: 0,
      issuedQuantity: 2,
      balanceQuantity: 4,
      unit: "pieces",
      remarks: "Replacement of worn grinding stones in main flour mill"
    },
    {
      id: "SR-007",
      date: "2024-01-14",
      material: "Safety Equipment",
      type: "received",
      receivedFrom: "3M Safety Solutions",
      invoiceNo: "INV-2024-128",
      rate: "₹850",
      amount: "₹8,500",
      receiptQuantity: 10,
      issuedQuantity: 0,
      balanceQuantity: 25,
      unit: "sets",
      remarks: "Complete safety equipment sets for mill workers"
    },
    {
      id: "SR-008",
      date: "2024-01-13",
      material: "Safety Equipment",
      type: "issued",
      issuedTo: "Production Workers",
      issueNo: "ISS-2024-083",
      rate: "₹850",
      amount: "₹8,500",
      receiptQuantity: 0,
      issuedQuantity: 10,
      balanceQuantity: 15,
      unit: "sets",
      remarks: "Annual safety equipment distribution to production workers"
    }
  ];

  const materials = ["Bearings", "Motor Oil", "Conveyor Belts", "Grinding Stones", "Safety Equipment", "Fevicol", "Electrical Wires"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500 text-white';
      case 'low': return 'bg-yellow-500 text-white';
      case 'good': return 'bg-secondary/100 text-white';
      case 'overstocked': return 'bg-secondary/100 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <TrendingDown className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'overstocked': return <TrendingUp className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'received' ? 'bg-secondary/100 text-white' : 'bg-secondary/100 text-white';
  };

  const getTypeIcon = (type: string) => {
    return type === 'received' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const filteredStock = stockData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredTransactions = stockTransactions.filter(transaction => {
    const matchesSearch = transaction.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.receivedFrom && transaction.receivedFrom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.issuedTo && transaction.issuedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMaterial = filterMaterial === "all" || transaction.material === filterMaterial;
    const matchesType = filterType === "all" || transaction.type === filterType;
    
    return matchesSearch && matchesMaterial && matchesType;
  });

  const handleAddStock = () => {
    toast({
      title: "Stock Added Successfully",
      description: "New stock item has been added to the inventory system.",
    });
    setIsAddStockOpen(false);
  };

  const handleAddTransaction = () => {
    toast({
      title: "Transaction Recorded",
      description: "Stock transaction has been recorded in the register.",
    });
    setIsAddTransactionOpen(false);
  };

  // Calculate summaries
  const stockSummary = {
    totalItems: stockData.length,
    totalValue: stockData.reduce((sum, item) => sum + parseInt(item.totalValue.replace('₹', '').replace(',', '')), 0),
    criticalItems: stockData.filter(item => item.status === 'critical').length,
    lowStockItems: stockData.filter(item => item.status === 'low').length
  };

  const transactionSummary = {
    totalReceived: stockTransactions.reduce((sum, entry) => sum + (entry.receiptQuantity || 0), 0),
    totalIssued: stockTransactions.reduce((sum, entry) => sum + (entry.issuedQuantity || 0), 0),
    totalTransactions: stockTransactions.length,
    totalTransactionValue: stockTransactions
      .filter(entry => entry.type === 'received')
      .reduce((sum, entry) => sum + parseInt(entry.amount.replace('₹', '').replace(',', '')), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          SSRFM Stock Management
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete inventory control with stock levels and transaction register
        </p>
      </div>

      {/* Combined Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-friendly">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Stock Items</p>
                <p className="text-2xl font-bold text-foreground">{stockSummary.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-friendly">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Value</p>
                <p className="text-2xl font-bold text-foreground">₹{(stockSummary.totalValue / 1000).toFixed(0)}K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-friendly">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical/Low Items</p>
                <p className="text-2xl font-bold text-red-600">{stockSummary.criticalItems + stockSummary.lowStockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-friendly">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold text-purple-600">{transactionSummary.totalTransactions}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Views */}
      <Tabs defaultValue="stock-overview" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 lg:grid-cols-3 h-auto p-2 bg-secondary rounded-xl">
          <TabsTrigger 
            value="stock-overview" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Package className="w-4 h-4" />
            Stock Overview
          </TabsTrigger>
          <TabsTrigger 
            value="stock-register" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-4 h-4" />
            Stock Register
          </TabsTrigger>
          <TabsTrigger 
            value="add-stock" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </TabsTrigger>
        </TabsList>

        {/* Stock Overview Tab */}
        <TabsContent value="stock-overview" className="space-y-6">
          {/* Filters for Stock Overview */}
          <Card className="card-friendly">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name, category, or supplier..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Mechanical Components">Mechanical Components</SelectItem>
                      <SelectItem value="Lubricants">Lubricants</SelectItem>
                      <SelectItem value="Processing Equipment">Processing Equipment</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Adhesives & Sealants">Adhesives & Sealants</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="overstocked">Overstocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Items Table */}
          <Card className="card-friendly">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                Stock Overview - All Items ({filteredStock.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="font-semibold">Item Name</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Current Stock</TableHead>
                      <TableHead className="font-semibold">Min/Max Stock</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Unit Price</TableHead>
                      <TableHead className="font-semibold">Total Value</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Supplier</TableHead>
                      <TableHead className="font-semibold">Lead Time</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock.map((item) => (
                      <TableRow key={item.id} className="hover:bg-secondary/30">
                        <TableCell>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {item.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{item.category}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">
                            {item.currentStock} {item.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {item.minStock}/{item.maxStock} {item.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(item.status)} gap-1`}>
                            {getStatusIcon(item.status)}
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground">{item.unitPrice}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground">{item.totalValue}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-32 truncate" title={item.location}>
                            {item.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-32 truncate" title={item.supplier}>
                            {item.supplier}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{item.leadTime}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-xs px-2">
                              Update
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs px-2">
                              Reorder
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Register Tab */}
        <TabsContent value="stock-register" className="space-y-6">
          {/* Transaction Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-friendly">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                    <p className="text-2xl font-bold text-foreground">{transactionSummary.totalReceived}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-friendly">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Issued</p>
                    <p className="text-2xl font-bold text-foreground">{transactionSummary.totalIssued}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-friendly">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Balance Stock</p>
                    <p className="text-2xl font-bold text-purple-600">{transactionSummary.totalReceived - transactionSummary.totalIssued}</p>
                  </div>
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-friendly">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Transaction Value</p>
                    <p className="text-2xl font-bold text-foreground">₹{(transactionSummary.totalTransactionValue / 1000).toFixed(0)}K</p>
                  </div>
                  <FileText className="w-8 h-8 text-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Filters */}
          <Card className="card-friendly">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by material, ID, supplier, or recipient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterMaterial} onValueChange={setFilterMaterial}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by Material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Materials</SelectItem>
                      {materials.map((material) => (
                        <SelectItem key={material} value={material}>{material}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Stock Transaction</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Transaction Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="received">Material Received</SelectItem>
                              <SelectItem value="issued">Material Issued</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Material</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent>
                              {materials.map((material) => (
                                <SelectItem key={material} value={material}>{material}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input type="number" placeholder="Enter quantity" />
                        </div>
                        <div>
                          <Label>Rate per Unit</Label>
                          <Input placeholder="Enter rate (₹)" />
                        </div>
                        <div>
                          <Label>Invoice/Issue Number</Label>
                          <Input placeholder="Enter document number" />
                        </div>
                        <div>
                          <Label>Remarks</Label>
                          <Textarea placeholder="Transaction details and notes" />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1" onClick={handleAddTransaction}>Add Transaction</Button>
                          <Button variant="outline" onClick={() => setIsAddTransactionOpen(false)}>Cancel</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Register Table */}
          <Card className="card-friendly">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Stock Register - All Transactions ({filteredTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Material</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Received From / Issued To</TableHead>
                      <TableHead className="font-semibold">Invoice/Issue No.</TableHead>
                      <TableHead className="font-semibold">Rate</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Receipt Qty</TableHead>
                      <TableHead className="font-semibold">Issued Qty</TableHead>
                      <TableHead className="font-semibold">Balance Qty</TableHead>
                      <TableHead className="font-semibold">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-secondary/30">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {transaction.date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{transaction.material}</div>
                          <div className="text-sm text-muted-foreground">ID: {transaction.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(transaction.type)}>
                            <span className="flex items-center gap-1">
                              {getTypeIcon(transaction.type)}
                              {transaction.type}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-48">
                            {transaction.type === 'received' ? transaction.receivedFrom : transaction.issuedTo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {transaction.type === 'received' ? transaction.invoiceNo : transaction.issueNo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground">{transaction.rate}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground">{transaction.amount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            {transaction.receiptQuantity > 0 ? (
                              <span className="font-semibold text-foreground">
                                +{transaction.receiptQuantity} {transaction.unit}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            {transaction.issuedQuantity > 0 ? (
                              <span className="font-semibold text-red-600">
                                -{transaction.issuedQuantity} {transaction.unit}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center font-semibold text-purple-600">
                            {transaction.balanceQuantity} {transaction.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-64 text-sm text-muted-foreground">
                            {transaction.remarks}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Stock Tab */}
        <TabsContent value="add-stock" className="space-y-6">
          <Card className="card-friendly max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-6 h-6 text-primary" />
                Add New Stock Item
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input id="itemName" placeholder="Enter material name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mechanical">Mechanical Components</SelectItem>
                      <SelectItem value="lubricants">Lubricants</SelectItem>
                      <SelectItem value="processing">Processing Equipment</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="adhesives">Adhesives & Sealants</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Current Stock *</Label>
                  <Input id="currentStock" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input id="unit" placeholder="pieces, kg, liters, meters..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock Level *</Label>
                  <Input id="minStock" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStock">Maximum Stock Level *</Label>
                  <Input id="maxStock" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
                  <Input id="unitPrice" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Unit *</Label>
                  <Input id="location" placeholder="e.g., Parts Storage A-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Primary Supplier</Label>
                  <Input id="supplier" placeholder="Supplier company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadTime">Lead Time</Label>
                  <Input id="leadTime" placeholder="e.g., 5 days" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description & Specifications</Label>
                  <Textarea id="description" placeholder="Detailed description, technical specifications, usage notes..." className="min-h-[100px]" />
                </div>
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleAddStock}>
                  Add Stock Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredStock.length === 0 && (
        <Card className="card-friendly">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Stock Items Found</h3>
            <p className="text-muted-foreground mb-4">
              No items match your current filters. Try adjusting your search criteria.
            </p>
            <Button onClick={() => setSearchTerm("")}>Clear Filters</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockManagement; 