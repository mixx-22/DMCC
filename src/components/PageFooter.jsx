import PropTypes from "prop-types";
import { Portal } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLayout } from "../context/_useContext";

const PageFooter = ({ children }) => {
  const { footerRef, updateFooterContent } = useLayout();
  const hasContent = children !== null && children !== undefined;
  
  useEffect(() => {
    updateFooterContent(hasContent);
    return () => {
      if (hasContent) {
        updateFooterContent(false);
      }
    };
  }, [hasContent, updateFooterContent]);

  if (!hasContent) return null;
  return <Portal containerRef={footerRef}>{children}</Portal>;
};

PageFooter.propTypes = {
  children: PropTypes.node,
};

export default PageFooter;
