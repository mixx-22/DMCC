/**
 * Helper function to get image source
 * Handles various image formats and returns a clean string
 */
export const getImageSrc = (image) => {
  // If image is an object or array, return empty string
  if (typeof image === "object" || Array.isArray(image)) {
    return "";
  }
  // Return the image string as-is
  return image || "";
};

export function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  const sameYear = start.getFullYear() === end.getFullYear();

  const formatMonthDay = (date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

  const formatMonthDayYear = (date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  // January 29, 2026
  if (sameDay) {
    return formatMonthDayYear(start);
  }

  // January 29 - 31, 2026
  if (sameMonth) {
    return `${formatMonthDay(start)} - ${end.getDate()}, ${end.getFullYear()}`;
  }

  // January 29 - February 2, 2026
  if (sameYear) {
    return `${formatMonthDay(start)} - ${formatMonthDay(end)}, ${end.getFullYear()}`;
  }

  // January 29, 2026 - December 31, 2027
  return `${formatMonthDayYear(start)} - ${formatMonthDayYear(end)}`;
}
