import { createBlogPost } from '../components/blog-post';
import { createGamePost } from '../components/game-post';
import { createLayout } from '../components/layout';
import { createSidebar } from '../components/side-bar';
import { getDefaultTemplate } from '../get-template';
import { BlogPostData, GamePostData } from '../types';

export const createRoute = (
  posts: BlogPostData[],
  featuredGame: GamePostData
) => {
  const template = getDefaultTemplate();
  const firstPost = posts[0];
  return template
    .replace(
      '{BODY}',
      createLayout(
        createHomePage(firstPost, posts.slice(0, 5), featuredGame),
        createSidebar('home')
      )
    )
    .replace('<title>Revirtualis</title>', '<title>Revirtualis</title>');
};

const createHomeForeword = () => {
  return /*html*/ `
  <p>Welcome to Revirtualis, a small corner of the internet that features interesting projects, code-snippets, opinions, and games.  Make yourself at home.</p>
  <h4>Announcements</h4>
  <p>The js13k entry for 2025 by Benjamin is now submitted!  Check it out <a href="https://js13kgames.com/2025/games/witch-potion">here</a>.<br>
  <img class="blog-image" src="/img/post-data/witch-potion-icon.png" alt="screenshot"></img>
  </p>
  `;
};

const createHomePage = (
  firstPost: BlogPostData,
  recentPosts: BlogPostData[],
  featuredGame: GamePostData
) => {
  return /*html*/ `
<h1>Revirtualis</h1>
<section class="card post">
  <div class="home-foreword">
  <div class="home-foreword-text">
    ${createHomeForeword()}
  </div>
  <div class="home-foreword-game">
  <h4 style="margin-left: 1rem;">Upcoming</h4>
  ${createGamePost(featuredGame, { showDetails: false })}
  </div>
  </div>
</section>
<div class='card post'><h2 class="recent-posts-title">Recent Posts</h2></div>
${recentPosts.map((p) => createBlogPost(p, { showTitle: true, isPreview: true })).join('\n')}
`;
};

// ${createBlogPosts(recentPosts)}
