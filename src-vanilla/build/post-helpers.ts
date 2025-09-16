import * as fs from 'node:fs';
import { createRoute as createBlogPostsRoute } from '../routes/blog-posts';
import { convertToJson } from './convert-html-to-json';
import { BlogPostData } from '../types';

export const getAllHtmlFilePaths = (
  dir = 'src-vanilla/posts/html'
): string[] => {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = `${dir}/${file}`;
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFilePaths(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
};

const parsePosts = async (includePublishedOnly: boolean = true) => {
  const filePaths = getAllHtmlFilePaths();
  let posts: BlogPostData[] = [];
  for (const filePath of filePaths) {
    console.log(`parsing ${filePath}`);
    const post = await convertToJson(filePath);
    if (includePublishedOnly) {
      if (post.published) {
        posts.push(post);
      }
    } else {
      posts.push(post);
    }
  }
  posts = posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return posts;
};

export const buildAllPostRoutes = async (
  routes: { path: string; html: string }[],
  includePublishedOnly: boolean = true
) => {
  const posts = await parsePosts(includePublishedOnly);

  for (const post of posts) {
    routes.push({
      path: `/blog-posts/${post.id}`,
      html: createBlogPostsRoute(post, posts),
    });
  }

  return posts;
};

export const buildSinglePostRoute = async (title: string) => {
  const filePaths = getAllHtmlFilePaths();
  const filePath = filePaths.find((filePath) => {
    return filePath.includes(title);
  });
  if (!filePath) {
    throw new Error(`Post with title ${title} not found`);
  }
  const posts = await parsePosts();
  const post = await convertToJson(filePath);
  return {
    path: `/blog-posts/${post.id}`,
    html: createBlogPostsRoute(post, posts),
  };
};
