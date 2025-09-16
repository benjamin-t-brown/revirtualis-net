import { createLayout } from '../components/layout';
import { createSidebar } from '../components/side-bar';
import { BlogPostData } from '../types';
import { getDefaultTemplate } from '../get-template';
import { createBlogPost } from '../components/blog-post';
import { createRelatedPosts } from '../components/related-posts';

export const createRoute = (post: BlogPostData, posts: BlogPostData[]) => {
  const template = getDefaultTemplate();
  return template
    .replace(
      '{BODY}',
      createLayout(createBlogPostsPage(post, posts), createSidebar('home'))
    )
    .replace('<title>Revirtualis</title>', `<title>${post.title}</title>`);
};

const createBlogPostsPage = (post: BlogPostData, posts: BlogPostData[]) => {
  return /*html*/ `
<h1>${post.title}</h1>
${createBlogPost(post, { showTitle: false })}
${createRelatedPosts(post.tags, posts, { omitIds: [post.id], maxPosts: 5 })}
</div>
`;
};
