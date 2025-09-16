const THEME_STORAGE_KEY = 'theme-preference';
function applyTheme(theme) {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.classList.remove('theme-light', 'theme-dark');
  document.documentElement.classList.add(`theme-${theme}`);
  document.documentElement.setAttribute('data-theme', theme);
}
function getStoredTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored || getOSThemePreference();
}
function getOSThemePreference() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
function saveThemePreference(theme) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function writeThemeToHtml() {
  const theme = getStoredTheme();
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-toggle').innerHTML =
    theme === 'light'
      ? '<span class="theme-toggle-icon">☀️</span> <span class="theme-toggle-label">Light</span>'
      : '<span class="theme-toggle-icon">🌙</span> <span class="theme-toggle-label">Dark</span>';
}

applyTheme(getStoredTheme());

window.theme = {
  toggleTheme() {
    const newTheme = getStoredTheme() === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    saveThemePreference(newTheme);
    writeThemeToHtml();
  },
  writeThemeToHtml,
};

window.addEventListener('DOMContentLoaded', () => {
  writeThemeToHtml();
});
