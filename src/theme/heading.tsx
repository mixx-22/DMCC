import { defineStyle, defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const pageTitle = defineStyle((props) => {
  return {
    color: mode(`gray.500`, `gray.400`)(props),
    fontWeight: "medium",
    fontSize: "lg",
    opacity: 0.8,
    _hover: {
      color: mode(`gray.600`, `gray.300`)(props),
      opacity: 1,
    },
  };
});

export const headingTheme = defineStyleConfig({
  variants: {
    pageTitle,
  },
});
