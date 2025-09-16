export const createTopBar = () => {
  return /*html*/ `
<nav
  style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;"
>
  <div class="top-bar-logo-container">
    <button class="menu-button" aria-label="Open menu" onClick="window.sideBar.open();">
      ☰
    </button>
    <div style="display: inline-flex; align-items: center; gap: 8px;">
      <img
        src="/favicon-lg.png"
        alt="logo"
        style="width:32px; height:32px;"
      />
      <a
        href="/"
        style="text-decoration: none; font-weight: bold; font-size: 1.5em; font-family: DataLatin; color: var(--color-header-text);"
      >
        Revirtualis
      </a>
    </div>
  </div>
  <div class="top-bar-menu-container">
  </div>
  <button
    id="theme-toggle"
    onClick="window.theme.toggleTheme();"
    class="theme-toggle"
    aria-label="Switch to light/dark theme"
    title="Switch to light/dark theme"
  >
    *
  </button>
</nav>  
  `;
};
