// Dynamic viewport height helper for perfect mobile edge-to-edge fitting
function updateAppHeight() {
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${vh}px`);
}
window.addEventListener('resize', updateAppHeight);
window.addEventListener('orientationchange', updateAppHeight);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateAppHeight);
}
updateAppHeight();

class PhonePeApp {
  constructor() {
    this.init();
  }

  init() {
    updateAppHeight();
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    updateAppHeight();
    this.initTheme();
    this.bindNavigation();
    this.bindBackButtons();
    this.bindAllClickActions();
    this.initRipple();
    this.initHorizontalDrag();
    this.listenPageLoads();
    this.triggerGoldCoinsEntrance();
  }

  // ===== NAVIGATION =====
  bindNavigation() {
    // Bottom nav clicks
    document.querySelectorAll('#bottom-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page) router.navigate(page);
      });
    });
  }

  bindBackButtons() {
    // All back buttons
    document.querySelectorAll('[data-action="back"]').forEach(btn => {
      btn.addEventListener('click', () => router.goBack());
    });
  }

  bindAllClickActions() {
    // Service items on home page
    document.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', () => {
        const action = el.dataset.action;
        this.handleAction(action);
      });
    });
  }

  handleAction(action) {
    switch(action) {
      case 'to-mobile':
      case 'to-bank':
      case 'to-self':
        router.navigate('send-money');
        break;
      case 'check-balance':
        router.navigate('check-balance');
        break;
      case 'wallet':
        this.showToast('PhonePe Wallet: Active Balance ₹500.00');
        break;
      case 'my-qr':
        router.navigate('profile');
        break;
      default:
        this.showToast(`${action} - Coming soon!`);
    }
  }

  // ===== PAGE LOAD HANDLERS =====
  listenPageLoads() {
    window.addEventListener('pageLoad', (e) => {
      const { page, params } = e.detail;
      switch(page) {
        case 'splash': this.onSplash(); break;
        case 'login': this.onLogin(); break;
        case 'home': this.onHome(); break;
        case 'profile': this.onProfile(); break;
        case 'search': this.onSearch(); break;
        case 'alerts': this.onAlerts(); break;
        case 'history': this.onHistory(); break;
        case 'send-money': this.onSendMoney(); break;
        case 'pay': this.onPay(params); break;
        case 'payment-success': this.onPaymentSuccess(params); break;
        case 'payment-failed': this.onPaymentFailed(params); break;
        case 'tx-detail': this.onTxDetail(params); break;
        case 'chat': this.onChat(params); break;
        case 'check-balance': this.onCheckBalance(); break;
      }
    });
  }

  // SPLASH
  onSplash() {
    setTimeout(() => {
      router.navigate('home', true);
    }, 1200);
  }

  // LOGIN
  onLogin() {
    const mobileInput = document.getElementById('mobile-input');
    const proceedBtn = document.getElementById('btn-get-otp');
    const otpOverlay = document.getElementById('otp-overlay');

    if (!mobileInput || !proceedBtn) return;

    // Enable/disable proceed button
    mobileInput.addEventListener('input', () => {
      const valid = mobileInput.value.length === 10;
      proceedBtn.classList.toggle('disabled', !valid);
      proceedBtn.disabled = !valid;
    });

    proceedBtn.addEventListener('click', () => {
      if (mobileInput.value.length !== 10) return;
      // Show OTP overlay
      const displayEl = document.getElementById('otp-mobile-display');
      if (displayEl) displayEl.textContent = mobileInput.value;
      if (otpOverlay) {
        otpOverlay.classList.add('active');
        this.startOtpTimer();
        this.setupOtpInputs();
      }
    });
  }

  startOtpTimer() {
    let seconds = 30;
    const timerEl = document.getElementById('otp-timer');
    const interval = setInterval(() => {
      seconds--;
      if (timerEl) timerEl.textContent = `00:${String(seconds).padStart(2, '0')}`;
      if (seconds <= 0) clearInterval(interval);
    }, 1000);
  }

  setupOtpInputs() {
    const digits = document.querySelectorAll('.otp-digit');
    const verifyBtn = document.getElementById('btn-verify-otp');

    digits.forEach((input, i) => {
      input.value = '';
      input.addEventListener('input', (e) => {
        if (e.target.value && i < digits.length - 1) {
          digits[i + 1].focus();
        }
        // Check if all filled
        const allFilled = Array.from(digits).every(d => d.value.length === 1);
        if (allFilled) {
          // Auto-verify after short delay
          setTimeout(() => this.completeLogin(), 500);
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && i > 0) {
          digits[i - 1].focus();
        }
      });
    });

    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => this.completeLogin());
    }

    // Focus first
    setTimeout(() => digits[0]?.focus(), 300);
  }

  completeLogin() {
    storage.login();
    this.showToast('Welcome to PhonePe!');
    router.navigate('home', true);
  }

  // HOME
  onHome() {
    const user = storage.getUser();
    // Generate QR code on home page
    this.generateHomeQR(user);
    // Update UPI ID display
    const upiDisplay = document.getElementById('home-upi-id');
    if (upiDisplay) upiDisplay.textContent = user?.upiId || '';
    // Re-trigger opening entrance animation for gold coins
    this.triggerGoldCoinsEntrance();
  }

  triggerGoldCoinsEntrance() {
    const stack = document.getElementById('goldCoinsStack');
    if (!stack) return;
    stack.classList.remove('open-animated');
    // Force DOM reflow to restart CSS animations cleanly
    void stack.offsetWidth;
    stack.classList.add('open-animated');
  }

  handleGoldCoinsClick() {
    this.showToast('24K Pure Gold • 99.9% Purity • Live price tracking');
    this.triggerGoldCoinsEntrance();
  }

  generateHomeQR(user) {
    const container = document.getElementById('home-qr-target') || document.getElementById('my-qr-code');
    if (!container || !user || !window.QRCode) return;
    container.innerHTML = '';
    new QRCode(container, {
      text: `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.name)}`,
      width: 180, height: 180,
      colorDark: '#000000', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  // ===== THEME MANAGEMENT =====
  initTheme() {
    const savedTheme = storage.getTheme() || 'dark';
    this.applyTheme(savedTheme, false);
  }

  setTheme(theme) {
    this.applyTheme(theme, true);
  }

  applyTheme(theme, showToast = true) {
    const isLight = theme === 'light';
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
      document.getElementById('app-container')?.classList.add('light-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
      document.getElementById('app-container')?.classList.remove('light-theme');
    }

    storage.setTheme(theme);
    this.updateThemeUI(theme);

    if (showToast) {
      this.showToast(`${isLight ? '☀️ Light' : '🌙 Dark'} Theme applied`);
    }
  }

  updateThemeUI(theme) {
    const isLight = theme === 'light';
    const darkBtn = document.getElementById('theme-btn-dark');
    const lightBtn = document.getElementById('theme-btn-light');
    const darkCheck = document.getElementById('theme-check-dark');
    const lightCheck = document.getElementById('theme-check-light');

    if (darkBtn) darkBtn.classList.toggle('active', !isLight);
    if (lightBtn) lightBtn.classList.toggle('active', isLight);
    if (darkCheck) darkCheck.textContent = !isLight ? 'radio_button_checked' : 'radio_button_unchecked';
    if (lightCheck) lightCheck.textContent = isLight ? 'radio_button_checked' : 'radio_button_unchecked';
  }

  // ===== PROFILE PAGE =====
  onProfile() {
    const user = storage.getUser() || {
      name: 'Rahul Loyal',
      phone: '8572833129',
      upiId: '8572833129@axl'
    };

    // Update user info
    const nameEl = document.getElementById('profile-name');
    const phoneEl = document.getElementById('profile-phone');
    const upiEl = document.getElementById('profile-upi');
    const qrUpiVal = document.getElementById('profile-qr-upi-val');
    if (nameEl) nameEl.textContent = user.name;
    if (phoneEl) phoneEl.textContent = `+91 ${user.phone}`;
    if (upiEl) upiEl.textContent = user.upiId;
    if (qrUpiVal) qrUpiVal.textContent = user.upiId;

    // Render QR Code without camera access
    this.renderProfileQR(user);

    // Update theme UI state
    this.updateThemeUI(storage.getTheme());

    // Setup action buttons
    const dlBtn = document.getElementById('btn-profile-download-qr');
    const shareBtn = document.getElementById('btn-profile-share-qr');
    if (dlBtn) dlBtn.onclick = () => this.downloadProfileQR();
    if (shareBtn) shareBtn.onclick = () => this.shareProfileQR();
  }

  renderProfileQR(user) {
    const container = document.getElementById('profile-qr-code');
    if (!container || !user || !window.QRCode) return;
    container.innerHTML = '';
    new QRCode(container, {
      text: `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.name)}`,
      width: 180,
      height: 180,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  downloadProfileQR() {
    const container = document.getElementById('profile-qr-code');
    if (!container) return;
    const img = container.querySelector('img');
    const canvas = container.querySelector('canvas');
    const url = img ? img.src : (canvas ? canvas.toDataURL("image/png") : null);
    if (!url) return;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PhonePe_User_QR.png';
    a.click();
    this.showToast('QR Code saved to device');
  }

  async shareProfileQR() {
    const user = storage.getUser();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My PhonePe QR & UPI',
          text: `Pay ${user.name} via PhonePe UPI: ${user.upiId}`,
          url: `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.name)}`
        });
      } catch (e) {
        console.error('Share failed', e);
      }
    } else {
      this.copyToClipboard(user.upiId);
      this.showToast('UPI ID copied to share');
    }
  }

  // ===== HELP & SUPPORT MODAL =====
  openHelpModal() {
    const modal = document.getElementById('modal-help');
    if (modal) modal.classList.add('visible');
  }

  closeHelpModal() {
    const modal = document.getElementById('modal-help');
    if (modal) modal.classList.remove('visible');
  }

  showFaqAnswer(el) {
    el.classList.toggle('open');
  }

  callHelpline() {
    this.showToast('Calling 24x7 Support: 080-68727374');
  }

  openTicketModal() {
    this.showToast('No pending tickets. All transactions settled!');
  }

  // ===== TERMS & POLICIES MODAL =====
  openPolicyModal(type) {
    const modal = document.getElementById('modal-policy');
    const titleEl = document.getElementById('policy-modal-title');
    const bodyEl = document.getElementById('policy-modal-content');
    if (!modal || !titleEl || !bodyEl) return;

    const policies = {
      terms: {
        title: 'Terms & Conditions',
        html: `
          <div class="policy-doc-wrap">
            <div class="policy-badge-row"><span class="policy-badge">Updated Oct 2026</span><span class="policy-badge">NPCI Compliant</span></div>
            <h4>1. User Agreement</h4>
            <p>Welcome to PhonePe. By accessing or using our mobile application and unified payment services, you agree to be bound by these Terms of Service.</p>
            <h4>2. Unified Payments Interface (UPI)</h4>
            <p>PhonePe operates as a certified TPAP (Third-Party Application Provider) in partnership with sponsor banks under the BHIM UPI framework governed by National Payments Corporation of India (NPCI) and the Reserve Bank of India (RBI).</p>
            <h4>3. Transaction Limits & Security</h4>
            <p>Standard UPI transaction limits of ₹1,00,000 per day apply, subject to individual bank thresholds. Users must maintain confidentiality of their 4 or 6-digit UPI PIN.</p>
            <h4>4. Chargebacks & Disputes</h4>
            <p>All transaction queries and payment disputes will be processed within defined TAT under the automated dispute management system.</p>
          </div>
        `
      },
      privacy: {
        title: 'Privacy Policy',
        html: `
          <div class="policy-doc-wrap">
            <div class="policy-badge-row"><span class="policy-badge">256-bit AES Encryption</span><span class="policy-badge">Data Localization</span></div>
            <h4>1. Information We Collect</h4>
            <p>We collect device identifiers, registered phone numbers, and transactional metadata strictly necessary to execute financial settlements and ensure multi-factor authentication.</p>
            <h4>2. Data Security & Storage</h4>
            <p>All sensitive banking credentials, including debit card details and authentication sessions, are tokenized and stored in compliance with ISO 27001 and PCI-DSS Level 1 specifications.</p>
            <h4>3. No Third-Party Selling</h4>
            <p>PhonePe does not sell, rent, or trade your personal or financial data to third-party marketing entities.</p>
          </div>
        `
      },
      grievance: {
        title: 'Grievance Redressal Policy',
        html: `
          <div class="policy-doc-wrap">
            <div class="policy-badge-row"><span class="policy-badge">RBI Ombudsman Scheme</span><span class="policy-badge">Tier-1 Resolution</span></div>
            <h4>Level 1: 24x7 In-App Support</h4>
            <p>Submit a ticket through the Help Desk or call customer care at 080-68727374. Expected TAT: 24 hours.</p>
            <h4>Level 2: Principal Nodal Officer</h4>
            <p>If unresolved, email nodalofficer@phonepe.com with your transaction ID and UTR reference number.</p>
            <h4>Level 3: RBI Ombudsman</h4>
            <p>If the complaint remains unresolved beyond 30 days, users may approach the Banking Ombudsman under the Reserve Bank - Integrated Ombudsman Scheme, 2021.</p>
          </div>
        `
      },
      security: {
        title: 'Security & Safe Banking',
        html: `
          <div class="policy-doc-wrap">
            <div class="policy-badge-row"><span class="policy-badge">Fraud Shield</span><span class="policy-badge">Instant Lock</span></div>
            <h4>Crucial Safety Guidelines</h4>
            <ul>
              <li><strong>UPI PIN is only needed to SEND money:</strong> You never need to enter your UPI PIN to receive money.</li>
              <li><strong>Never share OTPs:</strong> PhonePe representatives will never ask for your SMS OTP, password, or card CVV.</li>
              <li><strong>Verify QR Codes:</strong> Always verify the payee name on screen before entering your UPI PIN.</li>
              <li><strong>Screen sharing warning:</strong> Never install remote desktop or screen share apps when requested by unknown callers.</li>
            </ul>
          </div>
        `
      }
    };

    const doc = policies[type] || policies.terms;
    titleEl.textContent = doc.title;
    bodyEl.innerHTML = doc.html;
    modal.classList.add('visible');
  }

  closePolicyModal() {
    const modal = document.getElementById('modal-policy');
    if (modal) modal.classList.remove('visible');
  }

  toggleBiometrics() {
    const toggle = document.getElementById('toggle-biometrics');
    if (toggle) {
      toggle.classList.toggle('active');
      const active = toggle.classList.contains('active');
      this.showToast(active ? 'Biometric screen lock enabled' : 'Biometric screen lock disabled');
    }
  }

  showLogoutModal() {
    this.showToast('You are currently logged in as Rahul Loyal');
  }

  // SEARCH
  onSearch() {
    // search input functionality will filter visible results
  }

  // ALERTS
  onAlerts() {
    // Alerts page is mostly static
  }

  // HISTORY
  onHistory() {
    this.renderHistory();
    // Search in history
    const searchInput = document.querySelector('#page-history .search-bar input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderHistory(e.target.value);
      });
    }
  }

  renderHistory(query = '') {
    const container = document.getElementById('history-list');
    if (!container) return;

    const transactions = query ? storage.filterTransactions(query) : storage.getTransactions();
    container.innerHTML = '';

    if (transactions.length === 0) {
      container.innerHTML = '<div class="empty-msg">No transactions found</div>';
      return;
    }

    // Group by month
    const groups = {};
    transactions.forEach(tx => {
      const d = new Date(tx.date);
      const key = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });

    Object.entries(groups).forEach(([month, txs]) => {
      // Month header
      const totalReceived = txs.filter(t => t.type === 'received' && t.status === 'success')
        .reduce((sum, t) => sum + t.amount, 0);
      const monthHeader = document.createElement('div');
      monthHeader.className = 'month-header';
      monthHeader.innerHTML = `<span>${month}</span><span class="text-green">+ ₹${totalReceived} ›</span>`;
      container.appendChild(monthHeader);

      // Transaction items
      txs.forEach(tx => {
        const isSent = tx.type === 'sent';
        const el = document.createElement('div');
        el.className = 'tx-item';
        el.onclick = () => router.navigate('tx-detail', false, { id: tx.id });

        const iconClass = isSent ? 'north_east' : 'south_west';
        const label = isSent ? 'Paid to' : 'Received from';
        const amountClass = isSent ? '' : 'credit';
        const amountPrefix = isSent ? '' : '+ ';
        const statusClass = tx.status === 'failed' ? 'text-red' : '';

        const bankLogoBadge = `<span style="background:#fff; color:#d32f2f; padding:2px 4px; border-radius:3px; font-weight:700; font-size:10px; display:inline-block; border:1px solid #ddd;">प</span>`;
        
        el.innerHTML = `
          <div class="tx-icon ${tx.status === 'failed' ? 'bg-red' : (isSent ? 'sent' : 'received')}">
            <span class="material-icons">${iconClass}</span>
          </div>
          <div class="tx-info">
            <div class="tx-label">${label}</div>
            <div class="tx-name" style="font-size:15px; font-weight:600;">${tx.name}</div>
            <div class="tx-time">${this.formatTime(tx.date)}</div>
          </div>
          <div class="tx-amount-col" style="text-align:right;">
            <div class="amount ${amountClass} ${statusClass}" style="font-size:16px; font-weight:700;">${amountPrefix}₹${tx.amount}</div>
            <div class="bank-label" style="display:flex; align-items:center; gap:4px; justify-content:flex-end; font-size:11px; color:#aaa; margin-top:2px;">
              <span>${isSent ? 'Debited from' : 'Credited to'}</span>
              ${bankLogoBadge}
            </div>
          </div>
        `;
        container.appendChild(el);
      });
    });
  }

  // SEND MONEY
  onSendMoney() {
    const contacts = storage.getRecentContacts();
    const listEl = document.getElementById('contacts-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    contacts.forEach(c => {
      const el = document.createElement('div');
      el.className = 'contact-item';
      el.onclick = () => router.navigate('pay', false, { name: c.name, upi: c.upiId || '' });
      el.innerHTML = `
        <div class="avatar md" style="background:${c.color}">${c.initial}</div>
        <div class="contact-info">
          <div class="contact-name">${c.name}</div>
          <div class="contact-phone text-muted">${c.phone || c.upiId || ''}</div>
        </div>
      `;
      listEl.appendChild(el);
    });
  }

  // PAY - this is handled mainly by payments.js but app.js inits it
  onPay(params) {
    // payments module handles this
  }

  // PAYMENT SUCCESS
  onPaymentSuccess(params) {
    router.navigate('tx-detail', true, params);
  }

  // PAYMENT FAILED
  onPaymentFailed(params) {
    const tx = storage.getTransactionById(params.id);
    if (!tx) return;
    const el = (id) => document.getElementById(id);
    if (el('failed-amount')) el('failed-amount').textContent = `₹${tx.amount}`;
    if (el('failed-recipient')) el('failed-recipient').textContent = tx.name;
    if (el('failed-reason')) el('failed-reason').textContent = tx.failReason || 'Transaction Failed';
  }

  // TX DETAIL
  onTxDetail(params) {
    if (window.paymentFlow) {
      window.paymentFlow.setupTxDetail(params);
    }
  }

  // CHAT
  onChat(params) {
    // Would build chat UI with contact's payment history
  }

  // CHECK BALANCE
  onCheckBalance() {
    // handled by payments.js
  }

  // ===== RIPPLE EFFECT =====
  initRipple() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.service-item, .nav-item, .btn, .tx-item, .contact-item, .dark-card-item, .offer-card, .suggestion-chip');
      if (!target) return;
      // Never apply ripple or overflow hidden to floating QR scanner button or its wrapper
      if (target.classList.contains('qr-nav-item') || target.closest('.qr-nav-item') || target.closest('.qr-fab-wrapper') || target.closest('.qr-fab')) return;
      
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      ripple.className = 'ripple-effect';
      
      const prevPosition = target.style.position;
      const prevOverflow = target.style.overflow;
      target.style.position = prevPosition || 'relative';
      target.style.overflow = 'hidden';
      target.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
        if (target.style.overflow === 'hidden') {
          target.style.overflow = prevOverflow || '';
        }
        if (!prevPosition) {
          target.style.position = '';
        }
      }, 600);
    });
  }

  // ===== HORIZONTAL SCROLL DRAG =====
  initHorizontalDrag() {
    document.querySelectorAll('.horizontal-scroll').forEach(slider => {
      let isDown = false, startX, scrollL;
      slider.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - slider.offsetLeft; scrollL = slider.scrollLeft; slider.style.cursor = 'grabbing'; });
      slider.addEventListener('mouseleave', () => { isDown = false; slider.style.cursor = 'grab'; });
      slider.addEventListener('mouseup', () => { isDown = false; slider.style.cursor = 'grab'; });
      slider.addEventListener('mousemove', e => { if(!isDown) return; e.preventDefault(); slider.scrollLeft = scrollL - (e.pageX - slider.offsetLeft - startX) * 1.5; });
    });
  }

  // ===== UTILITIES =====
  showToast(message, duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  showConfetti() {
    const colors = ['#6739B7', '#00C853', '#FF9800', '#E91E63', '#FFD700'];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDelay = Math.random() * 2 + 's';
      el.style.animationDuration = (2 + Math.random() * 2) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  }

  formatTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} mins ago`;
    if (hrs < 24) return `${hrs} hours ago`;
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatCurrency(amt) {
    return '₹' + Number(amt).toLocaleString('en-IN');
  }

  copyToClipboard(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => this.showToast('Copied to clipboard'))
        .catch(() => {
          this.fallbackCopy(text);
        });
    } else {
      this.fallbackCopy(text);
    }
  }

  fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast('Copied to clipboard');
    } catch(e) {
      this.showToast('Copied to clipboard');
    }
  }

  vibrate() {
    if (navigator.vibrate) navigator.vibrate(30);
  }
}

const appInst = new PhonePeApp();
window.app = appInst;
window.appInst = appInst;
