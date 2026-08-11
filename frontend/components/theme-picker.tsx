'use client';

import { cn } from '@/lib/utils';
import { THEMES } from '@/lib/themes';

export function ThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (theme: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.label}
          aria-label={`Set theme to ${t.label}`}
          onClick={() => onChange(t.id)}
          className={cn(
            'h-5 w-5 rounded-full border-2 border-white shadow ring-1 ring-black/10 transition-transform hover:scale-110',
            value === t.id && 'scale-110 ring-2 ring-foreground ring-offset-0',
          )}
          style={{ backgroundColor: `hsl(${t.primary})` }}
        />
      ))}
    </div>
  );
}
