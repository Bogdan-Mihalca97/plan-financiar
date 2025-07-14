
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTransactionForm from '../AddTransactionForm';

// Mock the transactions context
const mockAddTransaction = jest.fn();
const mockTransactionsContext = {
  transactions: [],
  categories: ['Food', 'Transport', 'Entertainment'],
  addTransaction: mockAddTransaction,
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
  loading: false,
  refreshTransactions: jest.fn(),
};

jest.mock('@/contexts/TransactionsContext', () => ({
  useTransactions: () => mockTransactionsContext,
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('AddTransactionForm Integration', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    mockAddTransaction.mockReset();
  });

  it('should submit transaction with all fields', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm {...mockProps} />);
    
    // Fill form fields
    await user.type(screen.getByLabelText(/descriere/i), 'Test transaction');
    await user.type(screen.getByLabelText(/suma/i), '100');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalled();
    });
  });

  it('should handle form validation errors', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm {...mockProps} />);
    
    // Try to submit without required fields
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    // Should not call addTransaction if form is invalid
    expect(mockAddTransaction).not.toHaveBeenCalled();
  });
});
