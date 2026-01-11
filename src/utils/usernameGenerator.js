/**
 * Generates a username from user's name and employee ID
 * Format: firstnamelastname-employeeID (all lowercase)
 * Example: johndoe-EMP001
 * 
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} employeeId - User's employee ID
 * @returns {string} - Generated username
 */
export const generateUsername = (firstName, lastName, employeeId) => {
  // Remove spaces and special characters, convert to lowercase
  const cleanFirstName = (firstName || "").replace(/[^a-zA-Z]/g, "").toLowerCase();
  const cleanLastName = (lastName || "").replace(/[^a-zA-Z]/g, "").toLowerCase();
  const cleanEmployeeId = (employeeId || "").replace(/\s/g, "");
  
  // Combine firstname + lastname - employeeID
  if (cleanFirstName && cleanLastName && cleanEmployeeId) {
    return `${cleanFirstName}${cleanLastName}-${cleanEmployeeId}`;
  }
  
  // Fallback if not all parts are available
  if (cleanFirstName && cleanLastName) {
    return `${cleanFirstName}${cleanLastName}`;
  }
  
  return "";
};
