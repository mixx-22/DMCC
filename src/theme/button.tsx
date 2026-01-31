import { defineStyle, defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

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

const tabBtn = defineStyle((props) => ({
  background: "transparent",
  width: "full",
  justifyContent: "flex-start",
  textAlign: "left",
  fontFamily: "heading",
  textTransform: "lowercase",
  borderRadius: 0,
  borderBottom: "2px solid",
  // borderColor: mode(`gray.200`, `whiteAlpha.300`)(props),
  borderColor: mode(`brandPrimary.600`, `brandPrimary.200`)(props),
  color: mode(`brandPrimary.600`, `brandPrimary.200`)(props),
}));

export const buttonTheme = defineStyleConfig({
  variants: { teamStats, tabBtn },
});
