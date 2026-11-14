/**
 * Restores Sunny Mode before React renders; blocked storage leaves the default theme.
 * @returns {void}
 */
export function restoreTheme() {
  try {
    if (localStorage.getItem('holidaze-theme') === 'sunny') document.documentElement.dataset.theme = 'sunny';
  } catch {
    // Use the standard theme when browser storage is blocked.
  }
}

/**
 * Toggles Sunny Mode and saves the choice when storage is available.
 * @returns {boolean}
 */
export function toggleSunnyMode() {
  const sunny = document.documentElement.dataset.theme !== 'sunny';
  const theme = sunny ? 'sunny' : 'default';
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('holidaze-theme', theme);
  } catch {
    // The theme still works when browser storage is blocked.
  }
  return sunny;
}
