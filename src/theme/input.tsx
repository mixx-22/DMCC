import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

const search = definePartsStyle((props) => {
  const { value = "" } = props;
  const hasValue = value?.length > 0;
  return {
    field: {
      bg: hasValue
        ? mode(`white`, `gray.200`)(props)
        : mode(`blackAlpha.50`, `whiteAlpha.200`)(props),
      border: "1px solid",
      borderColor: hasValue
        ? mode(`blackAlpha.50`, `whiteAlpha.200`)(props)
        : "transparent",
      borderRadius: "full",
      fontFamily: "body",
    },
  };
});

export const inputTheme = defineMultiStyleConfig({
  variants: { search },
});
