import { faker } from '@faker-js/faker';
import './style.css';

// ====================================================================================
// 1. APPLICATION STATE & MOCK DATA
// ====================================================================================

const state = {
  currentPage: 'home',
  cart: [],
  selectedCategory: 'all',
  menuItems: [],
  orders: [],
  adminTab: 'menu',
  whatsappNumber: '8801316006363',
  users: [],
  currentUser: null,
  authForm: 'login',
  websiteSettings: {
    name: 'BMS Kitchen',
    logo: '🍔',
    tagline: 'Fast, Fresh & Delivered to Your Doorstep',
    deliveryFee: 50
  },
  onlineUsers: [],
  notifications: []
};

// Real-time service for live updates
const RealTimeService = {
  listeners: new Map(),
  
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  },
  
  unsubscribe(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  },
  
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
};

function generateMockData() {
  const categories = ['Burgers', 'Pizzas', 'Drinks', 'Desserts'];
  
  state.menuItems = categories.flatMap(category => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: faker.string.uuid(),
      name: `${category === 'Burgers' ? 'Premium' : category === 'Pizzas' ? 'Special' : category === 'Drinks' ? 'Fresh' : 'Delicious'} ${category.slice(0, -1)} ${i + 1}`,
      category: category,
      price: parseFloat(faker.commerce.price({ min: 250, max: 800 })),
      description: faker.lorem.sentence(),
      image: getImageByCategory(category, i)
    }));
  });

  state.orders = Array.from({ length: 5 }, () => ({
    id: faker.string.uuid(),
    customer: {
      name: faker.person.fullName(),
      phone: faker.phone.number(),
    },
    address: faker.location.streetAddress(),
    items: state.menuItems.slice(0, 2).map(item => ({
      ...item,
      quantity: faker.number.int({ min: 1, max: 3 })
    })),
    total: parseFloat(faker.commerce.price({ min: 1000, max: 5000 })),
    paymentMethod: faker.helpers.arrayElement(['Cash on Delivery', 'Online Payment']),
    status: faker.helpers.arrayElement(['Pending', 'Processing', 'Delivered']),
    date: faker.date.recent().toLocaleDateString()
  }));
}

function getImageByCategory(category, index) {
  const images = {
    Burgers: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&h=400&fit=crop'],
    Pizzas: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=500&h=400&fit=crop', 'https://images.unsplash.com/phone-1595854341625-f33ee10dbf94?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=400&fit=crop'],
    Drinks: ['https://images.unsplash.com/photo-1546173159-315724a31696?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=500&h=400&fit=crop'],
    Desserts: ['https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=500&h=400&fit=crop', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&h=400&fit=crop']
  };
  return images[category][index % images[category].length];
}

// ====================================================================================
// 2. AUTHENTICATION SERVICE WITH REAL-TIME FEATURES
// ====================================================================================

const auth = {
  init() {
    // Add admin user
    state.users.push({
      id: 'admin-user',
      name: 'BMS Admin',
      email: 'admin@bmskitchen.com',
      phone: '01234567890',
      password: 'admin123',
      isAdmin: true,
      isOnline: true,
      lastSeen: new Date()
    });
    
    // Subscribe to real-time events
    RealTimeService.subscribe('userOnline', this.handleUserOnline.bind(this));
    RealTimeService.subscribe('userOffline', this.handleUserOffline.bind(this));
  },
  
  register(name, email, phone, password) {
    if (state.users.find(u => u.email === email)) {
      showAlert('User with this email already exists.', 'error');
      return false;
    }
    const newUser = { 
      id: faker.string.uuid(), 
      name, 
      email, 
      phone, 
      password, 
      isAdmin: false,
      isOnline: true,
      lastSeen: new Date()
    };
    state.users.push(newUser);
    this.login(email, password);
    
    // Notify admin about new registration
    if (state.currentUser?.isAdmin) {
      RealTimeService.emit('newUser', newUser);
    }
    
    showAlert('Registration successful! You are now logged in.', 'success');
    return true;
  },
  
  login(email, password) {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      user.isOnline = true;
      user.lastSeen = new Date();
      state.currentUser = user;
      
      // Notify real-time system
      RealTimeService.emit('userOnline', user);
      
      navigateTo('home');
      return true;
    }
    showAlert('Invalid email or password.', 'error');
    return false;
  },
  
  logout() {
    if (state.currentUser) {
      state.currentUser.isOnline = false;
      state.currentUser.lastSeen = new Date();
      RealTimeService.emit('userOffline', state.currentUser);
    }
    state.currentUser = null;
    navigateTo('home');
  },
  
  handleUserOnline(user) {
    const existingUser = state.users.find(u => u.id === user.id);
    if (existingUser) {
      existingUser.isOnline = true;
      existingUser.lastSeen = new Date();
    }
    updateOnlineUsers();
  },
  
  handleUserOffline(user) {
    const existingUser = state.users.find(u => u.id === user.id);
    if (existingUser) {
      existingUser.isOnline = false;
      existingUser.lastSeen = new Date();
    }
    updateOnlineUsers();
  },
  
  getCurrentUser: () => state.currentUser,
  isAdmin: () => state.currentUser?.isAdmin || false,
};

function updateOnlineUsers() {
  state.onlineUsers = state.users.filter(user => user.isOnline);
  if (state.currentPage === 'admin' && state.adminTab === 'users') {
    renderApp();
  }
}

// ====================================================================================
// 3. ROUTER & NAVIGATION
// ====================================================================================

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderNavbar()}
    ${renderPage()}
    ${renderFooter()}
    ${renderModal()}
  `;
  setupEventListeners();
}

window.navigateTo = (page) => {
  if (page === 'admin' && !auth.isAdmin()) {
    showAlert('Access Denied: You must be an admin to view this page.', 'error');
    return;
  }
  state.currentPage = page;
  renderApp();
  window.scrollTo(0, 0);
};

function renderPage() {
  switch (state.currentPage) {
    case 'home': return renderHomePage();
    case 'menu': return renderMenuPage();
    case 'cart': return renderCartPage();
    case 'contact': return renderContactPage();
    case 'admin': return renderAdminPage();
    case 'login': return renderAuthPage();
    case 'register': return renderAuthPage(true);
    default: return renderHomePage();
  }
}

// ====================================================================================
// 4. COMPONENT RENDERERS
// ====================================================================================

function renderNavbar() {
  const user = auth.getCurrentUser();
  const navItems = [
    { page: 'home', text: 'Home' },
    { page: 'menu', text: 'Menu' },
    { page: 'cart', text: 'Cart' },
    { page: 'contact', text: 'Contact' },
  ];

  if (auth.isAdmin()) {
    navItems.push({ page: 'admin', text: 'Admin' });
  }

  return `
    <nav class="navbar">
      <div class="container">
        <div class="logo" onclick="navigateTo('home')">
          <div class="logo-icon">${state.websiteSettings.logo}</div>
          <span>${state.websiteSettings.name}</span>
        </div>
        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">☰</button>
        <nav id="navMenu">
          <ul>
            ${navItems.map(item => `
              <li class="${state.currentPage === item.page ? 'active' : ''}" onclick="navigateTo('${item.page}')">
                ${item.text}
              </li>
            `).join('')}
            ${user ? `
              <li class="user-info">Hi, ${user.name.split(' ')[0]} ${user.isOnline ? '<span class="online-dot"></span>' : ''}</li>
              <li onclick="auth.logout()">Logout</li>
            ` : `
              <li class="${state.currentPage === 'login' ? 'active' : ''}" onclick="navigateTo('login')">Login</li>
              <li class="${state.currentPage === 'register' ? 'active' : ''}" onclick="navigateTo('register')">Register</li>
            `}
            ${state.cart.length > 0 ? `<li style="background: white; color: var(--primary-color); padding: 5px 15px; border-radius: 20px;">${state.cart.length}</li>` : ''}
          </ul>
        </nav>
      </div>
    </nav>
  `;
}

function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>${state.websiteSettings.name}</h3>
            <p>${state.websiteSettings.tagline}</p>
            <div class="social-icons">
              <a href="#" class="social-icon">📘</a> <a href="#" class="social-icon">📷</a> <a href="#" class="social-icon">🐦</a>
              <a href="https://wa.me/${state.whatsappNumber}" class="social-icon" target="_blank">📱</a>
            </div>
          </div>
          <div class="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li onclick="navigateTo('home')">Home</li> <li onclick="navigateTo('menu')">Menu</li>
              <li onclick="navigateTo('cart')">Cart</li> <li onclick="navigateTo('contact')">Contact</li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Contact Info</h3>
            <ul>
              <li>📞 +${state.whatsappNumber}</li> <li>📧 info@bmskitchen.com</li> <li>📍 Dhaka, Bangladesh</li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Opening Hours</h3>
            <ul>
              <li>Mon - Fri: 10 AM - 11 PM</li> <li>Sat - Sun: 9 AM - 12 AM</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} ${state.websiteSettings.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}

function renderModal() {
  return `
    <div id="modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="modalTitle">Modal Title</h3>
          <button class="close-modal" onclick="closeModal()">&times;</button>
        </div>
        <div id="modalBody"></div>
      </div>
    </div>
  `;
}

function renderMenuItem(item) {
  return `
    <div class="menu-item">
      <img src="${item.image}" alt="${item.name}" class="menu-item-image">
      <div class="menu-item-content">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="menu-item-footer">
          <span class="price">Tk ${item.price.toFixed(2)}</span>
          <div class="menu-item-actions">
            <button class="btn btn-small" onclick="addToCart('${item.id}')">Add to Cart</button>
            <button class="btn btn-whatsapp btn-small" onclick="orderOnWhatsApp('${item.name}')">
              <span>📱</span> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ====================================================================================
// 5. PAGE RENDERERS WITH ENHANCED ADMIN FEATURES
// ====================================================================================

function renderHomePage() {
  return `
    <section class="hero">
      <div class="container">
        <h1>${state.websiteSettings.name}</h1>
        <p class="tagline">${state.websiteSettings.tagline}</p>
        <button class="btn" onclick="navigateTo('menu')">Order Now</button>
      </div>
    </section>
    <section class="features">
      <div class="container">
        <h2>Why Choose ${state.websiteSettings.name}?</h2>
        <div class="features-grid">
          <div class="feature-card"><div class="feature-icon">🚀</div><h3>Fast Delivery</h3><p>Get your food delivered within 30 minutes</p></div>
          <div class="feature-card"><div class="feature-icon">🍽️</div><h3>Fresh Food</h3><p>Made with the freshest ingredients</p></div>
          <div class="feature-card"><div class="feature-icon">💰</div><h3>Best Prices</h3><p>Affordable prices without compromising quality</p></div>
          <div class="feature-card"><div class="feature-icon">⭐</div><h3>Top Quality</h3><p>Premium quality food prepared by expert chefs</p></div>
        </div>
      </div>
    </section>
    <section class="menu-section">
      <div class="container">
        <h2>Popular Items</h2>
        <p class="subtitle">Check out our most loved dishes</p>
        <div class="menu-grid">${state.menuItems.slice(0, 4).map(renderMenuItem).join('')}</div>
        <div class="text-center mt-2"><button class="btn" onclick="navigateTo('menu')">View Full Menu</button></div>
      </div>
    </section>
  `;
}

function renderMenuPage() {
  const categories = ['all', ...new Set(state.menuItems.map(item => item.category))];
  const filteredItems = state.selectedCategory === 'all' 
    ? state.menuItems 
    : state.menuItems.filter(item => item.category === state.selectedCategory);

  return `
    <section class="menu-section">
      <div class="container">
        <h2>Our Menu</h2>
        <p class="subtitle">Explore our delicious selection</p>
        <div class="category-filters">
          ${categories.map(cat => `<button class="category-btn ${state.selectedCategory === cat ? 'active' : ''}" onclick="filterByCategory('${cat}')">${cat === 'all' ? 'All Items' : cat}</button>`).join('')}
        </div>
        <div class="menu-grid">${filteredItems.map(renderMenuItem).join('')}</div>
      </div>
    </section>
  `;
}

function renderCartPage() {
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = state.websiteSettings.deliveryFee;
  const grandTotal = total + deliveryFee;

  if (state.cart.length === 0) {
    return `<section class="cart-section"><div class="container"><h2 class="text-center">Shopping Cart</h2><div class="empty-state"><div class="empty-state-icon">🛒</div><h3>Your cart is empty</h3><p>Add some delicious items to get started!</p><button class="btn mt-2" onclick="navigateTo('menu')">Browse Menu</button></div></div></section>`;
  }

  const user = auth.getCurrentUser();

  return `
    <section class="cart-section">
      <div class="container">
        <h2 class="text-center mb-2">Shopping Cart</h2>
        <div class="cart-items">
          ${state.cart.map(item => `
            <div class="cart-item">
              <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details"><h4>${item.name}</h4><p>Tk ${item.price.toFixed(2)} each</p></div>
              </div>
              <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                <button class="btn btn-small" style="background: var(--danger-color);" onclick="removeFromCart('${item.id}')">Remove</button>
              </div>
              <div class="price">Tk ${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>

        ${user ? `
          <div class="checkout-form">
            <h3>Delivery Details</h3>
            <form id="checkoutForm" onsubmit="handleCheckout(event)">
              <div class="form-group"><label for="customerName">Full Name *</label><input type="text" id="customerName" required value="${user.name}"></div>
              <div class="form-group"><label for="customerPhone">Phone Number *</label><input type="tel" id="customerPhone" required value="${user.phone}"></div>
              <div class="form-group"><label for="customerAddress">Delivery Address *</label><textarea id="customerAddress" required placeholder="Enter your complete address"></textarea></div>
              <div class="form-group">
                <label>Payment Method *</label>
                <div class="payment-methods">
                  <label class="payment-method active"><input type="radio" name="payment" value="Cash on Delivery" checked><div>💵 Cash on Delivery</div></label>
                  <label class="payment-method"><input type="radio" name="payment" value="Online Payment"><div>💳 Online Payment</div></label>
                </div>
              </div>
              <div class="cart-summary mt-2">
                <div class="summary-row"><span>Subtotal:</span><span>Tk ${total.toFixed(2)}</span></div>
                <div class="summary-row"><span>Delivery Fee:</span><span>Tk ${deliveryFee.toFixed(2)}</span></div>
                <div class="summary-row total"><span>Total:</span><span>Tk ${grandTotal.toFixed(2)}</span></div>
                <button type="submit" class="btn mt-1" style="width: 100%;">Place Order</button>
                <button type="button" class="btn btn-whatsapp mt-1" style="width: 100%;" onclick="checkoutViaWhatsApp()"><span>📱</span> Order via WhatsApp</button>
              </div>
            </form>
          </div>
        ` : `
          <div class="alert alert-info text-center">
            <h3>Please Login to Continue</h3>
            <p>You need to be logged in to place an order.</p>
            <button class="btn mt-1" onclick="navigateTo('login')">Login or Register</button>
          </div>
        `}
      </div>
    </section>
  `;
}

function renderContactPage() {
  return `
    <section class="contact-section">
      <div class="container">
        <h2 class="text-center mb-2">Contact Us</h2>
        <p class="subtitle">We'd love to hear from you!</p>
        <div class="contact-grid">
          <div class="contact-card"><div class="contact-icon">📱</div><h3>WhatsApp</h3><p>Chat with us instantly</p><a href="https://wa.me/${state.whatsappNumber}" target="_blank" class="btn btn-whatsapp mt-1">Open WhatsApp</a></div>
          <div class="contact-card"><div class="contact-icon">📞</div><h3>Phone</h3><p>Call us for quick queries</p><a href="tel:+${state.whatsappNumber}">+${state.whatsappNumber}</a></div>
          <div class="contact-card"><div class="contact-icon">📧</div><h3>Email</h3><p>Send us an email</p><a href="mailto:info@bmskitchen.com">info@bmskitchen.com</a></div>
        </div>
        <div class="map-container mt-2"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.2396847873!2d90.39167831543534!3d23.75037999414712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b7a55cd36f%3A0xfcc5b021faff43ea!2sDhaka%2C%20Bangladesh!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus" allowfullscreen="" loading="lazy"></iframe></div>
      </div>
    </section>
  `;
}

function renderAuthPage(isRegister = false) {
  return `
    <div class="auth-container">
      <div class="auth-form">
        <h2>${isRegister ? 'Create an Account' : 'Welcome Back!'}</h2>
        <form onsubmit="${isRegister ? 'handleRegister(event)' : 'handleLogin(event)'}">
          ${isRegister ? `
            <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required></div>
            <div class="form-group"><label for="phone">Phone Number</label><input type="tel" id="phone" required></div>
          ` : ''}
          <div class="form-group"><label for="email">Email</label><input type="email" id="email" required></div>
          <div class="form-group"><label for="password">Password</label><input type="password" id="password" required></div>
          <button type="submit" class="btn">${isRegister ? 'Register' : 'Login'}</button>
        </form>
        <p>
          ${isRegister ? 'Already have an account?' : "Don't have an account?"}
          <a href="#" onclick="navigateTo('${isRegister ? 'login' : 'register'}')">${isRegister ? 'Login here' : 'Register now'}</a>
        </p>
      </div>
    </div>
  `;
}

function renderAdminPage() {
  return `
    <section class="admin-panel">
      <div class="container">
        <div class="admin-header"><h2>Admin Panel</h2><p>Manage your restaurant</p></div>
        <div class="admin-tabs">
          <button class="admin-tab ${state.adminTab === 'menu' ? 'active' : ''}" onclick="switchAdminTab('menu')">Menu Items</button>
          <button class="admin-tab ${state.adminTab === 'orders' ? 'active' : ''}" onclick="switchAdminTab('orders')">Orders</button>
          <button class="admin-tab ${state.adminTab === 'users' ? 'active' : ''}" onclick="switchAdminTab('users')">Users</button>
          <button class="admin-tab ${state.adminTab === 'notifications' ? 'active' : ''}" onclick="switchAdminTab('notifications')">Notifications</button>
          <button class="admin-tab ${state.adminTab === 'settings' ? 'active' : ''}" onclick="switchAdminTab('settings')">Website Settings</button>
        </div>
        <div class="admin-content">${renderAdminContent()}</div>
      </div>
    </section>
  `;
}

function renderAdminContent() {
  switch (state.adminTab) {
    case 'menu': return renderAdminMenuTab();
    case 'orders': return renderAdminOrdersTab();
    case 'users': return renderAdminUsersTab();
    case 'notifications': return renderAdminNotificationsTab();
    case 'settings': return renderAdminSettingsTab();
    default: return renderAdminMenuTab();
  }
}

function renderAdminMenuTab() {
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3>Menu Items (${state.menuItems.length})</h3>
        <button class="btn" onclick="openAddItemModal()">+ Add New Item</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
        <tbody>
          ${state.menuItems.map(item => `
            <tr>
              <td><img src="${item.image}" alt="${item.name}"></td>
              <td>${item.name}</td>
              <td>${item.category}</td>
              <td>Tk ${item.price.toFixed(2)}</td>
              <td>
                <div class="admin-actions">
                  <button class="btn-icon btn-edit" onclick="editMenuItem('${item.id}')" title="Edit">✏️</button>
                  <button class="btn-icon btn-delete" onclick="deleteMenuItem('${item.id}')" title="Delete">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminOrdersTab() {
  return `
    <div>
      <h3>Recent Orders (${state.orders.length})</h3>
      <table class="admin-table">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          ${state.orders.map(order => `
            <tr>
              <td>#${order.id.slice(0, 8)}</td>
              <td>${order.customer.name}</td>
              <td>${order.customer.phone}</td>
              <td>Tk ${order.total.toFixed(2)}</td>
              <td>${order.paymentMethod}</td>
              <td><span style="padding: 4px 12px; border-radius: 20px; background: ${order.status === 'Delivered' ? '#28a745' : order.status === 'Processing' ? '#f7931e' : '#6c757d'}; color: white; font-size: 0.85rem;">${order.status}</span></td>
              <td>${order.date}</td>
              <td><button class="btn-icon btn-edit" onclick="viewOrderDetails('${order.id}')" title="View Details">👁️</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminUsersTab() {
  const onlineUsers = state.users.filter(user => user.isOnline);
  return `
    <div>
      <div class="users-stats">
        <div class="stat-card">
          <h4>Total Users</h4>
          <div class="stat-number">${state.users.length}</div>
        </div>
        <div class="stat-card">
          <h4>Online Now</h4>
          <div class="stat-number online">${onlineUsers.length}</div>
        </div>
      </div>
      
      <div class="online-users-section mt-2">
        <h4>Currently Online (${onlineUsers.length})</h4>
        ${onlineUsers.length === 0 ? 
          '<p>No users online at the moment</p>' : 
          onlineUsers.map(user => `
            <div class="user-card online">
              <div class="user-avatar">${user.name.charAt(0)}</div>
              <div class="user-info">
                <strong>${user.name}</strong>
                <span>${user.email}</span>
                <small>Online now</small>
              </div>
              <span class="online-indicator"></span>
            </div>
          `).join('')
        }
      </div>
      
      <div class="all-users-section mt-2">
        <h4>All Registered Users</h4>
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Type</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            ${state.users.map(user => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="user-avatar-small">${user.name.charAt(0)}</div>
                    ${user.name}
                  </div>
                </td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>
                  <span class="status-indicator ${user.isOnline ? 'online' : 'offline'}">
                    ${user.isOnline ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td>${user.isAdmin ? '<span style="color: var(--primary-color); font-weight: bold;">Admin</span>' : 'User'}</td>
                <td>${user.lastSeen.toLocaleTimeString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAdminNotificationsTab() {
  return `
    <div>
      <h3>Push Notifications</h3>
      <p>Send real-time notifications to your users</p>
      
      <div class="notification-form">
        <form onsubmit="sendPushNotification(event)">
          <div class="form-group">
            <label for="notificationTitle">Notification Title</label>
            <input type="text" id="notificationTitle" required placeholder="Enter notification title">
          </div>
          <div class="form-group">
            <label for="notificationMessage">Message</label>
            <textarea id="notificationMessage" required placeholder="Enter your message" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label for="notificationAudience">Send To</label>
            <select id="notificationAudience">
              <option value="all">All Users</option>
              <option value="online">Online Users Only</option>
            </select>
          </div>
          <button type="submit" class="btn btn-whatsapp">Send Notification</button>
        </form>
      </div>
      
      <div class="notification-history mt-2">
        <h4>Recent Notifications</h4>
        ${state.notifications.length === 0 ? 
          '<p>No notifications sent yet</p>' : 
          state.notifications.slice(0, 5).map(notif => `
            <div class="notification-item">
              <strong>${notif.title}</strong>
              <p>${notif.message}</p>
              <small>Sent to: ${notif.audience} • ${notif.timestamp.toLocaleTimeString()}</small>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
}

function renderAdminSettingsTab() {
  return `
    <div>
      <h3>Website Settings</h3>
      <p>Customize your restaurant website</p>
      
      <form onsubmit="saveWebsiteSettings(event)">
        <div class="form-group">
          <label for="websiteName">Restaurant Name</label>
          <input type="text" id="websiteName" value="${state.websiteSettings.name}" required>
        </div>
        
        <div class="form-group">
          <label for="websiteLogo">Logo Emoji</label>
          <input type="text" id="websiteLogo" value="${state.websiteSettings.logo}" placeholder="🍔" maxlength="2">
          <small>Use a single emoji as your logo</small>
        </div>
        
        <div class="form-group">
          <label for="websiteTagline">Tagline</label>
          <input type="text" id="websiteTagline" value="${state.websiteSettings.tagline}" required>
        </div>
        
        <div class="form-group">
          <label for="whatsappNumber">WhatsApp Number</label>
          <input type="tel" id="whatsappNumber" value="${state.whatsappNumber}" required>
        </div>
        
        <div class="form-group">
          <label for="deliveryFee">Delivery Fee (Tk)</label>
          <input type="number" id="deliveryFee" value="${state.websiteSettings.deliveryFee}" step="1" min="0">
        </div>
        
        <button type="submit" class="btn">Save Settings</button>
      </form>
      
      <div class="website-preview mt-2">
        <h4>Preview</h4>
        <div style="background: var(--light-gray); padding: 2rem; border-radius: 10px; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">${state.websiteSettings.logo}</div>
          <h3 style="margin-bottom: 0.5rem;">${state.websiteSettings.name}</h3>
          <p style="color: var(--gray-color);">${state.websiteSettings.tagline}</p>
        </div>
      </div>
    </div>
  `;
}

// ====================================================================================
// 6. EVENT HANDLERS & GLOBAL FUNCTIONS
// ====================================================================================

function setupEventListeners() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.payment-method')) {
      document.querySelectorAll('.payment-method').forEach(method => method.classList.remove('active'));
      const parentLabel = e.target.closest('.payment-method');
      parentLabel.classList.add('active');
      parentLabel.querySelector('input[type="radio"]').checked = true;
    }
  });

  // Real-time user status updates
  setInterval(() => {
    if (state.currentUser) {
      state.currentUser.lastSeen = new Date();
    }
  }, 30000);
}

window.toggleMobileMenu = () => document.getElementById('navMenu').classList.toggle('active');
window.filterByCategory = (category) => { state.selectedCategory = category; renderApp(); };

window.addToCart = (itemId) => {
  const item = state.menuItems.find(i => i.id === itemId);
  const existingItem = state.cart.find(i => i.id === itemId);
  if (existingItem) { existingItem.quantity += 1; } 
  else { state.cart.push({ ...item, quantity: 1 }); }
  showAlert('Item added to cart!', 'success');
  renderApp();
};

window.updateQuantity = (itemId, newQuantity) => {
  if (newQuantity <= 0) { removeFromCart(itemId); return; }
  const item = state.cart.find(i => i.id === itemId);
  if (item) { item.quantity = newQuantity; renderApp(); }
};

window.removeFromCart = (itemId) => { state.cart = state.cart.filter(i => i.id !== itemId); renderApp(); };

window.orderOnWhatsApp = (itemName) => {
  const message = `I want to order ${itemName}.`;
  window.open(`https://wa.me/${state.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
};

window.checkoutViaWhatsApp = () => {
  const items = state.cart.map(item => `${item.quantity}x ${item.name} (Tk ${(item.price * item.quantity).toFixed(2)})`).join('\n');
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const message = `Hi! I'd like to place an order:\n\n${items}\n\nTotal: Tk ${total.toFixed(2)}\n\nPlease confirm my order.`;
  window.open(`https://wa.me/${state.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
};

window.handleLogin = (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.login(email, password);
};

window.handleRegister = (event) => {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.register(name, email, phone, password);
};

window.handleCheckout = (event) => {
  event.preventDefault();
  const user = auth.getCurrentUser();
  if (!user) {
    showAlert('You must be logged in to place an order.', 'error');
    return;
  }
  const order = {
    id: faker.string.uuid(),
    customer: { name: user.name, phone: user.phone },
    address: document.getElementById('customerAddress').value,
    items: [...state.cart],
    total: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + state.websiteSettings.deliveryFee,
    paymentMethod: document.querySelector('input[name="payment"]:checked').value,
    status: 'Pending',
    date: new Date().toLocaleDateString()
  };
  state.orders.unshift(order);
  state.cart = [];
  showAlert('Order placed successfully! We will contact you shortly.', 'success');
  navigateTo('home');
};

window.switchAdminTab = (tab) => { state.adminTab = tab; renderApp(); };

// Enhanced Admin Functions
window.sendPushNotification = (event) => {
  event.preventDefault();
  const title = document.getElementById('notificationTitle').value;
  const message = document.getElementById('notificationMessage').value;
  const audience = document.getElementById('notificationAudience').value;
  
  const notification = {
    id: faker.string.uuid(),
    title,
    message,
    audience,
    timestamp: new Date()
  };
  
  state.notifications.unshift(notification);
  
  // Show real-time notification to users
  if (audience === 'all' || audience === 'online') {
    RealTimeService.emit('pushNotification', notification);
  }
  
  showAlert('Notification sent successfully!', 'success');
  event.target.reset();
};

window.saveWebsiteSettings = (event) => {
  event.preventDefault();
  state.websiteSettings.name = document.getElementById('websiteName').value;
  state.websiteSettings.logo = document.getElementById('websiteLogo').value;
  state.websiteSettings.tagline = document.getElementById('websiteTagline').value;
  state.whatsappNumber = document.getElementById('whatsappNumber').value;
  state.websiteSettings.deliveryFee = parseInt(document.getElementById('deliveryFee').value);
  
  showAlert('Website settings updated successfully!', 'success');
  renderApp();
};

// Subscribe to real-time notifications
RealTimeService.subscribe('pushNotification', (notification) => {
  showRealTimeNotification(notification);
});

function showRealTimeNotification(notification) {
  const notificationDiv = document.createElement('div');
  notificationDiv.className = 'real-time-notification';
  notificationDiv.innerHTML = `
    <strong>${notification.title}</strong>
    <p>${notification.message}</p>
    <small>${notification.timestamp.toLocaleTimeString()}</small>
  `;
  
  document.body.appendChild(notificationDiv);
  
  setTimeout(() => {
    notificationDiv.remove();
  }, 5000);
}

// Existing modal functions (keep all your existing modal functions)
window.openAddItemModal = () => {
  document.getElementById('modalTitle').textContent = 'Add New Menu Item';
  document.getElementById('modalBody').innerHTML = `
    <form id="addItemForm" onsubmit="handleAddMenuItem(event)">
      <div class="form-group"><label for="itemName">Item Name *</label><input type="text" id="itemName" required></div>
      <div class="form-group"><label for="itemCategory">Category *</label><select id="itemCategory" required><option value="Burgers">Burgers</option><option value="Pizzas">Pizzas</option><option value="Drinks">Drinks</option><option value="Desserts">Desserts</option></select></div>
      <div class="form-group"><label for="itemPrice">Price (Tk) *</label><input type="number" id="itemPrice" step="1" required></div>
      <div class="form-group"><label for="itemDescription">Description *</label><textarea id="itemDescription" required></textarea></div>
      <div class="form-group"><label>Item Image *</label><div class="image-upload" onclick="document.getElementById('itemImage').click()"><input type="file" id="itemImage" accept="image/*" onchange="previewImage(event)"><p>Click to upload image</p><img id="imagePreview" class="preview-image" style="display: none;"></div><input type="hidden" id="itemImageUrl"></div>
      <button type="submit" class="btn mt-2">Add Item</button>
    </form>
  `;
  document.getElementById('modal').classList.add('active');
};

window.handleAddMenuItem = (event) => {
  event.preventDefault();
  const newItem = {
    id: faker.string.uuid(),
    name: document.getElementById('itemName').value,
    category: document.getElementById('itemCategory').value,
    price: parseFloat(document.getElementById('itemPrice').value),
    description: document.getElementById('itemDescription').value,
    image: document.getElementById('itemImageUrl').value || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop'
  };
  state.menuItems.unshift(newItem);
  closeModal();
  showAlert('Menu item added successfully!', 'success');
  renderApp();
};

window.editMenuItem = (itemId) => {
  const item = state.menuItems.find(i => i.id === itemId);
  if (!item) return;
  document.getElementById('modalTitle').textContent = 'Edit Menu Item';
  document.getElementById('modalBody').innerHTML = `
    <form id="editItemForm" onsubmit="handleEditMenuItem(event, '${itemId}')">
      <div class="form-group"><label for="editItemName">Item Name *</label><input type="text" id="editItemName" value="${item.name}" required></div>
      <div class="form-group"><label for="editItemCategory">Category *</label><select id="editItemCategory" required><option value="Burgers" ${item.category === 'Burgers' ? 'selected' : ''}>Burgers</option><option value="Pizzas" ${item.category === 'Pizzas' ? 'selected' : ''}>Pizzas</option><option value="Drinks" ${item.category === 'Drinks' ? 'selected' : ''}>Drinks</option><option value="Desserts" ${item.category === 'Desserts' ? 'selected' : ''}>Desserts</option></select></div>
      <div class="form-group"><label for="editItemPrice">Price (Tk) *</label><input type="number" id="editItemPrice" step="1" value="${item.price}" required></div>
      <div class="form-group"><label for="editItemDescription">Description *</label><textarea id="editItemDescription" required>${item.description}</textarea></div>
      <button type="submit" class="btn mt-2">Update Item</button>
    </form>
  `;
  document.getElementById('modal').classList.add('active');
};

window.handleEditMenuItem = (event, itemId) => {
  event.preventDefault();
  const item = state.menuItems.find(i => i.id === itemId);
  if (item) {
    item.name = document.getElementById('editItemName').value;
    item.category = document.getElementById('editItemCategory').value;
    item.price = parseFloat(document.getElementById('editItemPrice').value);
    item.description = document.getElementById('editItemDescription').value;
  }
  closeModal();
  showAlert('Menu item updated successfully!', 'success');
  renderApp();
};

window.deleteMenuItem = (itemId) => {
  if (confirm('Are you sure you want to delete this item?')) {
    state.menuItems = state.menuItems.filter(i => i.id !== itemId);
    showAlert('Menu item deleted successfully!', 'success');
    renderApp();
  }
};

window.viewOrderDetails = (orderId) => {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;
  document.getElementById('modalTitle').textContent = `Order #${order.id.slice(0, 8)}`;
  document.getElementById('modalBody').innerHTML = `
    <div>
      <h4>Customer Information</h4>
      <p><strong>Name:</strong> ${order.customer.name}</p><p><strong>Phone:</strong> ${order.customer.phone}</p><p><strong>Address:</strong> ${order.address}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p><p><strong>Status:</strong> ${order.status}</p><p><strong>Date:</strong> ${order.date}</p>
      <h4 class="mt-2">Order Items</h4>
      <table class="admin-table">
        <thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>
          ${order.items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>Tk ${item.price.toFixed(2)}</td><td>Tk ${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="summary-row total mt-2"><span>Total:</span><span>Tk ${order.total.toFixed(2)}</span></div>
    </div>
  `;
  document.getElementById('modal').classList.add('active');
};

window.previewImage = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('imagePreview').src = e.target.result;
      document.getElementById('imagePreview').style.display = 'block';
      document.getElementById('itemImageUrl').value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

window.closeModal = () => document.getElementById('modal').classList.remove('active');

function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '80px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.minWidth = '300px';
  document.body.appendChild(alertDiv);
  setTimeout(() => { alertDiv.remove(); }, 3000);
}

// ====================================================================================
// 7. INITIALIZATION
// ====================================================================================

function init() {
  auth.init();
  generateMockData();
  renderApp();
}

init();
