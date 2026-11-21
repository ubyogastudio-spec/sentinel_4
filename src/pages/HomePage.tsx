import { useCallback, useEffect, useState } from 'react';
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
  const [splineSettled, setSplineSettled] = useState(false);

  useDocumentMeta({
    title: t.meta.titleHome,
    description: t.meta.description,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSplineSettled(true);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSplineSettled = useCallback(() => {
    setSplineSettled(true);
  }, []);

  return (
    <>
      <SplineHero onSettled={handleSplineSettled} />
      <GlassSection splineReady={splineSettled} />
      <ServicesTeaser />
      <ProductsTeaser />
      <ProjectsTeaser />
      <CtaBand />
    </>
  );
}
