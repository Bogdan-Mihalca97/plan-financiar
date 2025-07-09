
-- Adăugăm tranzacții plausibile pentru luna curentă
INSERT INTO transactions (user_id, date, description, amount, type, category) VALUES
-- Venituri
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-01', 'Salariu ianuarie', 4500.00, 'income', 'Salariu'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-03', 'Freelancing proiect web', 800.00, 'income', 'Freelancing'),

-- Cheltuieli alimentare
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-02', 'Cumpărături Kaufland', 245.50, 'expense', 'Alimentare'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-05', 'Piața centrală', 67.30, 'expense', 'Alimentare'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-08', 'Mega Image', 123.75, 'expense', 'Alimentare'),

-- Transport
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-03', 'Benzină OMV', 180.00, 'expense', 'Transport'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-06', 'Abonament STB', 70.00, 'expense', 'Transport'),

-- Utilități
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-04', 'Factură curent electric', 156.40, 'expense', 'Utilități'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-07', 'Factură gaz', 89.20, 'expense', 'Utilități'),

-- Divertisment
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-05', 'Cinema Băneasa', 45.00, 'expense', 'Divertisment'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-08', 'Restaurant cu prietenii', 120.00, 'expense', 'Divertisment'),

-- Sănătate
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-01-09', 'Consultație medic', 150.00, 'expense', 'Sănătate');

-- Adăugăm bugete pentru categorii
INSERT INTO budgets (user_id, category, limit_amount, period) VALUES
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Alimentare', 600.00, 'monthly'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Transport', 300.00, 'monthly'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Utilități', 400.00, 'monthly'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Divertisment', 250.00, 'monthly'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Sănătate', 200.00, 'monthly');

-- Adăugăm obiective financiare
INSERT INTO goals (user_id, title, description, target_amount, current_amount, deadline, category, priority) VALUES
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Fond de urgență', 'Economii pentru situații neprevăzute', 15000.00, 8500.00, '2025-12-31', 'Economii', 'high'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Vacanță în Grecia', 'Economii pentru vacanța de vară', 5000.00, 2300.00, '2025-07-01', 'Călătorii', 'medium'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Laptop nou', 'Înlocuirea laptopului vechi', 3500.00, 1200.00, '2025-06-30', 'Tehnologie', 'medium'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Investiții crypto', 'Portofoliu diversificat cripto', 10000.00, 3400.00, '2025-12-31', 'Investiții', 'low');

-- Adăugăm investiții
INSERT INTO investments (user_id, name, type, symbol, purchase_price, current_price, quantity, purchase_date) VALUES
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Apple Inc.', 'Acțiuni', 'AAPL', 150.25, 168.50, 10, '2024-11-15'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Microsoft Corporation', 'Acțiuni', 'MSFT', 380.75, 401.20, 5, '2024-12-01'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Bitcoin', 'Criptomonedă', 'BTC', 45000.00, 48200.00, 0.1, '2024-10-20'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'ETF S&P 500', 'ETF', 'SPY', 420.30, 438.90, 15, '2024-09-10'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', 'Ethereum', 'Criptomonedă', 'ETH', 2800.00, 3150.00, 2, '2024-11-30');
