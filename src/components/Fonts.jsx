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
        font-family: 'Playfair';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/src/fonts/Playfair/static/Playfair_9pt-Regular.ttf') format('truetype');
      }
      @font-face {
        font-family: 'Playfair';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('/src/fonts/Playfair/static/Playfair_9pt-Bold.ttf') format('truetype');
      }
    `}
  />
);

export default Fonts;
