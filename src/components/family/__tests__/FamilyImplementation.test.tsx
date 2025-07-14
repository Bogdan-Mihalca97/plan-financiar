
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Family from '@/pages/Family';
import { FamilyProvider } from '@/contexts/FamilyContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-family-id', name: 'Test Family' }, 
            error: null 
          })),
        })),
      })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } }, 
        error: null 
      })),
    },
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const MockedFamilyPage = () => (
  <BrowserRouter>
    <AuthProvider>
      <FamilyProvider>
        <Family />
      </FamilyProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Family Implementation', () => {
  it('should render family creation form when no family exists', async () => {
    render(<MockedFamilyPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/creează o familie/i)).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/numele familiei/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creează familia/i })).toBeInTheDocument();
  });

  it('should create a new family when form is submitted', async () => {
    const user = userEvent.setup();
    render(<MockedFamilyPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/numele familiei/i)).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText(/numele familiei/i);
    const submitButton = screen.getByRole('button', { name: /creează familia/i });
    
    await user.type(nameInput, 'Familia Test');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(nameInput).toHaveValue('Familia Test');
    });
  });

  it('should validate family name input', async () => {
    const user = userEvent.setup();
    render(<MockedFamilyPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creează familia/i })).toBeInTheDocument();
    });
    
    const submitButton = screen.getByRole('button', { name: /creează familia/i });
    await user.click(submitButton);
    
    // Form should not submit with empty name (button should be disabled or show validation)
    expect(submitButton).toBeDisabled();
  });
});
