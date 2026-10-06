/**
 * PhonePe Clone - Payments Flow
 * Implements: Pay Screen -> Bank Sheet -> UPI PIN Pad -> Verified Animation & Sound -> Transaction Successful
 */
class PaymentFlow {
  constructor() {
    this.currentAmount = '';
    this.currentPayee = {
      name: '',
      upi: ''
    };
    this.currentBank = 'shgb';
    this.pin = '';
    this.init();
  }

  init() {
    window.addEventListener('pageLoad', (e) => {
      const { page, params } = e.detail;
      if (page === 'pay') this.setupPayPage(params || {});
      if (page === 'check-balance') this.setupUpiPin(params || {});
      if (page === 'tx-detail' || page === 'payment-success') this.setupTxDetail(params || {});
    });
  }

  // =========================================================================
  // 1. PAY SCREEN (Matching Image 2)
  // =========================================================================
  setupPayPage(params) {
    this.currentPayee.name = params.name || 'Verified Merchant';
    this.currentPayee.upi = params.upi || '';
    this.currentAmount = (params.amount ? String(params.amount) : '').replace(/[^0-9]/g, '');

    // Update Payee Card Details
    const nameEl = document.getElementById('pay-recipient-name');
    const upiEl = document.getElementById('pay-recipient-upi');
    const avatarEl = document.getElementById('pay-avatar-initial');

    if (nameEl) nameEl.textContent = this.currentPayee.name;
    if (upiEl) upiEl.textContent = this.currentPayee.upi;
    if (avatarEl) {
      const words = (this.currentPayee.name || 'Payee').trim().split(/\s+/);
      const initials = words.length >= 2 
        ? (words[0][0] + words[1][0]).toUpperCase() 
        : (words[0] ? words[0].slice(0, 2).toUpperCase() : 'VP');
      avatarEl.textContent = initials;
    }

    // Render formatted amount on screen
    this.updateAmountDisplay();

    // Bind Keypad Buttons
    const keypad = document.getElementById('phonepe-keypad');
    if (keypad) {
      keypad.querySelectorAll('.k-num-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          if (window.appInst) window.appInst.vibrate();
          const key = btn.dataset.key;
          this.handleKeypadInput(key);
        };
      });
    }

    // Keyboard physical listener
    this.bindPhysicalKeypad();

    // Proceed to Pay Button
    const proceedBtn = document.getElementById('btn-proceed-pay');
    if (proceedBtn) {
      proceedBtn.onclick = () => {
        this.openBankSheet();
      };
    }
  }

  handleKeypadInput(key) {
    if (key === 'backspace') {
      if (this.currentAmount.length > 0) {
        this.currentAmount = this.currentAmount.slice(0, -1);
      }
    } else if (key === 'proceed') {
      this.openBankSheet();
      return;
    } else if (key === '-' || key === ',' || key === '.' || key === 'space') {
      // Optional separator / ignore
      return;
    } else if (/^[0-9]$/.test(key)) {
      if (!this.currentAmount && key === '0') {
        return;
      }
      if (this.currentAmount.length < 8) {
        this.currentAmount += key;
      }
    }
    this.updateAmountDisplay();
  }

  bindPhysicalKeypad() {
    if (this._physicalKeyHandler) {
      window.removeEventListener('keydown', this._physicalKeyHandler);
    }
    this._physicalKeyHandler = (e) => {
      const payPage = document.getElementById('page-pay');
      if (!payPage || !payPage.classList.contains('active')) return;
      
      // Do not capture if typing in message input
      if (document.activeElement && document.activeElement.id === 'pay-message-input') return;

      if (/^[0-9]$/.test(e.key)) {
        this.handleKeypadInput(e.key);
      } else if (e.key === 'Backspace') {
        this.handleKeypadInput('backspace');
      } else if (e.key === 'Enter') {
        this.handleKeypadInput('proceed');
      }
    };
    window.addEventListener('keydown', this._physicalKeyHandler);
  }

  updateAmountDisplay() {
    const displayEl = document.getElementById('pay-amount-display');
    const inputHidden = document.getElementById('pay-amount-input');
    if (!this.currentAmount) {
      if (displayEl) displayEl.textContent = '';
      if (inputHidden) inputHidden.value = '';
    } else {
      const num = parseInt(this.currentAmount, 10);
      const formatted = !isNaN(num) ? num.toLocaleString('en-IN') : this.currentAmount;
      if (displayEl) displayEl.textContent = formatted;
      if (inputHidden) inputHidden.value = this.currentAmount;
    }
  }

  // =========================================================================
  // 2. BANK SELECTION BOTTOM SHEET (Matching Image 3)
  // =========================================================================
  openBankSheet() {
    const num = parseInt(this.currentAmount, 10);
    if (!num || num <= 0) {
      if (window.appInst) window.appInst.showToast("Please enter an amount");
      return;
    }
    const formattedAmt = '₹' + num.toLocaleString('en-IN');

    const sheet = document.getElementById('modal-bank-sheet');
    const totalEl = document.getElementById('sheet-total-payable');
    const rowEl = document.getElementById('sheet-row-amount');
    const btnEl = document.getElementById('sheet-btn-amount');
    const closeBtn = document.getElementById('btn-close-bank-sheet');
    const payBtn = document.getElementById('btn-sheet-pay');

    if (totalEl) totalEl.textContent = formattedAmt;
    if (rowEl) rowEl.textContent = formattedAmt;
    if (btnEl) btnEl.textContent = formattedAmt;

    if (sheet) {
      sheet.classList.add('active');
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        if (sheet) sheet.classList.remove('active');
      };
    }

    if (payBtn) {
      payBtn.onclick = () => {
        if (sheet) sheet.classList.remove('active');
        // Route to Image 4 (UPI PIN Screen)
        router.navigate('check-balance', false, {
          mode: 'pay',
          amount: num,
          name: this.currentPayee.name,
          upi: this.currentPayee.upi,
          bankId: 'shgb'
        });
      };
    }
  }

  // =========================================================================
  // 3. UPI PIN PAD SCREEN (Matching Image 4)
  // =========================================================================
  setupUpiPin(params) {
    const mode = params.mode || 'balance';
    const amount = parseInt(params.amount, 10) || parseInt(this.currentAmount, 10) || 0;
    const payeeName = params.name || this.currentPayee.name || 'Verified Merchant';
    const payeeUpi = params.upi || this.currentPayee.upi || '';
    const bankId = params.bankId || 'shgb';

    this.pin = '';

    // Update screen headers
    const accountBar = document.getElementById('pin-account-bar');
    if (accountBar) {
      accountBar.textContent = 'SAVINGS: Sarva Haryana Gramin Bank - 1467';
    }

    const infoText = document.getElementById('pin-info-text');
    if (infoText) {
      if (mode === 'pay') {
        infoText.textContent = `Paying ${payeeName} ₹${amount.toLocaleString('en-IN')}`;
      } else {
        infoText.textContent = 'You are checking your account balance';
      }
    }

    const updatePinDots = () => {
      const dots = document.querySelectorAll('#pin-circles-box .pin-circle-outline');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('filled', idx < this.pin.length);
      });
    };
    updatePinDots();

    // Bind virtual NPCI Keypad
    const keypadPanel = document.getElementById('pin-numeric-keypad');
    if (keypadPanel) {
      keypadPanel.querySelectorAll('.pin-pill-key').forEach(btn => {
        btn.onclick = () => {
          if (window.appInst) window.appInst.vibrate();
          const num = btn.dataset.num;

          if (btn.id === 'pin-btn-backspace' || btn.classList.contains('key-backspace')) {
            this.pin = this.pin.slice(0, -1);
          } else if (btn.id === 'pin-btn-check' || btn.classList.contains('key-check')) {
            if (this.pin.length >= 4) {
              this.handlePinSubmit(mode, amount, payeeName, payeeUpi, bankId);
            } else {
              if (window.appInst) window.appInst.showToast('Enter 4 to 6-digit UPI PIN');
            }
          } else if (num !== undefined) {
            if (this.pin.length < 6) {
              this.pin += num;
              // If typed 6 digits, automatically ready
            }
          }
          updatePinDots();
        };
      });
    }

    // Physical keyboard support for UPI PIN
    if (this._pinKeyHandler) {
      window.removeEventListener('keydown', this._pinKeyHandler);
    }
    this._pinKeyHandler = (e) => {
      const pinPage = document.getElementById('page-check-balance');
      if (!pinPage || !pinPage.classList.contains('active')) return;

      if (/^[0-9]$/.test(e.key)) {
        if (this.pin.length < 6) {
          this.pin += e.key;
          updatePinDots();
        }
      } else if (e.key === 'Backspace') {
        this.pin = this.pin.slice(0, -1);
        updatePinDots();
      } else if (e.key === 'Enter') {
        if (this.pin.length >= 4) {
          this.handlePinSubmit(mode, amount, payeeName, payeeUpi, bankId);
        } else {
          if (window.appInst) window.appInst.showToast('Enter 4 to 6-digit UPI PIN');
        }
      }
    };
    window.addEventListener('keydown', this._pinKeyHandler);
  }

  handlePinSubmit(mode, amount, payeeName, payeeUpi, bankId) {
    if (mode === 'pay') {
      this.executePaymentVerification(amount, payeeName, payeeUpi, bankId);
    } else {
      this.showBalanceModal(bankId);
    }
  }

  // =========================================================================
  // 4. PAYMENT VERIFICATION ANIMATION & SOUND PLAY
  // =========================================================================
  executePaymentVerification(amount, name, upi, bankId) {
    const overlay = document.getElementById('payment-verified-overlay');
    const phaseSpinner = document.getElementById('verified-phase-spinner');
    const phaseSuccess = document.getElementById('verified-phase-success');
    const titleEl = document.getElementById('verified-status-title');
    const subEl = document.getElementById('verified-status-sub');

    if (!overlay) return;

    // Reset overlay elements
    if (phaseSpinner) phaseSpinner.style.display = 'flex';
    if (phaseSuccess) phaseSuccess.style.display = 'none';
    if (titleEl) titleEl.textContent = 'Connecting securely to bank...';
    if (subEl) subEl.textContent = 'Please do not press back or close';

    overlay.classList.add('active');

    // Step 1: Connecting (1.1s)
    setTimeout(() => {
      // Step 2: Payment Verified! (Show Checkmark & Sound)
      if (phaseSpinner) phaseSpinner.style.display = 'none';
      if (phaseSuccess) phaseSuccess.style.display = 'flex';
      if (titleEl) titleEl.textContent = 'Payment Verified & Successful!';
      if (subEl) subEl.textContent = `Paid to ${name}`;

      // Play Sound
      this.playNotificationSound();

      // Create & store transaction
      const txId = 'T' + Date.now().toString().slice(0, 10) + Math.floor(1000000000 + Math.random()*9000000000);
      const utr = '700' + Math.floor(100000000 + Math.random()*900000000);
      const tx = {
        id: txId,
        type: 'sent',
        name: name,
        upiId: upi,
        amount: amount,
        status: 'success',
        date: new Date().toISOString(),
        bankId: bankId || 'shgb',
        bankName: 'Sarva Haryana Gramin Bank',
        accMask: '8105XXXXXX1467',
        utr: utr,
        note: ''
      };
      storage.addTransaction(tx);

      // Save recent contact
      storage.addRecentContact({
        name: name,
        phone: '',
        upiId: upi,
        initial: name.slice(0, 2).toUpperCase(),
        color: '#8b5cf6'
      });

      // Step 3: Transition to Screen 5 (Transaction Successful)
      setTimeout(() => {
        overlay.classList.remove('active');
        router.navigate('tx-detail', true, { id: txId });
      }, 1400);

    }, 1200);
  }

  playNotificationSound() {
    try {
      const audioEl = document.getElementById('phonepe-audio-player');
      if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(e => {
          console.warn('Audio play notice:', e);
          // Fallback to dynamic Audio object
          const audio = new Audio('Assets/phone_pe_notification.mp3');
          audio.play().catch(err => console.warn('Fallback audio notice:', err));
        });
      } else {
        const audio = new Audio('Assets/phone_pe_notification.mp3');
        audio.play().catch(e => console.warn('Dynamic audio notice:', e));
      }
    } catch(err) {
      console.warn('Audio notification error:', err);
    }
  }

  // =========================================================================
  // 5. TRANSACTION SUCCESSFUL SCREEN (Matching Image 5)
  // =========================================================================
  setupTxDetail(params) {
    let tx = storage.getTransactionById(params.id);
    if (!tx) {
      const txs = storage.getTransactions();
      tx = txs && txs.length ? txs[0] : null;
    }

    const name = tx ? tx.name : 'Amit pal';
    const upi = tx ? tx.upiId : 'Q529411980@ybl';
    const amount = tx ? tx.amount : 100;
    const txId = tx ? tx.id : 'T2610041604065942465929';
    const utr = tx ? tx.utr || '700209963974' : '700209963974';
    const dateObj = tx && tx.date ? new Date(tx.date) : new Date('2026-10-04T16:04:00+05:30');

    // Format Date & Time: 04:04 PM on 04 Oct 2026
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const dateStr = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    const formattedDateTime = `${timeStr} on ${dateStr}`;

    const formattedAmount = '₹' + Number(amount).toLocaleString('en-IN');

    // Populate Fields
    const dateEl = document.getElementById('txd-date');
    const nameEl = document.getElementById('txd-name');
    const upiEl = document.getElementById('txd-upi');
    const amountEl = document.getElementById('txd-amount');
    const txidEl = document.getElementById('txd-txid');
    const bankEl = document.getElementById('txd-bank');
    const bankAmtEl = document.getElementById('txd-bank-amount');
    const utrEl = document.getElementById('txd-utr');

    if (dateEl) dateEl.textContent = formattedDateTime;
    if (nameEl) nameEl.textContent = name;
    if (upiEl) upiEl.textContent = upi;
    if (amountEl) amountEl.textContent = formattedAmount;
    if (txidEl) txidEl.textContent = txId;
    if (bankEl) bankEl.textContent = '8105XXXXXX1467';
    if (bankAmtEl) bankAmtEl.textContent = formattedAmount;
    if (utrEl) utrEl.textContent = utr;

    // Trigger celebratory confetti
    if (window.appInst) window.appInst.showConfetti();
  }

  showBalanceModal(bankId) {
    const user = storage.getUser();
    const bank = user.bankAccounts.find(b => b.id === bankId) || user.bankAccounts[0];
    
    if (window.appInst) {
      window.appInst.showToast(`Available Balance: ₹${bank.balance.toLocaleString('en-IN')}`);
    }
    setTimeout(() => {
      router.navigate('home', true);
    }, 1200);
  }
}

const paymentFlow = new PaymentFlow();
window.paymentFlow = paymentFlow;
