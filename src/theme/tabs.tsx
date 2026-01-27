import { tabsAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const baseStyle = definePartsStyle(() => {
  return {
    tab: {
      fontWeight: "semibold",
      fontFamily: "heading",
      textTransform: "lowercase",
    },
  };
});

export const tabsTheme = defineMultiStyleConfig({ baseStyle });
