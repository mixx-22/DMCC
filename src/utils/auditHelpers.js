/**
 * Audit type prefix mapping - these prefixes are non-editable
 * @constant
 */
export const AUDIT_TYPE_PREFIXES = {
  internal: "INT",
  external: "EXT",
  compliance: "CMP",
  financial: "FIN",
  operational: "OPR",
};

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

/**
 * Get the non-editable prefix for an audit type
 * @param {string} type - The audit type key
 * @returns {string} The prefix for the audit type
 */
export const getAuditTypePrefix = (type) => {
  return AUDIT_TYPE_PREFIXES[type] || "";
};

/**
 * Generate an audit code based on audit type
 * @param {string} auditType - The audit type key
 * @param {string|number} year - The year (defaults to current year)
 * @param {string|number} number - The audit number (defaults to empty string, can be 9999 for placeholder)
 * @returns {string} The generated audit code in format PREFIX-YEAR-NUMBER
 */
export const generateAuditCode = (auditType, year = null, number = "") => {
  const prefix = getAuditTypePrefix(auditType);
  if (!prefix) {
    return "";
  }
  
  const auditYear = year || new Date().getFullYear();
  const auditNumber = number || "";
  
  return `${prefix}-${auditYear}-${auditNumber}`;
};
