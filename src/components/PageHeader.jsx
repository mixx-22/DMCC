import PropTypes from "prop-types";
import { Portal } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLayout } from "../context/_useContext";

const PageHeader = ({ children }) => {
  const { headerRef, updateHeaderContent } = useLayout();
  
  useEffect(() => {
    if (children !== null && children !== undefined) {
      updateHeaderContent(true);
      return () => updateHeaderContent(false);
    }
  }, [children, updateHeaderContent]);

  if (children === null || children === undefined) return null;
  return <Portal containerRef={headerRef}>{children}</Portal>;
};

PageHeader.propTypes = {
  children: PropTypes.node,
};

export default PageHeader;
