import { describe, expect, it } from 'vitest';
import { nextCellState } from './MatrixCell';

describe('nextCellState', () => {
  it('cycles empty → directo → tercerizado → empty', () => {
    expect(nextCellState('empty')).toBe('directo');
    expect(nextCellState('directo')).toBe('tercerizado');
    expect(nextCellState('tercerizado')).toBe('empty');
  });
});
