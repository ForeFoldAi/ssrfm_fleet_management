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
  Settings,
  LogOut,
  Bell,
  Lock,
  HelpCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Compute display labels based on permissions (not roles)
const getDisplayConfig = (hasPermission: (p: string) => boolean) => {
  // Owner-like
  if (hasPermission('inventory:material-indents:approve')) {
    return {
      label: 'Company Owner',
      icon: User,
      color: 'bg-purple-500',
      description: 'Full Business Control',
    } as const;
  }

  // Inventory manager-like
  if (
    hasPermission('inventory:materials:read') &&
    (hasPermission('inventory:materials:create') ||
      hasPermission('inventory:materials:update') ||
      hasPermission('inventory:materials:delete'))
  ) {
    return {
      label: 'Inventory Manager',
      icon: Settings,
      color: 'bg-accent',
      description: 'Inventory & Approvals',
    } as const;
  }

  // Default
  return {
    label: 'Site Supervisor',
    icon: User,
    color: 'bg-secondary/100',
    description: 'Operations & Requests',
  } as const;
};

export const RoleSwitcher = () => {
  const { currentUser, hasPermission, logout } = useRole();

  if (!currentUser) return null;

  const currentConfig = getDisplayConfig(hasPermission);
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
          <ChevronDown className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64 rounded-[10px]'>
        <DropdownMenuLabel>Account Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to='/profile'
            className='flex items-center gap-3 p-3 cursor-pointer rounded-[20px]'
          >
            <div className='w-8 h-8 bg-secondary/100 rounded-[20px] flex items-center justify-center'>
              <User className='w-5 h-5 text-black' />
            </div>
            <div className='flex-1'>
              <div className='font-medium'>My Profile</div>
              <div className='text-xs text-muted-foreground'>
                View and edit profile
              </div>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to='/settings'
            className='flex items-center gap-3 p-3 cursor-pointer rounded-[20px]'
          >
            <div className='w-8 h-8 bg-gray-500 rounded-[20px] flex items-center justify-center'>
              <Settings className='w-5 h-5 text-white' />
            </div>
            <div className='flex-1'>
              <div className='font-medium'>Settings</div>
              <div className='text-xs text-muted-foreground'>
                App preferences
              </div>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to='/security'
            className='flex items-center gap-3 p-3 cursor-pointer rounded-[20px]'
          >
            <div className='w-8 h-8 bg-red-500 rounded-[20px] flex items-center justify-center'>
              <Lock className='w-5 h-5 text-white' />
            </div>
            <div className='flex-1'>
              <div className='font-medium'>Security</div>
              <div className='text-xs text-muted-foreground'>
                Password & security
              </div>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to='/help'
            className='flex items-center gap-3 p-3 cursor-pointer rounded-[20px]'
          >
            <div className='w-8 h-8 bg-indigo-500 rounded-[20px] flex items-center justify-center'>
              <HelpCircle className='w-5 h-5 text-white' />
            </div>
            <div className='flex-1'>
              <div className='font-medium'>Help & Support</div>
              <div className='text-xs text-muted-foreground'>Get help</div>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
