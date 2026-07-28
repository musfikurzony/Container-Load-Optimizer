export type Unit = 'cm' | 'in' | 'm';

export interface ContainerSpec {
  id: string;
  label: string;
  internalLengthCm: number;
  internalWidthCm: number;
  internalHeightCm: number;
  doorWidthCm: number;
  doorHeightCm: number;
  nominalCbm: number;
  practicalCbm: number;
  maxPayloadKg: number;
}

export interface CartonInput {
  name?: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  piecesPerCarton?: number;
  weightPerCartonKg?: number;
}

export type OrientationKey = 'LWH' | 'LHW' | 'WLH' | 'WHL' | 'HLW' | 'HWL';

export interface OrientationResult {
  key: OrientationKey;
  label: string;
  dims: [number, number, number];
  fitLength: number;
  fitWidth: number;
  fitHeight: number;
  totalCartons: number;
  remainingLengthCm: number;
  remainingWidthCm: number;
  remainingHeightCm: number;
  usedCbm: number;
  unusedCbm: number;
  efficiencyPct: number;
}

export interface MixedOrientationResult {
  baseOrientation: OrientationKey;
  baseCartons: number;
  additionalCartons: number;
  finalCartons: number;
  efficiencyPct: number;
  usedCbm: number;
  unusedCbm: number;
}

export interface CbmMethodResult {
  cartonCbm: number;
  practicalContainerCbm: number;
  maxTheoreticalCartons: number;
  diffFromPhysical: number;
  diffFromMixed: number;
}

export interface WeightValidation {
  totalWeightKg: number;
  containerMaxPayloadKg: number;
  remainingCapacityKg: number;
  isOverloaded: boolean;
  cartonsAllowedByWeight: number | null;
}

export interface CalculationResult {
  container: ContainerSpec;
  carton: CartonInput;
  cartonCbm: number;
  loadingFactorPct: number;
  orientations: OrientationResult[];
  bestOrientation: OrientationResult;
  mixed: MixedOrientationResult;
  cbmMethod: CbmMethodResult;
  weight: WeightValidation;
  totalPieces: number;
}

export interface OrderPlan {
  orderQty: number;
  cartonsNeeded: number;
  totalCbm: number;
  totalWeightKg: number;
  containersRequired: number;
}

export interface FreightInput {
  rate20GP: number;
  rate40GP: number;
  rate40HQ: number;
  rate45HQ: number;
  currency: string;
}

export interface FreightResult {
  containerRateUsed: number;
  freightPerContainer: number;
  freightPerCarton: number;
  freightPerPiece: number;
  freightPerCbm: number;
  freightPerKg: number;
}

export interface SavedProject {
  id: string;
  projectName: string;
  customer?: string;
  style?: string;
  date: string;
  remarks?: string;
  containerId: string;
  unit: Unit;
  loadingFactorPct: number;
  carton: CartonInput;
  orderQty?: number;
  createdAt: string;
  updatedAt: string;
}
