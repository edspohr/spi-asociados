import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { RegionCountrySelector } from './RegionCountrySelector';
import { countriesByRegion } from '../data/countries';

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
  it('opening an untouched region auto-selects all its countries and shows the notice', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const oceaniaButton = screen.getByRole('button', { name: /^Oceanía/ });
    act(() => {
      fireEvent.click(oceaniaButton);
    });

    const oceania = countriesByRegion('Oceanía').map((c) => c.code2);
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining(oceania));
    expect(onChange.mock.calls[0][0]).toHaveLength(oceania.length);

    expect(screen.getByTestId('autofill-notice-Oceanía')).toBeTruthy();
  });

  it('opening a region that already has a partial selection does not change it and shows no notice', () => {
    const onChange = vi.fn();
    const partial = ['AU'];
    render(<Harness initial={partial} onChange={onChange} />);

    const oceaniaButton = screen.getByRole('button', { name: /^Oceanía/ });
    act(() => {
      fireEvent.click(oceaniaButton);
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('autofill-notice-Oceanía')).toBeNull();
  });

  it('unticking a country in an auto-filled region hides the notice', () => {
    render(<Harness />);

    const oceaniaButton = screen.getByRole('button', { name: /^Oceanía/ });
    act(() => {
      fireEvent.click(oceaniaButton);
    });
    expect(screen.getByTestId('autofill-notice-Oceanía')).toBeTruthy();

    const australiaCheckbox = screen.getByRole('checkbox', { name: /Australia/ });
    act(() => {
      fireEvent.click(australiaCheckbox);
    });

    expect(screen.queryByTestId('autofill-notice-Oceanía')).toBeNull();
  });

  it('footer lists regions with at least one selected country', () => {
    const { container } = render(<Harness initial={['AU', 'CL']} />);
    const footer = container.querySelector('p.mt-4');
    expect(footer).not.toBeNull();
    expect(footer!.textContent).toContain('país(es) seleccionados');
    expect(footer!.textContent).toContain('Oceanía');
    expect(footer!.textContent).toContain('Sudamérica');
  });
});
