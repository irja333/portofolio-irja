/* =========================================
   KIMI PARFUME — Interactive Scripts
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  // === Navbar Scroll Effect ===
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleScroll() {
    const scrollY = window.scrollY;

    // Add scrolled class to navbar
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link based on scroll position
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // === Mobile Nav Toggle ===
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // === Product Filter ===
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      productCards.forEach((card, index) => {
        const category = card.getAttribute('data-category') || '';

        if (filter === 'all' || category.includes(filter)) {
          card.classList.remove('hidden');
          card.style.animation = `cardFadeIn 0.5s ${index * 0.08}s both`;
        } else {
          card.classList.add('hidden');
          card.style.animation = '';
        }
      });
    });
  });

  // === Scroll Reveal Animation ===
  const revealElements = document.querySelectorAll(
    '.section-header, .product-card, .about-image, .about-text, ' +
    '.contact-info, .contact-image, .pricing-table-wrapper, .pricing-card-m, ' +
    '.feature-item'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Stagger delay for elements inside product-grid
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let stagger = 0;
        siblings.forEach((sibling, i) => {
          if (sibling === entry.target) stagger = i;
        });

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, stagger * 80);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));

  // === Smooth scroll for all internal links ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // === Card fade-in keyframe (injected) ===
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cardFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;
  document.head.appendChild(style);

  // === Parallax effect on hero (subtle) ===
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `scale(${1.05 + scrollY * 0.0002}) translateY(${scrollY * 0.15}px)`;
      }
    }, { passive: true });
  }

  // === Cart Sidebar Toggle ===
  const cartIconBtn = document.getElementById('cartIconBtn');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartSidebar = document.getElementById('cartSidebar');

  if (cartIconBtn && cartSidebar && cartOverlay) {
    cartIconBtn.addEventListener('click', () => {
      // Close mobile menu if open
      if (typeof navToggle !== 'undefined' && typeof navMenu !== 'undefined') {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      } else {
        const tgl = document.getElementById('navToggle');
        const mnu = document.getElementById('navMenu');
        if (tgl && mnu) {
          tgl.classList.remove('open');
          mnu.classList.remove('open');
        }
      }
      cartSidebar.classList.add('open');
      cartOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeCart() {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (cartClose) {
    cartClose.addEventListener('click', closeCart);
  }
  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
  }

  // Initial cart UI render
  if (window.updateCartUI) {
    window.updateCartUI();
  }
});

/* =========================================
   KIMI PARFUME — Shopping Cart System
   ========================================= */
let cart = [];

// Load cart from localStorage
try {
  const savedCart = localStorage.getItem('kimi_cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
} catch (e) {
  console.error('Failed to parse cart data:', e);
}

// Function to save cart
function saveCart() {
  try {
    localStorage.setItem('kimi_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart data:', e);
  }
}

// Pricing rules (regular vs reseller)
const pricingRules = {
  'zalina-30': { regular: 150000, reseller: 120000 },
  'alzari-30': { regular: 150000, reseller: 120000 },
  'zalina-5': { regular: 30000, reseller: 24000 },
  'alzari-5': { regular: 30000, reseller: 24000 },
  'starter-2': { regular: 10000, reseller: 8000 }
};

// Global helper functions
window.addToCart = function(button) {
  const card = button.closest('.product-card');
  if (!card) return;

  const id = card.getAttribute('data-product-id');
  const name = card.getAttribute('data-product-name');
  const img = card.getAttribute('data-product-img');
  
  // Find or add item
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      img: img,
      quantity: 1
    });
  }

  saveCart();
  window.updateCartUI();
  showToast(`${name} ditambahkan ke keranjang!`);
};

window.updateQuantity = function(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    window.removeFromCart(id);
    return;
  }

  saveCart();
  window.updateCartUI();
};

window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  window.updateCartUI();
};

window.clearCart = function() {
  if (cart.length === 0) return;
  if (confirm('Apakah Anda yakin ingin mengosongkan keranjang belanja?')) {
    cart = [];
    saveCart();
    window.updateCartUI();
  }
};

window.updateCartTotal = function() {
  const priceTypeElement = document.querySelector('input[name="priceType"]:checked');
  const isReseller = priceTypeElement ? priceTypeElement.value === 'reseller' : false;

  let total = 0;
  let totalQty = 0;

  const cartItemsContainer = document.getElementById('cartItems');
  const cartEmptyElement = document.getElementById('cartEmpty');

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    if (cartEmptyElement) {
      cartEmptyElement.style.display = 'flex';
    }
    // Remove other children except empty state
    Array.from(cartItemsContainer.children).forEach(child => {
      if (child.id !== 'cartEmpty') child.remove();
    });
    
    // Update badge and footer
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = '0';
    const totalEl = document.getElementById('cartTotalPrice');
    if (totalEl) totalEl.textContent = 'Rp 0';
    
    const noteEl = document.getElementById('cartResellerNote');
    if (noteEl) noteEl.classList.remove('show');
    return;
  }

  if (cartEmptyElement) {
    cartEmptyElement.style.display = 'none';
  }

  // Remove existing cart item elements
  Array.from(cartItemsContainer.children).forEach(child => {
    if (child.id !== 'cartEmpty') child.remove();
  });

  cart.forEach(item => {
    const rules = pricingRules[item.id] || { regular: 150000, reseller: 120000 };
    const price = isReseller ? rules.reseller : rules.regular;
    const itemSubtotal = price * item.quantity;
    total += itemSubtotal;
    totalQty += item.quantity;

    // Create item element
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.name}</h4>
        <span class="cart-item-price">Rp ${price.toLocaleString('id-ID')}</span>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Hapus">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  // Check reseller rules
  const noteEl = document.getElementById('cartResellerNote');
  if (noteEl) {
    if (isReseller) {
      let warnings = [];
      const regularItemsQty = cart
        .filter(item => item.id !== 'starter-2')
        .reduce((sum, item) => sum + item.quantity, 0);
      const starterQty = cart
        .filter(item => item.id === 'starter-2')
        .reduce((sum, item) => sum + item.quantity, 0);
      
      const hasRegularItems = cart.some(item => item.id !== 'starter-2');
      const hasStarter = cart.some(item => item.id === 'starter-2');

      if (hasRegularItems && regularItemsQty < 10) {
        warnings.push(`parfum 5ml/30ml (${regularItemsQty}/10 pcs)`);
      }
      if (hasStarter && starterQty < 25) {
        warnings.push(`Starter Pack 2ml (${starterQty}/25 pcs)`);
      }

      if (warnings.length > 0) {
        noteEl.classList.add('show');
        noteEl.textContent = `* Minimal order reseller belum terpenuhi: ${warnings.join(' & ')}.`;
      } else {
        noteEl.classList.remove('show');
      }
    } else {
      noteEl.classList.remove('show');
    }
  }

  // Update badge and footer total
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = totalQty;

  const totalEl = document.getElementById('cartTotalPrice');
  if (totalEl) totalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
};

// Map global alias
window.updateCartUI = window.updateCartTotal;

// Toast helper
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }

  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

window.checkoutWhatsApp = function() {
  if (cart.length === 0) {
    alert('Keranjang belanja Anda kosong.');
    return;
  }

  const priceTypeElement = document.querySelector('input[name="priceType"]:checked');
  const isReseller = priceTypeElement ? priceTypeElement.value === 'reseller' : false;

  const regularItemsQty = cart
    .filter(item => item.id !== 'starter-2')
    .reduce((sum, item) => sum + item.quantity, 0);
  const starterQty = cart
    .filter(item => item.id === 'starter-2')
    .reduce((sum, item) => sum + item.quantity, 0);

  const hasRegularItems = cart.some(item => item.id !== 'starter-2');
  const hasStarter = cart.some(item => item.id === 'starter-2');

  let warnings = [];
  if (isReseller) {
    if (hasRegularItems && regularItemsQty < 10) {
      warnings.push(`parfum 5ml/30ml (min. 10 pcs)`);
    }
    if (hasStarter && starterQty < 25) {
      warnings.push(`Starter Pack 2ml (min. 25 pcs)`);
    }
  }

  if (warnings.length > 0) {
    if (!confirm(`Minimal order reseller belum terpenuhi untuk:\n- ${warnings.join('\n- ')}\n\nTetap lanjut checkout?`)) {
      return;
    }
  }

  let total = 0;
  let message = `Halo Kimi Parfume, saya ingin memesan produk berikut:\n\n`;

  cart.forEach(item => {
    const rules = pricingRules[item.id] || { regular: 150000, reseller: 120000 };
    const price = isReseller ? rules.reseller : rules.regular;
    const itemSubtotal = price * item.quantity;
    total += itemSubtotal;

    message += `• *${item.name}*\n`;
    message += `  Kuantitas: ${item.quantity} pcs\n`;
    message += `  Harga: Rp ${price.toLocaleString('id-ID')} / pcs\n`;
    message += `  Subtotal: Rp ${itemSubtotal.toLocaleString('id-ID')}\n\n`;
  });

  message += `*Tipe Pembelian:* ${isReseller ? 'Reseller (Grosir)' : 'Eceran (Retail)'}\n`;
  message += `*Total Pembayaran:* Rp *${total.toLocaleString('id-ID')}*\n\n`;
  message += `Mohon informasi selanjutnya untuk pembayaran dan pengiriman. Terima kasih!`;

  const encodedText = encodeURIComponent(message);
  const waUrl = `https://wa.me/6281284701000?text=${encodedText}`;
  window.open(waUrl, '_blank');
};
