/**
 * Utility functions for manipulating strings.
 */

/**
 * Make a readable string from a snake-case string
 * Eg. "comparative_genomics" -> "Comparative genomics"
 * This makes the string sentence case. E.g.:
 * some_kind_of_string -> Some kind of string
 * @param {string} str the snake-case string to change
 * @return {string}
 */
export function formatSnakeCase(str: string): string {
  str = str.replace(/_/g, ' ');
  str = str[0].toUpperCase() + str.slice(1);
  return str;
}

/**
 * Get a friendly readable name from a workspace object type
 * E.g. "KBaseMatrices.AmpliconMatrix-1.2" -> "Amplicon Matrix"
 * @param {string} type the workspace type string to break apart
 * @return {string}
 */
export function getWSTypeName(type: string): string {
  const matches = type.match(/[a-zA-Z]*\.([a-zA-Z]+)(-\d+\.\d+)?/);
  if (!matches || matches.length < 2) {
    throw new Error('Invalid workspace type name: ' + type);
  }
  const match = matches[1];
  // Insert a space before all caps and trim
  return match.replace(/([A-Z][a-z])/g, ' $1').trim();
}
