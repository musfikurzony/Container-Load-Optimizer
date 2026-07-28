import type { CalculationResult } from '../types';
import { formatNumber } from '../lib/units';

interface Props {
  result: CalculationResult;
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'accent' | 'accent-2' | 'warn' | 'danger' }) {
  const accentClass = {
    accent: 'text-accent',
    'accent-2': 'text-accent-2',
    warn: 'text-warn',
    danger: 'text-danger',
  }[accent ?? 'accent'];

  return (
    <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted-light dark:text-text-muted">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold font-mono-data ${accentClass}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-text-muted-light dark:text-text-muted">{sub}</p>}
    </div>
  );
}

export function KpiCards({ result }: Props) {
  const { bestOrientation, mixed, cbmMethod, weight, totalPieces } = result;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      <Kpi label="Best Orientation" value={bestOrientation.label} sub={`${bestOrientation.totalCartons} cartons`} />
      <Kpi label="Single Orientation" value={String(bestOrientation.totalCartons)} sub="cartons, physical fit" />
      <Kpi
        label="Mixed Orientation"
        value={String(mixed.finalCartons)}
        sub={`+${mixed.additionalCartons} vs single`}
        accent="accent-2"
      />
      <Kpi label="CBM Estimate" value={String(cbmMethod.maxTheoreticalCartons)} sub="practical CBM basis" />
      <Kpi label="Total Pieces" value={formatNumber(totalPieces, 0)} sub="mixed-orientation basis" />
      <Kpi label="Used CBM" value={`${formatNumber(mixed.usedCbm, 2)} m³`} />
      <Kpi label="Unused CBM" value={`${formatNumber(mixed.unusedCbm, 2)} m³`} />
      <Kpi label="Efficiency" value={`${formatNumber(mixed.efficiencyPct, 1)}%`} accent="accent-2" />
      <Kpi
        label="Payload Used"
        value={`${formatNumber(weight.totalWeightKg, 0)} kg`}
        accent={weight.isOverloaded ? 'danger' : 'accent'}
      />
      <Kpi
        label="Remaining Payload"
        value={`${formatNumber(weight.remainingCapacityKg, 0)} kg`}
        accent={weight.isOverloaded ? 'danger' : undefined}
        sub={weight.isOverloaded ? 'Overloaded — reduce cartons' : undefined}
      />
    </div>
  );
}
