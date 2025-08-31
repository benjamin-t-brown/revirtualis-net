import { createFileRoute } from '@tanstack/react-router';
import { WithSidebar } from '../layouts/WithSidebar';

export const Route = createFileRoute('/games')({
  component: RouteComponent,
});

const BigSquare = () => {
  return (
    <div
      style={{
        width: '400px',
        height: '400px',
        background: 'blue',
        margin: '40px',
      }}
    ></div>
  );
};

function RouteComponent() {
  return (
    <WithSidebar>
      Hello "/games"!
      <BigSquare />
      <BigSquare />
      <BigSquare />
      <BigSquare />
      <BigSquare />
    </WithSidebar>
  );
}
