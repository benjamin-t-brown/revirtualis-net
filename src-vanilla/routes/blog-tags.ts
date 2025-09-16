import { createBlogPost } from '../components/blog-post';
import { createLayout } from '../components/layout';
import { createSidebar } from '../components/side-bar';
import { getDefaultTemplate } from '../get-template';
import { BlogPostData } from '../types';

export const createRoute = (tag: string, posts: BlogPostData[]) => {
  const template = getDefaultTemplate();
  return template
    .replace(
      '{BODY}',
      createLayout(createBlogTagsPage(tag, posts), createSidebar('home'))
    )
    .replace('<title>Revirtualis</title>', '<title>Tag: ' + tag + '</title>');
};

const createBlogTagsPage = (tag: string, posts: BlogPostData[]) => {
  return /*html*/ `
<h1>Tag: ${tag}</h1>
${posts
  .filter((post) => post.tags.includes(tag))
  .map((postListContent, i) =>
    createBlogPost(postListContent, {
      showTitle: true,
      showOverlay: i < 5 ? true : false,
      isPreview: i < 5 ? false : true,
    })
  )
  .join('\n')}
</div>
`;
};

// ${createBlogPosts(recentPosts)}
