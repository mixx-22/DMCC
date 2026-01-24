import { avatarAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers, cssVar } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(avatarAnatomy.keys);

// Define a CSS variable for the avatar border color
const $avatarBg = cssVar("avatar-border-color");

const baseStyle = definePartsStyle((props) => {
  return {
    container: {
      // Use CSS variable with fallback to theme colors
      [$avatarBg.variable]: mode("white", "gray.800")(props),
      borderColor: $avatarBg.reference,
      borderWidth: "2px",
    },
    excessLabel: {
      borderColor: $avatarBg.reference,
      borderWidth: "2px",
    },
    group: {
      // Set the CSS variable on the group so all children inherit it
      [$avatarBg.variable]: mode("white", "gray.800")(props),
    },
  };
});

export const avatarTheme = defineMultiStyleConfig({
  baseStyle,
});


