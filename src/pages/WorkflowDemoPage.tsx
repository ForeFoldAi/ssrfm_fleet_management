import { WorkflowDemo } from "../components/WorkflowDemo";
import { RoleSwitcher } from "../components/RoleSwitcher";

const WorkflowDemoPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Material Request Workflow Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates the complete workflow from request submission to material receipt
        </p>
      </div>
      
      {/* Role Switcher for Demo */}
      <div className="flex justify-center">
        <RoleSwitcher />
      </div>
      
      {/* Workflow Demo */}
      <WorkflowDemo />
    </div>
  );
};

export default WorkflowDemoPage;