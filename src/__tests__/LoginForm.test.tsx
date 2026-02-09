import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../components/LoginForm';
import { NAuthProvider } from '../contexts/NAuthContext';

const mockLogin = vi.fn();

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

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

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

  it('renders forgot password link when showForgotPassword is true', () => {
    render(<LoginForm showForgotPassword />, { wrapper });
    
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
  });

  it('renders register link when showRegisterLink is true', () => {
    render(<LoginForm showRegisterLink />, { wrapper });
    
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });
});
