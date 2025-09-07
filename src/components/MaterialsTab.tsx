import { useState } from "react";
import { Plus, Search, List, Table, Edit, Eye, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const MaterialsTab = () => {
  const [viewMode, setViewMode] = useState<"table" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const materials = [
    {
      id: 1,
      name: "Steel Rods (20mm)",
      specifications: "High-grade steel, 20mm diameter, 6m length",
      unit: "kg",
      maker: "SteelCorp Industries",
      currentStock: 2500,
      minStock: 500,
      status: "In Stock"
    },
    {
      id: 2,
      name: "Hydraulic Oil",
      specifications: "SAE 10W-30, Industrial grade",
      unit: "liters",
      maker: "FluidTech Solutions",
      currentStock: 45,
      minStock: 50,
      status: "Low Stock"
    },
    {
      id: 3,
      name: "Concrete Mix",
      specifications: "Portland cement blend, M25 grade",
      unit: "tons",
      maker: "BuildRight Materials",
      currentStock: 0,
      minStock: 2,
      status: "Out of Stock"
    },
    {
      id: 4,
      name: "Industrial Bolts",
      specifications: "M12x50mm, Grade 8.8, Zinc plated",
      unit: "pieces",
      maker: "FastenTech Corp",
      currentStock: 1200,
      minStock: 200,
      status: "In Stock"
    },
    {
      id: 5,
      name: "Welding Electrodes",
      specifications: "E7018, 3.2mm diameter",
      unit: "boxes",
      maker: "WeldPro Industries",
      currentStock: 25,
      minStock: 30,
      status: "Low Stock"
    }
  ];

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.specifications.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.maker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      "In Stock": "badge-in-stock",
      "Low Stock": "badge-low-stock",
      "Out of Stock": "badge-out-stock"
    };
    return badges[status as keyof typeof badges] || "badge-status bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Materials Inventory</h2>
            <p className="text-muted-foreground">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                {filteredMaterials.length} of {materials.length} items
              </span>
            </p>
          </div>
        </div>
        
        <Button className="btn-primary w-full sm:w-auto text-sm sm:text-base">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Add New Material
        </Button>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-friendly h-10 sm:h-auto"
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
                      <span className={`${getStatusBadge(material.status)} text-xs`}>
                        {material.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                      {material.specifications}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6 text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        Stock: <span className="font-medium text-foreground">{material.currentStock} {material.unit}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Min: <span className="font-medium text-foreground">{material.minStock} {material.unit}</span>
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
        <div className="card-friendly overflow-x-auto">
          <div className="p-3 sm:p-6 min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Material</th>
                  <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Specifications</th>
                  <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Current Stock</th>
                  <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Min Stock</th>
                  <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Status</th>
                  <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Supplier</th>
                  <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="border-b border-border hover:bg-secondary/30 transition-colors duration-200">
                    <td className="py-2 sm:py-3 px-1 sm:px-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground text-xs sm:text-sm">{material.name}</span>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-muted-foreground max-w-xs truncate text-xs sm:text-sm">
                      {material.specifications}
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 font-semibold text-foreground text-xs sm:text-sm">
                      {material.currentStock} {material.unit}
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-muted-foreground text-xs sm:text-sm">
                      {material.minStock} {material.unit}
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2">
                      <span className={`${getStatusBadge(material.status)} text-xs`}>
                        {material.status}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-muted-foreground text-xs sm:text-sm truncate max-w-32">{material.maker}</td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMaterials.length === 0 && (
        <div className="card-friendly p-8 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No materials found</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search terms" : "Start by adding your first material"}
          </p>
          <Button className="btn-primary text-sm sm:text-base">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add First Material
          </Button>
        </div>
      )}
    </div>
  );
};