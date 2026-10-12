/* ==========================================================================
   MOBILITI - Main Application Scripts
   Theme Switching, RTL Toggle, Header, Toasts, Scroll Reveal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDirection();
  initProfileMenu();
  initMobileMenu();
  initMobileTagline();
  initNewsletter();
  initSocialLinks();
  initFooterTrust();
  initScrollEffects();
  initScrollReveal();
  initBackToTop();
});

/* Theme Switcher */
function initTheme() {
  const savedTheme = localStorage.getItem('mobiliti_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleUI(savedTheme);

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('mobiliti_theme', nextTheme);
      updateThemeToggleUI(nextTheme);
      showToast(`Switched to ${nextTheme} mode`, 'info');
    });
  });
}

function updateThemeToggleUI(theme) {
  document.querySelectorAll('.theme-toggle i').forEach(icon => {
    if (theme === 'dark') {
      icon.className = 'ri-sun-line';
    } else {
      icon.className = 'ri-moon-line';
    }
  });
}

/* RTL / LTR Direction Switcher */
function initDirection() {
  const savedDir = localStorage.getItem('mobiliti_dir') || 'ltr';
  document.documentElement.setAttribute('dir', savedDir);

  document.querySelectorAll('.rtl-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('dir');
      const nextDir = current === 'rtl' ? 'ltr' : 'rtl';
      document.documentElement.setAttribute('dir', nextDir);
      localStorage.setItem('mobiliti_dir', nextDir);
      showToast(`Direction updated to ${nextDir.toUpperCase()}`, 'info');
    });
  });
}

/* User Profile Dropdown (before theme toggle) */
function initProfileMenu() {
  // Auto-create the menu if a static one isn't in the markup, so all
  // pages sharing app.js get the icon without duplicated HTML edits.
  document.querySelectorAll('.header-actions').forEach((actions) => {
    if (actions.closest('.auth-minimal')) return; // minimal auth header stays minimal
    if (!actions.querySelector('.profile-menu') && actions.querySelector('.theme-toggle')) {
      const inPagesDir = window.location.pathname.includes('/pages/');
      const userHref = inPagesDir ? 'employee-dashboard.html' : 'pages/employee-dashboard.html';
      const adminHref = inPagesDir ? 'hr-dashboard.html' : 'pages/hr-dashboard.html';
      const wrapper = document.createElement('div');
      wrapper.className = 'profile-menu';
      wrapper.innerHTML =
        '<button class="profile-toggle" aria-label="User profile menu" aria-expanded="false" aria-haspopup="true"><i class="ri-user-line"></i></button>' +
        '<div class="profile-dropdown" role="menu">' +
        '<a href="' + userHref + '" role="menuitem"><i class="ri-user-line"></i> User Dashboard</a>' +
        '<a href="' + adminHref + '" role="menuitem"><i class="ri-shield-user-line"></i> Admin Dashboard</a>' +
        '</div>';
      actions.insertBefore(wrapper, actions.querySelector('.theme-toggle'));
    }
  });

  const menus = document.querySelectorAll('.profile-menu');
  if (!menus.length) return;

  function closeAll(except) {
    menus.forEach((menu) => {
      if (menu !== except) {
        menu.classList.remove('open');
        const btn = menu.querySelector('.profile-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  menus.forEach((menu) => {
    const toggle = menu.querySelector('.profile-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !menu.classList.contains('open');
      closeAll(menu);
      menu.classList.toggle('open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
    });

    menu.querySelectorAll('.profile-dropdown a').forEach((link) => {
      link.addEventListener('click', () => closeAll());
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-menu')) closeAll();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
}

/* Mobile tagline strip — the header lockup tagline hides on small screens,
   so re-surface it as a slim centered line below the bar (CSS shows ≤760px) */
function initMobileTagline() {
  document.querySelectorAll('.site-header').forEach((header) => {
    if (header.querySelector('.mobile-tagline')) return;
    const strip = document.createElement('div');
    strip.className = 'mobile-tagline';
    strip.textContent = 'Move Talent Beyond Borders.';
    header.appendChild(strip);
  });
}

/* Footer Newsletter Signup */
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const value = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showToast('Please enter a valid work email address.', 'warning');
        input.focus();
        return;
      }
      form.reset();
      showToast('Subscribed! Mobility insights are on the way.', 'success');
    });
  });
}

/* Mobile Menu — responsive dropdown with a11y + backdrop */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const headerActions = document.querySelector('.header-actions');

  if (!menuToggle || !mainNav) return;

  // Ensure the nav has an id for aria-controls
  if (!mainNav.id) mainNav.id = 'primary-navigation';
  menuToggle.setAttribute('aria-controls', mainNav.id);
  menuToggle.setAttribute('aria-expanded', 'false');

  // Inject mobile-only action buttons (clones of header CTAs) so they
  // stay reachable once the desktop buttons hide on small screens.
  if (headerActions && !mainNav.querySelector('.mobile-nav-actions')) {
    const ctas = Array.from(headerActions.querySelectorAll('a.btn'));
    if (ctas.length) {
      const wrapper = document.createElement('div');
      wrapper.className = 'mobile-nav-actions';
      wrapper.setAttribute('aria-label', 'Account actions');
      ctas.forEach((cta) => {
        const clone = cta.cloneNode(true);
        clone.classList.remove('btn-sm');
        clone.removeAttribute('id');
        wrapper.appendChild(clone);
      });
      mainNav.appendChild(wrapper);
    }
  }

  // Premium panel furniture: section label on top, contact strip at the
  // bottom (mailto:/tel: links need no relative paths, so one block fits
  // every page).
  if (!mainNav.querySelector('.mobile-nav-label')) {
    const label = document.createElement('div');
    label.className = 'mobile-nav-label';
    label.textContent = 'Menu';
    mainNav.insertBefore(label, mainNav.firstChild);
  }

  if (!mainNav.querySelector('.mobile-nav-contact')) {
    const contact = document.createElement('div');
    contact.className = 'mobile-nav-contact';
    contact.innerHTML =
      '<a href="mailto:hello@mobiliti.com"><i class="ri-mail-line"></i> hello@mobiliti.com</a>' +
      '<a href="tel:+14155550132"><i class="ri-phone-line"></i> +1 (415) 555-0132</a>';
    mainNav.appendChild(contact);
  }

  // Shared backdrop for outside-click + focus dimming
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  const icon = () => menuToggle.querySelector('i');
  const isOpen = () => mainNav.classList.contains('show');

  function setOpen(open) {
    mainNav.classList.toggle('show', open);
    backdrop.classList.toggle('visible', open);
    document.body.classList.toggle('nav-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute(
      'aria-label',
      open ? 'Close navigation menu' : 'Open navigation menu'
    );
    if (icon()) {
      icon().className = open ? 'ri-close-line' : 'ri-menu-line';
    }
  }

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!isOpen());
  });

  backdrop.addEventListener('click', () => setOpen(false));

  // Close when a link/CTA inside the menu is chosen
  mainNav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      menuToggle.focus({ preventScroll: true });
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!isOpen()) return;
    const withinNav = e.target.closest('.main-nav');
    const withinToggle = e.target.closest('.mobile-menu-toggle');
    if (!withinNav && !withinToggle) setOpen(false);
  });

  // Reset when resizing back to desktop so stale state never sticks
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100 && isOpen()) setOpen(false);
  });
}

/* Footer social links (auto-wired to brand profiles) */
function initSocialLinks() {
  const URLS = {
    'Mobiliti on LinkedIn': 'https://www.linkedin.com/company/mobiliti',
    'Mobiliti on X': 'https://x.com/mobiliti',
    'Mobiliti on Facebook': 'https://www.facebook.com/mobiliti',
    'Mobiliti on Instagram': 'https://www.instagram.com/mobiliti',
    'Mobiliti on YouTube': 'https://www.youtube.com/@mobiliti'
  };
  document.querySelectorAll('a.social-btn').forEach((a) => {
    const url = URLS[a.getAttribute('aria-label') || ''];
    if (!url) return;
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
  });
}

/* Footer trust strip (auto-injected above the bottom bar) */
function initFooterTrust() {
  document.querySelectorAll('.site-footer').forEach((footer) => {
    const bottom = footer.querySelector('.footer-bottom');
    if (!bottom || footer.querySelector('.footer-trust')) return;
    const strip = document.createElement('div');
    strip.className = 'footer-trust';
    strip.innerHTML =
      '<span><i class="ri-shield-check-line"></i> SOC 2 Type II</span>' +
      '<span><i class="ri-lock-line"></i> GDPR Ready</span>' +
      '<span><i class="ri-award-line"></i> ISO 27001</span>' +
      '<span><i class="ri-earth-line"></i> 140+ Countries</span>';
    bottom.parentNode.insertBefore(strip, bottom);
  });
}

/* Scroll Header Effects */
function initScrollEffects() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* Scroll Reveal Observer */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

/* Back To Top Button */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* Global Toast System */
window.showToast = function(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconClass = 'ri-information-line';
  if (type === 'success') iconClass = 'ri-checkbox-circle-line';
  if (type === 'warning') iconClass = 'ri-error-warning-line';
  if (type === 'error') iconClass = 'ri-close-circle-line';

  toast.innerHTML = `
    <i class="${iconClass}" style="font-size: 1.25rem;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};
