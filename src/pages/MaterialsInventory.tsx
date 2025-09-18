import { useState } from "react";
import { Plus, Search, List, Table, Package, Settings, FileText, ClipboardList, Factory, Hourglass, ArrowUpRight, ShoppingBasket } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MaterialsTab } from "../components/MaterialsTab";
import { MachinesTab } from "../components/MachinesTab";
import { MaterialIssuesTab } from "../components/MaterialIssuesTab";
import { MaterialOrderBookTab } from "@/components/MaterialOrderBookTab";

const MaterialsInventory = () => {
  const [activeTab, setActiveTab] = useState("materials");
  
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      {/*
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
          Stock Register
        </h1>
      </div>
      */}
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-4/5 grid-cols-4 h-auto p-1 bg-secondary/10 rounded-lg shadow-sm">
           <TabsTrigger 
            value="materials" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <Hourglass className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Outstanding Materials</span>
            <span className="xs:hidden sm:hidden">Outstanding</span>
        </TabsTrigger>
          
          
          
          <TabsTrigger 
            value="material-issues" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <span className="relative w-4 h-4">
              <Package className="w-4 h-4" />
              <ArrowUpRight className="w-2 h-2 absolute -top-1 -right-1" />
            </span>
            <span className="hidden xs:inline sm:inline">Issued Materials</span>
            <span className="xs:hidden sm:hidden">Issue</span>
          </TabsTrigger>
          
<TabsTrigger 
            value="material-order-book" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <ShoppingBasket className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Purchased Materials</span>
            <span className="xs:hidden sm:hidden">Purchased</span>
          </TabsTrigger>

          
          <TabsTrigger 
            value="machines" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <Factory className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Machines</span>
            <span className="xs:hidden sm:hidden">Machines</span>
          </TabsTrigger>
        </TabsList>


        <TabsContent value="material-issues" className="mt-4">
          <MaterialIssuesTab />
        </TabsContent>

        <TabsContent value="materials" className="mt-4">
          <MaterialsTab />
        </TabsContent>

<TabsContent value="material-order-book" className="mt-4">
          <MaterialOrderBookTab />
        </TabsContent>


        <TabsContent value="machines" className="mt-4">
          <MachinesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaterialsInventory;