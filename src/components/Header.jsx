import { Box } from "@chakra-ui/react";
import { useLayout } from "../context/_useContext";

const Header = () => {
  const { headerRef } = useLayout();

  return <Box w="full" ref={headerRef}></Box>;
};

export default Header;
