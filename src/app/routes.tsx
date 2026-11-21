import { Navigate, Route, Routes } from 'react-router-dom';
import { ShellLayout } from './ShellLayout';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { HomePage } from '@/pages/HomePage';
import { LegalPage } from '@/pages/LegalPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { QuotePage } from '@/pages/QuotePage';
import { ServicesPage } from '@/pages/ServicesPage';
import { TeamPage } from '@/pages/TeamPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="quote" element={<QuotePage />} />
        <Route path="legal" element={<Navigate to="/legal/privacy" replace />} />
        <Route path="legal/:slug" element={<LegalPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
