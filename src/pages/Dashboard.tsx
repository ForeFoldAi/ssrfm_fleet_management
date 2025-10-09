import { useRole } from "../contexts/RoleContext";

import CompanyOwnerDashboard from "./dashboards/CompanyOwnerDashboard";

const Dashboard = () => {
  const { currentUser, isCompanyLevel } = useRole();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // FIXED: Only show CompanyOwnerDashboard for users with isCompanyLevel = true
  // This prevents Supervisors (isBranchLevel = true) from accessing company-wide dashboards
  if (isCompanyLevel()) {
    return <CompanyOwnerDashboard />;
  }

  // Fallback for other users - show a basic dashboard or redirect
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard!</p>
      </div>
    </div>
  );
};

export default Dashboard;
