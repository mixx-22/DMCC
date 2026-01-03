import { tableAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tableAnatomy.keys);

const baseStyle = definePartsStyle({
  th: {
    fontFamily: `'Funnel Display', sans-serif`,
    textTransform: "lowercase",
    letterSpacing: 0,
    color: "gray.50",
  },
  tbody: {
    tr: {
      bg: "transparent",
      _hover: { bg: "blackAlpha.50" },
    },
  },
});

export const tableTheme = defineMultiStyleConfig({ baseStyle });
