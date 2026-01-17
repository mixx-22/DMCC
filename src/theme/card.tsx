import { defineStyle, defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const document = defineStyle((props) => {
  return {
    container: {
      h: "full",
      borderRadius: "md",
      bg: "transparent",
      overflow: "hidden",
      transition: "all 0.2s",
      _hover: {
        shadow: "md",
        bg: mode("white", "gray.800")(props),
        transform: "translateY(-2px)",
        borderColor: mode("gray.300", "gray.600")(props),
      },
    },
    body: {
      p: 4,
    },
  };
});

const documentSelected = defineStyle((props) => {
  return {
    container: {
      h: "full",
      borderRadius: "md",
      bg: mode("brandPrimary.50", "brandPrimary.900")(props),
      overflow: "hidden",
      transition: "all 0.2s",
      _hover: {
        shadow: "md",
        transform: "translateY(-2px)",
      },
    },
    body: {
      p: 4,
    },
  };
});

export const cardTheme = defineStyleConfig({
  variants: {
    document,
    documentSelected,
  },
});
