import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

const search = definePartsStyle((props) => {
  const { value = "", className = "" } = props;
  const classNames = className?.split(" ");
  console.log(classNames);
  const isHeader = classNames?.includes("header");
  const hasValue = value?.length > 0;
  return {
    field: {
      pl: hasValue
        ? "var(--input-padding)"
        : isHeader
          ? 0
          : "var(--input-padding)",
      bg: hasValue
        ? mode(`white`, `gray.800`)(props)
        : isHeader
          ? "transparent"
          : mode(`blackAlpha.50`, `whiteAlpha.200`)(props),
      border: "1px solid",
      borderColor: hasValue
        ? mode(`blackAlpha.50`, `whiteAlpha.200`)(props)
        : "transparent",
      borderRadius: "full",
      fontFamily: "body",
      _hover: {
        pl: hasValue
          ? "var(--input-padding)"
          : isHeader
            ? "var(--input-padding)"
            : "var(--input-padding)",
        bg: hasValue
          ? mode(`gray.100`, `gray.900`)(props)
          : isHeader
            ? mode(`blackAlpha.50`, `whiteAlpha.200`)(props)
            : mode(`blackAlpha.200`, `whiteAlpha.300`)(props),
      },
    },
  };
});

export const inputTheme = defineMultiStyleConfig({
  variants: { search },
});
