import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useToast } from '@/hooks/use-toast';

// Mock the contexts and hooks
vi.mock('@/contexts/TransactionsContext');
vi.mock('@/hooks/use-toast');

describe('AddTransactionForm Component', () => {
  const mockAddTransaction = vi.fn();
  const mockUseTransactions = {
    addTransaction: mockAddTransaction,
  };
  const mockToast = {
    toast: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTransactions as any).mockReturnValue(mockUseTransactions);
    (useToast as any).mockReturnValue(mockToast);
  });

  it('renders the form elements', () => {
    render(<AddTransactionForm isOpen={true} onClose={() => {}} />);
    expect(screen.getByLabelText('Tip')).toBeInTheDocument();
    expect(screen.getByLabelText('Suma')).toBeInTheDocument();
    expect(screen.getByLabelText('Data')).toBeInTheDocument();
    expect(screen.getByLabelText('Categorie')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adaugă Tranzacție' })).toBeInTheDocument();
  });

  it('calls addTransaction with correct values when form is submitted', async () => {
    render(<AddTransactionForm isOpen={true} onClose={() => {}} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Tip'), { target: { value: 'income' } });
    fireEvent.change(screen.getByLabelText('Suma'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Descriere'), { target: { value: 'Test transaction' } });
    fireEvent.change(screen.getByLabelText('Categorie'), { target: { value: 'salary' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Adaugă Tranzacție' }));

    // Check if addTransaction was called with the correct values
    expect(mockAddTransaction).toHaveBeenCalledWith({
      type: 'income',
      amount: 100,
      date: '2024-01-01',
      description: 'Test transaction',
      category: 'salary',
      family_group_id: null,
      user_id: undefined,
    });
  });

  it('displays an error message if amount is not a number', async () => {
    render(<AddTransactionForm isOpen={true} onClose={() => {}} />);

    // Fill in the form with an invalid amount
    fireEvent.change(screen.getByLabelText('Tip'), { target: { value: 'income' } });
    fireEvent.change(screen.getByLabelText('Suma'), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Descriere'), { target: { value: 'Test transaction' } });
    fireEvent.change(screen.getByLabelText('Categorie'), { target: { value: 'salary' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Adaugă Tranzacție' }));

    // Check if toast was called with the correct error message
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Eroare',
      description: 'Suma trebuie să fie un număr valid',
      variant: 'destructive',
    });
  });

  it('displays an error message if amount is zero', async () => {
    render(<AddTransactionForm isOpen={true} onClose={() => {}} />);

    // Fill in the form with an invalid amount
    fireEvent.change(screen.getByLabelText('Tip'), { target: { value: 'income' } });
    fireEvent.change(screen.getByLabelText('Suma'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Descriere'), { target: { value: 'Test transaction' } });
    fireEvent.change(screen.getByLabelText('Categorie'), { target: { value: 'salary' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Adaugă Tranzacție' }));

    // Check if toast was called with the correct error message
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Eroare',
      description: 'Suma trebuie să fie mai mare decât zero',
      variant: 'destructive',
    });
  });
});
