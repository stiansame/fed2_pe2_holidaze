/** Switch the colour profile without remounting the app. Storage is optional. */
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
