import type { CalculationResult } from '../types';
import { formatNumber } from '../lib/units';

interface Props {
  result: CalculationResult;
}

export function OrientationTable({ result }: Props) {
  const { orientations, bestOrientation } = result;

  return (
    <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border-soft-light dark:border-border-soft">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary">Orientation Analysis</h3>
        <p className="text-xs text-text-muted-light dark:text-text-muted">All six physical rotations, best single fit highlighted</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-text-muted-light dark:text-text-muted border-b border-border-soft-light dark:border-border-soft">
              <th className="px-4 py-2 font-medium">Orientation</th>
              <th className="px-3 py-2 font-medium">Dims (cm)</th>
              <th className="px-3 py-2 font-medium text-right">L Fit</th>
              <th className="px-3 py-2 font-medium text-right">W Fit</th>
              <th className="px-3 py-2 font-medium text-right">H Fit</th>
              <th className="px-3 py-2 font-medium text-right">Cartons</th>
              <th className="px-3 py-2 font-medium text-right">Used CBM</th>
              <th className="px-4 py-2 font-medium text-right">Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {orientations.map((o) => {
              const isBest = o.key === bestOrientation.key;
              return (
                <tr
                  key={o.key}
                  className={`border-b border-border-soft-light/60 dark:border-border-soft/60 last:border-0 ${
                    isBest ? 'bg-accent/10' : ''
                  }`}
                >
                  <td className="px-4 py-2 font-medium text-text-primary-light dark:text-text-primary">
                    {o.label} {isBest && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white">BEST</span>}
                  </td>
                  <td className="px-3 py-2 font-mono-data text-text-muted-light dark:text-text-muted">
                    {o.dims.map((d) => formatNumber(d, 0)).join(' × ')}
                  </td>
                  <td className="px-3 py-2 font-mono-data text-right">{o.fitLength}</td>
                  <td className="px-3 py-2 font-mono-data text-right">{o.fitWidth}</td>
                  <td className="px-3 py-2 font-mono-data text-right">{o.fitHeight}</td>
                  <td className="px-3 py-2 font-mono-data text-right font-semibold">{o.totalCartons}</td>
                  <td className="px-3 py-2 font-mono-data text-right">{formatNumber(o.usedCbm, 2)}</td>
                  <td className="px-4 py-2 font-mono-data text-right">{formatNumber(o.efficiencyPct, 1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
