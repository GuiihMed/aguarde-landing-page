/**
 * WDCOM & Eventos - Dynamic Aguarde Landing Page Engine
 * Supports clean URL paths (/wdcom, /nome-do-evento) and query parameters (?evento=nome, ?logo=URL)
 */

document.addEventListener('DOMContentLoaded', () => {

  const wallpaperLogo = document.getElementById('wallpaper-logo');

  // Parse Pathname & Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  // Extract path slug (e.g., /wdcom -> "wdcom", /aguarde/rockinrio -> "rockinrio")
  const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const pathParts = cleanPath.split('/').filter(p => p && p !== 'index.html');
  const pathSlug = pathParts.length > 0 ? pathParts[pathParts.length - 1] : null;

  const eventSlug = urlParams.get('evento') || urlParams.get('event') || pathSlug;
  const customLogoUrl = urlParams.get('logo');
  const customName = urlParams.get('nome') || urlParams.get('name');
  const customPalette = urlParams.get('palette') || urlParams.get('cor');

  // Load Event Data from events.json or URL parameters
  async function loadEventConfig() {
    let logoUrl = 'assets/logo-mark.png';
    let eventName = 'WDCOM Mídia Digital';
    let paletteKey = 'wdcom';

    try {
      const response = await fetch('/events.json');
      if (response.ok) {
        const eventsData = await response.json();

        if (eventSlug && eventsData[eventSlug]) {
          const config = eventsData[eventSlug];
          logoUrl = config.logo || logoUrl;
          eventName = config.name || eventName;
          paletteKey = config.palette || paletteKey;
        } else if (eventsData.default) {
          logoUrl = eventsData.default.logo || logoUrl;
          eventName = eventsData.default.name || eventName;
          paletteKey = eventsData.default.palette || paletteKey;
        }
      }
    } catch (err) {
      console.warn('Configuração de eventos carregada no modo padrão:', err);
    }

    // Override with direct query parameters if passed (?logo=...&nome=...)
    if (customLogoUrl) {
      logoUrl = customLogoUrl;
    }
    if (customName) {
      eventName = customName;
    }
    if (customPalette) {
      paletteKey = customPalette;
    }

    // Apply Logo & Title
    if (wallpaperLogo) {
      wallpaperLogo.src = logoUrl;
      wallpaperLogo.alt = `${eventName} - Aguarde`;
    }

    document.title = `${eventName} | Aguarde`;

    // Apply Theme Palette
    if (window.bgEngine) {
      window.bgEngine.setPalette(paletteKey);
    }
  }

  loadEventConfig();

});
