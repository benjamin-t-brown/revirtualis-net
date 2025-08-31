import { Link, useRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';

interface SideBarLinkProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const SideBarLink = ({ to, children, icon, className = '' }: SideBarLinkProps) => {
  const router = useRouter();
  const isActive = router.state.location.pathname === to;

  return (
    <Link
      to={to}
      className={`sidebar-link ${isActive ? 'active' : ''} ${className}`}
      activeProps={{ className: 'sidebar-link active' }}
    >
      {icon && <span className="sidebar-link-icon">{icon}</span>}
      <span className="sidebar-link-text">{children}</span>
    </Link>
  );
};
    