
import { render } from '@testing-library/react';
import { fireEvent, waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import AddTransactionForm from '../AddTransactionForm';

// Mock the required hooks and contexts
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

describe('AddTransactionForm', () => {
  it('renders all form fields', () => {
    render(<AddTransactionForm />);
    
    expect(screen.getByLabelText(/descriere/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sumă/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categorie/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tip/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dată/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm />);
    
    const submitButton = screen.getByRole('button', { name: /adaugă tranzacția/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/descrierea este obligatorie/i)).toBeInTheDocument();
    });
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm />);
    
    await user.type(screen.getByLabelText(/descriere/i), 'Test expense');
    await user.type(screen.getByLabelText(/sumă/i), '50');
    
    const submitButton = screen.getByRole('button', { name: /adaugă tranzacția/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test expense')).toBeInTheDocument();
    });
  });
});
