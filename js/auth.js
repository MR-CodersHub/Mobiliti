/* ==========================================================================
   MOBILITI - Authentication & Role Based Management
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAuthForm();
});

function initAuthForm() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const roleCards = document.querySelectorAll('.role-select-card');
  let selectedRole = 'hr'; // default

  // Role Selection Card Click
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      roleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedRole = card.dataset.role;
    });
  });

  // Handle Demo Quick Login Buttons
  const demoHrBtn = document.getElementById('demoHrLogin');
  const demoEmpBtn = document.getElementById('demoEmpLogin');

  if (demoHrBtn) {
    demoHrBtn.addEventListener('click', () => {
      loginUser({ name: 'Enterprise HR Director', email: 'hr.director@globalcorp.com', role: 'hr' });
    });
  }

  if (demoEmpBtn) {
    demoEmpBtn.addEventListener('click', () => {
      loginUser({ name: 'Sarah Jenkins', email: 'sarah.j@techcorp.global', role: 'employee' });
    });
  }

  // Handle Login Form Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value || 'hr@company.com';
      const password = document.getElementById('loginPassword')?.value;

      if (!email || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
      }

      loginUser({
        name: selectedRole === 'hr' ? 'HR Manager' : 'Relocating Employee',
        email: email,
        role: selectedRole
      });
    });
  }

  // Handle Register Form Submit
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName')?.value;
      const email = document.getElementById('regEmail')?.value;
      const company = document.getElementById('regCompany')?.value;

      if (!name || !email) {
        showToast('Please complete required fields', 'warning');
        return;
      }

      showToast('Registration successful! Logging into dashboard...', 'success');
      setTimeout(() => {
        loginUser({ name, email, company, role: selectedRole });
      }, 1000);
    });
  }
}

function loginUser(userData) {
  localStorage.setItem(MOBILITI_AUTH_KEY, JSON.stringify(userData));
  showToast(`Welcome back, ${userData.name}! Redirecting...`, 'success');

  setTimeout(() => {
    if (userData.role === 'hr') {
      window.location.href = 'hr-dashboard.html';
    } else {
      window.location.href = 'employee-dashboard.html';
    }
  }, 800);
}
