import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRole } from '@/contexts/RoleContext';
import {
  ChevronDown,
  User,
  
  LogOut,
  Bell,
  Lock,
  HelpCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Compute display labels based on userType flags and permissions
const getDisplayConfig = (
  hasPermission: (p: string) => boolean,
  isCompanyLevel: () => boolean
) => {
  // FIXED: Check isCompanyLevel flag for Company Owner
  if (isCompanyLevel()) {
    return {
      label: 'Management',
      icon: User,
      color: 'bg-purple-500',
      description: 'Full Business Control',
    } as const;
  }

  // Inventory manager-like (branch-level with specific permissions)
  if (
    hasPermission('inventory:materials:read') &&
    (hasPermission('inventory:materials:create') ||
      hasPermission('inventory:materials:update') ||
      hasPermission('inventory:materials:delete'))
  ) {
    return {
      label: 'Data Submitter',
      icon: User,
      color: 'bg-accent',
      description: 'Inventory & Approvals',
    } as const;
  }

  // Default (Branch-level supervisor)
  return {
    label: 'Site Supervisor',
    icon: User,
    color: 'bg-secondary/100',
    description: 'Operations & Requests',
  } as const;
};

export const RoleSwitcher = () => {
  const { currentUser, hasPermission, isCompanyLevel, logout } = useRole();

  if (!currentUser) return null;

  const currentConfig = getDisplayConfig(hasPermission, isCompanyLevel);
  const CurrentIcon = currentConfig.icon;

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className='hover:bg-none border-none outline-none'
      >
        <Button
          variant='outline'
          className='gap-2 rounded-[10px] bg-none border-none hover:bg-white outline-none focus:outline-none '
        >
          <div
            className={`w-6 h-6 ${currentConfig.color} rounded-[10px] flex items-center justify-center hover:bg-none`}
          >
            <CurrentIcon className='w-4 h-4 ' />
          </div>
          <div className='text-left'>
            <div className='text-sm font-medium'>{currentUser.name}</div>
            <div className='text-xs text-muted-foreground'>
              {currentConfig.label}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
    </DropdownMenu>
  );
};
