import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider, useRole } from "./contexts/RoleContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MaterialsInventory from "./pages/MaterialsInventory";
import MaterialRequest from "./pages/MaterialRequest";
import RequestsList from "./pages/RequestsList";
import ApprovalCenter from "./pages/ApprovalCenter";
import StockManagement from "./pages/StockManagement";
import SupervisorRequests from "./pages/SupervisorRequests";
import GenerateReport from "./pages/GenerateReport";
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

const AppRoutes = () => {
  const { isAuthenticated } = useRole();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
                      <Route index element={<Dashboard />} />
              <Route path="materials" element={<MaterialsInventory />} />
              <Route path="material-request" element={<MaterialRequest />} />
              <Route path="requests" element={<RequestsList />} />
              <Route path="approvals" element={<ApprovalCenter />} />
              <Route path="stock" element={<StockManagement />} />
              <Route path="inventory" element={<MaterialsInventory />} />
              <Route path="my-requests" element={<SupervisorRequests />} />
              <Route path="generate-report" element={<GenerateReport />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="strategic-analytics" element={<StrategicAnalytics />} />
              <Route path="financial-dashboard" element={<FinancialDashboard />} />
              <Route path="organizational-management" element={<OrganizationalManagement />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
