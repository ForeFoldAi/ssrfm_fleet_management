import { useState } from "react";
import { Plus, Search, List, Table, Package, Settings, FileText, ClipboardList } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MaterialsTab } from "../components/MaterialsTab";
import { MachinesTab } from "../components/MachinesTab";
import { MaterialIssuesTab } from "../components/MaterialIssuesTab";

const MaterialsInventory = () => {
  const [activeTab, setActiveTab] = useState("material-issues");
  
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h6 className="text-sm sm:text-1xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">
          Materials & Equipment Inventory
        </h6>
       
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 sm:p-2 bg-secondary rounded-xl">
          <TabsTrigger 
            value="material-issues" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
              <span>Issues Material</span>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="materials" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
              <span>Outstanding Materials</span>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="machines" 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
              <span>Machines</span>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="material-issues">
          <MaterialIssuesTab />
        </TabsContent>

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