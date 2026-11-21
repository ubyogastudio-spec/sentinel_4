import { Outlet } from 'react-router-dom';
import { ScrollAndFocus } from './ScrollAndFocus';
import { Navbar } from '@/components/shell/Navbar';
import { SiteFooter } from '@/components/shell/SiteFooter';
import { SkipLink } from '@/components/shell/SkipLink';

export function ShellLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-hero-bg text-foreground">
      <SkipLink />
      <ScrollAndFocus />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
