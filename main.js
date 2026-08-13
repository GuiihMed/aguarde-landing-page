/**
 * WDCOM & Eventos - Dynamic Landing Page Engine
 * Home & WDCOM base routes (/ and /wdcom): Displays official clean white/cyan WDCOM logo on wallpaper.
 * Internal Event Pages (/sonafe-df, /slug-do-evento): Displays event logo & AGUARDE status badge, hides controls bar.
 * Reads both built-in events.json and custom owner-created events from localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {

  const wallpaperWrapper = document.getElementById('wallpaper-wrapper');
  const wallpaperLogo = document.getElementById('wallpaper-logo');
  const wallpaperStatus = document.getElementById('wallpaper-status');
  const statusText = document.getElementById('status-text');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const pulseBtn = document.getElementById('pulse-btn');
  const swatches = document.querySelectorAll('.swatch[data-palette]');
  const controlsBar = document.getElementById('controls-bar');

  // Social Share Meta Tag Elements
  const ogTitle = document.getElementById('og-title');
  const ogDescription = document.getElementById('og-description');
  const ogImage = document.getElementById('og-image');
  const twTitle = document.getElementById('tw-title');
  const twDescription = document.getElementById('tw-description');
  const twImage = document.getElementById('tw-image');

  // Parse Pathname & Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  // Extract path slug (e.g., /wdcom -> "wdcom", /sonafe-df -> "sonafe-df")
  const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const pathParts = cleanPath.split('/').filter(p => p && p !== 'index.html');
  const pathSlug = pathParts.length > 0 ? pathParts[pathParts.length - 1] : null;

  // Treat root "/" AND "/wdcom" as base routes displaying the official WDCOM logo
  const isBaseWdcomRoute = !pathSlug || pathSlug === 'wdcom';
  const isInternalEventPage = !isBaseWdcomRoute && Boolean(pathSlug || urlParams.get('evento') || urlParams.get('event') || urlParams.get('logo'));

  const eventSlug = isInternalEventPage ? (urlParams.get('evento') || urlParams.get('event') || pathSlug) : null;
  const customLogoUrl = urlParams.get('logo');
  const customName = urlParams.get('nome') || urlParams.get('name');
  const customPalette = urlParams.get('palette') || urlParams.get('cor');
  const customStatus = urlParams.get('status');

  // Controls Bar & Status Badge Visibility Logic
  if (controlsBar) {
    controlsBar.style.display = isInternalEventPage ? 'none' : 'block';
  }

  if (wallpaperWrapper) {
    wallpaperWrapper.style.display = 'flex';
  }

  if (wallpaperLogo) {
    wallpaperLogo.style.display = 'block';
  }

  if (wallpaperStatus) {
    // Hide AGUARDE badge on base routes (/ and /wdcom), show ONLY on internal event routes (/sonafe-df)
    wallpaperStatus.style.display = isInternalEventPage ? 'inline-flex' : 'none';
  }

  // Format status string cleanly (e.g., "AGUARDE")
  function formatStatusText(str) {
    if (!str) return 'AGUARDE';
    return str.trim().toUpperCase();
  }

  // Helper to resolve absolute image URL for Open Graph cards
  function getAbsoluteImageUrl(relativeOrAbsolute) {
    if (!relativeOrAbsolute) return 'https://wdcom-interactive-landing.vercel.app/assets/social-share-logo.png';
    if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://') || relativeOrAbsolute.startsWith('data:image/')) {
      return relativeOrAbsolute;
    }
    const cleanRel = relativeOrAbsolute.replace(/^\/+/, '');
    return `https://wdcom-interactive-landing.vercel.app/${cleanRel}`;
  }

  // Load Event Data from events.json, custom localStorage, or URL parameters
  async function loadEventConfig() {
    let logoUrl = 'assets/logo-mark.png';
    let eventName = 'WDCOM Mídia Digital';
    let paletteKey = 'wdcom';
    let rawStatus = 'AGUARDE';
    let shareLogoUrl = 'assets/social-share-logo.png';

    // 1. Fetch built-in events.json
    let builtInEvents = {};
    try {
      const response = await fetch('/events.json');
      if (response.ok) {
        builtInEvents = await response.json();
      }
    } catch (err) {
      console.warn('Configuração de eventos estáticos indisponível:', err);
    }

    // 2. Fetch custom owner-created events from localStorage
    let storedEvents = {};
    if (window.getCustomEvents) {
      storedEvents = window.getCustomEvents();
    } else {
      try {
        const raw = localStorage.getItem('wdcom_custom_events');
        if (raw) storedEvents = JSON.parse(raw);
      } catch (e) {}
    }

    // Merge custom events over built-in events
    const allEvents = { ...builtInEvents, ...storedEvents };

    if (eventSlug && allEvents[eventSlug]) {
      const config = allEvents[eventSlug];
      logoUrl = config.logo || logoUrl;
      eventName = config.name || eventName;
      paletteKey = config.palette || paletteKey;
      rawStatus = config.status || 'AGUARDE';
      shareLogoUrl = config.shareLogo || config.logo || shareLogoUrl;
    } else if (allEvents.default) {
      logoUrl = allEvents.default.logo || logoUrl;
      eventName = allEvents.default.name || eventName;
      paletteKey = allEvents.default.palette || paletteKey;
      rawStatus = allEvents.default.status || '';
      shareLogoUrl = allEvents.default.shareLogo || shareLogoUrl;
    }

    // Override with direct query parameters if passed (?logo=...&nome=...)
    if (customLogoUrl) {
      logoUrl = customLogoUrl;
      shareLogoUrl = customLogoUrl;
    }
    if (customName) {
      eventName = customName;
    }
    if (customPalette) {
      paletteKey = customPalette;
    }
    if (customStatus) {
      rawStatus = customStatus;
    }

    // Apply Logo on screen
    if (wallpaperLogo) {
      wallpaperLogo.src = logoUrl;
      wallpaperLogo.alt = eventName;
    }

    if (statusText) {
      statusText.textContent = formatStatusText(rawStatus);
    }

    const pageTitle = isInternalEventPage
      ? `${eventName} | Aguarde`
      : `WDCOM | Página de Aguarde Interativa para Sites e Eventos`;
      
    const pageDesc = isInternalEventPage
      ? `Página de aguarde interativa para o evento ${eventName}. Desenvolvido por WDCOM Mídia Digital.`
      : `Página de aguarde interativa, moderna e personalizada para lançamentos de sites, marcas e grandes eventos. Desenvolvido por WDCOM Mídia Digital.`;

    document.title = pageTitle;

    // Update Open Graph Social Preview Meta Tags dynamically
    const absoluteSocialLogoUrl = isInternalEventPage 
      ? getAbsoluteImageUrl(shareLogoUrl) 
      : 'https://wdcom-interactive-landing.vercel.app/assets/social-share-logo.png';

    if (ogTitle) ogTitle.setAttribute('content', pageTitle);
    if (ogDescription) ogDescription.setAttribute('content', pageDesc);
    if (ogImage) ogImage.setAttribute('content', absoluteSocialLogoUrl);
    if (twTitle) twTitle.setAttribute('content', pageTitle);
    if (twDescription) twDescription.setAttribute('content', pageDesc);
    if (twImage) twImage.setAttribute('content', absoluteSocialLogoUrl);

    // Apply Theme Palette
    if (window.bgEngine) {
      window.bgEngine.setPalette(paletteKey);
      
      swatches.forEach(s => {
        if (s.getAttribute('data-palette') === paletteKey) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    }
  }

  window.loadEventConfig = loadEventConfig;
  loadEventConfig();

  // Fullscreen Toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('Erro ao entrar em fullscreen:', err);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // Shockwave Pulse Button
  if (pulseBtn) {
    pulseBtn.addEventListener('click', () => {
      if (window.bgEngine) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        window.bgEngine.triggerShockwave(cx, cy);
        setTimeout(() => window.bgEngine.triggerShockwave(cx - 150, cy - 100), 150);
        setTimeout(() => window.bgEngine.triggerShockwave(cx + 150, cy + 100), 300);
      }
    });
  }

  // Color Palette Switcher
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const paletteKey = swatch.getAttribute('data-palette');
      if (window.bgEngine) {
        window.bgEngine.setPalette(paletteKey);
      }
    });
  });

});
