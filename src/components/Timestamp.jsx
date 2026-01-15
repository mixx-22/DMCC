import { useState, useEffect } from "react";
import { Text, Tooltip } from "@chakra-ui/react";
import moment from "moment";

const STORAGE_KEY = "timestampDisplayFormat";
const TIMESTAMP_FORMAT = "MMM DD, YYYY HH:mm:ss";

const Timestamp = ({ date, showTime = false, ...textProps }) => {
  // Get initial preference from localStorage, default to 'ago'
  const [displayMode, setDisplayMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || "ago";
  });

  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, displayMode);
    // Dispatch a custom event to notify other Timestamp components
    window.dispatchEvent(
      new CustomEvent("timestampFormatChange", { detail: displayMode })
    );
  }, [displayMode]);

  // Listen for changes from other Timestamp components
  useEffect(() => {
    const handleFormatChange = (e) => {
      setDisplayMode(e.detail);
    };

    window.addEventListener("timestampFormatChange", handleFormatChange);

    return () => {
      window.removeEventListener("timestampFormatChange", handleFormatChange);
    };
  }, []);

  const toggleMode = (e) => {
    e.stopPropagation(); // Prevent parent click events
    setDisplayMode((prev) => (prev === "ago" ? "timestamp" : "ago"));
  };

  if (!date) {
    return <Text {...textProps}>N/A</Text>;
  }

  const momentDate = moment(date);

  // Check if date is valid
  if (!momentDate.isValid()) {
    return <Text {...textProps}>Invalid Date</Text>;
  }

  // Format the date based on display mode
  const agoText = momentDate.fromNow();
  const timestampText = showTime
    ? momentDate.format(TIMESTAMP_FORMAT)
    : momentDate.format("MMM DD, YYYY");

  const displayText = displayMode === "ago" ? agoText : timestampText;
  const tooltipText = displayMode === "ago" ? timestampText : agoText;

  return (
    <Tooltip label={tooltipText} placement="top" hasArrow>
      <Text as="span" cursor="pointer" onClick={toggleMode} {...textProps}>
        {displayText}
      </Text>
    </Tooltip>
  );
};

export default Timestamp;
