-- Adds 7 new categories and 60 new items. Run AFTER 0001_schema.sql and seed.sql. Safe to re-run (skips existing slugs).
insert into categories (name, slug, sort_order) values
 ('Chicken','chicken',2),('Pasta','pasta',3),('Pizza','pizza',4),('Wings','wings',5),
 ('Sandwiches','sandwiches',6),('Salads','salads',7),('Desserts','desserts',9)
on conflict (slug) do nothing;
update categories set sort_order = 1 where slug = 'burgers';
update categories set sort_order = 8 where slug = 'sides';
update categories set sort_order = 10 where slug = 'drinks';

insert into menu_items (category_id, name, slug, description, price_cents, calories, allergens, dietary_tags, sort_order)
select c.id, v.name, v.slug, v.descr, v.price, v.cal, v.allergens::text[], v.tags::text[], 50
from (values
 -- Burgers
 ('burgers','Bacon Smash','bacon-smash','Smashed patty, thick-cut bacon, cheddar, pickles, Late Night sauce.',1099,810,'{gluten,dairy,egg}','{}'),
 ('burgers','Mushroom Swiss','mushroom-swiss','Smashed patty, sauteed mushrooms, Swiss cheese, garlic mayo.',1049,740,'{gluten,dairy,egg}','{}'),
 ('burgers','BBQ Smash','bbq-smash','Smashed patty, smoky BBQ sauce, crispy onion, cheddar.',1049,790,'{gluten,dairy,egg}','{}'),
 ('burgers','Veggie Smash','veggie-smash','Crispy veggie patty, lettuce, tomato, American cheese, Late Night sauce.',999,620,'{gluten,dairy,egg,soy}','{vegetarian}'),
 -- Chicken
 ('chicken','Crispy Chicken Sandwich','crispy-chicken-sandwich','Buttermilk fried chicken, pickles, mayo, toasted potato bun.',1049,760,'{gluten,dairy,egg}','{}'),
 ('chicken','Spicy Chicken Sandwich','spicy-chicken-sandwich','Hot-brined fried chicken, spicy slaw, pickles, ranch.',1099,810,'{gluten,dairy,egg}','{spicy}'),
 ('chicken','Chicken Tenders 3pc','chicken-tenders-3','Three hand-breaded tenders with your choice of dip.',899,520,'{gluten,egg}','{}'),
 ('chicken','Chicken Tenders 5pc','chicken-tenders-5','Five hand-breaded tenders with your choice of dip.',1299,860,'{gluten,egg}','{}'),
 ('chicken','Nashville Hot Chicken','nashville-hot-chicken','Fried chicken tossed in hot oil, white bread, pickles.',1249,880,'{gluten,egg}','{spicy}'),
 ('chicken','Chicken Nuggets 10pc','chicken-nuggets-10','Ten golden nuggets, crunchy outside, juicy inside.',999,640,'{gluten,egg}','{}'),
 -- Pasta
 ('pasta','Spaghetti Bolognese','spaghetti-bolognese','Slow-simmered beef ragu over spaghetti, parmesan.',1399,820,'{gluten,dairy,egg}','{}'),
 ('pasta','Fettuccine Alfredo','fettuccine-alfredo','Creamy parmesan sauce, black pepper, fresh fettuccine.',1349,910,'{gluten,dairy,egg}','{vegetarian}'),
 ('pasta','Penne Arrabbiata','penne-arrabbiata','Garlic, chili, and crushed tomato over penne.',1249,640,'{gluten}','{vegetarian,spicy}'),
 ('pasta','Mac and Cheese','mac-and-cheese','Three-cheese sauce, cavatappi, toasted breadcrumbs.',1149,880,'{gluten,dairy}','{vegetarian}'),
 ('pasta','Chicken Carbonara','chicken-carbonara','Grilled chicken, bacon, egg yolk sauce, parmesan, spaghetti.',1449,940,'{gluten,dairy,egg}','{}'),
 ('pasta','Baked Ziti','baked-ziti','Ziti, marinara, ricotta, and mozzarella baked bubbly.',1299,860,'{gluten,dairy}','{vegetarian}'),
 ('pasta','Pesto Penne','pesto-penne','Basil pesto, cherry tomatoes, pine nuts, parmesan.',1299,780,'{gluten,dairy,nuts}','{vegetarian}'),
 ('pasta','Garlic Shrimp Linguine','garlic-shrimp-linguine','Garlic butter shrimp, lemon, chili flakes, linguine.',1599,830,'{gluten,dairy,shellfish}','{}'),
 -- Pizza
 ('pizza','Margherita Pizza','margherita-pizza','Tomato, fresh mozzarella, basil. 12 inch.',1299,980,'{gluten,dairy}','{vegetarian}'),
 ('pizza','Pepperoni Pizza','pepperoni-pizza','Classic pepperoni and mozzarella. 12 inch.',1399,1100,'{gluten,dairy}','{}'),
 ('pizza','Four Cheese Pizza','four-cheese-pizza','Mozzarella, cheddar, parmesan, and provolone. 12 inch.',1449,1120,'{gluten,dairy}','{vegetarian}'),
 ('pizza','BBQ Chicken Pizza','bbq-chicken-pizza','BBQ sauce, grilled chicken, red onion, cilantro. 12 inch.',1499,1060,'{gluten,dairy}','{}'),
 ('pizza','Hawaiian Pizza','hawaiian-pizza','Ham, pineapple, mozzarella. 12 inch.',1399,1040,'{gluten,dairy}','{}'),
 ('pizza','Veggie Supreme Pizza','veggie-supreme-pizza','Peppers, mushrooms, olives, onion, tomato. 12 inch.',1399,950,'{gluten,dairy}','{vegetarian}'),
 ('pizza','Meat Lovers Pizza','meat-lovers-pizza','Pepperoni, sausage, bacon, and ham. 12 inch.',1599,1280,'{gluten,dairy}','{}'),
 -- Wings
 ('wings','Buffalo Wings','buffalo-wings','Eight wings tossed in classic buffalo sauce, with ranch.',1199,720,'{dairy}','{spicy,gluten-free}'),
 ('wings','Honey Garlic Wings','honey-garlic-wings','Eight wings glazed in sweet honey garlic.',1199,760,'{dairy,soy}','{}'),
 ('wings','Smoky BBQ Wings','smoky-bbq-wings','Eight wings in slow-smoked BBQ sauce.',1199,750,'{dairy}','{gluten-free}'),
 ('wings','Lemon Pepper Wings','lemon-pepper-wings','Eight crispy wings, zesty lemon pepper dry rub.',1199,700,'{}','{gluten-free}'),
 ('wings','Boneless Wings','boneless-wings','Crispy boneless bites in your choice of sauce.',1099,680,'{gluten,egg}','{}'),
 -- Sandwiches
 ('sandwiches','Philly Cheesesteak','philly-cheesesteak','Shaved ribeye, peppers, onions, white American on a hoagie roll.',1349,880,'{gluten,dairy}','{}'),
 ('sandwiches','Grilled Cheese','grilled-cheese','Cheddar and American on buttery griddled sourdough.',899,640,'{gluten,dairy}','{vegetarian}'),
 ('sandwiches','Club Sandwich','club-sandwich','Turkey, bacon, lettuce, tomato, mayo on toasted white bread.',1249,780,'{gluten,egg}','{}'),
 ('sandwiches','Chicken Caesar Wrap','chicken-caesar-wrap','Grilled chicken, romaine, parmesan, Caesar dressing.',1149,690,'{gluten,dairy,egg,fish}','{}'),
 ('sandwiches','Falafel Wrap','falafel-wrap','Crispy falafel, cucumber, tomato, tahini, pickled onion.',1099,640,'{gluten,sesame}','{vegetarian}'),
 ('sandwiches','Late Night Dog','late-night-dog','All-beef hot dog, griddled bun, mustard, onions, relish.',799,520,'{gluten,mustard}','{}'),
 ('sandwiches','Fish Sandwich','fish-sandwich','Crispy battered fish, tartar sauce, lettuce, toasted bun.',1149,730,'{gluten,egg,fish}','{}'),
 -- Salads
 ('salads','Caesar Salad','caesar-salad','Romaine, parmesan, croutons, creamy Caesar dressing.',999,420,'{gluten,dairy,egg,fish}','{}'),
 ('salads','Garden Salad','garden-salad','Mixed greens, tomato, cucumber, carrot, house vinaigrette.',849,180,'{}','{vegetarian,gluten-free}'),
 ('salads','Greek Salad','greek-salad','Cucumber, tomato, olives, red onion, feta, oregano.',1049,310,'{dairy}','{vegetarian,gluten-free}'),
 ('salads','Cobb Salad','cobb-salad','Grilled chicken, bacon, egg, avocado, blue cheese.',1299,560,'{dairy,egg}','{gluten-free}'),
 -- Sides
 ('sides','Cheese Fries','cheese-fries','Shift Fries smothered in warm cheddar sauce.',599,610,'{dairy}','{vegetarian,gluten-free}'),
 ('sides','Loaded Fries','loaded-fries','Fries, cheddar sauce, bacon, scallions, sour cream.',799,780,'{dairy}','{gluten-free}'),
 ('sides','Sweet Potato Fries','sweet-potato-fries','Crispy sweet potato fries with maple mayo.',549,460,'{egg}','{vegetarian,gluten-free}'),
 ('sides','Mozzarella Sticks','mozzarella-sticks','Six golden sticks with marinara.',699,560,'{gluten,dairy,egg}','{vegetarian}'),
 ('sides','Coleslaw','coleslaw','Creamy, crunchy, and tangy.',349,180,'{egg}','{vegetarian,gluten-free}'),
 ('sides','Garlic Bread','garlic-bread','Toasted garlic butter bread with parmesan.',449,340,'{gluten,dairy}','{vegetarian}'),
 -- Desserts
 ('desserts','Chocolate Brownie','chocolate-brownie','Fudgy brownie with a molten center.',599,480,'{gluten,dairy,egg}','{vegetarian}'),
 ('desserts','Apple Pie','apple-pie','Crispy fried apple pie with cinnamon sugar.',449,330,'{gluten}','{vegetarian}'),
 ('desserts','Cheesecake Slice','cheesecake-slice','Creamy New York style with a graham crust.',699,520,'{gluten,dairy,egg}','{vegetarian}'),
 ('desserts','Soft Serve Cup','soft-serve-cup','Vanilla soft serve, swirled to order.',399,260,'{dairy}','{vegetarian,gluten-free}'),
 ('desserts','Churros','churros','Cinnamon sugar churros with chocolate dip.',599,420,'{gluten,dairy,egg}','{vegetarian}'),
 ('desserts','Cookie Skillet','cookie-skillet','Warm chocolate chip cookie with soft serve on top.',799,720,'{gluten,dairy,egg}','{vegetarian}'),
 -- Drinks
 ('drinks','Chocolate Shake','chocolate-shake','Hand-spun with real chocolate, thick and cold.',599,650,'{dairy}','{vegetarian,gluten-free}'),
 ('drinks','Strawberry Shake','strawberry-shake','Hand-spun with real strawberries.',599,610,'{dairy}','{vegetarian,gluten-free}'),
 ('drinks','Fresh Lemonade','fresh-lemonade','Squeezed lemons, a little sugar, lots of ice.',349,150,'{}','{vegetarian,gluten-free}'),
 ('drinks','Iced Tea','iced-tea','Fresh-brewed black tea, sweet or unsweetened.',299,60,'{}','{vegetarian,gluten-free}'),
 ('drinks','Cold Brew Coffee','cold-brew-coffee','Smooth 18-hour cold brew over ice.',449,10,'{}','{vegetarian,gluten-free}'),
 ('drinks','Root Beer Float','root-beer-float','Root beer topped with vanilla soft serve.',549,380,'{dairy}','{vegetarian,gluten-free}'),
 ('drinks','Bottled Water','bottled-water','Cold spring water.',199,0,'{}','{vegetarian,gluten-free}')
) as v(cat, name, slug, descr, price, cal, allergens, tags)
join categories c on c.slug = v.cat
on conflict (slug) do nothing;

-- Burgers and chicken sandwiches get the same Sauce and Extras options as the originals
insert into menu_item_modifier_groups (menu_item_id, modifier_group_id, sort_order)
select i.id, g.id, case g.name when 'Sauce' then 1 else 2 end
from menu_items i, modifier_groups g
where i.slug in ('bacon-smash','mushroom-swiss','bbq-smash','veggie-smash','crispy-chicken-sandwich','spicy-chicken-sandwich')
  and g.name in ('Sauce','Extras')
on conflict do nothing;
