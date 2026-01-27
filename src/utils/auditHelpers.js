/**
 * Get human-readable label for audit type
 * @param {string} type - The audit type key
 * @returns {string} Human-readable audit type label
 */
export const getAuditTypeLabel = (type) => {
  const types = {
    internal: "Internal Audit",
    external: "External Audit",
    compliance: "Compliance Audit",
    financial: "Financial Audit",
    operational: "Operational Audit",
  };
  return types[type] || type;
};

/**
 * Get formatted audit type label for display (capitalize first letter)
 * @param {string} type - The audit type key
 * @returns {string} Formatted audit type label
 */
export const getFormattedAuditType = (type) => {
  if (!type) return "-";
  return type.charAt(0).toUpperCase() + type.slice(1);
};
