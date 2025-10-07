import { createLayout } from '../components/layout';
import { createSidebar } from '../components/side-bar';
import { getDefaultTemplate } from '../get-template';

export const createRoute = () => {
  const template = getDefaultTemplate();

  return template
    .replace('<footer>{SCRIPTS}</footer>', '')
    .replace('{BODY}', createLayout(createAboutPage(), createSidebar('about')))
    .replace('<title>Revirtualis</title>', '<title>About</title>');
};

const createAboutPage = () => {
  return /*html*/ `
<h1>About</h1>
<section class="post card">
<p className="post-content">
Hi, welcome to Revirtualis. In here is a one-stop-shop for
various games, projects, music, coding, and the articles and news about
them. The goal of this site is to showcase some interesting things,
explain a bit about them, and give you the ambition to create more on
your own.
</p>
<p className="post-content">Happy coding!</p>
<p className="post-content">
Author: Benjamin
<br />
<a
  style="color: var(--color-primary1);"
  href="https://github.com/benjamin-t-brown"
>
  https://github.com/benjamin-t-brown
</a>
</p>
</section>
<footer></footer>
`;
};

// ${createBlogPosts(recentPosts)}
