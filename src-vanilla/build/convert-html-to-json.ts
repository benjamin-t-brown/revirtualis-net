import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { BlogPostData } from '../types';

export interface PostMetadata {
  title: string;
  author: string;
  tags: string[];
  excerpt: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  id?: string;
  overrideCreateDate?: string;
  overrideUpdateDate?: string;
}

export const convertToJson = async (filePath: string) => {
  const html = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const { metadata, content: postContent } = parseFrontMatter(html);

  const postId = metadata.id ?? randomUUID() + '-' + fileName.slice(0, 10);
  if (!metadata.id) {
    const updatedHtml = html.replace('---\n', `---\nid: ${postId}\n`);
    console.log(`updating ${filePath} with id ${postId}`);
    fs.writeFileSync(filePath, updatedHtml, 'utf8');
  }

  const post: BlogPostData = {
    id: metadata.id ?? randomUUID() + '-' + fileName.slice(0, 10),
    title: metadata.title || 'Untitled',
    author: metadata.author,
    content: postContent,
    tags: metadata.tags || [],
    excerpt: metadata.excerpt || postContent.substring(0, 150) + '...',
    published: metadata.published !== false,
    createdAt: metadata.overrideCreateDate || metadata.createdAt,
    updatedAt: metadata.overrideUpdateDate || metadata.updatedAt,
  };

  // console.log('Parsed post', post.id, post.createdAt, metadata);

  return post;
};

function parseFrontMatter(content: string): {
  metadata: PostMetadata;
  content: string;
} {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  const metadataText = match?.[1] ?? '';
  const contentText = match?.[2] ?? '';

  const metadata: PostMetadata = {
    title: '',
    author: '',
    tags: [],
    excerpt: '',
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const lines = metadataText.split('\n');

  if (!match) {
    console.log(`No metadata found, using empty metadata`);
    return { metadata, content: content.trim() };
  }

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        let value: string | boolean | string[] = trimmedLine
          .substring(colonIndex + 1)
          .trim();

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (value.startsWith('[') && value.endsWith(']')) {
          value = value
            .slice(1, -1)
            .split(',')
            .map((v) => v.trim().replace(/"/g, ''));
        }

        metadata[key] = value;
      }
    }
  }

  return { metadata, content: contentText.trim() };
}
