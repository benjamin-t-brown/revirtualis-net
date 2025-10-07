import { createLayout } from '../components/layout';
import { createSidebar } from '../components/side-bar';
import { BlogPostData } from '../types';
import { getDefaultTemplate } from '../get-template';
import { createBlogPost } from '../components/blog-post';
import { createRelatedPosts } from '../components/related-posts';

const SCRIPT_CONTENTS = {
  rpgscriptlang: '<script src="/scripts/rpgscript-language.js"></script>',
  highlightjs: `
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"
/>
<link
  rel="stylesheet"
  href="/hljs-custom-highlight.css"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="/scripts/highlight.js"></script>
`,
  iframecode: `<script src="/scripts/iframe-code.js"></script>`,
};

export const createRoute = (post: BlogPostData, posts: BlogPostData[]) => {
  const scripts = post.scripts
    .map((script) => {
      const content = SCRIPT_CONTENTS[script];
      if (!content) {
        console.error(
          `%c[ERROR] Script ${script} not found. script=${script} post=${post.id}`,
          'color: red'
        );
        return '';
      }
      return content;
    })
    .join('\n');
  const template = getDefaultTemplate();
  return template
    .replace('<footer>{SCRIPTS}</footer>', scripts)
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
