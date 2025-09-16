export interface BlogPostData {
  id: string;
  title: string;
  content: string;
  author: string;
  updatedAt: string;
  tags: string[];
  excerpt: string;
  published: boolean;
  createdAt: string;
}

export interface BlogPostListItemData {
  id: string;
  title: string;
  author: string;
  updatedAt: string;
  tags: string[];
  excerpt: string;
  published: boolean;
  createdAt: string;
}

export interface BlogPostListData {
  posts: BlogPostListItemData[];
}

export interface GamePostData {
  id: string;
  title: string;
  icon: string; //36x36
  coverImage: string; //400x250
  genre: 'platformer' | 'arcade' | 'narrative' | 'rpg' | 'puzzle' | 'other';
  releaseDate: string;
  description: string;
  webLink: string;
  demoLink: string;
  steamLink: string;
  itchLink: string;
  githubLink: string;
  screenshots: string[];
  blogTags: string[];
}
