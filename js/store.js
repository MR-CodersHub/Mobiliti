/* ==========================================================================
   MOBILITI - Local Storage Store & Data Management
   ========================================================================== */

const MOBILITI_STORE_KEY = 'mobiliti_relocation_store_v1';
const MOBILITI_AUTH_KEY = 'mobiliti_user_session_v1';

// Initial Mock Seed Data
const defaultSeedData = {
  relocations: [
    {
      id: 'MOB-8402',
      employeeName: 'Sarah Jenkins',
      email: 'sarah.j@techcorp.global',
      phone: '+1 (555) 234-5678',
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
      origin: 'San Francisco, USA',
      destination: 'London, UK',
      moveType: 'International Relocation',
      currentStage: 'Visa / Immigration',
      progress: 60,
      targetDate: '2026-11-15',
      status: 'Active',
      services: ['Moving & Logistics', 'Visa Support', 'Temporary Accommodation', 'Home Search'],
      assignedSpecialist: 'Marcus Vance (Senior Mobility Consultant)',
      documents: [
        { id: 'doc-1', name: 'Passport Copy', status: 'Approved', uploadDate: '2026-09-10', requiredDate: '2026-09-15' },
        { id: 'doc-2', name: 'Work Permit Application', status: 'Under Review', uploadDate: '2026-09-20', requiredDate: '2026-10-01' },
        { id: 'doc-3', name: 'Lease Agreement', status: 'Pending', uploadDate: '-', requiredDate: '2026-10-25' }
      ],
      tasks: [
        { id: 't-1', text: 'Upload Passport & Visa Documents', completed: true, category: 'Documents' },
        { id: 't-2', text: 'Complete Relocation Preferences Questionnaire', completed: true, category: 'Planning' },
        { id: 't-3', text: 'Confirm Temporary Housing Check-in Date', completed: false, category: 'Housing' },
        { id: 't-4', text: 'Attend Pre-departure Briefing', completed: false, category: 'Orientation' }
      ],
      milestones: [
        { title: 'Visa Approval Granted', date: '2026-10-12', status: 'upcoming' },
        { title: 'Household Goods Shipment', date: '2026-10-28', status: 'upcoming' },
        { title: 'Arrival in London (LHR)', date: '2026-11-01', status: 'upcoming' }
      ]
    },
    {
      id: 'MOB-8403',
      employeeName: 'Alexander Wright',
      email: 'a.wright@financehub.com',
      phone: '+44 20 7946 0912',
      jobTitle: 'VP of Global Operations',
      department: 'Executive',
      origin: 'London, UK',
      destination: 'Singapore',
      moveType: 'Executive Relocation',
      currentStage: 'Planning',
      progress: 25,
      targetDate: '2026-12-01',
      status: 'Active',
      services: ['Full Relocation Package', 'VIP Destination Support', 'School Finder', 'Tax Guidance'],
      assignedSpecialist: 'Elena Rostova (Lead Mobility Director)',
      documents: [
        { id: 'doc-4', name: 'Executive Employment Contract', status: 'Approved', uploadDate: '2026-09-28', requiredDate: '2026-10-05' },
        { id: 'doc-5', name: 'Dependent Pass Application', status: 'Pending', uploadDate: '-', requiredDate: '2026-10-18' }
      ],
      tasks: [
        { id: 't-5', text: 'Submit Dependent Pass Application', completed: false, category: 'Visas' },
        { id: 't-6', text: 'Select Preferred School Options', completed: false, category: 'Family' }
      ],
      milestones: [
        { title: 'School Consultation Session', date: '2026-10-15', status: 'upcoming' }
      ]
    },
    {
      id: 'MOB-8404',
      employeeName: 'Elena Gomez',
      email: 'elena.g@innovate.co',
      phone: '+34 91 123 4567',
      jobTitle: 'Product Design Lead',
      department: 'Product',
      origin: 'Madrid, Spain',
      destination: 'Berlin, Germany',
      moveType: 'European Transfer',
      currentStage: 'Completed',
      progress: 100,
      targetDate: '2026-09-30',
      status: 'Completed',
      services: ['Moving', 'Registration', 'Settling-in'],
      assignedSpecialist: 'Marcus Vance (Senior Mobility Consultant)',
      documents: [
        { id: 'doc-6', name: 'German Registration Certificate (Anmeldung)', status: 'Approved', uploadDate: '2026-09-25', requiredDate: '2026-09-28' }
      ],
      tasks: [
        { id: 't-7', text: 'Local Bank Account Setup', completed: true, category: 'Settling In' }
      ],
      milestones: [
        { title: 'Successfully Settled In Berlin', date: '2026-09-30', status: 'completed' }
      ]
    }
  ],
  notifications: [
    { id: 'n-1', text: 'Visa approval status updated for Sarah Jenkins', time: '10 mins ago', unread: true },
    { id: 'n-2', text: 'New relocation request created for Alexander Wright', time: '2 hours ago', unread: true },
    { id: 'n-3', text: 'Document verified: German Registration for Elena Gomez', time: '1 day ago', unread: false }
  ],
  messages: [
    { sender: 'Marcus Vance', text: 'Hello Sarah! Your visa application has been submitted to the embassy. We will update you as soon as we hear back.', time: '09:30 AM', role: 'specialist' },
    { sender: 'Sarah Jenkins', text: 'Thank you Marcus! Should I hold off on booking my flights until the approval comes through?', time: '09:42 AM', role: 'employee' }
  ]
};

// Data Store Class
class MobilitiStore {
  constructor() {
    this.init();
  }

  init() {
    const existing = localStorage.getItem(MOBILITI_STORE_KEY);
    if (!existing) {
      this.saveStore(defaultSeedData);
    }
  }

  getStore() {
    try {
      const data = localStorage.getItem(MOBILITI_STORE_KEY);
      return data ? JSON.parse(data) : defaultSeedData;
    } catch (e) {
      console.error('Error reading Mobiliti Store:', e);
      return defaultSeedData;
    }
  }

  saveStore(data) {
    try {
      localStorage.setItem(MOBILITI_STORE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving Mobiliti Store:', e);
    }
  }

  // Relocation Methods
  getRelocations() {
    return this.getStore().relocations || [];
  }

  getRelocationById(id) {
    return this.getRelocations().find(r => r.id === id);
  }

  addRelocation(newRelocation) {
    const store = this.getStore();
    const generatedId = `MOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullRequest = {
      id: generatedId,
      status: 'Active',
      currentStage: 'Request Submitted',
      progress: 10,
      assignedSpecialist: 'Marcus Vance (Senior Mobility Consultant)',
      documents: [
        { id: `doc-${Date.now()}`, name: 'Passport & Identity Verification', status: 'Pending', uploadDate: '-', requiredDate: 'Next 7 Days' }
      ],
      tasks: [
        { id: `t-${Date.now()}-1`, text: 'Upload Identity Documents', completed: false, category: 'Documents' },
        { id: `t-${Date.now()}-2`, text: 'Complete Relocation Briefing Questionnaire', completed: false, category: 'Planning' }
      ],
      milestones: [
        { title: 'Initial HR & Mobility Kickoff', date: 'Upcoming', status: 'upcoming' }
      ],
      ...newRelocation
    };
    store.relocations.unshift(fullRequest);
    store.notifications.unshift({
      id: `n-${Date.now()}`,
      text: `New Relocation Request ${generatedId} submitted for ${fullRequest.employeeName}`,
      time: 'Just now',
      unread: true
    });
    this.saveStore(store);
    return fullRequest;
  }

  updateRelocationStage(id, newStage, newProgress) {
    const store = this.getStore();
    const idx = store.relocations.findIndex(r => r.id === id);
    if (idx !== -1) {
      store.relocations[idx].currentStage = newStage;
      if (newProgress !== undefined) store.relocations[idx].progress = newProgress;
      if (newStage === 'Completed') store.relocations[idx].status = 'Completed';
      this.saveStore(store);
    }
  }

  // Task Toggle
  toggleTask(relocationId, taskId) {
    const store = this.getStore();
    const rel = store.relocations.find(r => r.id === relocationId);
    if (rel) {
      const task = rel.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        this.saveStore(store);
      }
    }
  }

  // Add Document
  addDocument(relocationId, docName) {
    const store = this.getStore();
    const rel = store.relocations.find(r => r.id === relocationId);
    if (rel) {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: docName,
        status: 'Under Review',
        uploadDate: new Date().toISOString().split('T')[0],
        requiredDate: 'Submitted'
      };
      rel.documents.push(newDoc);
      this.saveStore(store);
      return newDoc;
    }
  }

  // Document Approval Status Update
  updateDocumentStatus(relocationId, docId, status) {
    const store = this.getStore();
    const rel = store.relocations.find(r => r.id === relocationId);
    if (rel) {
      const doc = rel.documents.find(d => d.id === docId);
      if (doc) {
        doc.status = status;
        this.saveStore(store);
      }
    }
  }

  // Messages
  getMessages() {
    return this.getStore().messages || [];
  }

  sendMessage(sender, text, role) {
    const store = this.getStore();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = { sender, text, time: timeStr, role };
    store.messages.push(msg);
    this.saveStore(store);
    return msg;
  }
}

window.mobilitiStore = new MobilitiStore();
