/* ==========================================================================
   MOBILITI - Employee / User Dashboard Logic
   Personal Relocation Timeline, Interactive Tasks, Uploads, Specialist Chat
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initEmployeeDashboard();
});

function initEmployeeDashboard() {
  const store = window.mobilitiStore;
  if (!store) return;

  initSidebarToggle();
  initViewSwitching();
  renderEmployeeRelocation();
  renderEmployeeTasks();
  renderEmployeeDocuments();
  initEmployeeChat();
  initUploadModal();
}

/* Sidebar Toggle */
function initSidebarToggle() {
  const toggleBtn = document.getElementById('empSidebarToggleBtn');
  const wrapper = document.querySelector('.dashboard-wrapper');
  if (toggleBtn && wrapper) {
    toggleBtn.addEventListener('click', () => {
      wrapper.classList.toggle('sidebar-collapsed');
      if (window.innerWidth <= 992) {
        wrapper.classList.toggle('sidebar-mobile-open');
      }
    });
  }
}

/* View Switching */
function initViewSwitching() {
  const menuItems = document.querySelectorAll('.sidebar-menu-item[data-view]');
  const views = document.querySelectorAll('.dashboard-view');
  const pageTitle = document.getElementById('empDashboardPageTitle');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetViewId = item.dataset.view;

      menuItems.forEach(m => m.classList.remove('active'));
      item.classList.add('active');

      views.forEach(v => {
        if (v.id === `emp-view-${targetViewId}`) {
          v.classList.add('active');
        } else {
          v.classList.remove('active');
        }
      });

      if (pageTitle) {
        pageTitle.innerText = item.innerText.trim();
      }

      document.querySelector('.dashboard-wrapper')?.classList.remove('sidebar-mobile-open');
    });
  });
}

/* Render Employee Relocation Details */
function renderEmployeeRelocation() {
  const store = window.mobilitiStore;
  // Get Sarah Jenkins relocation for demo employee
  const relocations = store.getRelocations();
  const rel = relocations.find(r => r.id === 'MOB-8402') || relocations[0];
  if (!rel) return;

  const headerEmpName = document.getElementById('empWelcomeName');
  const destEl = document.getElementById('empDestinationText');
  const targetDateEl = document.getElementById('empTargetDateText');
  const progressFill = document.getElementById('empProgressFill');
  const progressPercentText = document.getElementById('empProgressPercentText');

  if (headerEmpName) headerEmpName.innerText = rel.employeeName;
  if (destEl) destEl.innerText = rel.destination;
  if (targetDateEl) targetDateEl.innerText = rel.targetDate;

  if (progressFill) progressFill.style.width = `${rel.progress}%`;
  if (progressPercentText) progressPercentText.innerText = `${rel.progress}%`;

  // Render Milestones
  const milestonesContainer = document.getElementById('empMilestonesList');
  if (milestonesContainer && rel.milestones) {
    milestonesContainer.innerHTML = rel.milestones.map(m => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--soft-sky); color: var(--accent-blue); display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">
            <i class="ri-calendar-event-line"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem;">${m.title}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${m.date}</div>
          </div>
        </div>
        <span class="badge badge-info">${m.status}</span>
      </div>
    `).join('');
  }
}

/* Render Checkable Tasks */
function renderEmployeeTasks() {
  const store = window.mobilitiStore;
  const relocations = store.getRelocations();
  const rel = relocations.find(r => r.id === 'MOB-8402') || relocations[0];
  if (!rel || !rel.tasks) return;

  const tasksList = document.getElementById('empTasksList');
  if (!tasksList) return;

  tasksList.innerHTML = rel.tasks.map(t => `
    <div class="checklist-item" style="cursor: pointer;" data-taskid="${t.id}">
      <div class="checklist-info">
        <input type="checkbox" class="task-checkbox" data-taskid="${t.id}" ${t.completed ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-blue); cursor: pointer;">
        <div>
          <div style="font-weight: 600; font-size: 0.95rem; text-decoration: ${t.completed ? 'line-through' : 'none'}; color: ${t.completed ? 'var(--text-muted)' : 'var(--text-primary)'}">
            ${t.text}
          </div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${t.category}</span>
        </div>
      </div>
      <span class="badge ${t.completed ? 'badge-success' : 'badge-pending'}">${t.completed ? 'Done' : 'Action Required'}</span>
    </div>
  `).join('');

  document.querySelectorAll('.task-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      e.stopPropagation();
      const taskId = chk.dataset.taskid;
      store.toggleTask(rel.id, taskId);
      showToast(chk.checked ? 'Task marked as completed!' : 'Task reopened', chk.checked ? 'success' : 'info');
      renderEmployeeTasks();
    });
  });
}

/* Render Employee Documents */
function renderEmployeeDocuments() {
  const store = window.mobilitiStore;
  const relocations = store.getRelocations();
  const rel = relocations.find(r => r.id === 'MOB-8402') || relocations[0];
  if (!rel || !rel.documents) return;

  const docList = document.getElementById('empDocumentsList');
  if (!docList) return;

  docList.innerHTML = rel.documents.map(d => `
    <div class="checklist-item">
      <div class="checklist-info">
        <div class="checklist-icon"><i class="ri-file-text-line"></i></div>
        <div>
          <div style="font-weight: 700;">${d.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Uploaded: ${d.uploadDate} | Due: ${d.requiredDate}</div>
        </div>
      </div>
      <span class="badge ${d.status === 'Approved' ? 'badge-success' : d.status === 'Under Review' ? 'badge-warning' : 'badge-pending'}">${d.status}</span>
    </div>
  `).join('');
}

/* Upload Modal for Employee */
function initUploadModal() {
  const modal = document.getElementById('empUploadModal');
  const openBtns = document.querySelectorAll('.open-emp-upload-btn');
  const closeBtn = document.getElementById('closeEmpUploadModal');

  if (!modal) return;

  openBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.add('active')));
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  const form = document.getElementById('empUploadForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const docName = document.getElementById('empDocTitleInput')?.value || 'Passport Upload';
      const store = window.mobilitiStore;
      store.addDocument('MOB-8402', docName);
      showToast('Document uploaded successfully!', 'success');
      modal.classList.remove('active');
      renderEmployeeDocuments();
    });
  }
}

/* Employee Specialist Chat */
function initEmployeeChat() {
  const sendBtn = document.getElementById('empSendMessageBtn');
  const input = document.getElementById('empMessageInput');
  const chatContainer = document.getElementById('empChatMessagesContainer');

  if (!sendBtn || !input || !chatContainer) return;

  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;

    const store = window.mobilitiStore;
    const msg = store.sendMessage('Sarah Jenkins', text, 'employee');

    const msgEl = document.createElement('div');
    msgEl.style.cssText = 'margin-bottom: 1rem; text-align: right;';
    msgEl.innerHTML = `
      <div style="display: inline-block; background: var(--accent-blue); color: white; padding: 0.75rem 1.25rem; border-radius: 12px 12px 0 12px; text-align: left; max-width: 75%;">
        <div>${msg.text}</div>
        <div style="font-size: 0.7rem; opacity: 0.8; margin-top: 0.25rem;">${msg.time} • You</div>
      </div>
    `;
    chatContainer.appendChild(msgEl);
    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
}
