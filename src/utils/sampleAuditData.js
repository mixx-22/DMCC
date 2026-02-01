/**
 * Sample data generator for audit schedule tour guide demo
 * This creates a complete audit schedule with organizations, visits, and findings
 * to demonstrate the full audit workflow
 */

export const generateSampleAuditSchedule = () => {
  return {
    id: "demo-audit-001",
    _id: "demo-audit-001",
    title: "ISO 9001:2015 Quality Management System Audit 2024 - Demo",
    description:
      "Comprehensive quality management system audit covering all departments and processes in compliance with ISO 9001:2015 standards. This is a demo audit pre-populated with sample data to showcase the complete audit workflow.",
    auditCode: "DEMO-QMS-2024-001",
    auditType: "compliance",
    standard: "ISO 9001:2015",
    status: 0, // Ongoing
    previousAudit: null,
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const generateSampleOrganizations = () => {
  return [
    {
      _id: "demo-org-001",
      teamId: "demo-team-001",
      teamName: "Engineering Department",
      scheduleId: "demo-audit-001",
      team: {
        name: "Engineering Department",
        _id: "demo-team-001",
        description: "Software and hardware engineering team responsible for product development",
      },
      auditors: [
        {
          _id: "demo-auditor-001",
          name: "Sarah Johnson",
          role: "Lead Auditor",
          email: "sarah.johnson@example.com",
        },
        {
          _id: "demo-auditor-002",
          name: "Michael Chen",
          role: "Technical Auditor",
          email: "michael.chen@example.com",
        },
      ],
      visits: [
        {
          _id: "demo-visit-001",
          visitDate: new Date("2024-02-01").toISOString(),
          objective:
            "Review engineering processes, documentation standards, and quality control procedures for compliance with ISO 9001:2015",
          compliance: "OPPORTUNITIES_FOR_IMPROVEMENTS",
          complianceNote:
            "Engineering processes are well-documented and generally compliant. Some opportunities for improvement identified in version control practices.",
          findings: [
            {
              _id: "demo-finding-001",
              title: "Document Version Control",
              clause: "7.5.3 - Control of Documented Information",
              description:
                "Some engineering drawings and technical specifications lack proper version tracking. Version numbers are inconsistent across documents.",
              compliance: "MINOR_NC",
              category: "MINOR_NC",
              weight: "medium",
              objectives: [],
              report: {
                reportNo: "NC-2024-001",
                details: "During the audit, it was observed that 15 out of 50 engineering drawings reviewed had inconsistent version numbering. Some documents showed manual version updates without proper change logs.",
                date: new Date("2024-02-01").toISOString(),
                auditor: ["Sarah Johnson"],
                auditee: ["Engineering Manager"],
              },
              actionPlan: {
                description:
                  "Implement a centralized document management system (DMS) for all engineering drawings with automatic version control. Train all engineers on the new system.",
                responsible: "John Smith - Engineering Manager",
                targetDate: new Date("2024-03-15").toISOString(),
                status: "in_progress",
              },
              corrected: -1, // Pending
              verification: {
                status: "pending",
                verifiedBy: null,
                verifiedAt: null,
                notes: "",
              },
            },
            {
              _id: "demo-finding-002",
              title: "Code Review Documentation",
              clause: "8.5.1 - Control of Production and Service Provision",
              description:
                "Code review records are maintained but lack standardized templates. Some reviews missing approval signatures.",
              compliance: "OBSERVATIONS",
              category: "OBSERVATIONS",
              weight: "low",
              objectives: [],
              report: {
                reportNo: "OBS-2024-001",
                details: "Code reviews are being conducted regularly, which is positive. However, the format varies between teams, making it difficult to track compliance systematically.",
                date: new Date("2024-02-01").toISOString(),
                auditor: ["Michael Chen"],
                auditee: ["Tech Lead"],
              },
              actionPlan: {
                description:
                  "Create and implement standardized code review template. Update code review policy document.",
                responsible: "Jane Doe - Tech Lead",
                targetDate: new Date("2024-02-28").toISOString(),
                status: "completed",
              },
              corrected: 2, // Completed and verified
              correctionDate: new Date("2024-02-20").toISOString(),
              currentCompliance: "COMPLIANT",
              verification: {
                status: "verified",
                verifiedBy: "Sarah Johnson",
                verifiedAt: new Date("2024-02-25").toISOString(),
                notes: "Standardized template implemented. Reviewed 10 recent code reviews - all using new template with proper signatures.",
              },
            },
          ],
        },
        {
          _id: "demo-visit-002",
          visitDate: new Date("2024-02-15").toISOString(),
          objective:
            "Follow-up visit to verify implementation of corrective actions from first visit",
          compliance: "OPPORTUNITIES_FOR_IMPROVEMENTS",
          complianceNote:
            "Good progress on corrective actions. Document management system in implementation phase. Code review improvements fully implemented.",
          findings: [],
        },
      ],
      verdict: null,
      verdictNote: null,
      createdAt: new Date("2024-01-20").toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "demo-org-002",
      teamId: "demo-team-002",
      teamName: "Quality Assurance",
      scheduleId: "demo-audit-001",
      team: {
        name: "Quality Assurance",
        _id: "demo-team-002",
        description: "Quality assurance and testing team",
      },
      auditors: [
        {
          _id: "demo-auditor-003",
          name: "Emily Rodriguez",
          role: "Senior Auditor",
          email: "emily.rodriguez@example.com",
        },
      ],
      visits: [
        {
          _id: "demo-visit-003",
          visitDate: new Date("2024-02-05").toISOString(),
          objective:
            "Assess quality control measures, testing procedures, compliance reporting, and defect tracking processes",
          compliance: "COMPLIANT",
          complianceNote:
            "Quality Assurance team demonstrates excellent compliance with ISO 9001:2015 standards. All procedures are well-documented and followed consistently. Test coverage exceeds requirements.",
          findings: [],
        },
      ],
      verdict: "CONFORMANT",
      verdictNote:
        "Quality Assurance team shows exemplary compliance with all audit requirements. No non-conformities identified. Testing procedures are comprehensive and well-maintained.",
      createdAt: new Date("2024-01-22").toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "demo-org-003",
      teamId: "demo-team-003",
      teamName: "Operations",
      scheduleId: "demo-audit-001",
      team: {
        name: "Operations",
        _id: "demo-team-003",
        description: "Operations and logistics team",
      },
      auditors: [
        {
          _id: "demo-auditor-001",
          name: "Sarah Johnson",
          role: "Lead Auditor",
          email: "sarah.johnson@example.com",
        },
      ],
      visits: [
        {
          _id: "demo-visit-004",
          visitDate: new Date("2024-02-08").toISOString(),
          objective:
            "Review operational procedures, resource management, and process controls",
          compliance: "NON_CONFORMITY",
          complianceNote:
            "Several critical non-conformities identified in resource allocation and equipment maintenance procedures. Immediate corrective action required.",
          findings: [
            {
              _id: "demo-finding-003",
              title: "Equipment Maintenance Records",
              clause: "7.1.5 - Monitoring and Measuring Resources",
              description:
                "Calibration records for critical measuring equipment are incomplete. Three pieces of equipment found without valid calibration certificates.",
              compliance: "MAJOR_NC",
              category: "MAJOR_NC",
              weight: "high",
              objectives: [],
              report: {
                reportNo: "NC-2024-002",
                details: "Critical non-conformity: Equipment ID #1234, #1235, and #1236 operating without valid calibration. Last calibration dates exceeded by 3-6 months. This affects measurement validity and product quality assurance.",
                date: new Date("2024-02-08").toISOString(),
                auditor: ["Sarah Johnson"],
                auditee: ["Operations Manager"],
              },
              actionPlan: {
                description:
                  "Immediately remove equipment from service. Arrange emergency calibration with certified provider. Implement monthly calibration tracking system with automated reminders.",
                responsible: "Robert Brown - Operations Manager",
                targetDate: new Date("2024-02-20").toISOString(),
                status: "in_progress",
              },
              corrected: -1,
              verification: {
                status: "pending",
                verifiedBy: null,
                verifiedAt: null,
                notes: "",
              },
            },
          ],
        },
      ],
      verdict: null,
      verdictNote: null,
      createdAt: new Date("2024-01-25").toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

/**
 * Check if we're currently viewing the demo/sample audit
 */
export const isSampleAudit = (scheduleId) => {
  return scheduleId === "demo-audit-001";
};
