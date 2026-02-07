import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
  IconButton,
  CardBody,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Textarea,
  Select,
  HStack,
  FormHelperText,
  Badge,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepSeparator,
  useSteps,
  Divider,
  Stack,
  Editable,
  EditableTextarea,
  EditablePreview,
  useDisclosure,
  InputGroup,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiMoreVertical,
  FiTrash2,
  FiChevronRight,
  FiChevronLeft,
  FiEdit,
  FiCheckCircle,
  FiPrinter,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import {
  useScheduleProfile,
  useOrganizations,
} from "../../context/_useContext";
import {
  getAuditTypeLabel,
  generateAuditCode,
  getAuditTypePrefix,
} from "../../utils/auditHelpers";
import { validateAuditScheduleClosure } from "../../utils/helpers";
import EditAuditDetailsModal from "./EditAuditDetailsModal";
import CloseAuditModal from "./CloseAuditModal";
import { OrganizationsProvider } from "../../context/OrganizationsContext";
import Timestamp from "../../components/Timestamp";
import Organizations from "./Organizations";
import ReportsTab from "./ReportsTab";
import PreviousAuditAsyncSelect from "../../components/PreviousAuditAsyncSelect";
import StandardsAsyncSelect from "../../components/StandardsAsyncSelect";

// Inner component that uses organizations context
const SchedulePageContent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    schedule,
    initialScheduleData,
    loading,
    updateSchedule,
    createSchedule,
    deleteSchedule,
  } = useScheduleProfile();
  const isScheduleOngoing = useMemo(() => schedule?.status === 0, [schedule]);

  // Get organizations from context
  const { organizations } = useOrganizations();

  const errorColor = useColorModeValue("error.600", "error.400");
  const summaryCardBg = useColorModeValue("gray.50", "gray.700");

  const isNewSchedule = id === "new";
  const [formData, setFormData] = useState(initialScheduleData);
  const [validationErrors, setValidationErrors] = useState({});
  const titleTextareaRef = useRef(null);
  const descriptionTextareaRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  // Modal state for editing audit details
  const {
    isOpen: isEditDetailsOpen,
    onOpen: onEditDetailsOpen,
    onClose: onEditDetailsClose,
  } = useDisclosure();

  // Modal state for closing audit
  const {
    isOpen: isCloseAuditOpen,
    onOpen: onCloseAuditOpen,
    onClose: onCloseAuditClose,
  } = useDisclosure();

  const [isClosingAudit, setIsClosingAudit] = useState(false);

  const steps = [
    { title: "Basic Information", fields: ["title", "description"] },
    {
      title: "Audit Details",
      fields: ["auditCode", "auditType", "standard"],
    },
    { title: "Review", fields: [] },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  useEffect(() => {
    if (schedule && !isNewSchedule) {
      setFormData({
        ...initialScheduleData,
        ...schedule,
      });
      // Don't force re-render on every update - only on initial load
      // Editable components will update naturally via formData changes
    }
  }, [schedule, isNewSchedule, initialScheduleData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Auto-generate audit code when type, year, or number changes
      if (
        field === "auditType" ||
        field === "auditYear" ||
        field === "auditNumber"
      ) {
        const type = field === "auditType" ? value : prev.auditType;
        const year =
          field === "auditYear"
            ? value
            : prev.auditYear || new Date().getFullYear().toString();
        const number = field === "auditNumber" ? value : prev.auditNumber || "";

        if (type) {
          updated.auditCode = generateAuditCode(type, year, number);
        }
      }

      return updated;
    });

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    const currentFields = steps[step]?.fields || [];

    currentFields.forEach((field) => {
      if (field === "title" && !formData.title.trim()) {
        errors.title = "Title is required";
      }
      if (field === "description" && !formData.description.trim()) {
        errors.description = "Description is required";
      }
      if (field === "auditCode" && !formData.auditCode.trim()) {
        errors.auditCode = "Audit code is required";
      }
      if (field === "auditType" && !formData.auditType) {
        errors.auditType = "Audit type is required";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    try {
      // Normalize the data before submitting
      const submitData = {
        ...formData,
        // Convert standard object to string if it's an object
        standard: formData.standard?.standard || formData.standard || "",
        // previousAudit is already in the right format (object with _id, title, auditCode)
      };

      if (isNewSchedule) {
        const result = await createSchedule(submitData);
        if (result?.id || result?._id) {
          navigate(`/audit-schedule/${result.id || result._id}`, {
            replace: true,
          });
        } else {
          navigate("/audit-schedules");
        }
      } else {
        await updateSchedule(id, submitData);
        // Stay on current page - context is already updated
      }
    } catch (error) {
      // Error toast is handled by context
      console.error("Failed to save schedule:", error);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Schedule?",
      text: `Are you sure you want to delete "${formData.title}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteSchedule(id, formData.title);
        navigate("/audit-schedules");
      } catch (error) {
        // Error toast is handled by context
        console.error("Failed to delete schedule:", error);
      }
    }
  };

  const handlePrintSchedule = () => {
    try {
      // Create print window
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("Please allow popups to print the schedule");
        return;
      }

      // Generate HTML content
      const htmlContent = generateScheduleHTML();

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
      console.error("Error printing schedule:", error);
      alert("Failed to generate print schedule: " + error.message);
    }
  };

  const generateScheduleHTML = () => {
    const brandPrimaryColor = "#6B46C1";
    const brandSecondaryColor = "#9F7AEA";

    const logoBase64 = `data:image/png;base64,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`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Audit Schedule - ${schedule?.title || formData?.title || ""}</title>
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
              background: ${brandPrimaryColor};
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
              min-width: 180px;
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
              text-align: left;
              font-weight: bold;
              border: 1px solid ${brandPrimaryColor};
            }
            td {
              border: 1px solid #ccc;
              padding: 8px;
              vertical-align: top;
              color: #000;
            }
            .organizations-table th:first-child {
              width: 50px;
              text-align: center;
            }
            .organizations-table th:nth-child(2) {
              width: 35%;
            }
            .organizations-table td:first-child {
              text-align: center;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 3px;
              font-size: 11px;
              font-weight: bold;
            }
            .badge-green { background-color: #d4edda; color: #155724; }
            .badge-yellow { background-color: #fff3cd; color: #856404; }
            .footer-bar {
              background: ${brandSecondaryColor};
              height: 30px;
              margin: 40px -20px -20px -20px;
            }
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
          
          <div class="title">Audit Schedule</div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Audit Schedule Title :</span>
              <span class="info-value">${schedule?.title || formData?.title || ""}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Audit Code :</span>
              <span class="info-value">${schedule?.auditCode || formData?.auditCode || "-"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Audit Type :</span>
              <span class="info-value">${schedule?.auditType ? getAuditTypeLabel(schedule.auditType) : formData?.auditType ? getAuditTypeLabel(formData.auditType) : "-"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Standard :</span>
              <span class="info-value">${schedule?.standard || formData?.standard || "-"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status :</span>
              <span class="info-value">
                ${schedule?.status === 1 || formData?.status === 1 ? '<span class="badge badge-green">Closed</span>' : '<span class="badge badge-yellow">Ongoing</span>'}
              </span>
            </div>
          </div>

          ${
            schedule?.description || formData?.description
              ? `
          <div style="margin: 20px 0;">
            <div style="font-weight: 600; margin-bottom: 5px;">Description:</div>
            <div style="border: 1px solid #ccc; padding: 10px; background: #fafafa;">
              ${schedule?.description || formData?.description || ""}
            </div>
          </div>
          `
              : ""
          }

          ${
            organizations && organizations.length > 0
              ? `
          <table class="organizations-table">
            <tr>
              <th>#</th>
              <th>Organization</th>
              <th>Audit Location</th>
              <th>Status</th>
            </tr>
            ${organizations
              .map(
                (org, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${org.team?.name || "N/A"}</td>
              <td>${org.team?.description || "-"}</td>
              <td>${org.verdict ? `<span class="badge badge-green">Completed</span>` : `<span class="badge badge-yellow">Pending</span>`}</td>
            </tr>
            `,
              )
              .join("")}
          </table>
          `
              : ""
          }

          <div class="footer-bar"></div>
        </body>
      </html>
    `;
  };

  const handlePrintAuditSummary = () => {
    try {
      // Create print window
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("Please allow popups to print the audit summary");
        return;
      }

      // Generate HTML content
      const htmlContent = generateAuditSummaryHTML();

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
      console.error("Error printing audit summary:", error);
      alert("Failed to generate print audit summary: " + error.message);
    }
  };

  const generateAuditSummaryHTML = () => {
    const brandPrimaryColor = "#6B46C1";
    const brandSecondaryColor = "#9F7AEA";

    const logoBase64 = `data:image/png;base64,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`;

    // Calculate summary data
    const findingsCount = {
      MAJOR_NC: 0,
      MINOR_NC: 0,
      OBSERVATIONS: 0,
      total: 0,
    };

    const organizationSummaries =
      organizations?.map((org, index) => {
        const allFindings =
          org?.visits?.flatMap((visit) => visit.findings || []) || [];
        const majorNC = allFindings.filter(
          (f) => f.compliance === "MAJOR_NC",
        ).length;
        const minorNC = allFindings.filter(
          (f) => f.compliance === "MINOR_NC",
        ).length;
        const observations = allFindings.filter(
          (f) => f.compliance === "OBSERVATIONS",
        ).length;

        findingsCount.MAJOR_NC += majorNC;
        findingsCount.MINOR_NC += minorNC;
        findingsCount.OBSERVATIONS += observations;
        findingsCount.total += allFindings.length;

        return {
          number: index + 1,
          organization: org.team?.name || "N/A",
          location: org.team?.description || "-",
          majorNC,
          minorNC,
          observations,
          total: allFindings.length,
          verdict: org.verdict || "Pending",
        };
      }) || [];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Audit Summary - ${schedule?.title || formData?.title || ""}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            @page {
              size: landscape;
              margin: 15mm;
            }
            body {
              font-family: Arial, sans-serif;
              color: #000;
              padding: 20px;
              background: white;
            }
            .header-bar {
              background: ${brandPrimaryColor};
              height: 35px;
              margin: -20px -20px 20px -20px;
            }
            .logo-container {
              text-align: center;
              margin: 10px 0;
            }
            .logo {
              height: 40px;
              width: auto;
            }
            .title {
              text-align: center;
              font-size: 22px;
              font-weight: bold;
              margin: 15px 0;
              color: #000;
            }
            .subtitle {
              text-align: center;
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            .summary-stats {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin: 20px 0;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 5px;
            }
            .stat-item {
              text-align: center;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: ${brandPrimaryColor};
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 11px;
            }
            th {
              background: ${brandPrimaryColor};
              color: white;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              border: 1px solid ${brandPrimaryColor};
            }
            td {
              border: 1px solid #ccc;
              padding: 6px;
              text-align: center;
              color: #000;
            }
            td:nth-child(2),
            td:nth-child(3) {
              text-align: left;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 3px;
              font-size: 10px;
              font-weight: bold;
            }
            .badge-green { background-color: #d4edda; color: #155724; }
            .badge-red { background-color: #f8d7da; color: #721c24; }
            .badge-yellow { background-color: #fff3cd; color: #856404; }
            .badge-blue { background-color: #d1ecf1; color: #0c5460; }
            .footer-bar {
              background: ${brandSecondaryColor};
              height: 25px;
              margin: 30px -20px -20px -20px;
            }
            .footer-info {
              text-align: center;
              font-size: 10px;
              color: #666;
              margin-top: 10px;
            }
            .page-break {
              page-break-after: always;
            }
            .findings-section {
              margin-top: 30px;
            }
            .org-header {
              background: ${brandPrimaryColor};
              color: white;
              padding: 10px 15px;
              font-size: 14px;
              font-weight: bold;
              margin-top: 20px;
              border-radius: 5px;
            }
            .findings-table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0 30px 0;
              font-size: 10px;
            }
            .findings-table th {
              background: #f0f0f0;
              color: #000;
              padding: 6px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ccc;
            }
            .findings-table td {
              border: 1px solid #ccc;
              padding: 6px;
              vertical-align: top;
              text-align: left;
            }
            .findings-table th:first-child,
            .findings-table td:first-child {
              width: 30px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header-bar"></div>
          
          <div class="logo-container">
            <img class="logo" src="${logoBase64}" />
          </div>
          
          <div class="title">Audit Summary Report</div>
          <div class="subtitle">${schedule?.title || formData?.title || ""}</div>

          <div class="summary-stats">
            <div class="stat-item">
              <div class="stat-value">${organizationSummaries.length}</div>
              <div class="stat-label">Organizations Audited</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${findingsCount.MAJOR_NC}</div>
              <div class="stat-label">Major NC</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${findingsCount.MINOR_NC}</div>
              <div class="stat-label">Minor NC</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${findingsCount.OBSERVATIONS}</div>
              <div class="stat-label">Observations</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${findingsCount.total}</div>
              <div class="stat-label">Total Findings</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th style="width: 25%;">Organization</th>
                <th style="width: 25%;">Location</th>
                <th style="width: 10%;">Major NC</th>
                <th style="width: 10%;">Minor NC</th>
                <th style="width: 10%;">Observations</th>
                <th style="width: 10%;">Total Findings</th>
                <th style="width: 10%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${organizationSummaries
                .map(
                  (org) => `
                <tr>
                  <td>${org.number}</td>
                  <td>${org.organization}</td>
                  <td>${org.location}</td>
                  <td>${org.majorNC > 0 ? `<span class="badge badge-red">${org.majorNC}</span>` : "-"}</td>
                  <td>${org.minorNC > 0 ? `<span class="badge badge-yellow">${org.minorNC}</span>` : "-"}</td>
                  <td>${org.observations > 0 ? org.observations : "-"}</td>
                  <td><strong>${org.total}</strong></td>
                  <td>${org.verdict !== "Pending" ? `<span class="badge badge-green">Completed</span>` : `<span class="badge badge-yellow">Pending</span>`}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer-info">
            Audit Code: ${schedule?.auditCode || formData?.auditCode || "-"} | 
            Type: ${schedule?.auditType ? getAuditTypeLabel(schedule.auditType) : formData?.auditType ? getAuditTypeLabel(formData.auditType) : "-"} | 
            Standard: ${schedule?.standard || formData?.standard || "-"}
          </div>

          <div class="footer-bar"></div>

          <!-- Page Break -->
          <div class="page-break"></div>

          <!-- Detailed Findings per Organization -->
          <div class="findings-section">
            <div class="title" style="margin-top: 20px;">Detailed Findings by Organization</div>
            
            ${
              organizations && organizations.length > 0
                ? organizations
                    .map((org, orgIndex) => {
                      const allFindings =
                        org?.visits?.flatMap((visit, visitIndex) =>
                          (visit.findings || []).map((finding) => ({
                            ...finding,
                            visitNumber: visitIndex + 1,
                            visitDate: visit.date,
                          })),
                        ) || [];

                      if (allFindings.length === 0) {
                        return `
                  <div class="org-header">
                    ${orgIndex + 1}. ${org.team?.name || "N/A"} - ${org.team?.description || "-"}
                  </div>
                  <p style="padding: 10px; color: #666; font-size: 11px;">No findings recorded for this organization.</p>
                `;
                      }

                      return `
                <div class="org-header">
                  ${orgIndex + 1}. ${org.team?.name || "N/A"} - ${org.team?.description || "-"}
                </div>
                <table class="findings-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th style="width: 8%;">Visit</th>
                      <th style="width: 20%;">Finding Title</th>
                      <th style="width: 15%;">Clause</th>
                      <th style="width: 10%;">Status</th>
                      <th style="width: 37%;">Details</th>
                      <th style="width: 10%;">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${allFindings
                      .map((finding, idx) => {
                        const objectives =
                          finding.objectives && finding.objectives.length > 0
                            ? finding.objectives
                                .map((obj) => obj.title)
                                .join(", ")
                            : finding.objective || "-";

                        const statusColor =
                          finding.compliance === "MAJOR_NC"
                            ? "badge-red"
                            : finding.compliance === "MINOR_NC"
                              ? "badge-yellow"
                              : finding.compliance === "OBSERVATIONS"
                                ? "badge-blue"
                                : "";

                        const statusLabel =
                          finding.compliance === "MAJOR_NC"
                            ? "Major NC"
                            : finding.compliance === "MINOR_NC"
                              ? "Minor NC"
                              : finding.compliance === "OBSERVATIONS"
                                ? "Observation"
                                : finding.compliance || "-";

                        return `
                        <tr>
                          <td>${idx + 1}</td>
                          <td style="text-align: center;">${finding.visitNumber || "-"}</td>
                          <td>${finding.title || "-"}</td>
                          <td>${objectives}</td>
                          <td><span class="badge ${statusColor}">${statusLabel}</span></td>
                          <td>${finding.details || "-"}</td>
                          <td>${finding.recommendation || "-"}</td>
                        </tr>
                      `;
                      })
                      .join("")}
                  </tbody>
                </table>
              `;
                    })
                    .join("")
                : '<p style="padding: 20px; text-align: center; color: #666;">No organizations found.</p>'
            }
          </div>

          <div class="footer-bar"></div>
        </body>
      </html>
    `;
  };

  const handleCancel = () => {
    navigate("/audit-schedules");
  };

  // Helper function to build update payload with only business fields
  const buildUpdatePayload = (overrides = {}) => {
    return {
      title: formData.title,
      description: formData.description,
      auditCode: formData.auditCode,
      auditType: formData.auditType,
      standard: formData.standard?.standard || formData.standard || "",
      status: formData.status,
      ...overrides,
    };
  };

  const handleTitleBlur = async (newTitle) => {
    const trimmedTitle = newTitle?.trim();

    if (!trimmedTitle) {
      // Title cannot be empty - will revert via schedule key
      return;
    }

    if (trimmedTitle === formData?.title) {
      return;
    }

    // Cancel any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    try {
      const updatePayload = buildUpdatePayload({ title: trimmedTitle });
      const updatedSchedule = await updateSchedule(id, updatePayload);
      setFormData((prev) => ({ ...prev, ...updatedSchedule }));
    } catch (error) {
      // Error toast is handled by context
      console.error("Failed to update title:", error);
      // Editable will revert via schedule key
    }
  };

  const handleDescriptionBlur = async (newDescription) => {
    const trimmedDescription = newDescription?.trim() || "";

    if (trimmedDescription === (formData?.description?.trim() || "")) {
      return;
    }

    // Cancel any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    try {
      const updatePayload = buildUpdatePayload({
        description: trimmedDescription,
      });
      const updatedSchedule = await updateSchedule(id, updatePayload);
      setFormData((prev) => ({ ...prev, ...updatedSchedule }));
    } catch (error) {
      // Error toast is handled by context
      console.error("Failed to update description:", error);
      // Editable will revert via schedule key
    }
  };

  const handleSaveAuditDetails = async (detailsData) => {
    try {
      const updatePayload = buildUpdatePayload({
        auditCode: detailsData.auditCode,
        auditType: detailsData.auditType,
        standard: detailsData.standard?.standard || detailsData.standard || "",
        previousAudit: detailsData.previousAudit,
      });
      const updatedSchedule = await updateSchedule(id, updatePayload);
      setFormData((prev) => ({ ...prev, ...updatedSchedule }));
      onEditDetailsClose();
    } catch (error) {
      // Error toast is handled by context
      console.error("Failed to update audit details:", error);
      // Don't close modal on error so user can retry
    }
  };

  const handleCloseAudit = async () => {
    setIsClosingAudit(true);
    try {
      const updatePayload = buildUpdatePayload({ status: 1 });
      const updatedSchedule = await updateSchedule(id, updatePayload);
      setFormData((prev) => ({ ...prev, ...updatedSchedule }));
      onCloseAuditClose();
    } catch (error) {
      console.error("Failed to close audit schedule:", error);
    } finally {
      setIsClosingAudit(false);
    }
  };

  const handleReopenAudit = async () => {
    const result = await Swal.fire({
      title: "Reopen Audit Schedule?",
      text: "This will set the audit schedule status back to Ongoing.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reopen it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const updatePayload = buildUpdatePayload({ status: 0 });
        const updatedSchedule = await updateSchedule(id, updatePayload);
        setFormData((prev) => ({ ...prev, ...updatedSchedule }));
      } catch (error) {
        console.error("Failed to reopen audit schedule:", error);
      }
    }
  };

  // Validate if audit can be closed
  const auditValidation = validateAuditScheduleClosure(organizations);

  if (loading) {
    return (
      <Box>
        <PageHeader>
          <Heading variant="pageTitle">
            {isNewSchedule ? "Create Audit Schedule" : "Schedule Details"}
          </Heading>
        </PageHeader>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brandPrimary.500" />
        </Flex>
      </Box>
    );
  }

  // Render multi-step form for new schedules
  if (isNewSchedule) {
    return (
      <Box>
        <PageHeader>
          <Flex justify="space-between" align="center" w="full">
            <HStack>
              <IconButton
                icon={<FiArrowLeft />}
                onClick={handleCancel}
                aria-label="Back to schedules"
                variant="ghost"
              />
              <Heading variant="pageTitle">Create New Schedule</Heading>
            </HStack>
          </Flex>
        </PageHeader>

        <Stepper index={activeStep} colorScheme="brandPrimary" mb={6}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Step 1: Basic Information */}
              {activeStep === 0 && (
                <>
                  <Heading size="md" mb={2}>
                    Basic Information
                  </Heading>
                  <FormControl isRequired isInvalid={!!validationErrors.title}>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                      placeholder="e.g., Annual Financial Audit 2024"
                    />
                    <FormErrorMessage>
                      {validationErrors.title}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isRequired
                    isInvalid={!!validationErrors.description}
                  >
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                      placeholder="Describe the purpose and scope of this audit"
                      rows={5}
                    />
                    <FormErrorMessage>
                      {validationErrors.description}
                    </FormErrorMessage>
                  </FormControl>
                </>
              )}

              {/* Step 2: Audit Details */}
              {activeStep === 1 && (
                <>
                  <Heading size="md" mb={2}>
                    Audit Details
                  </Heading>
                  <FormControl
                    isRequired
                    isInvalid={!!validationErrors.auditType}
                  >
                    <FormLabel>Audit Type</FormLabel>
                    <Select
                      value={formData.auditType}
                      onChange={(e) =>
                        handleFieldChange("auditType", e.target.value)
                      }
                      placeholder="Select audit type"
                    >
                      <option value="internal">Internal Audit</option>
                      <option value="external">External Audit</option>
                      <option value="compliance">Compliance Audit</option>
                      <option value="financial">Financial Audit</option>
                      <option value="operational">Operational Audit</option>
                    </Select>
                    <FormErrorMessage>
                      {validationErrors.auditType}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isRequired
                    isInvalid={!!validationErrors.auditCode}
                  >
                    <FormLabel>Audit Code</FormLabel>
                    <HStack spacing={2}>
                      <InputGroup size="md" flex="0 0 100px">
                        <Input
                          value={getAuditTypePrefix(formData.auditType) || ""}
                          isReadOnly
                          placeholder="AUD"
                          textAlign="center"
                        />
                      </InputGroup>
                      <InputGroup size="md" flex="0 0 100px">
                        <Input
                          value={formData.auditYear || ""}
                          onChange={(e) =>
                            handleFieldChange("auditYear", e.target.value)
                          }
                          placeholder="YYYY"
                          textAlign="center"
                          maxLength={4}
                        />
                      </InputGroup>
                      <InputGroup size="md" flex="1">
                        <Input
                          value={formData.auditNumber || ""}
                          onChange={(e) =>
                            handleFieldChange("auditNumber", e.target.value)
                          }
                          placeholder="Audit Number"
                          textAlign="center"
                        />
                      </InputGroup>
                    </HStack>
                    <FormHelperText>
                      Prefix is auto-filled based on audit type. Year defaults
                      to current year. Number is optional (e.g., 001 or 9999).
                    </FormHelperText>
                    <FormErrorMessage>
                      {validationErrors.auditCode}
                    </FormErrorMessage>
                  </FormControl>

                  <StandardsAsyncSelect
                    value={formData.standard}
                    onChange={(standard) =>
                      handleFieldChange("standard", standard)
                    }
                    label="Standard"
                  />

                  <PreviousAuditAsyncSelect
                    value={formData.previousAudit}
                    onChange={(audit) =>
                      handleFieldChange("previousAudit", audit)
                    }
                    currentScheduleId={id !== "new" ? id : null}
                    label="Previous Audit"
                  />
                </>
              )}

              {/* Step 3: Review */}
              {activeStep === 2 && (
                <>
                  <Heading size="md" mb={2}>
                    Review
                  </Heading>

                  {/* Summary Card */}
                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg={summaryCardBg}
                  >
                    <Text fontWeight="bold" mb={3}>
                      Review Your Schedule
                    </Text>
                    <VStack align="stretch" spacing={2} fontSize="sm">
                      <HStack>
                        <Text fontWeight="semibold" minW="120px">
                          Title:
                        </Text>
                        <Text>{formData.title || "-"}</Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="semibold" minW="120px">
                          Audit Code:
                        </Text>
                        <Text>{formData.auditCode || "-"}</Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="semibold" minW="120px">
                          Type:
                        </Text>
                        <Text>
                          {formData.auditType
                            ? getAuditTypeLabel(formData.auditType)
                            : "-"}
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="semibold" minW="120px">
                          Standard:
                        </Text>
                        <Text>
                          {formData.standard?.standard || formData.standard || "-"}
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="semibold" minW="120px">
                          Status:
                        </Text>
                        {formData.status === 1 ? (
                          <Badge colorScheme="green">Closed</Badge>
                        ) : (
                          <Badge colorScheme="warning">Ongoing</Badge>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>

        <PageFooter>
          <Flex justify="space-between" w="full">
            <Button variant="ghost" onClick={handleCancel} leftIcon={<FiX />}>
              Cancel
            </Button>
            <HStack>
              {activeStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  leftIcon={<FiChevronLeft />}
                >
                  Previous
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button
                  colorScheme="brandPrimary"
                  onClick={handleNext}
                  rightIcon={<FiChevronRight />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  colorScheme="brandPrimary"
                  onClick={handleSubmit}
                  isLoading={loading}
                  leftIcon={<FiSave />}
                >
                  Create Audit Schedule
                </Button>
              )}
            </HStack>
          </Flex>
        </PageFooter>
      </Box>
    );
  }

  // Render folder-like layout for existing schedules
  return (
    <>
      <PageHeader>
        <Flex justify="space-between" align="center" w="full">
          <HStack>
            <IconButton
              icon={<FiArrowLeft />}
              onClick={handleCancel}
              aria-label="Back to schedules"
              variant="ghost"
            />
            <Heading variant="pageTitle">{formData.title}</Heading>
          </HStack>
        </Flex>
      </PageHeader>

      <Box flex="1">
        <Flex
          gap={4}
          maxW="container.xl"
          flexDir={{ base: "column", lg: "row" }}
        >
          {/* Left Column - Main Audit Information */}
          <Stack spacing={4} w="full" maxW={{ base: "unset", lg: "xs" }}>
            {/* Main Audit Info Card */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Editable
                    isDisabled={!isScheduleOngoing}
                    key={`title-${schedule?.id || schedule?._id}`}
                    defaultValue={schedule?.title || "Untitled"}
                    onSubmit={handleTitleBlur}
                    fontSize="2xl"
                    fontWeight="bold"
                    w="full"
                    isPreviewFocusable={true}
                    submitOnBlur={true}
                    selectAllOnFocus={false}
                  >
                    <EditablePreview
                      w="full"
                      borderRadius="md"
                      _hover={{
                        background: "gray.100",
                        cursor: "pointer",
                      }}
                    />
                    <EditableTextarea
                      ref={titleTextareaRef}
                      py={2}
                      px={2}
                      resize="vertical"
                      minH="auto"
                      rows={1}
                      onFocus={(e) => {
                        // Auto-resize on focus
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onInput={(e) => {
                        // Continue resizing as user types
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                  </Editable>

                  <HStack mt={-4}>
                    {formData.status === 1 ? (
                      <Badge colorScheme="green">Closed</Badge>
                    ) : (
                      <Badge colorScheme="warning">Ongoing</Badge>
                    )}
                  </HStack>

                  <Divider />

                  {/* Editable Description */}
                  <Editable
                    w="full"
                    isDisabled={!isScheduleOngoing}
                    key={`description-${schedule?.id || schedule?._id}`}
                    defaultValue={schedule?.description || ""}
                    onSubmit={handleDescriptionBlur}
                    placeholder="Add a description..."
                    isPreviewFocusable={true}
                    submitOnBlur={true}
                    selectAllOnFocus={false}
                  >
                    <EditablePreview
                      py={2}
                      w="full"
                      borderRadius="md"
                      color={schedule?.description ? "gray.700" : "gray.400"}
                      _hover={{
                        background: "gray.100",
                        cursor: "pointer",
                      }}
                    />
                    <EditableTextarea
                      ref={descriptionTextareaRef}
                      py={2}
                      px={2}
                      minH="60px"
                      resize="vertical"
                      onFocus={(e) => {
                        // Auto-resize on focus
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onInput={(e) => {
                        // Continue resizing as user types
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                  </Editable>

                  <Divider />

                  {/* Timestamps */}
                  <HStack>
                    {formData?.createdAt && (
                      <Box flex={1}>
                        <Text fontSize="sm" color="gray.600">
                          Created At
                        </Text>
                        <Text fontSize="sm" mt={2}>
                          <Timestamp date={formData.createdAt} />
                        </Text>
                      </Box>
                    )}

                    {formData?.updatedAt && (
                      <Box flex={1}>
                        <Text fontSize="sm" color="gray.600">
                          Last Modified
                        </Text>
                        <Text fontSize="sm" mt={2}>
                          <Timestamp date={formData.updatedAt} />
                        </Text>
                      </Box>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Audit Details Card */}
            <Card>
              <CardBody>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontWeight="semibold">Audit Details</Text>
                  {isScheduleOngoing && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="brandPrimary"
                      leftIcon={<FiEdit />}
                      onClick={onEditDetailsOpen}
                    >
                      Edit
                    </Button>
                  )}
                </Flex>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Audit Code
                    </Text>
                    <Text fontSize="sm" mt={1} fontWeight="medium">
                      {formData.auditCode || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Type
                    </Text>
                    <Text fontSize="sm" mt={1} fontWeight="medium">
                      {formData.auditType
                        ? getAuditTypeLabel(formData.auditType)
                        : "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Standard
                    </Text>
                    <Text fontSize="sm" mt={1} fontWeight="medium">
                      {formData.standard?.standard || formData.standard || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Previous Audit
                    </Text>
                    <Text fontSize="sm" mt={1} fontWeight="medium">
                      {formData.previousAudit?.title ||
                        formData.previousAudit?.auditCode ||
                        "-"}
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Close Audit Schedule Card */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="semibold">Audit Status</Text>
                    {formData.status === 1 ? (
                      <Badge colorScheme="green" fontSize="sm">
                        Closed
                      </Badge>
                    ) : (
                      <Badge colorScheme="warning" fontSize="sm">
                        Ongoing
                      </Badge>
                    )}
                  </Flex>

                  <Text fontSize="sm" color="gray.600">
                    {formData.status === 1
                      ? "This audit schedule has been closed. All findings have been resolved and verdicts have been set."
                      : "Close this audit schedule when all findings are resolved and verdicts are set for all organizations."}
                  </Text>

                  {formData.status === 1 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="brandPrimary"
                      leftIcon={<FiEdit />}
                      onClick={handleReopenAudit}
                    >
                      Reopen Audit Schedule
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      colorScheme="green"
                      leftIcon={<FiCheckCircle />}
                      onClick={onCloseAuditOpen}
                    >
                      Close Audit Schedule
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </Stack>

          {/* Right Column - Organizations and Reports */}
          <Stack spacing={4} flex={1}>
            <Tabs colorScheme="brandPrimary" isLazy>
              <TabList>
                <Tab>Organizations</Tab>
                <Tab>Reports</Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0} py={4}>
                  <Organizations schedule={schedule ?? {}} {...{ setFormData }} />
                </TabPanel>
                <TabPanel px={0} py={4}>
                  <ReportsTab schedule={schedule ?? {}} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>
        </Flex>
      </Box>

      {/* PageFooter with More Options */}
      <PageFooter>
        <HStack spacing={3} w="full">
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<FiMoreVertical />}
              variant="ghost"
            >
              More Options
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiPrinter />} onClick={handlePrintSchedule}>
                Print Schedule
              </MenuItem>
              <MenuItem icon={<FiPrinter />} onClick={handlePrintAuditSummary}>
                Print Audit Summary
              </MenuItem>
              <MenuItem
                icon={<FiTrash2 />}
                onClick={handleDelete}
                color={errorColor}
              >
                Delete Schedule
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </PageFooter>

      {/* Edit Audit Details Modal */}
      <EditAuditDetailsModal
        isOpen={isEditDetailsOpen}
        onClose={onEditDetailsClose}
        auditData={formData}
        onSave={handleSaveAuditDetails}
        isSaving={loading}
        currentScheduleId={id}
      />

      {/* Close Audit Modal */}
      <CloseAuditModal
        isOpen={isCloseAuditOpen}
        onClose={onCloseAuditClose}
        validation={auditValidation}
        onConfirmClose={handleCloseAudit}
        isClosing={isClosingAudit}
      />
    </>
  );
};

// Wrapper component with OrganizationsProvider
const SchedulePage = () => {
  const { id } = useParams();

  return (
    <OrganizationsProvider scheduleId={id}>
      <SchedulePageContent />
    </OrganizationsProvider>
  );
};

export default SchedulePage;
