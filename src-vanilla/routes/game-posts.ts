import { createGamePost } from '../components/game-post';
import { createLayout } from '../components/layout';
import { createRelatedPosts } from '../components/related-posts';
import { createSidebar } from '../components/side-bar';
import { getDefaultTemplate } from '../get-template';
import { BlogPostData, GamePostData } from '../types';

export const createRoute = (game: GamePostData, posts: BlogPostData[]) => {
  const template = getDefaultTemplate();
  return template
    .replace(
      '{BODY}',
      createLayout(createGamePostPage(game, posts), createSidebar('home'))
    )
    .replace('<title>Revirtualis</title>', `<title>${game.title}</title>`);
};

const createGamePostPage = (game: GamePostData, posts: BlogPostData[]) => {
  return /*html*/ `
<h1>${game.title}</h1>
<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem;">
${createGamePost(game, { showDetails: true })}
</div>
${createRelatedPosts(game.blogTags, posts, { omitIds: [], maxPosts: 25 })}
<footer>
  <p>All games displayed here are made for Revirtualis.</p>
</footer>`;
};
