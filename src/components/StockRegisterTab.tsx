import { useState } from "react";
import { Package, Search, Filter, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Eye, List, Table as TableIcon, Plus, Minus, History, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "../hooks/use-toast";
import { useStock } from "../contexts/StockContext";
import { useNavigate } from "react-router-dom";


const StockRegisterTab = () => {
  const { stockData, addStock, requestStock } = useStock();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "table">("table");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isRequestStockOpen, setIsRequestStockOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [addQuantity, setAddQuantity] = useState("");
  const [requestQuantity, setRequestQuantity] = useState("");
  const [transactionNote, setTransactionNote] = useState("");


  // Note: stockData now comes from StockContext and includes real-time updates from requests

  // Helper function to determine status based on stock levels
  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock <= minStock * 0.5) return "critical";
    if (currentStock <= minStock) return "low";
    return "good";
  };

  // Handle adding stock
  const handleAddStock = () => {
    if (!selectedItem || !addQuantity || parseInt(addQuantity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid quantity to add.",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(addQuantity);
    const note = transactionNote || `Stock added - ${quantity} ${selectedItem.unit}`;
    
    addStock(selectedItem.id, quantity, note, "Current User");

    toast({
      title: "Stock Added Successfully",
      description: `Added ${quantity} ${selectedItem.unit} to ${selectedItem.name}.`,
    });

    // Reset form
    setAddQuantity("");
    setTransactionNote("");
    setIsAddStockOpen(false);
  };

  // Handle requesting stock (reducing stock)
  const handleRequestStock = () => {
    if (!selectedItem || !requestQuantity || parseInt(requestQuantity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid quantity to request.",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(requestQuantity);
    
    if (quantity > selectedItem.currentStock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${selectedItem.currentStock} ${selectedItem.unit} available. Cannot fulfill request for ${quantity} ${selectedItem.unit}.`,
        variant: "destructive",
      });
      return;
    }

    const note = transactionNote || `Stock requested - ${quantity} ${selectedItem.unit}`;
    
    requestStock(selectedItem.id, quantity, note, "Current User");

    toast({
      title: "Stock Request Processed",
      description: `Requested ${quantity} ${selectedItem.unit} from ${selectedItem.name}.`,
    });

    // Reset form
    setRequestQuantity("");
    setTransactionNote("");
    setIsRequestStockOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "bg-primary/10 text-primary border-primary/20";
      case "low": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good": return <CheckCircle className="w-4 h-4" />;
      case "low": return <AlertTriangle className="w-4 h-4" />;
      case "critical": return <TrendingDown className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const filteredData = stockData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Demo Section */}
     

      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Stock Register</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/add-stock')}
            className="bg-primary hover:bg-primary-hover text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="flex items-center gap-2"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search stock items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 sm:h-auto"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48 h-10 sm:h-auto">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Mechanical Components">Mechanical</SelectItem>
            <SelectItem value="Lubricants">Lubricants</SelectItem>
            <SelectItem value="Raw Materials">Raw Materials</SelectItem>
            <SelectItem value="Safety Equipment">Safety</SelectItem>
            <SelectItem value="Consumables">Consumables</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-32 h-10 sm:h-auto">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="grid gap-3 sm:gap-4">
          {filteredData.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)} flex items-center gap-1`}>
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Current Stock:</span> {item.currentStock} {item.unit}
                      </div>
                      <div>
                        <span className="font-medium">Min/Max:</span> {item.minStock}/{item.maxStock} {item.unit}
                      </div>
                      <div className="break-words">
                        <span className="font-medium">Material:</span> {item.supplier}
                      </div>
                      <div className="break-words">
                        <span className="font-medium">Category:</span> {item.category}
                      </div>
                    </div>
                    
                    {(() => {
                      const latestRequest = item.transactions.find(t => t.requestId);
                      return latestRequest && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t">
                          <div>
                            <span className="font-medium">Request From:</span> {latestRequest.user}
                          </div>
                          <div>
                            <span className="font-medium">Request ID:</span> {latestRequest.requestId}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="text-right">
                      <div className="font-semibold text-sm sm:text-base">₹{item.totalValue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Value</div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedItem(item);
                          setIsAddStockOpen(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="sm:hidden">Add</span>
                        <span className="hidden sm:inline">Add Stock</span>
                      </Button>
                     
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedItem(item);
                          setIsHistoryOpen(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        <History className="w-4 h-4 mr-2" />
                        <span className="sm:hidden">History</span>
                        <span className="hidden sm:inline">History</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Item Name</TableHead>
                    <TableHead className="min-w-[100px]">Category</TableHead>
                    <TableHead className="min-w-[100px]">Material</TableHead>
                    <TableHead className="min-w-[100px]">Current Stock</TableHead>
                    <TableHead className="min-w-[120px]">Min/Max Stock</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Request From</TableHead>
                    <TableHead className="min-w-[100px]">Request ID</TableHead>
                    <TableHead className="min-w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => {
                    // Get the most recent request from transactions
                    const latestRequest = item.transactions.find(t => t.requestId);
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.id}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{item.category}</TableCell>
                        <TableCell className="text-sm">{item.supplier}</TableCell>
                        <TableCell className="text-sm font-medium">{item.currentStock} {item.unit}</TableCell>
                        <TableCell className="text-sm">
                          <div className="space-y-1">
                            <div>Min: {item.minStock} {item.unit}</div>
                            <div>Max: {item.maxStock} {item.unit}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(item.status)}
                            <span className="capitalize">{item.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {latestRequest ? latestRequest.user : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {latestRequest ? latestRequest.requestId : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-2 text-xs"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsAddStockOpen(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Stock
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-2 text-xs"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsHistoryOpen(true);
                              }}
                            >
                              <History className="w-3 h-3 mr-1" />
                              History
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stock items found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Stock Dialog */}
      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary/80" />
              Add Stock - {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Current Stock:</span>
                  <div className="text-lg font-semibold text-foreground">
                    {selectedItem?.currentStock} {selectedItem?.unit}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(selectedItem?.status || '')} flex items-center gap-1 w-fit mt-1`}>
                      {getStatusIcon(selectedItem?.status || '')}
                      <span className="capitalize">{selectedItem?.status}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-quantity">Quantity to Add</Label>
              <Input
                id="add-quantity"
                type="number"
                placeholder={`Enter quantity in ${selectedItem?.unit}`}
                value={addQuantity}
                onChange={(e) => setAddQuantity(e.target.value)}
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-note">Note (Optional)</Label>
              <Textarea
                id="add-note"
                placeholder="Enter reason for adding stock..."
                value={transactionNote}
                onChange={(e) => setTransactionNote(e.target.value)}
                rows={3}
              />
            </div>

            {addQuantity && parseInt(addQuantity) > 0 && (
              <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-primary">After adding stock:</div>
                  <div className="text-primary/90">
                    New Stock: <span className="font-semibold">
                      {(selectedItem?.currentStock || 0) + parseInt(addQuantity)} {selectedItem?.unit}
                    </span>
                  </div>
                  <div className="text-primary/90">
                    New Value: <span className="font-semibold">
                      ₹{((selectedItem?.currentStock || 0) + parseInt(addQuantity)) * (selectedItem?.unitPrice || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddStock} className="flex-1 bg-primary hover:bg-primary-hover">
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
              <Button variant="outline" onClick={() => setIsAddStockOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Stock Dialog */}
      <Dialog open={isRequestStockOpen} onOpenChange={setIsRequestStockOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Minus className="w-5 h-5 text-orange-600" />
              Request Stock - {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Available Stock:</span>
                  <div className="text-lg font-semibold text-foreground">
                    {selectedItem?.currentStock} {selectedItem?.unit}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Min Stock Level:</span>
                  <div className="text-sm text-muted-foreground">
                    {selectedItem?.minStock} {selectedItem?.unit}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="request-quantity">Quantity to Request</Label>
              <Input
                id="request-quantity"
                type="number"
                placeholder={`Enter quantity in ${selectedItem?.unit}`}
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(e.target.value)}
                min="1"
                max={selectedItem?.currentStock}
              />
              <div className="text-xs text-muted-foreground">
                Maximum available: {selectedItem?.currentStock} {selectedItem?.unit}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="request-note">Purpose/Note</Label>
              <Textarea
                id="request-note"
                placeholder="Enter purpose for requesting stock..."
                value={transactionNote}
                onChange={(e) => setTransactionNote(e.target.value)}
                rows={3}
              />
            </div>

            {requestQuantity && parseInt(requestQuantity) > 0 && (
              <div className={`border p-3 rounded-lg ${
                parseInt(requestQuantity) > (selectedItem?.currentStock || 0)
                  ? 'bg-red-50 border-red-200'
                  : 'bg-accent/10 border-accent/20'
              }`}>
                <div className="text-sm">
                  <div className={`font-medium ${
                    parseInt(requestQuantity) > (selectedItem?.currentStock || 0)
                      ? 'text-red-800'
                      : 'text-accent-foreground'
                  }`}>
                    {parseInt(requestQuantity) > (selectedItem?.currentStock || 0)
                      ? 'Insufficient Stock!'
                      : 'After request:'
                    }
                  </div>
                  {parseInt(requestQuantity) <= (selectedItem?.currentStock || 0) && (
                    <>
                      <div className="text-accent-foreground">
                        Remaining Stock: <span className="font-semibold">
                          {(selectedItem?.currentStock || 0) - parseInt(requestQuantity)} {selectedItem?.unit}
                        </span>
                      </div>
                      <div className="text-accent-foreground">
                        Status: <span className="font-semibold">
                          {getStockStatus((selectedItem?.currentStock || 0) - parseInt(requestQuantity), selectedItem?.minStock || 0)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleRequestStock} 
                className="flex-1 bg-accent hover:bg-accent/90"
                disabled={!requestQuantity || parseInt(requestQuantity) > (selectedItem?.currentStock || 0)}
              >
                <Minus className="w-4 h-4 mr-2" />
                Request Stock
              </Button>
              <Button variant="outline" onClick={() => setIsRequestStockOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-foreground" />
              Transaction History - {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current Stock Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Current Stock:</span>
                  <div className="text-lg font-semibold text-foreground">
                    {selectedItem?.currentStock} {selectedItem?.unit}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Total Value:</span>
                  <div className="text-lg font-semibold text-primary/80">
                    ₹{selectedItem?.totalValue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(selectedItem?.status || '')} flex items-center gap-1 w-fit mt-1`}>
                      {getStatusIcon(selectedItem?.status || '')}
                      <span className="capitalize">{selectedItem?.status}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/30 p-3 border-b">
                <h3 className="font-semibold text-base">Transaction History - {selectedItem?.name}</h3>
              </div>
              
              <div className="overflow-x-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Date</TableHead>
                      <TableHead className="min-w-[120px]">Material</TableHead>
                      <TableHead className="min-w-[100px]">Type</TableHead>
                      <TableHead className="min-w-[120px]">Invoice/Issue No.</TableHead>
                      <TableHead className="min-w-[100px]">Requested Qty</TableHead>
                      <TableHead className="min-w-[100px]">Issued Qty</TableHead>
                      <TableHead className="min-w-[100px]">Balance Qty</TableHead>
                      <TableHead className="min-w-[120px]">Requested By</TableHead>
                      <TableHead className="min-w-[200px]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItem?.transactions?.map((transaction, index) => (
                      <TableRow key={index} className={
                        transaction.type === 'stock_in' 
                          ? 'bg-primary/5' 
                          : transaction.type === 'issued_request'
                          ? 'bg-secondary/10/50'
                          : 'bg-orange-50/50'
                      }>
                        <TableCell className="text-sm">{transaction.date}</TableCell>
                        <TableCell className="text-sm font-medium">{selectedItem?.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${
                            transaction.type === 'stock_in' 
                              ? 'bg-primary/10 text-primary' 
                              : transaction.type === 'issued_request'
                              ? 'bg-secondary/20 text-foreground'
                              : 'bg-orange-100 text-accent-foreground'
                          }`}>
                            {transaction.type === 'stock_in' ? 'Stock In' : 
                             transaction.type === 'issued_request' ? 'Issue' : 'Request'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.requestId || 
                           (transaction.type === 'stock_in' ? `INV-${transaction.date.replace(/-/g, '')}` : '-')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.type !== 'stock_in' ? `${transaction.quantity} ${selectedItem?.unit}` : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className={transaction.type === 'stock_in' ? 'text-primary/80 font-medium' : ''}>
                            {transaction.quantity} {selectedItem?.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {transaction.balance} {selectedItem?.unit}
                        </TableCell>
                        <TableCell className="text-sm">{transaction.user}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate" title={transaction.note}>
                          {transaction.note}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { StockRegisterTab }; 