import { useState, useEffect } from "react";
import { Text, Tooltip } from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";

const STORAGE_KEY = "timestampDisplayFormat";

const Timestamp = ({ 
  date, 
  showTime = false,
  ...textProps 
}) => {
  // Get initial preference from localStorage, default to 'ago'
  const [displayMode, setDisplayMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || "ago";
  });

  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, displayMode);
  }, [displayMode]);

  const toggleMode = (e) => {
    e.stopPropagation(); // Prevent parent click events
    setDisplayMode((prev) => (prev === "ago" ? "timestamp" : "ago"));
  };

  if (!date) {
    return <Text {...textProps}>N/A</Text>;
  }

  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return <Text {...textProps}>Invalid Date</Text>;
  }

  // Format the date based on display mode
  const agoText = formatDistanceToNow(dateObj, { addSuffix: true });
  const timestampText = showTime 
    ? dateObj.toLocaleString() 
    : dateObj.toLocaleDateString();

  const displayText = displayMode === "ago" ? agoText : timestampText;
  const tooltipText = displayMode === "ago" ? timestampText : agoText;

  return (
    <Tooltip label={tooltipText} placement="top" hasArrow>
      <Text
        as="span"
        cursor="pointer"
        onClick={toggleMode}
        textDecoration="underline dotted"
        textUnderlineOffset="2px"
        {...textProps}
      >
        {displayText}
      </Text>
    </Tooltip>
  );
};

export default Timestamp;
