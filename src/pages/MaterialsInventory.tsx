import { useState } from "react";
import { Plus, Search, List, Table, Package, Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MaterialsTab } from "../components/MaterialsTab";
import { MachinesTab } from "../components/MachinesTab";

const MaterialsInventory = () => {
  const [activeTab, setActiveTab] = useState("materials");
  
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Materials & Equipment Inventory
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Manage your materials stock and track equipment status
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1 sm:p-2 bg-secondary rounded-xl">
          <TabsTrigger 
            value="materials" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-6 py-2 sm:py-2 md:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
              <span>Materials</span>
              <span className="text-xs sm:text-sm">(1,247)</span>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="machines" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-6 py-2 sm:py-2 md:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
              <span>Machines</span>
              <span className="text-xs sm:text-sm">(89)</span>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <MaterialsTab />
        </TabsContent>

        <TabsContent value="machines">
          <MachinesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaterialsInventory;