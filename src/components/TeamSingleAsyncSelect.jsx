import TeamAsyncSelect from "./TeamAsyncSelect";

/**
 * TeamSingleAsyncSelect - Single selection wrapper for TeamAsyncSelect
 *
 * Provides a cleaner API for single team selection by wrapping TeamAsyncSelect
 * with isMulti={false}. This component is consistent with other single-select
 * components like RoleSingleSelect.
 *
 * @param {Object} value - Single team object or null (not an array)
 * @param {Function} onChange - Callback that receives single team object or null
 * @param {Object} ...props - All other props forwarded to TeamAsyncSelect
 */
const TeamSingleAsyncSelect = ({ value, onChange, ...props }) => {
  return (
    <TeamAsyncSelect
      value={value}
      onChange={onChange}
      isMulti={false}
      {...props}
    />
  );
};

export default TeamSingleAsyncSelect;
