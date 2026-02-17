import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../components/LoginForm';
import { NAuthProvider } from '../contexts/NAuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NAuthProvider config={{ apiUrl: 'http://test.com' }}>
    {children}
  </NAuthProvider>
);

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    render(<LoginForm />, { wrapper });
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoginForm />, { wrapper });
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeInTheDocument();
  });

  it('shows validation errors for invalid email', async () => {
    render(<LoginForm />, { wrapper });
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.input(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('shows/hides password when eye icon is clicked', () => {
    render(<LoginForm />, { wrapper });
    
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    // Password input has an adjacent button for toggling visibility
    const toggleButton = passwordInput.parentElement?.querySelector('button');
    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');
    }
  });

  it('renders custom submit text', () => {
    render(<LoginForm customSubmitText="Log In" />, { wrapper });

    const button = screen.getByRole('button', { name: /log in/i });
    expect(button).toBeInTheDocument();
  });

  it('renders remember me checkbox when showRememberMe is true', () => {
    render(<LoginForm showRememberMe />, { wrapper });

    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });
});
