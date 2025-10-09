# RBAC Fix - Testing Guide

## Quick Test Instructions

### Prerequisites
1. Have access to two test accounts:
   - **Supervisor account** (with `isBranchLevel: true`, `isCompanyLevel: false`)
   - **Company Owner account** (with `isCompanyLevel: true`)

2. Clear browser cache or use incognito mode for fresh tests

---

## Test 1: Supervisor Access (Branch-Level User)

### Expected User Data
```json
{
  "userType": {
    "id": 2,
    "name": "Supervisor",
    "isCompanyLevel": false,
    "isBranchLevel": true
  }
}
```

### Test Steps

#### 1.1 Login Test
1. Open browser DevTools (Console tab)
2. Navigate to `/login`
3. Login with Supervisor credentials
4. Check console for: `"Login: Redirecting to role-specific page for: supervisor"`
5. ✅ **Expected**: Redirected to `/materials-inventory`

#### 1.2 Dashboard Access Test
1. Try to navigate to `/` directly in URL bar
2. ✅ **Expected**: Should redirect back to `/materials-inventory`
3. ❌ **Should NOT see**: CompanyOwnerDashboard with expense charts

#### 1.3 Sidebar Test
1. Check left sidebar
2. ✅ **Expected**: Should see "Materials Management" link
3. ❌ **Should NOT see**: "Dashboard" link at top

#### 1.4 Mobile Navigation Test (if applicable)
1. Resize browser to mobile view or use mobile device
2. Check bottom navigation bar
3. ❌ **Should NOT see**: "Home" button

#### 1.5 Role Label Test
1. Check top-right corner (RoleSwitcher component)
2. ✅ **Expected**: Should display "Site Supervisor" or "Inventory Manager"
3. ❌ **Should NOT display**: "Company Owner"

#### 1.6 Data Scope Test
1. Navigate to Materials Inventory
2. Check data displayed
3. ✅ **Expected**: Only see data for assigned branch
4. ❌ **Should NOT see**: Data from other branches/units

---

## Test 2: Company Owner Access (Company-Level User)

### Expected User Data
```json
{
  "userType": {
    "id": 1,
    "name": "Company Owner",
    "isCompanyLevel": true,
    "isBranchLevel": false
  }
}
```

### Test Steps

#### 2.1 Login Test
1. Open browser DevTools (Console tab)
2. Navigate to `/login`
3. Login with Company Owner credentials
4. Check console for: `"Login: Redirecting to role-specific page for: company_owner"`
5. ✅ **Expected**: Redirected to `/` (Dashboard)

#### 2.2 Dashboard Access Test
1. Should automatically land on dashboard after login
2. ✅ **Expected**: See CompanyOwnerDashboard with:
   - Expense charts (Machine Expenses, Material Expenses)
   - Stats cards (Total Expenses, Unit One, Unit Two, Pending Approvals)
   - Time period filters

#### 2.3 Sidebar Test
1. Check left sidebar
2. ✅ **Expected**: Should see both:
   - "Dashboard" link at top
   - "Materials Management" link

#### 2.4 Mobile Navigation Test (if applicable)
1. Resize browser to mobile view
2. Check bottom navigation bar
3. ✅ **Expected**: Should see "Home" button

#### 2.5 Role Label Test
1. Check top-right corner (RoleSwitcher component)
2. ✅ **Expected**: Should display "Company Owner" with purple badge
3. Should show "Full Business Control" description

#### 2.6 Data Scope Test
1. Navigate to Materials Inventory
2. Check data displayed
3. ✅ **Expected**: Should see data from ALL branches/units
4. ✅ **Expected**: Can filter/view data by different units

---

## Test 3: Browser DevTools Verification

### Check localStorage
```javascript
// Open DevTools Console and run:
const user = JSON.parse(localStorage.getItem('user'));
console.log('User Type:', user.userType);
console.log('Is Company Level:', user.userType?.isCompanyLevel);
console.log('Is Branch Level:', user.userType?.isBranchLevel);
```

#### For Supervisor:
```javascript
// Expected output:
{
  isCompanyLevel: false,  ✅
  isBranchLevel: true     ✅
}
```

#### For Company Owner:
```javascript
// Expected output:
{
  isCompanyLevel: true,   ✅
  isBranchLevel: false    ✅
}
```

---

## Test 4: Network Request Verification

### Check API Responses
1. Open DevTools Network tab
2. Login and navigate around
3. Look for requests to:
   - `/api/auth/login` - Check response has `userType` field
   - `/api/dashboard/*` - Should only be called by Company Owner
   - `/api/materials/*` - Check query params for branch filtering

### For Supervisor Login:
```json
// /api/auth/login response should include:
{
  "user": {
    "userType": {
      "isCompanyLevel": false,
      "isBranchLevel": true
    }
  }
}
```

---

## Test 5: Edge Cases

### 5.1 User Without userType (Backwards Compatibility)
1. If a user doesn't have `userType` in response
2. ✅ **Expected**: System falls back to permission-based role derivation
3. System should still work (no crashes)

### 5.2 Session Refresh Test
1. Login as Supervisor
2. Refresh the page (F5)
3. ✅ **Expected**: Role and access restrictions persist
4. Should still not see Dashboard link

### 5.3 Direct URL Navigation Test
1. Login as Supervisor
2. Manually type `/` in URL bar
3. ✅ **Expected**: Redirected to `/materials-inventory`
4. Type `/organizational-management` (if restricted)
5. ✅ **Expected**: Should check permissions appropriately

---

## Common Issues & Troubleshooting

### Issue: Supervisor still sees Dashboard
**Possible Causes:**
1. Old cached localStorage data
2. Old session still active
3. Backend not returning correct `userType`

**Solution:**
```javascript
// Clear all auth data and re-login:
localStorage.clear();
// Then refresh page and login again
```

### Issue: Company Owner doesn't see Dashboard
**Possible Cause:**
Backend returning incorrect `isCompanyLevel: false`

**Check:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('userType:', user.userType);
// Should show isCompanyLevel: true
```

### Issue: TypeScript errors in console
**Solution:**
Ensure you've pulled latest changes and run:
```bash
npm install
```

---

## Automated Test Script (Optional)

```javascript
// Run this in DevTools Console after login
function testRBAC() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isCompanyLevel = user?.userType?.isCompanyLevel;
  const isBranchLevel = user?.userType?.isBranchLevel;
  
  console.log('🔍 RBAC Test Results:');
  console.log('User:', user.name);
  console.log('Is Company Level:', isCompanyLevel);
  console.log('Is Branch Level:', isBranchLevel);
  
  // Check if dashboard link exists
  const hasDashboardLink = document.querySelector('a[href="/"]');
  console.log('Has Dashboard Link:', !!hasDashboardLink);
  
  // Expected results
  if (isCompanyLevel) {
    console.log('✅ Company Owner - Should have dashboard access');
    console.assert(!!hasDashboardLink, '❌ Dashboard link missing for Company Owner!');
  } else if (isBranchLevel) {
    console.log('✅ Supervisor - Should NOT have dashboard access');
    console.assert(!hasDashboardLink || hasDashboardLink.textContent !== 'Dashboard', 
                   '❌ Dashboard link visible for Supervisor!');
  }
  
  console.log('✅ RBAC Test Complete');
}

testRBAC();
```

---

## Success Criteria

### All tests pass if:
- ✅ Supervisors CANNOT access company-wide dashboard
- ✅ Supervisors redirected to materials inventory on login
- ✅ Supervisors show correct role label ("Site Supervisor")
- ✅ Company Owners CAN access dashboard
- ✅ Company Owners see data from all branches
- ✅ Company Owners show correct role label ("Company Owner")
- ✅ No TypeScript compilation errors
- ✅ No runtime errors in console
- ✅ localStorage contains correct `userType` data

---

## Reporting Issues

If any test fails, please report with:
1. User type being tested (Supervisor/Company Owner)
2. Expected behavior
3. Actual behavior
4. Screenshot of issue
5. Browser console errors (if any)
6. Network request/response data (if relevant)
7. localStorage user data:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('user')));
   ```

---

## Post-Testing Checklist

After all tests pass:
- [ ] Inform all Supervisors to logout and re-login
- [ ] Monitor for any access issues in first 24 hours
- [ ] Verify backend APIs also enforce userType restrictions
- [ ] Update internal documentation about role-based access
- [ ] Archive this testing guide for future reference

