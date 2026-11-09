VYOM KARNA STUDIOS - CMS UPDATE

WHAT IS INCLUDED
- index.html: public website homepage connected to published Supabase content.
- js/script.js: public website interactions and Supabase content loader.
- css/style.css: existing public design plus CMS content styles.
- admin/index.html: administrator login page.
- admin/dashboard.html: content management dashboard.
- admin/js/config.js: existing Supabase URL and publishable key.
- admin/js/auth.js: existing login and administrator allow-list verification.
- admin/js/dashboard.js: CMS editor and Supabase CRUD logic.
- admin/css/admin.css and admin/css/dashboard.css: existing styling plus editor styles.
- database/seed_initial_content.sql: optional initial content (does not overwrite existing rows).

INSTALLATION
1. Make a backup or commit your current project before replacing files.
2. Copy the contents of this package into the root of your VyomKarnaStudios project, preserving folders.
3. The root index.html is now the PUBLIC website. Admin login is at /admin/index.html.
4. Keep the Supabase project URL and publishable/anon key in admin/js/config.js. Never put a service_role/secret key in browser code.
5. In Supabase SQL Editor, optionally run database/seed_initial_content.sql once to insert starter About, Contact, Theme and Services content. Existing rows are preserved.
6. Ensure the existing RLS policies are enabled as in your current project. Public SELECT must remain limited to published content / active services / public settings. Authenticated write policies must use private.is_admin().
7. Start Live Server from the project root and open http://127.0.0.1:5500/ for the public site or http://127.0.0.1:5500/admin/index.html for admin login.

ADMIN ACCESS
The admin dashboard verifies the current Supabase Auth user against public.admin_users. The browser CMS does not create or delete administrators. Add/remove administrator Auth UIDs through a controlled Supabase SQL Editor process, not by exposing a service-role key in JavaScript.

NOTES
- Theme settings currently control the core site colour variables and body font. Existing decorative gradients and image assets may still have fixed styling.
- Portfolio thumbnails must be publicly accessible HTTPS image URLs. YouTube URLs open in a new tab.
- After saving CMS content, reload the public page to fetch the latest data.
