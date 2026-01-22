/**
 * File type detection utilities for document preview functionality
 */

/**
 * Supported file extensions for preview
 */
const PREVIEWABLE_EXTENSIONS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  video: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
  pdf: ['pdf'],
};

/**
 * Get file extension from filename
 * @param {string} fileName - The filename
 * @returns {string} - Lowercase file extension without dot
 */
export const getFileExtension = (fileName) => {
  if (!fileName || typeof fileName !== 'string') {
    return '';
  }
  const parts = fileName.split('.');
  if (parts.length < 2) {
    return '';
  }
  return parts.pop().toLowerCase();
};

/**
 * Determine if a file can be previewed based on its filename
 * @param {string} fileName - The filename
 * @returns {boolean} - True if file can be previewed
 */
export const isPreviewable = (fileName) => {
  const extension = getFileExtension(fileName);
  return (
    PREVIEWABLE_EXTENSIONS.image.includes(extension) ||
    PREVIEWABLE_EXTENSIONS.video.includes(extension) ||
    PREVIEWABLE_EXTENSIONS.pdf.includes(extension)
  );
};

/**
 * Get the preview type for a file
 * @param {string} fileName - The filename
 * @returns {'image'|'video'|'pdf'|null} - The preview type or null if not previewable
 */
export const getPreviewType = (fileName) => {
  const extension = getFileExtension(fileName);
  
  if (PREVIEWABLE_EXTENSIONS.image.includes(extension)) {
    return 'image';
  }
  if (PREVIEWABLE_EXTENSIONS.video.includes(extension)) {
    return 'video';
  }
  if (PREVIEWABLE_EXTENSIONS.pdf.includes(extension)) {
    return 'pdf';
  }
  
  return null;
};

/**
 * Get a user-friendly message for non-previewable files
 * @param {string} fileName - The filename
 * @returns {string} - Message explaining why preview is not available
 */
export const getPreviewDisabledMessage = (fileName) => {
  const extension = getFileExtension(fileName);
  if (!extension) {
    return 'Preview not available for this file';
  }
  return `Preview not available for .${extension} files. Only images, videos, and PDFs can be previewed.`;
};

/**
 * Get MIME type from filename
 * @param {string} fileName - The filename
 * @returns {string} - MIME type or 'application/octet-stream' as default
 */
export const getMimeType = (fileName) => {
  const extension = getFileExtension(fileName);
  
  // Image types
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'gif') return 'image/gif';
  if (extension === 'bmp') return 'image/bmp';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'svg') return 'image/svg+xml';
  
  // Video types
  if (extension === 'mp4') return 'video/mp4';
  if (extension === 'webm') return 'video/webm';
  if (extension === 'ogg') return 'video/ogg';
  if (extension === 'mov') return 'video/quicktime';
  if (extension === 'avi') return 'video/x-msvideo';
  
  // PDF
  if (extension === 'pdf') return 'application/pdf';
  
  return 'application/octet-stream';
};
