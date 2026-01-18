import PropTypes from "prop-types";
import { Portal } from "@chakra-ui/react";
import { useLayout } from "../context/_useContext";

const PageHeader = ({ children }) => {
  const { headerRef } = useLayout();
  return <Portal containerRef={headerRef}>{children}</Portal>;
};

PageHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageHeader;
