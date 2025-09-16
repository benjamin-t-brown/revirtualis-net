import { createLayout } from '../components/layout';
import { createSidebar } from '../components/side-bar';
import { BlogPostData } from '../types';
import { getDefaultTemplate } from '../get-template';

export const createRoute = (posts: BlogPostData[]) => {
  const template = getDefaultTemplate();
  const tags = posts.map((post) => post.tags).flat().sort();
  const uniqueTags = [...new Set(tags)].filter((tag) => tag !== '');
  // const tagPosts = posts.filter((post) =>
  //   post.tags.some((tag) => uniqueTags.includes(tag))
  // );
  return template
    .replace(
      '{BODY}',
      createLayout(createTagsPage(uniqueTags), createSidebar('tags'))
    )
    .replace('<title>Revirtualis</title>', `<title>Tags</title>`);
};

const createTagsPage = (tags: string[]) => {
  return /*html*/ `
<h1>Tags</h1>
<section class="card post">
<p>
This is a cumulative list of tags used in the blog.
</p>
<p>
${tags
  .map((tag) => `<a href='/blog-tags/${tag}' class='list-tag' style="color: var(--color-primary1)">${tag}</a>`)
  .join('\n')}
</p>
</section>
`;
};
