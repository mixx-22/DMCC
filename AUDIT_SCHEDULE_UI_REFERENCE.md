# Audit Schedule UI Views - Visual Reference

## Overview
This document provides a visual reference for the three different views of audit schedules: List, View (read-only), and Form (create/edit).

---

## 1. List View (`/audit-schedules`)

**Purpose**: Browse and search existing audit schedules

```
┌──────────────────────────────────────────────────────────────────┐
│ Audit Schedules                        [Create New Schedule]     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ [🔍 Search schedules...]                                         │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Title              │ Code      │ Type      │ Status         │  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │ Annual Audit 2024  │ AUD-2024  │ Financial │ 🔵 Ongoing    │  │
│ │ Q3 Compliance      │ COM-2024  │ Compliance│ 🟢 Closed     │  │
│ │ Internal Review    │ INT-2024  │ Internal  │ 🔵 Ongoing    │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ Showing 1-3 of 3                                    [< 1 2 3 >]  │
└──────────────────────────────────────────────────────────────────┘
```

**Features**:
- Search bar for filtering
- Table with sortable columns
- Status badges (color-coded)
- Pagination
- Click on row navigates to View page

---

## 2. View Page (`/audit-schedule/:id`)

**Purpose**: Read-only display of schedule details

```
┌──────────────────────────────────────────────────────────────────┐
│ [←] Annual Financial Audit 2024          [Edit] [⋮ Menu]         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Basic Information                                           │  │
│ │                                                             │  │
│ │ Title                                                       │  │
│ │ Annual Financial Audit 2024                                │  │
│ │                                                             │  │
│ │ Description                                                 │  │
│ │ Comprehensive audit of financial statements and controls   │  │
│ │ for the fiscal year 2024. Includes testing of internal    │  │
│ │ controls and compliance verification.                      │  │
│ │                                                             │  │
│ │ ───────────────────────────────────────────────────────    │  │
│ │                                                             │  │
│ │ Audit Details                                               │  │
│ │                                                             │  │
│ │ Audit Code                                                  │  │
│ │ AUD-2024-001                                               │  │
│ │                                                             │  │
│ │ Audit Type                                                  │  │
│ │ Financial Audit                                            │  │
│ │                                                             │  │
│ │ Standard                                                    │  │
│ │ ISO 9001                                                    │  │
│ │                                                             │  │
│ │ ───────────────────────────────────────────────────────    │  │
│ │                                                             │  │
│ │ Status                                                      │  │
│ │                                                             │  │
│ │ Current Status                                              │  │
│ │ 🔵 Ongoing                                                  │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Features**:
- Back button (returns to list)
- Edit button (navigates to edit page)
- Menu with Delete option
- Organized sections with dividers
- Read-only text display
- Status badge

**Menu Options**:
- 🗑️ Delete Schedule

---

## 3. Create Page (`/audit-schedule/new`)

**Purpose**: Create new audit schedule with step-by-step guidance

```
┌──────────────────────────────────────────────────────────────────┐
│ [←] Create New Audit Schedule                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ① Basic Information ───── ② Audit Details ───── ③ Review        │
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔                                              │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Basic Information                                           │  │
│ │                                                             │  │
│ │ Title *                                                     │  │
│ │ [e.g., Annual Financial Audit 2024____________]            │  │
│ │                                                             │  │
│ │ Description *                                               │  │
│ │ [Describe the purpose and scope of this audit_]            │  │
│ │ [_____________________________________________]            │  │
│ │ [_____________________________________________]            │  │
│ │ [_____________________________________________]            │  │
│ │                                                             │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ [Cancel]                                            [Next →]     │
└──────────────────────────────────────────────────────────────────┘

(After clicking Next →)

┌──────────────────────────────────────────────────────────────────┐
│ [←] Create New Audit Schedule                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ✓ Basic Information ───── ② Audit Details ───── ③ Review        │
│                           ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔                        │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Audit Details                                               │  │
│ │                                                             │  │
│ │ Audit Code *                                                │  │
│ │ [e.g., AUD-2024-001_______________________]                │  │
│ │ Unique identifier for this audit schedule                  │  │
│ │                                                             │  │
│ │ Audit Type *                                                │  │
│ │ [Select audit type ▼]                                       │  │
│ │   - Internal Audit                                          │  │
│ │   - External Audit                                          │  │
│ │   - Compliance Audit                                        │  │
│ │   - Financial Audit                                         │  │
│ │   - Operational Audit                                       │  │
│ │                                                             │  │
│ │ Standard                                                    │  │
│ │ [e.g., ISO 9001, SOX, ISO 27001___________]                │  │
│ │ The audit standard or framework (optional)                 │  │
│ │                                                             │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ [Cancel]                                 [← Previous] [Next →]   │
└──────────────────────────────────────────────────────────────────┘

(After clicking Next → again)

┌──────────────────────────────────────────────────────────────────┐
│ [←] Create New Audit Schedule                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ✓ Basic Information ───── ✓ Audit Details ───── ③ Review        │
│                                                 ▔▔▔▔▔▔▔          │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Review                                                      │  │
│ │                                                             │  │
│ │ Review Your Audit Schedule                                  │  │
│ │ ┌────────────────────────────────────────────────────────┐ │  │
│ │ │ Title:        Annual Financial Audit 2024              │ │  │
│ │ │ Audit Code:   AUD-2024-001                             │ │  │
│ │ │ Type:         Financial Audit                          │ │  │
│ │ │ Standard:     ISO 9001                                 │ │  │
│ │ │ Status:       🔵 Ongoing                               │ │  │
│ │ └────────────────────────────────────────────────────────┘ │  │
│ │                                                             │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ [Cancel]                        [← Previous] [Create Schedule]   │
└──────────────────────────────────────────────────────────────────┘
```

**Features**:
- 3-step stepper with progress indicator
- Visual feedback for completed steps (✓)
- Step-by-step validation
- Review summary at the end
- Previous/Next navigation
- Required field indicators (*)
- Helper text for fields

---

## 4. Edit Page (`/audit-schedule/:id/edit`)

**Purpose**: Edit existing audit schedule

```
┌──────────────────────────────────────────────────────────────────┐
│ [←] Edit Audit Schedule                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Basic Information                                           │  │
│ │                                                             │  │
│ │ Title *                                                     │  │
│ │ [Annual Financial Audit 2024_______________]               │  │
│ │                                                             │  │
│ │ Description *                                               │  │
│ │ [Comprehensive audit of financial statements]              │  │
│ │ [and controls for the fiscal year 2024.___]              │  │
│ │ [Includes testing of internal controls____]              │  │
│ │ [and compliance verification._____________]              │  │
│ │                                                             │  │
│ │ Audit Details                                               │  │
│ │                                                             │  │
│ │ Audit Code *                                                │  │
│ │ [AUD-2024-001_________________________]                    │  │
│ │ Unique identifier for this audit schedule                  │  │
│ │                                                             │  │
│ │ Audit Type *                                                │  │
│ │ [Financial Audit ▼]                                         │  │
│ │                                                             │  │
│ │ Standard                                                    │  │
│ │ [ISO 9001_____________________________]                    │  │
│ │ The audit standard or framework (optional)                 │  │
│ │                                                             │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ [Cancel]                                        [💾 Save Changes] │
└──────────────────────────────────────────────────────────────────┘
```

**Features**:
- No stepper (all fields visible at once)
- Pre-populated fields with existing data
- Same fields as create form
- Save Changes button
- Cancel returns to view page

---

## 5. Loading State (Skeleton)

**Purpose**: Show loading placeholder while fetching data

```
┌──────────────────────────────────────────────────────────────────┐
│ [▢] ████████████████                                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ████                                                        │  │
│ │ ███████████████████████████████████████████████████        │  │
│ │                                                             │  │
│ │ ██████                                                      │  │
│ │ ███████████████████████████████████████████████████        │  │
│ │ ███████████████████████████████████████████████████        │  │
│ │ ███████████████████████████████████████████████████        │  │
│ │                                                             │  │
│ │ ████████                                                    │  │
│ │ ███████████████████████████████████████████████████        │  │
│ │                                                             │  │
│ │ ████████                                                    │  │
│ │ ███████████████████████████████████████████████████        │  │
│ │                                                             │  │
│ │ ████████                                                    │  │
│ │ ███████████████████████████████████████████████████        │  │
│ │                                                             │  │
│ │ ██████                                                      │  │
│ │ ███████████████                                             │  │
│ │                                                             │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ █████████                                    ███████████████     │
└──────────────────────────────────────────────────────────────────┘
```

**When Shown**:
- View page while loading schedule data
- Edit page while loading existing schedule
- Not shown on create page (no data to load)

---

## Key Differences Summary

| Feature | List | View | Create | Edit |
|---------|------|------|--------|------|
| **Route** | `/audit-schedules` | `/:id` | `/new` | `/:id/edit` |
| **Purpose** | Browse | Display | Create | Modify |
| **Mode** | Read-only | Read-only | Input | Input |
| **Stepper** | ❌ | ❌ | ✅ (3 steps) | ❌ |
| **Fields** | Summary | All (display) | Step-by-step | All at once |
| **Actions** | Search, Create | Edit, Delete | Next, Submit | Save, Cancel |
| **Navigation** | Click row | Edit button | Cancel → list | Cancel → view |
| **Skeleton** | Table rows | ✅ | ❌ | ✅ |

---

## Color Coding

### Status Badges
- 🔵 **Ongoing** - Blue badge (`colorScheme="blue"`)
- 🟢 **Closed** - Green badge (`colorScheme="green"`)

### Stepper States
- **Completed Step**: ✓ Green checkmark
- **Active Step**: Blue number with bold title
- **Incomplete Step**: Gray number with normal title

### Buttons
- **Primary Actions**: Blue button (`colorScheme="brandPrimary"`)
  - Create, Save, Next, Edit
- **Secondary Actions**: Outline button
  - Previous
- **Danger Actions**: Red color
  - Delete (in menu)

---

## Responsive Behavior

All views are responsive and adapt to different screen sizes:

### Mobile (< 768px)
- Stepper may stack vertically
- Form fields take full width
- Menu buttons may collapse to icons
- Table scrolls horizontally

### Tablet (768px - 1024px)
- Stepper displays horizontally
- Two-column layout where appropriate
- Full button labels visible

### Desktop (> 1024px)
- Optimal spacing and layout
- All features visible
- Maximum content width with centered alignment

---

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter to submit forms
- Escape to close modals
- Arrow keys in dropdowns

### Screen Readers
- ARIA labels on all buttons and inputs
- Proper heading hierarchy (H1 → H2 → H3)
- Status announcements for loading states
- Form validation error announcements

### Visual
- High contrast text and backgrounds
- Focus indicators on all interactive elements
- Clear visual hierarchy
- Consistent color usage

---

## User Journey Examples

### Creating a New Schedule
1. **Start**: User on List view
2. **Click**: "Create New Schedule" button
3. **Navigate**: To Create page with stepper (Step 1)
4. **Fill**: Basic information (title, description)
5. **Click**: "Next" button
6. **Navigate**: To Step 2 (Audit Details)
7. **Fill**: Audit code, type, standard
8. **Click**: "Next" button
9. **Navigate**: To Step 3 (Review)
10. **Review**: All entered information
11. **Click**: "Create Audit Schedule" button
12. **Navigate**: To View page of newly created schedule
13. **Success**: Toast notification appears

### Viewing and Editing
1. **Start**: User on List view
2. **Click**: Schedule row
3. **Navigate**: To View page
4. **Read**: Schedule information
5. **Click**: "Edit" button
6. **Navigate**: To Edit page
7. **Modify**: Fields as needed
8. **Click**: "Save Changes" button
9. **Navigate**: Back to View page
10. **Success**: Toast notification appears

### Quick Delete
1. **Start**: User on View page
2. **Click**: Menu button (⋮)
3. **Click**: "Delete Schedule" option
4. **Confirm**: In confirmation dialog
5. **Navigate**: Back to List view
6. **Success**: Schedule removed from list

---

## Notes for Developers

### Component Reuse
- `ScheduleFormPage` is used for both create and edit
- Detects mode via `id === "new"` check
- Stepper only rendered for create mode
- Same validation logic for both modes

### State Management
- Uses `ScheduleProfileContext` for data
- Local state for form data and validation
- Loading state triggers skeleton display
- Saving state disables submit button

### Navigation
- React Router's `useNavigate` hook
- Programmatic navigation after actions
- Preserves browser history
- Back button works as expected

### Styling
- Chakra UI components throughout
- Consistent spacing and sizing
- Color tokens from theme
- Responsive by default

---

This visual reference provides a complete overview of all audit schedule views and their functionality. Use it as a guide for understanding the user interface and user experience.
