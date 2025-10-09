# Final Fix Summary: Supervisor Status Change Issue

## Problem Statement
After a company owner approved a material indent request, supervisors were unable to change the status to "Ordered" or any subsequent status. The status dropdown was not appearing for supervisors.

## Root Cause Analysis
The issue was in `src/pages/RequestDetails.tsx` where the code was using **permission-based checks** instead of **userType-based checks** to determine if a user is a company owner or supervisor.

### The Problematic Pattern:
```typescript
// ❌ WRONG - Permission-based check
userRole={
  hasPermission('inventory:material-indents:approve')
    ? 'company_owner'
    : 'supervisor'
}
```

### Why This Was Wrong:
1. **Supervisors at branch level** can have the `'inventory:material-indents:approve'` permission
2. This permission check **incorrectly classified branch-level supervisors as company owners**
3. The `StatusDropdown` component, when receiving `userRole='company_owner'`, only allows status changes when the current status is `'pending_approval'`
4. After company owner approval (status becomes `'approved'`), the supervisor (misclassified as company owner) could no longer see the dropdown

### The StatusDropdown Logic:
```typescript
// From StatusDropdown.tsx
const canChangeStatus = () => {
  if (userRole === 'company_owner') {
    return currentStatus === 'pending_approval'; // ⚠️ Only shows for pending_approval
  }
  return ['approved', 'ordered', 'fully_received'].includes(currentStatus);
};
```

## The Solution
Use the `isCompanyLevel()` helper function from `RoleContext` which correctly checks the `userType.isCompanyLevel` flag from the backend:

```typescript
// ✅ CORRECT - UserType-based check
userRole={
  isCompanyLevel()
    ? 'company_owner'
    : 'supervisor'
}
```

## All Changes Made in RequestDetails.tsx

### 1. Import the Helper Function (Line 129)
```typescript
const { currentUser, hasPermission, isCompanyLevel } = useRole();
```

### 2. Update shouldShowStatusDropdown() (Lines 1062-1069)
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

### 3. Fix StatusDropdown in renderWorkflowActions (Lines 1344-1347)
```typescript
<StatusDropdown
  currentStatus={requestData.status}
  userRole={
    isCompanyLevel()
      ? 'company_owner'
      : 'supervisor'
  }
  // ... other props
/>
```

### 4. Fix StatusDropdown in Request Header (Lines 1479-1482)
```typescript
<StatusDropdown
  currentStatus={requestData.status}
  userRole={
    isCompanyLevel()
      ? 'company_owner'
      : 'supervisor'
  }
  // ... other props
/>
```

### 5. Fix RequisitionIndentForm userRole (Lines 1553-1556)
```typescript
<RequisitionIndentForm
  // ... other props
  userRole={
    isCompanyLevel()
      ? 'company_owner'
      : 'supervisor'
  }
  // ... other props
/>
```

### 6. Fix SupervisorRequestForm userRole (Lines 1588-1591)
```typescript
<SupervisorRequestForm
  // ... other props
  userRole={
    isCompanyLevel()
      ? 'company_owner'
      : 'supervisor'
  }
  // ... other props
/>
```

## How It Works Now

### Workflow After Fix:

```
1. Supervisor creates request
   └─> Status: pending_approval

2. Company Owner (isCompanyLevel: true) logs in
   ├─> Can see status dropdown
   ├─> Can approve request
   └─> Status changes to: approved

3. Supervisor (isBranchLevel: true) logs in
   ├─> Now CORRECTLY identified as supervisor (not company_owner)
   ├─> Can see status dropdown ✅
   ├─> Can change status to: ordered
   └─> Status changes to: ordered

4. Supervisor can continue workflow
   ├─> Change to: partially_received
   └─> Change to: fully_received
```

## Testing Checklist
- [x] Fixed permission-based role determination (6 instances)
- [x] No linter errors
- [x] Documentation created

### Manual Testing Steps:
1. **Login as Company Owner**
   - View a request with status `pending_approval`
   - Approve the request
   - Verify status changes to `approved`
   - Logout

2. **Login as Supervisor**
   - View the approved request
   - Verify the status dropdown **is visible** ✅
   - Verify the dropdown shows "Ordered" option
   - Change status to "Ordered"
   - Verify the status updates successfully

3. **Continue as Supervisor**
   - After status is "Ordered"
   - Verify dropdown shows "Partially Received" and "Fully Received" options
   - Test changing to "Partially Received"
   - Verify the partial receipt form works
   - Test changing to "Fully Received"
   - Verify the material receipt completes

## Related Documentation
- `SUPERVISOR_STATUS_FIX.md` - Detailed fix documentation
- `RBAC_FIX_SUMMARY.md` - Original RBAC fixes
- `RBAC_FIX_DIAGRAM.md` - RBAC fix diagrams

## Related Files Modified
- `src/pages/RequestDetails.tsx` - Main fix (6 changes)
- `src/contexts/RoleContext.tsx` - Provides `isCompanyLevel()` helper
- `src/components/StatusDropdown.tsx` - Uses userRole to determine options

## Key Takeaway
Always use `isCompanyLevel()` and `isBranchLevel()` helpers from `RoleContext` instead of permission checks when determining user roles for UI logic. Permissions should only be used to check specific action capabilities, not to determine user types.

