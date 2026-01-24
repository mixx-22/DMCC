import { defineStyle, defineStyleConfig, cssVar } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

// Define the avatar border color CSS variable
const $avatarBg = cssVar("avatar-border-color");

const baseStyle = defineStyle((props) => {
  const { colors } = props.theme;
  return {
    container: {
      // Set the avatar border color to match card background
      // Use actual color values from theme instead of token strings
      [$avatarBg.variable]: mode(colors.white, colors.gray[700])(props),
    },
  };
});

const document = defineStyle((props) => {
  const { colors } = props.theme;
  return {
    container: {
      h: "full",
      boxShadow: "none",
      borderRadius: "md",
      overflow: "hidden",
      transition: "all 0.2s",
      // Set avatar border color to match card background
      [$avatarBg.variable]: mode(colors.white, colors.gray[700])(props),
      _hover: {
        boxShadow: "md",
        bg: mode("white", "gray.800")(props),
        transform: "translateY(-2px)",
        borderColor: mode("gray.300", "gray.600")(props),
      },
    },
    body: {
      p: 2,
    },
  };
});

const documentSelected = defineStyle((props) => {
  const { colors } = props.theme;
  return {
    container: {
      h: "full",
      borderRadius: "md",
      bg: mode("brandPrimary.50", "brandPrimary.900")(props),
      overflow: "hidden",
      transition: "all 0.2s",
      // Set avatar border color to match selected card background
      [$avatarBg.variable]: mode(
        colors.brandPrimary[50],
        colors.brandPrimary[900],
      )(props),
      _hover: {
        shadow: "md",
        transform: "translateY(-2px)",
      },
    },
    body: {
      p: 2,
    },
  };
});

export const cardTheme = defineStyleConfig({
  baseStyle,
  variants: {
    document,
    documentSelected,
  },
});
