/**
 * WDCOM Mídia Digital - Fullscreen Wallpaper Controls & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {

  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const pulseBtn = document.getElementById('pulse-btn');
  const swatches = document.querySelectorAll('.swatch[data-palette]');

  // 1. Fullscreen Toggle
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

  // 2. Shockwave Pulse Button
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

  // 3. Color Palette Switcher
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
