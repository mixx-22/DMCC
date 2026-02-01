/**
 * Background Gradient Configuration
 * 
 * This file defines configurable gradient backgrounds for dashboards.
 * Colors use Chakra theme tokens with low opacity for subtle effects.
 */

export const backgroundGradients = {
  // Main Dashboard gradient configuration
  mainDashboard: {
    // Container for background
    container: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      pointerEvents: "none",
      overflow: "hidden",
    },
    // Base gradient overlay
    base: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(135deg, rgba(0, 90, 238, 0.03) 0%, rgba(255, 215, 0, 0.02) 100%)",
    },
    // Top-left gradient blob
    blob1: {
      position: "absolute",
      top: "-20%",
      left: "-10%",
      width: "60%",
      height: "60%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(0, 90, 238, 0.08) 0%, transparent 70%)",
      filter: "blur(80px)",
      opacity: 0.6,
    },
    // Bottom-right gradient blob
    blob2: {
      position: "absolute",
      bottom: "-15%",
      right: "-10%",
      width: "50%",
      height: "50%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)",
      filter: "blur(70px)",
      opacity: 0.5,
    },
    // Center accent gradient blob
    blob3: {
      position: "absolute",
      top: "30%",
      right: "20%",
      width: "40%",
      height: "40%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)",
      filter: "blur(90px)",
      opacity: 0.4,
    },
  },

  // Audit Dashboard gradient configuration
  auditDashboard: {
    // Container for background
    container: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      pointerEvents: "none",
      overflow: "hidden",
    },
    // Base gradient overlay
    base: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(160deg, rgba(16, 185, 129, 0.03) 0%, rgba(139, 92, 246, 0.03) 50%, rgba(244, 63, 94, 0.02) 100%)",
    },
    // Top-left gradient blob (success green)
    blob1: {
      position: "absolute",
      top: "-15%",
      left: "-8%",
      width: "55%",
      height: "55%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
      filter: "blur(85px)",
      opacity: 0.5,
    },
    // Middle-right gradient blob (info purple/blue)
    blob2: {
      position: "absolute",
      top: "25%",
      right: "-12%",
      width: "50%",
      height: "50%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, transparent 70%)",
      filter: "blur(75px)",
      opacity: 0.6,
    },
    // Bottom-center gradient blob (error/warning)
    blob3: {
      position: "absolute",
      bottom: "-10%",
      left: "30%",
      width: "45%",
      height: "45%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)",
      filter: "blur(80px)",
      opacity: 0.4,
    },
  },

  // Dark mode variants
  darkMode: {
    mainDashboard: {
      base: {
        background: "linear-gradient(135deg, rgba(0, 90, 238, 0.05) 0%, rgba(255, 215, 0, 0.03) 100%)",
      },
      blob1: {
        background: "radial-gradient(circle, rgba(0, 90, 238, 0.12) 0%, transparent 70%)",
        opacity: 0.5,
      },
      blob2: {
        background: "radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)",
        opacity: 0.4,
      },
      blob3: {
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
        opacity: 0.35,
      },
    },
    auditDashboard: {
      base: {
        background: "linear-gradient(160deg, rgba(16, 185, 129, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(244, 63, 94, 0.03) 100%)",
      },
      blob1: {
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
        opacity: 0.4,
      },
      blob2: {
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
        opacity: 0.5,
      },
      blob3: {
        background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
        opacity: 0.35,
      },
    },
  },
};

/**
 * Helper function to get background styles for a specific dashboard
 * @param {string} dashboardType - 'mainDashboard' or 'auditDashboard'
 * @param {boolean} isDarkMode - Whether dark mode is active
 * @returns {object} Background style configuration
 */
export const getDashboardBackground = (dashboardType, isDarkMode = false) => {
  const baseConfig = backgroundGradients[dashboardType];
  const darkConfig = isDarkMode ? backgroundGradients.darkMode[dashboardType] : {};

  return {
    container: baseConfig.container,
    base: { ...baseConfig.base, ...darkConfig.base },
    blob1: { ...baseConfig.blob1, ...darkConfig.blob1 },
    blob2: { ...baseConfig.blob2, ...darkConfig.blob2 },
    blob3: { ...baseConfig.blob3, ...darkConfig.blob3 },
  };
};

export default backgroundGradients;
