import { Global } from "@emotion/react";

const Fonts = () => (
  <Global
    styles={`
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/src/fonts/Inter/static/Inter_18pt-Regular.ttf') format('truetype');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('/src/fonts/Inter/static/Inter_18pt-Bold.ttf') format('truetype');
      }
      @font-face {
        font-family: 'Funnel Display';
        font-style: normal;
        font-weight: 300; /* Light */
        src: url('/src/fonts/Funnel_Display/static/FunnelDisplay-Light.ttf') format('truetype');
      }
      @font-face {
        font-family: 'Funnel Display';
        font-style: normal;
        font-weight: 400; /* Regular */
        src: url('/src/fonts/Funnel_Display/static/FunnelDisplay-Regular.ttf') format('truetype');
      }
      @font-face {
        font-family: 'Funnel Display';
        font-style: normal;
        font-weight: 700; /* Bold */
        src: url('/src/fonts/Funnel_Display/static/FunnelDisplay-Bold.ttf') format('truetype');
      }
    `}
  />
);

export default Fonts;
