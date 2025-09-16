export const createSidebar = (
  active: 'blog' | 'games' | 'about' | 'home' | 'tags'
) => {
  const contents = /*html*/ `
<div class="side-bar">
  <a href="/games.html" class="sidebar-link ${active === 'games' ? 'active' : ''}">
    <span class="sidebar-link-text">Games</span>
  </a>
  <a href="/blog.html" class="sidebar-link ${active === 'blog' ? 'active' : ''}">
    <span class="sidebar-link-text">Blog</span>
  </a>
  <a href="/tags.html" class="sidebar-link ${active === 'tags' ? 'active' : ''}">
    <span class="sidebar-link-text">Tags</span>
  </a>
  <a href="/about.html" class="sidebar-link ${active === 'about' ? 'active' : ''}">
    <span class="sidebar-link-text">About</span>
  </a>
</div>`;

  return contents;
};
