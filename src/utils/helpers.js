/**
 * Helper function to get image source
 * Handles various image formats and returns a clean string
 */
export const getImageSrc = (image) => {
  // If image is an object or array, return empty string
  if (typeof image === "object" || Array.isArray(image)) {
    return "";
  }
  // Return the image string as-is
  return image || "";
};

export function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  const sameYear = start.getFullYear() === end.getFullYear();

  const formatMonthDay = (date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

  const formatMonthDayYear = (date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  // January 29, 2026
  if (sameDay) {
    return formatMonthDayYear(start);
  }

  // January 29 - 31, 2026
  if (sameMonth) {
    return `${formatMonthDay(start)} - ${end.getDate()}, ${end.getFullYear()}`;
  }

  // January 29 - February 2, 2026
  if (sameYear) {
    return `${formatMonthDay(start)} - ${formatMonthDay(end)}, ${end.getFullYear()}`;
  }

  // January 29, 2026 - December 31, 2027
  return `${formatMonthDayYear(start)} - ${formatMonthDayYear(end)}`;
}

/**
 * Calculate the organization verdict based on all visits and findings
 * Returns the highest level of non-conformity or COMPLIANT if none found
 */
export function calculateOrganizationVerdict(organization) {
  const { visits = [] } = organization;

  // Compliance severity order (highest to lowest)
  const severityOrder = [
    "MAJOR_NC",
    "MINOR_NC",
    "OPPORTUNITIES_FOR_IMPROVEMENTS",
    "OBSERVATIONS",
    "COMPLIANT",
  ];

  let highestSeverity = "COMPLIANT"; // Default to compliant

  // Check all visits and their findings
  visits.forEach((visit) => {
    // Check visit-level compliance
    if (visit.compliance) {
      const visitSeverityIndex = severityOrder.indexOf(visit.compliance);
      const currentSeverityIndex = severityOrder.indexOf(highestSeverity);

      if (
        visitSeverityIndex !== -1 &&
        visitSeverityIndex < currentSeverityIndex
      ) {
        highestSeverity = visit.compliance;
      }
    }

    // Check findings-level compliance
    if (visit.findings && Array.isArray(visit.findings)) {
      visit.findings.forEach((finding) => {
        // Use currentCompliance if available (for corrected findings), otherwise use compliance
        const findingCompliance =
          finding.currentCompliance || finding.compliance;

        const findingSeverityIndex = severityOrder.indexOf(findingCompliance);
        const currentSeverityIndex = severityOrder.indexOf(highestSeverity);

        if (
          findingSeverityIndex !== -1 &&
          findingSeverityIndex < currentSeverityIndex
        ) {
          highestSeverity = findingCompliance;
        }
      });
    }
  });

  return highestSeverity;
}

/**
 * Validate if an audit schedule can be closed
 * Returns an object with { canClose: boolean, issues: Array<string> }
 */
export function validateAuditScheduleClosure(organizations = []) {
  const issues = [];

  // Check if there are any organizations
  if (organizations.length === 0) {
    issues.push("No organizations have been added to this audit schedule");
    return { canClose: false, issues };
  }

  // Check each organization
  organizations.forEach((org, index) => {
    const orgIdentifier = org.team?.name || `Organization ${index + 1}`;

    // Check if organization has a verdict
    if (!org.verdict) {
      issues.push(`${orgIdentifier}: Missing final verdict`);
    }

    // Check if all findings in all visits have compliance
    const { visits = [] } = org;
    visits.forEach((visit, visitIndex) => {
      const { findings = [] } = visit;
      findings.forEach((finding, findingIndex) => {
        if (!finding.compliance) {
          issues.push(
            `${orgIdentifier}, Visit ${visitIndex + 1}, Finding ${findingIndex + 1}: Missing compliance type`
          );
        }
      });
    });
  });

  return {
    canClose: issues.length === 0,
    issues,
  };
}
