import { useState } from "react";
import { Plus, Search, List, Table, Edit, Eye, Package, FileText, Building2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AddMaterialForm } from "./AddMaterialForm";
import { useRole } from "../contexts/RoleContext";

export const MaterialsTab = () => {
  const { currentUser } = useRole();
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnit, setFilterUnit] = useState("all");
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);

  // Available units for company owner
  const availableUnits = [
    { id: "unit-1", name: "SSRFM Unit 1", location: "Mumbai" },
    { id: "unit-2", name: "SSRFM Unit 2", location: "Delhi" },
    { id: "unit-3", name: "SSRFM Unit 3", location: "Bangalore" },
    { id: "unit-4", name: "SSRFM Unit 4", location: "Chennai" }
  ];

  const [materials, setMaterials] = useState([
    {
      id: 1,
      name: "Steel Rods (20mm)",
      specifications: "High-grade steel, 20mm diameter, 6m length",
      MeasureUnit: "kg",
      maker: "SteelCorp Industries",
      currentStock: 2500,
      unitId: "unit-1",
      unitName: "SSRFM Unit 1"
    },
    {
      id: 2,
      name: "Hydraulic Oil",
      specifications: "SAE 10W-30, Industrial grade",
      MeasureUnit: "liters",
      maker: "FluidTech Solutions",
      currentStock: 45,
      unitId: "unit-2",
      unitName: "SSRFM Unit 2"
    },
    {
      id: 3,
      name: "Concrete Mix",
      specifications: "Portland cement blend, M25 grade",
      MeasureUnit: "tons",
      maker: "BuildRight Materials",
      currentStock: 0,
      unitId: "unit-3",
      unitName: "SSRFM Unit 3"
    },
    {
      id: 4,
      name: "Industrial Bolts",
      specifications: "M12x50mm, Grade 8.8, Zinc plated",
      MeasureUnit: "pieces",
      maker: "FastenTech Corp",
      currentStock: 1200,
      unitId: "unit-1",
      unitName: "SSRFM Unit 1"
    },
    {
      id: 5,
      name: "Welding Electrodes",
      specifications: "E7018, 3.2mm diameter",
      MeasureUnit: "boxes",
      maker: "WeldPro Industries",
      currentStock: 25,
      unitId: "unit-4",
      unitName: "SSRFM Unit 4"
    }
  ]);

  const handleAddMaterial = (materialData: any) => {
    setMaterials(prev => [...prev, materialData]);
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.specifications.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.maker.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Unit filtering logic
    let matchesUnit = true;
    if (currentUser?.role === 'company_owner') {
      matchesUnit = filterUnit === "all" || material.unitId === filterUnit;
    } else {
      // For supervisors, only show their unit's data
      matchesUnit = material.unitId === "unit-1"; // Assuming supervisor is from unit-1
    }
    
    return matchesSearch && matchesUnit;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      "In Stock": "bg-green-500 text-white border-green-600 hover:bg-green-500 hover:text-white",
      "Low Stock": "bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-500 hover:text-white",
      "Out of Stock": "bg-red-500 text-white border-red-600 hover:bg-red-500 hover:text-white"
    };
    return badges[status as keyof typeof badges] || "bg-gray-500 text-white border-gray-600 hover:bg-gray-500 hover:text-white";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
        {/* Left side: Title and View Toggle Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          
          
          {/* View Toggle Buttons - Moved to left side */}
          <div className="flex rounded-lg border border-secondary overflow-hidden bg-secondary/10 w-fit shadow-sm">
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

        {/* Right side: Search, Unit Filter and Add Material Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-lg border-secondary focus:border-secondary focus:ring-0 outline-none h-10 w-64"
            />
          </div>
          
          {/* Unit Filter - Only for Company Owner */}
          {currentUser?.role === 'company_owner' && (
            <Select value={filterUnit} onValueChange={setFilterUnit}>
              <SelectTrigger className="w-full sm:w-48 rounded-lg border-secondary focus:border-secondary focus:ring-0 h-10">
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {availableUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{unit.name}</div>
                        <div className="text-xs text-muted-foreground">{unit.location}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button 
            className="btn-primary w-full sm:w-auto text-sm sm:text-base"
            onClick={() => setIsAddMaterialOpen(true)}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add New Material
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="card-friendly p-3 sm:p-4 hover:bg-secondary/30 transition-colors duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{material.name}</h3>
                      
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                      {material.specifications}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6 text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        Stock: <span className="font-medium text-foreground">{material.currentStock} {material.MeasureUnit}</span>
                      </span>
                      
                      <span className="text-muted-foreground truncate">
                        Supplier: <span className="font-medium text-foreground">{material.maker}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 sm:ml-4 justify-end sm:justify-start">
                  <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="ml-1 sm:hidden text-xs">Edit</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="ml-1 sm:hidden text-xs">View</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="rounded-lg shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <TableComponent>
                <TableHeader>
                  <TableRow className="bg-secondary/20 border-b-2 border-secondary/30">
                    <TableHead className="min-w-[150px] text-foreground font-semibold">Material</TableHead>
                    <TableHead className="min-w-[200px] text-foreground font-semibold">Specifications</TableHead>
                    <TableHead className="min-w-[100px] text-foreground font-semibold">Current Stock</TableHead>
                    <TableHead className="min-w-[100px] text-foreground font-semibold">Stock Indicator</TableHead>
                    <TableHead className="min-w-[120px] text-foreground font-semibold">Make/Brand</TableHead>
                    <TableHead className="min-w-[100px] text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow key={material.id} className="hover:bg-muted/30 border-b border-secondary/20">
                      <TableCell className="font-semibold text-foreground">
                          <span className="font-semibold text-foreground">{material.name}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {material.specifications}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {material.currentStock} {material.MeasureUnit}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {/* status badge empty */}
                      </TableCell>
                      
                      <TableCell className="text-muted-foreground truncate max-w-32">
                        {material.maker}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableComponent>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredMaterials.length === 0 && (
        <Card className="rounded-lg shadow-sm p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No materials found</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search terms" : "Start by adding your first material"}
          </p>
          <Button 
            className="btn-primary text-sm sm:text-base"
            onClick={() => setIsAddMaterialOpen(true)}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add First Material
          </Button>
        </Card>
      )}

      {/* Add Material Form */}
      <AddMaterialForm
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        onSubmit={handleAddMaterial}
      />
    </div>
  );
};