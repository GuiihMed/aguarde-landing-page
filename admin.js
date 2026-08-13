/**
 * WDCOM Mídia Digital - Owner Authentication & Dynamic Event Creator Panel
 */

(function () {
  const OWNER_PASSWORD_HASH = 'wdcom2026'; // Default Owner Password
  const STORAGE_KEY_AUTH = 'wdcom_owner_authenticated';
  const STORAGE_KEY_EVENTS = 'wdcom_custom_events';

  // State
  let customEvents = loadStoredEvents();

  function loadStoredEvents() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_EVENTS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('Erro ao carregar eventos salvos:', e);
      return {};
    }
  }

  function saveEvents(eventsObj) {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(eventsObj));
      customEvents = eventsObj;
    } catch (e) {
      console.warn('Erro ao salvar eventos:', e);
    }
  }

  // Public API to get custom events in main.js
  window.getCustomEvents = function () {
    return loadStoredEvents();
  };

  document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const adminToggleBtn = document.getElementById('admin-toggle-btn');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const ownerPassInput = document.getElementById('owner-pass-input');
    const loginError = document.getElementById('login-error');
    const closeLoginBtn = document.getElementById('close-login-btn');

    const adminModal = document.getElementById('admin-modal');
    const closeAdminBtn = document.getElementById('close-admin-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Event Form Inputs
    const eventForm = document.getElementById('create-event-form');
    const eventNameInput = document.getElementById('event-name-input');
    const eventSlugInput = document.getElementById('event-slug-input');
    const logoFileInput = document.getElementById('logo-file-input');
    const logoUrlInput = document.getElementById('logo-url-input');
    const logoPreviewImg = document.getElementById('logo-preview-img');
    const paletteSelect = document.getElementById('palette-select');
    const statusTextInput = document.getElementById('status-text-input');

    const eventsListContainer = document.getElementById('events-list-container');
    const toastNotification = document.getElementById('toast-notification');

    let currentLogoDataUrl = '';

    // Auto-generate URL slug from Event Name input
    if (eventNameInput && eventSlugInput) {
      eventNameInput.addEventListener('input', () => {
        if (!eventSlugInput.dataset.userEdited) {
          eventSlugInput.value = generateSlug(eventNameInput.value);
        }
      });

      eventSlugInput.addEventListener('input', () => {
        eventSlugInput.dataset.userEdited = 'true';
        eventSlugInput.value = generateSlug(eventSlugInput.value);
      });
    }

    function generateSlug(text) {
      return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    // Handle File Upload & Conversion to Base64
    if (logoFileInput) {
      logoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 4 * 1024 * 1024) {
            showToast('A imagem deve ter menos de 4MB.', 'error');
            logoFileInput.value = '';
            return;
          }

          const reader = new FileReader();
          reader.onload = function (event) {
            currentLogoDataUrl = event.target.result;
            if (logoPreviewImg) {
              logoPreviewImg.src = currentLogoDataUrl;
              logoPreviewImg.style.display = 'block';
            }
            if (logoUrlInput) logoUrlInput.value = '';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Handle Image URL input
    if (logoUrlInput) {
      logoUrlInput.addEventListener('input', () => {
        const url = logoUrlInput.value.trim();
        if (url) {
          currentLogoDataUrl = url;
          if (logoPreviewImg) {
            logoPreviewImg.src = url;
            logoPreviewImg.style.display = 'block';
          }
          if (logoFileInput) logoFileInput.value = '';
        }
      });
    }

    // Toggle Admin Panel / Login Modal
    if (adminToggleBtn) {
      adminToggleBtn.addEventListener('click', () => {
        if (isAuthenticated()) {
          openAdminModal();
        } else {
          openLoginModal();
        }
      });
    }

    function isAuthenticated() {
      return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    }

    function openLoginModal() {
      if (loginModal) {
        loginModal.style.display = 'flex';
        if (ownerPassInput) {
          ownerPassInput.value = '';
          ownerPassInput.focus();
        }
      }
    }

    function closeLoginModal() {
      if (loginModal) loginModal.style.display = 'none';
      if (loginError) loginError.style.display = 'none';
    }

    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLoginModal);

    // Handle Login Submit
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPass = ownerPassInput.value.trim();
        if (enteredPass === OWNER_PASSWORD_HASH) {
          sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
          closeLoginModal();
          openAdminModal();
          showToast('Login de proprietário realizado com sucesso!');
        } else {
          if (loginError) {
            loginError.textContent = 'Senha incorreta. Tente novamente.';
            loginError.style.display = 'block';
          }
        }
      });
    }

    // Admin Modal Logic
    function openAdminModal() {
      if (adminModal) {
        adminModal.style.display = 'flex';
        renderEventsList();
      }
    }

    function closeAdminModal() {
      if (adminModal) adminModal.style.display = 'none';
    }

    if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdminModal);

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem(STORAGE_KEY_AUTH);
        closeAdminModal();
        showToast('Sessão encerrada.');
      });
    }

    // Create New Event Submit
    if (eventForm) {
      eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = eventNameInput.value.trim();
        const slug = eventSlugInput.value.trim() || generateSlug(name);
        const logo = currentLogoDataUrl || (logoUrlInput ? logoUrlInput.value.trim() : '') || 'assets/logo-mark.png';
        const palette = paletteSelect ? paletteSelect.value : 'wdcom';
        const status = statusTextInput ? statusTextInput.value.trim() : 'AGUARDE';

        if (!name || !slug) {
          showToast('Preencha o nome e o identificador da URL do evento.', 'error');
          return;
        }

        const eventsObj = loadStoredEvents();
        eventsObj[slug] = {
          slug: slug,
          name: name,
          logo: logo,
          palette: palette,
          status: status,
          createdAt: new Date().toISOString()
        };

        saveEvents(eventsObj);
        renderEventsList();

        // Reset form
        eventForm.reset();
        currentLogoDataUrl = '';
        if (logoPreviewImg) logoPreviewImg.style.display = 'none';
        if (eventSlugInput) delete eventSlugInput.dataset.userEdited;

        const eventLink = `${window.location.origin}/${slug}`;
        copyToClipboard(eventLink);
        showToast(`Página criada! Link copiado: ${slug}`);

        // Notify main engine if open
        if (window.loadEventConfig) {
          window.loadEventConfig();
        }
      });
    }

    // Render List of Created Events in Admin Panel
    function renderEventsList() {
      if (!eventsListContainer) return;
      const eventsObj = loadStoredEvents();
      const slugs = Object.keys(eventsObj);

      if (slugs.length === 0) {
        eventsListContainer.innerHTML = `
          <div class="empty-events-msg">
            <p>Nenhum evento criado ainda. Preencha o formulário acima para criar seu primeiro link de aguarde!</p>
          </div>
        `;
        return;
      }

      eventsListContainer.innerHTML = slugs
        .map((slug) => {
          const item = eventsObj[slug];
          const fullUrl = `${window.location.origin}/${slug}`;
          return `
            <div class="event-card-item">
              <div class="event-card-info">
                <img src="${item.logo}" alt="${item.name}" class="event-card-thumb">
                <div class="event-card-details">
                  <h4>${item.name}</h4>
                  <span class="event-card-url">${fullUrl}</span>
                </div>
              </div>
              <div class="event-card-actions">
                <button class="action-btn copy-btn" data-url="${fullUrl}" title="Copiar Link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copiar Link
                </button>
                <a href="/${slug}" target="_blank" class="action-btn view-btn" title="Abrir ao Vivo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Ao Vivo
                </a>
                <button class="action-btn delete-btn" data-slug="${slug}" title="Excluir Evento">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          `;
        })
        .join('');

      // Add Event Listeners to Copy & Delete Buttons
      eventsListContainer.querySelectorAll('.copy-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const url = btn.getAttribute('data-url');
          copyToClipboard(url);
          showToast('Link copiado para a área de transferência!');
        });
      });

      eventsListContainer.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const slug = btn.getAttribute('data-slug');
          if (confirm(`Deseja realmente excluir a página do evento "${slug}"?`)) {
            const currentObj = loadStoredEvents();
            delete currentObj[slug];
            saveEvents(currentObj);
            renderEventsList();
            showToast('Página do evento excluída.');
          }
        });
      });
    }

    // Helper: Copy text to clipboard
    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    }

    function fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    // Toast Notification Feedback
    function showToast(message, type = 'success') {
      if (!toastNotification) return;
      toastNotification.textContent = message;
      toastNotification.className = `toast-notification ${type} show`;
      setTimeout(() => {
        toastNotification.className = 'toast-notification';
      }, 3200);
    }

  });
})();
