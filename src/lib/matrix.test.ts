import { describe, expect, it } from 'vitest';
import {
  applyBulk,
  columnKeys,
  nextBulkState,
  readStates,
  rowKeys,
} from './matrix';
import type { GroupMatrix } from '../types/form';
import { makeCellKey } from '../types/form';

describe('nextBulkState', () => {
  it('empty column advances to directo', () => {
    expect(nextBulkState(['empty', 'empty', 'empty'])).toBe('directo');
  });

  it('uniformly directo advances to tercerizado', () => {
    expect(nextBulkState(['directo', 'directo'])).toBe('tercerizado');
  });

  it('uniformly tercerizado advances to empty', () => {
    expect(nextBulkState(['tercerizado', 'tercerizado', 'tercerizado'])).toBe('empty');
  });

  it('mixed states uniform to directo (first click flattens)', () => {
    expect(nextBulkState(['directo', 'empty'])).toBe('directo');
    expect(nextBulkState(['tercerizado', 'directo', 'empty'])).toBe('directo');
  });

  it('handles the empty input case gracefully', () => {
    expect(nextBulkState([])).toBe('empty');
  });
});

describe('applyBulk', () => {
  it('writes the state to every key when non-empty', () => {
    const m: GroupMatrix = {};
    const next = applyBulk(m, ['a::X', 'b::X'], 'directo');
    expect(next).toEqual({ 'a::X': 'directo', 'b::X': 'directo' });
  });

  it('removes the entries when the target state is empty', () => {
    const m: GroupMatrix = { 'a::X': 'directo', 'b::X': 'tercerizado', 'c::Y': 'directo' };
    const next = applyBulk(m, ['a::X', 'b::X'], 'empty');
    expect(next).toEqual({ 'c::Y': 'directo' });
  });

  it('does not mutate the input matrix', () => {
    const m: GroupMatrix = { 'a::X': 'directo' };
    applyBulk(m, ['a::X'], 'tercerizado');
    expect(m).toEqual({ 'a::X': 'directo' });
  });
});

describe('columnKeys / rowKeys', () => {
  it('columnKeys builds one key per service under the given country', () => {
    expect(columnKeys(['Hosting', 'Ensayos'], 'CL')).toEqual([
      makeCellKey('Hosting', 'CL'),
      makeCellKey('Ensayos', 'CL'),
    ]);
  });

  it('rowKeys builds one key per country under the given service', () => {
    expect(rowKeys('Hosting', ['CL', 'CO'])).toEqual([
      makeCellKey('Hosting', 'CL'),
      makeCellKey('Hosting', 'CO'),
    ]);
  });
});

describe('readStates', () => {
  it('returns empty for keys not in the matrix', () => {
    const m: GroupMatrix = { 'a::X': 'directo' };
    expect(readStates(m, ['a::X', 'b::X'])).toEqual(['directo', 'empty']);
  });
});
