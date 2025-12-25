import { mode } from "@chakra-ui/theme-tools";

export const sweetAlertStyles = (props) => {
  const { theme: { sizes = {}, components: c = {} } = {} } = props;
  const defaultAlert = {
    color: mode(`gray.800`, `white`)(props),
    bg: mode(`gray.200`, `gray.800`)(props),
    _hover: {
      bg: mode(`gray.100`, `gray.900`)(props),
    },
  };
  return {
    "body.swal2-height-auto": {
      height: "inherit !important",
    },
    ".swal2-container": {
      zIndex: "popover",

      ".swal2-modal": {
        color: mode(`gray.800`, `whiteAlpha.900`)(props),
        bg: mode(`white`, `gray.700`)(props),
        boxShadow: "md",
        zIndex: "modal",
        w: "full",
        maxW: "sm",
        borderRadius: sizes[3],

        "&.enter": {
          animation:
            "slide-in-blurred-bottom 450ms cubic-bezier(0.23, 1, 0.32, 1) both",

          ">*": {
            animation: "sibb-content 450ms cubic-bezier(0.23, 1, 0.32, 1) both",
          },
        },
        "&.exit": {
          animation:
            "slide-out-blurred-top 400ms cubic-bezier(0.755, 0.05, 0.855, 0.06) both",

          ">*": {
            animation:
              "sobt-content 400ms cubic-bezier(0.755, 0.05, 0.855, 0.06) both",
          },
        },

        "h2.swal2-title": {
          fontSize: "xl",
          fontWeight: "bold",
          color: mode(`gray.800`, `whiteAlpha.900`)(props),

          ">span": {
            whiteSpace: "nowrap",
          },
        },

        "div.swal2-html-container": {
          fontSize: "md",

          ".alert-items": {
            bg: mode(`gray.100`, `whiteAlpha.300`)(props),
            borderRadius: 4,
            w: "fit-content",
            maxW: "full",
            display: "table",
            mx: "auto",

            ".alert-item": {
              display: "table-row",

              ".alert-key, .alert-value": {
                display: "table-cell",
                textAlign: "left",
                p: 2,
              },

              ".alert-key": {
                color: mode(`gray.500`, `whiteAlpha.700`)(props),
                _after: {
                  content: '":"',
                },
                "&:first-of-type": {
                  pr: 1,
                },
              },

              ".alert-value": {
                maxW: 96,
                "&:last-child": {
                  pl: 1,
                },
              },
            },
          },
        },

        ".swal2-checkbox": {
          bg: mode(`white`, `gray.700`)(props),
        },

        ".swal2-actions": {
          gap: 2,
          button: {
            ...c.Button.baseStyle,
            py: 2,
            px: 4,
            h: 10,
            minW: 26,

            "&.swal2-cancel": defaultAlert,

            "&.swal2-deny": {
              ...c.Button.variants.brandSecondary,
            },

            "&.swal2-confirm": {
              ...c.Button.variants.brandPrimary,
            },
          },
        },

        "&.info": {
          "h2.swal2-title": {
            color: mode(`brandPrimary.700`, `brandPrimary.300`)(props),
          },
        },

        "&.danger": {
          "h2.swal2-title": {
            color: mode(`brandSecondary.700`, `brandSecondary.300`)(props),
          },

          ".swal2-actions": {
            button: {
              "&.swal2-deny": {
                ...c.Button.variants.brandPrimary,
              },

              "&.swal2-confirm": {
                ...c.Button.variants.brandSecondary,
              },
            },
          },
        },

        "&.warning": {
          "h2.swal2-title": {
            color: mode(`orange.400`, `orange.300`)(props),
          },

          ".swal2-actions": {
            button: {
              "&.swal2-deny": {
                ...c.Button.variants.brandPrimary,
              },

              "&.swal2-confirm": {
                bg: mode(`orange.400`, `orange.300`)(props),
              },
            },
          },

          "&.inverted": {
            ".swal2-actions": {
              button: {
                "&.swal2-cancel": {
                  color: mode(`white`, `gray.700`)(props),
                  bg: mode(`orange.400`, `orange.300`)(props),
                  _hover: {
                    bg: mode(`orange.500`, `orange.200`)(props),
                  },
                },

                "&.swal2-confirm": defaultAlert,
              },
            },
          },
        },
      },
    },
  };
};

export default sweetAlertStyles;
