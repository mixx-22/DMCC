/**
 * Helper function to get image source
 * Handles various image formats and returns a clean string
 */
export const getImageSrc = (image) => {
  // If image is an object or array, return empty string
  if (typeof image === 'object' || Array.isArray(image)) {
    return '';
  }
  // Return the image string as-is
  return image || '';
};
