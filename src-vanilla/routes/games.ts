import { createGamePost } from '../components/game-post';
import { createLayout } from '../components/layout';
import { createSidebar } from '../components/side-bar';
import { getDefaultTemplate } from '../get-template';
import { BlogPostData, GamePostData } from '../types';

export const createRoute = (games: GamePostData[], posts: BlogPostData[]) => {
  const template = getDefaultTemplate();
  return template
    .replace(
      '{BODY}',
      createLayout(createGamesPage(games), createSidebar('games'))
    )
    .replace('<title>Revirtualis</title>', '<title>Games</title>');
};

const createGamesPage = (games: GamePostData[]) => {
  return /*html*/ `
<h1>Games</h1>
<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem;">
${games.map((game) => createGamePost(game, { showDetails: false })).join('\n')}
</div>
<footer>
  <p>All games displayed here are made for Revirtualis.</p>
</footer>`;
};
