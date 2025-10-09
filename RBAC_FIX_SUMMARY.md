# RBAC Fix Summary - Supervisor Access Issue

## Issue Description
Supervisors were getting full Company Owner-level access, including access to dashboards and features that should be restricted to company-level users only.

### Root Cause
The role-based access control (RBAC) system was determining user roles based solely on **permissions**, not on the `userType.isCompanyLevel` and `userType.isBranchLevel` flags from the backend.

Specifically:
- The `deriveUserRole()` function in `RoleContext.tsx` was checking if a user had the `'inventory:material-indents:approve'` permission and automatically assigning them the `'company_owner'` role
- Supervisors who had approval permissions at the branch level were incorrectly classified as Company Owners
- This caused Supervisors to gain access to company-wide dashboards and owner-only features

## Expected Behavior
**Supervisor users** (`isBranchLevel: true`, `isCompanyLevel: false`) should:
- Only have access to their assigned branch-level data and modules
- NOT have access to:
  - Company-wide dashboards
  - Owner-only settings or reports
  - Global configuration modules

**Company Owner users** (`isCompanyLevel: true`) should:
- Have full access to company-wide dashboards and reports
- View data across all branches
- Access owner-level configuration

## Changes Made

### 1. Updated `src/contexts/RoleContext.tsx`
**Key Changes:**
- Added `UserType` import from API types
- Added `userType` field to the `User` interface
- Added `isCompanyLevel()` and `isBranchLevel()` helper functions to `RoleContextType`
- **CRITICAL FIX**: Modified `deriveUserRole()` function to check `userType.isCompanyLevel` flag FIRST before checking permissions
- Updated `RoleProvider` to:
  - Store and retrieve `userType` from localStorage
  - Pass `userType` to `deriveUserRole()`
  - Provide `isCompanyLevel()` and `isBranchLevel()` functions in context

**Before:**
```typescript
export const deriveUserRole = (permissions: string[]): UserRole => {
  if (permissions.includes('inventory:material-indents:approve')) {
    return 'company_owner'; // ❌ Supervisors with approval perms = Company Owner!
  }
  // ...
}
```

**After:**
```typescript
export const deriveUserRole = (userType?: UserType, permissions?: string[]): UserRole => {
  // ✅ Check isCompanyLevel flag FIRST
  if (userType?.isCompanyLevel) {
    return 'company_owner';
  }
  
  // ✅ Branch-level users with approval permissions are still Supervisors
  if (userType?.isBranchLevel) {
    // Check for inventory management permissions
    // Default branch-level users to supervisor
    return 'supervisor';
  }
  // ...
}
```

### 2. Updated `src/pages/Login.tsx`
- Modified `handleLogin()` to pass `apiUser.userType` to `deriveUserRole()`
- Store `userType` in the user context

### 3. Updated `src/pages/Dashboard.tsx`
**Before:**
```typescript
const isOwnerLike = currentUser.role === 'company_owner' || hasPermission('inventory:material-indents:approve');
```

**After:**
```typescript
// ✅ Only show CompanyOwnerDashboard for users with isCompanyLevel = true
if (isCompanyLevel()) {
  return <CompanyOwnerDashboard />;
}
```

### 4. Updated `src/App.tsx`
**RoleBasedHome Component:**
- Changed from checking `hasPermission('inventory:material-indents:approve')` to using `isCompanyLevel()`

**getLoginRedirect Function:**
- Changed from checking approval permissions to using `isCompanyLevel()`

### 5. Updated `src/components/Sidebar.tsx`
**Before:**
```typescript
const baseItems = userRole === 'company_owner' || hasApprovalPermission
  ? [{ to: '/', label: 'Dashboard', ... }]
  : [];
```

**After:**
```typescript
// ✅ Dashboard item - show only for company-level users
const baseItems = isCompanyLevel()
  ? [{ to: '/', label: 'Dashboard', ... }]
  : [];
```

### 6. Updated `src/components/MobileNavigation.tsx`
- Similar to Sidebar, changed dashboard visibility check from permission-based to `isCompanyLevel()`

### 7. Updated `src/components/RoleSwitcher.tsx`
**getDisplayConfig Function:**
- Changed from checking approval permissions to using `isCompanyLevel()` for "Company Owner" label
- Updated function signature to accept `isCompanyLevel` callback

## Testing Recommendations

### 1. Test Supervisor Access (isBranchLevel: true, isCompanyLevel: false)
- [ ] Login as a Supervisor user
- [ ] Verify they do NOT see the Dashboard link in sidebar
- [ ] Verify they do NOT see the Dashboard link in mobile navigation
- [ ] Verify navigating to `/` redirects them to `/materials-inventory`
- [ ] Verify the RoleSwitcher shows "Site Supervisor" label (not "Company Owner")
- [ ] Verify they can only see data from their assigned branch
- [ ] Verify they cannot access company-wide reports/settings

### 2. Test Company Owner Access (isCompanyLevel: true)
- [ ] Login as a Company Owner user
- [ ] Verify they CAN see the Dashboard link in sidebar
- [ ] Verify they CAN access the CompanyOwnerDashboard at `/`
- [ ] Verify the RoleSwitcher shows "Company Owner" label
- [ ] Verify they can see data from all branches
- [ ] Verify they can access company-wide reports and settings

### 3. Test Edge Cases
- [ ] Test users with no `userType` (fallback to permission-based role derivation)
- [ ] Test users with both approval permissions AND isBranchLevel=true (should still be Supervisor)
- [ ] Test users with isCompanyLevel=false but with company-wide permissions

## Files Modified
1. `src/contexts/RoleContext.tsx` - Core RBAC logic fix
2. `src/pages/Login.tsx` - Pass userType to role derivation
3. `src/pages/Dashboard.tsx` - Use isCompanyLevel() check
4. `src/App.tsx` - Use isCompanyLevel() for routing
5. `src/components/Sidebar.tsx` - Use isCompanyLevel() for dashboard visibility
6. `src/components/MobileNavigation.tsx` - Use isCompanyLevel() for home visibility
7. `src/components/RoleSwitcher.tsx` - Use isCompanyLevel() for role label

## Backend Considerations

### User Data Structure Expected
Ensure the backend API returns user data in this format:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "userType": {
    "id": 2,
    "name": "Supervisor",
    "description": "Supervisor with full access at branch level",
    "isActive": true,
    "isBranchLevel": true,
    "isCompanyLevel": false,
    "createdAt": "2025-09-18T08:41:05.134Z",
    "updatedAt": "2025-09-18T08:41:05.134Z"
  },
  "branch": {
    "id": 1,
    "name": "Unit One",
    ...
  },
  ...
}
```

### API Endpoints to Verify
Ensure these endpoints respect the userType flags:
- Dashboard API (`/api/dashboard/*`) - Should filter by branch if `isBranchLevel: true`
- Material Indents API - Should respect scope based on userType
- Reports APIs - Should be restricted for branch-level users

## Security Notes
- ✅ This fix prevents privilege escalation where Supervisors gain Company Owner access
- ✅ Access control now properly respects the backend's userType configuration
- ✅ The system falls back to permission-based role derivation for backwards compatibility
- ⚠️ **Important**: Ensure backend APIs also enforce these restrictions! Frontend checks alone are not sufficient for security.

## Migration Notes
- Existing users will automatically get the correct role on their next login
- No database migrations required on the frontend
- The `userType` field is already being returned by the backend API
- Backwards compatible: Works with users who don't have `userType` by falling back to permission-based inference

## Summary
This fix ensures that **user access levels are determined by the `isCompanyLevel` and `isBranchLevel` flags** from the backend's `userType` configuration, rather than being inferred from permissions alone. This prevents Supervisors from gaining unauthorized Company Owner access while maintaining a robust fallback mechanism for edge cases.

