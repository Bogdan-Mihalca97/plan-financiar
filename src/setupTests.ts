
import '@testing-library/jest-dom';

// Extend the global object with Jest types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveValue(value: any): R;
      toHaveDisplayValue(value: string | string[]): R;
      toBeDisabled(): R;
    }
  }
}

// Mock pentru useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock pentru contextele aplicației
jest.mock('@/contexts/TransactionsContext', () => ({
  useTransactions: () => ({
    addTransaction: jest.fn(),
  }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

jest.mock('@/contexts/FamilyContext', () => ({
  useFamily: () => ({
    currentFamily: null,
  }),
}));
