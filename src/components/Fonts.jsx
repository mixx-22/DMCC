import { Global } from "@emotion/react";

const Fonts = () => (
  <Global
    styles={`
      /* ===================== INTER ===================== */

      /* Regular */
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/src/fonts/Inter/static/Inter_18pt-Regular.ttf') format('truetype');
      }

      /* Bold */
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('/src/fonts/Inter/static/Inter_18pt-Bold.ttf') format('truetype');
      }

      /* Light */
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 300;
        font-display: swap;
        src: url('/src/fonts/Inter/static/Inter_18pt-Light.ttf') format('truetype');
      }

      /* Medium */
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: url('/src/fonts/Inter/static/Inter_18pt-Medium.ttf') format('truetype');
      }

      /* SemiBold */
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url('/src/fonts/Inter/static/Inter_18pt-SemiBold.ttf') format('truetype');
      }

      /* ExtraBold */
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 800;
        font-display: swap;
        src: url('/src/fonts/Inter/static/Inter_18pt-ExtraBold.ttf') format('truetype');
      }

      /* Italics */
      @font-face {
        font-family: 'Inter';
        font-style: italic;
        font-weight: 400;
        font-display: swap;
        src: url('/src/fonts/Inter/static/Inter_18pt-Italic.ttf') format('truetype');
      }

      @font-face {
        font-family: 'Inter';
        font-style: italic;
        font-weight: 700;
        font-display: swap;
        src: url('/src/fonts/Inter/static/Inter_18pt-BoldItalic.ttf') format('truetype');
      }

      /* ===================== FUNNEL DISPLAY ===================== */

      /* Light */
      @font-face {
        font-family: 'Funnel Display';
        font-style: normal;
        font-weight: 300;
        font-display: swap;
        src: url('/src/fonts/Funnel_Display/static/FunnelDisplay-Light.ttf') format('truetype');
      }

      /* Regular */
      @font-face {
        font-family: 'Funnel Display';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/src/fonts/Funnel_Display/static/FunnelDisplay-Regular.ttf') format('truetype');
      }

      /* Medium */
      @font-face {
        font-family: 'Funnel Display';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: url('/src/fonts/Funnel_Display/static/FunnelDisplay-Medium.ttf') format('truetype');
      }

      /* SemiBold */
      @font-face {
        font-family: 'Funnel Display';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url('/src/fonts/Funnel_Display/static/FunnelDisplay-SemiBold.ttf') format('truetype');
      }

      /* Bold */
      @font-face {
        font-family: 'Funnel Display';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('/src/fonts/Funnel_Display/static/FunnelDisplay-Bold.ttf') format('truetype');
      }

      /* Italic (if available) */
      @font-face {
        font-family: 'Funnel Display';
        font-style: italic;
        font-weight: 400;
        font-display: swap;
        src: url('/src/fonts/Funnel_Display/static/FunnelDisplay-Italic.ttf') format('truetype');
      }
    `}
  />
);

export default Fonts;
