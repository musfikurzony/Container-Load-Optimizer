import type { Unit } from '../types';

const CM_PER_INCH = 2.54;

export function cmToUnit(valueCm: number, unit: Unit): number {
  switch (unit) {
    case 'in':
      return valueCm / CM_PER_INCH;
    case 'm':
      return valueCm / 100;
    default:
      return valueCm;
  }
}

export function unitToCm(value: number, unit: Unit): number {
  switch (unit) {
    case 'in':
      return value * CM_PER_INCH;
    case 'm':
      return value * 100;
    default:
      return value;
  }
}

export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export const UNIT_LABELS: Record<Unit, string> = { cm: 'cm', in: 'in', m: 'm' };
