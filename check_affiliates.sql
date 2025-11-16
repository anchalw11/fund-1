
-- Quick check: How many affiliate codes exist now?
SELECT COUNT(*) as total_affiliates, COUNT(DISTINCT referral_code) as unique_codes 
FROM affiliates 
WHERE referral_code IS NOT NULL AND referral_code != '';

