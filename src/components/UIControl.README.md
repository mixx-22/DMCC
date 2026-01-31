# UIControl Component

A generic wrapper component that controls UI element visibility, enabled/disabled state, and editable/read-only state based on business rules.

## Overview

The `UIControl` component provides a declarative way to control UI element states based on:
- Current audit schedule status
- Current organization status
- Current visit
- Item type
- Centralized configuration

⚠️ **No business logic in JSX** - All logic lives in pure functions and configuration files.

## Features

- ✅ **Visibility Control** - Show/hide elements based on rules
- ✅ **Enabled/Disabled Control** - Enable or disable interactive elements
- ✅ **Editable/Read-only Control** - Make form elements read-only
- ✅ **Declarative Configuration** - Business rules defined in config, not JSX
- ✅ **Pure Functions** - All logic is testable and maintainable
- ✅ **Render Props Pattern** - Advanced control when needed
- ✅ **Context Integration** - Works with existing React contexts
- ✅ **Fallback Support** - Custom UI when elements are hidden

## Installation

The component is already installed in this project. The following files are included:

```
src/
├── components/UIControl.jsx          # Main wrapper component
├── config/uiControlConfig.js         # Declarative configuration
├── helpers/uiControlHelpers.js       # Pure helper functions
└── hooks/useUIControl.js             # Custom hooks for easy usage
```

## Basic Usage

### Simple Wrapper

```jsx
import UIControl from "../components/UIControl";

function MyComponent({ schedule, organization }) {
  return (
    <UIControl
      auditSchedule={schedule}
      organization={organization}
      itemType="schedule_details"
    >
      <Button>Edit Schedule</Button>
    </UIControl>
  );
}
```

### With Fallback

```jsx
<UIControl
  auditSchedule={schedule}
  itemType="document_upload"
  fallback={<Text>Document upload not available</Text>}
>
  <Button>Upload Document</Button>
</UIControl>
```

### Render Props Pattern

For advanced control, use the render props pattern:

```jsx
<UIControl
  auditSchedule={schedule}
  organization={organization}
  itemType="organization_details"
>
  {({ visible, enabled, editable, readOnly }) => (
    <FormControl>
      <Input 
        isDisabled={!enabled} 
        isReadOnly={readOnly}
        placeholder="Team Name" 
      />
      {!editable && <Text color="orange.500">Read-only mode</Text>}
    </FormControl>
  )}
</UIControl>
```

## Using Custom Hooks

### useUIControl Hook

Get control states from context or provided values:

```jsx
import { useUIControl } from "../hooks/useUIControl";

function MyComponent() {
  const controls = useUIControl('organization_details');
  
  if (!controls.visible) return null;
  
  return (
    <Button isDisabled={!controls.enabled}>
      Edit Organization
    </Button>
  );
}
```

### useUIControlState Hook

Destructure states directly:

```jsx
import { useUIControlState } from "../hooks/useUIControl";

function MyComponent() {
  const [visible, enabled, editable, readOnly] = useUIControlState('schedule_details');
  
  return <Input isDisabled={!enabled} isReadOnly={readOnly} />;
}
```

### useUIControlAction Hook

Check if specific actions are allowed:

```jsx
import { useUIControlAction } from "../hooks/useUIControl";

function DeleteButton() {
  const canEdit = useUIControlAction('organization_details', 'edit');
  
  if (!canEdit) return null;
  
  return <Button colorScheme="red">Delete</Button>;
}
```

## Configuration

### Item Types

Item types are defined in `src/config/uiControlConfig.js`:

```javascript
export const ITEM_TYPES = {
  SCHEDULE_DETAILS: "schedule_details",
  ORGANIZATION_DETAILS: "organization_details",
  VISIT_DETAILS: "visit_details",
  FINDING_DETAILS: "finding_details",
  DOCUMENT_UPLOAD: "document_upload",
  VERDICT: "verdict",
  AUDIT_ACTIONS: "audit_actions",
  GENERAL: "general",
};
```

### Adding New Rules

To add a new item type rule, edit `src/config/uiControlConfig.js`:

```javascript
export const UI_CONTROL_RULES = {
  // Add your new item type here
  [ITEM_TYPES.MY_NEW_TYPE]: {
    visible: (ctx) => true,
    enabled: (ctx) => ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING,
    editable: (ctx) => ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING,
  },
  // ... existing rules
};
```

### Rule Context

Each rule function receives a context object:

```typescript
{
  auditSchedule: { _id, status, ... },
  organization: { _id, status, team, visits, ... },
  visit: { date, findings, ... },
  itemType: string
}
```

## API Reference

### UIControl Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `auditSchedule` | `Object` | Yes | Audit schedule with `_id` and `status` |
| `organization` | `Object` | No | Organization object |
| `visit` | `Object` | No | Visit object |
| `itemType` | `String` | Yes | Type of item being controlled |
| `children` | `Node\|Function` | Yes | Elements to wrap or render function |
| `fallback` | `Node` | No | Content to show when not visible |
| `hideWhenNotVisible` | `Boolean` | No | Hide (null) when not visible (default: true) |
| `showDisabledState` | `Boolean` | No | Apply disabled state (default: true) |
| `showReadOnlyState` | `Boolean` | No | Apply read-only state (default: true) |

### Helper Functions

#### `isVisible(context)`
Returns `true` if the item should be visible.

#### `isEnabled(context)`
Returns `true` if the item should be enabled.

#### `isEditable(context)`
Returns `true` if the item should be editable.

#### `isReadOnly(context)`
Returns `true` if the item should be read-only.

#### `getControlStates(context)`
Returns object with all control states: `{ visible, enabled, editable, readOnly }`.

#### `buildContext({ auditSchedule, organization, visit, itemType })`
Builds a context object for passing to helper functions.

## Demo

Visit `/demo/ui-control` to see a live interactive demo of the component.

The demo shows:
- Different item types and their rules
- Real-time updates when status changes
- Various usage patterns (wrapper, render props)
- Control state visualization

Screenshots:
- [ONGOING state](https://github.com/user-attachments/assets/560a7768-7bbe-42df-9ca2-42f6aeb81e74)
- [CLOSED state](https://github.com/user-attachments/assets/2ce12460-0f84-4ba4-b6ce-9911b0ac3449)

## Business Rules

### Status Constants

```javascript
AUDIT_STATUS = {
  ONGOING: 0,
  CLOSED: 1,
}

ORG_STATUS = {
  ONGOING: 0,
  CLOSED: 1,
}
```

### Default Rules

- **Schedule Details**: Editable only when schedule is ONGOING
- **Organization Details**: Editable when both schedule AND organization are ONGOING
- **Visit Details**: Editable when both schedule AND organization are ONGOING
- **Finding Details**: Editable when both schedule AND organization are ONGOING
- **Document Upload**: Visible if schedule OR org is ONGOING, enabled if both are ONGOING
- **Verdict**: Always visible, editable only when schedule is ONGOING
- **Audit Actions**: Always visible and enabled
- **General**: Enabled only when schedule is ONGOING

## Best Practices

1. **Keep Business Logic Out of JSX**
   - Define all rules in configuration files
   - Use pure functions for logic
   - JSX should only render UI

2. **Use Appropriate Item Types**
   - Choose specific item types over GENERAL
   - Create new item types when needed
   - Document custom rules

3. **Provide Fallbacks**
   - Show meaningful messages when elements are hidden
   - Guide users on why something is not available

4. **Test Rules Thoroughly**
   - Test each item type with different statuses
   - Verify disabled/read-only states work correctly
   - Check visibility conditions

5. **Context Integration**
   - Use hooks when context is available
   - Pass explicit values in demo/test pages
   - Handle missing context gracefully

## Troubleshooting

### Component not responding to status changes
- Ensure audit schedule and organization objects are properly passed
- Check that status values are numbers (0 or 1), not strings
- Verify itemType matches a configured type

### Elements not becoming disabled
- Set `showDisabledState={true}` (default)
- Check that child components support `isDisabled` prop
- For non-Chakra components, check for `disabled` prop support

### Context errors
- When using hooks, ensure component is wrapped in required providers
- In demo pages, pass values explicitly instead of using hooks
- Check `src/App.jsx` for provider structure

## Contributing

When adding new features:

1. Add new item types to `ITEM_TYPES` constant
2. Define rules in `UI_CONTROL_RULES`
3. Update this documentation
4. Add examples to the demo page
5. Test with different status combinations

## License

Internal use only for DMCC project.
