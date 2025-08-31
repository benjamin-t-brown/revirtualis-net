import { Card } from '../elements/Card';
import { DateTime } from '../elements/DateTime';
import { BlogPostData } from '../types';

interface BlogPostProps {
  post: BlogPostData;
}

export const BlogPost = ({ post }: BlogPostProps) => {
  return (
    <Card>
      <h3>{post.title}</h3>
      <DateTime date={post.updatedAt} />
      <p>{post.content}</p>
    </Card>
  );
  return <div>BlogPost</div>;
};
