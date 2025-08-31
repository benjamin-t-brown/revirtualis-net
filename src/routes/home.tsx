import { createFileRoute } from '@tanstack/react-router';
import { WithSidebar } from '../layouts/WithSidebar';

export const Route = createFileRoute('/home')({
  component: Home,
});

export function Home() {
  return <WithSidebar>Hello "/Home route"!</WithSidebar>;
}
