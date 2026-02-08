# Reports Tab - Visual Guide

## Feature Overview
The Reports tab provides a consolidated view of all audit findings across organizations, streamlining the workflow for fulfilling action plans and setting verifications.

## UI Layout

### Tab Navigation
```
┌─────────────────────────────────────────────────────────────┐
│ Audit Schedule: [Title]                                      │
├─────────────────────────────────────────────────────────────┤
│ [Organizations] [Reports] ← Tabs                             │
├─────────────────────────────────────────────────────────────┤
```

## Reports Tab Structure

### Header Section
```
┌─────────────────────────────────────────────────────────────┐
│ All Reports                            5 Total Findings      │
└─────────────────────────────────────────────────────────────┘
```

### Organization Sections
Each organization's findings are grouped together:

```
┌─────────────────────────────────────────────────────────────┐
│ Engineering Team                            3 Findings       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [Minor Non-Conformity]                                 │  │
│  │                                                         │  │
│  │ Documentation Gap                                       │  │
│  │ [Documentation] [Quality Control]   Jan 15, 2024       │  │
│  │                                              [!] ← Badge │  │
│  │ Technical documentation for API endpoints is missing.   │  │
│  │                                                         │  │
│  │ ┌──── Report ────────────────────────────────────────┐ │  │
│  │ │ 📄 Report                                          │ │  │
│  │ │ Report No: NC-001    Date Issued: Jan 15, 2024   │ │  │
│  │ │ Details: Several endpoints lack documentation...  │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                         │  │
│  │ [🔧 Add Action Plan]  ← Solid button (action required)│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [Compliant] ← Green badge                             │  │
│  │                                                         │  │
│  │ Code Review Completed                                   │  │
│  │ [Best Practices] [Code Quality]   Jan 20, 2024        │  │
│  │                                                         │  │
│  │ All code reviews completed with proper documentation.   │  │
│  │                                                         │  │
│  │ ┌──── Report ────────────────────────────────────────┐ │  │
│  │ │ 📄 Report                                          │ │  │
│  │ │ Report No: NC-002    Date Issued: Jan 10, 2024   │ │  │
│  │ │ Details: Code review process needs improvement... │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                         │  │
│  │ [🔧 Edit Action Plan] [✓ Edit Verification]           │  │
│  │      ← Outline buttons (already fulfilled)             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Quality Assurance Team                      2 Findings       │
├─────────────────────────────────────────────────────────────┤
│  [Similar card structure for each finding...]                │
└─────────────────────────────────────────────────────────────┘
```

## Visual Elements

### 1. Compliance Status Badges
Color-coded badges indicate current compliance status:
- **Green**: `[Compliant]` - Issue resolved
- **Red**: `[Major Non-Conformity]` - Critical issue
- **Yellow**: `[Minor Non-Conformity]` - Non-critical issue
- **Blue**: `[Observations]` - Informational
- **Gray**: `[Opportunities for Improvements]` - Suggestions

### 2. Notification Badges
Red notification badges (`[!]`) appear on:
- Cards with pending action plans
- Cards with pending verifications
- Action buttons that require user input

### 3. Action Buttons

#### Add Action Plan (Solid Button)
```
[🔧 Add Action Plan]
```
- **Appearance**: Solid blue button
- **When shown**: When finding requires action plan but doesn't have one
- **Action**: Opens modal with Action Plan Form

#### Edit Action Plan (Outline Button)
```
[🔧 Edit Action Plan]
```
- **Appearance**: Outline blue button
- **When shown**: When finding already has action plan
- **Action**: Opens modal to edit existing action plan

#### Set Verification (Solid Button)
```
[✓ Set Verification]
```
- **Appearance**: Solid green button
- **When shown**: After action plan is added, before verification is set
- **Action**: Opens modal with Verification Form

#### Edit Verification (Outline Button)
```
[✓ Edit Verification]
```
- **Appearance**: Outline green button
- **When shown**: When verification has been set
- **Action**: Opens modal to edit verification details

### 4. Report Details Section
Displays for Minor NC and Major NC findings:
```
┌──── Report ────────────────────────────────────────┐
│ 📄 Report                                          │
│ Report No: NC-001    Date Issued: January 15, 2024│
│                                                     │
│ Details:                                           │
│ Several API endpoints lack proper documentation... │
└────────────────────────────────────────────────────┘
```

## Modal Interactions

### Action Plan Modal
Opens when user clicks "Add/Edit Action Plan":

```
┌────────────────────────────────────────────────────┐
│ Add Action Plan                              [×]   │
├────────────────────────────────────────────────────┤
│                                                     │
│ Root Cause Analysis:                               │
│ ┌──────────────────────────────────────────────┐  │
│ │ [Textarea for root cause]                    │  │
│ └──────────────────────────────────────────────┘  │
│                                                     │
│ Corrective Action:                                 │
│ ┌──────────────────────────────────────────────┐  │
│ │ [Textarea for corrective action]             │  │
│ └──────────────────────────────────────────────┘  │
│                                                     │
│ Owner: [Dropdown to select]                        │
│ Proposed Completion Date: [Date picker]           │
│                                                     │
│              [Cancel]  [Save Action Plan]          │
└────────────────────────────────────────────────────┘
```

### Verification Modal
Opens when user clicks "Set Verification":

```
┌────────────────────────────────────────────────────┐
│ Set Verification                             [×]   │
├────────────────────────────────────────────────────┤
│                                                     │
│ Status:                                            │
│ ○ Not Corrected                                    │
│ ● Corrected                                        │
│                                                     │
│ Correction Date: [Date picker]                     │
│                                                     │
│ Remarks (Optional):                                │
│ ┌──────────────────────────────────────────────┐  │
│ │ [Textarea for remarks]                       │  │
│ └──────────────────────────────────────────────┘  │
│                                                     │
│              [Cancel]  [Save Verification]         │
└────────────────────────────────────────────────────┘
```

## User Workflow

### Scenario 1: Adding Action Plan
1. User navigates to Reports tab
2. Identifies finding with red `[!]` notification badge
3. Clicks solid `[🔧 Add Action Plan]` button
4. Modal opens with Action Plan Form
5. User fills in:
   - Root cause analysis
   - Corrective action
   - Owner
   - Proposed completion date
6. Clicks "Save Action Plan"
7. Modal closes, finding card updates
8. `[✓ Set Verification]` button now appears

### Scenario 2: Setting Verification
1. User identifies finding with action plan but no verification
2. Clicks solid `[✓ Set Verification]` button
3. Modal opens with Verification Form
4. User selects:
   - Corrected status (Corrected/Not Corrected)
   - Correction date
   - Optional remarks
5. Clicks "Save Verification"
6. Modal closes
7. If marked as "Corrected", compliance badge changes to green `[Compliant]`
8. Button changes to outline `[✓ Edit Verification]`

### Scenario 3: Viewing All Findings
1. User switches to Reports tab
2. Sees all findings grouped by organization
3. Can quickly identify:
   - Organizations with the most findings
   - Findings requiring action
   - Findings pending verification
   - Completed findings
4. Can process findings systematically from top to bottom

## Empty States

### No Organizations
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│                    📄 (faded icon)                   │
│                                                      │
│              No findings to display                  │
│                                                      │
│    Add organizations and findings to see them here  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│                    ⌛ (spinner)                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (Large Screens)
- Full-width cards with adequate spacing
- Side-by-side display of report details
- Modals centered on screen

### Tablet (Medium Screens)
- Cards stack vertically
- Report details maintain side-by-side layout
- Modals adjusted to fit screen

### Mobile (Small Screens)
- Cards take full width
- Report details stack vertically
- Modals take full screen width

## Accessibility Features

1. **Keyboard Navigation**: All buttons and modals are keyboard accessible
2. **Screen Reader Support**: Proper ARIA labels on buttons and interactive elements
3. **Color Contrast**: All text meets WCAG AA standards
4. **Focus Indicators**: Clear focus states on interactive elements
5. **Semantic HTML**: Proper heading hierarchy and landmark regions

## Performance Optimizations

1. **Lazy Loading**: Tabs use `isLazy` prop - Reports tab only renders when active
2. **Memoization**: Organization and findings data computed once and cached
3. **Efficient Re-renders**: Only affected cards re-render on data updates
4. **Modal Management**: Modals unmount when closed, freeing memory

## Data Consistency

### Synchronization Between Tabs
- Reports tab uses same data source as Organizations tab
- Updates in Reports tab immediately reflect in Organizations tab
- No data duplication or synchronization issues
- Single source of truth via `OrganizationsContext`

## Advantages Over Organizations Tab

1. **Consolidated View**: See all findings at once without expanding cards
2. **Faster Processing**: Modal-based workflow eliminates navigation
3. **Better Overview**: Count indicators show workload at a glance
4. **Sequential Workflow**: Process findings from top to bottom systematically
5. **Less Clicking**: No need to expand/collapse organization cards
6. **Visual Priority**: Notification badges highlight what needs attention

## Technical Implementation Notes

### Component Reuse
- ✅ Reuses `ActionPlanForm` from Organizations module
- ✅ Reuses `VerificationForm` from Organizations module
- ✅ Reuses `NotifBadge` component
- ✅ Consistent UI patterns with existing pages

### State Management
- Uses existing `OrganizationsContext`
- No new context or state management needed
- Updates propagate automatically

### Code Quality
- Extracted constants for dates and compliance
- Helper function for repeated logic
- Proper cleanup of temporary properties
- Defensive programming with fallbacks

## Future Enhancement Ideas

These are NOT implemented but could be added later:

1. **Filtering**: Filter by compliance type, organization, status
2. **Sorting**: Sort by date, priority, organization
3. **Search**: Search findings by keywords
4. **Bulk Actions**: Select multiple findings for batch updates
5. **Export**: Export to PDF or Excel
6. **Statistics Panel**: Show summary metrics
7. **Progress Bar**: Visual indication of completion percentage
8. **Quick Actions**: Keyboard shortcuts for common operations
