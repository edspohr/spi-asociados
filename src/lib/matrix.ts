import type { CellState, GroupMatrix } from '../types/form';
import { makeCellKey } from '../types/form';
import type { CountryCode } from '../data/countries';

/**
 * Decide the next uniform state for a bulk operation over a group of cells
 * (a column of countries under one service, or a row of services under one
 * country). Rules:
 *
 * - All cells empty        → 'directo'
 * - All cells directo      → 'tercerizado'
 * - All cells tercerizado  → 'empty'
 * - Mixed states           → 'directo'  (first click uniforms; subsequent clicks cycle)
 */
export function nextBulkState(currentStates: CellState[]): CellState {
  if (currentStates.length === 0) return 'empty';
  const first = currentStates[0];
  const uniform = currentStates.every((s) => s === first);
  if (!uniform) return 'directo';
  if (first === 'empty') return 'directo';
  if (first === 'directo') return 'tercerizado';
  return 'empty';
}

/**
 * Apply a uniform next state to every (service × country) key in `keys`.
 * Empty state removes the entries; other states write them.
 */
export function applyBulk(
  matrix: GroupMatrix,
  keys: string[],
  next: CellState,
): GroupMatrix {
  const out: GroupMatrix = { ...matrix };
  for (const k of keys) {
    if (next === 'empty') delete out[k];
    else out[k] = next;
  }
  return out;
}

/** Keys of the vertical column for one country across every service. */
export function columnKeys(services: string[], country: CountryCode): string[] {
  return services.map((s) => makeCellKey(s, country));
}

/** Keys of the horizontal row for one service across every country. */
export function rowKeys(service: string, countries: CountryCode[]): string[] {
  return countries.map((c) => makeCellKey(service, c));
}

/** Read the current state at `key` from the matrix (empty when absent). */
export function readStates(matrix: GroupMatrix, keys: string[]): CellState[] {
  return keys.map((k) => matrix[k] ?? 'empty');
}
