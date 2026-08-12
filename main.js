/**
 * WDCOM & Eventos - Dynamic Aguarde Landing Page Engine
 * Displays controls bar ONLY on the root home page (/)
 * Hides controls bar on internal event pages (/wdcom, /sonafe-df, /nome-do-evento)
 * Dynamically updates Open Graph social media sharing cards for WhatsApp, Instagram, Telegram & Twitter
 */

document.addEventListener('DOMContentLoaded', () => {

  const wallpaperLogo = document.getElementById('wallpaper-logo');
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

  const eventSlug = urlParams.get('evento') || urlParams.get('event') || pathSlug;
  const customLogoUrl = urlParams.get('logo');
  const customName = urlParams.get('nome') || urlParams.get('name');
  const customPalette = urlParams.get('palette') || urlParams.get('cor');
  const customStatus = urlParams.get('status');

  // Determine if this is an internal event page vs root home page
  const isInternalEventPage = Boolean(pathSlug || urlParams.get('evento') || urlParams.get('event') || customLogoUrl);

  // Show controls bar ONLY on the root home page, hide on internal event pages
  if (controlsBar) {
    if (isInternalEventPage) {
      controlsBar.style.display = 'none';
    } else {
      controlsBar.style.display = 'block';
    }
  }

  // Format status string cleanly (e.g., "AGUARDE")
  function formatStatusText(str) {
    if (!str) return 'AGUARDE';
    return str.trim().toUpperCase();
  }

  // Helper to resolve absolute image URL for Open Graph cards
  function getAbsoluteImageUrl(relativeOrAbsolute) {
    if (!relativeOrAbsolute) return 'https://wdcom-interactive-landing.vercel.app/assets/social-share-logo.png';
    if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
      return relativeOrAbsolute;
    }
    const cleanRel = relativeOrAbsolute.replace(/^\/+/, '');
    return `https://wdcom-interactive-landing.vercel.app/${cleanRel}`;
  }

  // Load Event Data from events.json or URL parameters
  async function loadEventConfig() {
    let logoUrl = 'assets/social-share-logo.png';
    let eventName = 'WDCOM Mídia Digital';
    let paletteKey = 'wdcom';
    let rawStatus = 'AGUARDE';
    let shareLogoUrl = 'assets/social-share-logo.png';

    try {
      const response = await fetch('/events.json');
      if (response.ok) {
        const eventsData = await response.json();

        if (eventSlug && eventsData[eventSlug]) {
          const config = eventsData[eventSlug];
          logoUrl = config.logo || logoUrl;
          eventName = config.name || eventName;
          paletteKey = config.palette || paletteKey;
          rawStatus = config.status || 'AGUARDE';
          shareLogoUrl = config.logo || shareLogoUrl;
        } else if (eventsData.default) {
          logoUrl = eventsData.default.logo || logoUrl;
          eventName = eventsData.default.name || eventName;
          paletteKey = eventsData.default.palette || paletteKey;
          rawStatus = eventsData.default.status || 'AGUARDE';
          shareLogoUrl = eventsData.default.logo || shareLogoUrl;
        }
      }
    } catch (err) {
      console.warn('Configuração de eventos carregada no modo padrão:', err);
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

    // Apply Logo on screen, Status Badge & Document Title
    if (wallpaperLogo) {
      wallpaperLogo.src = logoUrl;
      wallpaperLogo.alt = `${eventName} - Aguarde`;
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
    const absoluteSocialLogoUrl = getAbsoluteImageUrl(shareLogoUrl);

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
