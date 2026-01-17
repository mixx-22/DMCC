import { defineStyle, defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const document = defineStyle((props) => {
  return {
    container: {
      borderRadius: "md",
      border: "1px solid",
      borderColor: mode("gray.200", "gray.700")(props),
      bg: mode("white", "gray.800")(props),
      overflow: "hidden",
      transition: "all 0.2s",
      _hover: {
        shadow: "md",
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
      borderRadius: "md",
      border: "2px solid",
      borderColor: "blue.500",
      bg: mode("blue.50", "blue.900")(props),
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
