/**
 * PhonePe Clone - Storage Service
 * Handles all data persistence using localStorage
 */
class StorageService {
  constructor() {
    this.PREFIX = 'phonepe_';
    this.initDefaults();
  }

  // Core CRUD
  set(key, value) {
    try { localStorage.setItem(this.PREFIX + key, JSON.stringify(value)); return true; }
    catch(e) { console.error('Storage error:', e); return false; }
  }
  get(key) {
    try { const v = localStorage.getItem(this.PREFIX + key); return v ? JSON.parse(v) : null; }
    catch(e) { return null; }
  }
  remove(key) { localStorage.removeItem(this.PREFIX + key); }

  initDefaults() {
    if (!this.get('initialized')) {
      // User profile matching screenshots
      this.set('user', {
        name: 'Rahul Loyal',
        phone: '8572833129',
        maskedPhone: '+91 •••••• •9188',
        upiId: '8572833129@axl',
        bankAccounts: [
          { id: 'pnb', name: 'Punjab National Bank', short: 'PNB', lastFour: '1467', balance: 45230, icon: '🏦' },
          { id: 'shgb', name: 'Sarva Haryana Gramin Bank', short: 'SHGB', lastFour: '1467', balance: 12500, icon: '🏛️' }
        ],
        defaultBank: 'pnb'
      });

      // Transactions matching screenshots exactly
      const now = Date.now();
      this.set('transactions', [
        {
          id: 'T2610041604065942465929', type: 'sent', name: 'Amit pal',
          upiId: 'Q529411980@ybl', amount: 100, status: 'success',
          date: '2026-10-04T16:04:00+05:30',
          bankId: 'pnb', utr: '700209963974', note: ''
        },
        {
          id: 'T261004160406594265930', type: 'received', name: 'Rahul Loyal',
          upiId: 'rahul@ybl', amount: 100, status: 'success',
          date: new Date(now - 57*60*1000).toISOString(),
          bankId: 'pnb', utr: '700209963975', note: ''
        },
        {
          id: 'T261004160406594265931', type: 'sent', name: 'PU Canteen',
          upiId: 'pucanteen@upi', amount: 60, status: 'success',
          date: new Date(now - 24*60*60*1000).toISOString(),
          bankId: 'pnb', utr: '700209963976', note: 'Lunch'
        },
        {
          id: 'T261004160406594265932', type: 'received', name: 'Suman Devi',
          upiId: 'suman@ybl', amount: 60, status: 'success',
          date: new Date(now - 24*60*60*1000).toISOString(),
          bankId: 'pnb', utr: '700209963977', note: ''
        },
        {
          id: 'T261004160406594265933', type: 'sent', name: 'Rahul',
          upiId: 'rahul2@ptyes', amount: 1, status: 'failed',
          date: new Date('2026-09-19T23:15:00').toISOString(),
          bankId: 'pnb', utr: null, note: '',
          failReason: 'Insufficient Balance'
        }
      ]);

      this.set('recentContacts', [
        { name: 'Rahul', phone: '+91 •••••• •9188', upiId: 'XXXXXX9188@ptyes', initial: 'R', color: '#FF5722' },
        { name: 'Amit pal', phone: '+91 •••••• •1980', upiId: 'Q529411980@ybl', initial: 'A', color: '#4CAF50' },
        { name: 'PU Canteen', phone: '', upiId: 'pucanteen@upi', initial: 'P', color: '#2196F3' },
        { name: 'Suman Devi', phone: '', upiId: 'suman@ybl', initial: 'S', color: '#9C27B0' }
      ]);

      this.set('isLoggedIn', false); // Require login now
      this.set('initialized', true);
    }
  }

  // User
  getUser() { return this.get('user'); }
  isLoggedIn() { return this.get('isLoggedIn') === true; }
  login() { this.set('isLoggedIn', true); }
  logout() { this.set('isLoggedIn', false); }

  // Theme
  getTheme() { return this.get('theme') || 'dark'; }
  setTheme(theme) { return this.set('theme', theme); }

  // Transactions
  getTransactions() { return this.get('transactions') || []; }
  addTransaction(tx) {
    const txs = this.getTransactions();
    txs.unshift(tx);
    this.set('transactions', txs);
  }
  getTransactionById(id) { return this.getTransactions().find(t => t.id === id); }
  filterTransactions(query) {
    if (!query) return this.getTransactions();
    const q = query.toLowerCase();
    return this.getTransactions().filter(t =>
      t.name.toLowerCase().includes(q) || t.id.includes(q) || String(t.amount).includes(q)
    );
  }

  // Contacts
  getRecentContacts() { return this.get('recentContacts') || []; }
  addRecentContact(contact) {
    let contacts = this.getRecentContacts().filter(c => c.name !== contact.name);
    contacts.unshift(contact);
    if (contacts.length > 20) contacts = contacts.slice(0, 20);
    this.set('recentContacts', contacts);
  }

  exportTransactions() {
    const txs = this.getTransactions();
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Date,Type,Party,Amount,Status,UTR\n"
      + txs.map(t => `${t.id},${t.date},${t.type},${t.name},${t.amount},${t.status},${t.utr||''}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "PhonePe_Statement.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (window.appInst) window.appInst.showToast("Statement Downloaded!");
  }

  // Utility
  generateTxId() { return 'T' + Date.now() + String(Math.floor(Math.random()*1000000)).padStart(6,'0'); }
  generateUTR() { return '700' + String(Math.floor(Math.random()*1000000000)).padStart(9,'0'); }
  clearAll() {
    Object.keys(localStorage).filter(k => k.startsWith(this.PREFIX)).forEach(k => localStorage.removeItem(k));
    this.initDefaults();
  }
}
const storage = new StorageService();
