insert into public.site_settings (setting_key, setting_value, is_public)
values (
  'theme',
  '{"background":"#130d0c","surface":"#211514","gold":"#d6ad53","goldLight":"#f1d48c","text":"#f8f1e7","muted":"#c2b3a6","font":"Segoe UI, Arial, sans-serif"}'::jsonb,
  true
)
on conflict (setting_key) do nothing;

insert into public.site_content (content_key, content_value, is_published)
values
(
  'about',
  '{"eyebrow":"THE ART OF PERSONALIZATION","heading":"Your Memories. Our Music.","description":"At Vyom Karna Studios, we believe every person and every celebration has a unique story. We transform those stories into memorable musical creations.","features":["Custom Lyrics & Songwriting","Original Music Composition","Professional Studio Recording","Music Video Production","Cinematic Editing & Delivery"]}'::jsonb,
  true
),
(
  'contact',
  '{"email":"contact@vyomkarnastudios.com","message":"Have a wedding, birthday or special event coming up? Let us create something unforgettable together."}'::jsonb,
  true
)
on conflict (content_key) do nothing;

insert into public.site_services (title, description, icon, sort_order, is_active)
select seed.title, seed.description, seed.icon, seed.sort_order, true
from (values
  ('Wedding Songs', 'Personalized songs celebrating your love story.', '💍', 1),
  ('Pre-Wedding Songs', 'Beautiful musical memories before your big day.', '🎬', 2),
  ('Reception Songs', 'Special music for unforgettable celebrations.', '🥂', 3),
  ('Birthday Songs', 'Unique songs created for your loved ones.', '🎂', 4),
  ('Devotional Songs', 'Devotional music composed with feeling.', '🪔', 5),
  ('Love Songs', 'Turn your feelings into beautiful melodies.', '❤️', 6),
  ('Family & Event Songs', 'Celebrate family bonds and special occasions.', '👨‍👩‍👧‍👦', 7)
) as seed(title, description, icon, sort_order)
where not exists (
  select 1 from public.site_services existing where existing.title = seed.title
);
