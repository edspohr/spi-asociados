import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLocalStorageState } from './useLocalStorageState';

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalStorageState', () => {
  it('returns initial value when no stored draft exists', () => {
    const { result } = renderHook(() => useLocalStorageState('k1', { n: 0 }));
    expect(result.current[0]).toEqual({ n: 0 });
  });

  it('persists state to localStorage after the debounce', async () => {
    const { result } = renderHook(() =>
      useLocalStorageState('k2', { n: 0 }, { debounceMs: 0 }),
    );
    act(() => result.current[1]({ n: 42 }));
    await new Promise((r) => setTimeout(r, 5));
    expect(JSON.parse(localStorage.getItem('k2::v1') || 'null')).toEqual({ n: 42 });
  });

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem('k3::v1', JSON.stringify({ n: 7 }));
    const { result } = renderHook(() => useLocalStorageState('k3', { n: 0 }));
    expect(result.current[0]).toEqual({ n: 7 });
  });

  it('ignores drafts stored under a different version', () => {
    localStorage.setItem('k4::v1', JSON.stringify({ n: 7 }));
    const { result } = renderHook(() => useLocalStorageState('k4', { n: 0 }, { version: 2 }));
    expect(result.current[0]).toEqual({ n: 0 });
  });

  it('clear() removes the stored value and resets state', async () => {
    localStorage.setItem('k5::v1', JSON.stringify({ n: 9 }));
    const { result } = renderHook(() => useLocalStorageState('k5', { n: 0 }, { debounceMs: 0 }));
    expect(result.current[0]).toEqual({ n: 9 });
    act(() => result.current[2]());
    await new Promise((r) => setTimeout(r, 5));
    expect(localStorage.getItem('k5::v1')).toBeNull();
    expect(result.current[0]).toEqual({ n: 0 });
  });
});
