import type { CalculationResult, FreightInput, FreightResult } from '../types';
import { round } from './units';

export function computeFreight(result: CalculationResult, freight: FreightInput): FreightResult {
  const rateMap: Record<string, number> = {
    '20GP': freight.rate20GP,
    '40GP': freight.rate40GP,
    '40HQ': freight.rate40HQ,
    '45HQ': freight.rate45HQ,
  };
  const containerRateUsed = rateMap[result.container.id] ?? 0;

  const cartons = result.mixed.finalCartons;
  const pieces = result.totalPieces;
  const cbm = result.mixed.usedCbm;
  const weightKg = result.weight.totalWeightKg;

  return {
    containerRateUsed,
    freightPerContainer: containerRateUsed,
    freightPerCarton: cartons > 0 ? round(containerRateUsed / cartons, 3) : 0,
    freightPerPiece: pieces > 0 ? round(containerRateUsed / pieces, 4) : 0,
    freightPerCbm: cbm > 0 ? round(containerRateUsed / cbm, 2) : 0,
    freightPerKg: weightKg > 0 ? round(containerRateUsed / weightKg, 3) : 0,
  };
}
