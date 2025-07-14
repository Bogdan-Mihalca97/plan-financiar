
import { render } from '@testing-library/react';
import { fireEvent, waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import AddTransactionForm from '../AddTransactionForm';

// Mock the contexts and hooks
jest.mock('@/contexts/TransactionsContext', () => ({
  useTransactions: () => ({
    addTransaction: jest.fn(),
    loading: false,
  }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isAuthenticated: true,
  }),
}));

jest.mock('@/contexts/FamilyContext', () => ({
  useFamily: () => ({
    currentFamily: null,
  }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('AddTransactionForm Integration', () => {
  it('renders form fields correctly', () => {
    render(<AddTransactionForm />);
    
    expect(screen.getByLabelText(/descriere/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sumă/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categorie/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm />);
    
    await user.type(screen.getByLabelText(/descriere/i), 'Test transaction');
    await user.type(screen.getByLabelText(/sumă/i), '100');
    
    const submitButton = screen.getByRole('button', { name: /adaugă tranzacția/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/descriere/i)).toHaveValue('Test transaction');
    });
  });
});
