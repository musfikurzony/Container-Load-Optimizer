import { useState } from 'react';
import type { CalculationResult } from '../types';
import { computeOrderPlan } from '../engine/calculationEngine';
import { formatNumber } from '../lib/units';

interface Props {
  result: CalculationResult;
}

export function OrderPlanner({ result }: Props) {
  const [qtyType, setQtyType] = useState<'pieces' | 'cartons'>('pieces');
  const [qty, setQty] = useState(25000);

  const plan = computeOrderPlan(result, qty, qtyType === 'pieces');

  return (
    <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary mb-1">Order Quantity Planner</h3>
      <p className="text-xs text-text-muted-light dark:text-text-muted mb-3">"I have this many pieces/cartons — how many containers do I need?"</p>

      <div className="flex items-center gap-2 mb-3">
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
          className="w-32 rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-2 text-sm font-mono-data focus:border-accent"
        />
        <div className="flex rounded-lg border border-border-soft-light dark:border-border-soft p-0.5">
          {(['pieces', 'cartons'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setQtyType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                qtyType === t ? 'bg-accent text-white' : 'text-text-muted-light dark:text-text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-text-muted-light dark:text-text-muted">Cartons needed</p>
          <p className="font-mono-data font-semibold">{formatNumber(plan.cartonsNeeded, 0)}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted-light dark:text-text-muted">Total CBM</p>
          <p className="font-mono-data font-semibold">{formatNumber(plan.totalCbm, 2)} m³</p>
        </div>
        <div>
          <p className="text-xs text-text-muted-light dark:text-text-muted">Total weight</p>
          <p className="font-mono-data font-semibold">{formatNumber(plan.totalWeightKg, 0)} kg</p>
        </div>
        <div>
          <p className="text-xs text-text-muted-light dark:text-text-muted">Containers required</p>
          <p className="font-mono-data font-semibold text-accent text-lg">
            {plan.containersRequired} × {result.container.label}
          </p>
        </div>
      </div>
    </div>
  );
}
