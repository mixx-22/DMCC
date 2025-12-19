export const semanticTokens = {
  colors: {
    error: "red.500",
    success: "green.500",
    primary: {
      default: "brandPrimary.700",
      _dark: "brandPrimary.500",
    },
    secondary: {
      default: "brandSecondary.700",
      _dark: "brandSecondary.500",
    },
  },
  transitions: {
    smooth: "200ms ease-out",
    fun: "all 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
  animations: {
    enter: "slide-in-blurred-bottom 450ms cubic-bezier(0.23, 1, 0.32, 1) both",
    exit: "slide-out-blurred-top 400ms cubic-bezier(0.755, 0.05, 0.855, 0.06) both",
  },
};

export default semanticTokens;
