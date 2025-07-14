import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AddTransactionForm from '../AddTransactionForm';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { FamilyProvider } from '@/contexts/FamilyContext';

// Mock the useAuth hook
vi.mock('@/contexts/AuthContext', () => {
  const mockAuthContext = {
    isAuthenticated: true,
    user: { id: 'test-user-id', email: 'test@example.com' },
    userProfile: { first_name: 'Test', last_name: 'User' },
    loading: false,
  };
  return {
    useAuth: () => mockAuthContext,
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

// Mock the useFamily hook
vi.mock('@/contexts/FamilyContext', () => {
  const mockFamilyContext = {
    currentFamily: null,
    familyMembers: [],
    familyInvitations: [],
    pendingInvitations: [],
    isCreator: false,
    createFamily: vi.fn(),
    inviteMember: vi.fn(),
    acceptInvitation: vi.fn(),
    declineInvitation: vi.fn(),
    removeMember: vi.fn(),
    leaveFamily: vi.fn(),
    loading: false,
    refreshFamily: vi.fn(),
  };
  return {
    useFamily: () => mockFamilyContext,
    FamilyProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

// Mock the useTransactions hook
vi.mock('@/contexts/TransactionsContext', () => {
  const mockTransactionsContext = {
    transactions: [],
    familyTransactions: [],
    allTransactions: [],
    loading: false,
    refreshTransactions: vi.fn(),
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    getTotalIncome: vi.fn(),
    getTotalExpenses: vi.fn(),
    getBalance: vi.fn(),
    getMonthlyIncome: vi.fn(),
    getMonthlyExpenses: vi.fn(),
    getMonthlyBalance: vi.fn(),
    getTransactionsByCategory: vi.fn(),
  };
  return {
    useTransactions: () => mockTransactionsContext,
    TransactionsProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

describe('AddTransactionForm Integration', () => {
  it('should render the form and submit a transaction', async () => {
    const addTransactionMock = vi.fn();
    vi.mock('@/contexts/TransactionsContext', () => ({
      useTransactions: () => ({
        transactions: [],
        familyTransactions: [],
        allTransactions: [],
        loading: false,
        refreshTransactions: vi.fn(),
        addTransaction: addTransactionMock,
        updateTransaction: vi.fn(),
        deleteTransaction: vi.fn(),
        getTotalIncome: vi.fn(),
        getTotalExpenses: vi.fn(),
        getBalance: vi.fn(),
        getMonthlyIncome: vi.fn(),
        getMonthlyExpenses: vi.fn(),
        getMonthlyBalance: vi.fn(),
        getTransactionsByCategory: vi.fn(),
      }),
      TransactionsProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
      ),
    }));

    render(
      <AuthProvider>
        <FamilyProvider>
          <TransactionsProvider>
            <AddTransactionForm />
          </TransactionsProvider>
        </FamilyProvider>
      </AuthProvider>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Descriere'), { target: { value: 'Test Transaction' } });
    fireEvent.change(screen.getByLabelText('Sumă'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Dată'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Categorie'), { target: { value: 'Food' } });

    // Select the type
    fireEvent.click(screen.getByText('Cheltuială'));

    // Submit the form
    fireEvent.click(screen.getByText('Adaugă Tranzacție'));

    // Wait for the transaction to be added
    await waitFor(() => {
      expect(addTransactionMock).toHaveBeenCalled();
    });

    expect(addTransactionMock).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Test Transaction',
      amount: 100,
      date: '2024-01-01',
      category: 'Food',
      type: 'expense',
    }));
  });
});
