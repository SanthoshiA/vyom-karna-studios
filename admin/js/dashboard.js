// Vyom Karna Studios - browser-based CMS
// Uses the existing Supabase publishable key and Row Level Security policies.

const $ = (id) => document.getElementById(id);
const messageBox = $('dashboardMessage');
let currentUser = null;
let servicesCache = [];
let portfolioCache = [];

function showMessage(message, type = 'success') {
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
  messageBox.hidden = false;
  window.clearTimeout(showMessage.timer);
  showMessage.timer = window.setTimeout(() => {
    messageBox.textContent = '';
    messageBox.className = 'message';
  }, 6000);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function setBusy(button, busy, busyText = 'Saving...') {
  if (!button) return;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = busyText;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

async function requireAdmin() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) {
    window.location.replace('index.html');
    return false;
  }
  const { data: admin, error: adminError } = await supabaseClient
    .from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (adminError || !admin) {
    await supabaseClient.auth.signOut();
    window.location.replace('index.html');
    return false;
  }
  currentUser = user;
  $('adminEmail').textContent = user.email || 'Administrator';
  $('overviewEmail').textContent = user.email || 'Authenticated administrator';
  $('adminEmailSummary').textContent = user.email || 'Administrator';
  $('currentAdminDetails').textContent = `${user.email || 'Administrator'} (Auth UID: ${user.id})`;
  return true;
}

function activateSection(sectionId) {
  document.querySelectorAll('.nav-item').forEach(button => {
    button.classList.toggle('active', button.dataset.section === sectionId);
  });
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.toggle('active', section.id === sectionId);
  });
  const activeButton = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  $('pageTitle').textContent = activeButton ? activeButton.textContent.replace('◈', '').trim() : 'Admin Dashboard';
  if (sectionId === 'home') loadHome();
  if (sectionId === 'theme') loadTheme();
  if (sectionId === 'about') loadAbout();
  if (sectionId === 'services') loadServices();
  if (sectionId === 'portfolio') loadPortfolio();
  if (sectionId === 'contact') loadContact();
}

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => activateSection(button.dataset.section));
});
$('logoutButton').addEventListener('click', async () => {
  $('logoutButton').disabled = true;
  const { error } = await supabaseClient.auth.signOut();
  if (error) showMessage(error.message, 'error');
  window.location.replace('index.html');
});
$('year').textContent = new Date().getFullYear();


// Home page editor and Supabase Storage image uploads.
let homeContentCache = {};
const HOME_DEFAULTS = {
  brandName: 'VYOM KARNA', tagline: 'STUDIOS', eyebrow: 'MUSIC • MEMORIES • MAGIC',
  heading: 'Every Celebration', headingAccent: 'Has a Story.', subtitle: 'We Give It a Voice.',
  description: 'From personalized wedding songs to cinematic celebrations, we create music and memories that last a lifetime.',
  primaryText: 'Explore Our Creations', primaryUrl: '#portfolio',
  secondaryText: 'Enquire Now', secondaryUrl: '#contact', logoUrl: '', heroImageUrl: ''
};

function setImagePreview(inputId, previewId, url) {
  const input = $(inputId); const preview = $(previewId);
  if (url) { preview.src = url; preview.hidden = false; }
  else { preview.removeAttribute('src'); preview.hidden = true; }
}

async function loadHome() {
  try {
    const row = await getContent('home');
    homeContentCache = { ...HOME_DEFAULTS, ...(row?.content_value || {}) };
    const fields = { homeBrandName: 'brandName', homeTagline: 'tagline', homeEyebrow: 'eyebrow',
      homeHeading: 'heading', homeHeadingAccent: 'headingAccent', homeSubtitle: 'subtitle',
      homeDescription: 'description', homePrimaryText: 'primaryText', homePrimaryUrl: 'primaryUrl',
      homeSecondaryText: 'secondaryText', homeSecondaryUrl: 'secondaryUrl' };
    Object.entries(fields).forEach(([id, key]) => { $(id).value = homeContentCache[key] || ''; });
    setImagePreview('homeLogoFile', 'homeLogoPreview', homeContentCache.logoUrl);
    setImagePreview('homeHeroFile', 'homeHeroPreview', homeContentCache.heroImageUrl);
    $('homeLogoStatus').textContent = homeContentCache.logoUrl ? 'Current logo is saved.' : 'No logo uploaded yet.';
    $('homeHeroStatus').textContent = homeContentCache.heroImageUrl ? 'Current banner is saved.' : 'No banner uploaded yet.';
  } catch (error) { showMessage(`Could not load Home Page: ${error.message}`, 'error'); }
}

async function uploadHomeImage(file, kind) {
  if (!file) return '';
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be 5 MB or smaller.');
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `home/${kind}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabaseClient.storage.from('site-assets').upload(path, file, {
    cacheControl: '3600', upsert: false, contentType: file.type
  });
  if (error) throw error;
  return supabaseClient.storage.from('site-assets').getPublicUrl(path).data.publicUrl;
}

$('homeLogoFile').addEventListener('change', () => {
  const file = $('homeLogoFile').files[0]; if (file) setImagePreview('homeLogoFile', 'homeLogoPreview', URL.createObjectURL(file));
});
$('homeHeroFile').addEventListener('change', () => {
  const file = $('homeHeroFile').files[0]; if (file) setImagePreview('homeHeroFile', 'homeHeroPreview', URL.createObjectURL(file));
});
$('homeForm').addEventListener('submit', async event => {
  event.preventDefault(); const button = event.submitter; setBusy(button, true);
  try {
    const next = {
      brandName: $('homeBrandName').value.trim(), tagline: $('homeTagline').value.trim(),
      eyebrow: $('homeEyebrow').value.trim(), heading: $('homeHeading').value.trim(),
      headingAccent: $('homeHeadingAccent').value.trim(), subtitle: $('homeSubtitle').value.trim(),
      description: $('homeDescription').value.trim(), primaryText: $('homePrimaryText').value.trim(),
      primaryUrl: $('homePrimaryUrl').value.trim(), secondaryText: $('homeSecondaryText').value.trim(),
      secondaryUrl: $('homeSecondaryUrl').value.trim(), logoUrl: homeContentCache.logoUrl || '',
      heroImageUrl: homeContentCache.heroImageUrl || ''
    };
    const logoFile = $('homeLogoFile').files[0]; const heroFile = $('homeHeroFile').files[0];
    if (logoFile) { $('homeLogoStatus').textContent = 'Uploading logo...'; next.logoUrl = await uploadHomeImage(logoFile, 'logo'); }
    if (heroFile) { $('homeHeroStatus').textContent = 'Uploading banner...'; next.heroImageUrl = await uploadHomeImage(heroFile, 'hero'); }
    await saveContent('home', next); homeContentCache = next;
    $('homeLogoFile').value = ''; $('homeHeroFile').value = '';
    setImagePreview('homeLogoFile', 'homeLogoPreview', next.logoUrl);
    setImagePreview('homeHeroFile', 'homeHeroPreview', next.heroImageUrl);
    $('homeLogoStatus').textContent = next.logoUrl ? 'Logo saved.' : 'No logo uploaded.';
    $('homeHeroStatus').textContent = next.heroImageUrl ? 'Banner saved.' : 'No banner uploaded.';
    showMessage('Home Page saved successfully. Refresh the public website to see changes.');
  } catch (error) { showMessage(`Home Page save failed: ${error.message}`, 'error'); }
  finally { setBusy(button, false); }
});

async function loadTheme() {
  const { data, error } = await supabaseClient.from('site_settings')
    .select('setting_value').eq('setting_key', 'theme').maybeSingle();
  if (error) return showMessage(`Could not load theme: ${error.message}`, 'error');
  const v = data?.setting_value || {};
  $('themeBackground').value = v.background || '#130d0c';
  $('themeSurface').value = v.surface || '#211514';
  $('themeGold').value = v.gold || '#d6ad53';
  $('themeGoldLight').value = v.goldLight || '#f1d48c';
  $('themeText').value = v.text || '#f8f1e7';
  $('themeMuted').value = v.muted || '#c2b3a6';
  $('themeFont').value = v.font || 'Segoe UI, Arial, sans-serif';
}
$('themeForm').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter;
  setBusy(button, true);
  const setting_value = {
    background: $('themeBackground').value,
    surface: $('themeSurface').value,
    gold: $('themeGold').value,
    goldLight: $('themeGoldLight').value,
    text: $('themeText').value,
    muted: $('themeMuted').value,
    font: $('themeFont').value
  };
  const { error } = await supabaseClient.from('site_settings').upsert({
    setting_key: 'theme', setting_value, is_public: true, updated_at: new Date().toISOString()
  }, { onConflict: 'setting_key' });
  setBusy(button, false);
  if (error) return showMessage(`Theme save failed: ${error.message}`, 'error');
  showMessage('Theme settings saved. Refresh the public website to see the changes.');
});

async function getContent(key) {
  const { data, error } = await supabaseClient.from('site_content')
    .select('content_value,is_published').eq('content_key', key).maybeSingle();
  if (error) throw error;
  return data;
}
async function saveContent(key, content_value) {
  const { error } = await supabaseClient.from('site_content').upsert({
    content_key: key, content_value, is_published: true, updated_at: new Date().toISOString()
  }, { onConflict: 'content_key' });
  if (error) throw error;
}

async function loadAbout() {
  try {
    const row = await getContent('about');
    const v = row?.content_value || {};
    $('aboutEyebrow').value = v.eyebrow || 'THE ART OF PERSONALIZATION';
    $('aboutHeading').value = v.heading || 'Your Memories. Our Music.';
    $('aboutDescription').value = v.description || '';
    $('aboutFeatures').value = Array.isArray(v.features) ? v.features.join('\n') : '';
  } catch (error) { showMessage(`Could not load About Us: ${error.message}`, 'error'); }
}
$('aboutForm').addEventListener('submit', async event => {
  event.preventDefault(); const button = event.submitter; setBusy(button, true);
  try {
    await saveContent('about', {
      eyebrow: $('aboutEyebrow').value.trim(), heading: $('aboutHeading').value.trim(),
      description: $('aboutDescription').value.trim(),
      features: $('aboutFeatures').value.split('\n').map(x => x.trim()).filter(Boolean)
    });
    showMessage('About Us information saved successfully.');
  } catch (error) { showMessage(`About Us save failed: ${error.message}`, 'error'); }
  finally { setBusy(button, false); }
});

async function loadServices() {
  const tbody = $('servicesTable'); tbody.innerHTML = '<tr><td colspan="5">Loading services...</td></tr>';
  const { data, error } = await supabaseClient.from('site_services')
    .select('id,title,description,icon,sort_order,is_active').order('sort_order', { ascending: true });
  if (error) { tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(error.message)}</td></tr>`; return showMessage(`Could not load services: ${error.message}`, 'error'); }
  servicesCache = data || [];
  $('serviceCount').textContent = servicesCache.filter(x => x.is_active).length;
  if (!servicesCache.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-row">No services yet. Add your first service above.</td></tr>'; return; }
  tbody.innerHTML = servicesCache.map(item => `<tr>
    <td>${escapeHtml(item.icon || '')} <strong>${escapeHtml(item.title)}</strong></td>
    <td><div class="description-cell">${escapeHtml(item.description || '')}</div></td>
    <td>${Number(item.sort_order || 0)}</td><td><span class="status-pill ${item.is_active ? '' : 'off'}">${item.is_active ? 'Active' : 'Hidden'}</span></td>
    <td><button class="action-button" data-edit-service="${item.id}">Edit</button><button class="action-button danger" data-delete-service="${item.id}">Delete</button></td></tr>`).join('');
}
$('servicesTable').addEventListener('click', async event => {
  const editId = event.target.dataset.editService;
  const deleteId = event.target.dataset.deleteService;
  if (editId) {
    const item = servicesCache.find(x => x.id === editId); if (!item) return;
    $('serviceId').value = item.id; $('serviceTitle').value = item.title || '';
    $('serviceDescription').value = item.description || ''; $('serviceIcon').value = item.icon || '';
    $('serviceOrder').value = item.sort_order || 0; $('serviceActive').checked = !!item.is_active;
    $('serviceSaveButton').textContent = 'Save Service'; $('serviceCancelButton').hidden = false;
    $('serviceForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (deleteId && confirm('Delete this service? This cannot be undone.')) {
    const { error } = await supabaseClient.from('site_services').delete().eq('id', deleteId);
    if (error) showMessage(`Delete failed: ${error.message}`, 'error'); else { showMessage('Service deleted.'); await loadServices(); }
  }
});
function resetServiceForm() { $('serviceForm').reset(); $('serviceId').value = ''; $('serviceOrder').value = 0; $('serviceActive').checked = true; $('serviceSaveButton').textContent = 'Add Service'; $('serviceCancelButton').hidden = true; }
$('serviceCancelButton').addEventListener('click', resetServiceForm);
$('refreshServices').addEventListener('click', loadServices);
$('serviceForm').addEventListener('submit', async event => {
  event.preventDefault(); const button = $('serviceSaveButton'); setBusy(button, true);
  const id = $('serviceId').value;
  const record = { title: $('serviceTitle').value.trim(), description: $('serviceDescription').value.trim(), icon: $('serviceIcon').value.trim(), sort_order: Number($('serviceOrder').value || 0), is_active: $('serviceActive').checked, updated_at: new Date().toISOString() };
  const request = id ? supabaseClient.from('site_services').update(record).eq('id', id) : supabaseClient.from('site_services').insert(record);
  const { error } = await request;
  setBusy(button, false);
  if (error) return showMessage(`Service save failed: ${error.message}`, 'error');
  resetServiceForm(); showMessage('Service saved successfully.'); await loadServices();
});

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

function updatePortfolioThumbnailPreview() {
  const value = $('portfolioYoutube').value.trim();
  const preview = $('portfolioThumbnailPreview');
  const status = $('portfolioThumbnailStatus');
  const videoId = getYouTubeVideoId(value);
  if (!value) {
    preview.removeAttribute('src'); preview.hidden = true;
    status.textContent = 'Paste a YouTube link to preview its thumbnail automatically.';
    return;
  }
  if (!videoId) {
    preview.removeAttribute('src'); preview.hidden = true;
    status.textContent = 'Please enter a valid YouTube video link.';
    return;
  }
  preview.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  preview.hidden = false;
  status.textContent = 'Thumbnail generated automatically from your YouTube video.';
}
$('portfolioYoutube').addEventListener('input', updatePortfolioThumbnailPreview);
$('portfolioThumbnailPreview').addEventListener('error', () => {
  $('portfolioThumbnailStatus').textContent = 'YouTube thumbnail could not be loaded. Check that the video link is correct.';
  $('portfolioThumbnailPreview').hidden = true;
});

async function loadPortfolio() {
  const tbody = $('portfolioTable'); tbody.innerHTML = '<tr><td colspan="5">Loading creations...</td></tr>';
  const { data, error } = await supabaseClient.from('site_portfolio')
    .select('id,title,description,youtube_url,thumbnail_url,sort_order,is_published').order('sort_order', { ascending: true });
  if (error) { tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(error.message)}</td></tr>`; return showMessage(`Could not load creations: ${error.message}`, 'error'); }
  portfolioCache = data || [];
  $('portfolioCount').textContent = portfolioCache.filter(x => x.is_published).length;
  if (!portfolioCache.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-row">No creations yet. Add your first creation above.</td></tr>'; return; }
  tbody.innerHTML = portfolioCache.map(item => `<tr><td><strong>${escapeHtml(item.title)}</strong><div class="description-cell">${escapeHtml(item.description || '')}</div></td><td>${item.youtube_url ? `<a href="${escapeHtml(item.youtube_url)}" target="_blank" rel="noopener">Open video</a>` : '—'}</td><td>${Number(item.sort_order || 0)}</td><td><span class="status-pill ${item.is_published ? '' : 'off'}">${item.is_published ? 'Published' : 'Hidden'}</span></td><td><button class="action-button" data-edit-portfolio="${item.id}">Edit</button><button class="action-button danger" data-delete-portfolio="${item.id}">Delete</button></td></tr>`).join('');
}
$('portfolioTable').addEventListener('click', async event => {
  const editId = event.target.dataset.editPortfolio; const deleteId = event.target.dataset.deletePortfolio;
  if (editId) {
    const item = portfolioCache.find(x => x.id === editId); if (!item) return;
    $('portfolioId').value = item.id; $('portfolioTitle').value = item.title || '';
    $('portfolioDescription').value = item.description || ''; $('portfolioYoutube').value = item.youtube_url || '';
    $('portfolioOrder').value = item.sort_order || 0; updatePortfolioThumbnailPreview();
    $('portfolioPublished').checked = !!item.is_published; $('portfolioSaveButton').textContent = 'Save Creation'; $('portfolioCancelButton').hidden = false;
    $('portfolioForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (deleteId && confirm('Delete this creation? This cannot be undone.')) {
    const { error } = await supabaseClient.from('site_portfolio').delete().eq('id', deleteId);
    if (error) showMessage(`Delete failed: ${error.message}`, 'error'); else { showMessage('Creation deleted.'); await loadPortfolio(); }
  }
});
function resetPortfolioForm() { $('portfolioForm').reset(); $('portfolioId').value = ''; $('portfolioOrder').value = 0; $('portfolioPublished').checked = true; $('portfolioSaveButton').textContent = 'Add Creation'; $('portfolioCancelButton').hidden = true; updatePortfolioThumbnailPreview(); }
$('portfolioCancelButton').addEventListener('click', resetPortfolioForm);
$('refreshPortfolio').addEventListener('click', loadPortfolio);
$('portfolioForm').addEventListener('submit', async event => {
  event.preventDefault(); const button = $('portfolioSaveButton'); setBusy(button, true);
  const id = $('portfolioId').value;
  const youtubeUrl = $('portfolioYoutube').value.trim();
  const videoId = youtubeUrl ? getYouTubeVideoId(youtubeUrl) : '';
  if (youtubeUrl && !videoId) {
    setBusy(button, false);
    return showMessage('Please enter a valid YouTube video link (watch, youtu.be, Shorts or live URL).', 'error');
  }
  const record = { title: $('portfolioTitle').value.trim(), description: $('portfolioDescription').value.trim(), youtube_url: youtubeUrl || null, thumbnail_url: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null, sort_order: Number($('portfolioOrder').value || 0), is_published: $('portfolioPublished').checked, updated_at: new Date().toISOString() };
  const request = id ? supabaseClient.from('site_portfolio').update(record).eq('id', id) : supabaseClient.from('site_portfolio').insert(record);
  const { error } = await request; setBusy(button, false);
  if (error) return showMessage(`Creation save failed: ${error.message}`, 'error');
  resetPortfolioForm(); showMessage('Creation saved successfully.'); await loadPortfolio();
});

async function loadContact() {
  try {
    const row = await getContent('contact'); const v = row?.content_value || {};
    $('contactEmail').value = v.email || ''; $('contactPhone').value = v.phone || '';
    $('contactWhatsapp').value = v.whatsapp || ''; $('contactInstagram').value = v.instagram || '';
    $('contactYoutube').value = v.youtube || ''; $('contactFacebook').value = v.facebook || '';
    $('contactMessage').value = v.message || '';
  } catch (error) { showMessage(`Could not load contact details: ${error.message}`, 'error'); }
}
$('contactForm').addEventListener('submit', async event => {
  event.preventDefault(); const button = event.submitter; setBusy(button, true);
  try {
    await saveContent('contact', {
      email: $('contactEmail').value.trim(), phone: $('contactPhone').value.trim(),
      whatsapp: $('contactWhatsapp').value.trim(), instagram: $('contactInstagram').value.trim(),
      youtube: $('contactYoutube').value.trim(), facebook: $('contactFacebook').value.trim(),
      message: $('contactMessage').value.trim()
    });
    showMessage('Contact details saved successfully.');
  } catch (error) { showMessage(`Contact save failed: ${error.message}`, 'error'); }
  finally { setBusy(button, false); }
});

async function initDashboard() {
  try {
    if (!await requireAdmin()) return;
    $('year').textContent = new Date().getFullYear();
    await Promise.all([loadServices(), loadPortfolio()]);
  } catch (error) {
    console.error('Dashboard initialization failed:', error);
    showMessage(`Dashboard could not be initialized: ${error.message}`, 'error');
  }
}
initDashboard();
