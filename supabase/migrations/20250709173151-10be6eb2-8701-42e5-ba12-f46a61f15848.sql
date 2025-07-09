
-- Schimbăm categoria "Alimentare" cu "Cumpărături" în tranzacții
UPDATE transactions 
SET category = 'Cumpărături' 
WHERE category = 'Alimentare';

-- Schimbăm categoria "Alimentare" cu "Cumpărături" în bugete
UPDATE budgets 
SET category = 'Cumpărături' 
WHERE category = 'Alimentare';
