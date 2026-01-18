import PropTypes from "prop-types";
import { Portal } from "@chakra-ui/react";
import { useLayout } from "../context/Layout";

const PageFooter = ({ children = null }) => {
  const { footerRef } = useLayout();
  if (children === null) return "";
  return <Portal containerRef={footerRef}>{children}</Portal>;
};

PageFooter.propTypes = {
  children: PropTypes.node,
};

export default PageFooter;
