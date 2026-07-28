import type {
  CalculationResult,
  CartonInput,
  CbmMethodResult,
  ContainerSpec,
  MixedOrientationResult,
  OrderPlan,
  OrientationKey,
  OrientationResult,
  WeightValidation,
} from '../types';
import { round } from '../lib/units';

const ORIENTATIONS: { key: OrientationKey; label: string; pick: (l: number, w: number, h: number) => [number, number, number] }[] = [
  { key: 'LWH', label: 'L × W × H', pick: (l, w, h) => [l, w, h] },
  { key: 'LHW', label: 'L × H × W', pick: (l, w, h) => [l, h, w] },
  { key: 'WLH', label: 'W × L × H', pick: (l, w, h) => [w, l, h] },
  { key: 'WHL', label: 'W × H × L', pick: (l, w, h) => [w, h, l] },
  { key: 'HLW', label: 'H × L × W', pick: (l, w, h) => [h, l, w] },
  { key: 'HWL', label: 'H × W × L', pick: (l, w, h) => [h, w, l] },
];

function m3(cm3: number): number {
  return cm3 / 1_000_000;
}

export function computeOrientations(container: ContainerSpec, carton: CartonInput): { cartonCbm: number; orientations: OrientationResult[] } {
  const cartonCbm = m3(carton.lengthCm * carton.widthCm * carton.heightCm);
  const containerVolumeM3 = m3(container.internalLengthCm * container.internalWidthCm * container.internalHeightCm);

  const orientations: OrientationResult[] = ORIENTATIONS.map(({ key, label, pick }) => {
    const [dx, dy, dz] = pick(carton.lengthCm, carton.widthCm, carton.heightCm);

    const fitLength = Math.floor(container.internalLengthCm / dx);
    const fitWidth = Math.floor(container.internalWidthCm / dy);
    const fitHeight = Math.floor(container.internalHeightCm / dz);
    const totalCartons = Math.max(0, fitLength * fitWidth * fitHeight);

    const remainingLengthCm = container.internalLengthCm - fitLength * dx;
    const remainingWidthCm = container.internalWidthCm - fitWidth * dy;
    const remainingHeightCm = container.internalHeightCm - fitHeight * dz;

    const usedCbm = totalCartons * cartonCbm;
    const unusedCbm = Math.max(0, containerVolumeM3 - usedCbm);
    const efficiencyPct = containerVolumeM3 > 0 ? (usedCbm / containerVolumeM3) * 100 : 0;

    return {
      key,
      label,
      dims: [dx, dy, dz],
      fitLength,
      fitWidth,
      fitHeight,
      totalCartons,
      remainingLengthCm: round(remainingLengthCm),
      remainingWidthCm: round(remainingWidthCm),
      remainingHeightCm: round(remainingHeightCm),
      usedCbm: round(usedCbm, 3),
      unusedCbm: round(unusedCbm, 3),
      efficiencyPct: round(efficiencyPct),
    };
  });

  return { cartonCbm, orientations };
}

export function pickBestOrientation(orientations: OrientationResult[]): OrientationResult {
  return orientations.reduce((best, o) =>
    o.totalCartons > best.totalCartons || (o.totalCartons === best.totalCartons && o.efficiencyPct > best.efficiencyPct) ? o : best
  );
}

/**
 * Mixed-orientation gap fill — a heuristic, not a guaranteed mathematical optimum.
 * After the best single orientation fills the bulk of the container, three leftover
 * slabs remain. We try every rotation in each slab and keep whichever fits the most,
 * approximating how an experienced loader fills gaps with rotated cartons.
 */
export function computeMixedOrientation(
  container: ContainerSpec,
  carton: CartonInput,
  cartonCbm: number,
  best: OrientationResult
): MixedOrientationResult {
  const [dx, dy, dz] = best.dims;
  const usedLength = best.fitLength * dx;
  const usedWidth = best.fitWidth * dy;
  const usedHeight = best.fitHeight * dz;

  const slabs: [number, number, number][] = [
    [container.internalLengthCm - usedLength, container.internalWidthCm, container.internalHeightCm],
    [usedLength, container.internalWidthCm - usedWidth, container.internalHeightCm],
    [usedLength, usedWidth, container.internalHeightCm - usedHeight],
  ];

  let additionalCartons = 0;
  for (const [slabL, slabW, slabH] of slabs) {
    if (slabL <= 0 || slabW <= 0 || slabH <= 0) continue;
    let bestSlabCount = 0;
    for (const { pick } of ORIENTATIONS) {
      const [rx, ry, rz] = pick(carton.lengthCm, carton.widthCm, carton.heightCm);
      const count = Math.floor(slabL / rx) * Math.floor(slabW / ry) * Math.floor(slabH / rz);
      if (count > bestSlabCount) bestSlabCount = count;
    }
    additionalCartons += bestSlabCount;
  }

  const finalCartons = best.totalCartons + additionalCartons;
  const containerVolumeM3 = m3(container.internalLengthCm * container.internalWidthCm * container.internalHeightCm);
  const usedCbm = finalCartons * cartonCbm;
  const unusedCbm = Math.max(0, containerVolumeM3 - usedCbm);
  const efficiencyPct = containerVolumeM3 > 0 ? (usedCbm / containerVolumeM3) * 100 : 0;

  return {
    baseOrientation: best.key,
    baseCartons: best.totalCartons,
    additionalCartons,
    finalCartons,
    efficiencyPct: round(efficiencyPct),
    usedCbm: round(usedCbm, 3),
    unusedCbm: round(unusedCbm, 3),
  };
}

export function computeCbmMethod(
  container: ContainerSpec,
  cartonCbm: number,
  bestOrientationCartons: number,
  mixedCartons: number
): CbmMethodResult {
  const maxTheoreticalCartons = cartonCbm > 0 ? Math.floor(container.practicalCbm / cartonCbm) : 0;
  return {
    cartonCbm: round(cartonCbm, 4),
    practicalContainerCbm: container.practicalCbm,
    maxTheoreticalCartons,
    diffFromPhysical: maxTheoreticalCartons - bestOrientationCartons,
    diffFromMixed: maxTheoreticalCartons - mixedCartons,
  };
}

export function computeWeightValidation(container: ContainerSpec, carton: CartonInput, cartonCount: number): WeightValidation {
  const perCarton = carton.weightPerCartonKg ?? 0;
  const totalWeightKg = round(perCarton * cartonCount, 1);
  const remainingCapacityKg = round(container.maxPayloadKg - totalWeightKg, 1);
  return {
    totalWeightKg,
    containerMaxPayloadKg: container.maxPayloadKg,
    remainingCapacityKg,
    isOverloaded: totalWeightKg > container.maxPayloadKg,
    cartonsAllowedByWeight: perCarton > 0 ? Math.floor(container.maxPayloadKg / perCarton) : null,
  };
}

/** Runs the full pipeline for one container + carton combination, applying the adjustable loading factor. */
export function runFullCalculation(container: ContainerSpec, carton: CartonInput, loadingFactorPct: number): CalculationResult {
  const { cartonCbm, orientations } = computeOrientations(container, carton);
  const bestOrientation = pickBestOrientation(orientations);
  const rawMixed = computeMixedOrientation(container, carton, cartonCbm, bestOrientation);

  const factor = Math.max(0, Math.min(100, loadingFactorPct)) / 100;
  const mixed: MixedOrientationResult = {
    ...rawMixed,
    finalCartons: Math.floor(rawMixed.finalCartons * factor),
  };
  mixed.usedCbm = round(mixed.finalCartons * cartonCbm, 3);
  const containerVolumeM3 = m3(container.internalLengthCm * container.internalWidthCm * container.internalHeightCm);
  mixed.unusedCbm = round(Math.max(0, containerVolumeM3 - mixed.usedCbm), 3);
  mixed.efficiencyPct = round(containerVolumeM3 > 0 ? (mixed.usedCbm / containerVolumeM3) * 100 : 0);

  const cbmMethod = computeCbmMethod(container, cartonCbm, bestOrientation.totalCartons, mixed.finalCartons);
  const weight = computeWeightValidation(container, carton, mixed.finalCartons);
  const totalPieces = mixed.finalCartons * (carton.piecesPerCarton ?? 1);

  return {
    container,
    carton,
    cartonCbm: round(cartonCbm, 4),
    loadingFactorPct,
    orientations,
    bestOrientation,
    mixed,
    cbmMethod,
    weight,
    totalPieces,
  };
}

/** "I have N pieces / N cartons" → how many containers are needed. */
export function computeOrderPlan(result: CalculationResult, orderQty: number, qtyIsPieces: boolean): OrderPlan {
  const piecesPerCarton = result.carton.piecesPerCarton && result.carton.piecesPerCarton > 0 ? result.carton.piecesPerCarton : 1;
  const cartonsNeeded = qtyIsPieces ? Math.ceil(orderQty / piecesPerCarton) : Math.ceil(orderQty);
  const totalCbm = round(cartonsNeeded * result.cartonCbm, 2);
  const totalWeightKg = round(cartonsNeeded * (result.carton.weightPerCartonKg ?? 0), 1);
  const containersRequired = result.mixed.finalCartons > 0 ? Math.ceil(cartonsNeeded / result.mixed.finalCartons) : 0;

  return { orderQty, cartonsNeeded, totalCbm, totalWeightKg, containersRequired };
}
