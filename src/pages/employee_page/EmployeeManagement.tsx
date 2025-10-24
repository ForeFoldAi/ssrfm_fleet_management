import { useState } from 'react';
import {
  Users,
  Calendar,
  FileText,
  Clock,
} from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { AttendenceTab } from '../../components/employee/AttendenceTab';
import { EmployeeViewTab } from '../../components/employee/EmployeeViewTab';
import { LeavesViewTab } from '../../components/employee/LeavesViewTab';
import { HolidaySetup } from '../../components/employee/HolidaySetup';

export const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [isHolidaySetupOpen, setIsHolidaySetupOpen] = useState(false);

  const handleHolidaySetupSubmit = (holidayData: any) => {
    console.log('Holiday setup submitted:', holidayData);
    setIsHolidaySetupOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0 pb-24 sm:pb-0">
      {/* Header */}
      {/*
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
          Employee Management
        </h1>
      </div>
      */}
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop Tabs - Top positioned with responsive sizing */}
        <TabsList className="hidden sm:grid w-full md:w-11/12 lg:w-5/6 xl:w-4/5 2xl:w-3/4 grid-cols-4 h-auto p-1.5 bg-secondary/10 rounded-lg shadow-sm gap-1">
          
          <TabsTrigger 
            value="attendance" 
            className="flex flex-row items-center justify-center gap-1.5 md:gap-2 px-2 md:px-3 lg:px-4 py-2 md:py-2.5 text-[11px] md:text-xs lg:text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" />
            <span className="whitespace-nowrap">Attendance</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="leaves" 
            className="flex flex-row items-center justify-center gap-1.5 md:gap-2 px-2 md:px-3 lg:px-4 py-2 md:py-2.5 text-[11px] md:text-xs lg:text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
          >
            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" />
            <span className="whitespace-nowrap">Leave Requests</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="employees" 
            className="flex flex-row items-center justify-center gap-1.5 md:gap-2 px-2 md:px-3 lg:px-4 py-2 md:py-2.5 text-[11px] md:text-xs lg:text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" />
            <span className="whitespace-nowrap">Employees</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="holidays" 
            className="flex flex-row items-center justify-center gap-1.5 md:gap-2 px-2 md:px-3 lg:px-4 py-2 md:py-2.5 text-[11px] md:text-xs lg:text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" />
            <span className="whitespace-nowrap">Holiday Setup</span>
          </TabsTrigger>
          
        </TabsList>

        {/* Mobile Tabs - Fixed at Bottom */}
        <TabsList className="sm:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 h-auto p-2 bg-gradient-to-r from-foreground to-foreground backdrop-blur-xl shadow-2xl border-t border-warning/20">
          
          <TabsTrigger 
            value="attendance" 
            className="flex flex-col items-center gap-1 px-1 py-2 text-xs font-semibold data-[state=active]:bg-warning data-[state=active]:text-foreground data-[state=active]:shadow-sm text-white/70 data-[state=inactive]:text-white/70"
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Attendance</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="leaves" 
            className="flex flex-col items-center gap-1 px-1 py-2 text-xs font-semibold data-[state=active]:bg-warning data-[state=active]:text-foreground data-[state=active]:shadow-sm text-white/70 data-[state=inactive]:text-white/70"
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Leave Requests</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="employees" 
            className="flex flex-col items-center gap-1 px-1 py-2 text-xs font-semibold data-[state=active]:bg-warning data-[state=active]:text-foreground data-[state=active]:shadow-sm text-white/70 data-[state=inactive]:text-white/70"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Employees</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="holidays" 
            className="flex flex-col items-center gap-1 px-1 py-2 text-xs font-semibold data-[state=active]:bg-warning data-[state=active]:text-foreground data-[state=active]:shadow-sm text-white/70 data-[state=inactive]:text-white/70"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Holiday Setup</span>
          </TabsTrigger>
          
        </TabsList>

        {/* Custom Tab Content - Keep all components mounted to prevent reloading */}
        <div className="mt-4">
          {/* Attendance Tab */}
          <div className={activeTab === "attendance" ? "block" : "hidden"}>
            <AttendenceTab />
          </div>

          {/* Leaves Tab */}
          <div className={activeTab === "leaves" ? "block" : "hidden"}>
            <LeavesViewTab />
          </div>

          {/* Employees Tab */}
          <div className={activeTab === "employees" ? "block" : "hidden"}>
            <EmployeeViewTab />
          </div>

          {/* Holidays Tab */}
          <div className={activeTab === "holidays" ? "block" : "hidden"}>
            <div className="space-y-6">
             
              
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Holiday Setup</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Setup Holidays" to configure company holidays for the year
                </p>
                <button
                  onClick={() => setIsHolidaySetupOpen(true)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Setup Holidays
                </button>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
      
      {/* Holiday Setup Dialog */}
      <HolidaySetup
        isOpen={isHolidaySetupOpen}
        onClose={() => setIsHolidaySetupOpen(false)}
        onSubmit={handleHolidaySetupSubmit}
      />
      
      {/* Fixed Footer - Hidden on mobile, shown on desktop */}
      <div className="hidden sm:block fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 py-2 z-10">
        <p className="text-center text-sm text-muted-foreground">
          Developed & Maintained by{' '}
          <a 
            href="https://forefoldai.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline transition-colors duration-200"
          >
            ForeFold AI
          </a>
        </p>
      </div>
    </div>
  );
};
