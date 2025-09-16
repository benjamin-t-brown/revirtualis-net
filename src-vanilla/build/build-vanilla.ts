import { createRoute as createHomeRoute } from '../routes/home';
import { createRoute as createGamesRoute } from '../routes/games';
import { createRoute as createGamePostRoute } from '../routes/game-posts';
import { createRoute as createAboutRoute } from '../routes/about';
import { createRoute as createBlogRoute } from '../routes/blog';
import { createRoute as createTagsRoute } from '../routes/tags';
import { createRoute as createBlogTagsRoute } from '../routes/blog-tags';
import * as fs from 'node:fs';
import path from 'node:path';
import { buildAllPostRoutes } from './post-helpers';
import { GamePostData } from '../types';

const INCLUDE_PUBLISHED_ONLY = true;

const copyRecursiveSync = (src: string, dest: string) => {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const item of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
};

const build = async () => {
  console.log('Building app.');

  console.log('creating routes...');
  const routes: { path: string; html: string }[] = [];

  const posts = await buildAllPostRoutes(routes, INCLUDE_PUBLISHED_ONLY);
  const games = JSON.parse(
    fs.readFileSync('src-vanilla/posts/games.json', 'utf8')
  ).games as GamePostData[];

  for (const game of games) {
    routes.push({
      path: `/game-posts/${game.id}`,
      html: createGamePostRoute(game, posts),
    });
  }
  const tags = posts
    .map((post) => post.tags)
    .flat()
    .sort();
  const uniqueTags = [...new Set(tags)].filter((tag) => tag !== '');

  for (const tag of uniqueTags) {
    routes.push({
      path: `/blog-tags/${tag}`,
      html: createBlogTagsRoute(tag, posts),
    });
  }

  routes.push(
    {
      path: '/',
      html: createHomeRoute(posts, games[0]),
    },
    {
      path: '/games',
      html: createGamesRoute(games, posts),
    },
    {
      path: '/blog',
      html: createBlogRoute(posts),
    },
    {
      path: '/tags',
      html: createTagsRoute(posts),
    },
    {
      path: '/about',
      html: createAboutRoute(),
    }
  );

  if (fs.existsSync('dist')) {
    try {
      fs.rmSync('dist', { recursive: true, force: true });
    } catch (error) {
      console.log('[WARN] could not delete dist.');
      // console.error('error deleting dist:', error);
    }
  }
  fs.mkdirSync('dist', { recursive: true });

  for (const route of routes) {
    let routePath = route.path;
    if (routePath === '/') {
      routePath = '/index';
    }
    const url = `dist${routePath}.html`;
    const folderPath = path.dirname(path.resolve(url));
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    console.log(`writing html for route: ${url}`);
    const html = route.html;
    fs.writeFileSync(url, html);
  }

  console.log('copying public into dist...');
  if (fs.existsSync('public')) {
    copyRecursiveSync('public', 'dist');
  }

  console.log('copying scripts into dist...');
  if (fs.existsSync('src-vanilla/scripts')) {
    copyRecursiveSync('src-vanilla/scripts', 'dist/scripts');
  }

  console.log('done');
};

build();
