# Fix: Empty Card on Create Schedule Page

## Issue Description

When navigating to `/audit-schedule/new` to create a new audit schedule, the page was displaying only an empty card with no form fields, stepper, or any interactive elements visible.

## Root Cause Analysis

### The Problem

The Stepper component was being rendered in an incorrect position in the component hierarchy:

```jsx
<Box>
  <PageHeader>...</PageHeader>           // ← Uses Portal
  
  {isNewSchedule && (
    <Stepper>...</Stepper>               // ← PROBLEM: Between Portal and Card
  )}
  
  <Card>
    <CardBody>
      <VStack>...</VStack>                // ← Form content here
    </CardBody>
  </Card>
</Box>
```

### Why This Caused Issues

1. **Portal Behavior**: The `PageHeader` component uses Chakra UI's `Portal` to render its content outside the normal DOM tree (specifically, into a ref container managed by the Layout component).

2. **Content Flow Disruption**: Because PageHeader's content is portaled away, the Stepper was left in an awkward position between the portaled header and the Card, disrupting the normal content flow.

3. **Layout Context**: The Layout component wraps page content with padding and max-width constraints. Content rendered between portaled elements and the main content can end up outside these constraints or with incorrect positioning.

4. **Empty Card**: The Card component was rendering, but the VStack inside it had no visible content because the conditional rendering logic was evaluating correctly, but the layout was broken.

## The Solution

Move the Stepper component inside the Card component, making it part of the card's content:

```jsx
<Box>
  <PageHeader>...</PageHeader>           // ← Uses Portal (stays the same)
  
  <Card>
    <CardBody>
      {isNewSchedule && (
        <Stepper>...</Stepper>           // ✅ FIXED: Inside Card
      )}
      <VStack>...</VStack>                // ← Form content follows
    </CardBody>
  </Card>
</Box>
```

### Changes Made

**File**: `src/pages/Schedules/ScheduleFormPage.jsx`

**Before** (line ~230):
```jsx
{isNewSchedule && (
  <Stepper index={activeStep} colorScheme="brandPrimary" mb={6}>
    {/* ... stepper content ... */}
  </Stepper>
)}

<Card>
  <CardBody>
    <VStack spacing={6} align="stretch">
      {/* form content */}
    </VStack>
  </CardBody>
</Card>
```

**After**:
```jsx
<Card>
  <CardBody>
    {isNewSchedule && (
      <Stepper index={activeStep} colorScheme="brandPrimary" mb={8}>
        {/* ... stepper content ... */}
      </Stepper>
    )}
    
    <VStack spacing={6} align="stretch">
      {/* form content */}
    </VStack>
  </CardBody>
</Card>
```

**Key Changes**:
- Moved Stepper inside `<CardBody>` before the `<VStack>`
- Changed `mb={6}` to `mb={8}` for better spacing from form content
- Maintained all conditional rendering logic (`{isNewSchedule && ...}`)
- Preserved all Stepper props and functionality

## Impact

### What Now Works ✅

1. **Visible Form**: The create schedule page now displays the form correctly
2. **Stepper Display**: The 3-step stepper is visible and properly positioned
3. **Step 1 Content**: "Basic Information" fields (Title, Description) are visible
4. **Step Navigation**: Next/Previous buttons work correctly
5. **Step 2 Content**: "Audit Details" fields appear when navigating to Step 2
6. **Step 3 Content**: "Review" summary appears on final step
7. **Form Validation**: All validation continues to work
8. **Form Submission**: Creating a schedule works as expected

### User Experience

**Before**: User sees an empty card, thinks the page is broken, cannot create schedules

**After**: User sees a clear 3-step wizard with:
- Progress indicator showing current step
- Form fields for the current step
- Clear navigation buttons
- Professional appearance

## Testing Checklist

- [x] Navigate to `/audit-schedule/new`
- [x] Verify stepper is visible with 3 steps
- [x] Verify Step 1 active and fields visible (Title, Description)
- [x] Enter data in Step 1 fields
- [x] Click "Next" button
- [x] Verify Step 2 active and fields visible (Audit Code, Type, Standard)
- [x] Enter data in Step 2 fields
- [x] Click "Next" button
- [x] Verify Step 3 active with review summary
- [x] Verify all entered data shown in review
- [x] Click "Create Audit Schedule" button
- [x] Verify schedule is created
- [x] Verify redirect to schedule view page

## Related Components

### PageHeader Component
- Uses `Portal` to render content outside normal DOM tree
- Managed by Layout component via `headerRef`
- This is why content between PageHeader and main content can have issues

### PageFooter Component
- Also uses `Portal` similar to PageHeader
- Content between PageFooter and main content would have similar issues

### Layout Component
- Provides refs for Portal targets (`headerRef`, `footerRef`)
- Wraps page content with padding and max-width
- Content should be rendered within the main content area, not between portals

## Best Practices Learned

1. **Portal Awareness**: Be cautious when positioning content around components that use Portals
2. **Card Content**: Content meant to be part of a card should always be inside `<CardBody>`
3. **Conditional Components**: When a component (like Stepper) is conditionally rendered, ensure it's in the correct content hierarchy
4. **Layout Testing**: Always test layout with actual content to catch positioning issues early

## Prevention

To prevent similar issues in the future:

1. **Keep Content Together**: Related UI elements should be in the same container
2. **Respect Portal Boundaries**: Don't put content between portaled components and main content
3. **Test Edge Cases**: Test conditional rendering in all states
4. **Follow Patterns**: Look at similar pages (Users, Teams) for layout patterns

## Additional Notes

### Why It Appeared to Work in Code

The logic was actually correct:
- `isNewSchedule === true` when `id === "new"` ✓
- `activeStep === 0` initially ✓
- Conditional `{isNewSchedule && ...}` evaluating to true ✓
- Form fields defined and should render ✓

The issue was purely layout/positioning, not logic. This is why it's important to test UI changes visually, not just verify logic.

### Similar Issues to Watch For

- Any content rendered between PageHeader and main content
- Any content rendered between PageFooter and main content
- Components using Portal without proper container management
- Conditional rendering of layout-affecting components

## Commit Information

**Commit**: ff13627
**Date**: 2026-01-28
**Files Changed**: 1 (src/pages/Schedules/ScheduleFormPage.jsx)
**Lines Changed**: 22 insertions, 22 deletions (net: 0, repositioned code)

## Status

✅ **FIXED** - The create schedule page now works correctly with all form fields and stepper visible.
