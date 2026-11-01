-- RUN ONCE. Converts the USD-sized prices to pesos (about 55 PHP per USD, rounded to the nearest 5 pesos).
-- Example: $8.99 becomes P495. Running it twice would multiply prices again.
update menu_items set price_cents = (round(price_cents / 100.0 * 55 / 5) * 5 * 100)::int;
update modifiers set price_delta_cents = (round(price_delta_cents / 100.0 * 55 / 5) * 5 * 100)::int where price_delta_cents > 0;
-- Philippine time for open/closed hours, delivery fee P150, delivery minimum P500 (change as you like)
update store_settings set timezone = 'Asia/Manila', delivery_fee_cents = 15000, delivery_minimum_cents = 50000;
-- Optional, if you charge 12% VAT on top of prices:
-- update store_settings set tax_rate_bps = 1200;
