-- Met à jour les prix des abonnements dans la table subscription_plans pour correspondre à l'interface web (0, 2400, 4900)

UPDATE subscription_plans 
SET monthly_price = 0, name = 'Découverte'
WHERE id = 'trial' OR name ILIKE '%essai%';

UPDATE subscription_plans 
SET monthly_price = 2400, name = 'Standard'
WHERE id = 'standard' OR name ILIKE '%standard%';

UPDATE subscription_plans 
SET monthly_price = 4900, name = 'Pro'
WHERE id = 'pro' OR name ILIKE '%pro%';

-- Si les plans n'existent pas encore avec ces IDs dans la DB, vous pouvez les insérer :
-- INSERT INTO subscription_plans (id, name, monthly_price, active) VALUES 
-- ('trial', 'Découverte', 0, true),
-- ('standard', 'Standard', 2400, true),
-- ('pro', 'Pro', 4900, true);
