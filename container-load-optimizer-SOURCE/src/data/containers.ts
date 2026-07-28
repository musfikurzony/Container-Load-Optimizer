import type { ContainerSpec } from '../types';

// Internal dimensions in cm — standard industry reference figures for dry van containers.
export const CONTAINERS: ContainerSpec[] = [
  {
    id: '20GP',
    label: "20' GP (General Purpose)",
    internalLengthCm: 590,
    internalWidthCm: 235,
    internalHeightCm: 239,
    doorWidthCm: 234,
    doorHeightCm: 228,
    nominalCbm: 33.2,
    practicalCbm: 30,
    maxPayloadKg: 21700,
  },
  {
    id: '40GP',
    label: "40' GP (General Purpose)",
    internalLengthCm: 1203,
    internalWidthCm: 235,
    internalHeightCm: 239,
    doorWidthCm: 234,
    doorHeightCm: 228,
    nominalCbm: 67.7,
    practicalCbm: 61,
    maxPayloadKg: 26700,
  },
  {
    id: '40HQ',
    label: "40' HQ (High Cube)",
    internalLengthCm: 1203,
    internalWidthCm: 235,
    internalHeightCm: 269,
    doorWidthCm: 234,
    doorHeightCm: 258,
    nominalCbm: 76.3,
    practicalCbm: 69,
    maxPayloadKg: 26580,
  },
  {
    id: '45HQ',
    label: "45' HQ (High Cube)",
    internalLengthCm: 1355,
    internalWidthCm: 234,
    internalHeightCm: 269,
    doorWidthCm: 234,
    doorHeightCm: 258,
    nominalCbm: 86.1,
    practicalCbm: 78,
    maxPayloadKg: 27600,
  },
];

export function getContainer(id: string): ContainerSpec {
  const c = CONTAINERS.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown container: ${id}`);
  return c;
}
