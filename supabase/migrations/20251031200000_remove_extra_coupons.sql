-- Remove all coupons except FREETRIAL100
DELETE FROM coupons WHERE coupon_code != 'FREETRIAL100';
