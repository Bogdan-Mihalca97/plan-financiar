
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddTransactionForm from '../AddTransactionForm';

// Test de integrare care testează fluxul complet
describe('AddTransactionForm Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  test('should complete full transaction creation flow', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();

    render(
      <TestWrapper>
        <AddTransactionForm isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Verifică că formularul este afișat
    expect(screen.getByText('Adaugă Tranzacție Nouă')).toBeInTheDocument();

    // Completează toate câmpurile necesare
    const dateField = screen.getByLabelText(/data/i);
    const today = new Date().toISOString().split('T')[0];
    fireEvent.change(dateField, { target: { value: today } });

    await user.type(screen.getByLabelText(/descriere/i), 'Cumpărături de test');
    await user.type(screen.getByLabelText(/suma/i), '299.99');

    // Selectează tipul de tranzacție
    await user.click(screen.getByLabelText(/tip/i));
    await user.click(screen.getByText('Cheltuială'));

    // Selectează categoria
    await user.click(screen.getByLabelText(/categoria/i));
    await user.click(screen.getByText('Alimentare'));

    // Verifică că toate valorile sunt setate corect
    expect(dateField).toHaveValue(today);
    expect(screen.getByDisplayValue('Cumpărături de test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('299.99')).toBeInTheDocument();

    // Verifică că butonul de submit este activ
    const submitButton = screen.getByRole('button', { name: /adaugă tranzacția/i });
    expect(submitButton).not.toBeDisabled();
  });

  test('should prevent submission with invalid data and show appropriate errors', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();

    render(
      <TestWrapper>
        <AddTransactionForm isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Încearcă să trimită formularul fără date
    const submitButton = screen.getByRole('button', { name: /adaugă tranzacția/i });
    await user.click(submitButton);

    // Verifică că erorile de validare sunt afișate
    await waitFor(() => {
      expect(screen.getByText(/descrierea este obligatorie/i)).toBeInTheDocument();
      expect(screen.getByText(/suma este obligatorie/i)).toBeInTheDocument();
      expect(screen.getByText(/categoria este obligatorie/i)).toBeInTheDocument();
    });

    // Verifică că formularul nu se închide
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
