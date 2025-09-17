import logo from "/logo.png";
import { useRole } from "../contexts/RoleContext";
import { RoleSwitcher } from "./RoleSwitcher";

export const TopHeaderSimple = () => {
  const { currentUser } = useRole();

  if (!currentUser) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50  bg-gradient-to-r from-foreground to-foreground backdrop-blur-md   shadow-sm">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Company Logo & Name */}
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Minar Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-white">Sree Sai Roller Flour Mill Pvt ltd</h1>
              <p className="text-xs text-warning font-medium">Smart Supply & Resource Management</p>
            </div>
          </div>

          {/* Profile Section - Right Side */}
          <div className="flex items-center space-x-4">
            <RoleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};