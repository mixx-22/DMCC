import { avatarAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers, cssVar } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(avatarAnatomy.keys);

// Define a CSS variable for the avatar border color
const $avatarBg = cssVar("avatar-border-color");

const baseStyle = definePartsStyle((props) => {
  return {
    group: {
      // Set the CSS variable on the group so all children inherit it
      [$avatarBg.variable]: mode("white", "gray.800")(props),
      // Apply border styling to avatars within the group
      "& > span[role='img']": {
        borderColor: $avatarBg.reference,
        borderWidth: "2px",
      },
    },
    excessLabel: {
      // The excess label ("+3" badge) should also use the border color
      borderColor: $avatarBg.reference,
      borderWidth: "2px",
    },
  };
});

export const avatarTheme = defineMultiStyleConfig({
  baseStyle,
});

