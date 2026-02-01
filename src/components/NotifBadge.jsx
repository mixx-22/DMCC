import PropTypes from "prop-types";
import { Box, Center, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const ripple = keyframes`
  0% {
    opacity: 0;
    transform: scale(1);
  }
  8% {
    opacity: 0.35;
  }
  25% {
    opacity: 0;
    transform: scale(2.8);
  }
  100% {
    opacity: 0;
    transform: scale(2.8);
  }
`;

const NotifBadge = ({
  show = false,
  message,
  boxSize = 4,
  interval = 6,
  ripples = 3,
  borderColor = null,
  ...props
}) => {
  const notifColor = useColorModeValue("error.600", "error.200");
  const defBorderColor = useColorModeValue("white", "gray.700");

  if (!show || !message) return null;

  // how much of the timeline is active
  const burstRatio = 0.25;
  const burstDuration = interval * burstRatio;
  const stagger = burstDuration / ripples;

  return (
    <Tooltip hasArrow label={message} textAlign="center">
      <Center boxSize={boxSize} {...props}>
        <Box
          position="relative"
          boxSize={boxSize}
          bg={notifColor}
          borderRadius="full"
          border="2px solid"
          borderColor={borderColor ?? defBorderColor}
        >
          {[...Array(ripples)].map((_, i) => (
            <Box
              key={i}
              position="absolute"
              inset={0}
              borderRadius="full"
              bg={notifColor}
              animation={`${ripple} ${interval}s infinite`}
              sx={{
                animationDelay: `-${stagger * i}s`,
              }}
              willChange="transform, opacity"
            />
          ))}
        </Box>
      </Center>
    </Tooltip>
  );
};

NotifBadge.propTypes = {
  show: PropTypes.bool,
  message: PropTypes.any,
  boxSize: PropTypes.any,
};

export default NotifBadge;
