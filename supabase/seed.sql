-- Seed: 3 categories, 3 hero burgers, modifier groups. Safe to run once after 0001.
insert into store_settings (id, name, address, phone) values (true, 'The Late Shift', '1200 Midnight Ave', '+15555550142') on conflict do nothing;
insert into categories (name, slug, sort_order) values ('Burgers','burgers',1),('Sides','sides',2),('Drinks','drinks',3);
insert into menu_items (category_id, name, slug, description, price_cents, calories, allergens, dietary_tags, sort_order) values
 ((select id from categories where slug='burgers'),'The Single','the-single','One smashed patty, American cheese, pickles, onion, Late Night sauce on a toasted potato bun.',899,640,'{gluten,dairy,egg}','{}',1),
 ((select id from categories where slug='burgers'),'The Double','the-double','Two smashed patties, double cheese, pickles, grilled onion, Late Night sauce.',1199,920,'{gluten,dairy,egg}','{}',2),
 ((select id from categories where slug='burgers'),'The Burn','the-burn','Smashed patty, pepper jack, jalapeños, smoke mayo, crispy onion.',1099,780,'{gluten,dairy,egg}','{spicy}',3),
 ((select id from categories where slug='sides'),'Shift Fries','shift-fries','Skin-on fries, fried to order, salted hard.',399,420,'{}','{vegetarian,gluten-free}',1),
 ((select id from categories where slug='sides'),'Onion Rings','onion-rings','Beer-battered, thick cut.',499,510,'{gluten}','{vegetarian}',2),
 ((select id from categories where slug='drinks'),'Fountain Soda','fountain-soda','Free refills in the dining room.',299,180,'{}','{vegetarian,gluten-free}',1),
 ((select id from categories where slug='drinks'),'Vanilla Shake','vanilla-shake','Hand-spun, real vanilla bean.',599,610,'{dairy}','{vegetarian,gluten-free}',2);
insert into modifier_groups (name, selection_type, min_select, max_select, is_required) values ('Sauce','single',1,1,true),('Extras','multi',0,3,false);
insert into modifiers (group_id, name, price_delta_cents, sort_order) values
 ((select id from modifier_groups where name='Sauce'),'Late Night Sauce',0,1),
 ((select id from modifier_groups where name='Sauce'),'Smoke Mayo',0,2),
 ((select id from modifier_groups where name='Sauce'),'No Sauce',0,3),
 ((select id from modifier_groups where name='Extras'),'Bacon',200,1),
 ((select id from modifier_groups where name='Extras'),'Extra Patty',300,2),
 ((select id from modifier_groups where name='Extras'),'Jalapeños',75,3);
insert into menu_item_modifier_groups (menu_item_id, modifier_group_id, sort_order)
 select i.id, g.id, case g.name when 'Sauce' then 1 else 2 end from menu_items i, modifier_groups g where i.slug in ('the-single','the-double','the-burn');
-- OWNER USER: create a user in Supabase Auth (dashboard), then run:
--   insert into profiles (id, full_name, role) values ('<auth-user-uuid>', 'Owner', 'owner');
