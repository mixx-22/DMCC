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
export const generateUsername = ({
  firstName = "",
  lastName = "",
  employeeId = "",
  maxLength = 20,
} = {}) => {
  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z]/g, "");

  const fn = normalize(firstName);
  const ln = normalize(lastName);

  if (!fn && !ln) return "";

  // Base: firstname + lastname
  let base = `${fn}${ln}`;

  // Add short numeric hash from employeeId (numbers only)
  if (employeeId) {
    const hash = Array.from(employeeId)
      .reduce((acc, c) => acc + c.charCodeAt(0), 0)
      .toString(10)
      .slice(-4); // last 4 digits only

    base += hash;
  }

  // Enforce max length
  if (base.length > maxLength) {
    base = base.slice(0, maxLength);
  }

  return base;
};
