import { Boxes, Moon, Sun } from 'lucide-react';
import type { Unit } from '../types';

interface Props {
  unit: Unit;
  onUnitChange: (u: Unit) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: 'cm', label: 'CM' },
  { value: 'in', label: 'Inch' },
  { value: 'm', label: 'Meter' },
];

export function Header({ unit, onUnitChange, theme, onToggleTheme }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border-soft-light dark:border-border-soft shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
          <Boxes className="w-5 h-5 text-accent" strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold leading-tight text-text-primary-light dark:text-text-primary">
            Container Load Optimizer
          </h1>
          <p className="text-xs text-text-muted-light dark:text-text-muted leading-tight">
            Cartons, pieces, CBM &amp; freight — answered instantly
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="unit-select">
          Unit
        </label>
        <select
          id="unit-select"
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as Unit)}
          className="rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-1.5 text-xs font-medium text-text-primary-light dark:text-text-primary focus:border-accent"
        >
          {UNIT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          className="w-9 h-9 rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface flex items-center justify-center text-text-muted-light dark:text-text-muted hover:text-accent transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
