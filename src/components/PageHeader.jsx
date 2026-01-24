import PropTypes from "prop-types";
import { Portal } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLayout } from "../context/_useContext";

const PageHeader = ({ children }) => {
  const { headerRef, updateHeaderContent } = useLayout();
  const hasContent = children !== null && children !== undefined;
  
  useEffect(() => {
    updateHeaderContent(hasContent);
    return () => {
      if (hasContent) {
        updateHeaderContent(false);
      }
    };
  }, [hasContent, updateHeaderContent]);

  if (!hasContent) return null;
  return <Portal containerRef={headerRef}>{children}</Portal>;
};

PageHeader.propTypes = {
  children: PropTypes.node,
};

export default PageHeader;
