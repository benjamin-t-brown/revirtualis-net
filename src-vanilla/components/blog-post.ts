import { BlogPostData } from '../types';

export const createBlogPost = (
  post: BlogPostData,
  args: {
    showTitle?: boolean;
    showOverlay?: boolean;
    isPreview?: boolean;
  }
) => {
  const tags = post.tags.map(
    (tag) => `<a href='/blog-tags/${tag}' class='post-tag'>${tag}</a>`
  );

  return /*html*/ `
<section class='card post' style="position: relative; ${args.showOverlay ? 'overflow: hidden; max-height: 300px;' : ''}">
  ${args.showTitle ? `<h3><a href='/blog-posts/${post.id}.html' class='post-link ${args.isPreview ? 'post-link-preview' : ''}'>${post.title}</a></h3>` : ''}
  <div class="post-info">
  <div class="post-header">
    <div class="date-time">${new Date(post.createdAt).toLocaleDateString()}</div>
    <span class="post-author">${post.author}</span>
  </div>
  <div>
    <span class="post-tags">
      ${tags.join(' ')}
    </span>
  </div>
  </div>
  <div class="post-content">${args.isPreview ? '<p>' + post.excerpt + '</p>' : args.showOverlay ? '<p>' + post.content.slice(0, 500) + '</p>' : post.content}</div>
  ${args.showOverlay ? `<a href='/blog-posts/${post.id}.html'><div class="post-overlay"><span>Read More</span></div></a>` : ''}
</section>
  `;
};
