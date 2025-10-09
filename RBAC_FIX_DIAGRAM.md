# RBAC Fix - Visual Flow Diagram

## Problem: Before Fix ❌

```
┌─────────────────────────────────────────────────────────────────┐
│ Login Response                                                  │
│ {                                                              │
│   user: {                                                      │
│     userType: {                                                │
│       isCompanyLevel: false,  ← IGNORED!                      │
│       isBranchLevel: true                                      │
│     }                                                          │
│   }                                                            │
│ }                                                              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ deriveUserRole(permissions)                                     │
│                                                                 │
│ if (permissions.includes('inventory:material-indents:approve')) │
│   return 'company_owner' ← WRONG! Supervisor has this perm!   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard Check                                                 │
│                                                                 │
│ if (role === 'company_owner' || hasPermission('approve'))     │
│   show CompanyOwnerDashboard ← Supervisor sees this!          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                    🚨 SECURITY ISSUE! 🚨
            Supervisor gets Company Owner access!
```

---

## Solution: After Fix ✅

```
┌─────────────────────────────────────────────────────────────────┐
│ Login Response                                                  │
│ {                                                              │
│   user: {                                                      │
│     userType: {                                                │
│       isCompanyLevel: false,  ← NOW CHECKED!                  │
│       isBranchLevel: true                                      │
│     }                                                          │
│   }                                                            │
│ }                                                              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ deriveUserRole(userType, permissions)                          │
│                                                                 │
│ if (userType?.isCompanyLevel)  ← CHECK FLAG FIRST!            │
│   return 'company_owner'                                       │
│                                                                 │
│ if (userType?.isBranchLevel)  ← Branch-level users are...     │
│   return 'supervisor'           ...Supervisors, not Owners!    │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard Check                                                 │
│                                                                 │
│ if (isCompanyLevel())  ← Check the flag, not permissions!     │
│   show CompanyOwnerDashboard                                   │
│                                                                 │
│ Supervisor: isCompanyLevel() = false ← Correctly denied!      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                    ✅ FIXED! ✅
         Supervisors only see branch-level features!
```

---

## Access Matrix Comparison

### Before Fix ❌

| User Type | isCompanyLevel | isBranchLevel | Has Approve Perm | Derived Role | Dashboard Access |
|-----------|----------------|---------------|------------------|--------------|------------------|
| Company Owner | ✅ true | ❌ false | ✅ Yes | company_owner | ✅ YES |
| Supervisor | ❌ false | ✅ true | ✅ Yes | **company_owner** 🚨 | ✅ YES 🚨 |

**Problem**: Supervisor incorrectly gets company_owner role and dashboard access!

---

### After Fix ✅

| User Type | isCompanyLevel | isBranchLevel | Has Approve Perm | Derived Role | Dashboard Access |
|-----------|----------------|---------------|------------------|--------------|------------------|
| Company Owner | ✅ true | ❌ false | ✅ Yes | company_owner | ✅ YES |
| Supervisor | ❌ false | ✅ true | ✅ Yes | supervisor ✅ | ❌ NO ✅ |

**Fixed**: Supervisor now correctly gets supervisor role with no dashboard access!

---

## Code Changes Summary

### 1. RoleContext.tsx - Core Fix
```typescript
// BEFORE ❌
export const deriveUserRole = (permissions: string[]): UserRole => {
  if (permissions.includes('inventory:material-indents:approve')) {
    return 'company_owner'; // Wrong!
  }
  // ...
}

// AFTER ✅
export const deriveUserRole = (userType?: UserType, permissions?: string[]): UserRole => {
  // Check isCompanyLevel flag FIRST!
  if (userType?.isCompanyLevel) {
    return 'company_owner'; // Correct!
  }
  
  // Branch-level users stay as supervisors/managers
  if (userType?.isBranchLevel) {
    return 'supervisor'; // or 'inventory_manager' based on perms
  }
  // ...
}

// Added helper functions
const isCompanyLevel = () => currentUser?.userType?.isCompanyLevel ?? false;
const isBranchLevel = () => currentUser?.userType?.isBranchLevel ?? false;
```

### 2. Dashboard.tsx - Access Control Fix
```typescript
// BEFORE ❌
const isOwnerLike = currentUser.role === 'company_owner' 
                 || hasPermission('inventory:material-indents:approve');

// AFTER ✅
if (isCompanyLevel()) {
  return <CompanyOwnerDashboard />;
}
```

### 3. All Navigation Components Updated
- ✅ Sidebar.tsx
- ✅ MobileNavigation.tsx  
- ✅ RoleSwitcher.tsx
- ✅ App.tsx (routing)
- ✅ Login.tsx

All now use `isCompanyLevel()` instead of permission checks for company owner features.

---

## Testing Checklist

### Test Supervisor (isBranchLevel: true, isCompanyLevel: false)
- [ ] ❌ Cannot see Dashboard link in sidebar
- [ ] ❌ Cannot access `/` (redirects to `/materials-inventory`)
- [ ] ✅ Can see "Site Supervisor" in RoleSwitcher
- [ ] ✅ Can see branch-level data only
- [ ] ❌ Cannot access company-wide reports

### Test Company Owner (isCompanyLevel: true)
- [ ] ✅ Can see Dashboard link in sidebar
- [ ] ✅ Can access CompanyOwnerDashboard at `/`
- [ ] ✅ Can see "Company Owner" in RoleSwitcher
- [ ] ✅ Can see data from all branches
- [ ] ✅ Can access company-wide reports

---

## Security Impact

### Severity: **HIGH** 🔴
**Before**: Supervisors had unauthorized access to sensitive company-wide data and controls.

### Mitigation: **COMPLETE** 🟢
**After**: Access control now properly enforces company-level vs branch-level separation.

### Important Note ⚠️
Frontend checks are now correct, but **backend API must also enforce these restrictions**!
Verify that backend endpoints check `userType.isCompanyLevel` before returning company-wide data.

---

## Rollout Plan

1. ✅ Code changes deployed (no breaking changes)
2. 🔄 Users will get correct access on next login
3. ⚠️ Existing sessions: Ask users to log out and log back in
4. ✅ No database migrations needed
5. 🔍 Monitor for any access issues in first 24 hours

---

## Backwards Compatibility

✅ **Fully backwards compatible**
- Users without `userType` fall back to permission-based role derivation
- Existing localStorage data automatically upgraded on next login
- No breaking changes to API contracts

