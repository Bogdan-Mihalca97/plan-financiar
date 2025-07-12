
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import AddTransactionForm from '../AddTransactionForm';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useToast } from '@/hooks/use-toast';

// Mock pentru dependințe
jest.mock('@/contexts/TransactionsContext');
jest.mock('@/hooks/use-toast');
jest.mock('@/contexts/AuthContext');
jest.mock('@/contexts/FamilyContext');

const mockAddTransaction = jest.fn();
const mockToast = jest.fn();

describe('AddTransactionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTransactions as jest.MockedFunction<typeof useTransactions>).mockReturnValue({
      addTransaction: mockAddTransaction,
      transactions: [],
      familyTransactions: [],
      allTransactions: [],
      loading: false,
      refreshTransactions: jest.fn(),
      updateTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      getTotalIncome: jest.fn(),
      getTotalExpenses: jest.fn(),
      getBalance: jest.fn(),
      getMonthlyIncome: jest.fn(),
      getMonthlyExpenses: jest.fn(),
      getMonthlyBalance: jest.fn(),
      getTransactionsByCategory: jest.fn(),
    });
    (useToast as jest.MockedFunction<typeof useToast>).mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: [],
    });
  });

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  test('should render form fields correctly', () => {
    render(<AddTransactionForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descriere/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/suma/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tip/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adaugă tranzacția/i })).toBeInTheDocument();
  });

  test('should show validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /adaugă tranzacția/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/descrierea este obligatorie/i)).toBeInTheDocument();
      expect(screen.getByText(/suma este obligatorie/i)).toBeInTheDocument();
      expect(screen.getByText(/categoria este obligatorie/i)).toBeInTheDocument();
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Eroare de validare",
      description: "Te rog corectează erorile din formular",
      variant: "destructive"
    });
  });

  test('should validate description length', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm {...defaultProps} />);
    
    const descriptionField = screen.getByLabelText(/descriere/i);
    
    // Test descriere prea scurtă
    await user.type(descriptionField, 'ab');
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/descrierea trebuie să aibă cel puțin 3 caractere/i)).toBeInTheDocument();
    });
    
    // Test descriere prea lungă
    await user.clear(descriptionField);
    const longText = 'a'.repeat(201);
    await user.type(descriptionField, longText);
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/descrierea nu poate avea mai mult de 200 de caractere/i)).toBeInTheDocument();
    });
  });

  test('should validate amount field', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm {...defaultProps} />);
    
    const amountField = screen.getByLabelText(/suma/i);
    
    // Test sumă invalidă
    await user.type(amountField, 'abc');
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/suma trebuie să fie un număr valid/i)).toBeInTheDocument();
    });
    
    // Test sumă zero
    await user.clear(amountField);
    await user.type(amountField, '0');
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/suma trebuie să fie mai mare decât 0/i)).toBeInTheDocument();
    });
    
    // Test sumă prea mare
    await user.clear(amountField);
    await user.type(amountField, '1000001');
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/suma nu poate fi mai mare de 1.000.000 lei/i)).toBeInTheDocument();
    });
  });

  test('should validate date field', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm {...defaultProps} />);
    
    const dateField = screen.getByLabelText(/data/i);
    
    // Test dată în viitor
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    await user.clear(dateField);
    await user.type(dateField, futureDate.toISOString().split('T')[0]);
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/data nu poate fi în viitor/i)).toBeInTheDocument();
    });
    
    // Test dată prea veche
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 2);
    await user.clear(dateField);
    await user.type(dateField, oldDate.toISOString().split('T')[0]);
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/data nu poate fi mai veche de un an/i)).toBeInTheDocument();
    });
  });

  test('should change categories when transaction type changes', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm {...defaultProps} />);
    
    // Inițial ar trebui să fie "expense" (cheltuială)
    const typeSelect = screen.getByLabelText(/tip/i);
    expect(typeSelect).toHaveValue('expense');
    
    // Schimbă la "income" (venit)
    await user.click(typeSelect);
    await user.click(screen.getByText('Venit'));
    
    // Verifică că categoria s-a resetat și categoriile au fost schimbate
    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);
    
    // Verifică că apar categoriile pentru venituri
    expect(screen.getByText('Salariu')).toBeInTheDocument();
    expect(screen.getByText('Freelance')).toBeInTheDocument();
  });

  test('should submit form with valid data', async () => {
    const user = userEvent.setup();
    mockAddTransaction.mockResolvedValue({});
    
    render(<AddTransactionForm {...defaultProps} />);
    
    // Completează formularul cu date valide
    await user.type(screen.getByLabelText(/descriere/i), 'Cumpărături supermarket');
    await user.type(screen.getByLabelText(/suma/i), '150.50');
    
    // Selectează categoria
    await user.click(screen.getByLabelText(/categoria/i));
    await user.click(screen.getByText('Alimentare'));
    
    // Trimite formularul
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        date: expect.any(String),
        description: 'Cumpărături supermarket',
        amount: 150.50,
        type: 'expense',
        category: 'Alimentare',
        family_group_id: null
      });
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Tranzacție Adăugată!",
      description: "Cheltuială de 150.50 Lei a fost adăugată.",
    });
  });

  test('should handle form submission error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Eroare la salvarea tranzacției';
    mockAddTransaction.mockRejectedValue(new Error(errorMessage));
    
    render(<AddTransactionForm {...defaultProps} />);
    
    // Completează formularul cu date valide
    await user.type(screen.getByLabelText(/descriere/i), 'Test tranzacție');
    await user.type(screen.getByLabelText(/suma/i), '100');
    await user.click(screen.getByLabelText(/categoria/i));
    await user.click(screen.getByText('Alimentare'));
    
    // Trimite formularul
    await user.click(screen.getByRole('button', { name: /adaugă tranzacția/i }));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Eroare la adăugarea tranzacției",
        description: errorMessage,
        variant: "destructive"
      });
    });
  });

  test('should close form and reset fields when onClose is called', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    
    render(<AddTransactionForm isOpen={true} onClose={mockOnClose} />);
    
    // Completează câmpuri
    await user.type(screen.getByLabelText(/descriere/i), 'Test');
    await user.type(screen.getByLabelText(/suma/i), '100');
    
    // Simulează închiderea dialogului
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should show character count for description field', async () => {
    const user = userEvent.setup();
    render(<AddTransactionForm {...defaultProps} />);
    
    const descriptionField = screen.getByLabelText(/descriere/i);
    await user.type(descriptionField, 'Test descriere');
    
    expect(screen.getByText('15/200')).toBeInTheDocument();
  });
});
