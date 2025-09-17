import { GamePostData } from '../types';
import { createDateTime } from './datetime';
import { createImageCarousel } from './image-carousel';

const createGameLink = (url: string, text: string, iconUrl: string) => {
  return /*html*/ `
<div>
  <a
    href=${url}
    target="_blank"
    rel="noopener noreferrer"
    class="game-post-link"
  >
    <img
      src=${iconUrl}
      alt="Web"
      class="game-post-icon"
    />
    ${text}
  </a>
</div>
  `;
};

export const createGamePost = (
  game: GamePostData,
  args: {
    showDetails?: boolean;
  }
) => {
  return /*html*/ `
<section class="card post game-post" style="max-width: ${args.showDetails ? 'unset' : '400px'};">
  <div class="game-post-info" style="width: ${args.showDetails ? undefined : '100%'};">
    <div
      style="text-align: center;"
    >
      <a
        style="text-decoration: none;"
        href="/game-posts/${game.id}"
      >
        <img
          src="${game.coverImage}"
          alt=${game.title}
          class="game-post-cover-image"
        />
      </a>
    </div>
    <br>
    <h3>
      <img
        src=${game.icon}
        alt=${game.title}
        class="game-post-cover-icon"
      />
      <a
        style="text-decoration: none;"
        href="/game-posts/${game.id}"
      >
        <span>${game.title}</span>
      </a>
    </h3>
    <p
        style="opacity: 0.8;"
    >
      ${game.description}
    </p>
    <p
      style="opacity: 0.6;"
    >
      Release Date: ${createDateTime(game.releaseDate)} | ${game.genre}
    </p>
    <div class="game-post-links">
      ${[
        game.webLink &&
          createGameLink(
            game.webLink,
            'Play on the Web',
            '/img/icons/icon-web.png'
          ),
        game.demoLink &&
          createGameLink(game.demoLink, 'Demo', '/img/icons/icon-demo.png'),
        game.steamLink &&
          createGameLink(game.steamLink, 'Steam', '/img/icons/icon-steam.png'),
        game.itchLink &&
          createGameLink(game.itchLink, 'ItchIo', '/img/icons/icon-itch.png'),
        game.githubLink &&
          createGameLink(
            game.githubLink,
            'Github',
            '/img/icons/icon-github.png'
          ),
      ]
        .filter(Boolean)
        .join('\n')}
    </div>
  </div>
  ${
    args.showDetails
      ? /*html*/ `
    <div class="game-post-details">
      ${createImageCarousel(game.screenshots)}
    </div>
  `
      : ''
  }
</section>`;
};
