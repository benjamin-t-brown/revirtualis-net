import { createFileRoute } from '@tanstack/react-router';
import { WithSidebar } from '../layouts/WithSidebar';
import { BlogPostData } from '../types';
import { BlogPost } from '../components/BlogPost';

export const Route = createFileRoute('/blog')({
  component: RouteComponent,
});

const testPost: BlogPostData = {
  title: 'Blog Post 1',
  content: 'This is the first blog post',
  author: 'John Doe',
  updatedAt: new Date(),
};

function RouteComponent() {
  return (
    <WithSidebar>
      <h2>Blog</h2>
      <BlogPost post={testPost} />
    </WithSidebar>
  );
}
