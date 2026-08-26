import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { RegionCountrySelector } from './RegionCountrySelector';
import { countriesByRegion } from '../data/countries';
import { findStage1Blockers } from '../lib/payload';
import { EMPTY_FORM } from '../types/form';

afterEach(() => {
  cleanup();
});

function Harness({
  initial = [],
  onChange,
}: {
  initial?: string[];
  onChange?: (next: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial);
  return (
    <RegionCountrySelector
      selected={selected}
      onChange={(next) => {
        setSelected(next);
        onChange?.(next);
      }}
    />
  );
}

describe('RegionCountrySelector', () => {
  it('opening a region does not select any country on its own', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const oceaniaButton = screen.getByRole('button', { name: /^Oceanía/ });
    act(() => {
      fireEvent.click(oceaniaButton);
    });

    expect(onChange).not.toHaveBeenCalled();
    // Every checkbox inside the region is rendered unchecked.
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    for (const cb of checkboxes) {
      expect((cb as HTMLInputElement).checked).toBe(false);
    }
  });

  it('"Marcar todos" selects every country in the region', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const oceaniaButton = screen.getByRole('button', { name: /^Oceanía/ });
    act(() => {
      fireEvent.click(oceaniaButton);
    });

    const marcarTodos = screen.getByRole('button', { name: /Marcar todos/ });
    act(() => {
      fireEvent.click(marcarTodos);
    });

    const oceania = countriesByRegion('Oceanía').map((c) => c.code2);
    const lastCall = onChange.mock.calls.at(-1)![0] as string[];
    expect(lastCall).toEqual(expect.arrayContaining(oceania));
    expect(lastCall).toHaveLength(oceania.length);
  });

  it('after "Marcar todos", unticking one country leaves the rest selected', () => {
    render(<Harness />);

    const oceaniaButton = screen.getByRole('button', { name: /^Oceanía/ });
    act(() => {
      fireEvent.click(oceaniaButton);
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Marcar todos/ }));
    });

    const australiaCheckbox = screen.getByRole('checkbox', { name: /Australia/ });
    expect((australiaCheckbox as HTMLInputElement).checked).toBe(true);

    act(() => {
      fireEvent.click(australiaCheckbox);
    });

    const oceania = countriesByRegion('Oceanía').map((c) => c.code2);
    // All others still selected (region shows N-1 / N).
    const remainingChecked = screen
      .getAllByRole('checkbox')
      .filter((cb) => (cb as HTMLInputElement).checked);
    expect(remainingChecked).toHaveLength(oceania.length - 1);
  });

  it('footer lists regions with at least one selected country', () => {
    const { container } = render(<Harness initial={['AU', 'CL']} />);
    const footer = container.querySelector('p.mt-4');
    expect(footer).not.toBeNull();
    expect(footer!.textContent).toContain('país(es) seleccionados');
    expect(footer!.textContent).toContain('Oceanía');
    expect(footer!.textContent).toContain('Sudamérica');
  });

  it('an untouched form still has the "no countries" stage-1 blocker', () => {
    const blockers = findStage1Blockers(EMPTY_FORM);
    expect(blockers.some((b) => b.code === 'no-countries')).toBe(true);
  });
});
