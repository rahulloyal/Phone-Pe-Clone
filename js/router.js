/**
 * PhonePe Clone - SPA Router
 */
class Router {
  constructor() {
    this.currentPage = null;
    this.history = [];
    this.navPages = ['home', 'search', 'alerts', 'history'];
    this.publicPages = ['splash', 'login'];
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('DOMContentLoaded', () => {
      if (!window.location.hash || window.location.hash === '#login') {
        window.location.hash = '#home';
      } else {
        this.handleRoute();
      }
    });
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const [page, queryStr] = hash.split('?');
    const params = this.parseQuery(queryStr);

    // If requested route is login or splash when directly entering, send to home
    if (page === 'login') {
      this.navigate('home', true);
      return;
    }

    this.showPage(page, params);
  }

  navigate(page, replace = false, params = {}) {
    const query = Object.keys(params).length
      ? '?' + Object.entries(params).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      : '';
    if (replace) {
      window.location.replace(`#${page}${query}`);
    } else {
      window.location.hash = `#${page}${query}`;
    }
  }

  showPage(page, params = {}) {
    const pageEl = document.getElementById(`page-${page}`);
    if (!pageEl) {
      console.warn(`Page not found: page-${page}`);
      this.navigate('home', true);
      return;
    }

    // Track history
    if (this.history[this.history.length - 2] === page) {
      this.history.pop(); // Going back
    } else if (this.currentPage !== page) {
      this.history.push(page);
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });

    // Show target
    pageEl.style.display = 'block';
    requestAnimationFrame(() => pageEl.classList.add('active'));
    this.currentPage = page;

    // Update bottom nav
    this.updateNav(page);

    // Show/hide bottom nav
    const nav = document.getElementById('bottom-nav');
    if (nav) {
      nav.style.display = this.navPages.includes(page) || page === 'home' ? 'flex' : 'none';
      const qrItem = nav.querySelector('.qr-nav-item');
      if (qrItem) {
        qrItem.style.overflow = 'visible';
        qrItem.style.display = 'flex';
      }
    }

    // Dispatch page load event
    window.dispatchEvent(new CustomEvent('pageLoad', { detail: { page, params } }));

    // Scroll to top
    pageEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  updateNav(page) {
    document.querySelectorAll('#bottom-nav .nav-item').forEach(item => {
      const target = item.dataset.page;
      item.classList.toggle('active', target === page);
    });
  }

  goBack() {
    if (this.history.length > 1) {
      this.history.pop();
      const prev = this.history[this.history.length - 1];
      this.navigate(prev, true);
    } else {
      this.navigate('home', true);
    }
  }

  parseQuery(str) {
    if (!str) return {};
    const params = {};
    str.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return params;
  }

  getParams() {
    const hash = window.location.hash.slice(1);
    const q = hash.indexOf('?');
    return q >= 0 ? this.parseQuery(hash.slice(q + 1)) : {};
  }
}
const router = new Router();
