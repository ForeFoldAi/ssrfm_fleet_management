import logo from '/logo.png';
import { NavLink } from 'react-router-dom';
import {
  Package,
  FileText,
  Plus,
  List,
  CheckCircle,
  BarChart3,
  Home,
  User,
  Settings,
  Bell,
  LogOut,
  ShoppingBasket,
} from 'lucide-react';
import { useRole } from '../contexts/RoleContext';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '../hooks/use-toast';

export const MobileNavigation = () => {
  const { currentUser, hasPermission, logout } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  // Build nav items by permissions (not roles)
  const getNavigationItems = () => {
    const userRole = currentUser?.role;

    // Dashboard item - exclude for supervisor-like users
    const baseItems =
      userRole !== 'supervisor'
        ? [
            {
              to: '/',
              label: 'Home',
              icon: Home,
              permission: null,
            },
          ]
        : [];

    const items = [
      {
        to: '/materials-inventory',
        label: 'Materials',
        icon: Package,
        permission: 'inventory:materials:read',
      },
      {
        to: '/requests-list',
        label: 'Requests',
        icon: List,
        permission: 'inventory:material-indents:read',
      },
      // Example: include a purchases entry when needed
      // {
      //   to: '/purchases',
      //   label: 'Purchases',
      //   icon: ShoppingBasket,
      //   permission: 'inventory:material-purchases:read',
      // },
    ];

    return [
      ...baseItems,
      ...items.filter(
        (item) => item.permission === null || hasPermission(item.permission as any)
      ),
    ];
  };

  const navItems = getNavigationItems();

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-foreground to-foreground backdrop-blur-md border-t border-warning/20 shadow-lg'>
      <div className='flex items-center justify-around px-2 py-2'>
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-[20px] transition-all duration-200 min-w-0 flex-1 ${
                  isActive
                    ? 'text-warning bg-warning/10'
                    : 'text-white/70 hover:text-warning hover:bg-white/5'
                }`
              }
            >
              <Icon className='w-5 h-5 mb-1' />
              <span className='text-xs font-medium truncate'>{item.label}</span>
            </NavLink>
          );
        })}

        {/* More menu button */}
        {navItems.length > 4 && (
          <div className='flex flex-col items-center justify-center p-2 rounded-[20px] transition-all duration-200 min-w-0 flex-1 text-white/70 hover:text-warning hover:bg-white/5'>
            <Settings className='w-5 h-5 mb-1' />
            <span className='text-xs font-medium'>More</span>
          </div>
        )}
      </div>
    </nav>
  );
};
