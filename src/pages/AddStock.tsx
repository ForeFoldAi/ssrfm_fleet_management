import { useState } from "react";
import { Plus, Package, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useStock } from "../contexts/StockContext";
import { toast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AddStock = () => {
  const { stockData, addStock } = useStock();
  const navigate = useNavigate();
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [supplierInvoice, setSupplierInvoice] = useState("");
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      case "critical": return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStockStatus = (currentStock: number, minStock: number): 'good' | 'low' | 'critical' => {
    if (currentStock <= minStock * 0.5) return "critical";
    if (currentStock <= minStock) return "low";
    return "good";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem || !quantity || parseInt(quantity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select an item and enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const quantityNum = parseInt(quantity);
      const transactionNote = note || `Stock added - ${quantityNum} ${selectedItem.unit}${supplierInvoice ? ` (Invoice: ${supplierInvoice})` : ''}`;
      
      addStock(selectedItem.id, quantityNum, transactionNote, "Current User");

      toast({
        title: "Stock Added Successfully",
        description: `Added ${quantityNum} ${selectedItem.unit} to ${selectedItem.name}. Stock Register updated.`,
      });

      // Reset form
      setSelectedItem(null);
      setQuantity("");
      setNote("");
      setSupplierInvoice("");
      setReceivedDate(new Date().toISOString().split('T')[0]);
      
      // Navigate back to inventory after short delay
      setTimeout(() => {
        navigate('/materials-inventory');
      }, 1500);

    } catch (error) {
      toast({
        title: "Error Adding Stock",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/materials-inventory')}
          className="flex items-center gap-2 absolute left-0 top-0"
        >
          <ArrowLeft className="w-4 h-4" />
         Back
        </Button>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Add Stock to Inventory
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Add new stock to existing inventory items
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary/80" />
              Stock Addition Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Selection */}
              <div className="space-y-2">
                <Label htmlFor="select-item">Select Inventory Item *</Label>
                <Select 
                  value={selectedItem?.id || ""} 
                  onValueChange={(value) => {
                    const item = stockData.find(i => i.id === value);
                    setSelectedItem(item);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item to add stock" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockData.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                              {item.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground ml-4">
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity to Add *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder={selectedItem ? `Enter quantity in ${selectedItem.unit}` : "Select an item first"}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  disabled={!selectedItem}
                />
              </div>

              {/* Supplier Invoice */}
              <div className="space-y-2">
                <Label htmlFor="supplier-invoice">Supplier Invoice Number</Label>
                <Input
                  id="supplier-invoice"
                  type="text"
                  placeholder="Enter invoice/receipt number"
                  value={supplierInvoice}
                  onChange={(e) => setSupplierInvoice(e.target.value)}
                />
              </div>

              {/* Received Date */}
              <div className="space-y-2">
                <Label htmlFor="received-date">Received Date</Label>
                <Input
                  id="received-date"
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter reason for adding stock, supplier details, or other notes..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover"
                disabled={!selectedItem || !quantity || parseInt(quantity) <= 0 || isSubmitting}
              >
                {isSubmitting ? (
                  "Adding Stock..."
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock to Inventory
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {selectedItem && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-foreground" />
                Item Overview & Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Item Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">{selectedItem.name}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Category:</span>
                    <div className="text-muted-foreground">{selectedItem.category}</div>
                  </div>
                  <div>
                    <span className="font-medium">Supplier:</span>
                    <div className="text-muted-foreground">{selectedItem.supplier}</div>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <div className="text-muted-foreground">{selectedItem.location}</div>
                  </div>
                  <div>
                    <span className="font-medium">Unit Price:</span>
                    <div className="text-muted-foreground">₹{selectedItem.unitPrice}</div>
                  </div>
                </div>
              </div>

              {/* Current Stock Status */}
              <div className="bg-secondary/10 border border-secondary p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Current Stock Status</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Current Stock:</span>
                    <div className="text-lg font-semibold text-foreground">
                      {selectedItem.currentStock} {selectedItem.unit}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(selectedItem.status)} flex items-center gap-1 w-fit mt-1`}>
                        {getStatusIcon(selectedItem.status)}
                        <span className="capitalize">{selectedItem.status}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Min Stock:</span>
                    <div className="text-muted-foreground">{selectedItem.minStock} {selectedItem.unit}</div>
                  </div>
                  <div>
                    <span className="font-medium">Max Stock:</span>
                    <div className="text-muted-foreground">{selectedItem.maxStock} {selectedItem.unit}</div>
                  </div>
                </div>
              </div>

              {/* Preview After Adding */}
              {quantity && parseInt(quantity) > 0 && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">After Adding Stock</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">New Stock:</span>
                      <div className="text-lg font-semibold text-primary/80">
                        {selectedItem.currentStock + parseInt(quantity)} {selectedItem.unit}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">New Status:</span>
                      <div>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(getStockStatus(selectedItem.currentStock + parseInt(quantity), selectedItem.minStock))} flex items-center gap-1 w-fit mt-1`}>
                          {getStatusIcon(getStockStatus(selectedItem.currentStock + parseInt(quantity), selectedItem.minStock))}
                          <span className="capitalize">
                            {getStockStatus(selectedItem.currentStock + parseInt(quantity), selectedItem.minStock)}
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Added Quantity:</span>
                      <div className="text-primary/90 font-semibold">+{quantity} {selectedItem.unit}</div>
                    </div>
                    <div>
                      <span className="font-medium">New Total Value:</span>
                      <div className="text-primary/90 font-semibold">
                        ₹{((selectedItem.currentStock + parseInt(quantity)) * selectedItem.unitPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Level Warnings */}
              {quantity && parseInt(quantity) > 0 && (
                <div className="space-y-2">
                  {(selectedItem.currentStock + parseInt(quantity)) > selectedItem.maxStock && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium text-sm">Warning: Stock will exceed maximum level</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.status === 'critical' && (
                    <div className="bg-secondary/10 border border-secondary p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-foreground">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">Great! This will improve the stock status</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddStock; 