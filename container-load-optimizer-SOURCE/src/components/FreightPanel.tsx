import { useState } from 'react';
import type { CalculationResult, FreightInput } from '../types';
import { computeFreight } from '../lib/freight';
import { formatNumber } from '../lib/units';

interface Props {
  result: CalculationResult;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT'];

export function FreightPanel({ result }: Props) {
  const [freight, setFreight] = useState<FreightInput>({
    rate20GP: 800,
    rate40GP: 1400,
    rate40HQ: 1500,
    rate45HQ: 1700,
    currency: 'USD',
  });

  const cost = computeFreight(result, freight);

  const rateField = (label: string, key: keyof Omit<FreightInput, 'currency'>) => (
    <label className="block">
      <span className="text-xs text-text-muted-light dark:text-text-muted">{label}</span>
      <input
        type="number"
        min={0}
        value={freight[key]}
        onChange={(e) => setFreight({ ...freight, [key]: parseFloat(e.target.value) || 0 })}
        className="mt-1 w-full rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-2 text-sm font-mono-data focus:border-accent"
      />
    </label>
  );

  return (
    <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary">Freight Cost</h3>
        <select
          value={freight.currency}
          onChange={(e) => setFreight({ ...freight, currency: e.target.value })}
          className="rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-2 py-1 text-xs focus:border-accent"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-text-muted-light dark:text-text-muted mb-3">
        Enter your own container rates below — no live rate lookup, so you're always in control of the numbers.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {rateField("Rate 20' GP", 'rate20GP')}
        {rateField("Rate 40' GP", 'rate40GP')}
        {rateField("Rate 40' HQ", 'rate40HQ')}
        {rateField("Rate 45' HQ", 'rate45HQ')}
      </div>

      <div className="pt-3 border-t border-border-soft-light dark:border-border-soft space-y-1.5 text-sm">
        <Row label={`Rate used (${result.container.label})`} value={`${formatNumber(cost.containerRateUsed, 0)} ${freight.currency}`} />
        <Row label="Freight / carton" value={`${formatNumber(cost.freightPerCarton, 3)} ${freight.currency}`} />
        <Row label="Freight / piece" value={`${formatNumber(cost.freightPerPiece, 4)} ${freight.currency}`} />
        <Row label="Freight / CBM" value={`${formatNumber(cost.freightPerCbm, 2)} ${freight.currency}`} />
        <Row label="Freight / kg" value={`${formatNumber(cost.freightPerKg, 3)} ${freight.currency}`} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted-light dark:text-text-muted">{label}</span>
      <span className="font-mono-data font-medium text-text-primary-light dark:text-text-primary">{value}</span>
    </div>
  );
}
