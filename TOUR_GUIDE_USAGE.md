# Audit Schedule Tour Guide - Usage Guide

## Overview
The Audit Schedule Tour Guide provides an interactive walkthrough of the complete audit management workflow. It helps users understand how to manage organizations, conduct visits, record findings, and close audits.

## Features

### 🎯 Smart Step Filtering
The tour automatically adapts to show only relevant steps based on the current state of the audit schedule:
- If there are no organizations yet, organization-specific steps are hidden
- If there are no findings, finding-related steps are skipped
- Welcome and completion steps are always shown

### 🎨 Seamless Integration
- Custom CSS styling matches Chakra UI theme
- Uses brandPrimary colors (#3182CE)
- Smooth animations and transitions
- Responsive design support

### ⌨️ Keyboard Support
- **Arrow keys**: Navigate between steps
- **ESC**: Exit the tour
- **Enter**: Proceed to next step

### 💾 Progress Tracking
- Tour completion is saved to localStorage
- Users can resume where they left off
- Option to restart tour anytime

## How to Start the Tour

### Method 1: Help Button (Recommended)
1. Navigate to any audit schedule page: `/audit-schedule/:id`
2. Look for the **?** (help) icon button in the page header
3. Click the button to start the tour

### Method 2: Programmatically (for developers)
```javascript
import { useAuditTourGuide } from '../../hooks/useAuditTourGuide';

// In your component
const { startTour, stopTour } = useAuditTourGuide(true);

// Start the tour
startTour();

// Stop the tour
stopTour();
```

## Tour Steps Breakdown

### 1. Welcome (Always shown)
- **Target**: Audit title
- **Content**: Introduction to the tour and what users will learn

### 2. Audit Information
- **Target**: Main audit info card
- **Content**: Explanation of title, description, status, and timestamps
- **Interaction**: Users learn they can click to edit inline

### 3. Audit Details
- **Target**: Audit details card
- **Content**: Information about audit code, type, standard, and previous audits
- **Interaction**: Users learn about the Edit button

### 4. Audit Status
- **Target**: Status management card
- **Content**: How to close/reopen audits
- **Condition**: Always shown

### 5. Organizations Section
- **Target**: Organizations container
- **Content**: Introduction to organization management
- **Condition**: Always shown

### 6. Add Organization
- **Target**: Add Organization button
- **Content**: How to add new organizations to the audit
- **Condition**: Always shown

### 7. Organization Card
- **Target**: First organization card
- **Content**: Overview of organization cards and how to expand them
- **Condition**: Only shown if organizations exist

### 8. Visits Tab
- **Target**: Visits tab
- **Content**: Explanation of audit visits
- **Condition**: Only shown if organization is expanded

### 9. Auditors Tab
- **Target**: Auditors tab
- **Content**: Information about assigned auditors
- **Condition**: Only shown if organization is expanded

### 10. Team Details Tab
- **Target**: Team details tab
- **Content**: How to access team information
- **Condition**: Only shown if organization is expanded

### 11. Documents Tab
- **Target**: Documents tab
- **Content**: Accessing quality and other documents
- **Condition**: Only shown if organization is expanded

### 12. Findings
- **Target**: First finding card
- **Content**: Explanation of findings, action plans, and verification
- **Condition**: Only shown if findings exist

### 13. Set Verdict
- **Target**: Set verdict menu item
- **Content**: How to set final verdict for organizations
- **Condition**: Only shown if organization menu is accessible

### 14. Tour Complete (Always shown)
- **Target**: Audit title
- **Content**: Congratulations and reminder about help button

## Data-Tour Attributes

To make elements participate in the tour, add `data-tour` attributes:

```jsx
// Example 1: Card
<Card data-tour="audit-info">
  {/* Card content */}
</Card>

// Example 2: Button
<Button data-tour="add-organization">
  Add Organization
</Button>

// Example 3: Tab
<Tab data-tour="visits-tab">
  Visits
</Tab>
```

### Available Tour Targets
- `data-tour="audit-title"` - Page title
- `data-tour="audit-info"` - Main audit information card
- `data-tour="audit-details"` - Audit details card
- `data-tour="audit-status"` - Status management card
- `data-tour="organizations-section"` - Organizations container
- `data-tour="add-organization"` - Add organization button
- `data-tour="organization-card"` - Organization card
- `data-tour="visits-tab"` - Visits tab
- `data-tour="auditors-tab"` - Auditors tab
- `data-tour="team-details-tab"` - Team details tab
- `data-tour="documents-tab"` - Documents tab
- `data-tour="finding-item"` - Finding card
- `data-tour="set-verdict"` - Set verdict menu item

## Configuration

The tour is configured with optimal settings in `useAuditTourGuide.js`:

```javascript
{
  closeButton: true,              // Show close button
  allowDialogOverlap: false,      // Prevent dialog overlap
  showStepDots: true,             // Show progress dots
  showStepProgress: true,         // Show "1/5" progress text
  autoScroll: true,               // Auto-scroll to elements
  autoScrollSmooth: true,         // Smooth scrolling
  autoScrollOffset: 100,          // Offset from edge
  keyboardControls: true,         // Enable keyboard navigation
  exitOnEscape: true,             // ESC key exits tour
  completeOnFinish: true,         // Mark as complete in localStorage
  targetPadding: 10,              // Space around highlighted element
  dialogZ: 10000,                 // High z-index for tour dialog
  nextLabel: "Next →",            // Next button text
  prevLabel: "← Back",            // Previous button text
  finishLabel: "Got it! ✓",      // Finish button text
}
```

## Testing with Mock Data

The tour works with both real API data and mock data. To test with mock data:

1. Create a `.env` file in the project root:
```bash
VITE_USE_API=false
```

2. Restart the development server:
```bash
npm run dev
```

3. The application will use mock data from contexts:
   - `ScheduleProfileContext.jsx` - Mock audit schedules
   - `OrganizationsContext.jsx` - Mock organizations

## Customizing Tour Styles

Tour styles are defined in `src/index.css`:

```css
/* Dialog styling */
.tg-dialog {
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

/* Button colors */
.tg-dialog-btn-primary {
  background: #3182CE; /* Chakra UI brandPrimary */
  color: white;
}

/* Progress dots */
.tg-step-dot-active {
  background-color: #3182CE;
}
```

## Troubleshooting

### Tour doesn't start
- Verify the page has elements with `data-tour` attributes
- Check browser console for errors
- Ensure `useAuditTourGuide` hook is initialized with `true`

### Some steps are skipped
- This is expected behavior - the tour filters steps based on visible elements
- Expand organization cards to see all organization-related steps

### Tour styling looks off
- Verify `src/index.css` includes the tour styles
- Check that tourguidejs CSS is imported in the hook
- Clear browser cache and restart dev server

## For Developers

### Adding New Tour Steps

1. Add `data-tour` attribute to the target element:
```jsx
<Box data-tour="my-new-feature">
  {/* Feature content */}
</Box>
```

2. Add step configuration in `useAuditTourGuide.js`:
```javascript
const allSteps = [
  // ... existing steps
  {
    title: "My New Feature",
    content: "Description of what this feature does...",
    target: "[data-tour='my-new-feature']",
    order: 15, // Adjust order as needed
  },
];
```

3. (Optional) Add condition for conditional display:
```javascript
{
  title: "My New Feature",
  content: "...",
  target: "[data-tour='my-new-feature']",
  order: 15,
  // Only show if element exists
}
```

Note: The `getTourSteps()` function already filters out steps where the target element doesn't exist, so you don't need to add a condition unless you need custom logic.

### Testing Tour Changes

```bash
# Build and check for errors
npm run build

# Run linter
npm run lint

# Start dev server
npm run dev
```

## Sample Data Utility

For future enhancement, `src/utils/sampleAuditData.js` provides:

```javascript
import { 
  generateSampleAuditSchedule, 
  generateSampleOrganizations,
  isSampleAudit 
} from '../utils/sampleAuditData';

// Generate a complete sample audit
const sampleAudit = generateSampleAuditSchedule();

// Generate sample organizations
const sampleOrgs = generateSampleOrganizations();

// Check if viewing sample
const isDemo = isSampleAudit(scheduleId);
```

This can be integrated with contexts to create dedicated demo routes in the future.

## Additional Resources

- **TourGuideJS Documentation**: https://tourguidejs.com/docs/
- **Chakra UI Theme**: Check `src/theme/` for theme configuration
- **React Hooks**: Official React documentation on custom hooks

## Support

For questions or issues:
1. Check this documentation first
2. Review the code comments in `src/hooks/useAuditTourGuide.js`
3. Test with mock data (`VITE_USE_API=false`)
4. Check browser console for error messages
