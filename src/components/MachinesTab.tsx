import { useState } from "react";
import { Plus, Search, List, Table, Edit, Eye, Settings, MapPin, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { AddMachineForm } from "./AddMachineForm";

export const MachinesTab = () => {
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);

  const [machines, setMachines] = useState([
    {
      id: 1,
      name: "Machine #45",
      type: "Steel Processing Unit",
      location: "Production Line A",
      status: "Active",
      createdDate: "2023-08-15",
      lastMaintenance: "2024-01-10",
      specifications: "Heavy-duty steel processing, 5-ton capacity"
    },
    {
      id: 2,
      name: "Machine #12",
      type: "Hydraulic Press",
      location: "Production Line B",
      status: "Maintenance",
      createdDate: "2023-05-20",
      lastMaintenance: "2024-01-14",
      specifications: "200-ton hydraulic press, precision forming"
    },
    {
      id: 3,
      name: "Machine #33",
      type: "Assembly Robot",
      location: "Assembly Line",
      status: "Active",
      createdDate: "2023-11-02",
      lastMaintenance: "2024-01-08",
      specifications: "6-axis robotic arm, precision assembly"
    },
    {
      id: 4,
      name: "Machine #78",
      type: "Concrete Mixer",
      location: "Construction Site",
      status: "Inactive",
      createdDate: "2023-03-10",
      lastMaintenance: "2023-12-20",
      specifications: "Industrial concrete mixer, 2m³ capacity"
    },
    {
      id: 5,
      name: "Machine #56",
      type: "Welding Station",
      location: "Fabrication Shop",
      status: "Active",
      createdDate: "2023-09-18",
      lastMaintenance: "2024-01-12",
      specifications: "Multi-process welding station, TIG/MIG capable"
    }
  ]);

  const handleAddMachine = (machineData: any) => {
    setMachines(prev => [...prev, machineData]);
  };

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      "Active": "badge-status bg-success/10 text-success ring-1 ring-success/20",
      "Maintenance": "badge-status bg-warning/10 text-warning ring-1 ring-warning/20",
      "Inactive": "badge-status bg-destructive/10 text-destructive ring-1 ring-destructive/20"
    };
    return badges[status as keyof typeof badges] || "badge-status bg-muted text-muted-foreground";
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

        {/* Right side: Search and Add Machine Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search machines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-lg border-secondary focus:border-secondary focus:ring-0 outline-none h-10 w-64"
            />
          </div>
          
          <Button 
            className="btn-primary w-full sm:w-auto text-sm sm:text-base"
            onClick={() => setIsAddMachineOpen(true)}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add New Machine
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {filteredMachines.map((machine) => (
            <div key={machine.id} className="card-friendly p-3 sm:p-4 hover:bg-secondary/30 transition-colors duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{machine.name}</h3>
                      <span className="text-primary font-semibold text-xs sm:text-sm">{machine.type}</span>
                      <span className={`${getStatusBadge(machine.status)} text-xs`}>
                        {machine.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{machine.location}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                      {machine.specifications}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-6 text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        Added: <span className="font-medium text-foreground">{machine.createdDate}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Last Service: <span className="font-medium text-foreground">{machine.lastMaintenance}</span>
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
                    <TableHead className="min-w-[150px] text-foreground font-semibold">Machine</TableHead>
                    <TableHead className="min-w-[150px] text-foreground font-semibold">Type</TableHead>
                    <TableHead className="min-w-[120px] text-foreground font-semibold">Location</TableHead>
                    <TableHead className="min-w-[100px] text-foreground font-semibold">Status</TableHead>
                    <TableHead className="min-w-[120px] text-foreground font-semibold">Last Service</TableHead>
                    <TableHead className="min-w-[100px] text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMachines.map((machine) => (
                    <TableRow key={machine.id} className="hover:bg-muted/30 border-b border-secondary/20">
                      <TableCell className="font-semibold text-foreground">
                          <span className="font-semibold text-foreground">{machine.name}</span>
                      </TableCell>
                      <TableCell className="text-primary font-semibold">
                        {machine.type}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-24 sm:max-w-none">{machine.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadge(machine.status)} text-xs`}>
                          {machine.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {machine.lastMaintenance}
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
      {filteredMachines.length === 0 && (
        <Card className="rounded-lg shadow-sm p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No machines found</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search terms" : "Start by adding your first machine"}
          </p>
          <Button 
            className="btn-primary text-sm sm:text-base"
            onClick={() => setIsAddMachineOpen(true)}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add First Machine
          </Button>
        </Card>
      )}

      {/* Add Machine Form */}
      <AddMachineForm
        isOpen={isAddMachineOpen}
        onClose={() => setIsAddMachineOpen(false)}
        onSubmit={handleAddMachine}
      />
    </div>
  );
};