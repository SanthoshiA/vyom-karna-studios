
// Vyom Karna Studios - public website interactions and live CMS content.

const menuToggle = document.getElementById('menuToggle');
const navigation = document.getElementById('navigation');

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '✕' : '☰';
  });

  document.querySelectorAll('.navigation a').forEach(link =>
    link.addEventListener('click', () => {
      navigation.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    })
  );
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

function setText(id, value) {
  const element = document.getElementById(id);
  if (element && typeof value === 'string' && value.trim()) {
    element.textContent = value;
  }
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function applyTheme(theme = {}) {
  const root = document.documentElement;

  const variables = {
    '--background': theme.background,
    '--surface': theme.surface,
    '--surface-light': theme.surface,
    '--gold': theme.gold,
    '--gold-light': theme.goldLight,
    '--text': theme.text,
    '--muted': theme.muted
  };

  Object.entries(variables).forEach(([name, value]) => {
    if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
      root.style.setProperty(name, value);
    }
  });

  if (typeof theme.font === 'string' && theme.font.length < 100) {
    document.body.style.fontFamily = theme.font;
  }
}


function renderHome(value = {}) {
  setText('siteBrandName', value.brandName || 'VYOM KARNA');
  setText('siteBrandTagline', value.tagline || 'STUDIOS');
  setText('footerBrandName', value.brandName || 'VYOM KARNA');
  setText('footerBrandTagline', value.tagline || 'STUDIOS');
  setText('homeEyebrowText', value.eyebrow);
  setText('homeHeadingText', value.heading);
  setText('homeHeadingAccent', value.headingAccent);
  setText('homeSubtitleText', value.subtitle);
  setText('homeDescriptionText', value.description);
  const logo = document.getElementById('siteLogoImage');
  const logoUrl = safeUrl(value.logoUrl || '');
  if (logo && logoUrl) { logo.src = logoUrl; logo.hidden = false; }
  const hero = document.getElementById('heroArt');
  const heroUrl = safeUrl(value.heroImageUrl || '');
  if (hero && heroUrl) {
    hero.style.backgroundImage = `linear-gradient(rgba(24,37,27,.25), rgba(24,37,27,.55)), url("${heroUrl}")`;
    hero.style.backgroundSize = 'cover'; hero.style.backgroundPosition = 'center';
  }
  [['homePrimaryButton', value.primaryText, value.primaryUrl],
   ['homeSecondaryButton', value.secondaryText, value.secondaryUrl]].forEach(([id, text, href]) => {
    const link = document.getElementById(id);
    if (!link) return;
    if (text) link.textContent = text;
    const safe = href && href.startsWith('#') ? href : safeUrl(href || '');
    if (safe) link.href = safe;
  });
}

function renderServices(items) {
  const grid = document.getElementById('serviceGrid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = '<p class="content-loading">Our services will be announced soon.</p>';
    return;
  }

  grid.replaceChildren(...items.map(item => {
    const card = document.createElement('article');
    card.className = 'service-card';

    const icon = document.createElement('div');
    icon.className = 'service-icon';
    icon.textContent = item.icon || '♫';

    const title = document.createElement('h3');
    title.textContent = item.title || '';

    const description = document.createElement('p');
    description.textContent = item.description || '';

    card.append(icon, title, description);
    return card;
  }));
}

function getYouTubeVideoId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    let id = '';
    if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || '';
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
      else {
        const parts = url.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) id = parts[1] || '';
      }
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
  } catch { return ''; }
}

function renderPortfolio(items) {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = '<div class="portfolio-placeholder"><div class="music-symbol">♫</div><h3>Our Creative Gallery</h3><p>Our latest creations will be showcased here soon.</p></div>';
    return;
  }

  grid.replaceChildren(...items.map(item => {
    const card = document.createElement('article');
    card.className = 'portfolio-card';

    const videoId = getYouTubeVideoId(item.youtube_url || '');
    const generatedThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
    // Prefer the generated YouTube thumbnail so old records with a video URL
    // mistakenly saved as the thumbnail URL still render correctly.
    const thumbnailUrl = generatedThumbnail || safeUrl(item.thumbnail_url || '');
    if (thumbnailUrl) {
      const image = document.createElement('img');
      image.src = thumbnailUrl;
      image.alt = item.title || 'Studio creation';
      image.loading = 'lazy';
      image.onerror = () => { image.remove(); };
      card.appendChild(image);
    }

    const body = document.createElement('div');
    body.className = 'portfolio-card-body';

    const title = document.createElement('h3');
    title.textContent = item.title || '';

    const description = document.createElement('p');
    description.textContent = item.description || '';

    body.append(title, description);

    const videoUrl = safeUrl(item.youtube_url || '');

    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'text-link';
      link.textContent = 'Watch creation →';
      body.appendChild(link);
    }

    card.appendChild(body);
    return card;
  }));
}

function renderAbout(value = {}) {
  setText('aboutEyebrow', value.eyebrow);
  setText('aboutHeading', value.heading);
  setText('aboutDescription', value.description);

  const list = document.getElementById('aboutFeatures');

  if (list && Array.isArray(value.features) && value.features.length) {
    list.replaceChildren(...value.features.map(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      return li;
    }));
  }
}

function renderContact(value = {}) {
  setText('contactMessage', value.message);

  const emailLink = document.getElementById('contactEmailLink');

  if (emailLink && value.email) {
    emailLink.href = `mailto:${value.email}`;
    emailLink.textContent = `Email ${value.email}`;
  }

  const phone = document.getElementById('contactPhoneText');

  if (phone && value.phone) {
    phone.textContent = `Call us: ${value.phone}`;
  }

  const whatsapp = document.getElementById('contactWhatsappLink');
  const waDigits = String(value.whatsapp || '').replace(/\D/g, '');

  if (whatsapp && waDigits) {
    whatsapp.href = `https://wa.me/${waDigits}`;
    whatsapp.hidden = false;
  }

  const social = document.getElementById('socialLinks');

  if (social) {
    social.replaceChildren();

    [['Instagram', value.instagram], ['YouTube', value.youtube], ['Facebook', value.facebook]]
      .forEach(([label, rawUrl]) => {
        const href = safeUrl(rawUrl || '');
        if (!href) return;

        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = label;
        social.appendChild(a);
      });
  }
}

async function loadPublicContent() {
  if (typeof supabaseClient === 'undefined') {
    console.warn('Supabase client not available; showing default website content.');
    return;
  }

  try {
    const [
      settingsResult,
      contentResult,
      servicesResult,
      portfolioResult
    ] = await Promise.all([
      supabaseClient.from('site_settings')
        .select('setting_key,setting_value')
        .eq('is_public', true),

      supabaseClient.from('site_content')
        .select('content_key,content_value')
        .eq('is_published', true),

      supabaseClient.from('site_services')
        .select('title,description,icon,sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),

      supabaseClient.from('site_portfolio')
        .select('title,description,youtube_url,thumbnail_url,sort_order')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
    ]);

    [settingsResult, contentResult, servicesResult, portfolioResult]
      .forEach(result => {
        if (result.error) throw result.error;
      });

    const settings = Object.fromEntries(
      (settingsResult.data || []).map(row => [
        row.setting_key,
        row.setting_value
      ])
    );

    const content = Object.fromEntries(
      (contentResult.data || []).map(row => [
        row.content_key,
        row.content_value
      ])
    );

    if (settings.theme) applyTheme(settings.theme);
    if (content.home) renderHome(content.home);
    if (content.about) renderAbout(content.about);
    if (content.contact) renderContact(content.contact);

    renderServices(servicesResult.data || []);
    renderPortfolio(portfolioResult.data || []);

  } catch (error) {
    console.error(
      'Unable to load published website content from Supabase:',
      error
    );
  }
}

loadPublicContent();

console.log('Vyom Karna Studios website loaded successfully.');
