/**
 * PhonePe Clone - QR Scanner
 */
class QRScanner {
  constructor() {
    this.video = document.getElementById('qr-video');
    this.canvas = document.getElementById('qr-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.stream = null;
    this.scanning = false;
    this.torchOn = false;
    
    this.init();
  }

  init() {
    window.addEventListener('pageLoad', (e) => {
      const { page } = e.detail;
      if (page === 'scan') {
        this.setupScanPage();
        this.startCamera();
      } else {
        this.stopCamera();
      }
    });
  }

  setupScanPage() {
    // Torch Button
    const torchBtn = document.getElementById('btn-torch');
    if (torchBtn) {
      torchBtn.onclick = () => this.toggleTorch(torchBtn);
    }

    // Gallery Upload
    const galleryBtn = document.getElementById('btn-gallery');
    const fileInput = document.getElementById('gallery-input');
    if (galleryBtn && fileInput) {
      galleryBtn.onclick = () => fileInput.click();
      fileInput.onchange = (e) => this.handleGalleryUpload(e);
    }

    // Interactive Tap to Scan Simulation (Cycles PhonePe, Paytm, Google Pay, BHIM)
    const activeBox = document.getElementById('scanner-active-box');
    if (activeBox) {
      const demoQRs = [
        { name: 'Rahul Loyal', upi: '••••••9188@ptyes', amount: '1555', provider: 'PhonePe' },
        { name: 'Rahul Loyal', upi: '9876549188@paytm', amount: '1555', provider: 'Paytm' },
        { name: 'Rahul Loyal', upi: 'rahulloyal@okaxis', amount: '1555', provider: 'Google Pay' },
        { name: 'Rahul Loyal', upi: 'rahulloyal@upi', amount: '1555', provider: 'BHIM UPI' }
      ];
      let demoIndex = 0;
      activeBox.onclick = () => {
        const item = demoQRs[demoIndex % demoQRs.length];
        demoIndex++;
        if (window.appInst) {
          window.appInst.showToast(`${item.provider} QR Detected: ${item.name}`);
        }
        this.triggerSuccessfulScan(item);
      };
    }
  }

  async startCamera() {
    if (this.stream) return;
    if (!this.video || !this.canvas) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      this.video.srcObject = this.stream;
      this.video.setAttribute("playsinline", true);
      this.video.play();
      this.scanning = true;
      requestAnimationFrame(() => this.scanFrame());
    } catch (err) {
      console.warn("Camera not available or denied:", err);
      // Still fully interactive via tap on scanner box or gallery upload
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.scanning = false;
    this.torchOn = false;
    const torchBtn = document.getElementById('btn-torch');
    if (torchBtn) torchBtn.classList.remove('active');
  }

  scanFrame() {
    if (!this.scanning) return;
    if (this.video && this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.canvas.height = this.video.videoHeight;
      this.canvas.width = this.video.videoWidth;
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      if (window.jsQR) {
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        if (code) {
          this.handleScan(code.data);
          return;
        }
      }
    }
    requestAnimationFrame(() => this.scanFrame());
  }

  // =========================================================================
  // UNIVERSAL PAYMENT QR PARSER (Paytm, PhonePe, Google Pay, BHIM, etc.)
  // =========================================================================
  parsePaymentQR(rawData) {
    if (!rawData || typeof rawData !== 'string') {
      return { name: 'Rahul Loyal', upi: '••••••9188@ptyes', amount: '1555', provider: 'PhonePe' };
    }
    const str = rawData.trim();

    let pa = '';
    let pn = '';
    let am = '';
    let provider = 'UPI';

    // 1. Parse URI or query string (e.g. upi://pay?pa=...&pn=...)
    let params = null;
    if (/^[a-zA-Z0-9]+:\/\//i.test(str)) {
      const qIndex = str.indexOf('?');
      if (qIndex !== -1) {
        params = new URLSearchParams(str.slice(qIndex + 1));
      }
    } else if (str.startsWith('http://') || str.startsWith('https://')) {
      try {
        const u = new URL(str);
        params = u.searchParams;
      } catch(e) {
        if (str.includes('?')) params = new URLSearchParams(str.split('?')[1]);
      }
    } else if (str.includes('pa=') || str.includes('pn=')) {
      const q = str.includes('?') ? str.split('?')[1] : str;
      params = new URLSearchParams(q);
    }

    if (params) {
      pa = params.get('pa') || '';
      pn = params.get('pn') || '';
      am = params.get('am') || '';
    }

    // 2. Fallback: Search for standalone UPI ID (e.g. rahul@okaxis or 9876549188@paytm)
    if (!pa) {
      const upiRegex = /([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64})/i;
      const match = str.match(upiRegex);
      if (match) {
        pa = match[1];
      }
    }

    // Clean & decode parameters
    if (pn) {
      try {
        pn = decodeURIComponent(pn.replace(/\+/g, ' ')).trim();
      } catch(e) {}
    }
    if (pa) {
      try {
        pa = decodeURIComponent(pa.trim());
      } catch(e) {}
    }

    // If payee name was not provided, derive readable identity from UPI handle
    if (!pn && pa) {
      const handle = pa.split('@')[0];
      if (/^\d+$/.test(handle)) {
        pn = 'Verified Merchant';
      } else {
        pn = handle.split(/[._-]/)
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    }

    // Fallback identity matching Image 2
    if (!pn) pn = 'Rahul Loyal';
    if (!pa) pa = '••••••9188@ptyes';
    if (!am) am = '1555';

    // 3. Identify Payment App / Bank Provider
    const lowerPa = pa.toLowerCase();
    const lowerStr = str.toLowerCase();

    if (lowerPa.includes('@paytm') || lowerPa.includes('@ptsbi') || lowerPa.includes('@ptyes') || lowerStr.includes('paytm')) {
      provider = 'Paytm';
    } else if (lowerPa.includes('@ybl') || lowerPa.includes('@ibl') || lowerPa.includes('@axl') || lowerStr.includes('phonepe') || lowerStr.includes('phon.pe')) {
      provider = 'PhonePe';
    } else if (lowerPa.includes('@oksbi') || lowerPa.includes('@okhdfcbank') || lowerPa.includes('@okaxis') || lowerPa.includes('@okicici') || lowerStr.includes('gpay')) {
      provider = 'Google Pay';
    } else if (lowerPa.includes('@upi') || lowerStr.includes('bhim')) {
      provider = 'BHIM UPI';
    } else if (lowerPa.includes('bharatpe')) {
      provider = 'BharatPe';
    } else if (lowerPa.includes('@apl')) {
      provider = 'Amazon Pay';
    } else {
      provider = 'BHIM UPI';
    }

    return {
      name: pn,
      upi: pa,
      amount: am,
      provider: provider,
      raw: str
    };
  }

  handleScan(data) {
    this.stopCamera();
    const payeeData = this.parsePaymentQR(data);
    
    // Announce detected provider and payee name
    if (window.appInst) {
      window.appInst.showToast(`${payeeData.provider} QR Detected: ${payeeData.name}`);
    }

    this.triggerSuccessfulScan(payeeData);
  }

  triggerSuccessfulScan(payeeData) {
    this.stopCamera();
    const flash = document.getElementById('scanner-flash-indicator');
    if (flash) flash.classList.add('active');
    if (window.appInst) window.appInst.vibrate();

    setTimeout(() => {
      if (flash) flash.classList.remove('active');
      router.navigate('pay', false, payeeData);
    }, 350);
  }

  async toggleTorch(btn) {
    if (!this.stream) return;
    const track = this.stream.getVideoTracks()[0];
    if (!track) return;
    const caps = track.getCapabilities();
    if (!caps.torch) {
      if (appInst) appInst.showToast("Flashlight not supported on this device");
      return;
    }
    
    this.torchOn = !this.torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: this.torchOn }]
      });
      btn.classList.toggle('active', this.torchOn);
    } catch (e) {
      console.error(e);
    }
  }

  handleGalleryUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize resolution for jsQR detection
        let w = img.width;
        let h = img.height;
        const maxDim = 1000;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx.drawImage(img, 0, 0, w, h);
        const imageData = this.ctx.getImageData(0, 0, w, h);
        
        if (window.jsQR) {
          const code = jsQR(imageData.data, w, h, { inversionAttempts: "attemptBoth" });
          if (code) {
            this.handleScan(code.data);
            return;
          }
        }
        if (window.appInst) {
          window.appInst.showToast("No QR detected in image. Tap scanner box to simulate.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  generateMyQR() {
    const container = document.getElementById('myqr-render');
    const user = storage.getUser();
    if (!container || !user || !window.QRCode) return;
    container.innerHTML = '';
    
    // Create text elements
    const nameEl = document.getElementById('myqr-name');
    const upiEl = document.getElementById('myqr-upi');
    if (nameEl) nameEl.textContent = user.name;
    if (upiEl) upiEl.textContent = user.upiId;

    new QRCode(container, {
      text: `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.name)}`,
      width: 250, height: 250,
      colorDark: '#000000', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }
  
  downloadQR() {
    const container = document.getElementById('myqr-render');
    if (!container) return;
    const img = container.querySelector('img');
    const canvas = container.querySelector('canvas');
    const url = img ? img.src : (canvas ? canvas.toDataURL("image/png") : null);
    if (!url) return;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PhonePe_MyQR.png';
    a.click();
    if (appInst) appInst.showToast("QR Downloaded");
  }
  
  async shareQR() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My PhonePe QR',
          text: `Pay me via UPI: ${storage.getUser().upiId}`,
          url: `upi://pay?pa=${storage.getUser().upiId}`
        });
      } catch (e) {
        console.error('Share failed', e);
      }
    } else {
      if (appInst) appInst.showToast("Sharing not supported");
    }
  }
}

const qrScanner = new QRScanner();
