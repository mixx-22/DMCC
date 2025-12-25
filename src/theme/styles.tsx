import { ThemeProps } from "@chakra-ui/react";
import sweetAlertStyles from "./sweetalert";

export const styles = {
  global: (props: ThemeProps) => ({
    "html, body": {
      "h1, h2, h3": {
        fontFamily: `'Funnel Display', sans-serif`,
        fontWeight: "700",
        textTransform: "lowercase",
      },
      "body, p, h4, h5, h6": {
        fontFamily: `'Inter', sans-serif`,
      },
    },
    ...sweetAlertStyles(props),
  }),
};

export default styles;
