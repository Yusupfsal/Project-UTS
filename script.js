/**
 * AzrilWifi - Core JavaScript Interactivity
 * Handles: Mobile menu, Tab switching, Captive portal simulation,
 * Table search & filtering, QR modal, and Notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  initMobileNav();

  // 2. Table Filter & Search on paket.html
  initTableFilter();

  // 3. Captive Portal Interactivity on login.html
  initPortalLogin();

  // 4. Contact Form Simulation on kontak.html
  initContactForm();
});

/* ==========================================================================
   1. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      const isExpanded = mainNav.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('active');
      }
    });
  }
}

/* ==========================================================================
   2. TABLE FILTER & SEARCH (PAKET.HTML)
   ========================================================================== */
function initTableFilter() {
  const table = document.getElementById('paketTable');
  if (!table) return;

  const searchInput = document.getElementById('tableSearchInput');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const tableRows = table.querySelectorAll('tbody tr');
  const emptyState = document.getElementById('tableEmptyState');

  let activeCategory = 'all';
  let searchTerm = '';

  function applyFilters() {
    let visibleCount = 0;

    tableRows.forEach(row => {
      const category = row.getAttribute('data-category') || '';
      const rowText = row.innerText.toLowerCase();

      const matchesCategory = (activeCategory === 'all' || category === activeCategory);
      const matchesSearch = rowText.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Category Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
}

/* ==========================================================================
   3. CAPTIVE PORTAL LOGIN (LOGIN.HTML)
   ========================================================================== */
let countdownInterval = null;

function initPortalLogin() {
  const tabBtns = document.querySelectorAll('.portal-tab-btn');
  const tabPanes = document.querySelectorAll('.portal-tab-pane');
  const voucherForm = document.getElementById('voucherForm');
  const memberForm = document.getElementById('memberForm');
  const loginCard = document.getElementById('portalLoginCard');
  const connectedCard = document.getElementById('connectedCard');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const qrModalBtn = document.querySelectorAll('.open-qr-modal-btn');
  const qrModal = document.getElementById('qrModal');
  const closeQrModalBtn = document.getElementById('closeQrModal');
  const simulateScanBtn = document.getElementById('simulateScanBtn');

  // Tab switching (Voucher vs Member)
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // Voucher Login Form Submit
  if (voucherForm) {
    voucherForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const voucherInput = document.getElementById('voucherCode');
      const code = voucherInput ? voucherInput.value.trim() : '';

      if (!code) {
        alert('Silakan masukkan Kode Voucher Anda terlebih dahulu.');
        return;
      }

      const submitBtn = voucherForm.querySelector('button[type="submit"]');
      showConnectingState(submitBtn, () => {
        showConnectedScreen(`Voucher (${code.toUpperCase()})`, '24 Jam (Paket Harian)', '192.168.10.154');
      });
    });
  }

  // Member Login Form Submit
  if (memberForm) {
    memberForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('memberUsername').value.trim();
      const pass = document.getElementById('memberPassword').value.trim();

      if (!user || !pass) {
        alert('Silakan masukkan Username dan Password member Anda.');
        return;
      }

      const submitBtn = memberForm.querySelector('button[type="submit"]');
      showConnectingState(submitBtn, () => {
        showConnectedScreen(`Member (${user})`, '30 Hari (Unlimited)', '192.168.10.88');
      });
    });
  }

  // Disconnect button
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (connectedCard) connectedCard.style.display = 'none';
      if (loginCard) loginCard.style.display = 'block';

      if (voucherForm) voucherForm.reset();
      if (memberForm) memberForm.reset();
    });
  }

  // QR Code Modal
  qrModalBtn.forEach(btn => {
    btn.addEventListener('click', () => {
      if (qrModal) qrModal.classList.add('active');
    });
  });

  if (closeQrModalBtn && qrModal) {
    closeQrModalBtn.addEventListener('click', () => {
      qrModal.classList.remove('active');
    });
  }

  // Simulate scanning QR Code
  if (simulateScanBtn && qrModal) {
    simulateScanBtn.addEventListener('click', () => {
      simulateScanBtn.disabled = true;
      simulateScanBtn.innerText = 'Memindai QR Code...';

      setTimeout(() => {
        simulateScanBtn.disabled = false;
        simulateScanBtn.innerText = 'Simulasikan Scan Sukses';
        qrModal.classList.remove('active');
        showConnectedScreen('Auto-QR Login', '24 Jam (Smart Scan)', '192.168.10.199');
      }, 1500);
    });
  }

  function showConnectingState(button, onSuccess) {
    if (!button) return;
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      Menghubungkan ke Jaringan...
    `;

    setTimeout(() => {
      button.disabled = false;
      button.innerHTML = originalText;
      if (onSuccess) onSuccess();
    }, 1200);
  }

  function showConnectedScreen(userType, packageInfo, ipAddress) {
    if (loginCard) loginCard.style.display = 'none';
    if (connectedCard) {
      connectedCard.style.display = 'block';

      const typeEl = document.getElementById('connUserType');
      const pkgEl = document.getElementById('connPackage');
      const ipEl = document.getElementById('connIp');
      const timerEl = document.getElementById('connTimeRemaining');

      if (typeEl) typeEl.innerText = userType;
      if (pkgEl) pkgEl.innerText = packageInfo;
      if (ipEl) ipEl.innerText = ipAddress;

      // Start countdown simulation (23 hours 59 mins 50 secs)
      let secondsLeft = 24 * 3600 - 15;
      if (countdownInterval) clearInterval(countdownInterval);

      function updateTimer() {
        const hrs = Math.floor(secondsLeft / 3600);
        const mins = Math.floor((secondsLeft % 3600) / 60);
        const secs = secondsLeft % 60;
        if (timerEl) {
          timerEl.innerText = `${pad(hrs)} Jam ${pad(mins)} Menit ${pad(secs)} Detik`;
        }
        if (secondsLeft > 0) {
          secondsLeft--;
        } else {
          clearInterval(countdownInterval);
        }
      }

      function pad(num) {
        return num.toString().padStart(2, '0');
      }

      updateTimer();
      countdownInterval = setInterval(updateTimer, 1000);
    }
  }
}

/* ==========================================================================
   4. CONTACT FORM SIMULATION (KONTAK.HTML)
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cfName').value.trim();
    const phone = document.getElementById('cfPhone').value.trim();
    const message = document.getElementById('cfMessage').value.trim();

    if (!name || !phone || !message) {
      alert('Mohon lengkapi semua kolom formulir.');
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = 'Mengirim Pesan...';

    setTimeout(() => {
      alert(`Terima kasih, ${name}! Pesan Anda telah diterima oleh Admin AzrilWifi. Kami akan menghubungi Anda via WhatsApp di nomor ${phone}.`);
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
    }, 1000);
  });
}

// Global modal helper for ordering packages from table
window.orderPackage = function(packageName, price) {
  const confirmOrder = confirm(`Anda memilih: ${packageName} seharga ${price}.\n\nIngin membuka halaman Login & Masukkan Voucher sekarang?`);
  if (confirmOrder) {
    window.location.href = 'login.html';
  }
};
