/* ==========================================================================
   JAVIER VERA ARANEDA — PORTAFOLIO
   script.js
   Contenido:
     1. Navegación SPA entre las 5 secciones (con soporte de #hash en la URL)
     2. Menú responsive (hamburguesa) para móviles
     3. Animaciones de entrada (scroll reveal) por sección
     4. Contadores animados para las métricas destacadas
     5. Detalles varios (año en el footer, cierre de menú con Escape, etc.)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     Referencias a elementos del DOM
     ------------------------------------------------------------------------ */
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('.section[data-section]');
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  const brandLink = document.querySelector('[data-nav-link]');
  const yearEl = document.getElementById('year');

  const DEFAULT_SECTION = 'home';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. NAVEGACIÓN ENTRE SECCIONES
     ------------------------------------------------------------------------ */

  /**
   * Activa la sección solicitada, actualiza el estado de la navbar,
   * dispara las animaciones de entrada y desplaza el scroll al inicio.
   * @param {string} targetId - id de la sección a mostrar (home, cnn, metro, faro, academia)
   * @param {boolean} updateHistory - si se debe actualizar la URL (#hash)
   */
  function activateSection(targetId, updateHistory = true) {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    sections.forEach((section) => {
      section.classList.toggle('is-active', section.id === targetId);
    });

    navLinks.forEach((link) => {
      const isActive = link.dataset.target === targetId;
      link.classList.toggle('is-active', isActive);
      link.setAttribute('aria-selected', String(isActive));
    });

    if (updateHistory) {
      history.pushState(null, '', `#${targetId}`);
    }

    document.title = `Javier Vera Araneda — ${getSectionLabel(targetId)}`;

    // Vuelve al inicio del contenido, respetando la altura de la navbar
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

    closeMobileMenu();
    triggerRevealFor(targetSection);
    triggerCountersFor(targetSection);
  }

  function getSectionLabel(targetId) {
    const link = document.querySelector(`.nav__link[data-target="${targetId}"]`);
    return link ? link.textContent.trim().replace(/^\d+\s*/, '') : '';
  }

  // Clic en los botones de la navbar
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      activateSection(link.dataset.target);
    });
  });

  // Clic en el logo/marca -> vuelve a "Acerca de mí"
  if (brandLink) {
    brandLink.addEventListener('click', (event) => {
      event.preventDefault();
      activateSection('home');
    });
  }

  // Navegación con los botones adelante/atrás del navegador
  window.addEventListener('popstate', () => {
    const targetId = window.location.hash.replace('#', '') || DEFAULT_SECTION;
    activateSection(targetId, false);
  });

  // Soporte de navegación por teclado tipo "tabs" (flechas izquierda/derecha)
  primaryNav.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const linksArray = Array.from(navLinks);
    const currentIndex = linksArray.findIndex((link) => link.classList.contains('is-active'));
    if (currentIndex === -1) return;

    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + direction + linksArray.length) % linksArray.length;
    const nextLink = linksArray[nextIndex];
    nextLink.focus();
    activateSection(nextLink.dataset.target);
  });

  // Carga inicial: respeta el hash de la URL si existe y es válido
  const initialHash = window.location.hash.replace('#', '');
  const validInitial = Array.from(sections).some((section) => section.id === initialHash);
  activateSection(validInitial ? initialHash : DEFAULT_SECTION, false);

  /* ------------------------------------------------------------------------
     2. MENÚ RESPONSIVE (HAMBURGUESA)
     ------------------------------------------------------------------------ */
  function openMobileMenu() {
    primaryNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Cerrar menú de navegación');
  }

  function closeMobileMenu() {
    primaryNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú de navegación');
  }

  function toggleMobileMenu() {
    const isOpen = primaryNav.classList.contains('is-open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  }

  navToggle.addEventListener('click', toggleMobileMenu);

  // Cierra el menú al presionar Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
      closeMobileMenu();
      navToggle.focus();
    }
  });

  // Cierra el menú al hacer clic fuera de él (solo en vista móvil)
  document.addEventListener('click', (event) => {
    const clickedInsideNav = primaryNav.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);
    if (!clickedInsideNav && !clickedToggle) {
      closeMobileMenu();
    }
  });

  /* ------------------------------------------------------------------------
     3. ANIMACIONES DE ENTRADA (SCROLL REVEAL)
     Cada sección tiene elementos con la clase .reveal. Se activan la primera
     vez que se muestran (al cambiar de pestaña) y también al hacer scroll
     dentro de secciones más largas, usando IntersectionObserver.
     ------------------------------------------------------------------------ */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /**
   * Fuerza la revelación inmediata (con pequeño escalonado) de los elementos
   * ya visibles dentro de la sección recién activada, para que la transición
   * de pestañas se sienta fluida incluso si el observer aún no disparó.
   */
  function triggerRevealFor(section) {
    const items = section.querySelectorAll('.reveal:not(.is-visible)');
    items.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('is-visible');
      }, prefersReducedMotion ? 0 : index * 60);
    });
  }

  /* ------------------------------------------------------------------------
     4. CONTADORES ANIMADOS (MÉTRICAS)
     Elementos con [data-count-to] cuentan desde 0 hasta el valor indicado
     cada vez que su sección se activa.
     ------------------------------------------------------------------------ */
  function animateCounter(el) {
    const target = parseInt(el.dataset.countTo, 10);
    const prefix = el.dataset.prefix || '';
    if (Number.isNaN(target)) return;

    if (prefersReducedMotion) {
      el.textContent = `${prefix}${target.toLocaleString('es-CL')}`;
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(target * eased);
      el.textContent = `${prefix}${current.toLocaleString('es-CL')}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  function triggerCountersFor(section) {
    const counters = section.querySelectorAll('[data-count-to]');
    counters.forEach((el) => {
      el.dataset.animated = '';
      animateCounter(el);
    });
  }

  /* ------------------------------------------------------------------------
     5. DETALLES VARIOS
     ------------------------------------------------------------------------ */
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Sombra sutil en la navbar al hacer scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.style.borderBottomColor = window.scrollY > 8
      ? 'rgba(255,255,255,0.08)'
      : 'transparent';
  });

});
