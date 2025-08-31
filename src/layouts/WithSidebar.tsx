import { SideBar } from '../components/SideBar';

export const WithSidebar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <SideBar />
      <main
        style={{
          width: 'calc(100% - 255px)',
        }}
      >
        {children}
      </main>
    </div>
  );
};
