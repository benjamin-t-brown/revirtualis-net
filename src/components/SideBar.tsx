import { SideBarLink } from '../elements/SideBarLink';

export const SideBar = () => {
  return (
    <div className="side-bar">
      <SideBarLink to="/games">Games</SideBarLink>
      <SideBarLink to="/blog">Blog</SideBarLink>
    </div>
  );
};
