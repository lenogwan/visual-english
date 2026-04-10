import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizListPage from '@/app/quiz/page';

// Mock auth context
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'teacher@test.com', role: 'Teacher', name: 'Teacher' },
    token: 'fake-token',
  }),
}));

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Quiz List UI (Student Entry)', () => {
  it('should render the Access Code input field', () => {
    render(<QuizListPage />);
    expect(screen.getByPlaceholderText(/6-DIGIT CODE/i)).toBeDefined();
  });

  it('should only allow 6 digits in the input', () => {
    render(<QuizListPage />);
    const input = screen.getByPlaceholderText(/6-DIGIT CODE/i) as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: '123456' } });
    expect(input.value).toBe('123456');
    
    // Test letter filtering (our logic filters non-digits)
    fireEvent.change(input, { target: { value: '123ABC' } });
    expect(input.value).toBe('123');
  });

  it('should enable join button only when code is 6 digits', () => {
    render(<QuizListPage />);
    const input = screen.getByPlaceholderText(/6-DIGIT CODE/i);
    const button = screen.getByRole('button', { name: /JOIN QUIZ/i });
    
    expect(button).toBeDisabled();
    
    fireEvent.change(input, { target: { value: '123456' } });
    expect(button).not.toBeDisabled();
  });
});
