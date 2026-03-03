import { useMemo } from "react";
import PropTypes from "prop-types";
import { getControlStates } from "../helpers/uiControlHelpers";

/**
 * UIControl - Generic wrapper component for controlling UI element states
 * 
 * Controls whether wrapped UI elements are:
 * - visible / hidden
 * - enabled / disabled
 * - editable / read-only
 * 
 * Based on:
 * - Current audit schedule
 * - Current organization
 * - Current visit
 * - Item type
 * - Centralized, declarative configuration
 * 
 * ⚠️ NO BUSINESS LOGIC IN JSX - All logic lives in pure functions and config
 * 
 * @example
 * // Basic usage with item type
 * <UIControl
 *   auditSchedule={schedule}
 *   organization={org}
 *   itemType="organization_details"
 * >
 *   <Button>Edit Organization</Button>
 * </UIControl>
 * 
 * @example
 * // With custom fallback when not visible
 * <UIControl
 *   auditSchedule={schedule}
 *   itemType="schedule_details"
 *   fallback={<Text>Not available</Text>}
 * >
 *   <Input />
 * </UIControl>
 * 
 * @example
 * // Render prop pattern for advanced control
 * <UIControl
 *   auditSchedule={schedule}
 *   organization={org}
 *   itemType="finding_details"
 * >
 *   {({ visible, enabled, editable, readOnly }) => (
 *     <FormControl>
 *       <Input isDisabled={!enabled} isReadOnly={readOnly} />
 *     </FormControl>
 *   )}
 * </UIControl>
 */
const UIControl = ({
  auditSchedule,
  organization = null,
  visit = null,
  itemType,
  children,
  fallback = null,
  hideWhenNotVisible = true,
  showDisabledState = true,
  showReadOnlyState = true,
}) => {
  // Compute control states using pure functions (NO business logic here)
  const controlStates = useMemo(() => {
    const context = {
      auditSchedule,
      organization,
      visit,
      itemType,
    };
    return getControlStates(context);
  }, [auditSchedule, organization, visit, itemType]);

  const { visible, enabled, readOnly } = controlStates;

  // If not visible, show fallback or hide
  if (!visible) {
    if (hideWhenNotVisible) {
      return null;
    }
    return fallback;
  }

  // Handle children as render prop
  if (typeof children === "function") {
    return children(controlStates);
  }

  // Clone children and apply control states
  // This handles common Chakra UI component props
  if (children && typeof children === "object") {
    // For React elements, we can apply props
    const childProps = {};

    // Apply disabled state if component supports it
    if (!enabled && showDisabledState) {
      childProps.isDisabled = true;
      childProps.disabled = true; // For non-Chakra components
    }

    // Apply read-only state if component supports it
    if (readOnly && showReadOnlyState) {
      childProps.isReadOnly = true;
      childProps.readOnly = true; // For non-Chakra components
    }

    // If we have props to apply, clone the child
    if (Object.keys(childProps).length > 0) {
      // Handle single child
      if (children.type) {
        return {
          ...children,
          props: {
            ...children.props,
            ...childProps,
          },
        };
      }
    }
  }

  // Return children as-is if no modifications needed
  return children;
};

UIControl.propTypes = {
  // Required: audit schedule object with at least _id and status
  auditSchedule: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.number, // 0 = ONGOING, 1 = CLOSED
  }).isRequired,

  // Optional: organization object
  organization: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.number,
    team: PropTypes.object,
    visits: PropTypes.array,
  }),

  // Optional: visit object
  visit: PropTypes.shape({
    date: PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string,
    }),
    findings: PropTypes.array,
  }),

  // Required: item type to determine control rules
  itemType: PropTypes.string.isRequired,

  // Children can be elements or render function
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,

  // Fallback content when not visible
  fallback: PropTypes.node,

  // Whether to hide (null) when not visible, or show fallback
  hideWhenNotVisible: PropTypes.bool,

  // Whether to show disabled state when not enabled
  showDisabledState: PropTypes.bool,

  // Whether to show read-only state when not editable
  showReadOnlyState: PropTypes.bool,
};

export default UIControl;
