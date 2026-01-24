import { extendTheme } from "@chakra-ui/react";
import { colors } from "./colors";
import { config } from "./config";
import { fonts } from "./fonts";
import { semanticTokens } from "./semanticTokens";
import sizes from "./sizes";
import styles from "./styles";
import { headingTheme } from "./heading";
import { tableTheme } from "./table";
import { cardTheme } from "./card";
import { inputTheme } from "./input";
import { buttonTheme } from "./button";

export const transition = {
  smooth: "200ms ease-out",
  fun: "all 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

export const theme = extendTheme({
  colors,
  config,
  fonts,
  semanticTokens,
  sizes,
  space: { ...sizes },
  components: {
    Heading: headingTheme,
    Table: tableTheme,
    Card: cardTheme,
    Input: inputTheme,
    Button: buttonTheme,
  },
  styles,
});

export default theme;
