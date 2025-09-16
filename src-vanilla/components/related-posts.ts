import { BlogPostData } from '../types';
import { createBlogPost } from './blog-post';

export const createRelatedPosts = (
  tags: string[],
  posts: BlogPostData[],
  args: { omitIds: string[]; maxPosts: number }
) => {
  const relatedPosts = posts
    .filter((item) => item.tags.some((tag) => tags.includes(tag)))
    .filter((item) => !args.omitIds.includes(item.id))
    .slice(0, args.maxPosts);
  const relatedPostsHtml =
    relatedPosts
      .map((postListContent) =>
        createBlogPost(postListContent, { showTitle: true, isPreview: true })
      )
      .join('\n') ||
    '<div class="card post"><p style="opacity: 0.5;">No related posts.</p></div>';
  return /*html*/ `
<div class='card post'><h2 class="recent-posts-title">Related Posts</h2></div>
${relatedPostsHtml}
  `;
};
