
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('AddTransactionForm', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly when open', () => {
    render(
      <TestWrapper>
        <AddTransactionForm isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('Adaugă Tranzacție')).toBeInTheDocument();
  });

  test('calls onClose when cancel button is clicked', () => {
    render(
      <TestWrapper>
        <AddTransactionForm isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: /anulează/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('form validation works correctly', () => {
    render(
      <TestWrapper>
        <AddTransactionForm isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /adaugă/i });
    fireEvent.click(submitButton);

    // Form should not submit without required fields
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
