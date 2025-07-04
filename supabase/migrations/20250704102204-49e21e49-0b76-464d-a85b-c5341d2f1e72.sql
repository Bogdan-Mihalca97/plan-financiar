
-- Add sample transactions for July 2025
INSERT INTO public.transactions (user_id, date, description, amount, type, category) VALUES
-- Income transactions
(auth.uid(), '2025-07-01', 'Salariu luna Iulie 2025', 6000.00, 'income', 'Salariu'),
(auth.uid(), '2025-07-15', 'Proiect freelance - dezvoltare website', 800.00, 'income', 'Freelancing'),
(auth.uid(), '2025-07-10', 'Dividende investiții', 150.00, 'income', 'Investiții'),
(auth.uid(), '2025-07-22', 'Venituri suplimentare - consultanță', 400.00, 'income', 'Altele'),

-- Expense transactions
(auth.uid(), '2025-07-01', 'Chirie apartament Iulie', 1200.00, 'expense', 'Utilități'),
(auth.uid(), '2025-07-05', 'Cumpărături Carrefour', 350.00, 'expense', 'Alimentare'),
(auth.uid(), '2025-07-12', 'Cumpărături Lidl', 280.00, 'expense', 'Alimentare'),
(auth.uid(), '2025-07-20', 'Cumpărături Mega Image', 420.00, 'expense', 'Alimentare'),
(auth.uid(), '2025-07-03', 'Factură electricitate', 180.00, 'expense', 'Utilități'),
(auth.uid(), '2025-07-08', 'Factură gaze naturale', 120.00, 'expense', 'Utilități'),
(auth.uid(), '2025-07-02', 'Internet și TV Digi', 65.00, 'expense', 'Utilități'),
(auth.uid(), '2025-07-14', 'Combustibil auto', 310.00, 'expense', 'Transport'),
(auth.uid(), '2025-07-18', 'Abonament STB', 45.00, 'expense', 'Transport'),
(auth.uid(), '2025-07-16', 'Cină restaurant', 180.00, 'expense', 'Divertisment'),
(auth.uid(), '2025-07-25', 'Bilete cinema', 85.00, 'expense', 'Divertisment'),
(auth.uid(), '2025-07-07', 'Medicamente farmacie', 45.00, 'expense', 'Sănătate'),
(auth.uid(), '2025-07-11', 'Consultație medicală', 200.00, 'expense', 'Sănătate'),
(auth.uid(), '2025-07-30', 'Curs online programare', 150.00, 'expense', 'Altele');
