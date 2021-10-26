/**
 * Returns the value of a given cookie. If not present, throws an Error.
 * @param {string} name name of the cookie to fetch
 * @return {string}
 */
export function getCookie(name: string): string | null {
  const vals = document.cookie
    .split(';')
    .map((s) => s.split('='))
    .filter(([key, val]) => key.trim() === name);
  if (vals.length === 1 && vals[0].length === 2) {
    return vals[0][1];
  }
  // throw new Error(`Unable to fetch cookie: ${name}`);
  return null;
}

/**
 * Removes a cookie by setting its expiration date to the epoch.
 * @param {string} name name of cookie to remove
 */
export function removeCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/`;
}
