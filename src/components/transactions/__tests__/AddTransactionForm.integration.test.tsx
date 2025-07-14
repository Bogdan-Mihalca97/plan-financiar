
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('AddTransactionForm Integration', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form when open', () => {
    render(
      <TestWrapper>
        <AddTransactionForm isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('Adaugă Tranzacție')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <TestWrapper>
        <AddTransactionForm isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.queryByText('Adaugă Tranzacție')).not.toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    render(
      <TestWrapper>
        <AddTransactionForm isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Fill out the form and submit
    const descriptionInput = screen.getByPlaceholderText(/descriere/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test transaction' } });

    const submitButton = screen.getByRole('button', { name: /adaugă/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
