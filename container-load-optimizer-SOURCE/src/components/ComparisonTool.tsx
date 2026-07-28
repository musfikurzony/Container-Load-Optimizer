import { useState } from 'react';
import type { CartonInput, ContainerSpec, Unit } from '../types';
import { runFullCalculation } from '../engine/calculationEngine';
import { cmToUnit, formatNumber, unitToCm } from '../lib/units';

interface Props {
  container: ContainerSpec;
  unit: Unit;
  baseCarton: CartonInput;
  loadingFactorPct: number;
}

function MiniField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-text-muted-light dark:text-text-muted">{label}</span>
      <input
        type="number"
        step={0.1}
        min={0}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="mt-1 w-full rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-2 text-sm font-mono-data focus:border-accent"
      />
    </label>
  );
}

export function ComparisonTool({ container, unit, baseCarton, loadingFactorPct }: Props) {
  const [cartonA, setCartonA] = useState<CartonInput>(baseCarton);
  const [cartonB, setCartonB] = useState<CartonInput>({ ...baseCarton, lengthCm: baseCarton.lengthCm * 0.85 });

  const resultA = runFullCalculation(container, cartonA, loadingFactorPct);
  const resultB = runFullCalculation(container, cartonB, loadingFactorPct);

  const CartonForm = ({ label, carton, onChange }: { label: string; carton: CartonInput; onChange: (c: CartonInput) => void }) => (
    <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary mb-3">{label}</h3>
      <div className="grid grid-cols-3 gap-2">
        <MiniField label={`L (${unit})`} value={cmToUnit(carton.lengthCm, unit)} onChange={(v) => onChange({ ...carton, lengthCm: unitToCm(v, unit) })} />
        <MiniField label={`W (${unit})`} value={cmToUnit(carton.widthCm, unit)} onChange={(v) => onChange({ ...carton, widthCm: unitToCm(v, unit) })} />
        <MiniField label={`H (${unit})`} value={cmToUnit(carton.heightCm, unit)} onChange={(v) => onChange({ ...carton, heightCm: unitToCm(v, unit) })} />
      </div>
    </div>
  );

  const diffCartons = resultA.mixed.finalCartons - resultB.mixed.finalCartons;
  const diffPieces = resultA.totalPieces - resultB.totalPieces;
  const diffEff = resultA.mixed.efficiencyPct - resultB.mixed.efficiencyPct;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CartonForm label="Carton A" carton={cartonA} onChange={setCartonA} />
        <CartonForm label="Carton B" carton={cartonB} onChange={setCartonB} />
      </div>

      <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border-soft-light dark:border-border-soft">
          <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary">Comparison — {container.label}</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-text-muted-light dark:text-text-muted border-b border-border-soft-light dark:border-border-soft">
              <th className="px-4 py-2 font-medium">Metric</th>
              <th className="px-4 py-2 font-medium text-right">Carton A</th>
              <th className="px-4 py-2 font-medium text-right">Carton B</th>
              <th className="px-4 py-2 font-medium text-right">Difference (A − B)</th>
            </tr>
          </thead>
          <tbody className="font-mono-data">
            <tr className="border-b border-border-soft-light/60 dark:border-border-soft/60">
              <td className="px-4 py-2 font-sans text-text-muted-light dark:text-text-muted">Mixed-orientation cartons</td>
              <td className="px-4 py-2 text-right">{resultA.mixed.finalCartons}</td>
              <td className="px-4 py-2 text-right">{resultB.mixed.finalCartons}</td>
              <td className="px-4 py-2 text-right text-accent">{diffCartons >= 0 ? '+' : ''}{diffCartons}</td>
            </tr>
            <tr className="border-b border-border-soft-light/60 dark:border-border-soft/60">
              <td className="px-4 py-2 font-sans text-text-muted-light dark:text-text-muted">Total pieces</td>
              <td className="px-4 py-2 text-right">{formatNumber(resultA.totalPieces, 0)}</td>
              <td className="px-4 py-2 text-right">{formatNumber(resultB.totalPieces, 0)}</td>
              <td className="px-4 py-2 text-right text-accent">{diffPieces >= 0 ? '+' : ''}{formatNumber(diffPieces, 0)}</td>
            </tr>
            <tr className="border-b border-border-soft-light/60 dark:border-border-soft/60">
              <td className="px-4 py-2 font-sans text-text-muted-light dark:text-text-muted">Efficiency</td>
              <td className="px-4 py-2 text-right">{formatNumber(resultA.mixed.efficiencyPct, 1)}%</td>
              <td className="px-4 py-2 text-right">{formatNumber(resultB.mixed.efficiencyPct, 1)}%</td>
              <td className="px-4 py-2 text-right text-accent">{diffEff >= 0 ? '+' : ''}{formatNumber(diffEff, 1)} pts</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-sans text-text-muted-light dark:text-text-muted">Unused CBM</td>
              <td className="px-4 py-2 text-right">{formatNumber(resultA.mixed.unusedCbm, 2)} m³</td>
              <td className="px-4 py-2 text-right">{formatNumber(resultB.mixed.unusedCbm, 2)} m³</td>
              <td className="px-4 py-2 text-right text-accent">{formatNumber(resultA.mixed.unusedCbm - resultB.mixed.unusedCbm, 2)} m³</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
