import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignIn from '../pages/SignIn';

describe('SignIn Component', () => {
  test('renders form elements and title', () => {
    render(<SignIn onSignIn={vi.fn()} />);
    expect(screen.getByText('EzBid Platform')).toBeInTheDocument();
    expect(screen.getByLabelText(/Corporate Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Secure Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Dashboard/i })).toBeInTheDocument();
  });

  test('displays error message on invalid credentials submit', async () => {
    render(<SignIn onSignIn={vi.fn()} />);
    
    const emailInput = screen.getByPlaceholderText('you@flagstaffe.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@flagstaffe.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    }, { timeout: 1500 });
  });

  test('calls onSignIn on successful login submit', async () => {
    const handleSignIn = vi.fn();
    render(<SignIn onSignIn={handleSignIn} />);

    const emailInput = screen.getByPlaceholderText('you@flagstaffe.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });

    fireEvent.change(emailInput, { target: { value: 'admin@flagstaffe.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSignIn).toHaveBeenCalledWith({
        email: 'admin@flagstaffe.com',
        name: 'Dan Brownsword',
        role: 'Administrator / Director'
      });
    }, { timeout: 1500 });
  });
});
