import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CalculationResult } from '../types';
import { formatNumber } from '../lib/units';

interface Props {
  result: CalculationResult;
}

const ACCENT = '#5b6bf5';
const ACCENT2 = '#22c1a3';
const MUTED = '#8891ab';

export function ChartsPanel({ result }: Props) {
  const { bestOrientation, mixed, cbmMethod } = result;

  const barData = [
    { name: 'Single', cartons: bestOrientation.totalCartons },
    { name: 'Mixed', cartons: mixed.finalCartons },
    { name: 'CBM Est.', cartons: cbmMethod.maxTheoreticalCartons },
  ];

  const usedPct = mixed.efficiencyPct;
  const unusedPct = Math.max(0, 100 - usedPct);

  const pieData = [
    { name: 'Used', value: mixed.usedCbm },
    { name: 'Empty', value: mixed.unusedCbm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary mb-1">Method Comparison</h3>
        <p className="text-xs text-text-muted-light dark:text-text-muted mb-2">Cartons by loading method</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-soft)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border-soft)' }}
              formatter={(v) => [String(v), 'Cartons']}
            />
            <Bar dataKey="cartons" fill={ACCENT} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-text-muted-light dark:text-text-muted mt-1">
          Difference (mixed vs single): <span className="font-mono-data text-accent-2">+{mixed.additionalCartons}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary mb-1">Container Utilization</h3>
        <p className="text-xs text-text-muted-light dark:text-text-muted mb-4">Mixed-orientation basis</p>
        <div className="w-full h-3 rounded-full bg-border-soft-light dark:bg-border-soft overflow-hidden">
          <div className="h-full bg-accent-2 rounded-full transition-all" style={{ width: `${usedPct}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-accent-2 font-mono-data">{formatNumber(usedPct, 1)}% used</span>
          <span className="text-text-muted-light dark:text-text-muted font-mono-data">{formatNumber(unusedPct, 1)}% unused</span>
        </div>
        <div className="mt-4 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted-light dark:text-text-muted">Used volume</span>
            <span className="font-mono-data">{formatNumber(mixed.usedCbm, 2)} m³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted-light dark:text-text-muted">Unused volume</span>
            <span className="font-mono-data">{formatNumber(mixed.unusedCbm, 2)} m³</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary mb-1">Used vs Empty</h3>
        <p className="text-xs text-text-muted-light dark:text-text-muted mb-2">Volume share</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
              <Cell fill={ACCENT2} />
              <Cell fill="var(--color-border-soft)" />
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border-soft)' }}
              formatter={(v) => [`${formatNumber(Number(v), 2)} m³`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
