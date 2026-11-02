/**
 * TIVARA — LUXURY INTERACTIVE CONTROLLER
 * Mega Menus, Mobile Accordions, Hero Slider & Client Drawers
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. PRIMARY CATEGORY NAVIGATION & MEGA MENU CONTROLLER
  // =========================================================================
  const navItemsWithMega = document.querySelectorAll('.nav-item.has-mega-menu');
  let megaTimeout = null;

  // Active Category Manager
  function setActivePrimaryCategory(targetHref) {
    if (!targetHref) return;
    const cleanHash = targetHref.startsWith('#') ? targetHref : ('#' + (targetHref.split('#')[1] || ''));
    navItemsWithMega.forEach((item) => {
      const link = item.querySelector('.nav-link');
      if (link && (link.getAttribute('href') === cleanHash || cleanHash.includes(link.getAttribute('href').replace('#', '')))) {
        item.classList.add('active-category');
        link.setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('active-category');
        if (link) link.removeAttribute('aria-current');
      }
    });
  }
  window.setActivePrimaryCategory = setActivePrimaryCategory;

  // Set initial active state based on URL hash or default to first category (KURTIS)
  if (window.location.hash) {
    setActivePrimaryCategory(window.location.hash);
  } else if (navItemsWithMega.length > 0) {
    navItemsWithMega[0].classList.add('active-category');
    const firstLink = navItemsWithMega[0].querySelector('.nav-link');
    if (firstLink) firstLink.setAttribute('aria-current', 'page');
  }

  window.addEventListener('hashchange', () => {
    setActivePrimaryCategory(window.location.hash);
  });

  navItemsWithMega.forEach((item) => {
    const link = item.querySelector('.nav-link');

    // Hover Enter
    item.addEventListener('mouseenter', () => {
      if (megaTimeout) clearTimeout(megaTimeout);
      navItemsWithMega.forEach((other) => {
        if (other !== item) {
          other.classList.remove('active');
          const otherLink = other.querySelector('.nav-link');
          if (otherLink) otherLink.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.add('active');
      if (link) link.setAttribute('aria-expanded', 'true');
    });

    // Hover Leave with slight delay for smooth mouse movement
    item.addEventListener('mouseleave', () => {
      megaTimeout = setTimeout(() => {
        item.classList.remove('active');
        if (link) link.setAttribute('aria-expanded', 'false');
      }, 200);
    });

    // Direct Category Link Click Handling
    if (link) {
      link.addEventListener('click', (e) => {
        const targetHref = link.getAttribute('href');
        setActivePrimaryCategory(targetHref);

        if (targetHref && targetHref.startsWith('#')) {
          const targetEl = document.querySelector(targetHref) || document.getElementById('shop-by-category');
          if (targetEl) {
            e.preventDefault();
            // Close mega menu dropdown smoothly upon selection
            item.classList.remove('active');
            link.setAttribute('aria-expanded', 'false');
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', targetHref);
          }
        }
      });

      // Keyboard Accessibility: Escape key closes mega menu
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && item.classList.contains('active')) {
          item.classList.remove('active');
          link.setAttribute('aria-expanded', 'false');
          link.focus();
        }
      });
    }
  });

  // Close mega menu on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item.has-mega-menu')) {
      navItemsWithMega.forEach((item) => {
        item.classList.remove('active');
        const link = item.querySelector('.nav-link');
        if (link) link.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // =========================================================================
  // 2. MOBILE ACCORDION CATEGORY NAVIGATION
  // =========================================================================
  const accordionTriggers = document.querySelectorAll('.mobile-accordion-trigger');

  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const parentItem = trigger.closest('.mobile-accordion-item');
      const panel = parentItem ? parentItem.querySelector('.mobile-accordion-panel') : null;
      if (!panel) return;
      const isAlreadyActive = trigger.classList.contains('active');

      accordionTriggers.forEach((otherTrigger) => {
        if (otherTrigger !== trigger) {
          otherTrigger.classList.remove('active');
          const otherPanel = otherTrigger.closest('.mobile-accordion-item') ? otherTrigger.closest('.mobile-accordion-item').querySelector('.mobile-accordion-panel') : null;
          if (otherPanel) otherPanel.style.maxHeight = null;
        }
      });

      if (!isAlreadyActive) {
        trigger.classList.add('active');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        trigger.classList.remove('active');
        panel.style.maxHeight = null;
      }
    });
  });

  // =========================================================================
  // 3. HERO SLIDER CONTROLLER
  // =========================================================================
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.pagination-dot');
  const prevBtn = document.querySelector('.hero-nav-arrow.prev-arrow');
  const nextBtn = document.querySelector('.hero-nav-arrow.next-arrow');
  const sliderSection = document.querySelector('.hero-slider-section');

  let currentSlide = 0;
  let slideInterval = null;
  const slideDuration = 6500;

  function resetPillProgress(dot) {
    if (!dot) return;
    const progress = dot.querySelector('.pill-progress');
    if (progress) {
      progress.style.animation = 'none';
      void progress.offsetWidth; // trigger reflow
      progress.style.animation = '';
    }
  }

  function goToSlide(index) {
    if (index === currentSlide) return;
    resetPillProgress(dots[currentSlide]);
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].setAttribute('aria-selected', 'false');
    currentSlide = (index + slides.length) % slides.length;
    resetPillProgress(dots[currentSlide]);
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].setAttribute('aria-selected', 'true');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function startAutoplay() {
    stopAutoplay();
    if (prefersReducedMotion) return;
    if (sliderSection) sliderSection.classList.remove('paused');
    slideInterval = setInterval(nextSlide, slideDuration);
  }

  function stopAutoplay() {
    if (sliderSection) sliderSection.classList.add('paused');
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      startAutoplay();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      startAutoplay();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      startAutoplay();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      startAutoplay();
    }
  });

  if (sliderSection) {
    sliderSection.addEventListener('mouseenter', stopAutoplay);
    sliderSection.addEventListener('mouseleave', startAutoplay);
  }

  // Touch Swipe for Mobile & Tablet
  let touchStartX = 0;
  let touchEndX = 0;

  if (sliderSection) {
    sliderSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const threshold = 45;
    if (touchEndX < touchStartX - threshold) {
      nextSlide();
      startAutoplay();
    }
    if (touchEndX > touchStartX + threshold) {
      prevSlide();
      startAutoplay();
    }
  }

  startAutoplay();

  // =========================================================================
  // 4. MODALS & DRAWERS (COUNTRY SELECTOR, SEARCH, CART, ACCOUNT)
  // =========================================================================
  const backdrop = document.getElementById('drawerBackdrop');
  
  // Country Selector Modal
  const countryBtn = document.getElementById('countrySelectorBtn');
  const countryModal = document.getElementById('countryModal');
  const countryCloseBtn = document.getElementById('countryCloseBtn');
  const countryOptions = document.querySelectorAll('.country-option');
  const currentCountryLabel = document.getElementById('currentCountryLabel');

  function openCountryModal() {
    backdrop.classList.add('active');
    countryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCountryModal() {
    countryModal.classList.remove('active');
    checkBackdropState();
  }

  window.openCountryModal = openCountryModal;

  if (countryBtn) countryBtn.addEventListener('click', openCountryModal);
  if (countryCloseBtn) countryCloseBtn.addEventListener('click', closeCountryModal);

  countryOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      countryOptions.forEach((o) => o.classList.remove('selected'));
      opt.classList.add('selected');
      const countryName = opt.getAttribute('data-country');
      const currencySymbol = opt.getAttribute('data-currency');
      if (currentCountryLabel) {
        currentCountryLabel.textContent = `Select Country/Region: ${countryName} ${currencySymbol} ⌵`;
      }
      closeCountryModal();
      showToast(`Region set to ${countryName} (${currencySymbol})`);
    });
  });

  // Search Drawer & Live Catalog Search
  const searchBtn = document.getElementById('searchBtn');
  const searchModal = document.getElementById('searchModal');
  const searchCloseBtn = document.getElementById('searchCloseBtn');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const searchSubmitBtn = document.getElementById('searchSubmitBtn');
  const searchResultsWrapper = document.getElementById('searchResultsWrapper');
  const searchResultsCount = document.getElementById('searchResultsCount');
  const searchResultsGrid = document.getElementById('searchResultsGrid');
  const searchTags = document.querySelectorAll('.search-tag');

  let searchDebounceTimer = null;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function executeSearch(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      if (searchResultsWrapper) searchResultsWrapper.style.display = 'none';
      if (searchClearBtn) searchClearBtn.style.display = 'none';
      return;
    }

    if (searchClearBtn) searchClearBtn.style.display = 'flex';

    // Search across TIVARA_PRODUCTS database
    const matches = [];
    const catalog = window.TIVARA_PRODUCTS || (typeof TIVARA_PRODUCTS !== 'undefined' ? TIVARA_PRODUCTS : {});
    for (const id in catalog) {
      const p = catalog[id];
      const nameMatch = p.name && p.name.toLowerCase().includes(q);
      const catMatch = p.category && p.category.toLowerCase().includes(q);
      const descMatch = p.description && p.description.toLowerCase().includes(q);
      if (nameMatch || catMatch || descMatch) {
        matches.push(p);
      }
    }

    if (!searchResultsWrapper || !searchResultsGrid) return;
    searchResultsWrapper.style.display = 'block';

    if (matches.length === 0) {
      if (searchResultsCount) searchResultsCount.textContent = '0 STYLES FOUND';
      searchResultsGrid.innerHTML = `
        <div class="search-empty-state" style="grid-column: 1 / -1;">
          <p class="search-empty-title">No matching styles found for "${escapeHtml(query)}"</p>
          <p class="search-empty-subtitle">Explore our popular categories above or try searching for "Anarkali", "Sharara", "Kurta", or "Co-ord".</p>
        </div>
      `;
      return;
    }

    if (searchResultsCount) {
      searchResultsCount.textContent = `${matches.length} STYLE${matches.length === 1 ? '' : 'S'} FOUND FOR "${escapeHtml(query)}"`;
    }

    searchResultsGrid.innerHTML = matches.map(p => `
      <div class="search-result-card" data-product-id="${p.id}" tabindex="0" role="button" aria-label="View ${escapeHtml(p.name)}">
        <div class="search-result-img-box">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" class="search-result-img" loading="lazy">
        </div>
        <div class="search-result-info">
          <span class="search-result-cat">${escapeHtml(p.category)}</span>
          <h4 class="search-result-title">${escapeHtml(p.name)}</h4>
          <div class="search-result-price-row">
            <span class="search-result-price">${p.price}</span>
            <span class="search-result-mrp">${p.mrp}</span>
            <span class="search-result-discount">${p.discount}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Attach click and keyboard listeners to cards
    searchResultsGrid.querySelectorAll('.search-result-card').forEach(card => {
      card.addEventListener('click', () => {
        const pid = card.getAttribute('data-product-id');
        closeSearch();
        if (window.openQuickView) {
          window.openQuickView(pid);
        }
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          card.click();
        }
      });
    });
  }

  function openSearch() {
    backdrop.classList.add('active');
    searchModal.classList.add('active');
    searchModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (searchInput) {
      searchInput.focus({ preventScroll: true });
      if (searchInput.value.trim()) {
        executeSearch(searchInput.value);
      }
    }
    requestAnimationFrame(() => {
      if (searchInput && document.activeElement !== searchInput) {
        searchInput.focus({ preventScroll: true });
      }
    });
  }

  function closeSearch() {
    searchModal.classList.remove('active');
    checkBackdropState();
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        executeSearch(e.target.value);
      }, 120);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch(searchInput.value);
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      executeSearch('');
    });
  }

  if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener('click', () => {
      if (searchInput) executeSearch(searchInput.value);
    });
  }

  searchTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const query = tag.getAttribute('data-query') || tag.textContent.trim();
      if (searchInput) {
        searchInput.value = query;
        searchInput.focus();
      }
      executeSearch(query);
    });
  });

  // Cart / Bag Drawer
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartCloseBtn = document.getElementById('cartCloseBtn');

  function openCart() {
    renderCartDrawer();
    backdrop.classList.add('active');
    cartDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('active');
    checkBackdropState();
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);

  // Account Drawer
  const accountBtn = document.getElementById('accountBtn');
  const accountDrawer = document.getElementById('accountDrawer');
  const accountCloseBtn = document.getElementById('accountCloseBtn');

  function openAccount() {
    backdrop.classList.add('active');
    accountDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAccount() {
    accountDrawer.classList.remove('active');
    checkBackdropState();
  }

  if (accountBtn) accountBtn.addEventListener('click', openAccount);
  if (accountCloseBtn) accountCloseBtn.addEventListener('click', closeAccount);

  // Wishlist
  const wishlistBtn = document.getElementById('wishlistBtn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      showToast('Wishlist: You have 0 saved atelier pieces.');
    });
  }

  // Mobile Drawer
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');

  function openMobileNav() {
    backdrop.classList.add('active');
    mobileDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileDrawer.classList.remove('active');
    checkBackdropState();
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileNav);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileNav);

  function closeAllDrawers() {
    if (countryModal) countryModal.classList.remove('active');
    if (searchModal) searchModal.classList.remove('active');
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (accountDrawer) accountDrawer.classList.remove('active');
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    const qvModal = document.getElementById('quickViewModal');
    if (qvModal) qvModal.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeAllDrawers);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDrawers();
      navItemsWithMega.forEach((item) => item.classList.remove('active'));
    }
  });

  function checkBackdropState() {
    const isAnyActive = 
      (countryModal && countryModal.classList.contains('active')) ||
      (searchModal && searchModal.classList.contains('active')) ||
      (cartDrawer && cartDrawer.classList.contains('active')) ||
      (accountDrawer && accountDrawer.classList.contains('active')) ||
      (mobileDrawer && mobileDrawer.classList.contains('active'));
      
    if (!isAnyActive) {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // =========================================================================
  // 5. TOAST NOTIFICATION UTILITY
  // =========================================================================
  const toast = document.getElementById('tivaraToast');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.add('active');
    
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3500);
  }

  window.tivaraToast = showToast;

  // =========================================================================
  // 6. SECTION 06: NEW ARRIVALS CAROUSEL & PRODUCT INTERACTIONS
  // =========================================================================
  const track = document.getElementById('newArrivalsTrack');
  const newArrivalsPrevBtn = document.getElementById('newArrivalsPrev');
  const newArrivalsNextBtn = document.getElementById('newArrivalsNext');
  const dotsContainer = document.getElementById('newArrivalsDots');
  const wishlistBadge = document.querySelector('#wishlistBtn .icon-badge');
  const cartBadge = document.querySelector('#cartBtn .icon-badge');
  let wishlistCount = 0;
  let cartCount = 0;

  // Carousel Arrow Scrolling
  function getScrollAmount() {
    if (!track) return 320;
    const card = track.querySelector('.product-card');
    if (!card) return 320;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 24;
    return (card.offsetWidth + gap);
  }

  if (newArrivalsPrevBtn && track) {
    newArrivalsPrevBtn.addEventListener('click', () => {
      const amount = getScrollAmount();
      track.scrollBy({ left: -amount, behavior: 'smooth' });
    });
  }

  if (newArrivalsNextBtn && track) {
    newArrivalsNextBtn.addEventListener('click', () => {
      const amount = getScrollAmount();
      track.scrollBy({ left: amount, behavior: 'smooth' });
    });
  }

  // Carousel Pagination Dots Synchronization
  if (track && dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.carousel-page-dot');
    
    function updateActiveDot() {
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      const progress = track.scrollLeft / maxScroll;
      const dotIndex = Math.min(dots.length - 1, Math.round(progress * (dots.length - 1)));
      dots.forEach((dot, idx) => {
        const isActive = idx === dotIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    track.addEventListener('scroll', updateActiveDot, { passive: true });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const maxScroll = track.scrollWidth - track.clientWidth;
        const targetScroll = (maxScroll / (dots.length - 1)) * idx;
        track.scrollTo({ left: targetScroll, behavior: 'smooth' });
      });
    });
  }

  // Wishlist Toggle Handler
  window.toggleWishlist = function(btn, productName) {
    btn.classList.toggle('active');
    const isAdded = btn.classList.contains('active');
    
    if (isAdded) {
      wishlistCount++;
      showToast(`${productName} added to your Wishlist`);
    } else {
      wishlistCount = Math.max(0, wishlistCount - 1);
      showToast(`${productName} removed from Wishlist`);
    }
    
    if (wishlistBadge) {
      wishlistBadge.textContent = wishlistCount;
    }
  };

  // Swatch Selector Handler
  window.selectSwatch = function(swatchBtn) {
    const parent = swatchBtn.closest('.product-swatches, .quickview-swatch-list');
    if (!parent) return;
    parent.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    swatchBtn.classList.add('active');
    const colorTitle = swatchBtn.getAttribute('title') || swatchBtn.getAttribute('aria-label');
    if (colorTitle) {
      const label = document.getElementById('qvSelectedColor');
      if (label && parent.classList.contains('quickview-swatch-list')) {
        label.textContent = colorTitle;
      }
    }
  };

  // TIVARA Product Catalog Database
  const TIVARA_PRODUCTS = {
    'prod-1': {
      id: 'prod-1',
      name: 'Ivory Floral Suit',
      category: 'SUIT SETS',
      price: '₹2,499',
      mrp: '₹4,999',
      discount: '50% OFF',
      image: 'assets/images/prod-1-ivory-floral-suit.jpg',
      description: 'Artisanal ivory suit ensemble hand-embroidered with delicate pastel floral threadwork on pure Chanderi silk. Accompanied by a scalloped sheer organza dupatta and matching straight-cut trousers.',
      colors: [
        { name: 'Ivory White', hex: '#F5F2EB' },
        { name: 'Warm Sand', hex: '#E8D8C8' },
        { name: 'Champagne Gold', hex: '#C6A45D' }
      ]
    },
    'prod-2': {
      id: 'prod-2',
      name: 'Pastel Pink Kurta Set',
      category: 'KURTA SETS',
      price: '₹1,999',
      mrp: '₹3,999',
      discount: '50% OFF',
      image: 'assets/images/prod-2-pastel-pink-kurta.jpg',
      description: 'Graceful pastel blush kurta tailored in breathable handspun cotton-silk, embellished with fine sequin highlights and delicate hand-embroidery along the yoke and cuffs.',
      colors: [
        { name: 'Pastel Pink', hex: '#E8C5C8' },
        { name: 'Blush White', hex: '#F7EBE8' },
        { name: 'Lilac Mist', hex: '#C8A2C8' }
      ]
    },
    'prod-3': {
      id: 'prod-3',
      name: 'Blue Embroidered Suit',
      category: 'SUIT SETS',
      price: '₹3,299',
      mrp: '₹5,499',
      discount: '40% OFF',
      image: 'assets/images/prod-3-blue-embroidered-suit.jpg',
      description: 'Regal sapphire blue festive suit adorned with rich antique golden zardozi embroidery and delicate resham work. Features a flared silhouette paired with matching embroidered trousers.',
      colors: [
        { name: 'Royal Sapphire', hex: '#2B4C7E' },
        { name: 'Midnight Navy', hex: '#1A2F4C' },
        { name: 'Powder Blue', hex: '#6082B6' }
      ]
    },
    'prod-4': {
      id: 'prod-4',
      name: 'Beige Ethnic Co-ord',
      category: 'CO-ORD SETS',
      price: '₹2,199',
      mrp: '₹3,999',
      discount: '45% OFF',
      image: 'assets/images/prod-4-beige-ethnic-coord.jpg',
      description: 'Modern ethnic fusion twin set crafted in textured raw silk. Features a tailored peplum tunic with hand-knotted tassels and relaxed wide-leg cigarette trousers.',
      colors: [
        { name: 'Beige Sand', hex: '#D8C3A5' },
        { name: 'Warm Taupe', hex: '#8E8D8A' },
        { name: 'Alabaster', hex: '#E0D7C6' }
      ]
    },
    'prod-5': {
      id: 'prod-5',
      name: 'Rose Pink Anarkali',
      category: 'SUIT SETS',
      price: '₹3,499',
      mrp: '₹5,999',
      discount: '42% OFF',
      image: 'assets/images/prod-5-rose-pink-anarkali.jpg',
      description: 'Majestic 32-kali flared Anarkali in blooming rose pink georgette. Showcases intricate gota-patti border work, a deep V-neckline, and an ethereal sheer dupatta.',
      colors: [
        { name: 'Rose Pink', hex: '#C08081' },
        { name: 'Berry Pink', hex: '#DE6B83' },
        { name: 'Pale Peony', hex: '#F2D2D4' }
      ]
    },
    'prod-6': {
      id: 'prod-6',
      name: 'Printed Cotton Suit',
      category: 'SUIT SETS',
      price: '₹1,599',
      mrp: '₹2,999',
      discount: '47% OFF',
      image: 'assets/images/prod-6-printed-cotton-suit.jpg',
      description: 'Heritage hand-block printed cotton suit set created with organic vegetable dyes. Lightweight, breathable, and finished with delicate crochet lace borders.',
      colors: [
        { name: 'Marigold Gold', hex: '#B8860B' },
        { name: 'Old Lace', hex: '#FDF5E6' },
        { name: 'Olive Green', hex: '#556B2F' }
      ]
    },
    'prod-7': {
      id: 'prod-7',
      name: 'Elegant Green Sharara',
      category: 'SUIT SETS',
      price: '₹3,999',
      mrp: '₹6,999',
      discount: '43% OFF',
      image: 'assets/images/prod-7-elegant-green-sharara.jpg',
      description: 'Opulent deep forest emerald green sharara set woven in pure banarasi brocade. Lavished with intricate metallic needlework and crystal highlights on the kurti.',
      colors: [
        { name: 'Forest Emerald', hex: '#193923' },
        { name: 'Sage Green', hex: '#2E5A36' },
        { name: 'Moss Gold', hex: '#859B78' }
      ]
    },
    'prod-8': {
      id: 'prod-8',
      name: 'Cream Festive Set',
      category: 'SUIT SETS',
      price: '₹2,799',
      mrp: '₹4,599',
      discount: '39% OFF',
      image: 'assets/images/prod-8-cream-festive-set.jpg',
      description: 'Festive ceremonial ensemble in lustrous cream tissue silk with vintage champagne gold embroidery, pearl detailing, and a voluminous flared hemline.',
      colors: [
        { name: 'Cream Silk', hex: '#FFFDD0' },
        { name: 'Champagne', hex: '#C6A45D' },
        { name: 'Warm Ivory', hex: '#E6D7B8' }
      ]
    },
    'trend-1': {
      id: 'trend-1',
      name: 'Gulab Chanderi Sharara Suit',
      category: 'TRENDING SUITS',
      price: '₹3,499',
      mrp: '₹5,999',
      discount: '42% OFF',
      image: 'assets/images/trend-1-gulab-sharara.jpg',
      description: 'Handcrafted Gulab blush pink suit tailored in pure handwoven Chanderi silk with delicate silver gota-patti and mirror highlights, paired with a kalidar flared sharara and scalloped organza dupatta.',
      colors: [
        { name: 'Gulab Pink', hex: '#E8A598' },
        { name: 'Warm Linen', hex: '#FAF0E6' },
        { name: 'Champagne Gold', hex: '#C6A45D' }
      ]
    },
    'trend-2': {
      id: 'trend-2',
      name: 'Sage Green Angrakha Kurta',
      category: 'TRENDING KURTAS',
      price: '₹2,299',
      mrp: '₹3,999',
      discount: '43% OFF',
      image: 'assets/images/trend-2-sage-angrakha.jpg',
      description: 'Earthy sage green crossover Angrakha kurta featuring hand-tied latkan tassels, delicate French knot embroidery, and flared side panels on lightweight organic cotton-silk.',
      colors: [
        { name: 'Sage Green', hex: '#9CAF88' },
        { name: 'Desert Sand', hex: '#D8C3A5' },
        { name: 'Alabaster', hex: '#F4EFE6' }
      ]
    },
    'trend-3': {
      id: 'trend-3',
      name: 'Ochre Silk Peplum Co-ord',
      category: 'CO-ORD SETS',
      price: '₹2,799',
      mrp: '₹4,699',
      discount: '40% OFF',
      image: 'assets/images/trend-3-ochre-peplum-coord.jpg',
      description: 'Regal ochre rust raw silk co-ord set with a contemporary structured peplum tunic, jewel neckline, and tailored straight-cut cigarette trousers.',
      colors: [
        { name: 'Ochre Rust', hex: '#C68B59' },
        { name: 'Olive Silk', hex: '#556B2F' },
        { name: 'Cream', hex: '#FAF9F5' }
      ]
    },
    'trend-4': {
      id: 'trend-4',
      name: 'Midnight Blue Straight Suit',
      category: 'TRENDING SUITS',
      price: '₹3,899',
      mrp: '₹6,499',
      discount: '40% OFF',
      image: 'assets/images/trend-4-midnight-straight-suit.jpg',
      description: 'Striking midnight navy straight-cut suit adorned with rich antique gold zardozi along the placket and sleeve cuffs. Includes tailored trousers and an embroidered tissue dupatta.',
      colors: [
        { name: 'Midnight Navy', hex: '#1C2841' },
        { name: 'Prussian Blue', hex: '#2E4057' },
        { name: 'Antique Zari', hex: '#C6A45D' }
      ]
    },
    'trend-5': {
      id: 'trend-5',
      name: 'Ivory Organza Flared Kurta',
      category: 'TRENDING KURTAS',
      price: '₹2,599',
      mrp: '₹4,499',
      discount: '42% OFF',
      image: 'assets/images/trend-5-ivory-organza-kurta.jpg',
      description: 'Ethereal sheer ivory organza kurta layered over a pure mulmul lining, embellished with delicate tone-on-tone chikankari and subtle pearl beadwork.',
      colors: [
        { name: 'Ivory White', hex: '#FFFFF0' },
        { name: 'Warm Silk', hex: '#E6D7B8' },
        { name: 'Antique Gold', hex: '#D4AF37' }
      ]
    },
    'trend-6': {
      id: 'trend-6',
      name: 'Blush Embroidered Twin Set',
      category: 'CO-ORD SETS',
      price: '₹2,499',
      mrp: '₹4,299',
      discount: '42% OFF',
      image: 'assets/images/trend-6-blush-twin-set.jpg',
      description: 'Sophisticated blush pink co-ord twin set featuring a relaxed-fit belted tunic with threadwork accents and relaxed flared culotte trousers for modern festive elegance.',
      colors: [
        { name: 'Blush Peony', hex: '#F2D2D4' },
        { name: 'Beige Sand', hex: '#D8C3A5' },
        { name: 'Taupe', hex: '#8E8D8A' }
      ]
    },
    'best-1': {
      id: 'best-1',
      name: 'Royal Emerald Anarkali Suit',
      category: 'EMBROIDERED ANARKALI SUIT',
      price: '₹4,299',
      mrp: '₹7,999',
      discount: '46% OFF',
      image: 'assets/images/best-1-emerald-anarkali.jpg',
      description: 'Regal emerald green kalidar Anarkali crafted from handwoven Chanderi silk with intricate antique gold zardozi and sequin embroidery along the neckline, paired with a sheer scalloped organza dupatta.',
      colors: [
        { name: 'Emerald Green', hex: '#193923' },
        { name: 'Deep Forest', hex: '#0F2416' },
        { name: 'Antique Gold', hex: '#C6A45D' }
      ]
    },
    'best-2': {
      id: 'best-2',
      name: 'Champagne Zari Designer Suit',
      category: 'DESIGNER SUIT SET',
      price: '₹3,699',
      mrp: '₹6,499',
      discount: '43% OFF',
      image: 'assets/images/best-2-champagne-zari-suit.jpg',
      description: 'Regal champagne gold straight-cut suit adorned with artisanal gold zari weaves, pearl accents, and a gossamer tissue dupatta tailored with delicate French seams.',
      colors: [
        { name: 'Champagne Gold', hex: '#C6A45D' },
        { name: 'Ivory Cream', hex: '#FAF9F5' },
        { name: 'Alabaster', hex: '#F0E6D2' }
      ]
    },
    'best-3': {
      id: 'best-3',
      name: 'Blush Chanderi Kurta Set',
      category: 'PREMIUM KURTA SET',
      price: '₹2,899',
      mrp: '₹4,999',
      discount: '42% OFF',
      image: 'assets/images/best-3-blush-chanderi-kurta.jpg',
      description: 'Handwoven Chanderi silk kurta paired with tonal cigarette trousers and a sheer organza scalloped dupatta, finished with fine silver needlework.',
      colors: [
        { name: 'Blush Pink', hex: '#F2D2D4' },
        { name: 'Ivory White', hex: '#FFFFF0' }
      ]
    },
    'best-4': {
      id: 'best-4',
      name: 'Terracotta Silk Co-ord Set',
      category: 'ETHNIC CO-ORD SET',
      price: '₹2,499',
      mrp: '₹4,599',
      discount: '45% OFF',
      image: 'assets/images/best-4-terracotta-silk-coord.jpg',
      description: 'Contemporary terracotta rust raw silk co-ord set with a structured peplum waist, jewel neckline, and tailored straight-cut cigarette trousers for effortless festive celebrations.',
      colors: [
        { name: 'Terracotta Rust', hex: '#C68B59' },
        { name: 'Warm Clay', hex: '#A75D43' },
        { name: 'Desert Sand', hex: '#D8C3A5' }
      ]
    },
    'best-5': {
      id: 'best-5',
      name: 'Midnight Zardozi Velvet Suit',
      category: 'DESIGNER SUIT SET',
      price: '₹4,999',
      mrp: '₹8,999',
      discount: '44% OFF',
      image: 'assets/images/best-5-midnight-velvet-suit.jpg',
      description: 'Opulent midnight blue micro-velvet suit enriched with antique marodi and tilla embroidery along the neckline and hemline, paired with velvet trousers and a tissue dupatta.',
      colors: [
        { name: 'Midnight Blue', hex: '#1C2841' },
        { name: 'Deep Emerald', hex: '#193923' }
      ]
    },
    'best-6': {
      id: 'best-6',
      name: 'Ivory Chikankari Anarkali',
      category: 'EMBROIDERED ANARKALI SUIT',
      price: '₹3,999',
      mrp: '₹6,999',
      discount: '43% OFF',
      image: 'assets/images/best-6-ivory-chikankari-anarkali.jpg',
      description: 'Ethereal handcrafted Lucknowi Chikankari Anarkali on georgette with intricate shadow-work and delicate mukaish embellishments, layered over a pure mulmul slip.',
      colors: [
        { name: 'Ivory White', hex: '#FAF9F5' },
        { name: 'Warm Cream', hex: '#FFFDD0' }
      ]
    },
    'best-7': {
      id: 'best-7',
      name: 'Marigold Organza Kurta Set',
      category: 'PREMIUM KURTA SET',
      price: '₹2,699',
      mrp: '₹4,799',
      discount: '44% OFF',
      image: 'assets/images/best-7-marigold-organza-kurta.jpg',
      description: 'Festive marigold yellow tissue organza kurta adorned with delicate floral thread embroidery, paired with cotton-silk trousers and a scalloped dupatta.',
      colors: [
        { name: 'Marigold Yellow', hex: '#EAA221' },
        { name: 'Mustard Gold', hex: '#C68B59' }
      ]
    },
    'best-8': {
      id: 'best-8',
      name: 'Plum Embroidered Fusion Co-ord',
      category: 'ETHNIC CO-ORD SET',
      price: '₹2,999',
      mrp: '₹5,299',
      discount: '43% OFF',
      image: 'assets/images/best-8-plum-fusion-coord.jpg',
      description: 'Royal plum raw silk modern fusion co-ord set featuring an asymmetric draped tunic with metallic threadwork and tailored cigarette trousers.',
      colors: [
        { name: 'Deep Plum', hex: '#582C4D' },
        { name: 'Mulberry', hex: '#4A154B' }
      ]
    }
  };

  window.TIVARA_PRODUCTS = TIVARA_PRODUCTS;

  // Quick View Modal Controller
  const qvModal = document.getElementById('quickViewModal');
  const qvCloseBtn = document.getElementById('quickViewCloseBtn');
  const qvImage = document.getElementById('qvImage');
  const qvCategory = document.getElementById('qvCategory');
  const qvTitle = document.getElementById('qvTitle');
  const qvPrice = document.getElementById('qvPrice');
  const qvMrp = document.getElementById('qvMrp');
  const qvDiscount = document.getElementById('qvDiscount');
  const qvDescription = document.getElementById('qvDescription');
  const qvSwatches = document.getElementById('qvSwatches');
  const qvSelectedColor = document.getElementById('qvSelectedColor');
  const qvSelectedSize = document.getElementById('qvSelectedSize');
  const qvSizeGrid = document.getElementById('qvSizeGrid');
  const qvAddBagBtn = document.getElementById('qvAddBagBtn');
  const qvWishlistBtn = document.getElementById('qvWishlistBtn');
  let currentQvProductId = 'prod-1';

  window.openQuickView = function(productId) {
    const prod = TIVARA_PRODUCTS[productId];
    if (!prod || !qvModal) return;

    currentQvProductId = productId;
    if (qvImage) {
      qvImage.src = prod.image;
      qvImage.alt = `${prod.name} - TIVARA Luxury Ethnic Wear`;
    }
    if (qvCategory) qvCategory.textContent = prod.category;
    if (qvTitle) qvTitle.textContent = prod.name;
    if (qvPrice) qvPrice.textContent = prod.price;
    if (qvMrp) qvMrp.textContent = prod.mrp;
    if (qvDiscount) qvDiscount.textContent = prod.discount;
    if (qvDescription) qvDescription.textContent = prod.description;

    // Populate swatches
    if (qvSwatches) {
      qvSwatches.innerHTML = '';
      prod.colors.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `color-swatch ${idx === 0 ? 'active' : ''}`;
        btn.style.setProperty('--swatch-color', c.hex);
        btn.setAttribute('title', c.name);
        btn.setAttribute('aria-label', c.name);
        btn.addEventListener('click', () => {
          qvSwatches.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
          btn.classList.add('active');
          if (qvSelectedColor) qvSelectedColor.textContent = c.name;
        });
        qvSwatches.appendChild(btn);
      });
    }
    if (qvSelectedColor && prod.colors[0]) {
      qvSelectedColor.textContent = prod.colors[0].name;
    }

    // Reset size buttons
    if (qvSizeGrid) {
      const sizeBtns = qvSizeGrid.querySelectorAll('.quickview-size-btn');
      sizeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-size') === 'M');
      });
      if (qvSelectedSize) qvSelectedSize.textContent = 'M';
    }

    // Reset size guide panel & units
    if (qvSizeGuidePanel) qvSizeGuidePanel.style.display = 'none';
    setSizeGuideUnit('in');
    highlightSizeRow('M');

    // Update fabric details dynamically if available
    const qvFabricEl = document.getElementById('qvFabricDetails');
    if (qvFabricEl && prod.description) {
      qvFabricEl.textContent = `${prod.description} Finished with breathable mulmul cotton inner lining and artisanal hand-finished seams.`;
    }

    qvModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeQuickView() {
    if (qvModal) {
      qvModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (qvCloseBtn) {
    qvCloseBtn.addEventListener('click', closeQuickView);
  }

  if (qvModal) {
    qvModal.addEventListener('click', (e) => {
      if (e.target === qvModal) {
        closeQuickView();
      }
    });
  }

  // Size Guide Modal & Unit Toggle in Quick View
  const qvSizeGuideBtn = document.getElementById('qvSizeGuideBtn');
  const qvSizeGuidePanel = document.getElementById('qvSizeGuidePanel');
  const qvSizeGuideCloseBtn = document.getElementById('qvSizeGuideCloseBtn');
  const unitToggleIn = document.getElementById('unitToggleIn');
  const unitToggleCm = document.getElementById('unitToggleCm');
  const sizeGuideTable = document.getElementById('sizeGuideTable');

  function toggleSizeGuide() {
    if (!qvSizeGuidePanel) return;
    const isHidden = qvSizeGuidePanel.style.display === 'none' || !qvSizeGuidePanel.style.display;
    qvSizeGuidePanel.style.display = isHidden ? 'block' : 'none';
  }

  if (qvSizeGuideBtn) qvSizeGuideBtn.addEventListener('click', toggleSizeGuide);
  if (qvSizeGuideCloseBtn) qvSizeGuideCloseBtn.addEventListener('click', () => {
    if (qvSizeGuidePanel) qvSizeGuidePanel.style.display = 'none';
  });

  function setSizeGuideUnit(unit) {
    if (!sizeGuideTable) return;
    const isCm = unit === 'cm';
    if (unitToggleIn) unitToggleIn.classList.toggle('active', !isCm);
    if (unitToggleCm) unitToggleCm.classList.toggle('active', isCm);

    sizeGuideTable.querySelectorAll('tbody td[data-in]').forEach(cell => {
      cell.textContent = isCm ? cell.getAttribute('data-cm') : cell.getAttribute('data-in');
    });
  }

  if (unitToggleIn) unitToggleIn.addEventListener('click', () => setSizeGuideUnit('in'));
  if (unitToggleCm) unitToggleCm.addEventListener('click', () => setSizeGuideUnit('cm'));

  function highlightSizeRow(size) {
    if (!sizeGuideTable) return;
    sizeGuideTable.querySelectorAll('tbody tr').forEach(row => {
      row.classList.toggle('highlight-row', row.getAttribute('data-size') === size);
    });
  }

  // Size Grid selection in Quick View
  if (qvSizeGrid) {
    qvSizeGrid.querySelectorAll('.quickview-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosenSize = btn.getAttribute('data-size');
        qvSizeGrid.querySelectorAll('.quickview-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (qvSelectedSize) {
          qvSelectedSize.textContent = chosenSize;
        }
        highlightSizeRow(chosenSize);
      });
    });
  }

  // =========================================================================
  // DYNAMIC SHOPPING BAG & CART STATE MANAGER
  // =========================================================================
  const cartDrawerTitle = document.getElementById('cartDrawerTitle');
  const cartShippingBar = document.getElementById('cartShippingBar');
  const cartShippingText = document.getElementById('cartShippingText');
  const cartShippingFill = document.getElementById('cartShippingFill');
  const cartDrawerBody = document.getElementById('cartDrawerBody');
  const cartDrawerFooter = document.getElementById('cartDrawerFooter');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartSavingsRow = document.getElementById('cartSavingsRow');
  const cartTotalSavingsEl = document.getElementById('cartTotalSavings');
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
  const FREE_SHIPPING_THRESHOLD = 4000;

  let cart = [];
  try {
    const saved = localStorage.getItem('tivara_cart_items');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    cart = [];
  }

  function parsePrice(priceVal) {
    if (typeof priceVal === 'number') return priceVal;
    if (!priceVal) return 0;
    const clean = priceVal.toString().replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  }

  function formatINR(num) {
    return '₹' + Number(num).toLocaleString('en-IN');
  }

  function saveCart() {
    try {
      localStorage.setItem('tivara_cart_items', JSON.stringify(cart));
    } catch (e) {}
  }

  function getCartItemCount() {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + (parsePrice(item.price) * (item.quantity || 1)), 0);
  }

  function getCartSavings() {
    return cart.reduce((sum, item) => {
      const mrp = parsePrice(item.mrp);
      const price = parsePrice(item.price);
      const diff = mrp > price ? (mrp - price) : 0;
      return sum + (diff * (item.quantity || 1));
    }, 0);
  }

  function updateCartBadges() {
    const count = getCartItemCount();
    cartCount = count;
    document.querySelectorAll('#cartBtn .icon-badge').forEach(b => {
      b.textContent = count;
    });
    if (cartDrawerTitle) {
      cartDrawerTitle.textContent = `Shopping Bag (${count})`;
    }
  }

  function renderCartDrawer() {
    updateCartBadges();
    if (!cartDrawerBody) return;

    if (cart.length === 0) {
      if (cartShippingBar) cartShippingBar.style.display = 'none';
      if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';
      cartDrawerBody.innerHTML = `
        <div class="cart-empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--color-champagne-gold)" stroke-width="1.2" fill="none">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <h3 class="cart-empty-title">Your Shopping Bag is Empty</h3>
          <p class="cart-empty-desc">Discover our handcrafted Anarkalis, sharara sets, and silk kurtas.</p>
          <button type="button" class="campaign-action-btn" style="width: 220px;" onclick="document.getElementById('cartCloseBtn').click(); window.location.hash='#shop-by-category';">
            EXPLORE COLLECTIONS
          </button>
        </div>
      `;
      return;
    }

    // Active Cart Items
    if (cartShippingBar) {
      cartShippingBar.style.display = 'block';
      const subtotal = getCartSubtotal();
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        if (cartShippingText) {
          cartShippingText.innerHTML = `🎉 <strong>Congratulations!</strong> You unlocked <strong>Free Express Shipping</strong>.`;
        }
        if (cartShippingFill) {
          cartShippingFill.style.width = '100%';
        }
      } else {
        const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
        const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        if (cartShippingText) {
          cartShippingText.innerHTML = `Add <strong>${formatINR(remaining)}</strong> more for <strong>Free Express Shipping</strong>`;
        }
        if (cartShippingFill) {
          cartShippingFill.style.width = `${progress}%`;
        }
      }
    }

    // Render items list
    let html = '';
    cart.forEach((item, index) => {
      html += `
        <article class="cart-item-card" data-cart-index="${index}">
          <div class="cart-item-image-wrap">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-top">
              <h4 class="cart-item-title" title="${item.name}">${item.name}</h4>
              <div class="cart-item-meta">
                <span>Size:</span>
                <span class="cart-item-size-badge">${item.size || 'M'}</span>
              </div>
              <div class="cart-item-price-row">
                <span class="cart-item-price">${formatINR(parsePrice(item.price))}</span>
                ${item.mrp ? `<span class="cart-item-mrp">${formatINR(parsePrice(item.mrp))}</span>` : ''}
              </div>
            </div>
            <div class="cart-item-bottom-row">
              <div class="cart-qty-control" role="group" aria-label="Quantity for ${item.name}">
                <button type="button" class="cart-qty-btn minus-btn" aria-label="Decrease quantity" onclick="window.tivaraCart.updateQty(${index}, -1)">−</button>
                <span class="cart-qty-val">${item.quantity || 1}</span>
                <button type="button" class="cart-qty-btn plus-btn" aria-label="Increase quantity" onclick="window.tivaraCart.updateQty(${index}, 1)">+</button>
              </div>
              <button type="button" class="cart-item-remove-btn" onclick="window.tivaraCart.removeItem(${index})">Remove</button>
            </div>
          </div>
        </article>
      `;
    });
    cartDrawerBody.innerHTML = html;

    // Show Footer & Totals
    if (cartDrawerFooter) {
      cartDrawerFooter.style.display = 'block';
      const subtotal = getCartSubtotal();
      const savings = getCartSavings();
      if (cartSubtotalEl) cartSubtotalEl.textContent = formatINR(subtotal);
      if (cartTotalSavingsEl && cartSavingsRow) {
        if (savings > 0) {
          cartSavingsRow.style.display = 'flex';
          cartTotalSavingsEl.textContent = formatINR(savings);
        } else {
          cartSavingsRow.style.display = 'none';
        }
      }
    }
  }

  function addItemToCart(productData) {
    if (!productData || !productData.name) return;
    const size = productData.size || 'M';
    const existingIndex = cart.findIndex(item => item.name === productData.name && item.size === size);

    if (existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + (productData.quantity || 1);
    } else {
      cart.push({
        id: productData.id || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: productData.name,
        price: productData.price || '₹2,499',
        mrp: productData.mrp || '₹4,999',
        image: productData.image || 'assets/images/prod-1-ivory-floral-suit.jpg',
        size: size,
        quantity: productData.quantity || 1
      });
    }

    saveCart();
    renderCartDrawer();

    // Open Cart Drawer
    const cartDrawer = document.getElementById('cartDrawer');
    if (cartDrawer && backdrop) {
      cartDrawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    showToast(`${productData.name} (Size ${size}) added to Shopping Bag`);
  }

  window.tivaraCart = {
    addItem: addItemToCart,
    removeItem: function(index) {
      if (cart[index]) {
        const itemCard = document.querySelector(`.cart-item-card[data-cart-index="${index}"]`);
        if (itemCard) {
          itemCard.classList.add('removing');
        }
        setTimeout(() => {
          const removedName = cart[index] ? cart[index].name : 'Item';
          cart.splice(index, 1);
          saveCart();
          renderCartDrawer();
          showToast(`${removedName} removed from Shopping Bag`);
        }, 200);
      }
    },
    updateQty: function(index, delta) {
      if (cart[index]) {
        const newQty = (cart[index].quantity || 1) + delta;
        if (newQty <= 0) {
          window.tivaraCart.removeItem(index);
        } else {
          cart[index].quantity = newQty;
          saveCart();
          renderCartDrawer();
        }
      }
    },
    getItems: function() { return cart; }
  };

  // Checkout Button Trigger
  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      const subtotal = getCartSubtotal();
      if (cart.length === 0) {
        showToast('Your bag is currently empty.');
        return;
      }
      showToast(`Initiating 256-bit Secure Checkout for ${formatINR(subtotal)}...`);
    });
  }

  // Initial render on load
  renderCartDrawer();

  // Add to Bag in Quick View
  if (qvAddBagBtn) {
    qvAddBagBtn.addEventListener('click', () => {
      const prod = TIVARA_PRODUCTS[currentQvProductId];
      const prodName = prod ? prod.name : 'Item';
      const chosenSize = qvSelectedSize ? qvSelectedSize.textContent : 'M';
      closeQuickView();
      if (prod) {
        addItemToCart({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          mrp: prod.mrp,
          image: prod.image,
          size: chosenSize,
          quantity: 1
        });
      } else {
        window.quickAddToCart(prodName, chosenSize);
      }
    });
  }

  // Wishlist Button inside Quick View
  if (qvWishlistBtn) {
    qvWishlistBtn.addEventListener('click', () => {
      const prod = TIVARA_PRODUCTS[currentQvProductId];
      const prodName = prod ? prod.name : 'Item';
      const cardWishlistBtn = document.querySelector(`.product-card[data-product-id="${currentQvProductId}"] .product-wishlist-btn`);
      if (cardWishlistBtn) {
        window.toggleWishlist(cardWishlistBtn, prodName);
      } else {
        wishlistCount++;
        if (wishlistBadge) wishlistBadge.textContent = wishlistCount;
        showToast(`${prodName} added to your Wishlist`);
      }
    });
  }

  // =========================================================================
  // 7. SECTION 07: BEST SELLERS FILTER & QUICK ADD
  // =========================================================================
  // Quick Add To Cart Handler
  window.quickAddToCart = function(productName, size = 'M') {
    let matchedProduct = null;
    const cleanSearch = (productName || '').toLowerCase().trim();
    
    for (const key in TIVARA_PRODUCTS) {
      if (TIVARA_PRODUCTS[key].name.toLowerCase().trim() === cleanSearch) {
        matchedProduct = TIVARA_PRODUCTS[key];
        break;
      }
    }

    if (!matchedProduct) {
      for (const key in TIVARA_PRODUCTS) {
        if (cleanSearch.includes(TIVARA_PRODUCTS[key].name.toLowerCase().trim()) ||
            TIVARA_PRODUCTS[key].name.toLowerCase().trim().includes(cleanSearch)) {
          matchedProduct = TIVARA_PRODUCTS[key];
          break;
        }
      }
    }

    if (matchedProduct) {
      addItemToCart({
        id: matchedProduct.id,
        name: matchedProduct.name,
        price: matchedProduct.price,
        mrp: matchedProduct.mrp,
        image: matchedProduct.image,
        size: size,
        quantity: 1
      });
    } else {
      addItemToCart({
        id: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: productName,
        price: '₹2,499',
        mrp: '₹4,999',
        image: 'assets/images/prod-1-ivory-floral-suit.jpg',
        size: size,
        quantity: 1
      });
    }
  };

  // Category Filter Tabs for Bestsellers
  const filterBtns = document.querySelectorAll('.bestseller-filter-btn');
  const bestsellerCards = document.querySelectorAll('.bestseller-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      bestsellerCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (filter === 'all' || cardCat === filter) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // =========================================================================
  // 8. SECTION 10: SHOP THE LOOK HOTSPOT CONTROLLER
  // =========================================================================
  window.toggleHotspot = function(btn) {
    const currentHotspot = btn.closest('.product-hotspot');
    if (!currentHotspot) return;

    const isAlreadyActive = currentHotspot.classList.contains('active');

    // Close all open hotspots first
    document.querySelectorAll('.product-hotspot.active').forEach(h => {
      h.classList.remove('active');
    });

    // Toggle target hotspot
    if (!isAlreadyActive) {
      currentHotspot.classList.add('active');
    }
  };

  // Close hotspots on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.product-hotspot')) {
      document.querySelectorAll('.product-hotspot.active').forEach(h => {
        h.classList.remove('active');
      });
    }
  });

  // =========================================================================
  // 9. SECTION 11: TRENDING NOW FILTER TABS
  // =========================================================================
  const trendingFilterBtns = document.querySelectorAll('.trending-filter-btn');
  const trendingCards = document.querySelectorAll('.trending-card');

  trendingFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      trendingFilterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      trendingCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (filter === 'all' || cardCat === filter) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // =========================================================================
  // 10. SECTION 13: TESTIMONIALS CAROUSEL CONTROLLER
  // =========================================================================
  const testTrack = document.getElementById('testimonialsTrack');
  const testPrevBtn = document.getElementById('testimonialsPrevBtn');
  const testNextBtn = document.getElementById('testimonialsNextBtn');
  const testDots = document.querySelectorAll('.testimonials-dot');

  if (testTrack) {
    const getScrollStep = () => {
      const firstCard = testTrack.querySelector('.testimonial-card');
      if (!firstCard) return 320;
      const style = window.getComputedStyle(testTrack);
      const gap = parseFloat(style.gap) || 16;
      return firstCard.offsetWidth + gap;
    };

    if (testPrevBtn) {
      testPrevBtn.addEventListener('click', () => {
        testTrack.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      });
    }

    if (testNextBtn) {
      testNextBtn.addEventListener('click', () => {
        testTrack.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      });
    }

    // Dot click navigation
    testDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'), 10) || 0;
        const cards = testTrack.querySelectorAll('.testimonial-card');
        if (cards[index]) {
          cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    });

    // Update active dot on scroll
    let scrollTimeout;
    testTrack.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const cards = testTrack.querySelectorAll('.testimonial-card');
        const trackLeft = testTrack.scrollLeft;
        const trackCenter = trackLeft + testTrack.offsetWidth / 2;

        let closestIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, idx) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(trackCenter - cardCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = idx;
          }
        });

        testDots.forEach((d, idx) => {
          const isActive = idx === closestIndex;
          d.classList.toggle('active', isActive);
          d.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }, 50);
    }, { passive: true });
  }

  // =========================================================================
  // 11. SECTION 14: NEWSLETTER SUBSCRIPTION CONTROLLER
  // =========================================================================
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const newsletterInputGroup = document.getElementById('newsletterInputGroup');
  const newsletterError = document.getElementById('newsletterError');
  const newsletterSuccess = document.getElementById('newsletterSuccess');
  const newsletterResetBtn = document.getElementById('newsletterResetBtn');

  if (newsletterForm && newsletterEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailValue = newsletterEmail.value.trim();

      if (!emailValue || !emailRegex.test(emailValue)) {
        newsletterEmail.classList.add('error');
        if (newsletterError) {
          newsletterError.classList.add('visible');
        }
        if (newsletterInputGroup) {
          newsletterInputGroup.classList.remove('shake');
          void newsletterInputGroup.offsetWidth; // Trigger reflow for CSS animation
          newsletterInputGroup.classList.add('shake');
        }
        newsletterEmail.focus();
        return;
      }

      // Valid Email - Trigger Success Transition
      newsletterEmail.classList.remove('error');
      if (newsletterError) {
        newsletterError.classList.remove('visible');
      }

      // Hide form and show success state
      newsletterForm.style.display = 'none';
      if (newsletterSuccess) {
        newsletterSuccess.classList.add('visible');
      }

      // Toast feedback
      if (window.tivaraToast) {
        window.tivaraToast(`Welcome to TIVARA! Your 10% invitation code was sent to ${emailValue}`);
      }
    });

    // Clear error state on typing
    newsletterEmail.addEventListener('input', () => {
      if (newsletterEmail.classList.contains('error')) {
        newsletterEmail.classList.remove('error');
        if (newsletterError) {
          newsletterError.classList.remove('visible');
        }
      }
    });

    // Reset button to allow another submission
    if (newsletterResetBtn) {
      newsletterResetBtn.addEventListener('click', () => {
        newsletterEmail.value = '';
        newsletterEmail.classList.remove('error');
        if (newsletterError) {
          newsletterError.classList.remove('visible');
        }
        if (newsletterSuccess) {
          newsletterSuccess.classList.remove('visible');
        }
        newsletterForm.style.display = 'block';
        newsletterEmail.focus();
      });
    }
  }

  // =========================================================================
  // 12. SECTION 15: PREMIUM FOOTER (ACCORDIONS, BACK TO TOP, REGION)
  // =========================================================================
  const footerAccordionCols = document.querySelectorAll('.footer-column[data-accordion-column]');
  footerAccordionCols.forEach(col => {
    const headerBtn = col.querySelector('.footer-col-header');
    if (!headerBtn) return;

    headerBtn.addEventListener('click', () => {
      // Only execute toggle on mobile viewports
      if (window.innerWidth > 768) return;

      const isCurrentlyActive = col.classList.contains('active');

      // Close other accordions for an elegant accordion feel
      footerAccordionCols.forEach(otherCol => {
        if (otherCol !== col) {
          otherCol.classList.remove('active');
          const otherBtn = otherCol.querySelector('.footer-col-header');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle target
      col.classList.toggle('active', !isCurrentlyActive);
      headerBtn.setAttribute('aria-expanded', !isCurrentlyActive ? 'true' : 'false');
    });
  });

  // Back To Top Button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Footer Country Selector Trigger
  const footerCountryBtn = document.getElementById('footerCountryBtn');
  if (footerCountryBtn) {
    footerCountryBtn.addEventListener('click', () => {
      if (typeof openCountryModal === 'function') {
        openCountryModal();
      }
    });
  }
});
