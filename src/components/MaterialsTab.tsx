import { useState, useEffect } from "react";
import { Plus, Search, List, Table, Edit, Eye, Package, FileText, Building2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AddMaterialForm } from "./AddMaterialForm";
import { useRole } from "../contexts/RoleContext";
import { materialsApi, Material } from "../lib/api/materials";
import { Unit } from "../lib/api/types";

export const MaterialsTab = () => {
  const { currentUser, hasPermission } = useRole();
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnit, setFilterUnit] = useState("all");
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  
  // API state management
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch materials from API
  const fetchMaterials = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        sortBy: 'id',
        sortOrder: 'ASC' as const,
        ...(searchQuery && { search: searchQuery }),
        ...(filterUnit !== 'all' && hasPermission('inventory:material-indents:read:all') && { unitId: filterUnit })
      };

      const response = await materialsApi.getMaterials(params);
      
      setMaterials(response.data);
      setPagination({
        page: response.meta.page,
        limit: response.meta.limit,
        total: response.meta.itemCount,
        totalPages: response.meta.pageCount
      });
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch units for filtering (only for users with global permissions)
  const fetchUnits = async () => {
    if (!hasPermission('inventory:material-indents:read:all')) return;
    
    try {
      const response = await materialsApi.getUnits({ limit: 100 });
      setUnits(response.data);
    } catch (err) {
      console.error('Error fetching units:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchMaterials();
    fetchUnits();
  }, []);

  // Refetch when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMaterials(1, pagination.limit);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterUnit]);

  const handleAddMaterial = (materialData: any) => {
    // Refresh the materials list after adding
    fetchMaterials(pagination.page, pagination.limit);
  };

  const getStockStatus = (currentStock: number, minStockLevel: number) => {
    if (currentStock === 0) return "Out of Stock";
    if (currentStock <= minStockLevel) return "Low Stock";
    return "In Stock";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      "In Stock": "bg-green-500 text-white border-green-600 hover:bg-green-500 hover:text-white",
      "Low Stock": "bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-500 hover:text-white",
      "Out of Stock": "bg-red-500 text-white border-red-600 hover:bg-red-500 hover:text-white"
    };
    return badges[status as keyof typeof badges] || "bg-gray-500 text-white border-gray-600 hover:bg-gray-500 hover:text-white";
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchMaterials(newPage, pagination.limit);
  };

  if (loading && materials.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading materials...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="rounded-lg shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Materials</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => fetchMaterials()} className="btn-primary">
          Try Again
        </Button>
      </Card>
    );
  }

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
          {hasPermission('inventory:material-indents:read:all') && units.length > 0 && (
            <Select value={filterUnit} onValueChange={setFilterUnit}>
              <SelectTrigger className="w-full sm:w-48 rounded-lg border-secondary focus:border-secondary focus:ring-0 h-10">
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{unit.name}</div>
                        {unit.description && (
                          <div className="text-xs text-muted-foreground">{unit.description}</div>
                        )}
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

      {/* Loading indicator for subsequent loads */}
      {loading && materials.length > 0 && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {/* Content */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {materials.map((material) => {
            const stockStatus = getStockStatus(material.currentStock, material.minStockLevel);
            return (
              <div key={material.id} className="card-friendly p-3 sm:p-4 hover:bg-secondary/30 transition-colors duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">{material.name}</h3>
                        <Badge className={getStatusBadge(stockStatus)}>
                          {stockStatus}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                        {material.specifications}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-6 text-xs sm:text-sm">
                        <span className="text-muted-foreground">
                          Stock: <span className="font-medium text-foreground">{material.currentStock} {material.unit}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Make/Brand: <span className="font-medium text-foreground">{material.make}</span>
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
            );
          })}
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
                    <TableHead className="min-w-[100px] text-foreground font-semibold">Stock Status</TableHead>
                    <TableHead className="min-w-[120px] text-foreground font-semibold">Make/Brand</TableHead>
                    <TableHead className="min-w-[100px] text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => {
                    const stockStatus = getStockStatus(material.currentStock, material.minStockLevel);
                    return (
                      <TableRow key={material.id} className="hover:bg-muted/30 border-b border-secondary/20">
                        <TableCell className="font-semibold text-foreground">
                          <span className="font-semibold text-foreground">{material.name}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {material.specifications}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {material.currentStock} {material.unit}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(stockStatus)}>
                            {stockStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-32">
                          {material.make}
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
                    );
                  })}
                </TableBody>
              </TableComponent>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} materials
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {materials.length === 0 && !loading && (
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