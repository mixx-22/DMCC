import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Center, Text } from "@chakra-ui/react";
import { usePermissions } from "../context/_useContext";

export const disableCan = false;

const Can = ({
  to = null,
  fallback = null,
  fallbackText,
  loadingComponent,
  children,
  id = null,
  className = null,
}) => {
  const { isAllowedTo } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const motionValues = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { delay: 0, duration: 0.8 },
      ...(id ? { id } : {}),
      ...(className ? { className } : {}),
    }),
    [id, className],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      isAllowedTo(to).then((permission) => {
        setAllowed(disableCan && to !== "LOCAL" ? true : permission);
        setLoading(false);
      });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [isAllowedTo, to]);

  if (loading) {
    return <motion.div {...motionValues}>{loadingComponent}</motion.div>;
  }

  if (allowed) {
    return <motion.div {...motionValues}>{children}</motion.div>;
  }

  if (fallbackText) {
    return (
      <Center as={motion.div} {...motionValues} h={16}>
        <Text opacity={0.5}>{fallbackText}</Text>
      </Center>
    );
  }

  if (fallback !== null) {
    return <motion.div {...motionValues}>{fallback}</motion.div>;
  }

  return "";
};

Can.propTypes = {
  to: PropTypes.string,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  fallbackText: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  loadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  notFound: PropTypes.bool,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default Can;
