import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Box,
  useColorModeValue,
  Tooltip,
  Wrap,
  WrapItem,
  Flex,
  Collapse,
  Button,
  Center,
  Stack,
  cssVar,
  useToken,
  Hide,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Spacer,
  AccordionIcon,
  Divider,
  CardHeader,
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiPlus,
  FiCalendar,
  FiCheckCircle,
  FiPrinter,
} from "react-icons/fi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useOrganizations,
  useDocuments,
  useLayout,
} from "../../../context/_useContext";
import Timestamp from "../../../components/Timestamp";

import { GridView } from "../../../components/Document/GridView";
import { formatDateRange } from "../../../utils/helpers";
import DocumentDrawer from "../../../components/Document/DocumentDrawer";
import FindingsForm from "./FindingsForm";
import FindingsList from "./FindingsList";
import VisitManager from "./VisitManager";
import VisitComplianceForm from "./VisitComplianceForm";
import SetVerdictModal from "./SetVerdictModal";
import { calculateOrganizationVerdict } from "../../../utils/helpers";
import TeamQualityDocuments from "../../../components/TeamQualityDocuments";
import PreviousAuditFindings from "./PreviousAuditFindings";
import ResponsiveTabs, {
  ResponsiveTab,
  ResponsiveTabList,
  ResponsiveTabPanel,
  ResponsiveTabPanels,
} from "../../../components/common/ResponsiveTabs";
import NotifBadge from "../../../components/NotifBadge";

// Tab indices for better maintainability
const TAB_INDICES = {
  VISITS: 0,
  AUDITORS: 1,
  TEAM_DETAILS: 2,
  QUALITY_DOCUMENTS: 3,
  OTHER_DOCUMENTS: 4,
  PREVIOUS_AUDIT_FINDINGS: 5,
};

const COMPLIANCE_DISPLAY = {
  OBSERVATIONS: { label: "Observations", color: "brandPrimary" },
  OPPORTUNITIES_FOR_IMPROVEMENTS: {
    label: "Opportunities for Improvements",
    color: "brandSecondary",
  },
  NON_CONFORMITY: { label: "Non-Conformity", color: "warning" },
  MINOR_NC: { label: "Minor Non-Conformity", color: "warning" },
  MAJOR_NC: { label: "Major Non-Conformity", color: "error" },
  COMPLIANT: { label: "Compliant", color: "success" },
};

const OrganizationCard = ({
  loading = false,
  organization,
  team,
  auditors = [],
  onEdit = () => {},
  isExpanded = false,
  onToggleExpanded = () => {},
  schedule = {},
}) => {
  const { deleteOrganization, updateOrganization, dispatch } =
    useOrganizations();
  const {
    documents,
    loading: documentsLoading,
    fetchDocuments,
  } = useDocuments();
  const { selectedDocument, closeDocumentDrawer, handleDocumentClick } =
    useLayout();
  const cardBg = useColorModeValue("white", "gray.700");
  const verdictColor = useColorModeValue("success.600", "success.400");
  const errorColor = useColorModeValue("error.600", "error.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const headerHoverBg = useColorModeValue("gray.100", "gray.650");
  const objectiveBg = useColorModeValue("gray.50", "gray.700");
  const [tabColor] = useToken("colors", ["gray.500", errorColor]);
  const $tabColor = cssVar("tabs-color");

  const isScheduleOngoing = useMemo(() => schedule?.status === 0, [schedule]);

  const WEIGHT_COLORS = {
    low: "success",
    medium: "brandSecondary",
    high: "error",
  };

  // State to track which visit's finding form is shown (visitIndex -> boolean)
  const [showFindingFormFor, setShowFindingFormFor] = useState(new Set());

  // State to track if visit form is visible
  const [showVisitForm, setShowVisitForm] = useState(false);

  // State to track active tab index
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // State to track which visit's compliance form is shown (visitIndex)
  const [editingVisitComplianceFor, setEditingVisitComplianceFor] =
    useState(null);

  // State to track verdict modal
  const [isVerdictModalOpen, setIsVerdictModalOpen] = useState(false);
  // Calculate the organization verdict
  const calculatedVerdict = calculateOrganizationVerdict(organization);

  useEffect(() => {
    // Only fetch documents if organization is expanded AND user is on Other Documents tab
    if (
      organization?.team?.folderId &&
      isExpanded &&
      activeTabIndex === TAB_INDICES.OTHER_DOCUMENTS
    ) {
      fetchDocuments(organization?.team?.folderId);
    }
  }, [
    organization?.team?.folderId,
    isExpanded,
    activeTabIndex,
    fetchDocuments,
  ]);

  const handleDeleteOrganization = async (organization) => {
    const result = await Swal.fire({
      title: "Delete Organization?",
      text: `Are you sure you want to remove this team from the audit schedule? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete Organization",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const orgId = organization?._id || organization?.id;
        await deleteOrganization(orgId);
        // Context errorucer handles updating the organizations list
      } catch (error) {
        console.error("Failed to Delete Organization:", error);
      }
    }
  };

  const handleDeleteFinding = async (finding, visitIndex) => {
    const result = await Swal.fire({
      title: `Deleting Finding #${visitIndex + 1}`,
      text: "Are you sure you want to delete this finding? Upon proceeding, this finding will no longer be recorded. This action is irreversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete Finding",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      // Calculate updated visits without the deleted finding
      const updatedVisits = organization.visits.map((v, i) => {
        if (i === visitIndex) {
          return {
            ...v,
            findings: (v.findings || []).filter((f) => f._id !== finding._id),
          };
        }
        return v;
      });

      // Update organization in context
      dispatch({
        type: "UPDATE_ORGANIZATION",
        payload: {
          ...organization,
          visits: updatedVisits,
          team,
        },
      });

      try {
        // Persist to server
        await updateOrganization(organization._id, {
          ...organization,
          teamId: organization.teamId || team,
          visits: updatedVisits,
        });
      } catch (error) {
        console.error("Failed to delete finding:", error);
        // Could refetch or show error
      }
    }
  };

  const handleEditFinding = async (updatedFinding, visitIndex) => {
    // Calculate updated visits with the edited finding
    const updatedVisits = organization.visits.map((v, i) => {
      if (i === visitIndex) {
        return {
          ...v,
          findings: (v.findings || []).map((f) =>
            f._id === updatedFinding._id ? updatedFinding : f,
          ),
        };
      }
      return v;
    });

    // Update organization in context
    dispatch({
      type: "UPDATE_ORGANIZATION",
      payload: {
        ...organization,
        visits: updatedVisits,
        teamId: organization.teamId || team,
      },
    });

    try {
      // Persist to server
      await updateOrganization(organization._id, {
        ...organization,
        teamId: organization.teamId || team,
        visits: updatedVisits,
      });
    } catch (error) {
      console.error("Failed to update finding:", error);
      throw error;
    }
  };

  const handleAddVisit = async (newVisits) => {
    // Update organization in context
    dispatch({
      type: "UPDATE_ORGANIZATION",
      payload: {
        ...organization,
        visits: newVisits,
        teamId: organization.teamId || team,
      },
    });

    try {
      // Persist to server
      await updateOrganization(organization._id, {
        ...organization,
        teamId: organization.teamId || team,
        visits: newVisits,
      });
    } catch (error) {
      console.error("Failed to add visit:", error);
    }
  };

  const handleSaveVisitCompliance = async (visitIndex, complianceData) => {
    // Update the specific visit with compliance data
    const updatedVisits = organization.visits.map((v, i) => {
      if (i === visitIndex) {
        return {
          ...v,
          compliance: complianceData.compliance,
          complianceUser: complianceData.complianceUser,
          complianceSetAt: complianceData.complianceSetAt,
        };
      }
      return v;
    });

    // Update organization in context
    dispatch({
      type: "UPDATE_ORGANIZATION",
      payload: {
        ...organization,
        visits: updatedVisits,
        teamId: organization.teamId || team,
      },
    });

    try {
      // Persist to server
      await updateOrganization(organization._id, {
        ...organization,
        teamId: organization.teamId || team,
        visits: updatedVisits,
      });

      // Hide compliance form after successful save
      setEditingVisitComplianceFor(null);
    } catch (error) {
      console.error("Failed to save visit compliance:", error);
    }
  };

  const handleSetVerdict = async (verdict) => {
    const teamId = organization.teamId || team;

    // Update organization with new verdict
    dispatch({
      type: "UPDATE_ORGANIZATION",
      payload: {
        ...organization,
        verdict,
        teamId,
      },
    });

    try {
      // Persist to server
      await updateOrganization(organization._id, {
        ...organization,
        verdict,
        teamId,
      });
    } catch (error) {
      console.error("Failed to set organization verdict:", error);
      throw error;
    }
  };

  const handlePrintAuditReport = () => {
    try {
      // Gather all audit data
      const auditData = {
        organization,
        team,
        schedule,
        auditors,
        calculatedVerdict,
      };

      // Create print window
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("Please allow popups to print the audit report");
        return;
      }

      // Generate HTML content
      const htmlContent = generateAuditReportHTML(auditData);

      // Write to print window
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    } catch (error) {
      console.error("Error printing audit report:", error);
      alert("Failed to generate print report: " + error.message);
    }
  };

  const generateAuditReportHTML = ({
    organization,
    team,
    schedule,
    auditors,
    calculatedVerdict,
  }) => {
    // Calculate visit date range covering all visits
    const visitDateRange =
      organization?.visits && organization.visits.length > 0
        ? (() => {
            const dates = organization.visits
              .filter((v) => v.date?.start)
              .map((v) => ({
                start: new Date(v.date.start),
                end: v.date.end ? new Date(v.date.end) : new Date(v.date.start),
              }));
            if (dates.length === 0) return "N/A";
            const earliestStart = new Date(
              Math.min(...dates.map((d) => d.start)),
            );
            const latestEnd = new Date(Math.max(...dates.map((d) => d.end)));
            return formatDateRange(earliestStart, latestEnd);
          })()
        : "N/A";

    // Collect all findings from all visits
    const allFindings =
      organization?.visits?.flatMap((visit, visitIndex) =>
        (visit.findings || []).map((finding) => ({
          ...finding,
          visitNumber: visitIndex + 1,
          visitDate: formatDateRange(visit.date?.start, visit.date?.end),
        })),
      ) || [];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Audit Report - ${team?.name || "Organization"}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              color: #000;
              padding: 20px;
              max-width: 210mm;
              margin: 0 auto;
              background: white;
            }
            .header-bar {
              background: linear-gradient(135deg, #003DA5 0%, #005AEE 100%);
              height: 35px;
              margin: -20px -20px 20px -20px;
            }
            .logo-container {
              text-align: center;
              margin: 20px 0 10px 0;
            }
            .logo {
              height: 50px;
              width: auto;
            }
            .title {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin: 30px 0 25px 0;
              color: #000;
            }
            .info-section {
              margin-bottom: 20px;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
              align-items: baseline;
            }
            .info-label {
              font-weight: 600;
              min-width: 150px;
              color: #000;
            }
            .info-value {
              flex: 1;
              border-bottom: 1px solid #000;
              padding-bottom: 2px;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              page-break-inside: avoid;
            }
            th {
              background: linear-gradient(135deg, #003DA5 0%, #005AEE 100%);
              color: white;
              padding: 10px;
              text-align: center;
              font-weight: bold;
              border: 1px solid #003DA5;
            }
            td {
              border: 1px solid #ccc;
              padding: 8px;
              vertical-align: top;
              color: #000;
            }
            .audit-table th:first-child {
              width: 50%;
            }
            .findings-table th:first-child {
              width: 40px;
              text-align: center;
            }
            .findings-table th:nth-child(2) {
              width: 25%;
            }
            .findings-table th:nth-child(3) {
              width: 20%;
            }
            .findings-table th:nth-child(4) {
              width: 15%;
            }
            .findings-table td:first-child {
              text-align: center;
            }
            .conclusion-section {
              margin: 20px 0;
            }
            .conclusion-label {
              font-weight: 600;
              margin-bottom: 5px;
            }
            .conclusion-box {
              border: 1px solid #ccc;
              min-height: 100px;
              padding: 10px;
              background: #fafafa;
            }
            .signature-section {
              margin-top: 40px;
            }
            .signature-row {
              display: flex;
              margin-bottom: 8px;
              align-items: baseline;
            }
            .signature-label {
              font-weight: 600;
              min-width: 200px;
            }
            .signature-line {
              flex: 1;
              border-bottom: 1px solid #000;
              margin-left: 20px;
            }
            .footer-bar {
              background: linear-gradient(135deg, #D4B200 0%, #FFD700 100%);
              height: 30px;
              margin: 40px -20px -20px -20px;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 3px;
              font-size: 11px;
              font-weight: bold;
            }
            .badge-green { background-color: #d4edda; color: #155724; }
            .badge-red { background-color: #f8d7da; color: #721c24; }
            .badge-orange { background-color: #fff3cd; color: #856404; }
            .badge-blue { background-color: #d1ecf1; color: #0c5460; }
            @media print {
              body {
                padding: 10mm;
              }
              .header-bar {
                margin: -10mm -10mm 20px -10mm;
              }
              .footer-bar {
                margin: 40px -10mm -10mm -10mm;
              }
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-bar"></div>
          
          <div class="logo-container">
            <img src="data:image/png;base64,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" class="logo" alt="Auptilyze Logo" />
          </div>
          
          <div class="title">Audit Report Template</div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Audit No :</span>
              <span class="info-value" style="max-width: 200px;">${schedule?.auditNumber || organization?._id?.slice(-8) || ""}</span>
              <span class="info-label" style="margin-left: 40px;">Date :</span>
              <span class="info-value">${visitDateRange}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Audit Team :</span>
              <span class="info-value">${auditors?.map((a) => `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.name).join(", ") || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Audit Location :</span>
              <span class="info-value">${team?.name || "N/A"}</span>
            </div>
          </div>

          <table class="audit-table">
            <tr>
              <th>Audit Standard</th>
              <th>Scope of Audit</th>
            </tr>
            <tr>
              <td style="height: 60px;">${schedule?.standard || ""}</td>
              <td>${schedule?.scope || team?.description || ""}</td>
            </tr>
          </table>

          <table class="findings-table">
            <tr>
              <th># No</th>
              <th>Area of Audit</th>
              <th>Applicable Clause</th>
              <th>Audit Status</th>
              <th>Comments</th>
            </tr>
            ${
              allFindings.length > 0
                ? allFindings
                    .map((finding, index) => {
                      const objectives =
                        finding.objectives && finding.objectives.length > 0
                          ? finding.objectives
                              .map((obj) => obj.title)
                              .join(", ")
                          : finding.objective || "";

                      const statusText = finding.compliance
                        ? COMPLIANCE_DISPLAY[finding.compliance]?.label ||
                          finding.compliance
                        : "";

                      return `
            <tr>
              <td>${index + 1}</td>
              <td>${finding.title || ""}</td>
              <td>${objectives}</td>
              <td>${statusText}</td>
              <td>${finding.details || finding.recommendation || ""}</td>
            </tr>`;
                    })
                    .join("")
                : `
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>`
            }
          </table>

          <div class="conclusion-section">
            <div class="conclusion-label">Conclusion :</div>
            <div class="conclusion-box">
              ${
                organization?.verdict
                  ? `Final Verdict: <strong>${COMPLIANCE_DISPLAY[organization.verdict]?.label || organization.verdict}</strong>`
                  : calculatedVerdict
                    ? `Calculated Verdict: <strong>${COMPLIANCE_DISPLAY[calculatedVerdict]?.label || calculatedVerdict}</strong>`
                    : ""
              }
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-row">
              <span class="signature-label">Auditee name and signature :</span>
              <span class="signature-line"></span>
            </div>
            <div class="signature-row">
              <span class="signature-label">Auditor name and signature :</span>
              <span class="signature-line"></span>
            </div>
          </div>

          <div class="footer-bar"></div>
        </body>
      </html>
    `;
  };

  const nextOngoingVisitDate = (() => {
    const { visits = [] } = organization;
    if (!visits.length) return "";

    const ongoingVisits = visits.filter((visit) => visit?.compliance === null);

    if (!ongoingVisits.length) return "";

    const nextVisit = ongoingVisits.sort(
      (a, b) => new Date(a.date.start) - new Date(b.date.start),
    )[0];

    const { start, end } = nextVisit.date;

    const date = formatDateRange(start, end);
    if (date?.length) return null;
    return date;
  })();

  const canSetCompliance = useCallback((visit) => {
    const { findings = [] } = visit;

    if (!findings.length) {
      return { can: false, message: "No findings recorded yet." };
    }

    const allResolved = findings.every((f) => {
      const isMajorOrMinor = ["MAJOR_NC", "MINOR_NC"].includes(f.compliance);
      return !isMajorOrMinor || Boolean(f.correctionDate);
    });

    if (!allResolved) {
      return { can: false, message: "Some findings are unresolved yet." };
    }

    return { can: true, message: "" };
  }, []);

  const canSetVerdict = useCallback((organization) => {
    const { visits = [] } = organization;

    if (!visits.length) {
      return {
        can: false,
        message: "No visits recorded for this organization.",
      };
    }

    for (const [index, visit] of visits.entries()) {
      const { findings = [] } = visit;

      if (!findings.length) {
        return {
          can: false,
          message: `Visit #${index + 1} - ${formatDateRange(visit.date.start, visit.date.end) || visit._id} has no findings.`,
        };
      }

      const allResolved = findings.every((f) => {
        const isMajorOrMinor = ["MAJOR_NC", "MINOR_NC"].includes(f.compliance);
        return !isMajorOrMinor || Boolean(f.correctionDate);
      });

      if (!allResolved) {
        return {
          can: false,
          message: `Visit #${index + 1} - ${formatDateRange(visit.date.start, visit.date.end) || visit._id} has unresolved findings.`,
        };
      }
    }

    return { can: true, message: "" };
  }, []);

  return (
    <>
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <CardHeader p={0}>
          <HStack
            py={4}
            pl={4}
            pr={2}
            spacing={4}
            align="center"
            cursor="pointer"
            justify="space-between"
            onClick={onToggleExpanded}
            _hover={{ bg: headerHoverBg }}
            transition="background 0.2s"
          >
            <HStack align="center" spacing={2}>
              <Box pos="relative" boxSize={8}>
                <Avatar size="sm" name={team.name} />
                <NotifBadge
                  boxSize={3}
                  right={-0.5}
                  bottom={-0.5}
                  pos="absolute"
                  show={!canSetVerdict(organization).can}
                  message={canSetVerdict(organization).message}
                />
              </Box>
              <Text fontWeight="bold" fontSize="lg">
                {team?.name || "Unknown Team"}
              </Text>
              {loading && <Spinner size="sm" />}
            </HStack>
            <HStack align="center" spacing={0}>
              {/* Display verdict badge */}
              <Hide below="md">
                {organization.verdict && (
                  <Tooltip label="Organization Final Verdict">
                    <Badge
                      mr={2}
                      fontSize="xs"
                      colorScheme={
                        COMPLIANCE_DISPLAY[organization.verdict]?.color ||
                        "gray"
                      }
                    >
                      {COMPLIANCE_DISPLAY[organization.verdict]?.label ||
                        organization.verdict}
                    </Badge>
                  </Tooltip>
                )}
                {!isExpanded && nextOngoingVisitDate && (
                  <Tooltip label="Organization Final Verdict">
                    <Badge
                      mr={2}
                      fontSize="xs"
                      colorScheme={
                        COMPLIANCE_DISPLAY[organization.verdict]?.color ||
                        "gray"
                      }
                    >
                      {nextOngoingVisitDate}
                    </Badge>
                  </Tooltip>
                )}
              </Hide>
              <IconButton
                icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                size="sm"
                variant="ghost"
                aria-label={isExpanded ? "Collapse" : "Expand"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpanded();
                }}
              />
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  size="sm"
                  aria-label="More options"
                  onClick={(e) => e.stopPropagation()}
                />
                <MenuList>
                  <MenuItem
                    color={verdictColor}
                    icon={<FiCheckCircle />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsVerdictModalOpen(true);
                    }}
                    isDisabled={
                      !isScheduleOngoing || !canSetVerdict(organization).can
                    }
                  >
                    {organization.verdict
                      ? "Change Final Verdict"
                      : "Set Final Verdict"}
                  </MenuItem>
                  <MenuItem
                    icon={<FiEdit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(organization);
                    }}
                    isDisabled={!isScheduleOngoing}
                  >
                    Edit Organization
                  </MenuItem>
                  <MenuItem
                    icon={<FiPrinter />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintAuditReport();
                    }}
                  >
                    Print Audit Report
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    icon={<FiTrash2 />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOrganization(organization);
                    }}
                    isDisabled={!isScheduleOngoing}
                    color={errorColor}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>{" "}
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          <Collapse in={isExpanded} animateOpacity>
            <Box pt={0}>
              {/* Tabs Section */}
              <ResponsiveTabs
                index={activeTabIndex}
                colorScheme="brandPrimary"
                onChange={(index) => setActiveTabIndex(index)}
                triggerUpdate={isExpanded}
              >
                <ResponsiveTabList>
                  <ResponsiveTab
                    sx={{ [$tabColor.variable]: tabColor }}
                    fontWeight={"normal"}
                  >
                    <HStack spacing={1}>
                      <Text>Visits</Text>
                    </HStack>
                  </ResponsiveTab>
                  <ResponsiveTab
                    sx={{ [$tabColor.variable]: tabColor }}
                    fontWeight={"normal"}
                  >
                    <HStack spacing={1}>
                      <Text>Auditors</Text>
                    </HStack>
                  </ResponsiveTab>
                  <ResponsiveTab
                    sx={{ [$tabColor.variable]: tabColor }}
                    fontWeight={"normal"}
                  >
                    <HStack spacing={1}>
                      <Hide below="md">
                        <Text>Team Details</Text>
                      </Hide>
                      <Hide above="sm">
                        <Text>Details</Text>
                      </Hide>
                    </HStack>
                  </ResponsiveTab>
                  <ResponsiveTab
                    sx={{ [$tabColor.variable]: tabColor }}
                    fontWeight={"normal"}
                  >
                    <HStack spacing={1}>
                      <Text>Quality Documents</Text>
                    </HStack>
                  </ResponsiveTab>
                  <ResponsiveTab
                    sx={{ [$tabColor.variable]: tabColor }}
                    fontWeight={"normal"}
                  >
                    <HStack spacing={1}>
                      <Text>Other Documents</Text>
                    </HStack>
                  </ResponsiveTab>
                  <ResponsiveTab
                    sx={{ [$tabColor.variable]: tabColor }}
                    fontWeight={"normal"}
                  >
                    <HStack spacing={1}>
                      <Text>Previous Findings</Text>
                    </HStack>
                  </ResponsiveTab>
                </ResponsiveTabList>

                <ResponsiveTabPanels>
                  {/* Visit Details Tab */}
                  <ResponsiveTabPanel p={0}>
                    {!showVisitForm && (
                      <>
                        {organization?.visits?.length > 0 ? (
                          <Accordion allowToggle>
                            {organization.visits.map((visit, index) => {
                              const hasMajorNC = visit?.findings
                                ?.map((f) => f.compliance)
                                ?.includes("MAJOR_NC");
                              const hasMinorNC = visit?.findings
                                ?.map((f) => f.compliance)
                                ?.includes("MINOR_NC");
                              return (
                                <AccordionItem key={index} border="none">
                                  {({ isExpanded }) => (
                                    <>
                                      {/* Visit Date Header */}
                                      <AccordionButton py={4}>
                                        <HStack w="full" alignItems="center">
                                          <Box pos="relative">
                                            {index !== 0 && (
                                              <Box
                                                w={6}
                                                h={4}
                                                pos="absolute"
                                                zIndex={1}
                                                top={-4}
                                                left={"calc(50% - 1px)"}
                                              >
                                                <Box
                                                  w="2px"
                                                  h="full"
                                                  bg={objectiveBg}
                                                ></Box>
                                              </Box>
                                            )}
                                            {index !==
                                              organization.visits?.length -
                                                1 && (
                                              <Box
                                                w={6}
                                                h={4}
                                                pos="absolute"
                                                zIndex={1}
                                                bottom={-4}
                                                left={"calc(50% - 1px)"}
                                              >
                                                <Box
                                                  w="2px"
                                                  h="full"
                                                  bg={objectiveBg}
                                                ></Box>
                                              </Box>
                                            )}
                                            <Badge
                                              pos="relative"
                                              zIndex={2}
                                              boxSize={6}
                                              borderRadius="full"
                                              colorScheme={
                                                COMPLIANCE_DISPLAY[
                                                  visit.compliance
                                                ]?.color ||
                                                (hasMajorNC && "error") ||
                                                (hasMinorNC && "warning") ||
                                                "purple"
                                              }
                                              justifyContent="center"
                                              alignItems="center"
                                              display="flex"
                                            >
                                              #{index + 1}
                                              <NotifBadge
                                                show={
                                                  !canSetCompliance(visit).can
                                                }
                                                message={
                                                  canSetCompliance(visit)
                                                    .message
                                                }
                                                pos="absolute"
                                                right={-0.5}
                                                bottom={-0.5}
                                                boxSize={3}
                                              />
                                            </Badge>
                                          </Box>
                                          <Badge
                                            colorScheme={
                                              COMPLIANCE_DISPLAY[
                                                visit.compliance
                                              ]?.color ||
                                              (hasMajorNC && "error") ||
                                              (hasMinorNC && "warning") ||
                                              "purple"
                                            }
                                          >
                                            {formatDateRange(
                                              visit?.date?.start,
                                              visit?.date?.end,
                                            )}
                                          </Badge>
                                          {/* Visit Compliance Badge */}
                                          {!isExpanded && visit?.compliance && (
                                            <>
                                              {" "}
                                              &middot;{" "}
                                              <Badge
                                                colorScheme={
                                                  visit.compliance ===
                                                  "COMPLIANT"
                                                    ? "success"
                                                    : visit.compliance ===
                                                        "MAJOR_NC"
                                                      ? "error"
                                                      : visit.compliance ===
                                                          "MINOR_NC"
                                                        ? "warning"
                                                        : "blue"
                                                }
                                                fontSize="xs"
                                              >
                                                {COMPLIANCE_DISPLAY[
                                                  visit.compliance
                                                ]?.label || visit.compliance}
                                              </Badge>
                                            </>
                                          )}

                                          <Spacer />
                                          {!isExpanded && (
                                            <Text
                                              fontSize="sm"
                                              color="gray.500"
                                            >
                                              ({visit?.findings?.length || 0})
                                            </Text>
                                          )}
                                          <AccordionIcon />
                                        </HStack>
                                      </AccordionButton>

                                      <AccordionPanel px={4} py={0}>
                                        <Flex gap={0}>
                                          <Box
                                            minW={6}
                                            display="flex"
                                            justifyContent="center"
                                          >
                                            {index !==
                                              organization.visits.length -
                                                1 && (
                                              <Box
                                                w="2px"
                                                h="full"
                                                bg={objectiveBg}
                                              />
                                            )}
                                          </Box>
                                          <Stack flex={1} py={4} pl={2} pr={0}>
                                            <Box>
                                              <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                color="gray.500"
                                                mb={1}
                                              >
                                                Visit Date/s
                                              </Text>
                                              <Text fontSize="sm">
                                                {formatDateRange(
                                                  visit?.date?.start,
                                                  visit?.date?.end,
                                                )}
                                              </Text>
                                            </Box>

                                            {/* Visit Compliance Section */}
                                            <Box mt={4}>
                                              <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                color="gray.500"
                                                mb={1}
                                              >
                                                Visit Compliance
                                              </Text>

                                              {canSetCompliance(visit).can ? (
                                                <>
                                                  {isScheduleOngoing &&
                                                  editingVisitComplianceFor ===
                                                    index ? (
                                                    <VisitComplianceForm
                                                      visit={visit}
                                                      onSave={(
                                                        complianceData,
                                                      ) => {
                                                        handleSaveVisitCompliance(
                                                          index,
                                                          complianceData,
                                                        );
                                                      }}
                                                      onCancel={() => {
                                                        setEditingVisitComplianceFor(
                                                          null,
                                                        );
                                                      }}
                                                      readOnly={false}
                                                      {...{ isScheduleOngoing }}
                                                    />
                                                  ) : visit?.compliance ? (
                                                    <VisitComplianceForm
                                                      visit={visit}
                                                      onSave={() => {}}
                                                      onCancel={() => {
                                                        setEditingVisitComplianceFor(
                                                          index,
                                                        );
                                                      }}
                                                      readOnly={true}
                                                      {...{ isScheduleOngoing }}
                                                    />
                                                  ) : (
                                                    <Button
                                                      size="sm"
                                                      leftIcon={<FiPlus />}
                                                      colorScheme="success"
                                                      variant="outline"
                                                      onClick={() => {
                                                        setEditingVisitComplianceFor(
                                                          index,
                                                        );
                                                      }}
                                                      w="full"
                                                      isDisabled={
                                                        !isScheduleOngoing
                                                      }
                                                    >
                                                      Set Visit Compliance
                                                    </Button>
                                                  )}
                                                </>
                                              ) : (
                                                <Text
                                                  fontSize="sm"
                                                  color="gray.500"
                                                  opacity={0.8}
                                                >
                                                  {
                                                    canSetCompliance(visit)
                                                      ?.message
                                                  }
                                                </Text>
                                              )}
                                            </Box>

                                            <Divider my={4} />
                                            {/* Findings List */}
                                            {visit.findings &&
                                              visit.findings.length > 0 && (
                                                <FindingsList
                                                  {...{ isScheduleOngoing }}
                                                  findings={visit.findings}
                                                  teamObjectives={
                                                    team?.objectives || []
                                                  }
                                                  team={team} // NEW: Pass full team object
                                                  onEdit={() => {
                                                    // onEdit is called but inline editing handles the UI
                                                  }}
                                                  onDelete={(finding) => {
                                                    handleDeleteFinding(
                                                      finding,
                                                      index,
                                                    );
                                                  }}
                                                  onSaveEdit={(
                                                    updatedFinding,
                                                  ) => {
                                                    handleEditFinding(
                                                      updatedFinding,
                                                      index,
                                                    );
                                                  }}
                                                />
                                              )}

                                            {/* Add Finding Form or Button */}
                                            {!visit?.findings ||
                                            visit.findings?.length < 1 ||
                                            showFindingFormFor.has(index) ? (
                                              <FindingsForm
                                                teamObjectives={
                                                  team?.objectives || []
                                                }
                                                team={team} // NEW: Pass full team object
                                                onAddFinding={async (
                                                  findingData,
                                                ) => {
                                                  // Calculate updated visits with new finding
                                                  const updatedVisits =
                                                    organization.visits.map(
                                                      (v, i) => {
                                                        if (i === index) {
                                                          return {
                                                            ...v,
                                                            findings: [
                                                              ...(v.findings ||
                                                                []),
                                                              findingData,
                                                            ],
                                                          };
                                                        }
                                                        return v;
                                                      },
                                                    );

                                                  // Update organization in context
                                                  dispatch({
                                                    type: "UPDATE_ORGANIZATION",
                                                    payload: {
                                                      ...organization,
                                                      visits: updatedVisits,
                                                      teamId:
                                                        organization.teamId ||
                                                        team,
                                                    },
                                                  });

                                                  try {
                                                    // Persist to server
                                                    await updateOrganization(
                                                      organization._id,
                                                      {
                                                        ...organization,
                                                        visits: updatedVisits,
                                                        teamId:
                                                          organization.teamId ||
                                                          team,
                                                      },
                                                    );

                                                    // Hide form after successful add
                                                    setShowFindingFormFor(
                                                      (prev) => {
                                                        const newSet = new Set(
                                                          prev,
                                                        );
                                                        newSet.delete(index);
                                                        return newSet;
                                                      },
                                                    );
                                                  } catch (error) {
                                                    console.error(
                                                      "Failed to add finding:",
                                                      error,
                                                    );
                                                    // Could refetch or show error
                                                  }
                                                }}
                                                onCancel={
                                                  visit.findings?.length > 0
                                                    ? () => {
                                                        setShowFindingFormFor(
                                                          (prev) => {
                                                            const newSet =
                                                              new Set(prev);
                                                            newSet.delete(
                                                              index,
                                                            );
                                                            return newSet;
                                                          },
                                                        );
                                                      }
                                                    : undefined
                                                }
                                              />
                                            ) : (
                                              isScheduleOngoing && (
                                                <Button
                                                  size="sm"
                                                  leftIcon={<FiPlus />}
                                                  onClick={() => {
                                                    setShowFindingFormFor(
                                                      (prev) => {
                                                        const newSet = new Set(
                                                          prev,
                                                        );
                                                        newSet.add(index);
                                                        return newSet;
                                                      },
                                                    );
                                                  }}
                                                  colorScheme="brandPrimary"
                                                  variant="outline"
                                                >
                                                  Add Finding
                                                </Button>
                                              )
                                            )}
                                          </Stack>
                                        </Flex>
                                      </AccordionPanel>
                                    </>
                                  )}
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        ) : (
                          <Center minH="xs" flexDir="column" gap={2}>
                            <Text color="gray.500" textAlign="center">
                              No Visits Scheduled
                            </Text>
                            {isScheduleOngoing && (
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="purple"
                                leftIcon={<FiCalendar />}
                                onClick={() => setShowVisitForm(true)}
                              >
                                Manage Visits
                              </Button>
                            )}
                          </Center>
                        )}
                      </>
                    )}

                    {/* Add Visit Section */}
                    <Box p={4} pt={2}>
                      {showVisitForm && isScheduleOngoing ? (
                        <VisitManager
                          label=""
                          visits={organization.visits || []}
                          onChange={handleAddVisit}
                          onCancel={() => setShowVisitForm(false)}
                        />
                      ) : (
                        isScheduleOngoing &&
                        organization?.visits?.length > 0 && (
                          <Flex justifyContent="flex-end">
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="purple"
                              leftIcon={<FiCalendar />}
                              onClick={() => setShowVisitForm(true)}
                            >
                              Manage Visits
                            </Button>
                          </Flex>
                        )
                      )}
                    </Box>
                  </ResponsiveTabPanel>
                  {/* Team Details Tab */}
                  <ResponsiveTabPanel>
                    {/* Auditors Section - Always Visible */}
                    <Box mb={4}>
                      <Text fontSize="sm" color="gray.500" mb={2}>
                        Auditors ({auditors.length})
                      </Text>
                      {auditors && auditors.length > 0 ? (
                        <Wrap>
                          {auditors.map((auditor, index) => {
                            const userId = auditor._id || auditor.id || auditor;
                            const fullName =
                              auditor.firstName && auditor.lastName
                                ? `${auditor.firstName} ${auditor.lastName}`
                                : auditor.name || `User ${index + 1}`;
                            const employeeId = auditor.employeeId;
                            const email = auditor.email;

                            return (
                              <WrapItem key={userId || index}>
                                <Tooltip
                                  label={
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="bold">{fullName}</Text>
                                      {email && (
                                        <Text fontSize="xs">{email}</Text>
                                      )}
                                      {employeeId && (
                                        <Text fontSize="xs">{employeeId}</Text>
                                      )}
                                    </VStack>
                                  }
                                  hasArrow
                                  placement="top"
                                >
                                  <Box
                                    px={3}
                                    py={2}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    _hover={{ bg: hoverBg }}
                                    cursor="pointer"
                                    transition="all 0.2s"
                                  >
                                    <HStack spacing={2}>
                                      <Avatar name={fullName} size="xs" />
                                      <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {fullName}
                                        </Text>
                                        {employeeId && (
                                          <Text fontSize="xs" color="gray.500">
                                            {employeeId}
                                          </Text>
                                        )}
                                      </VStack>
                                    </HStack>
                                  </Box>
                                </Tooltip>
                              </WrapItem>
                            );
                          })}
                        </Wrap>
                      ) : (
                        <Text fontSize="sm" color="gray.500" fontStyle="italic">
                          No auditors assigned
                        </Text>
                      )}
                    </Box>
                  </ResponsiveTabPanel>
                  {/* Team Details Tab */}
                  <ResponsiveTabPanel>
                    <VStack align="stretch" spacing={4}>
                      {/* Team Description */}
                      {team?.description && (
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Description
                          </Text>
                          <Text fontSize="sm">{team.description}</Text>
                        </Box>
                      )}

                      {/* Team Objectives */}
                      {team?.objectives && team.objectives.length > 0 && (
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            Objectives
                          </Text>
                          <Stack spacing={3}>
                            {team.objectives.map((objective, index) => (
                              <Box
                                key={objective.id || `objective-${index}`}
                                p={3}
                                borderWidth={1}
                                borderRadius="md"
                                borderColor={borderColor}
                                bg={objectiveBg}
                              >
                                <Flex
                                  justify="space-between"
                                  align="start"
                                  mb={2}
                                >
                                  <Text fontWeight="bold" fontSize="sm">
                                    {objective.title}
                                  </Text>
                                  <Badge
                                    colorScheme={
                                      WEIGHT_COLORS[objective.weight]
                                    }
                                    fontSize="xs"
                                  >
                                    {objective.weight}
                                  </Badge>
                                </Flex>
                                <Text fontSize="sm" color="gray.600">
                                  {objective.description}
                                </Text>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* Team Timestamps */}
                      <Flex gap={6} flexWrap="wrap">
                        {team?.createdAt && (
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Team Created
                            </Text>
                            <Text fontSize="sm">
                              <Timestamp date={team.createdAt} />
                            </Text>
                          </Box>
                        )}
                        {team?.updatedAt && (
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Last Updated
                            </Text>
                            <Text fontSize="sm">
                              <Timestamp date={team.updatedAt} />
                            </Text>
                          </Box>
                        )}
                      </Flex>

                      {/* View Team Button */}
                      {team?._id && (
                        <Box>
                          <Button
                            as={RouterLink}
                            to={`/teams/${team._id}`}
                            target="_blank"
                            rightIcon={<FiExternalLink />}
                            variant="outline"
                            colorScheme="brandPrimary"
                            size="sm"
                            width="full"
                          >
                            View Team in New Tab
                          </Button>
                        </Box>
                      )}
                    </VStack>
                  </ResponsiveTabPanel>
                  {/* Quality Documents Tab */}
                  <ResponsiveTabPanel pt={0} px={0}>
                    {team?._id || team?.id ? (
                      <TeamQualityDocuments
                        readOnly
                        teamId={team._id || team.id}
                        isActive={
                          isExpanded &&
                          activeTabIndex === TAB_INDICES.QUALITY_DOCUMENTS
                        }
                      />
                    ) : (
                      <Center minH="xs">
                        <Text color="gray.500" textAlign="center">
                          No team assigned to this organization
                        </Text>
                      </Center>
                    )}
                  </ResponsiveTabPanel>
                  {/* Other Documents Tab */}
                  <ResponsiveTabPanel px={4}>
                    {organization?.team?.folderId ? (
                      documentsLoading ? (
                        <Center minH="xs">
                          <Text color="gray.500">Loading documents...</Text>
                        </Center>
                      ) : documents && documents.length > 0 ? (
                        <GridView
                          mini={true}
                          documents={documents}
                          selectedDocument={selectedDocument}
                          onDocumentClick={(doc) => {
                            handleDocumentClick(doc);
                          }}
                        />
                      ) : (
                        <Center minH="xs">
                          <Text color="gray.500" textAlign="center">
                            No documents found
                          </Text>
                        </Center>
                      )
                    ) : (
                      <Center minH="xs">
                        <Text color="gray.500" textAlign="center">
                          No folder assigned to this organization
                        </Text>
                      </Center>
                    )}
                  </ResponsiveTabPanel>
                  {/* Previous Audit Findings Tab */}
                  <ResponsiveTabPanel px={0} pt={0}>
                    <PreviousAuditFindings
                      {...{ schedule, organization }}
                      auditScheduleId={organization?.auditScheduleId}
                      isActive={
                        isExpanded &&
                        activeTabIndex === TAB_INDICES.PREVIOUS_AUDIT_FINDINGS
                      }
                    />
                  </ResponsiveTabPanel>
                </ResponsiveTabPanels>
              </ResponsiveTabs>
            </Box>
          </Collapse>
        </CardBody>
      </Card>
      <DocumentDrawer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={closeDocumentDrawer}
      />
      <SetVerdictModal
        isOpen={isVerdictModalOpen}
        onClose={() => setIsVerdictModalOpen(false)}
        organization={organization}
        calculatedVerdict={calculatedVerdict}
        onSave={handleSetVerdict}
      />
    </>
  );
};

export default OrganizationCard;
