/* ==========================================================================
   MOBILITI - Main Application Scripts
   Theme Switching, RTL Toggle, Header, Toasts, Scroll Reveal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDirection();
  initMobileMenu();
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

/* Mobile Menu */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('show');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.className = mainNav.classList.contains('show') ? 'ri-close-line' : 'ri-menu-line';
      }
    });
  }
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
