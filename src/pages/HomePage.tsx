import { CtaBand } from '@/components/home/CtaBand';
import { GlassSection } from '@/components/home/GlassSection';
import { ProductsTeaser } from '@/components/home/ProductsTeaser';
import { ProjectsTeaser } from '@/components/home/ProjectsTeaser';
import { ServicesTeaser } from '@/components/home/ServicesTeaser';
import { SplineHero } from '@/components/home/SplineHero';
import { useDocumentMeta } from '@/app/useDocumentMeta';
import { useLocale } from '@/i18n/LocaleProvider';

export function HomePage() {
  const { t } = useLocale();

  useDocumentMeta({
    title: t.meta.titleHome,
    description: t.meta.description,
  });

  return (
    <>
      <SplineHero />
      <GlassSection />
      <ServicesTeaser />
      <ProductsTeaser />
      <ProjectsTeaser />
      <CtaBand />
    </>
  );
}
