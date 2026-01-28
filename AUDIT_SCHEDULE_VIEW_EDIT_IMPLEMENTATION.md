# Audit Schedule View and Edit Mode Implementation

## Overview
This document describes the implementation of separate view and edit modes for audit schedules, along with skeleton loaders for improved user experience.

## Problem Statement
Previously, the audit schedule page combined view and edit functionality in a single page, making it difficult to distinguish between viewing and editing states. The requirement was to:
1. Create a separate established view mode (read-only)
2. Have editing on a different page/route
3. Use the same components/patterns for creating and editing
4. Include skeleton loaders for all pages

## Solution Architecture

### New Components

#### 1. ScheduleSkeleton.jsx
**Purpose**: Loading state component for schedule pages

**Features**:
- Shows skeleton placeholders for all form fields
- Used during data loading in both view and edit pages
- Consistent with app's skeleton loader patterns
- Includes header, content card, and footer skeletons

**Location**: `src/components/ScheduleSkeleton.jsx`

#### 2. ScheduleViewPage.jsx
**Purpose**: Read-only view of audit schedule details

**Features**:
- Displays schedule information in organized sections:
  - Basic Information (title, description)
  - Audit Details (code, type, standard)
  - Status (ongoing/closed)
- Edit button navigates to edit page
- Delete option in menu dropdown
- Back button returns to schedules list
- Skeleton loader during data loading

**Location**: `src/pages/Schedules/ScheduleViewPage.jsx`

**Key Functions**:
- `handleEdit()` - Navigates to edit page
- `handleDelete()` - Confirms and deletes schedule
- `handleBack()` - Returns to schedules list

#### 3. ScheduleFormPage.jsx
**Purpose**: Unified form for creating and editing schedules

**Features**:
- **Create Mode** (`/audit-schedule/new`):
  - 3-step stepper: Basic Information → Audit Details → Review
  - Step-by-step validation
  - Review summary before submission
  - Redirects to view page after creation
  
- **Edit Mode** (`/audit-schedule/:id/edit`):
  - All fields shown at once (no stepper)
  - Pre-populated with existing data
  - Standard form validation
  - Returns to view page after saving

**Location**: `src/pages/Schedules/ScheduleFormPage.jsx`

**Key Functions**:
- `validateStep()` - Validates fields for current step (create mode)
- `validateAllFields()` - Validates all fields (edit mode)
- `handleNext()` - Advances to next step (create mode)
- `handlePrevious()` - Returns to previous step (create mode)
- `handleSubmit()` - Submits create or update
- `handleCancel()` - Navigates back appropriately

## Route Configuration

### Updated Routes in App.jsx

```javascript
// List all schedules
<Route path="/audit-schedules" element={<Schedules />} />

// Create new schedule (with stepper)
<Route path="/audit-schedule/new" element={<ScheduleFormPage />} />

// View schedule (read-only)
<Route path="/audit-schedule/:id" element={<ScheduleViewPage />} />

// Edit schedule (form without stepper)
<Route path="/audit-schedule/:id/edit" element={<ScheduleFormPage />} />
```

## Navigation Flow

```
┌─────────────┐
│ List View   │
│ /schedules  │
└─────┬───────┘
      │
      ├──[Create]──→ ┌──────────────┐
      │              │ Create Form  │
      │              │ /new         │
      │              │ (with steps) │
      │              └──────┬───────┘
      │                     │
      │                [Submit]
      │                     │
      ├──[View]────→ ┌──────▼───────┐
      │              │ View Page    │
      │              │ /:id         │
      │              │ (read-only)  │
      │              └──────┬───────┘
      │                     │
      │                [Edit]
      │                     │
      └──────────── ┌───────▼──────┐
                    │ Edit Form    │
                    │ /:id/edit    │
                    │ (all fields) │
                    └──────┬───────┘
                           │
                      [Save/Cancel]
                           │
                           ▼
                    (back to view)
```

## User Experience

### Create Schedule Flow
1. User clicks "Create New Schedule" button
2. Navigates to `/audit-schedule/new`
3. Sees 3-step stepper
4. Fills Basic Information (step 1)
5. Clicks "Next", fills Audit Details (step 2)
6. Clicks "Next", reviews summary (step 3)
7. Clicks "Create Audit Schedule"
8. Redirected to view page of newly created schedule

### View Schedule
1. User clicks schedule from list
2. Navigates to `/audit-schedule/:id`
3. Sees read-only schedule information
4. Can click "Edit" to modify or "Delete" to remove

### Edit Schedule Flow
1. From view page, click "Edit" button
2. Navigates to `/audit-schedule/:id/edit`
3. Sees form with all fields (no stepper)
4. Fields pre-populated with existing data
5. Makes changes
6. Clicks "Save Changes"
7. Redirected back to view page

## Skeleton Loaders

### When Shown
- **View Page**: While loading schedule data from API
- **Edit Page**: While loading existing schedule data from API
- **Not Shown**: On create page (no data to load)

### Structure
The skeleton loader mimics the actual form structure:
- Header with back button and title
- Card with multiple form fields:
  - Title field
  - Description field (taller)
  - Audit Code field
  - Audit Type field
  - Standard field
  - Status badge
- Footer with action buttons

## Technical Details

### Component Logic

#### Mode Detection
```javascript
const isNewSchedule = id === "new";          // Create mode
const isEditMode = id && id !== "new";       // Edit mode
```

#### Stepper Control
```javascript
// Only show stepper for new schedules
{isNewSchedule && (
  <Stepper index={activeStep} colorScheme="brandPrimary" mb={6}>
    {/* ... */}
  </Stepper>
)}
```

#### Conditional Field Display
```javascript
// Edit mode: all fields at once
{isEditMode && (
  <>
    {/* All form fields */}
  </>
)}

// Create mode: step-by-step
{isNewSchedule && (
  <>
    {activeStep === 0 && /* Step 1 fields */}
    {activeStep === 1 && /* Step 2 fields */}
    {activeStep === 2 && /* Review */}
  </>
)}
```

### Context Integration

Uses `ScheduleProfileContext` for:
- `schedule` - Current schedule data
- `loading` - Loading state
- `saving` - Saving state
- `createSchedule()` - Create new schedule
- `updateSchedule()` - Update existing schedule
- `deleteSchedule()` - Delete schedule
- `initialScheduleData` - Default form values

### Validation

#### Required Fields
- Title
- Description
- Audit Code
- Audit Type

#### Optional Fields
- Standard

#### Validation Timing
- **Create Mode**: Validates each step before advancing
- **Edit Mode**: Validates all fields on submit
- **Real-time**: Clears field errors on user input

## Benefits

### For Users
1. **Clear Context**: Know immediately if viewing or editing
2. **Guided Creation**: Stepper breaks down complex form
3. **Quick Edits**: All fields visible when editing
4. **Visual Feedback**: Skeleton loaders reduce perceived wait time

### For Developers
1. **Separation of Concerns**: View and edit logic separated
2. **Reusability**: Single form component handles both create and edit
3. **Consistency**: Follows patterns from Teams and Users pages
4. **Maintainability**: Clear component boundaries

### For System
1. **Performance**: Lazy loading of edit form
2. **Security**: Read-only view mode prevents accidental changes
3. **Analytics**: Can track view vs edit vs create separately

## Testing

### Manual Test Cases

#### Create Flow
- [ ] Navigate to create page
- [ ] Stepper displays correctly
- [ ] Step 1 validation works
- [ ] Step 2 validation works
- [ ] Review shows correct data
- [ ] Submit creates schedule
- [ ] Redirects to view page

#### View Flow
- [ ] Navigate to view page
- [ ] Data displays correctly
- [ ] Edit button navigates to edit page
- [ ] Delete button works with confirmation

#### Edit Flow
- [ ] Navigate to edit page
- [ ] Data pre-populates correctly
- [ ] All fields editable
- [ ] Validation works
- [ ] Save updates schedule
- [ ] Redirects to view page
- [ ] Cancel returns to view page

#### Loading States
- [ ] Skeleton shows on view page during load
- [ ] Skeleton shows on edit page during load
- [ ] No skeleton on create page (expected)

## Future Enhancements

### Potential Improvements
1. **Autosave**: Save draft while filling form
2. **History**: Track changes to schedule
3. **Permissions**: Different view/edit permissions per user
4. **Comments**: Add discussion thread to view page
5. **Attachments**: Link documents to schedule
6. **Notifications**: Alert users of changes

### Code Optimizations
1. **Shared Components**: Extract common form fields
2. **Custom Hooks**: Create useScheduleForm hook
3. **Type Safety**: Add TypeScript definitions
4. **Testing**: Add unit and integration tests

## Migration Guide

### For Existing Code
If you had bookmarks or links to old schedule pages:

**Old Pattern**:
```javascript
/audit-schedule/new     // Both create and view
/audit-schedule/:id     // Edit mode with stepper
```

**New Pattern**:
```javascript
/audit-schedule/new         // Create only (with stepper)
/audit-schedule/:id         // View only (read-only)
/audit-schedule/:id/edit    // Edit only (no stepper)
```

### For API Consumers
No API changes required. The same endpoints are used:
- `POST /schedules` - Create
- `GET /schedules/:id` - Fetch
- `PUT /schedules/:id` - Update
- `DELETE /schedules/:id` - Delete

## Files Changed

### New Files
- `src/components/ScheduleSkeleton.jsx` (82 lines)
- `src/pages/Schedules/ScheduleViewPage.jsx` (232 lines)
- `src/pages/Schedules/ScheduleFormPage.jsx` (583 lines)

### Modified Files
- `src/App.jsx` (route changes)

### Removed Files
- `src/pages/Schedules/SchedulePage.jsx` (old combined view/edit)

### Total Impact
- **Lines Added**: ~900
- **Lines Removed**: ~500
- **Net Change**: +400 lines
- **Files Changed**: 4

## Conclusion

This implementation successfully separates view and edit modes for audit schedules, providing a clearer user experience and better code organization. The addition of skeleton loaders improves perceived performance, and the unified form component reduces code duplication between create and edit operations.
