
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

describe('AddTransactionForm', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    mockAddTransaction.mockReset();
  });

  it('should render form fields', () => {
    render(<AddTransactionForm {...mockProps} />);
    
    expect(screen.getByLabelText(/descriere/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/suma/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adaugă tranzacția/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: /adaugă tranzacția/i });
    await user.click(submitButton);
    
    // Should not submit without required fields
    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it('should submit valid transaction', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm {...mockProps} />);
    
    await user.type(screen.getByLabelText(/descriere/i), 'Test transaction');
    await user.type(screen.getByLabelText(/suma/i), '100');
    
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalled();
    });
  });
});
