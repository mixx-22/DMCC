import { useEffect, useRef, useCallback } from "react";
import { TourGuideClient } from "@sjmc11/tourguidejs/src/Tour";
import "@sjmc11/tourguidejs/src/scss/tour.scss";

/**
 * Get tour steps configuration
 * Steps are filtered dynamically to only include those with visible targets
 */
const getTourSteps = () => {
  // Define all possible tour steps
  const allSteps = [
    {
      title: "Welcome to Audit Schedule! 🎉",
      content:
        "This tour will guide you through the complete audit workflow. You'll learn how to manage organizations, conduct visits, record findings, and close audits.",
      target: "[data-tour='audit-title']",
      order: 1,
    },
    {
      title: "Audit Information",
      content:
        "Here you can see the basic audit details including title, description, status, and timestamps. Click the title or description to edit them inline.",
      target: "[data-tour='audit-info']",
      order: 2,
    },
    {
      title: "Audit Details",
      content:
        "This section shows the audit code, type, standard, and links to previous audits. Click 'Edit' to modify these details.",
      target: "[data-tour='audit-details']",
      order: 3,
    },
    {
      title: "Audit Status",
      content:
        "Monitor and manage the audit status here. You can close the audit once all organizations have been reviewed and verdicts are set.",
      target: "[data-tour='audit-status']",
      order: 4,
    },
    {
      title: "Organizations Section",
      content:
        "This is where you manage all the organizations (teams/departments) being audited. Each organization can have multiple visits and findings.",
      target: "[data-tour='organizations-section']",
      order: 5,
    },
    {
      title: "Add Organization",
      content:
        "Click here to add a new organization to the audit. You'll need to select a team and assign auditors.",
      target: "[data-tour='add-organization']",
      order: 6,
    },
    {
      title: "Organization Card",
      content:
        "Each organization card shows the team name, assigned auditors, and overall verdict. Click to expand and see detailed information.",
      target: "[data-tour='organization-card']",
      order: 7,
    },
    {
      title: "Visits Tab",
      content:
        "The Visits tab shows all audit visits for this organization. Each visit includes date, objective, compliance status, and findings.",
      target: "[data-tour='visits-tab']",
      order: 8,
    },
    {
      title: "Auditors Tab",
      content:
        "View all auditors assigned to this organization. These are the team members conducting the audit.",
      target: "[data-tour='auditors-tab']",
      order: 9,
    },
    {
      title: "Team Details",
      content:
        "Access the organization's team information and members here.",
      target: "[data-tour='team-details-tab']",
      order: 10,
    },
    {
      title: "Documents",
      content:
        "View quality documents and other relevant documentation for this organization.",
      target: "[data-tour='documents-tab']",
      order: 11,
    },
    {
      title: "Findings",
      content:
        "Findings are non-conformities or observations discovered during visits. Each finding can have action plans and requires verification.",
      target: "[data-tour='finding-item']",
      order: 12,
    },
    {
      title: "Set Verdict",
      content:
        "Once all visits and findings are completed, set a final verdict for the organization (e.g., Conformant, Non-Conformant).",
      target: "[data-tour='set-verdict']",
      order: 13,
    },
    {
      title: "Tour Complete! ✅",
      content:
        "You now know the basics of the audit schedule workflow. You can start this tour again anytime by clicking the '?' button. Happy auditing!",
      target: "[data-tour='audit-title']",
      order: 14,
    },
  ];

  // Filter steps to only include those with visible targets
  // For the first and last step, we always include them
  return allSteps.filter((step, index) => {
    if (index === 0 || index === allSteps.length - 1) {
      return true; // Always include welcome and completion steps
    }
    const element = document.querySelector(step.target);
    return element !== null;
  });
};

/**
 * Custom hook to manage the Audit Schedule Tour Guide
 * This provides an interactive walkthrough of the audit schedule interface
 */
export const useAuditTourGuide = (isEnabled = true) => {
  const tourRef = useRef(null);

  useEffect(() => {
    if (!isEnabled) return;

    // Initialize the tour guide with default steps
    const tg = new TourGuideClient({
      // Configure tour settings
      dialogClass: "audit-tour-dialog",
      closeButton: true,
      allowDialogOverlap: false,
      showStepDots: true,
      showStepProgress: true,
      autoScroll: true,
      autoScrollSmooth: true,
      autoScrollOffset: 100,
      keyboardControls: true,
      exitOnEscape: true,
      completeOnFinish: true,
      targetPadding: 10,
      dialogZ: 10000,
      nextLabel: "Next →",
      prevLabel: "← Back",
      finishLabel: "Got it! ✓",
    });

    tourRef.current = tg;

    // Cleanup on unmount
    return () => {
      if (tourRef.current) {
        tourRef.current.exit();
      }
    };
  }, [isEnabled]);

  const startTour = useCallback(() => {
    if (tourRef.current) {
      // Get filtered steps based on visible elements
      const steps = getTourSteps();
      
      // Add steps to the tour
      tourRef.current.addSteps(steps).then(() => {
        // Start the tour after steps are added
        tourRef.current.start();
      });
    }
  }, []);

  const stopTour = useCallback(() => {
    if (tourRef.current) {
      tourRef.current.exit();
    }
  }, []);

  return {
    startTour,
    stopTour,
    tour: tourRef.current,
  };
};
