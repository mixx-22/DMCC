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
import apiService from "../../../services/api";

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
  standardClausesFromParent = null,
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
  const [tabColor, brandPrimaryColor, brandSecondaryColor] = useToken(
    "colors",
    ["gray.500", "brandPrimary.600", "brandSecondary.600"],
  );
  const $tabColor = cssVar("tabs-color");

  const isScheduleOngoing = useMemo(() => schedule?.status === 0, [schedule]);

  // State to store loaded standard clauses
  const [standardClauses, setStandardClauses] = useState([]);
  const [loadingClauses, setLoadingClauses] = useState(false);

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

  // Fetch standard clauses when component mounts or when standard changes
  // Use clauses from parent if available, otherwise fetch
  useEffect(() => {
    // If parent has provided clauses (even if empty array), use them directly
    // This prevents duplicate fetches when parent has already fetched
    if (standardClausesFromParent !== null) {
      setStandardClauses(standardClausesFromParent);
      return;
    }

    const fetchStandardClauses = async () => {
      // Get standard ID or object from schedule
      const standard = schedule?.standard;
      
      // If standard is null/undefined, or if it already has clauses, no need to fetch
      if (!standard) {
        setStandardClauses([]);
        return;
      }
      
      // If standard is an object and already has clauses, use them
      if (typeof standard === 'object' && standard.clauses && Array.isArray(standard.clauses)) {
        setStandardClauses(standard.clauses);
        return;
      }
      
      // Extract standard ID - could be string ID or object with id property
      const standardId = typeof standard === 'string' ? standard : (standard.id || standard._id);
      
      // If no valid ID, can't fetch
      if (!standardId) {
        setStandardClauses([]);
        return;
      }
      
      // Don't fetch if already loading
      if (loadingClauses) return;
      
      setLoadingClauses(true);
      
      try {
        const USE_API = import.meta.env.VITE_USE_API !== "false";
        const STANDARDS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_STANDARDS || "/standards";
        
        if (!USE_API) {
          // Mock data for development - use the same structure as StandardPage
          const MOCK_CLAUSES = [
            {
              id: "003073c2-e848-4725-983c-553283d77460",
              clause: "4",
              title: "Context of the Organization",
              subClauses: [
                { id: "97124ee1-8267-45c7-b381-6e2e39080357", clause: "4.1", description: "Context of the ITSMS." },
                { id: "1fc0e589-89a3-4248-a94f-7e21a218358a", clause: "4.2", description: "Interested parties." },
                { id: "8a6a88af-02f0-4b06-a40f-0b55a4ffa17c", clause: "4.3", description: "Scope of the ITSMS." },
                { id: "b8e835b1-77ca-48ed-a0de-667645ae4d97", clause: "4.4", description: "Service management system." },
              ],
            },
            {
              id: "a8060b89-6c41-4ab6-bdff-dcdb2d4a59eb",
              clause: "5",
              title: "Leadership",
              subClauses: [
                { id: "4dcdc959-023f-4930-ab08-15ac49f5ddb1", clause: "5.1", description: "Leadership and commitment." },
                { id: "7f3f5c1e-5240-41bd-90ba-0126d9af5b80", clause: "5.2", description: "Service management policy." },
                { id: "84887b66-0e22-4a9d-8bb3-a81de9d37f34", clause: "5.3", description: "Roles and responsibilities." },
              ],
            },
            {
              id: "84862eb4-92e1-44c5-9a65-37d5dfb48012",
              clause: "6",
              title: "Planning",
              subClauses: [
                { id: "f0782c18-9d9f-4e7f-ba24-e284ff19c6e3", clause: "6.1", description: "Risks and opportunities." },
                { id: "9e0f7878-00c6-46c5-a938-063c9477cc5b", clause: "6.2", description: "Service management objectives." },
              ],
            },
            {
              id: "20808972-d3b2-4539-8d77-14b08919e5df",
              clause: "7",
              title: "Support",
              subClauses: [
                { id: "b48fc49e-519e-451e-a681-6bcc20f034d4", clause: "7.1", description: "Resources." },
                { id: "69b0ca89-ab5a-4e14-a03d-b03471668feb", clause: "7.2", description: "Competence." },
                { id: "6ab7935c-387e-4f97-a03d-c407c7ca6f37", clause: "7.3", description: "Awareness." },
                { id: "5e1c70ef-a8f6-4c7b-80b5-a55adda31ea6", clause: "7.4", description: "Communication." },
                { id: "f501418a-84ec-4972-8728-d0667e954971", clause: "7.5", description: "Documented information." },
              ],
            },
            {
              id: "89cf6146-2385-4273-8bf3-d2ef73407598",
              clause: "8",
              title: "Operation",
              subClauses: [
                { id: "09577f7b-91be-4153-b982-0d863122be80", clause: "8.1", description: "Service portfolio management." },
                { id: "7d27a6be-e811-41d7-9b36-a9440f3f3cd1", clause: "8.2", description: "Service level management." },
                { id: "7ac4cc0f-499e-4ee7-aa7f-2ab215d4f0d2", clause: "8.3", description: "Incident and request management." },
                { id: "049be948-ccdf-4374-88c9-08fa8e059eb6", clause: "8.4", description: "Change management." },
                { id: "c4268592-d7c6-4078-a8e7-7c0a08b5fb4c", clause: "8.5", description: "Configuration management." },
              ],
            },
            {
              id: "9dd36a4f-f7aa-4c63-b3ae-f2572d3304d9",
              clause: "9",
              title: "Performance Evaluation",
              subClauses: [
                { id: "e3965044-cd59-43d5-a550-44181faa874f", clause: "9.1", description: "Monitoring and measurement." },
                { id: "68ac1307-2493-42ba-8ab2-f4e93a6bc8c0", clause: "9.2", description: "Internal audit." },
                { id: "c381e4db-7c0b-427d-8330-462a2e5e4226", clause: "9.3", description: "Management review." },
              ],
            },
            {
              id: "66be6e11-34eb-4554-8889-623e942b27d1",
              clause: "10",
              title: "Improvement",
              subClauses: [
                { id: "46b5d4a8-a9ba-4dae-95b7-896ddac43a01", clause: "10.1", description: "Nonconformity and corrective action." },
                { id: "2f71bf7d-8a5b-491c-844c-b350d39083e1", clause: "10.2", description: "Continual improvement." },
              ],
            },
          ];
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          setStandardClauses(MOCK_CLAUSES);
          setLoadingClauses(false);
          return;
        }
        
        // Fetch from API
        const response = await apiService.request(`${STANDARDS_ENDPOINT}/${standardId}`, {
          method: "GET",
        });
        
        const data = response?.data || response;
        const clauses = data?.clauses || [];
        setStandardClauses(clauses);
      } catch (error) {
        console.error("Failed to fetch standard clauses:", error);
        setStandardClauses([]);
      } finally {
        setLoadingClauses(false);
      }
    };
    
    fetchStandardClauses();
  }, [schedule?.standard, standardClausesFromParent]);

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

    const logoBase64 = `data:image/png;base64,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`;
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
              background:  ${brandPrimaryColor};
              height: 35px;
              margin: -20px -20px 20px -20px;
            }
            .logo-container {
              text-align: center;
              margin: 20px 0 10px 0;
            }
            .logo {
              height: 50px;
              width: auto ;
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
              background: ${brandPrimaryColor};
              color: white;
              padding: 10px;
              text-align: center;
              font-weight: bold;
              border: 1px solid ${brandPrimaryColor};
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
              display: flex;
              justify-content: space-between;
              gap: 60px;
              margin-top: 60px;
            }
            .signature-block {
              flex: 1;
              text-align: center;
            }
            .signature-line {
              border-bottom: 1px solid #000;
              height: 32px;
              margin-bottom: 8px;
            }
            .signature-label {
              font-size: 12px;
              color: #555;
            }
            .footer-bar {
              background: ${brandSecondaryColor};
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
            <img class="logo" src="${logoBase64}" />
          </div>
          
          <div class="title">Audit Report</div>
          
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
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-label">Auditee Name & Signature</div>
            </div>

            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-label">Auditor Name & Signature</div>
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
              {!isScheduleOngoing && (
                <IconButton
                  icon={<FiPrinter />}
                  size="sm"
                  variant="outline"
                  colorScheme="purple"
                  aria-label={"Print Audit Report"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrintAuditReport();
                  }}
                />
              )}
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
                                                  bg="gray.300"
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
                                                  bg="gray.300"
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
                                                bg="gray.300"
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
                                                  auditStandardClauses={standardClauses}
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
                                                auditStandardClauses={standardClauses}
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
