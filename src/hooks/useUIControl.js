import { useMemo } from "react";
import { getControlStates, buildContext } from "../helpers/uiControlHelpers";
import {
  useScheduleProfile,
  useOrganizations,
} from "../context/_useContext";

/**
 * Custom hook for accessing UI control logic
 * 
 * Automatically pulls audit schedule and organization from context
 * and returns control states for a given item type.
 * 
 * @param {string} itemType - The type of item to get controls for
 * @param {Object} options - Optional overrides
 * @param {Object} options.auditSchedule - Override audit schedule
 * @param {Object} options.organization - Override organization
 * @param {Object} options.visit - Specific visit object
 * @returns {Object} Control states: { visible, enabled, editable, readOnly }
 * 
 * @example
 * function MyComponent() {
 *   const controls = useUIControl('organization_details');
 *   
 *   return (
 *     <Button isDisabled={!controls.enabled}>
 *       Edit Organization
 *     </Button>
 *   );
 * }
 * 
 * @example
 * // With specific visit
 * function VisitForm({ visit }) {
 *   const controls = useUIControl('visit_details', { visit });
 *   
 *   return (
 *     <Input isReadOnly={controls.readOnly} />
 *   );
 * }
 */
export function useUIControl(itemType, options = {}) {
  // Get schedule from context
  const scheduleContext = useScheduleProfile?.() || {};
  const { schedule: contextSchedule } = scheduleContext;

  // Get organization from context
  const orgContext = useOrganizations?.() || {};
  const { currentOrganization: contextOrganization } = orgContext;

  // Use provided values or fall back to context
  const auditSchedule = options.auditSchedule || contextSchedule;
  const organization = options.organization || contextOrganization;
  const visit = options.visit || null;

  // Compute control states
  const controlStates = useMemo(() => {
    // If no schedule provided, return defaults (all true to avoid breaking UI)
    if (!auditSchedule) {
      return {
        visible: true,
        enabled: true,
        editable: true,
        readOnly: false,
      };
    }

    const context = buildContext({
      auditSchedule,
      organization,
      visit,
      itemType,
    });

    return getControlStates(context);
  }, [auditSchedule, organization, visit, itemType]);

  return controlStates;
}

/**
 * Hook variant that returns individual boolean values
 * instead of an object
 * 
 * @param {string} itemType - The type of item to get controls for
 * @param {Object} options - Optional overrides
 * @returns {Array} [visible, enabled, editable, readOnly]
 * 
 * @example
 * function MyComponent() {
 *   const [visible, enabled, editable, readOnly] = useUIControlState('schedule_details');
 *   
 *   if (!visible) return null;
 *   
 *   return <Input isDisabled={!enabled} isReadOnly={readOnly} />;
 * }
 */
export function useUIControlState(itemType, options = {}) {
  const { visible, enabled, editable, readOnly } = useUIControl(
    itemType,
    options,
  );
  return [visible, enabled, editable, readOnly];
}

/**
 * Hook to check if user can perform a specific action
 * 
 * @param {string} itemType - The type of item
 * @param {string} action - The action: 'view', 'edit', or 'interact'
 * @param {Object} options - Optional overrides
 * @returns {boolean} True if the action is allowed
 * 
 * @example
 * function DeleteButton() {
 *   const canDelete = useUIControlAction('organization_details', 'edit');
 *   
 *   if (!canDelete) return null;
 *   
 *   return <Button>Delete</Button>;
 * }
 */
export function useUIControlAction(itemType, action = "view", options = {}) {
  const controls = useUIControl(itemType, options);

  switch (action) {
    case "view":
      return controls.visible;
    case "edit":
      return controls.visible && controls.enabled && controls.editable;
    case "interact":
      return controls.visible && controls.enabled;
    default:
      return false;
  }
}
