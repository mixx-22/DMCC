/**
 * Organization Status Utilities
 * 
 * Status values:
 * 0 - ongoing (default, all editing allowed)
 * 1 - closed (all verified, readonly mode)
 * 2+ - visit status (status-2 = current visit index)
 */

/**
 * Calculate organization status based on visits and findings
 * @param {Object} organization - The organization object
 * @returns {number} - The calculated status
 */
export const calculateOrganizationStatus = (organization) => {
  if (!organization || !organization.visits || organization.visits.length === 0) {
    return 0; // ongoing - no visits yet
  }

  const visits = organization.visits;
  
  // Find the first unverified visit (visit without compliance explicitly set)
  const firstUnverifiedVisitIndex = visits.findIndex(visit => 
    visit.compliance === null || visit.compliance === undefined
  );
  
  if (firstUnverifiedVisitIndex !== -1) {
    // Current visit is the first unverified one
    return 2 + firstUnverifiedVisitIndex; // status 2 = visit 0, status 3 = visit 1, etc.
  }
  
  // All visits are verified
  return 1; // closed
};

/**
 * Get the current visit index from status
 * @param {number} status - The organization status
 * @returns {number} - The visit index, or -1 if not in a visit status
 */
export const getCurrentVisitIndex = (status) => {
  if (status < 2) return -1;
  return status - 2;
};

/**
 * Check if organization is in ongoing state (editable)
 * @param {number} status - The organization status
 * @returns {boolean}
 */
export const isOngoing = (status) => {
  return status === 0;
};

/**
 * Check if organization is closed (readonly)
 * @param {number} status - The organization status
 * @returns {boolean}
 */
export const isClosed = (status) => {
  return status === 1;
};

/**
 * Check if organization is in a visit status
 * @param {number} status - The organization status
 * @returns {boolean}
 */
export const isInVisitStatus = (status) => {
  return status >= 2;
};

/**
 * Check if a visit is the currently active one
 * @param {number} visitIndex - The visit index
 * @param {number} status - The organization status
 * @returns {boolean}
 */
export const isCurrentVisit = (visitIndex, status) => {
  return isInVisitStatus(status) && getCurrentVisitIndex(status) === visitIndex;
};

/**
 * Check if all findings in a visit have action plans (for NC findings with reports)
 * @param {Object} visit - The visit object
 * @returns {boolean}
 */
export const allFindingsHaveActionPlans = (visit) => {
  if (!visit || !visit.findings || visit.findings.length === 0) {
    return true; // No findings means nothing to check
  }
  
  // Only NC findings with reports need action plans
  const ncFindingsWithReports = visit.findings.filter(f => 
    (f.compliance === 'MINOR_NC' || f.compliance === 'MAJOR_NC') && f.report
  );
  
  if (ncFindingsWithReports.length === 0) {
    return true; // No NC findings that need action plans
  }
  
  // Check if all NC findings have action plans
  return ncFindingsWithReports.every(f => f.actionPlan);
};

/**
 * Check if all findings in a visit are verified
 * @param {Object} visit - The visit object
 * @returns {boolean}
 */
export const allFindingsVerified = (visit) => {
  if (!visit || !visit.findings || visit.findings.length === 0) {
    return true; // No findings means nothing to verify
  }
  
  // Only NC findings with action plans need verification
  const ncFindingsWithActionPlans = visit.findings.filter(f => 
    (f.compliance === 'MINOR_NC' || f.compliance === 'MAJOR_NC') && f.actionPlan
  );
  
  if (ncFindingsWithActionPlans.length === 0) {
    return true; // No findings that need verification
  }
  
  // Check if all NC findings with action plans are verified (corrected is explicitly set and not -1)
  return ncFindingsWithActionPlans.every(f => 
    f.corrected !== undefined && f.corrected !== null && f.corrected !== -1
  );
};

/**
 * Check if a visit can be closed/resolved (all findings verified)
 * @param {Object} visit - The visit object
 * @returns {boolean}
 */
export const canCloseVisit = (visit) => {
  return allFindingsHaveActionPlans(visit) && allFindingsVerified(visit);
};

/**
 * Check if a new visit can be added
 * @param {Object} organization - The organization object
 * @returns {boolean}
 */
export const canAddVisit = (organization) => {
  if (!organization || !organization.visits || organization.visits.length === 0) {
    return true; // Can add first visit to a new organization
  }
  
  // Get the last visit
  const lastVisit = organization.visits[organization.visits.length - 1];
  
  // Can add visit only if the last visit is closed (has compliance set)
  return lastVisit.compliance !== null && lastVisit.compliance !== undefined;
};

/**
 * Check if editing is allowed based on status
 * @param {number} status - The organization status
 * @returns {boolean}
 */
export const canEdit = (status) => {
  return !isClosed(status);
};

/**
 * Get status display information
 * @param {number} status - The organization status
 * @param {Array} visits - The visits array
 * @returns {Object} - Display information {label, colorScheme, description}
 */
export const getStatusDisplay = (status, visits = []) => {
  if (status === 0) {
    return {
      label: 'Ongoing',
      colorScheme: 'blue',
      description: 'Organization is in ongoing state'
    };
  }
  
  if (status === 1) {
    return {
      label: 'Closed',
      colorScheme: 'gray',
      description: 'All visits verified and closed'
    };
  }
  
  const visitIndex = getCurrentVisitIndex(status);
  const visit = visits[visitIndex];
  
  return {
    label: `Visit ${visitIndex + 1}`,
    colorScheme: 'purple',
    description: visit ? `Current visit (${visitIndex + 1}/${visits.length})` : 'Active visit',
    visitIndex
  };
};
