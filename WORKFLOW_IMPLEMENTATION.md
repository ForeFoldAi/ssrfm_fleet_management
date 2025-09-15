# Material Request Workflow Implementation

## Overview

This implementation provides a comprehensive material request workflow system that handles the complete lifecycle from request submission to material receipt, with proper role-based access control and status management.

## Workflow States

### 1. **Pending Approval**
- Initial state when a request is submitted
- Awaiting Owner approval
- Only Owner can approve or revert

### 2. **Approved → Ordered**
- When Owner approves the request
- Status automatically updates to "Ordered"
- Supervisor can now update material receipt

### 3. **Reverted**
- When Owner rejects/reverts the request
- Requires resubmission of indent form
- Supervisor status is also reverted
- Must provide reason for reverting

### 4. **Partially Received**
- When materials are partially received
- Supervisor updates with partial receipt details
- Can be updated multiple times until complete

### 5. **Material Received**
- Final state when all materials are received
- Complete receipt details recorded
- Workflow completed

## Key Components

### 1. **RequestStatusManager Component**
- Main interface for managing request status
- Role-based action visibility
- Handles Owner approval/revert actions
- Manages Supervisor receipt updates

### 2. **useRequestWorkflow Hook**
- Centralized workflow state management
- Status transition logic
- Permission checking
- History tracking

### 3. **WorkflowDemo Component**
- Interactive demonstration of the workflow
- Shows current status and progress
- Visual workflow steps
- Status history display

## Role-Based Actions

### **Company Owner**
- **Approve Request**: Changes status from "Pending Approval" to "Ordered"
- **Revert Request**: Changes status to "Reverted" with reason
- Can only act on "Pending Approval" requests

### **Site Supervisor**
- **Update Receipt**: Record material receipt details
- **Partial Receipt**: Mark as partially received
- **Complete Receipt**: Mark as fully received
- Can only act on "Ordered" or "Partially Received" requests

## Receipt Form Fields

When Supervisor updates material receipt, the following details are captured:

- **Purchased Price**: Total cost of materials
- **Purchased Quantity**: Actual quantity received
- **Purchased From**: Supplier/vendor name
- **Received Date**: Date of receipt
- **Invoice Number**: Reference number
- **Quality Check**: Pass/Fail/Partial status
- **Notes**: Additional remarks

## Implementation Details

### Files Created/Modified

1. **`src/components/RequestStatusManager.tsx`**
   - Main status management interface
   - Handles all workflow transitions
   - Role-based UI rendering

2. **`src/hooks/useRequestWorkflow.ts`**
   - Workflow state management hook
   - Status transition functions
   - Permission checking logic

3. **`src/components/WorkflowDemo.tsx`**
   - Interactive demo component
   - Visual workflow representation
   - Status history display

4. **`src/pages/WorkflowDemoPage.tsx`**
   - Demo page with role switcher
   - Complete workflow demonstration

5. **`src/pages/SupervisorRequests.tsx`** (Modified)
   - Added status management integration
   - "Manage Status" buttons in both list and table views
   - Workflow state handling

6. **`src/App.tsx`** (Modified)
   - Added workflow demo route

## Usage Instructions

### For Owners:
1. Navigate to requests with "Pending Approval" status
2. Click "Manage Status" button
3. Choose to either:
   - **Approve**: Request moves to "Ordered" status
   - **Revert**: Provide reason, request moves to "Reverted"

### For Supervisors:
1. Navigate to requests with "Ordered" status
2. Click "Manage Status" button
3. Fill in receipt form with:
   - Purchase details (price, quantity, supplier)
   - Receipt information (date, invoice)
   - Quality check results
4. Choose partial or complete receipt
5. Submit to update status

### For Reverted Requests:
1. Supervisor must resubmit the indent form
2. Request returns to "Pending Approval"
3. Owner can review and approve/revert again

## Key Features

### Status Tracking
- Complete status history with timestamps
- User attribution for all actions
- Detailed descriptions for each transition

### Role-Based Security
- Actions only available to authorized roles
- Permission checking at multiple levels
- Clear role indicators in UI

### Data Integrity
- Required field validation
- Quantity verification
- Status consistency checks

### User Experience
- Clear visual workflow progress
- Intuitive action buttons
- Comprehensive status information
- Real-time updates

## Demo Access

Visit `/workflow-demo` to see an interactive demonstration of the complete workflow with role switching capabilities.

## Integration Points

### Stock Management
- Receipt updates can integrate with stock system
- Quantity tracking and inventory updates
- Cost and supplier information recording

### Notification System
- Status change notifications
- Approval/revert alerts
- Receipt confirmations

### Reporting
- Workflow analytics
- Status transition reports
- Performance metrics

## Future Enhancements

1. **Email Notifications**: Automatic notifications on status changes
2. **Document Attachments**: Support for invoices and receipts
3. **Bulk Operations**: Handle multiple requests simultaneously
4. **Advanced Reporting**: Detailed workflow analytics
5. **Mobile Optimization**: Better mobile experience for field operations
6. **Integration APIs**: Connect with external procurement systems

This implementation provides a solid foundation for material request workflow management with clear separation of concerns, proper role-based access control, and comprehensive status tracking.