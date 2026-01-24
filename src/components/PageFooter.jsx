import PropTypes from "prop-types";
import { Portal } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLayout } from "../context/_useContext";

const PageFooter = ({ children }) => {
  const { footerRef, updateFooterContent } = useLayout();
  
  useEffect(() => {
    if (children !== null && children !== undefined) {
      updateFooterContent(true);
      return () => updateFooterContent(false);
    }
  }, [children, updateFooterContent]);

  if (children === null || children === undefined) return null;
  return <Portal containerRef={footerRef}>{children}</Portal>;
};

PageFooter.propTypes = {
  children: PropTypes.node,
};

export default PageFooter;
