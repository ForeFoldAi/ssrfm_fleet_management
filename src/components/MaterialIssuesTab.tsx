import { useState } from "react";
import { Plus, Search, List, Table, Edit, Eye, Package, CheckSquare, ChevronDown, ChevronRight, MoreVertical, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { MaterialIssueForm } from "./MaterialIssueForm";

export const MaterialIssuesTab = () => {
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);

  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const [issuedMaterials, setIssuedMaterials] = useState([
    {
      id: "MI-001",
      materialIssueFormSrNo: "MIF-2024-001",
      materialName: "Steel Rods (20mm)",
      specifications: "High-grade steel, 20mm diameter, 6m length",
      unit: "kg",
      existingStock: 2500,
      issuedQuantity: 150,
      stockAfterIssue: 2350,
      recipientName: "John Smith",
      recipientDesignation: "Site Engineer",
      recipientId: "EMP-001",
      issuingPersonName: "Sarah Johnson",
      issuingPersonDesignation: "Inventory Manager",
      department: "Construction",
      machineName: "Concrete Mixer #1",
      purpose: "Foundation reinforcement work",
      issuedDate: "2024-01-15",
      status: "Issued"
    },
    {
      id: "MI-002",
      materialIssueFormSrNo: "MIF-2024-002",
      materialName: "Hydraulic Oil",
      specifications: "SAE 10W-30, Industrial grade",
      unit: "liters",
      existingStock: 45,
      issuedQuantity: 20,
      stockAfterIssue: 25,
      recipientName: "Mike Wilson",
      recipientDesignation: "Machine Operator",
      recipientId: "EMP-002",
      issuingPersonName: "Sarah Johnson",
      issuingPersonDesignation: "Inventory Manager",
      department: "Production",
      machineName: "Hydraulic Press #2",
      purpose: "Routine maintenance",
      issuedDate: "2024-01-14",
      status: "Issued"
    },
    {
      id: "MI-003",
      materialIssueFormSrNo: "MIF-2024-003",
      materialName: "Industrial Bolts",
      specifications: "M12x50mm, Grade 8.8, Zinc plated",
      unit: "pieces",
      existingStock: 1200,
      issuedQuantity: 50,
      stockAfterIssue: 1150,
      recipientName: "David Brown",
      recipientDesignation: "Assembly Technician",
      recipientId: "EMP-003",
      issuingPersonName: "Sarah Johnson",
      issuingPersonDesignation: "Inventory Manager",
      department: "Assembly",
      machineName: "Assembly Station #3",
      purpose: "Equipment assembly",
      issuedDate: "2024-01-13",
      status: "Issued"
    }
  ]);

  const handleIssueMaterial = (issueData: any) => {
    // Convert the form data to match our display structure
    // Handle multiple items from the form
    const newIssues = issueData.issuedItems.map((item: any, index: number) => ({
      id: `MI-${String(issuedMaterials.length + index + 1).padStart(3, '0')}`,
      materialIssueFormSrNo: issueData.materialIssueFormSrNo || `MIF-2024-${String(issuedMaterials.length + index + 1).padStart(3, '0')}`,
      materialName: item.nameOfMaterial,
      specifications: item.specifications || "Standard specifications",
      unit: item.unit,
      existingStock: item.existingStock,
      issuedQuantity: parseInt(item.issuedQty),
      stockAfterIssue: item.stockAfterIssue,
      recipientName: issueData.receiverName,
      recipientDesignation: issueData.receiverDesignation,
      recipientId: issueData.receiverId || "EMP-XXX",
      issuingPersonName: issueData.issuingPersonName,
      issuingPersonDesignation: issueData.issuingPersonDesignation,
      department: issueData.department || "General",
      machineName: issueData.machineName || "N/A",
      purpose: issueData.purpose,
      issuedDate: issueData.date,
      status: "Issued"
    }));
    
    setIssuedMaterials(prev => [...newIssues, ...prev]);
  };

  const filteredIssues = issuedMaterials.filter(issue =>
    issue.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Material Issues</h2>
            <p className="text-muted-foreground">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                {filteredIssues.length} of {issuedMaterials.length} issues
              </span>
            </p>
          </div>
        </div>

        {/* Search and Controls - Now beside the header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-friendly h-10 w-64"
            />
          </div>
          
          <div className="flex rounded-xl border border-border overflow-hidden bg-secondary w-fit">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none px-3 sm:px-4"
            >
              <List className="w-4 h-4" />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm">List</span>
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-none px-3 sm:px-4"
            >
              <Table className="w-4 h-4" />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm">Table</span>
            </Button>
          </div>
        </div>
        
        <Button 
          className="btn-primary w-full sm:w-auto text-sm sm:text-base"
          onClick={() => setIsIssueFormOpen(true)}
        >
          <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Issue Material
        </Button>
      </div>

      {/* Content */}
      {filteredIssues.length > 0 ? (
        viewMode === "table" ? (
          // Table View for Material Issues
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Issue ID</TableHead>
                      <TableHead className="min-w-[150px]">Material</TableHead>
                      <TableHead className="min-w-[100px]">Stock Info</TableHead>
                      <TableHead className="min-w-[120px]">Recipient</TableHead>
                      <TableHead className="min-w-[120px]">Issuing Person</TableHead>
                     
                      <TableHead className="min-w-[100px]">Date</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{issue.id}</div>
                            <div className="text-xs text-muted-foreground">
                              Form: {issue.materialIssueFormSrNo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium capitalize">{issue.materialName}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-40">{issue.specifications}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="space-y-1">
                            <div className="text-xs">
                              <span className="text-muted-foreground">Existing:</span> {issue.existingStock} {issue.unit}
                            </div>
                            <div className="text-xs font-medium">
                              <span className="text-muted-foreground">Issued:</span> {issue.issuedQuantity} {issue.unit}
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground">After:</span> {issue.stockAfterIssue} {issue.unit}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{issue.recipientName}</div>
                            <div className="text-xs text-muted-foreground">{issue.recipientDesignation}</div>
                            <div className="text-xs text-muted-foreground">{issue.recipientId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{issue.issuingPersonName}</div>
                            <div className="text-xs text-muted-foreground">{issue.issuingPersonDesignation}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{issue.department}</TableCell>
                        <TableCell className="text-sm">{new Date(issue.issuedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            Issued
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableComponent>
              </div>
            </CardContent>
          </Card>
        ) : (
          // List View for Material Issues - Matching Order Request Status ListView style
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="min-w-[200px]">MATERIAL ISSUE</TableHead>
                      <TableHead className="min-w-[120px]">RECIPIENT</TableHead>
                      <TableHead className="min-w-[120px]">ISSUING PERSON</TableHead>
                      <TableHead className="min-w-[100px]">STATUS</TableHead>
                      <TableHead className="min-w-[140px]">ISSUED DATE</TableHead>
                      <TableHead className="min-w-[140px]">STOCK INFO</TableHead>
                      <TableHead className="min-w-[100px]">DEPARTMENT</TableHead>
                      <TableHead className="min-w-[100px]">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <>
                        <TableRow key={issue.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => toggleRowExpansion(issue.id)}
                            >
                              {expandedRows.has(issue.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold text-sm capitalize">{issue.materialName}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {issue.purpose}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {issue.machineName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{issue.recipientName}</div>
                            <div className="text-xs text-muted-foreground">{issue.recipientId}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{issue.issuingPersonName}</div>
                            <div className="text-xs text-muted-foreground">{issue.issuingPersonDesignation}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-primary/10 text-primary border-primary/20" variant="secondary">
                              <span className="flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                <span className="text-xs">Issued</span>
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(issue.issuedDate).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm px-2 py-1 rounded bg-secondary/20 text-foreground">
                              {issue.issuedQuantity} {issue.unit} issued
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {issue.department}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Detail Row */}
                        {expandedRows.has(issue.id) && (
                          <TableRow>
                            <TableCell colSpan={9} className="p-0">
                              <div className="bg-muted/30 p-6 border-t">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Left Column - Issue Details */}
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="font-semibold text-lg mb-3">Issue Details</h3>
                                      <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="font-medium text-muted-foreground">Issue ID:</span>
                                            <div className="font-medium">{issue.id}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">Form Number:</span>
                                            <div className="font-medium">{issue.materialIssueFormSrNo}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">Existing Stock:</span>
                                            <div className="font-medium">{issue.existingStock} {issue.unit}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">Stock After Issue:</span>
                                            <div className="font-medium">{issue.stockAfterIssue} {issue.unit}</div>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <span className="font-medium text-muted-foreground">Specifications:</span>
                                          <div className="text-sm mt-1 p-3 bg-background rounded border">
                                            {issue.specifications}
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <span className="font-medium text-muted-foreground">Purpose:</span>
                                          <div className="text-sm mt-1">{issue.purpose}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Right Column - Personnel & Status */}
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="font-semibold text-lg mb-3">Personnel & Status</h3>
                                      
                                      {/* Status Information */}
                                      <div className="space-y-3">
                                        <div className="p-3 bg-background rounded border">
                                          <div className="text-sm font-medium mb-2">Current Status</div>
                                          <div className="text-sm text-muted-foreground">Material successfully issued and delivered</div>
                                        </div>
                                        
                                        {/* Issuing Person Info */}
                                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                                          <div className="text-sm">
                                            <strong className="text-primary">Issued By:</strong> {issue.issuingPersonName}
                                          </div>
                                          <div className="text-xs text-primary/80 mt-1">{issue.issuingPersonDesignation}</div>
                                        </div>

                                        {/* Recipient Info */}
                                        <div className="bg-secondary/10 border border-secondary rounded-lg p-3">
                                          <div className="text-sm space-y-1">
                                            <div><strong className="text-foreground">Received By:</strong> {issue.recipientName}</div>
                                            <div><strong className="text-foreground">Designation:</strong> {issue.recipientDesignation}</div>
                                            <div><strong className="text-foreground">Employee ID:</strong> {issue.recipientId}</div>
                                          </div>
                                        </div>

                                        {/* Stock Information */}
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                          <div className="text-sm space-y-1">
                                            <div><strong className="text-accent-foreground">Quantity Issued:</strong> {issue.issuedQuantity} {issue.unit}</div>
                                            <div><strong className="text-accent-foreground">Department:</strong> {issue.department}</div>
                                            <div><strong className="text-accent-foreground">Machine:</strong> {issue.machineName}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t mt-6">
                                  <Button variant="outline" className="gap-2">
                                    <Eye className="w-4 h-4" />
                                    View Issue Form
                                  </Button>
                                  <Button variant="outline" className="gap-2">
                                    <FileText className="w-4 h-4" />
                                    Print Receipt
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </TableComponent>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="card-friendly p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Material Issues Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search terms" : "No materials have been issued yet."}
          </p>
        </Card>
      )}

      {/* Material Issue Form */}
      <MaterialIssueForm
        isOpen={isIssueFormOpen}
        onClose={() => setIsIssueFormOpen(false)}
        onSubmit={handleIssueMaterial}
      />
    </div>
  );
}; 