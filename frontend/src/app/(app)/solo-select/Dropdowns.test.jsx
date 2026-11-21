import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchableRoleDropdown, SelectDropdown } from './Dropdowns';

describe('SelectDropdown', () => {
  const options = [{ id: 'a', name: 'Junior', years: '1-2' }, { id: 'b', name: 'Senior' }];

  it('is a labelled native select and reports the chosen id', async () => {
    const onChange = vi.fn();
    render(<SelectDropdown label="experience level" value={null} options={options} onChange={onChange} />);
    const select = screen.getByLabelText('experience level');
    await userEvent.selectOptions(select, 'b');
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('option', { name: 'Junior (1-2 years)' })).toBeInTheDocument();
  });

  it('reports null when the placeholder is chosen again', async () => {
    const onChange = vi.fn();
    render(<SelectDropdown label="experience level" value="a" options={options} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('experience level'), '');
    expect(onChange).toHaveBeenCalledWith(null);
  });
});

describe('SearchableRoleDropdown', () => {
  it('filters as you type and selects with the keyboard', async () => {
    const onChange = vi.fn();
    render(<SearchableRoleDropdown value={null} onChange={onChange} />);
    const box = screen.getByRole('combobox', { name: 'Role' });
    expect(box).toHaveAttribute('aria-expanded', 'false');

    await userEvent.type(box, 'backend');
    expect(box).toHaveAttribute('aria-expanded', 'true');
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    expect(options.every((o) => /backend/i.test(o.textContent))).toBe(true);

    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].name).toMatch(/backend/i);
  });

  it('closes on Escape and shows an empty state for no matches', async () => {
    render(<SearchableRoleDropdown value={null} onChange={() => {}} />);
    const box = screen.getByRole('combobox', { name: 'Role' });
    await userEvent.type(box, 'zzzzqq');
    expect(screen.getByText(/No roles match/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(box).toHaveAttribute('aria-expanded', 'false');
  });
});
