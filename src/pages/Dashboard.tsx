import { useRole } from "../contexts/RoleContext";
import SiteSupervisorDashboard from "./dashboards/SiteSupervisorDashboard";
import InventoryManagerDashboard from "./dashboards/InventoryManagerDashboard";
import CompanyOwnerDashboard from "./dashboards/CompanyOwnerDashboard";

const Dashboard = () => {
  const { currentUser } = useRole();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Render role-specific dashboard
  switch (currentUser.role) {
    case 'site_supervisor':
      return <SiteSupervisorDashboard />;
    case 'inventory_manager':
      return <InventoryManagerDashboard />;
    case 'company_owner':
      return <CompanyOwnerDashboard />;
    default:
      return <SiteSupervisorDashboard />; // Default fallback
  }
};

export default Dashboard;