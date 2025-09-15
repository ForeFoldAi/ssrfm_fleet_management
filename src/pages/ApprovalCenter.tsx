import { useState } from "react";
import { Shield, CheckCircle, XCircle, Clock, FileText, AlertTriangle, User, Calendar, IndianRupee, Eye, List, Table as TableIcon, RotateCcw, History } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";

const ApprovalCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [ownerViewMode, setOwnerViewMode] = useState<"list" | "table">("table");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentMaterialHistory, setCurrentMaterialHistory] = useState<any[]>([]);
  const [currentMaterialName, setCurrentMaterialName] = useState("");

  // Mock purchase history data
  const purchaseHistory = {
    "CNC Machine Upgrade Kit": [
      {
        id: "PUR-2023-001",
        date: "2023-08-15",
        vendor: "Tech Solutions Ltd",
        vendorContact: "Raj Kumar - 9876543210",
        price: "₹28,500",
        quantity: "1 unit",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2022-045",
        date: "2022-11-20",
        vendor: "Industrial Equipment Co",
        vendorContact: "Priya Sharma - 9876543211",
        price: "₹26,800",
        quantity: "1 unit",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2021-089",
        date: "2021-05-10",
        vendor: "Machine Works Pvt Ltd",
        vendorContact: "Amit Patel - 9876543212",
        price: "₹25,200",
        quantity: "1 unit",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2020-156",
        date: "2020-09-25",
        vendor: "Tech Solutions Ltd",
        vendorContact: "Raj Kumar - 9876543210",
        price: "₹24,500",
        quantity: "1 unit",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2019-203",
        date: "2019-12-08",
        vendor: "Precision Tools Ltd",
        vendorContact: "Meera Singh - 9876543214",
        price: "₹23,800",
        quantity: "1 unit",
        orderStatus: "Delivered"
      }
    ],
    "Advanced Testing Equipment": [
      {
        id: "PUR-2023-078",
        date: "2023-06-12",
        vendor: "Quality Systems Inc",
        vendorContact: "Suresh Reddy - 9876543213",
        price: "₹35,200",
        quantity: "1 set",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2022-134",
        date: "2022-03-18",
        vendor: "Precision Tools Ltd",
        vendorContact: "Meera Singh - 9876543214",
        price: "₹33,500",
        quantity: "1 set",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2021-067",
        date: "2021-08-30",
        vendor: "Quality Systems Inc",
        vendorContact: "Suresh Reddy - 9876543213",
        price: "₹32,800",
        quantity: "1 set",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2020-189",
        date: "2020-11-15",
        vendor: "Testing Solutions Co",
        vendorContact: "Vikram Joshi - 9876543215",
        price: "₹31,200",
        quantity: "1 set",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2019-245",
        date: "2019-07-22",
        vendor: "Precision Tools Ltd",
        vendorContact: "Meera Singh - 9876543214",
        price: "₹30,500",
        quantity: "1 set",
        orderStatus: "Delivered"
      }
    ],
    "Automated Material Handler": [
      {
        id: "PUR-2023-156",
        date: "2023-04-08",
        vendor: "Automation Solutions",
        vendorContact: "Vikram Joshi - 9876543215",
        price: "₹42,800",
        quantity: "2 units",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2022-089",
        date: "2022-09-14",
        vendor: "Industrial Automation Co",
        vendorContact: "Deepa Nair - 9876543216",
        price: "₹40,500",
        quantity: "2 units",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2021-123",
        date: "2021-12-03",
        vendor: "Smart Systems Ltd",
        vendorContact: "Ravi Kumar - 9876543217",
        price: "₹39,200",
        quantity: "2 units",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2020-167",
        date: "2020-06-18",
        vendor: "Automation Solutions",
        vendorContact: "Vikram Joshi - 9876543215",
        price: "₹38,800",
        quantity: "2 units",
        orderStatus: "Delivered"
      },
      {
        id: "PUR-2019-201",
        date: "2019-10-25",
        vendor: "Industrial Automation Co",
        vendorContact: "Deepa Nair - 9876543216",
        price: "₹37,500",
        quantity: "2 units",
        orderStatus: "Delivered"
      }
    ]
  };

  // Updated data structure for new approval flow
  const pendingOwnerApproval = [
    {
      id: "REQ-2024-189",
      material: "CNC Machine Upgrade Kit",
      quantity: "1 unit",
      requestedBy: "John Martinez",
      department: "Production Floor A",
      value: "₹28,500",
      date: "2024-01-16",
      machine: "CNC Machine #01",
      status: "pending_approval",
      vendorQuotations: [
        { id: "V1", vendorName: "Tech Solutions Ltd", quotedPrice: "₹28,500", contactPerson: "Raj Kumar", phone: "9876543210" },
        { id: "V2", vendorName: "Industrial Equipment Co", quotedPrice: "₹29,200", contactPerson: "Priya Sharma", phone: "9876543211" },
        { id: "V3", vendorName: "Machine Works Pvt Ltd", quotedPrice: "₹27,800", contactPerson: "Amit Patel", phone: "9876543212" }
      ]
    },
    {
      id: "REQ-2024-190",
      material: "Advanced Testing Equipment",
      quantity: "1 set",
      requestedBy: "Carol Williams", 
      department: "Quality Control",
      value: "₹35,200",
      date: "2024-01-15",
      machine: "Testing Station #02",
      status: "pending_approval",
      vendorQuotations: [
        { id: "V4", vendorName: "Quality Systems Inc", quotedPrice: "₹35,200", contactPerson: "Suresh Reddy", phone: "9876543213" },
        { id: "V5", vendorName: "Precision Tools Ltd", quotedPrice: "₹36,500", contactPerson: "Meera Singh", phone: "9876543214" }
      ]
    },
    {
      id: "REQ-2024-191",
      material: "Automated Material Handler",
      quantity: "2 units",
      requestedBy: "Maria Santos",
      department: "Production Floor B",
      value: "₹42,800",
      date: "2024-01-14",
      machine: "Conveyor System #03",
      status: "pending_approval",
      vendorQuotations: [
        { id: "V6", vendorName: "Automation Solutions", quotedPrice: "₹42,800", contactPerson: "Vikram Joshi", phone: "9876543215" },
        { id: "V7", vendorName: "Industrial Automation Co", quotedPrice: "₹44,200", contactPerson: "Deepa Nair", phone: "9876543216" },
        { id: "V8", vendorName: "Smart Systems Ltd", quotedPrice: "₹41,500", contactPerson: "Ravi Kumar", phone: "9876543217" }
      ]
    }
  ];

  // Filter functions
  const filteredOwnerRequests = pendingOwnerApproval.filter(request => {
    const matchesSearch = request.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || request.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // History handler
  const handleViewHistory = (materialName: string) => {
    const history = purchaseHistory[materialName as keyof typeof purchaseHistory] || [];
    setCurrentMaterialHistory(history);
    setCurrentMaterialName(materialName);
    setIsHistoryOpen(true);
  };

  // Approval handlers
  const handleOwnerApprove = (requestId: string, selectedVendorId?: string) => {
    toast({
      title: "Request Approved",
      description: `Request ${requestId} has been approved and moved to Ordered status`,
    });
  };

  const handleOwnerReject = (requestId: string) => {
    toast({
      title: "Request Reverted",
      description: `Request ${requestId} has been reverted for changes`,
      variant: "destructive"
    });
  };

  // Owner Approval Table View Component (optimized for screen fit)
  const OwnerApprovalTableView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-purple-50">
                <TableHead className="font-semibold text-xs w-20">REQUEST ID</TableHead>
                <TableHead className="font-semibold text-xs w-32">MATERIAL</TableHead>
                <TableHead className="font-semibold text-xs w-24">REQUESTED BY</TableHead>
                <TableHead className="font-semibold text-xs w-20">QUANTITY</TableHead>
                <TableHead className="font-semibold text-xs w-20">VALUE</TableHead>
                <TableHead className="font-semibold text-xs w-20">DATE</TableHead>
                <TableHead className="font-semibold text-xs w-24">MACHINE</TableHead>
                <TableHead className="font-semibold text-xs w-40">VENDOR QUOTATIONS</TableHead>
                <TableHead className="font-semibold text-xs w-32">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOwnerRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="text-xs font-medium">{request.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium">{request.material}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHistory(request.material)}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        title="View Purchase History"
                      >
                        <History className="w-3 h-3 text-blue-600" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium">{request.requestedBy}</div>
                    <div className="text-xs text-muted-foreground">{request.department}</div>
                  </TableCell>
                  <TableCell className="text-xs">{request.quantity}</TableCell>
                  <TableCell className="text-xs font-medium text-green-600">{request.value}</TableCell>
                  <TableCell className="text-xs">{request.date}</TableCell>
                  <TableCell className="text-xs">{request.machine}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Select>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {request.vendorQuotations.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              <div className="text-xs">
                                <div className="font-medium">{vendor.vendorName}</div>
                                <div className="text-muted-foreground">{vendor.quotedPrice}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground">
                        {request.vendorQuotations.length} quotations available
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button 
                        size="sm"
                        onClick={() => handleOwnerApprove(request.id)}
                        className="h-7 text-xs px-2"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleOwnerReject(request.id)}
                        className="h-7 text-xs px-2 text-orange-600 border-orange-200 hover:border-orange-300"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Revert
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="w-3 h-3" />
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
  );

  // Owner Approval List View Component (simplified)
  const OwnerApprovalListView = () => (
    <div className="space-y-3">
      {filteredOwnerRequests.map((request) => (
        <Card key={request.id} className="card-friendly border-purple-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{request.material}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHistory(request.material)}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        title="View Purchase History"
                      >
                        <History className="w-3 h-3 text-blue-600" />
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {request.value}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                    <div><strong>ID:</strong> {request.id}</div>
                    <div><strong>Date:</strong> {request.date}</div>
                    <div><strong>By:</strong> {request.requestedBy}</div>
                    <div><strong>Machine:</strong> {request.machine}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <strong className="text-xs">Vendor Quotations:</strong>
                  <Select>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {request.vendorQuotations.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          <div className="text-xs">
                            <div className="font-medium">{vendor.vendorName}</div>
                            <div className="text-muted-foreground">{vendor.quotedPrice}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  onClick={() => handleOwnerApprove(request.id)}
                  className="gap-1 text-xs h-8"
                >
                  <CheckCircle className="w-3 h-3" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleOwnerReject(request.id)}
                  className="gap-1 text-xs h-8 text-orange-600 border-orange-200 hover:border-orange-300"
                >
                  <RotateCcw className="w-3 h-3" />
                  Revert
                </Button>
                <Button variant="outline" className="gap-1 text-xs h-8">
                  <Eye className="w-3 h-3" />
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Owner Approval Center
        </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Approve material requests and manage procurement workflow
        </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
            placeholder="Search by material, requester, or request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
              />
            </div>
              
            </div>

      <Tabs defaultValue="owner-approval" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="owner-approval" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Owner Approval ({filteredOwnerRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Approved</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ordered" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Ordered</span>
          </TabsTrigger>
        </TabsList>

        {/* Owner Approval Tab */}
        <TabsContent value="owner-approval" className="space-y-3 sm:space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                <h3 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Owner Approval</h3>
                <p className="text-xs sm:text-sm text-purple-800">Review and approve material requests with vendor quotations.</p>
                  </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-xl border border-purple-200 overflow-hidden bg-purple-50/50 w-fit shadow-sm">
                    <Button 
                  variant={ownerViewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setOwnerViewMode("list")}
                  className={`rounded-none px-3 sm:px-4 ${
                    ownerViewMode === "list" 
                      ? "bg-purple-600 text-white hover:bg-purple-700" 
                      : "text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm">List</span>
                    </Button>
                    <Button 
                  variant={ownerViewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setOwnerViewMode("table")}
                  className={`rounded-none px-3 sm:px-4 ${
                    ownerViewMode === "table" 
                      ? "bg-purple-600 text-white hover:bg-purple-700" 
                      : "text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                  }`}
                >
                  <TableIcon className="w-4 h-4" />
                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm">Table</span>
                    </Button>
                  </div>
                </div>
          </div>
          
          {/* Render based on view mode */}
          {ownerViewMode === "list" ? <OwnerApprovalListView /> : <OwnerApprovalTableView />}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-3 sm:space-y-4">
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Approved Requests</h3>
            <p className="text-muted-foreground">
              Requests that have been approved and are ready for ordering.
            </p>
          </div>
        </TabsContent>

        {/* Ordered Tab */}
        <TabsContent value="ordered" className="space-y-3 sm:space-y-4">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Ordered Items</h3>
            <p className="text-muted-foreground">
              Items that have been ordered and are in procurement process.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Purchase History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Purchase History - {currentMaterialName}
            </DialogTitle>
          </DialogHeader>
          
                <div className="space-y-4">
            {currentMaterialHistory.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Last 5 purchase records for this material:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {currentMaterialHistory.map((record, index) => (
                    <Card key={record.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium text-muted-foreground">Purchase ID:</span>
                              <div className="font-medium">{record.id}</div>
                        </div>
                            <div className="text-sm">
                              <span className="font-medium text-muted-foreground">Date:</span>
                              <div className="font-medium">{record.date}</div>
                      </div>
                            <div className="text-sm">
                              <span className="font-medium text-muted-foreground">Quantity:</span>
                              <div className="font-medium">{record.quantity}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium text-muted-foreground">Vendor:</span>
                              <div className="font-medium">{record.vendor}</div>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-muted-foreground">Contact:</span>
                              <div className="font-medium">{record.vendorContact}</div>
                    </div>
                            <div className="text-sm">
                              <span className="font-medium text-muted-foreground">Status:</span>
                              <Badge variant="outline" className="text-xs">
                                {record.orderStatus}
                              </Badge>
                    </div>
                  </div>

                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium text-muted-foreground">Price:</span>
                              <div className="font-medium text-green-600 text-lg">{record.price}</div>
                            </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Purchase History</h3>
                <p className="text-muted-foreground">
                  No previous purchase records found for this material.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalCenter; 