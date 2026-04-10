import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '@/components/Navbar';

// Mock auth context
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', role: 'User', name: 'Test User' },
    logout: vi.fn(),
  }),
}));

describe('Navbar Component', () => {
  it('should render the Library link', () => {
    render(<Navbar />);
    const libraryLink = screen.getByText(/Library/i);
    expect(libraryLink).toBeDefined();
    expect(libraryLink.getAttribute('href')).toBe('/library');
  });

  it('should render core navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText(/Dashboard/i)).toBeDefined();
    expect(screen.getByText(/Learn/i)).toBeDefined();
    expect(screen.getByText(/Quizzes/i)).toBeDefined();
    expect(screen.getByText(/Practice/i)).toBeDefined();
  });
});
