import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly optionalText?: string;
  readonly hint?: string;
  readonly error?: string;
  readonly children: ReactNode;
}

export function Field({ id, label, required, optionalText, hint, error, children }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="flex flex-wrap items-baseline gap-1.5">
        <span>{label}</span>
        {required ? (
          <span className="text-primary" aria-hidden="true">
            *
          </span>
        ) : optionalText ? (
          <span className="text-xs font-normal text-muted-foreground">{optionalText}</span>
        ) : null}
      </Label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
