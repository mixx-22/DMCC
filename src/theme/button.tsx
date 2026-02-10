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

const tabBtn = defineStyle((props) => {
  const { colorScheme = "brandPrimary" } = props;
  return {
    background: "transparent",
    width: "full",
    justifyContent: "flex-start",
    textAlign: "left",
    fontFamily: "heading",
    textTransform: "lowercase",
    borderRadius: 0,
    borderBottom: "2px solid",
    fontWeight: "normal",
    // borderColor: mode(`gray.200`, `whiteAlpha.300`)(props),
    borderColor: mode(`${colorScheme}.600`, `${colorScheme}.200`)(props),
    color: mode(`${colorScheme}.600`, `${colorScheme}.200`)(props),
  };
});

const brandPrimary = defineStyle((props) => {
  return {
    color: mode("white", "white")(props),
    bg: mode("brandPrimary.600", "brandPrimary.500")(props),
    _hover: {
      bg: mode("brandPrimary.700", "brandPrimary.600")(props),
    },
    _active: {
      bg: mode("brandPrimary.800", "brandPrimary.700")(props),
    },
  };
});

const brandSecondary = defineStyle((props) => {
  return {
    color: mode("gray.800", "gray.800")(props),
    bg: mode("brandSecondary.500", "brandSecondary.400")(props),
    _hover: {
      bg: mode("brandSecondary.600", "brandSecondary.500")(props),
    },
    _active: {
      bg: mode("brandSecondary.700", "brandSecondary.600")(props),
    },
  };
});

export const buttonTheme = defineStyleConfig({
  variants: { teamStats, tabBtn, brandPrimary, brandSecondary },
});
