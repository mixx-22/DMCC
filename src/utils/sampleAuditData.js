/**
 * Sample data generator for audit schedule tour guide
 * This creates a complete audit schedule with organizations, visits, and findings
 * to demonstrate the full audit workflow
 */

export const generateSampleAuditSchedule = () => {
  return {
    id: "tour-sample-001",
    _id: "tour-sample-001",
    title: "ISO 9001:2015 Quality Management System Audit 2024",
    description:
      "Comprehensive quality management system audit covering all departments and processes in compliance with ISO 9001:2015 standards.",
    auditCode: "QMS-2024-001",
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
      _id: "tour-org-001",
      teamId: "team-001",
      teamName: "Engineering Department",
      scheduleId: "tour-sample-001",
      team: {
        name: "Engineering Department",
        _id: "team-001",
      },
      auditors: [
        {
          _id: "auditor-001",
          name: "Sarah Johnson",
          role: "Lead Auditor",
          email: "sarah.johnson@example.com",
        },
        {
          _id: "auditor-002",
          name: "Michael Chen",
          role: "Technical Auditor",
          email: "michael.chen@example.com",
        },
      ],
      visits: [
        {
          _id: "visit-001",
          visitDate: new Date("2024-02-01").toISOString(),
          objective:
            "Review engineering processes, documentation, and quality control procedures",
          compliance: "OPPORTUNITIES_FOR_IMPROVEMENTS",
          complianceNote:
            "Engineering processes are well-documented, but there are opportunities to improve version control practices.",
          findings: [
            {
              _id: "finding-001",
              clause: "7.5.3",
              description:
                "Document version control practices need improvement. Some engineering drawings lack proper version tracking.",
              category: "MINOR_NC",
              weight: "medium",
              actionPlans: [
                {
                  _id: "action-001",
                  description:
                    "Implement a centralized document management system for all engineering drawings",
                  responsible: "Engineering Manager",
                  deadline: new Date("2024-03-15").toISOString(),
                  status: "in_progress",
                },
              ],
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
      createdAt: new Date("2024-01-20").toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "tour-org-002",
      teamId: "team-002",
      teamName: "Quality Assurance",
      scheduleId: "tour-sample-001",
      team: {
        name: "Quality Assurance",
        _id: "team-002",
      },
      auditors: [
        {
          _id: "auditor-003",
          name: "Emily Rodriguez",
          role: "Senior Auditor",
          email: "emily.rodriguez@example.com",
        },
      ],
      visits: [
        {
          _id: "visit-002",
          visitDate: new Date("2024-02-05").toISOString(),
          objective:
            "Assess quality control measures, testing procedures, and compliance reporting",
          compliance: "COMPLIANT",
          complianceNote:
            "Quality Assurance team demonstrates excellent compliance with ISO 9001:2015 standards. All procedures are well-documented and followed consistently.",
          findings: [],
        },
      ],
      verdict: "CONFORMANT",
      verdictNote:
        "Quality Assurance team shows exemplary compliance with all audit requirements.",
      createdAt: new Date("2024-01-22").toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

/**
 * Check if we're currently viewing the sample/tour audit
 */
export const isSampleAudit = (scheduleId) => {
  return scheduleId === "tour-sample-001";
};
