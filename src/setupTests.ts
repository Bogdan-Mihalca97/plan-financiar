
import '@testing-library/jest-dom';

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
