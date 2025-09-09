import { useRole } from "../contexts/RoleContext";

import InventoryManagerDashboard from "./dashboards/InventoryManagerDashboard";
import CompanyOwnerDashboard from "./dashboards/CompanyOwnerDashboard";

const Dashboard = () => {
  const { currentUser } = useRole();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Render role-specific dashboard
  switch (currentUser.role) {
    
    case 'inventory_manager':
      return <InventoryManagerDashboard />;
    case 'company_owner':
      return <CompanyOwnerDashboard />;
    // Default fallback
  }
};

export default Dashboard;