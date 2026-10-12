/* ==========================================================================
   MOBILITI - HR Client Dashboard Logic
   Multi-step Request Wizard, Data Table Filters, Modals, Views, Documents
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHRDashboard();
});

function initHRDashboard() {
  const store = window.mobilitiStore;
  if (!store) return;

  initSidebarToggle();
  initViewSwitching();
  renderKpiCards();
  renderRelocationTable();
  renderPendingDocsTable();
  initNewRequestWizard();
  initDocumentUploadModal();
  initMessagesPanel();
}

/* Sidebar Toggle */
function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const wrapper = document.querySelector('.dashboard-wrapper');
  if (toggleBtn && wrapper) {
    toggleBtn.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        // Mobile: slide-in overlay only — never the collapsed icon rail
        wrapper.classList.remove('sidebar-collapsed');
        const open = wrapper.classList.toggle('sidebar-mobile-open');
        document.body.classList.toggle('sidebar-locked', open);
      } else {
        wrapper.classList.toggle('sidebar-collapsed');
      }
    });

    // Backdrop tap closes the mobile sidebar
    wrapper.querySelector('.sidebar-backdrop')?.addEventListener('click', () => {
      wrapper.classList.remove('sidebar-mobile-open');
      document.body.classList.remove('sidebar-locked');
    });

    // Escape closes it; resizing to desktop clears mobile state
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        wrapper.classList.remove('sidebar-mobile-open');
        document.body.classList.remove('sidebar-locked');
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992) {
        wrapper.classList.remove('sidebar-mobile-open');
        document.body.classList.remove('sidebar-locked');
      }
    });
  }
}

/* View Switching */
function initViewSwitching() {
  const menuItems = document.querySelectorAll('.sidebar-menu-item[data-view]');
  const views = document.querySelectorAll('.dashboard-view');
  const pageTitle = document.getElementById('dashboardPageTitle');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetViewId = item.dataset.view;

      menuItems.forEach(m => m.classList.remove('active'));
      item.classList.add('active');

      views.forEach(v => {
        if (v.id === `view-${targetViewId}`) {
          v.classList.add('active');
        } else {
          v.classList.remove('active');
        }
      });

      if (pageTitle) {
        pageTitle.innerText = item.innerText.trim();
      }

      // Close mobile menu
      document.querySelector('.dashboard-wrapper')?.classList.remove('sidebar-mobile-open');
      document.body.classList.remove('sidebar-locked');
    });
  });
}

/* KPI Cards */
function renderKpiCards() {
  const store = window.mobilitiStore;
  const relocations = store.getRelocations();

  const active = relocations.filter(r => r.status === 'Active').length;
  const completed = relocations.filter(r => r.status === 'Completed').length;
  let totalDocsPending = 0;
  relocations.forEach(r => {
    totalDocsPending += r.documents.filter(d => d.status === 'Pending' || d.status === 'Under Review').length;
  });

  const activeEl = document.getElementById('kpiActiveMoves');
  const empEl = document.getElementById('kpiEmpInProgress');
  const docsEl = document.getElementById('kpiPendingDocs');
  const completedEl = document.getElementById('kpiCompletedMoves');

  if (activeEl) activeEl.innerText = active;
  if (empEl) empEl.innerText = relocations.length;
  if (docsEl) docsEl.innerText = totalDocsPending;
  if (completedEl) completedEl.innerText = completed;
}

/* Relocation Table Rendering & Filter */
function renderRelocationTable(filterStatus = 'all', searchQuery = '') {
  const tableBody = document.getElementById('hrRelocationsTableBody');
  if (!tableBody) return;

  const store = window.mobilitiStore;
  let relocations = store.getRelocations();

  if (filterStatus !== 'all') {
    relocations = relocations.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    relocations = relocations.filter(r => 
      r.employeeName.toLowerCase().includes(q) || 
      r.destination.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  }

  if (relocations.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="ri-search-line" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
          No relocation requests found matching your filters.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = relocations.map(r => `
    <tr>
      <td>
        <div style="font-weight: 700;">${r.employeeName}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${r.email}</div>
      </td>
      <td>
        <div>${r.destination}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">From: ${r.origin}</div>
      </td>
      <td><span class="badge badge-info">${r.moveType}</span></td>
      <td><strong>${r.currentStage}</strong></td>
      <td style="min-width: 140px;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div class="progress-bar-container" style="flex: 1;">
            <div class="progress-bar-fill" style="width: ${r.progress}%;"></div>
          </div>
          <span style="font-size: 0.8rem; font-weight: 700;">${r.progress}%</span>
        </div>
      </td>
      <td>${r.targetDate}</td>
      <td>
        <span class="badge ${r.status === 'Active' ? 'badge-success' : 'badge-pending'}">${r.status}</span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline view-detail-btn" data-id="${r.id}">
          <i class="ri-eye-line"></i> View
        </button>
      </td>
    </tr>
  `).join('');

  // Attach Detail Buttons
  document.querySelectorAll('.view-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openRelocationDetailModal(btn.dataset.id);
    });
  });

  // Attach Search/Filter Inputs
  const statusFilterSelect = document.getElementById('tableStatusFilter');
  const searchInput = document.getElementById('tableSearchInput');

  if (statusFilterSelect && !statusFilterSelect.dataset.bound) {
    statusFilterSelect.dataset.bound = 'true';
    statusFilterSelect.addEventListener('change', (e) => {
      renderRelocationTable(e.target.value, searchInput?.value || '');
    });
  }

  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', (e) => {
      renderRelocationTable(statusFilterSelect?.value || 'all', e.target.value);
    });
  }
}

/* Render Pending Docs Table */
function renderPendingDocsTable() {
  const docTableBody = document.getElementById('hrPendingDocsTableBody');
  if (!docTableBody) return;

  const store = window.mobilitiStore;
  const relocations = store.getRelocations();
  let pendingDocsList = [];

  relocations.forEach(r => {
    r.documents.forEach(d => {
      pendingDocsList.push({
        ...d,
        relocationId: r.id,
        employeeName: r.employeeName
      });
    });
  });

  if (pendingDocsList.length === 0) {
    docTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No documents found.</td></tr>`;
    return;
  }

  docTableBody.innerHTML = pendingDocsList.map(doc => `
    <tr>
      <td><strong>${doc.name}</strong></td>
      <td>${doc.employeeName} (${doc.relocationId})</td>
      <td>${doc.uploadDate}</td>
      <td>${doc.requiredDate}</td>
      <td>
        <span class="badge ${doc.status === 'Approved' ? 'badge-success' : doc.status === 'Under Review' ? 'badge-warning' : 'badge-pending'}">
          ${doc.status}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-secondary approve-doc-btn" data-relid="${doc.relocationId}" data-docid="${doc.id}">
          <i class="ri-check-line"></i> Approve
        </button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.approve-doc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      store.updateDocumentStatus(btn.dataset.relid, btn.dataset.docid, 'Approved');
      showToast('Document approved successfully!', 'success');
      renderPendingDocsTable();
      renderKpiCards();
    });
  });
}

/* Multi-Step New Relocation Request Modal Wizard */
function initNewRequestWizard() {
  const modal = document.getElementById('newRequestModal');
  const openBtns = document.querySelectorAll('.open-new-request-btn');
  const closeBtn = document.getElementById('closeNewRequestModal');
  const cancelBtn = document.getElementById('cancelNewRequestModal');

  if (!modal) return;

  openBtns.forEach(btn => btn.addEventListener('click', () => {
    modal.classList.add('active');
    resetWizard();
  }));

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  let currentStep = 1;
  const wizardSteps = document.querySelectorAll('.wizard-step');
  const wizardStepIndicators = document.querySelectorAll('.wizard-step-node');

  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');
  const submitBtn = document.getElementById('wizardSubmitBtn');

  function updateWizardUI() {
    wizardSteps.forEach((st, i) => {
      st.style.display = (i + 1 === currentStep) ? 'block' : 'none';
    });

    wizardStepIndicators.forEach((node, i) => {
      node.classList.remove('active', 'completed');
      if (i + 1 === currentStep) node.classList.add('active');
      if (i + 1 < currentStep) node.classList.add('completed');
    });

    if (prevBtn) prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    if (nextBtn) nextBtn.style.display = currentStep === 5 ? 'none' : 'inline-flex';
    if (submitBtn) submitBtn.style.display = currentStep === 5 ? 'inline-flex' : 'none';
  }

  function resetWizard() {
    currentStep = 1;
    updateWizardUI();
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < 5) {
        currentStep++;
        updateWizardUI();
        if (currentStep === 5) populateSummary();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateWizardUI();
      }
    });
  }

  function populateSummary() {
    const summaryContainer = document.getElementById('wizardSummaryContent');
    if (!summaryContainer) return;

    const name = document.getElementById('reqEmpName')?.value || 'Sarah Connor';
    const email = document.getElementById('reqEmpEmail')?.value || 's.connor@cyber.com';
    const origin = document.getElementById('reqOrigin')?.value || 'San Francisco, USA';
    const dest = document.getElementById('reqDestination')?.value || 'Tokyo, Japan';
    const date = document.getElementById('reqDate')?.value || '2026-12-01';

    summaryContainer.innerHTML = `
      <div style="background: var(--bg-primary); padding: 1.25rem; border-radius: var(--radius-md); font-size: 0.95rem;">
        <p><strong>Employee:</strong> ${name} (${email})</p>
        <p><strong>Route:</strong> ${origin} &rarr; ${dest}</p>
        <p><strong>Target Move Date:</strong> ${date}</p>
        <p><strong>Selected Services:</strong> Visa Coordination, Housing Search, Moving Support</p>
      </div>
    `;
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const store = window.mobilitiStore;
      const newRel = store.addRelocation({
        employeeName: document.getElementById('reqEmpName')?.value || 'Sarah Connor',
        email: document.getElementById('reqEmpEmail')?.value || 's.connor@cyber.com',
        phone: document.getElementById('reqEmpPhone')?.value || '+1 (555) 019-2831',
        jobTitle: document.getElementById('reqEmpTitle')?.value || 'Senior Director',
        department: document.getElementById('reqEmpDept')?.value || 'Executive',
        origin: document.getElementById('reqOrigin')?.value || 'San Francisco, USA',
        destination: document.getElementById('reqDestination')?.value || 'Tokyo, Japan',
        moveType: 'Corporate Mobility Package',
        targetDate: document.getElementById('reqDate')?.value || '2026-12-01'
      });

      showToast(`Relocation Request ${newRel.id} submitted!`, 'success');
      modal.classList.remove('active');
      renderRelocationTable();
      renderKpiCards();
    });
  }
}

/* Relocation Detail Modal */
function openRelocationDetailModal(relId) {
  const store = window.mobilitiStore;
  const r = store.getRelocationById(relId);
  if (!r) return;

  const modal = document.getElementById('relocationDetailModal');
  const content = document.getElementById('relocationDetailContent');

  if (!modal || !content) return;

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
      <div>
        <h3 style="font-size: 1.5rem;">${r.employeeName}</h3>
        <p style="color: var(--text-muted);">${r.jobTitle} • ${r.department}</p>
      </div>
      <span class="badge badge-info" style="font-size: 0.9rem;">${r.id}</span>
    </div>

    <div class="form-row" style="margin-bottom: 1.5rem;">
      <div><strong>Origin:</strong> ${r.origin}</div>
      <div><strong>Destination:</strong> ${r.destination}</div>
      <div><strong>Target Date:</strong> ${r.targetDate}</div>
      <div><strong>Specialist:</strong> ${r.assignedSpecialist}</div>
    </div>

    <h4 style="margin-bottom: 1rem;">Relocation Progress Timeline</h4>
    <div class="timeline-stepper">
      <div class="timeline-step completed">
        <div class="step-node"><i class="ri-check-line"></i></div>
        <div class="step-title">Submitted</div>
      </div>
      <div class="timeline-step ${r.progress >= 25 ? 'completed' : 'active'}">
        <div class="step-node">2</div>
        <div class="step-title">Planning</div>
      </div>
      <div class="timeline-step ${r.progress >= 60 ? 'active' : ''}">
        <div class="step-node">3</div>
        <div class="step-title">Visa & Docs</div>
      </div>
      <div class="timeline-step">
        <div class="step-node">4</div>
        <div class="step-title">Moving</div>
      </div>
      <div class="timeline-step">
        <div class="step-node">5</div>
        <div class="step-title">Settling In</div>
      </div>
    </div>

    <h4 style="margin: 1.5rem 0 1rem 0;">Documents Checklist</h4>
    ${r.documents.map(d => `
      <div class="checklist-item">
        <div class="checklist-info">
          <div class="checklist-icon"><i class="ri-file-text-line"></i></div>
          <div>
            <strong>${d.name}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Due: ${d.requiredDate}</div>
          </div>
        </div>
        <span class="badge ${d.status === 'Approved' ? 'badge-success' : 'badge-pending'}">${d.status}</span>
      </div>
    `).join('')}
  `;

  modal.classList.add('active');

  const closeBtn = document.getElementById('closeDetailModal');
  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
}

/* Document Upload Modal Handler */
function initDocumentUploadModal() {
  const modal = document.getElementById('uploadDocModal');
  const openBtns = document.querySelectorAll('.open-upload-doc-modal');
  const closeBtn = document.getElementById('closeUploadDocModal');

  if (!modal) return;

  openBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.add('active')));
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  const form = document.getElementById('uploadDocForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const docName = document.getElementById('docTitleInput')?.value || 'Passport Document';
      const store = window.mobilitiStore;
      store.addDocument('MOB-8402', docName);
      showToast('Document uploaded successfully & sent for verification!', 'success');
      form.reset();
      modal.classList.remove('active');
      renderPendingDocsTable();
    });
  }
}

/* Messages Panel */
function initMessagesPanel() {
  const sendBtn = document.getElementById('hrSendMessageBtn');
  const input = document.getElementById('hrMessageInput');
  const chatContainer = document.getElementById('hrChatMessagesContainer');

  if (!sendBtn || !input || !chatContainer) return;

  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;

    const store = window.mobilitiStore;
    const msg = store.sendMessage('HR Coordinator', text, 'hr');

    const msgEl = document.createElement('div');
    msgEl.style.cssText = 'margin-bottom: 1rem; text-align: right;';
    msgEl.innerHTML = `
      <div style="display: inline-block; background: var(--accent-blue); color: white; padding: 0.75rem 1.25rem; border-radius: 12px 12px 0 12px; text-align: left; max-width: 75%;">
        <div>${msg.text}</div>
        <div style="font-size: 0.7rem; opacity: 0.8; margin-top: 0.25rem;">${msg.time} • HR</div>
      </div>
    `;
    chatContainer.appendChild(msgEl);
    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
}
