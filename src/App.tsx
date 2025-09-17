import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider, useRole } from "./contexts/RoleContext";
import { StockProvider } from "./contexts/StockContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MaterialsInventory from "./pages/MaterialsInventory";
import MaterialRequest from "./pages/MaterialRequest";
import RequestsList from "./pages/RequestsList";
import ApprovalCenter from "./pages/ApprovalCenter";
import StockManagement from "./pages/StockManagement";
import SupervisorRequests from "./pages/SupervisorRequests";
import GenerateReport from "./pages/GenerateReport";
import AddStock from "./pages/AddStock";
import Analytics from "./pages/Analytics";
import StrategicAnalytics from "./pages/StrategicAnalytics";
import FinancialDashboard from "./pages/FinancialDashboard";
import OrganizationalManagement from "./pages/OrganizationalManagement";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";


import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useRole();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Role-based Home Redirect Component
const RoleBasedHome = () => {
  const { currentUser } = useRole();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect supervisors to stock register
  if (currentUser.role === 'site_supervisor') {
    return <Navigate to="/materials-inventory" replace />;
  }

  // Other roles go to dashboard
  return <Dashboard />;
};

const AppRoutes = () => {
  const { isAuthenticated, currentUser } = useRole();

  // Handle login redirect based on role
  const getLoginRedirect = () => {
    if (!currentUser) return "/";
    
    if (currentUser.role === 'site_supervisor') {
      return "/materials-inventory";
    }
    
    return "/";
  };

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getLoginRedirect()} replace />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<RoleBasedHome />} />
        <Route path="materials-inventory" element={<MaterialsInventory />} />
        <Route path="material-request" element={<MaterialRequest />} />
        <Route path="requests-list" element={<RequestsList />} />
        <Route path="approval-center" element={<ApprovalCenter />} />
        <Route path="stock-management" element={<StockManagement />} />
        <Route path="supervisor-requests" element={<SupervisorRequests />} />
        <Route path="add-stock" element={<AddStock />} />
        <Route path="generate-report" element={<GenerateReport />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="strategic-analytics" element={<StrategicAnalytics />} />
        <Route path="financial-dashboard" element={<FinancialDashboard />} />
        <Route path="organizational-management" element={<OrganizationalManagement />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
       
        
        {/* Legacy routes for backwards compatibility */}
        <Route path="materials" element={<MaterialsInventory />} />
        <Route path="requests" element={<RequestsList />} />
        <Route path="approvals" element={<ApprovalCenter />} />
        <Route path="stock" element={<StockManagement />} />
        <Route path="inventory" element={<MaterialsInventory />} />
        <Route path="my-requests" element={<SupervisorRequests />} />
              
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <StockProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </SidebarProvider>
      </StockProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
