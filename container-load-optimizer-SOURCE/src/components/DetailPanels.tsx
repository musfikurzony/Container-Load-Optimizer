import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { CalculationResult } from '../types';
import { formatNumber } from '../lib/units';

interface Props {
  result: CalculationResult;
}

export function MixedOrientationPanel({ result }: Props) {
  const { mixed, bestOrientation } = result;
  return (
    <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary mb-1">Mixed Orientation Optimizer</h3>
      <p className="text-xs text-text-muted-light dark:text-text-muted mb-3">
        Heuristic gap-fill — not a mathematically optimal packing, but an approximation of experienced warehouse loading.
      </p>
      <div className="space-y-2 text-sm">
        <Row label={`Base (${bestOrientation.label})`} value={`${mixed.baseCartons} cartons`} />
        <Row label="Additional cartons in gaps" value={`+${mixed.additionalCartons}`} accent />
        <Row label="Final cartons" value={String(mixed.finalCartons)} bold />
        <Row label="Efficiency" value={`${formatNumber(mixed.efficiencyPct, 1)}%`} />
      </div>
      {mixed.additionalCartons > 0 && (
        <div className="mt-3 pt-3 border-t border-border-soft-light dark:border-border-soft text-xs text-text-muted-light dark:text-text-muted">
          Rotated cartons were added into leftover length/width/height slabs beyond the base orientation's grid.
        </div>
      )}
    </div>
  );
}

export function CbmMethodPanel({ result }: Props) {
  const { cbmMethod } = result;
  return (
    <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary mb-1">CBM Planning Method</h3>
      <p className="text-xs text-text-muted-light dark:text-text-muted mb-3">Volume-only estimate using practical container CBM.</p>
      <div className="space-y-2 text-sm">
        <Row label="Carton CBM" value={`${formatNumber(cbmMethod.cartonCbm, 4)} m³`} />
        <Row label="Practical container CBM" value={`${formatNumber(cbmMethod.practicalContainerCbm, 1)} m³`} />
        <Row label="Max theoretical cartons" value={String(cbmMethod.maxTheoreticalCartons)} bold />
        <Row
          label="Difference from physical loading"
          value={`${cbmMethod.diffFromPhysical >= 0 ? '+' : ''}${cbmMethod.diffFromPhysical}`}
        />
        <Row
          label="Difference from mixed loading"
          value={`${cbmMethod.diffFromMixed >= 0 ? '+' : ''}${cbmMethod.diffFromMixed}`}
        />
      </div>
    </div>
  );
}

export function WeightPanel({ result }: Props) {
  const { weight } = result;
  return (
    <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary">Weight Validation</h3>
        {weight.isOverloaded ? (
          <AlertTriangle className="w-4 h-4 text-danger" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-accent-2" />
        )}
      </div>
      <p className="text-xs text-text-muted-light dark:text-text-muted mb-3">Payload check against container maximum.</p>
      <div className="space-y-2 text-sm">
        <Row label="Total weight (mixed-orientation cartons)" value={`${formatNumber(weight.totalWeightKg, 0)} kg`} />
        <Row label="Container max payload" value={`${formatNumber(weight.containerMaxPayloadKg, 0)} kg`} />
        <Row
          label="Remaining capacity"
          value={`${formatNumber(weight.remainingCapacityKg, 0)} kg`}
          accent={!weight.isOverloaded}
        />
        {weight.cartonsAllowedByWeight !== null && (
          <Row label="Max cartons allowed by weight" value={String(weight.cartonsAllowedByWeight)} />
        )}
      </div>
      {weight.isOverloaded && (
        <div className="mt-3 pt-3 border-t border-border-soft-light dark:border-border-soft text-xs text-danger flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Overloaded — the mixed-orientation carton count exceeds this container's rated payload. Enter a weight per carton and reduce quantity or split the shipment.
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted-light dark:text-text-muted">{label}</span>
      <span
        className={`font-mono-data ${bold ? 'font-semibold text-text-primary-light dark:text-text-primary' : ''} ${
          accent ? 'text-accent-2' : 'text-text-primary-light dark:text-text-primary'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
