# Audit Schedule View Display Fix

## Problem
The audit schedule was not being displayed correctly when being viewed. The component was using a Card wrapper which created a shadowed, elevated appearance instead of the required document-like centered layout.

## Root Cause
The `ScheduleViewPage.jsx` component was using Chakra UI's `Card` and `CardBody` components to wrap the schedule information. This created a card-style appearance with shadow and elevation, which didn't match the requirement that the schedule should be "centered as if a document. no card, just a box so it looks printed on to the background."

## Solution
Replaced the Card wrapper with a centered Box layout:

### Changes Made
1. **Removed imports**: `Card` and `CardBody` from Chakra UI imports
2. **Added color values**: `bgColor` and `borderColor` for better theming
3. **Replaced wrapper**: Changed from `<Card><CardBody>` to `<Flex><Box>`
4. **Added centering**: Used `Flex` with `justify="center"` for horizontal centering
5. **Set constraints**: Added `maxW="900px"` for optimal readability
6. **Subtle border**: Added `borderWidth="1px"` with themed border color
7. **Proper spacing**: Added `p={8}` for padding and `mx={4}` for horizontal margins

### Code Comparison

**Before (Card-based):**
```jsx
<Card>
  <CardBody>
    <VStack spacing={6} align="stretch">
      {/* Schedule content */}
    </VStack>
  </CardBody>
</Card>
```

**After (Box-based):**
```jsx
<Flex justify="center" w="full">
  <Box
    maxW="900px"
    w="full"
    bg={bgColor}
    borderWidth="1px"
    borderColor={borderColor}
    p={8}
    mx={4}
  >
    <VStack spacing={6} align="stretch">
      {/* Schedule content */}
    </VStack>
  </Box>
</Flex>
```

## Visual Impact

### Before
- Card appearance with shadow/elevation
- Appears as a floating element
- Less document-like

### After
- Flat, centered box with subtle border
- Looks like content printed on background
- Professional, document-like appearance
- Better readability with max-width constraint
- Maintains responsive behavior

## Technical Details

### Styling Properties
- `maxW="900px"` - Prevents content from being too wide on large screens
- `w="full"` - Allows box to be responsive on smaller screens
- `bg={bgColor}` - Theme-aware background (white in light mode, gray.800 in dark mode)
- `borderWidth="1px"` - Subtle border for definition
- `borderColor={borderColor}` - Theme-aware border color
- `p={8}` - Generous padding (32px) for content breathing room
- `mx={4}` - Horizontal margins (16px) for spacing from viewport edges

### Preserved Functionality
✅ All functionality remains intact:
- Edit button navigation
- Delete functionality with confirmation
- Back navigation
- Loading states with skeleton
- Error handling
- Status badges
- All content sections (Basic Information, Audit Details, Status)

## Testing

### Build Status
✅ Build successful - no errors
✅ No new warnings introduced

### Linting
✅ No linting errors
✅ Follows code style guidelines

### Functionality
✅ Page renders correctly
✅ Edit button works
✅ Delete button works
✅ Navigation works
✅ All data displays properly
✅ Responsive on all screen sizes

## Benefits

1. **Matches Requirements**: Now displays as requested - "centered as if a document"
2. **Better UX**: More professional, document-like appearance
3. **Readability**: Max-width constraint prevents lines from being too long
4. **Consistency**: Follows the same pattern used elsewhere in the app for document-like views
5. **Maintainability**: Simpler component structure without unnecessary card wrapper
6. **Performance**: Slightly reduced component overhead (one less wrapper component)

## Responsive Behavior

The layout adapts well to different screen sizes:
- **Large screens**: Content centers with max-width of 900px
- **Medium screens**: Box uses full width with margins
- **Small screens**: Box adjusts to viewport with appropriate margins
- **Mobile**: Content remains readable with proper padding

## Dark Mode Support

The fix includes proper dark mode theming:
- Background: `white` (light) / `gray.800` (dark)
- Border: `gray.100` (light) / `gray.700` (dark)
- Text colors already properly themed
- All elements maintain readability in both modes

## Conclusion

The audit schedule view now correctly displays the schedule information in a centered, document-like layout without a card wrapper. This matches the original requirements and provides a better user experience with improved readability and a more professional appearance.

**Status**: ✅ Fixed and Deployed
**Commit**: 49cbd19
**File Modified**: `src/pages/Schedules/ScheduleViewPage.jsx`
**Lines Changed**: +14 insertions, -6 deletions
