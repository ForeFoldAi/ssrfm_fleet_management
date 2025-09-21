import { useRole } from "../contexts/RoleContext";

import InventoryManagerDashboard from "./dashboards/InventoryManagerDashboard";
import CompanyOwnerDashboard from "./dashboards/CompanyOwnerDashboard";

const Dashboard = () => {
  const { currentUser, hasPermission } = useRole();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Permission-based selection
  const isOwnerLike = hasPermission('inventory:material-indents:approve');

  if (isOwnerLike) {
    return <CompanyOwnerDashboard />;
  }

  if (hasPermission('inventory:materials:read')) {
    return <InventoryManagerDashboard />;
  }

  return <div>Loading...</div>;
};

export default Dashboard;
