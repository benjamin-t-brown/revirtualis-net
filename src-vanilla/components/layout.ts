import { createTopBar } from './top-bar';

export const createLayout = (childrenHtml: string, sidebarHtml: string) => {
  const contents = /*html*/ `
${createTopBar()}
<div style="display: flex; position: relative;">
  <div class="side-bar-container">
    <button class="side-bar-close" onClick="window.sideBar.close();" aria-label="Close sidebar">X</button>
    ${sidebarHtml}
  </div>
  <main>
    ${childrenHtml}
  </main>
</div>`;

  return contents;
};
