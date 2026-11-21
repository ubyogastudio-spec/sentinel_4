interface PageHeaderProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
}

export function PageHeader({ eyebrow, title, lead }: PageHeaderProps) {
  return (
    <header className="bg-hero-bg pt-32 pb-12 md:pb-16">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <p className="text-xs font-medium uppercase tracking-widest mn-label-track text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em] mn-heading-track text-foreground">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground">
          {lead}
        </p>
      </div>
    </header>
  );
}
