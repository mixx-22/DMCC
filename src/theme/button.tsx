import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const teamStats = defineStyle({
  background: "blackAlpha.50",
  color: "gray.500",
  _hover: {
    bg: "blackAlpha.200",
  },
  _dark: {
    background: "whiteAlpha.200",
    _hover: {
      bg: "whiteAlpha.300",
    },
  },
});

export const buttonTheme = defineStyleConfig({
  variants: { teamStats },
});
