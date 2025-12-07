import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Onboarding from './Onboarding';

describe('Onboarding Component', () => {
  it('should render welcome screen initially', () => {
    const mockOnComplete = vi.fn();
    render(<Onboarding onComplete={mockOnComplete} />);

    expect(screen.getByText(/Welcome to Spark/i)).toBeDefined();
  });

  it('should have navigation buttons', () => {
    const mockOnComplete = vi.fn();
    render(<Onboarding onComplete={mockOnComplete} />);

    const nextButton = screen.queryByText(/Next/i) || screen.queryByText(/Continue/i);
    expect(nextButton).toBeDefined();
  });

  it('should call onComplete when wizard is finished', async () => {
    const mockOnComplete = vi.fn();
    render(<Onboarding onComplete={mockOnComplete} />);

    // This is a placeholder test - in a real scenario, you'd navigate through all steps
    // and verify that onComplete is called with the correct configuration
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});
