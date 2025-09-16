import { useState } from "react";
import { Plus, Search, List, Table, Package, Settings, FileText, ClipboardList, Factory, Hourglass, ArrowUpRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MaterialsTab } from "../components/MaterialsTab";
import { MachinesTab } from "../components/MachinesTab";
import { MaterialIssuesTab } from "../components/MaterialIssuesTab";

const MaterialsInventory = () => {
  const [activeTab, setActiveTab] = useState("materials");
  
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
          Stock Register
        </h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-secondary/10 rounded-lg shadow-sm">
        <TabsTrigger 
  value="material-issues" 
  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
>
  <span className="relative w-4 h-4">
    <Package className="w-4 h-4" />
    <ArrowUpRight className="w-2 h-2 absolute -top-1 -right-1" />
  </span>
  <span>Issue Material</span>
</TabsTrigger>
          <TabsTrigger 
            value="materials" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <Hourglass className="w-4 h-4" />
            <span>Outstanding Materials</span>
          </TabsTrigger>
          <TabsTrigger 
            value="machines" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <Factory className="w-4 h-4" />
            <span>Machines</span>
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