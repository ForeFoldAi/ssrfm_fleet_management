# Supervisor Status Change Fix

## Issue Description
After a company owner approved a request, supervisors were not able to change the status to "Ordered". The status dropdown was not appearing for supervisors.

## Root Cause
In `src/pages/RequestDetails.tsx`, the code was using **permission-based checks** to determine if a user is a company owner or supervisor:

```typescript
// OLD CODE (INCORRECT)
userRole={
  hasPermission('inventory:material-indents:approve')
    ? 'company_owner'
    : 'supervisor'
}
```

### Why This Was a Problem:
1. **Supervisors** at the branch level can have the `'inventory:material-indents:approve'` permission
2. This permission-based check incorrectly classified them as `'company_owner'`
3. When classified as `'company_owner'`, the `StatusDropdown` component only allows status changes when status is `'pending_approval'`
4. After the company owner approves (status becomes `'approved'`), supervisors couldn't see the dropdown anymore

## The Fix
Updated `RequestDetails.tsx` to use the `isCompanyLevel()` helper from `RoleContext` instead of permission checks:

```typescript
// NEW CODE (CORRECT)
userRole={
  isCompanyLevel()
    ? 'company_owner'
    : 'supervisor'
}
```

### Changes Made:

1. **Line 129**: Added `isCompanyLevel` to the destructured `useRole()` hook
   ```typescript
   const { currentUser, hasPermission, isCompanyLevel } = useRole();
   ```

2. **Lines 1062-1069**: Updated `shouldShowStatusDropdown()` function
   ```typescript
   if (isCompanyLevel() && hasPermission('inventory:material-indents:approve')) {
     return requestData.status === 'pending_approval';
   }

   if (!isCompanyLevel() && hasPermission('inventory:material-indents:update')) {
     return ['approved', 'ordered', 'partially_received'].includes(
       requestData.status
     );
   }
   ```

3. **Lines 1344-1347**: Updated first StatusDropdown userRole determination (in renderWorkflowActions)
   ```typescript
   userRole={
     isCompanyLevel()
       ? 'company_owner'
       : 'supervisor'
   }
   ```

4. **Lines 1479-1482**: Updated second StatusDropdown userRole determination (in request header section)
   ```typescript
   userRole={
     isCompanyLevel()
       ? 'company_owner'
       : 'supervisor'
   }
   ```

5. **Lines 1553-1556**: Updated third userRole determination (in RequisitionIndentForm)
   ```typescript
   userRole={
     isCompanyLevel()
       ? 'company_owner'
       : 'supervisor'
   }
   ```

6. **Lines 1588-1591**: Updated fourth userRole determination (in SupervisorRequestForm)
   ```typescript
   userRole={
     isCompanyLevel()
       ? 'company_owner'
       : 'supervisor'
   }
   ```

## How It Works Now

### Company Owner (isCompanyLevel: true)
- Can change status when status is `'pending_approval'`
- Approves the request → status changes to `'approved'`

### Supervisor (isBranchLevel: true)
- Can change status when status is `'approved'`, `'ordered'`, or `'partially_received'`
- After company owner approves:
  - Supervisor can change status from `'approved'` to `'ordered'`
  - Supervisor can change status from `'ordered'` to `'partially_received'` or `'fully_received'`

## Testing
1. Login as Company Owner
2. Approve a pending request
3. Logout and login as Supervisor
4. Open the approved request
5. Verify that the status dropdown appears and shows "Ordered" option
6. Change status to "Ordered"
7. Verify that further status options appear for receiving materials

## Related Files
- `src/pages/RequestDetails.tsx` - Fixed user role determination
- `src/contexts/RoleContext.tsx` - Provides the `isCompanyLevel()` helper
- `src/components/StatusDropdown.tsx` - Uses userRole to determine available options
- `RBAC_FIX_SUMMARY.md` - Original RBAC fix documentation

