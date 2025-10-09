import authService from '@/lib/api/auth';
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { PermissionName } from '@/lib/permissions';
import type { UserType } from '@/lib/api/types';

export type UserRole = 'supervisor' | 'inventory_manager' | 'company_owner';

export interface User {
  id: number;
  name: string;
  email: string;
  // We keep role only as a derived label for legacy UI branching.
  role: UserRole;
  department?: string;
  assignedMachines?: string[];
  userType?: UserType; // Add userType to User interface
}

interface RoleContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  hasPermission: (permission: PermissionName) => boolean;
  isCompanyLevel: () => boolean;
  isBranchLevel: () => boolean;
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

// Derive a legacy role label based on userType flags (isCompanyLevel, isBranchLevel) and permissions
export const deriveUserRole = (userType?: UserType, permissions?: string[]): UserRole => {
  // CRITICAL FIX: Check isCompanyLevel flag first
  if (userType?.isCompanyLevel) {
    return 'company_owner';
  }

  // If branch-level with approval permissions, they're a supervisor with approval rights, NOT a company owner
  if (userType?.isBranchLevel) {
    // Check if they have inventory management permissions
    if (
      permissions?.includes('inventory:materials:read') &&
      (permissions?.includes('inventory:materials:create') ||
        permissions?.includes('inventory:materials:update') ||
        permissions?.includes('inventory:materials:delete'))
    ) {
      return 'inventory_manager';
    }
    // Default branch-level users to supervisor
    return 'supervisor';
  }

  // Fallback: use permissions to infer role (for backwards compatibility with users without userType)
  if (permissions?.includes('inventory:material-indents:approve')) {
    return 'company_owner';
  }

  if (
    permissions?.includes('inventory:materials:read') &&
    (permissions?.includes('inventory:materials:create') ||
      permissions?.includes('inventory:materials:update') ||
      permissions?.includes('inventory:materials:delete'))
  ) {
    return 'inventory_manager';
  }

  // Default to supervisor
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
          const userType = parsed.userType; // Extract userType from stored user
          const role = deriveUserRole(userType, perms);
          const user: User = {
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
            role,
            department: parsed?.branch?.name || undefined,
            userType, // Store userType in the user object
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
          const userType = parsed.userType;
          const role = deriveUserRole(userType, perms);
          setCurrentUser((prev) => ({
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
            role,
            department: parsed?.branch?.name || prev?.department,
            userType, // Store userType in the user object
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

  // Helper function to check if user is company-level
  const isCompanyLevel = () => {
    return currentUser?.userType?.isCompanyLevel ?? false;
  };

  // Helper function to check if user is branch-level
  const isBranchLevel = () => {
    return currentUser?.userType?.isBranchLevel ?? false;
  };

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
        isCompanyLevel,
        isBranchLevel,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};
