
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
  if (hero) {
    if (heroUrl) {
      hero.classList.add('has-custom-image');
      hero.style.backgroundImage = `linear-gradient(rgba(24,37,27,.08), rgba(24,37,27,.18)), url("${heroUrl}")`;
      hero.style.backgroundSize = 'contain';
      hero.style.backgroundRepeat = 'no-repeat';
      hero.style.backgroundPosition = 'center';
    } else {
      hero.classList.remove('has-custom-image');
      hero.style.backgroundImage = '';
      hero.style.backgroundSize = '';
      hero.style.backgroundRepeat = '';
      hero.style.backgroundPosition = '';
    }
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
  const emailAddress = document.getElementById('contactEmailAddress');
  if (emailLink && value.email) {
    emailLink.href = `mailto:${value.email}`;
    if (emailAddress) emailAddress.textContent = value.email;
  }

  const phone = document.getElementById('contactPhoneText');
  if (phone && value.phone) {
    phone.textContent = `Call us: ${value.phone}`;
  }

  const whatsapp = document.getElementById('contactWhatsappLink');
  const waDigits = String(value.whatsapp || '').replace(/\D/g, '');
  if (whatsapp) {
    if (waDigits) {
      whatsapp.href = `https://wa.me/${waDigits}`;
      whatsapp.hidden = false;
    } else {
      whatsapp.hidden = true;
      whatsapp.removeAttribute('href');
    }
  }

  const social = document.getElementById('socialLinks');
  if (!social) return;

  social.replaceChildren();

  const svgNS = 'http://www.w3.org/2000/svg';
  const icons = {
    Instagram: {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M7 2.8h10A4.2 4.2 0 0 1 21.2 7v10a4.2 4.2 0 0 1-4.2 4.2H7A4.2 4.2 0 0 1 2.8 17V7A4.2 4.2 0 0 1 7 2.8Z', fill: 'none' },
        { d: 'M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z', fill: 'none' },
        { d: 'M17.6 6.4h.01', fill: 'none' }
      ]
    },
    YouTube: {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M23 7.1a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.5A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12a31 31 0 0 0-.5-4.9Z', fill: 'none' },
        { d: 'm9.7 8.5 6.2 3.5-6.2 3.5Z', fill: 'currentColor', stroke: 'none' }
      ]
    },
    Facebook: {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M13.5 21v-8h2.8l.4-3.1h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8Z', fill: 'currentColor', stroke: 'none' }
      ]
    }
  };

  [['Instagram', value.instagram], ['YouTube', value.youtube], ['Facebook', value.facebook]]
    .forEach(([label, rawUrl]) => {
      const href = safeUrl(rawUrl || '');
      if (!href) return;

      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'contact-item social-contact-item';
      a.setAttribute('aria-label', `${label} - opens in a new tab`);

      const iconWrap = document.createElement('span');
      iconWrap.className = `contact-icon social-brand-icon ${label.toLowerCase()}-icon`;
      iconWrap.setAttribute('aria-hidden', 'true');

      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', icons[label].viewBox);
      svg.setAttribute('role', 'img');
      svg.setAttribute('focusable', 'false');

      icons[label].paths.forEach(spec => {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', spec.d);
        path.setAttribute('fill', spec.fill);
        if (spec.fill === 'none') {
          path.setAttribute('stroke', 'currentColor');
          path.setAttribute('stroke-width', '1.8');
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('stroke-linejoin', 'round');
        }
        svg.appendChild(path);
      });
      iconWrap.appendChild(svg);

      const copy = document.createElement('span');
      copy.className = 'contact-item-copy';

      const labelNode = document.createElement('span');
      labelNode.className = 'contact-label';
      labelNode.textContent = label.toUpperCase();

      const arrow = document.createElement('span');
      arrow.className = 'contact-arrow';
      arrow.textContent = '→';

      copy.append(labelNode, arrow);
      a.append(iconWrap, copy);
      social.appendChild(a);
    });
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
