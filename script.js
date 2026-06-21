/* =========================================================
   CONFIGURATION: update these before going live
   ========================================================= */
const CONFIG = {
  GOOGLE_SCRIPT_URL: 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
  FB_PIXEL_ID: 'PASTE_YOUR_FACEBOOK_PIXEL_ID_HERE',

  // CPV Lab Pro: paste your campaign's tracking domain + campaign path.
  // CPV Lab typically passes a click id back via URL param (commonly "cpvclickid" or a custom name
  // you configure in your CPV Lab campaign). Update CPV_LAB_CLICK_PARAM to match your setup.
  CPV_LAB_ENABLED: true,
  CPV_LAB_CLICK_PARAM: 'cpvclickid',
  CPV_LAB_POSTBACK_URL: 'PASTE_YOUR_CPV_LAB_PRO_POSTBACK_URL_HERE',

  OFFER_BASE_URL: 'https://vaultmediainc10211905.o18.link/c',
  OFFER_PARAMS: {
    o: '21851460',
    m: '20197',
    a: '764129',
    mo: 'Prepop_to_Animation'
  },

  // Vault Media: aff_click_id should be your click/tracking ID (from CPV Lab),
  // sub_aff_id is your sub-affiliate ID. Fill these in before going live.
  AFF_CLICK_ID: 'PASTE_YOUR_AFF_CLICK_ID_HERE',
  SUB_AFF_ID: 'PASTE_YOUR_SUB_AFF_ID_HERE',

  REDIRECT_DELAY_MS: 2000
};

/* =========================================================
   US STATES
   ========================================================= */
const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois',
  'Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts',
  'Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota',
  'Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
  'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington',
  'West Virginia','Wisconsin','Wyoming'
];

function populateStates() {
  const select = document.getElementById('state');
  if (!select) return;
  US_STATES.forEach(state => {
    const opt = document.createElement('option');
    opt.value = state;
    opt.textContent = state;
    select.appendChild(opt);
  });
}

/* =========================================================
   UTM / CLICK PARAM CAPTURE
   ========================================================= */
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    fbclid: params.get('fbclid') || '',
    click_id: params.get(CONFIG.CPV_LAB_CLICK_PARAM) || '',
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || ''
  };
}

/* =========================================================
   FACEBOOK PIXEL
   ========================================================= */
function loadFacebookPixel() {
  if (!CONFIG.FB_PIXEL_ID || CONFIG.FB_PIXEL_ID.startsWith('PASTE_')) return;

  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', CONFIG.FB_PIXEL_ID);
  fbq('track', 'PageView');
}

function trackFacebookLead() {
  if (typeof fbq === 'function') {
    fbq('track', 'Lead');
  }
}

/* =========================================================
   CPV LAB PRO
   ========================================================= */
function fireCpvLabPostback(leadData) {
  if (!CONFIG.CPV_LAB_ENABLED) return;
  if (!CONFIG.CPV_LAB_POSTBACK_URL || CONFIG.CPV_LAB_POSTBACK_URL.startsWith('PASTE_')) return;

  const url = new URL(CONFIG.CPV_LAB_POSTBACK_URL);
  if (leadData.click_id) url.searchParams.set(CONFIG.CPV_LAB_CLICK_PARAM, leadData.click_id);
  url.searchParams.set('event', 'lead');

  fetch(url.toString(), { method: 'GET', mode: 'no-cors' }).catch(() => {});
}

/* =========================================================
   LEAD STORAGE (LocalStorage)
   ========================================================= */
function saveLeadLocally(leadData) {
  const leads = JSON.parse(localStorage.getItem('leads') || '[]');
  leads.push(leadData);
  localStorage.setItem('leads', JSON.stringify(leads));
}

function exportLeads() {
  const leads = JSON.parse(localStorage.getItem('leads') || '[]');
  if (leads.length === 0) {
    showToast('No leads to export.', 'error');
    return;
  }
  const headers = Object.keys(leads[0]);
  const rows = leads.map(lead => headers.map(h => `"${String(lead[h] ?? '').replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `leads-${Date.now()}.csv`;
  link.click();
}
window.exportLeads = exportLeads;

/* =========================================================
   GOOGLE SHEETS SUBMIT
   ========================================================= */
function sendToGoogleSheets(leadData) {
  if (!CONFIG.GOOGLE_SCRIPT_URL || CONFIG.GOOGLE_SCRIPT_URL.startsWith('PASTE_')) return;

  fetch(CONFIG.GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(leadData)
  }).catch(() => {});
}

/* =========================================================
   OFFER REDIRECT
   ========================================================= */
function buildOfferUrl(leadData) {
  const url = new URL(CONFIG.OFFER_BASE_URL);
  Object.entries(CONFIG.OFFER_PARAMS).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  url.searchParams.set('aff_sub1', leadData.firstName);
  url.searchParams.set('aff_sub2', leadData.lastName);
  url.searchParams.set('aff_sub3', leadData.state);
  url.searchParams.set('aff_click_id', leadData.click_id || CONFIG.AFF_CLICK_ID);
  url.searchParams.set('sub_aff_id', CONFIG.SUB_AFF_ID);
  return url.toString();
}

/* =========================================================
   TOAST NOTIFICATIONS
   ========================================================= */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/* =========================================================
   FORM SUBMISSION
   ========================================================= */
function initLeadForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const state = document.getElementById('state').value;

    if (!firstName || !lastName || !state) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    const queryParams = getQueryParams();
    const leadData = {
      firstName,
      lastName,
      state,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || '',
      ...queryParams
    };

    document.getElementById('loadingOverlay').classList.add('active');

    saveLeadLocally(leadData);
    sendToGoogleSheets(leadData);
    trackFacebookLead();
    fireCpvLabPostback(leadData);

    setTimeout(() => {
      window.location.href = buildOfferUrl(leadData);
    }, CONFIG.REDIRECT_DELAY_MS);
  });
}

/* =========================================================
   LIVE COUNTER ANIMATION
   ========================================================= */
function initLiveCounter() {
  const el = document.getElementById('liveCounter');
  if (!el) return;

  const base = 1200 + Math.floor(Math.random() * 300);
  let current = 0;

  const animate = () => {
    current += Math.ceil((base - current) / 12);
    el.textContent = current.toLocaleString();
    if (current < base) requestAnimationFrame(animate);
  };
  animate();

  setInterval(() => {
    const el2 = document.getElementById('liveCounter');
    if (!el2) return;
    const value = parseInt(el2.textContent.replace(/,/g, ''), 10) + Math.floor(Math.random() * 3);
    el2.textContent = value.toLocaleString();
  }, 8000);
}

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
}

/* =========================================================
   FAQ ACCORDION
   ========================================================= */
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(open => open.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* =========================================================
   EXIT INTENT POPUP
   ========================================================= */
function initExitIntent() {
  const popup = document.getElementById('exitPopup');
  if (!popup) return;

  let shown = false;

  document.addEventListener('mouseout', (e) => {
    if (shown) return;
    if (e.clientY < 10 && !sessionStorage.getItem('exitPopupShown')) {
      popup.classList.add('active');
      shown = true;
      sessionStorage.setItem('exitPopupShown', '1');
    }
  });

  document.getElementById('exitPopupClose').addEventListener('click', () => {
    popup.classList.remove('active');
  });

  document.getElementById('exitPopupCta').addEventListener('click', () => {
    popup.classList.remove('active');
    document.getElementById('searchCard')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('firstName')?.focus();
  });

  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.classList.remove('active');
  });
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  populateStates();
  loadFacebookPixel();
  initLeadForm();
  initLiveCounter();
  initScrollReveal();
  initFaqAccordion();
  initExitIntent();
});
