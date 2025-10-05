import authService from '@/lib/api/auth';
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { PermissionName } from '@/lib/permissions';

export type UserRole = 'supervisor' | 'inventory_manager' | 'company_owner';

export interface User {
  id: number;
  name: string;
  email: string;
  // We keep role only as a derived label for legacy UI branching.
  role: UserRole;
  department?: string;
  assignedMachines?: string[];
}

interface RoleContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  hasPermission: (permission: PermissionName) => boolean;
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

// Derive a legacy role label from permissions to keep existing UI logic working
export const deriveUserRole = (permissions: string[]): UserRole => {
  // Owner-like access: if the user can approve material indents
  if (permissions.includes('inventory:material-indents:approve')) {
    return 'company_owner';
  }

  // Inventory manager-like access: can manage inventory/materials broadly
  if (
    permissions.includes('inventory:materials:read') &&
    (permissions.includes('inventory:materials:create') ||
      permissions.includes('inventory:materials:update') ||
      permissions.includes('inventory:materials:delete'))
  ) {
    return 'inventory_manager';
  }

  // Default to supervisor-like
  return 'supervisor';
};

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Initialize from localStorage (after login or on refresh)
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const stored = localStorage.getItem('user');
      const perms = authService.getPermissions();
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const role = deriveUserRole(perms);
          const user: User = {
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
            role,
            department: parsed?.branch?.name || undefined,
          };
          setCurrentUser(user);
        } catch {
          // ignore parse errors
        }
      }
      setPermissions(perms || []);
    }
  }, []);

  // React to auth updates (e.g., after login) to refresh permissions and user
  useEffect(() => {
    const onAuthUpdated = () => {
      const perms = authService.getPermissions();
      setPermissions(perms || []);

      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const role = deriveUserRole(perms);
          setCurrentUser((prev) => ({
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
            role,
            department: parsed?.branch?.name || prev?.department,
          }));
        } catch {
          // ignore parse errors
        }
      }
    };

    window.addEventListener('auth:updated', onAuthUpdated);
    return () => window.removeEventListener('auth:updated', onAuthUpdated);
  }, []);

  const hasPermission = useMemo(() => {
    const set = new Set(permissions);
    return (permission: PermissionName) => set.has(permission);
  }, [permissions]);

  const logout = () => {
    setCurrentUser(null);
    setPermissions([]);
    authService.logout();
  };

  const isAuthenticated = !!currentUser;

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        hasPermission,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};
