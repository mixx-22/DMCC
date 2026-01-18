import PropTypes from "prop-types";
import { Portal } from "@chakra-ui/react";
import { useLayout } from "../context/_useContext";

const PageFooter = ({ children }) => {
  const { footerRef } = useLayout();
  return <Portal containerRef={footerRef}>{children}</Portal>;
};

PageFooter.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageFooter;
