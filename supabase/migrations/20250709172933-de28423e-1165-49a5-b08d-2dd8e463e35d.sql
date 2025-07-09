
-- Adăugăm tranzacții pentru luna curentă (iulie 2025)
INSERT INTO transactions (user_id, date, description, amount, type, category) VALUES
-- Venituri iulie 2025
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-01', 'Salariu iulie', 4500.00, 'income', 'Salariu'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-03', 'Freelancing proiect mobile', 950.00, 'income', 'Freelancing'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-05', 'Bonus performanță', 300.00, 'income', 'Bonus'),

-- Cheltuieli alimentare iulie 2025
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-02', 'Kaufland cumpărături săptămânale', 267.80, 'expense', 'Alimentare'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-05', 'Piața de legume și fructe', 78.50, 'expense', 'Alimentare'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-07', 'Lidl produse de curățenie', 89.25, 'expense', 'Alimentare'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-09', 'Mega Image cumpărături', 145.60, 'expense', 'Alimentare'),

-- Transport iulie 2025
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-01', 'Benzină OMV', 195.00, 'expense', 'Transport'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-04', 'Abonament STB luna iulie', 70.00, 'expense', 'Transport'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-08', 'Parcare mall', 15.00, 'expense', 'Transport'),

-- Utilități iulie 2025
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-03', 'Factură electricitate', 178.90, 'expense', 'Utilități'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-06', 'Factură gaz', 95.40, 'expense', 'Utilități'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-08', 'Internet și TV', 89.99, 'expense', 'Utilități'),

-- Divertisment iulie 2025
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-04', 'Cinema 4DX', 65.00, 'expense', 'Divertisment'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-06', 'Restaurantul cu familia', 185.50, 'expense', 'Divertisment'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-09', 'Concerte în parc', 35.00, 'expense', 'Divertisment'),

-- Sănătate iulie 2025
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-02', 'Control medical general', 180.00, 'expense', 'Sănătate'),
('5a58a181-4a77-4ea7-80b2-79702a7d373b', '2025-07-07', 'Medicamente farmacia', 67.80, 'expense', 'Sănătate');
