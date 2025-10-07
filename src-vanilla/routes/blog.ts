import { createBlogPost } from '../components/blog-post';
import { createLayout } from '../components/layout';
import { createSidebar } from '../components/side-bar';
import { getDefaultTemplate } from '../get-template';
import { BlogPostData } from '../types';

export const createRoute = (posts: BlogPostData[]) => {
  const template = getDefaultTemplate();
  return template
    .replace('<footer>{SCRIPTS}</footer>', '')
    .replace(
      '{BODY}',
      createLayout(createBlogPage(posts), createSidebar('blog'))
    )
    .replace('<title>Revirtualis</title>', '<title>Blog</title>');
};

const createBlogPage = (posts: BlogPostData[]) => {
  return /*html*/ `
<h1>Blog</h1>
${posts.map((postListContent, i) => createBlogPost(postListContent, { showTitle: true, showOverlay: i < 5 ? true : false, isPreview: i < 5 ? false : true })).join('\n')}
</div>
`;
};

// ${createBlogPosts(recentPosts)}
