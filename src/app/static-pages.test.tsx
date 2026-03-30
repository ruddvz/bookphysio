import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import FAQPage from './faq/page'
import HowItWorksPage from './how-it-works/page'
import AboutPage from './about/page'

describe('Static Pages Polish', () => {
  it('FAQPage renders with accordion and categories', () => {
    render(<FAQPage />)
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
    expect(screen.getByText('Patients')).toBeInTheDocument()
    expect(screen.getByText('Physiotherapists')).toBeInTheDocument()
    
    // Check for a specific question
    const question = screen.getByText(/How do I book an appointment\?/i)
    expect(question).toBeInTheDocument()
    
    // Check that answer is NOT visible initially if it's hidden (we need to find out how it's hidden in the code)
    // In our implementation, answer is rendered only if isOpen is true
    expect(screen.queryByText(/Simply search for your condition/i)).not.toBeInTheDocument()
    
    // Click to open
    fireEvent.click(question)
    expect(screen.getByText(/Simply search for your condition/i)).toBeInTheDocument()
  })

  it('HowItWorksPage renders with tabs and steps', () => {
    render(<HowItWorksPage />)
    expect(screen.getByText('How BookPhysio Works')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /For Patients/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /For Physiotherapists/i })).toBeInTheDocument()
    
    // Check initial patient steps
    expect(screen.getByText(/Choose Provider/i)).toBeInTheDocument()
    expect(screen.queryByText(/Register Practice/i)).not.toBeInTheDocument()
    
    // Click provider tab
    fireEvent.click(screen.getByRole('button', { name: /For Physiotherapists/i }))
    expect(screen.getByText(/Register Practice/i)).toBeInTheDocument()
    expect(screen.queryByText(/Choose Provider/i)).not.toBeInTheDocument()
  })

  it('AboutPage renders mission and benefits', () => {
    render(<AboutPage />)
    expect(screen.getByText('Our Mission')).toBeInTheDocument()
    expect(screen.getByText('Verified Experts')).toBeInTheDocument()
    expect(screen.getByText(/India's First Physio-Only Platform/i)).toBeInTheDocument()
  })
})
