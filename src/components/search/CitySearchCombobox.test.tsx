import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CitySearchCombobox } from './CitySearchCombobox'

const POPULAR = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Kochi',
]

describe('CitySearchCombobox', () => {
  it('renders all 12 popular chips without typing', () => {
    const onChange = vi.fn()
    render(<CitySearchCombobox value="" onChange={onChange} />)

    for (const city of POPULAR) {
      expect(screen.getByRole('button', { name: city })).toBeTruthy()
    }
  })

  it('narrows to Pune when typing pune (case-insensitive)', () => {
    const onChange = vi.fn()
    render(<CitySearchCombobox value="" onChange={onChange} />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pune' } })

    const list = screen.getByRole('listbox')
    expect(within(list).getByRole('option', { name: 'Pune' })).toBeTruthy()
  })

  it('orders startsWith matches before includes matches', () => {
    const onChange = vi.fn()
    render(<CitySearchCombobox value="" onChange={onChange} />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'del' } })

    const list = screen.getByRole('listbox')
    const options = within(list).getAllByRole('option').map((el) => el.textContent)
    const delhiIdx = options.findIndex((t) => t === 'Delhi')
    const newDelhiIdx = options.findIndex((t) => t === 'New Delhi')
    expect(delhiIdx).toBeGreaterThanOrEqual(0)
    expect(newDelhiIdx).toBeGreaterThanOrEqual(0)
    expect(delhiIdx).toBeLessThan(newDelhiIdx)
  })

  it('caps the filtered list at 20 items', () => {
    const onChange = vi.fn()
    render(<CitySearchCombobox value="" onChange={onChange} />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } })

    const list = screen.getByRole('listbox')
    expect(within(list).getAllByRole('option')).toHaveLength(20)
  })

  it('calls onChange when a popular chip is clicked', () => {
    const onChange = vi.fn()
    render(<CitySearchCombobox value="" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Kochi' }))
    expect(onChange).toHaveBeenCalledWith('Kochi')
  })

  it('exposes combobox role on the input', () => {
    render(<CitySearchCombobox value="" onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toBeTruthy()
  })
})
