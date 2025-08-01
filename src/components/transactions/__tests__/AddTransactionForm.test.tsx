
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';

// Mock Supabase
jest.mock('@/integrations/supabase/client');

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
  test('renders form elements', () => {
    render(
      <TestWrapper>
        <AddTransactionForm />
      </TestWrapper>
    );

    expect(screen.getByText('Adaugă Tranzacție')).toBeInTheDocument();
  });
});
