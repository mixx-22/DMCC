# Reports Tab Implementation

## Overview
This document describes the implementation of the Reports tab feature in the Audit Schedule module, which provides a consolidated view for faster fulfillment of action plans and verifications.

## Problem Statement
Previously, users had to navigate through each organization card in the audit schedule to access findings (NC items) one by one. This was time-consuming when dealing with multiple organizations and findings that required action plans or verifications.

## Solution
A new "Reports" tab has been added to the Audit Schedule page that displays all findings grouped by organization. This provides a streamlined "form-like" view where users can quickly:
- View all minor and major non-conformity items across all organizations
- Fulfill action plans via modal dialogs
- Set verifications via modal dialogs
- All from a single consolidated view

## Implementation Details

### Files Modified

#### 1. `/src/pages/Schedules/SchedulePage.jsx`
**Changes:**
- Added Chakra UI Tab components to imports (`Tabs`, `TabList`, `Tab`, `TabPanels`, `TabPanel`)
- Added import for new `ReportsTab` component
- Wrapped the Organizations section with a tabbed interface:
  - **Organizations Tab**: Contains the existing Organizations component (unchanged)
  - **Reports Tab**: Contains the new ReportsTab component

**Code Structure:**
```jsx
<Tabs colorScheme="brandPrimary" isLazy>
  <TabList>
    <Tab>Organizations</Tab>
    <Tab>Reports</Tab>
  </TabList>

  <TabPanels>
    <TabPanel px={0} py={4}>
      <Organizations schedule={schedule ?? {}} {...{ setFormData }} />
    </TabPanel>
    <TabPanel px={0} py={4}>
      <ReportsTab schedule={schedule ?? {}} />
    </TabPanel>
  </TabPanels>
</Tabs>
```

**Benefits:**
- Uses `isLazy` prop for performance (only renders active tab)
- Preserves all existing Organizations functionality
- No breaking changes to existing code

#### 2. `/src/pages/Schedules/ReportsTab.jsx` (New File)
**Purpose:** Main component for the Reports tab that displays all findings grouped by organization.

**Key Components:**

##### a. `ReportCard` Component
Displays individual finding cards with:
- **Compliance Badge**: Shows current compliance status (color-coded)
- **Title and Details**: Finding information
- **Objectives**: Related team objectives with tooltips
- **Report Section**: For NC items (Minor/Major), displays report details
- **Action Buttons**: 
  - "Add/Edit Action Plan" button (solid when pending, outline when complete)
  - "Set/Edit Verification" button (appears after action plan is added)
- **Notification Badges**: Visual indicators for pending actions

**Modal Integration:**
- Clicking "Add/Edit Action Plan" opens a modal with `ActionPlanForm` (reused from existing code)
- Clicking "Set Verification" opens a modal with `VerificationForm` (reused from existing code)
- Both modals save directly to the finding and update the organization context

##### b. `ReportsTab` Component (Main)
Orchestrates the entire Reports view:

**Data Collection:**
```javascript
const organizationsWithFindings = useMemo(() => {
  if (!organizations || organizations.length === 0) return [];

  return organizations
    .map((org) => {
      // Collect all findings from all visits for this organization
      const findings = org?.visits?.flatMap((visit, visitIndex) =>
        (visit.findings || []).map((finding) => ({
          ...finding,
          visitIndex, // Store visit index for updates
          organizationId: org._id,
        })),
      ) || [];

      return {
        organization: org,
        findings,
      };
    })
    .filter((item) => item.findings.length > 0);
}, [organizations]);
```

**Features:**
- Groups findings by organization
- Displays organization headers with finding counts
- Shows loading spinner while data is being fetched
- Shows empty state when no findings exist
- Handles saving of action plans and verifications via context

**Update Logic:**
```javascript
const handleSaveFinding = async (updatedFinding, organization) => {
  const visitIndex = updatedFinding.visitIndex;
  
  // Update the specific finding within the correct visit
  const updatedVisits = organization.visits.map((v, i) => {
    if (i === visitIndex) {
      return {
        ...v,
        findings: (v.findings || []).map((f) =>
          f._id === updatedFinding._id ? updatedFinding : f,
        ),
      };
    }
    return v;
  });

  // Update organization via context
  await updateOrganization(organization._id, {
    visits: updatedVisits,
  });
};
```

## Architecture & Data Flow

### Component Hierarchy
```
SchedulePage
  └── OrganizationsProvider (Context)
      └── Tabs
          ├── Organizations Tab
          │   └── Organizations Component (existing)
          └── Reports Tab
              └── ReportsTab
                  └── For each organization with findings:
                      ├── Organization Header
                      └── ReportCard (for each finding)
                          ├── Action Plan Modal
                          └── Verification Modal
```

### State Management
- **Context Used**: `OrganizationsContext` (via `useOrganizations()` hook)
- **State Sources**:
  - `organizations`: List of all organizations with visits and findings
  - `loading`: Loading state
  - `updateOrganization`: Function to update organization data
- **Schedule State**: Passed as prop to determine if schedule is ongoing (editable)

### Data Structure
```javascript
organization {
  _id: string,
  team: { name: string, ... },
  visits: [
    {
      date: { start: string, end: string },
      findings: [
        {
          _id: string,
          title: string,
          details: string,
          compliance: 'MINOR_NC' | 'MAJOR_NC' | ...,
          currentCompliance: 'COMPLIANT' | ...,
          objectives: [...],
          report: {
            reportNo: string,
            date: string,
            details: string,
            ...
          },
          actionPlan: {
            rootCause: string,
            correctiveAction: string,
            ...
          },
          corrected: -1 | 0 | 2,
          correctionDate: string,
          remarks: string,
        }
      ]
    }
  ]
}
```

## Reused Components
The implementation maximizes code reuse by utilizing existing components:

1. **ActionPlanForm** (`/src/pages/Schedules/Organizations/ActionPlanForm.jsx`)
   - Handles root cause analysis and corrective actions
   - Supports both add and edit modes
   - Validates required fields

2. **VerificationForm** (`/src/pages/Schedules/Organizations/VerificationForm.jsx`)
   - Handles verification status (corrected/not corrected)
   - Captures correction date and remarks
   - Updates currentCompliance automatically

3. **NotifBadge** (`/src/components/NotifBadge.jsx`)
   - Shows notification badges for pending actions
   - Reused for consistent UX

## User Experience

### Workflow
1. **Navigate to Audit Schedule**: User opens an audit schedule
2. **Switch to Reports Tab**: User clicks the "Reports" tab
3. **View All Findings**: All findings from all organizations are displayed grouped by organization
4. **Fulfill Action Plan**: 
   - User clicks "Add Action Plan" button
   - Modal opens with ActionPlanForm
   - User fills in root cause and corrective action
   - Form saves and modal closes
5. **Set Verification**:
   - After action plan is added, "Set Verification" button appears
   - User clicks the button
   - Modal opens with VerificationForm
   - User sets corrected status and details
   - Form saves and finding status updates to "COMPLIANT" if corrected

### Visual Indicators
- **Solid Buttons**: Indicate pending actions (e.g., solid "Add Action Plan" when action plan is required)
- **Outline Buttons**: Indicate actions that can be edited (e.g., outline "Edit Action Plan" when plan exists)
- **Notification Badges**: Red badges appear on buttons and cards to draw attention to pending items
- **Color-Coded Compliance**: Badges use consistent colors:
  - Green: Compliant
  - Warning (Yellow): Minor NC
  - Error (Red): Major NC
  - Blue: Observations
  - Gray: Opportunities for Improvement

## Benefits

### For Users
1. **Faster Processing**: All findings in one view, no need to expand/collapse organization cards
2. **Better Overview**: See all pending action plans and verifications at a glance
3. **Streamlined Workflow**: Modal-based forms allow quick data entry without navigation
4. **No Learning Curve**: Reuses familiar forms and interactions from Organizations tab

### For Developers
1. **Code Reuse**: Leverages existing ActionPlanForm and VerificationForm components
2. **Consistent UX**: Uses same components ensures consistent behavior
3. **Maintainable**: Changes to forms automatically apply to both views
4. **No Breaking Changes**: Organizations tab remains unchanged, existing functionality preserved

## Testing

### Manual Testing Checklist
- [ ] Navigate to an audit schedule with organizations and findings
- [ ] Switch to Reports tab
- [ ] Verify all findings are displayed grouped by organization
- [ ] Click "Add Action Plan" and verify modal opens correctly
- [ ] Fill and save action plan, verify data persists
- [ ] Click "Set Verification" and verify modal opens correctly
- [ ] Fill and save verification, verify finding status updates to "COMPLIANT"
- [ ] Switch back to Organizations tab and verify changes are reflected
- [ ] Test with different compliance types (Minor NC, Major NC)
- [ ] Test with schedule status = closed (buttons should be hidden)
- [ ] Test with no findings (empty state should display)

### Edge Cases Handled
1. **No Organizations**: Shows empty state
2. **No Findings**: Shows empty state message
3. **Closed Audit**: Hides action buttons (respects `isScheduleOngoing`)
4. **Missing Data**: Defensive coding with fallbacks (`org?.visits?.flatMap(...)`)

## Future Enhancements (Not Implemented)
Potential improvements for future iterations:
1. **Filtering**: Add filters by compliance type, organization, or status
2. **Sorting**: Sort findings by date, compliance level, or organization
3. **Search**: Search findings by title or description
4. **Bulk Actions**: Select multiple findings for batch updates
5. **Export**: Export findings list to PDF or CSV
6. **Statistics**: Show summary stats (total findings, pending actions, etc.)

## Deployment Notes
- No database migrations required
- No API changes needed (uses existing endpoints)
- No environment variable changes
- Build succeeds without warnings (except code-split size warning - pre-existing)
- All ESLint checks pass
- Compatible with existing mock data structure

## Compatibility
- React 18.2+
- Chakra UI 2.8+
- Compatible with existing authentication and authorization
- Works with both mock data and live API
