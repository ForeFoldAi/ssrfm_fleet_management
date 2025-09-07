import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'site_supervisor' | 'inventory_manager' | 'company_owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  assignedMachines?: string[];
}

interface RoleContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  hasPermission: (permission: string) => boolean;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// Demo users for different roles
const DEMO_USERS: Record<UserRole, User> = {
  site_supervisor: {
    id: '1',
    name: 'John Martinez',
    email: 'john.martinez@ssrfm.com',
    role: 'site_supervisor',
    department: 'Production Floor A',
    assignedMachines: ['Machine-101', 'Machine-102', 'Machine-105']
  },
  inventory_manager: {
    id: '2', 
    name: 'Sarah Chen',
    email: 'sarah.chen@ssrfm.com',
    role: 'inventory_manager',
    department: 'Inventory Management'
  },
  company_owner: {
    id: '3',
    name: 'Robert Williams',
    email: 'robert.williams@ssrfm.com', 
    role: 'company_owner',
    department: 'Executive Office'
  }
};

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  site_supervisor: [
    'request:create',
    'request:view_own',
    'material:view',
    'machine:view_assigned',
    'notification:receive'
  ],
  inventory_manager: [
    'request:create',
    'request:view_all', 
    'request:approve',
    'material:create',
    'material:edit',
    'material:view',
    'stock:manage',
    'report:generate',
    'supplier:manage'
  ],
  company_owner: [
    'request:create',
    'request:view_all',
    'request:approve_unlimited',
    'request:emergency_override',
    'material:create',
    'material:edit', 
    'material:delete',
    'material:view',
    'machine:create',
    'machine:edit',
    'machine:delete',
    'machine:view',
    'user:create',
    'user:edit',
    'user:delete',
    'system:configure',
    'audit:view',
    'report:generate',
    'finance:view',
    'analytics:view',
    'company:manage',
    'approval:manage',
    'stock:manage',
    'inventory:manage',
  ]
};

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Start with no user (not authenticated)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    return ROLE_PERMISSIONS[currentUser.role].includes(permission);
  };

  const switchRole = (role: UserRole) => {
    setCurrentUser(DEMO_USERS[role]);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAuthenticated = currentUser !== null;

  return (
    <RoleContext.Provider 
      value={{ 
        currentUser, 
        setCurrentUser, 
        hasPermission, 
        switchRole,
        isAuthenticated,
        logout
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};