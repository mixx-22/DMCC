import { Box } from "@chakra-ui/react";
import { useLayout } from "../context/_useContext";

const Footer = () => {
  const { footerRef } = useLayout();

  return <Box ref={footerRef}></Box>;
};

export default Footer;
