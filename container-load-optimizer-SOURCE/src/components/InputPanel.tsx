import { Package } from 'lucide-react';
import type { CartonInput, Unit } from '../types';
import { CONTAINERS, getContainer } from '../data/containers';
import { cmToUnit, formatNumber, unitToCm } from '../lib/units';

interface Props {
  containerId: string;
  onContainerChange: (id: string) => void;
  unit: Unit;
  carton: CartonInput;
  onCartonChange: (c: CartonInput) => void;
  loadingFactorPct: number;
  onLoadingFactorChange: (v: number) => void;
}

const LOADING_FACTOR_PRESETS = [70, 75, 80, 85, 90, 95, 100];

function Field({
  label,
  value,
  onChange,
  suffix,
  step = 0.1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs text-text-muted-light dark:text-text-muted">{label}</span>
      <div className="relative mt-1">
        <input
          type="number"
          step={step}
          min={0}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-2 text-sm font-mono-data text-text-primary-light dark:text-text-primary focus:border-accent"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted-light dark:text-text-muted">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

export function InputPanel({
  containerId,
  onContainerChange,
  unit,
  carton,
  onCartonChange,
  loadingFactorPct,
  onLoadingFactorChange,
}: Props) {
  const container = getContainer(containerId);
  const isCustomFactor = !LOADING_FACTOR_PRESETS.includes(loadingFactorPct);

  const specRow = (label: string, valueCm: number) => (
    <div className="flex justify-between py-1 border-b border-border-soft-light/60 dark:border-border-soft/60 last:border-0">
      <span className="text-text-muted-light dark:text-text-muted">{label}</span>
      <span className="font-mono-data text-text-primary-light dark:text-text-primary">
        {formatNumber(cmToUnit(valueCm, unit), unit === 'cm' ? 0 : 2)} {unit}
      </span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted-light dark:text-text-muted mb-3">
          Container Type
        </h2>
        <select
          value={containerId}
          onChange={(e) => onContainerChange(e.target.value)}
          className="w-full rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-2 text-sm font-medium text-text-primary-light dark:text-text-primary focus:border-accent"
        >
          {CONTAINERS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <div className="mt-3 text-xs space-y-0.5">
          {specRow('Internal Length', container.internalLengthCm)}
          {specRow('Internal Width', container.internalWidthCm)}
          {specRow('Internal Height', container.internalHeightCm)}
          <div className="flex justify-between py-1">
            <span className="text-text-muted-light dark:text-text-muted">Nominal CBM</span>
            <span className="font-mono-data">{formatNumber(container.nominalCbm, 1)} m³</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted-light dark:text-text-muted">Practical CBM</span>
            <span className="font-mono-data">{formatNumber(container.practicalCbm, 1)} m³</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted-light dark:text-text-muted">Max Payload</span>
            <span className="font-mono-data">{formatNumber(container.maxPayloadKg, 0)} kg</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted-light dark:text-text-muted mb-3 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" /> Carton Information
        </h2>

        <label className="block mb-3">
          <span className="text-xs text-text-muted-light dark:text-text-muted">Carton Name (optional)</span>
          <input
            type="text"
            value={carton.name ?? ''}
            onChange={(e) => onCartonChange({ ...carton, name: e.target.value })}
            placeholder="e.g. Style PE-4021 outer carton"
            className="mt-1 w-full rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-2 text-sm text-text-primary-light dark:text-text-primary focus:border-accent"
          />
        </label>

        <div className="grid grid-cols-3 gap-2">
          <Field
            label={`Length (${unit})`}
            value={cmToUnit(carton.lengthCm, unit)}
            onChange={(v) => onCartonChange({ ...carton, lengthCm: unitToCm(v, unit) })}
          />
          <Field
            label={`Width (${unit})`}
            value={cmToUnit(carton.widthCm, unit)}
            onChange={(v) => onCartonChange({ ...carton, widthCm: unitToCm(v, unit) })}
          />
          <Field
            label={`Height (${unit})`}
            value={cmToUnit(carton.heightCm, unit)}
            onChange={(v) => onCartonChange({ ...carton, heightCm: unitToCm(v, unit) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <Field
            label="Pieces / Carton"
            step={1}
            value={carton.piecesPerCarton ?? 0}
            onChange={(v) => onCartonChange({ ...carton, piecesPerCarton: v })}
          />
          <Field
            label="Weight / Carton (kg)"
            value={carton.weightPerCartonKg ?? 0}
            onChange={(v) => onCartonChange({ ...carton, weightPerCartonKg: v })}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted-light dark:text-text-muted mb-3">
          Loading Factor
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {LOADING_FACTOR_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => onLoadingFactorChange(p)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                loadingFactorPct === p
                  ? 'bg-accent text-white border-accent'
                  : 'border-border-soft-light dark:border-border-soft text-text-muted-light dark:text-text-muted hover:text-accent'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-text-muted-light dark:text-text-muted">Custom</span>
          <input
            type="number"
            min={0}
            max={100}
            value={isCustomFactor ? loadingFactorPct : ''}
            placeholder={String(loadingFactorPct)}
            onChange={(e) => onLoadingFactorChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            className="w-20 rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-2 py-1 text-xs font-mono-data focus:border-accent"
          />
          <span className="text-xs text-text-muted-light dark:text-text-muted">%</span>
        </div>
        <p className="text-xs text-text-muted-light dark:text-text-muted mt-2">
          Applied to the mixed-orientation result to reflect real-world loading conditions (uneven cartons, pallets, aisle space, etc.).
        </p>
      </div>
    </div>
  );
}
