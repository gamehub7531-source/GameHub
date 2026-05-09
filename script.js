// =================== PRODUCT DATA ===================
const products = [
    { id: 1, name: "Gaming Laptop RTX 4060", description: "15.6-inch 144Hz display, Intel i7, RTX 4060, 16GB RAM, 1TB SSD, RGB keyboard.", price: 74999, rating: 4.9, image: "https://m.media-amazon.com/images/I/61ko2a0owDL._AC_UY218_.jpg" },
    { id: 2, name: "Mechanical Gaming Keyboard", description: "RGB mechanical keyboard with hot-swappable switches, programmable macros, wrist rest.", price: 5999, rating: 4.8, image: "https://m.media-amazon.com/images/I/71w9I5LAUZL._AC_UY218_.jpg" },
    { id: 3, name: "Wireless Gaming Mouse", description: "25K DPI sensor, 8 programmable buttons, RGB lighting, 80-hour battery life.", price: 3999, rating: 4.7, image: "https://m.media-amazon.com/images/I/61qN9d08hgL._AC_UY218_.jpg" },
    { id: 4, name: "Gaming Headset", description: "7.1 surround sound, noise-cancelling mic, RGB lighting, memory foam ear cushions.", price: 4999, rating: 4.8, image: "https://m.media-amazon.com/images/I/51tVVALVrrL._AC_UY218_.jpg" },
    { id: 5, name: "Gaming Monitor 27\" 165Hz", description: "27-inch IPS, 165Hz refresh rate, 1ms response time, FreeSync, HDR, adjustable stand.", price: 19999, rating: 4.7, image: "https://m.media-amazon.com/images/I/71TAjaOnUAL._AC_UY218_.jpg" },
    { id: 6, name: "Gaming Chair", description: "Ergonomic racing style, lumbar support, adjustable armrests, recline function, RGB lighting.", price: 14999, rating: 4.6, image: "https://m.media-amazon.com/images/I/71WML8oexjL._AC_UL320_.jpg" },
    { id: 7, name: "Streaming Microphone", description: "USB condenser mic, RGB lighting, mute button, gain control, pop filter included.", price: 5999, rating: 4.7, image: "https://m.media-amazon.com/images/I/71s97KWopKL._AC_UL320_.jpg" },
    { id: 8, name: "4K Gaming Webcam", description: "4K Ultra HD, autofocus, dual microphones, privacy cover, tripod ready.", price: 7999, rating: 4.6, image: "https://m.media-amazon.com/images/I/61exJWcysXL._AC_UL320_.jpg" },
    { id: 9, name: "Gaming Controller", description: "Wireless controller, rechargeable battery, motion controls, compatible with PC/console.", price: 3999, rating: 4.8, image: "https://m.media-amazon.com/images/I/81zEnKswGsL._AC_UY218_.jpg" },
    { id: 10, name: "RGB Gaming Mouse Pad", description: "Large RGB mouse pad, 10 lighting modes, smooth surface, non-slip base.", price: 1499, rating: 4.5, image: "https://m.media-amazon.com/images/I/81PMu6LaRBL._AC_UY218_.jpg" },
    { id: 11, name: "Portable Gaming SSD 1TB", description: "External SSD, USB-C, 2000MB/s read speed, RGB lighting, compact design.", price: 8999, rating: 4.7, image: "https://m.media-amazon.com/images/I/81VKxjrWZdL._AC_UY218_.jpg" },
    { id: 12, name: "Gaming Speaker Bar", description: "RGB soundbar, 2.0 channel, Bluetooth 5.0, multiple EQ modes, desktop optimized.", price: 5999, rating: 4.6, image: "https://m.media-amazon.com/images/I/71qtorFg89L._AC_UY218_.jpg" }
];

// =================== RAZORPAY CONFIG ===================
const RAZORPAY_KEY = "rzp_test_SmOFnWICiUg85x";

// =================== GLOBAL STATE ===================
let user = null;
let cart = [];
let purchases = [];
let generatedOTP = null;
let sessionTimer = null;
let sessionWarningTimer = null;
let sessionExpiryTime = null;
let sessionCheckInterval = null;

// Cookie Names
const COOKIE_NAMES = {
    CONSENT: 'gamehub_cookie_consent',
    USER_SESSION: 'gamehub_user_session',
    CART: 'gamehub_cart',
    PURCHASES: 'gamehub_purchases'
};

const SESSION_TIMEOUT_MINUTES = 30;
const SESSION_WARNING_MINUTES = 5;
const REMEMBER_ME_DAYS = 7;

// DOM Elements
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const cartPage = document.getElementById('cart-page');
const paymentPage = document.getElementById('payment-page');
const purchasesPage = document.getElementById('purchases-page');
const loggedInUserSpan = document.getElementById('loggedInUser');
const productsContainer = document.getElementById('products');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartCountElement = document.getElementById('cartCount');
const navCartCount = document.getElementById('navCartCount');
const cartActions = document.getElementById('cartActions');
const purchasesList = document.getElementById('purchasesList');
const sendOtpBtn = document.getElementById('send-otp-btn');
const sendOtpText = document.getElementById('send-otp-text');
const otpSpinner = document.getElementById('otp-spinner');
const loginBtn = document.getElementById('login-btn');
const otpField = document.getElementById('otp-field');
const otpInput = document.getElementById('otp');
const paymentTotalElement = document.getElementById('paymentTotal');
const orderSummaryItems = document.getElementById('orderSummaryItems');
const paymentSuccess = document.getElementById('payment-success');
const orderNumberElement = document.getElementById('order-number');
const trackingNumberElement = document.getElementById('tracking-number');

// =================== HELPER FUNCTIONS ===================
function formatINR(price) {
    return '₹' + price.toLocaleString('en-IN');
}

// =================== PASSWORD VALIDATION ===================
function checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    if (password.length === 0) {
        return { score: 0, strength: 'none', feedback: 'Enter a password' };
    }
    
    if (password.length >= 8) {
        score++;
    } else {
        feedback.push('• At least 8 characters');
    }
    
    if (/[a-z]/.test(password)) {
        score++;
    } else {
        feedback.push('• One lowercase letter');
    }
    
    if (/[A-Z]/.test(password)) {
        score++;
    } else {
        feedback.push('• One uppercase letter');
    }
    
    if (/[0-9]/.test(password)) {
        score++;
    } else {
        feedback.push('• One number');
    }
    
    if (/[$@$!%*#?&]/.test(password)) {
        score++;
    } else {
        feedback.push('• One special character ($@$!%*#?&)');
    }
    
    let strength = '';
    let colorClass = '';
    
    if (score <= 2) {
        strength = 'weak';
        colorClass = 'weak';
    } else if (score <= 3) {
        strength = 'medium';
        colorClass = 'medium';
    } else if (score <= 4) {
        strength = 'strong';
        colorClass = 'strong';
    } else {
        strength = 'very-strong';
        colorClass = 'very-strong';
    }
    
    return {
        score: score,
        strength: strength,
        colorClass: colorClass,
        feedback: feedback,
        isValid: score >= 4
    };
}

function updatePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthBar = document.getElementById('strengthBar');
    const passwordHint = document.getElementById('passwordHint');
    
    if (!passwordInput || !strengthBar || !passwordHint) return;
    
    const password = passwordInput.value;
    const result = checkPasswordStrength(password);
    
    strengthBar.className = 'strength-bar ' + result.colorClass;
    
    if (password.length === 0) {
        passwordHint.innerHTML = 'Use 8+ characters with uppercase, lowercase, number & special character';
        passwordHint.className = 'password-hint';
    } else if (!result.isValid) {
        passwordHint.innerHTML = '❌ Password needs: <br>' + result.feedback.join('<br>');
        passwordHint.className = 'password-hint ' + result.colorClass;
    } else {
        passwordHint.innerHTML = '✅ Strong password!';
        passwordHint.className = 'password-hint ' + result.colorClass;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    notification.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}

function checkCookieConsent() {
    return getCookie(COOKIE_NAMES.CONSENT) === 'accepted';
}

function acceptCookies() {
    setCookie(COOKIE_NAMES.CONSENT, 'accepted', 365);
    document.getElementById('cookieConsent').style.display = 'none';
    showNotification('Cookie preferences saved!');
    if (user) saveUserSession(user, true);
    saveCart();
    if (purchases.length) setCookie(COOKIE_NAMES.PURCHASES, JSON.stringify(purchases), 365);
}

function declineCookies() {
    setCookie(COOKIE_NAMES.CONSENT, 'declined', 365);
    document.getElementById('cookieConsent').style.display = 'none';
    deleteCookie(COOKIE_NAMES.USER_SESSION);
    deleteCookie(COOKIE_NAMES.CART);
    deleteCookie(COOKIE_NAMES.PURCHASES);
    showNotification('Cookie preferences saved.', 'info');
}

function showCookiePolicy() {
    alert("🍪 Cookie Policy\n\nWe use cookies to:\n• Remember your login session\n• Save your shopping cart\n• Store your preferences\n\nYou can manage cookies in your browser settings.");
}

// =================== SESSION MANAGEMENT ===================
function saveUserSession(userData, rememberMe = false) {
    user = userData;
    const expiryTime = rememberMe ? Date.now() + (REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000) : Date.now() + (SESSION_TIMEOUT_MINUTES * 60 * 1000);
    const sessionData = { user: userData, expiry: expiryTime, created: Date.now() };
    localStorage.setItem('gamehubUser', JSON.stringify(sessionData));
    if (checkCookieConsent()) setCookie(COOKIE_NAMES.USER_SESSION, JSON.stringify(sessionData), rememberMe ? REMEMBER_ME_DAYS : null);
    loggedInUserSpan.textContent = userData.name;
    updateNavigation();
    startSessionTimer(expiryTime);
}

function startSessionTimer(expiryTime) {
    sessionExpiryTime = expiryTime;
    if (sessionTimer) clearTimeout(sessionTimer);
    if (sessionWarningTimer) clearTimeout(sessionWarningTimer);
    if (sessionCheckInterval) clearInterval(sessionCheckInterval);
    const timeRemaining = expiryTime - Date.now();
    if (timeRemaining <= 0) { logout(); return; }
    const warningTime = timeRemaining - (SESSION_WARNING_MINUTES * 60 * 1000);
    if (warningTime > 0) sessionWarningTimer = setTimeout(showSessionWarning, warningTime);
    else showSessionWarning();
    sessionTimer = setTimeout(logout, timeRemaining);
    sessionCheckInterval = setInterval(() => { if (user && getCookie(COOKIE_NAMES.USER_SESSION) && JSON.parse(getCookie(COOKIE_NAMES.USER_SESSION)).expiry <= Date.now()) logout(); }, 60000);
}

function showSessionWarning() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('sessionTimeout').style.display = 'block';
    let timeLeft = Math.floor((sessionExpiryTime - Date.now()) / 1000);
    const timerInterval = setInterval(() => {
        if (timeLeft <= 0) { clearInterval(timerInterval); logout(); return; }
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('sessionTimer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeLeft--;
    }, 1000);
}

function extendSession() {
    if (!user) return;
    const newExpiryTime = Date.now() + (SESSION_TIMEOUT_MINUTES * 60 * 1000);
    const sessionData = { user: user, expiry: newExpiryTime, created: Date.now() };
    localStorage.setItem('gamehubUser', JSON.stringify(sessionData));
    if (checkCookieConsent()) setCookie(COOKIE_NAMES.USER_SESSION, JSON.stringify(sessionData));
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('sessionTimeout').style.display = 'none';
    startSessionTimer(newExpiryTime);
    showNotification('Session extended!');
}

function logout() {
    user = null;
    localStorage.removeItem('gamehubUser');
    deleteCookie(COOKIE_NAMES.USER_SESSION);
    if (sessionTimer) clearTimeout(sessionTimer);
    if (sessionWarningTimer) clearTimeout(sessionWarningTimer);
    if (sessionCheckInterval) clearInterval(sessionCheckInterval);
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('sessionTimeout').style.display = 'none';
    loggedInUserSpan.textContent = 'Guest';
    updateNavigation();
    showPage('login');
    showNotification('Logged out successfully.', 'info');
}

function updateNavigation() {
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');
    if (user) {
        if (navLogin) navLogin.style.display = 'none';
        if (navLogout) navLogout.style.display = 'block';
    } else {
        if (navLogin) navLogin.style.display = 'block';
        if (navLogout) navLogout.style.display = 'none';
    }
}

// =================== PAGE MANAGEMENT ===================
function showPage(pageId) {
    const protectedPages = ['dashboard', 'cart', 'payment', 'purchases'];
    if (protectedPages.includes(pageId) && !user) {
        showNotification('Please login to access this page.', 'error');
        pageId = 'login';
    }
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`${pageId}-page`).classList.add('active');
    if (pageId === 'dashboard') renderProducts();
    else if (pageId === 'cart') renderCart();
    else if (pageId === 'payment') renderPaymentPage();
    else if (pageId === 'purchases') renderPurchases();
}

// =================== PRODUCTS ===================
function renderProducts() {
    if (!productsContainer) return;
    productsContainer.innerHTML = '';
    products.forEach(product => {
        const cartItem = cart.find(item => item.id === product.id);
        const quantityInCart = cartItem ? cartItem.quantity : 0;
        const starsHtml = Array(5).fill().map((_, i) => i < Math.floor(product.rating) ? '<i class="fas fa-star"></i>' : (i === Math.floor(product.rating) && product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : '<i class="far fa-star"></i>')).join('');
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">${starsHtml} <span>(${product.rating})</span></div>
                <div class="product-price">${formatINR(product.price)}</div>
                <div class="product-actions">
                    <button class="btn-cart" onclick="addToCart(${product.id})"><i class="fas fa-shopping-cart"></i> ${quantityInCart > 0 ? `In Cart (${quantityInCart})` : 'Add to Cart'}</button>
                    <button class="btn-buy" onclick="buyNow(${product.id})">Buy Now</button>
                </div>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

function searchProducts() {
    const term = document.getElementById('searchProducts').value.toLowerCase();
    if (!term) return renderProducts();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
    productsContainer.innerHTML = '';
    if (!filtered.length) {
        productsContainer.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><h3>No gaming gear found</h3></div>';
        return;
    }
    filtered.forEach(p => {
        const cartItem = cart.find(item => item.id === p.id);
        const starsHtml = Array(5).fill().map((_, i) => i < Math.floor(p.rating) ? '<i class="fas fa-star"></i>' : (i === Math.floor(p.rating) && p.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : '<i class="far fa-star"></i>')).join('');
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `<div class="product-img"><img src="${p.image}" alt="${p.name}"></div><div class="product-content"><h3 class="product-title">${p.name}</h3><p class="product-description">${p.description}</p><div class="product-rating">${starsHtml}</div><div class="product-price">${formatINR(p.price)}</div><div class="product-actions"><button class="btn-cart" onclick="addToCart(${p.id})"><i class="fas fa-shopping-cart"></i> ${cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}</button><button class="btn-buy" onclick="buyNow(${p.id})">Buy Now</button></div></div>`;
        productsContainer.appendChild(card);
    });
}

// =================== CART ===================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.quantity++;
    else cart.push({ id: productId, quantity: 1 });
    updateCartCount();
    saveCart();
    showNotification(`${product.name} added to your gaming cart!`);
    if (dashboardPage.classList.contains('active')) renderProducts();
    if (cartPage.classList.contains('active')) renderCart();
}

function buyNow(productId) {
    addToCart(productId);
    proceedToPayment();
}

function updateQuantity(productId, newQty) {
    if (newQty < 1) { removeFromCart(productId); return; }
    const item = cart.find(i => i.id === productId);
    if (item) { item.quantity = newQty; updateCartCount(); saveCart(); renderCart(); if (dashboardPage.classList.contains('active')) renderProducts(); }
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    updateCartCount();
    saveCart();
    renderCart();
    if (dashboardPage.classList.contains('active')) renderProducts();
    showNotification('Item removed from gaming cart', 'info');
}

function clearCart() {
    if (!cart.length) return;
    if (confirm('Clear your entire gaming cart?')) { cart = []; updateCartCount(); saveCart(); renderCart(); if (dashboardPage.classList.contains('active')) renderProducts(); showNotification('Gaming cart cleared', 'info'); }
}

function updateCartCount() {
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = count;
    if (navCartCount) navCartCount.textContent = count;
}

function saveCart() {
    localStorage.setItem('gamehubCart', JSON.stringify(cart));
    if (checkCookieConsent()) setCookie(COOKIE_NAMES.CART, JSON.stringify(cart), 30);
}

function renderCart() {
    if (!cartItemsContainer) return;
    if (!cart.length) {
        cartItemsContainer.innerHTML = `<div class="empty-cart"><i class="fas fa-shopping-cart fa-4x"></i><h3>Your gaming cart is empty</h3><button class="btn" onclick="showPage('dashboard')" style="width:auto;margin-top:20px;">Browse Gaming Gear</button></div>`;
        if (cartActions) cartActions.style.display = 'none';
        return;
    }
    let total = 0, itemsHtml = '';
    cart.forEach(item => {
        const p = products.find(pr => pr.id === item.id);
        if (p) {
            const itemTotal = p.price * item.quantity;
            total += itemTotal;
            itemsHtml += `<div class="cart-item"><div class="cart-item-img"><img src="${p.image}" alt="${p.name}"></div><div class="cart-item-details"><h3 class="cart-item-title">${p.name}</h3><div class="cart-item-price">${formatINR(p.price)} each</div></div><div class="cart-item-actions"><div class="quantity-control"><button class="quantity-btn" onclick="updateQuantity(${p.id}, ${item.quantity - 1})">-</button><span class="quantity">${item.quantity}</span><button class="quantity-btn" onclick="updateQuantity(${p.id}, ${item.quantity + 1})">+</button></div><div class="item-total">${formatINR(itemTotal)}</div><button class="btn-remove" onclick="removeFromCart(${p.id})"><i class="fas fa-trash-alt"></i> Remove</button></div></div>`;
        }
    });
    const shipping = total > 15000 ? 0 : 499;
    const tax = Math.round(total * 0.18);
    const grandTotal = total + shipping + tax;
    itemsHtml += `<div class="cart-summary"><div class="summary-row"><span>Subtotal:</span><span>${formatINR(total)}</span></div><div class="summary-row"><span>Shipping:</span><span>${shipping === 0 ? 'Free' : formatINR(shipping)}</span></div><div class="summary-row"><span>GST (18%):</span><span>${formatINR(tax)}</span></div><div class="summary-row total"><span>Total:</span><span>${formatINR(grandTotal)}</span></div></div>`;
    cartItemsContainer.innerHTML = itemsHtml;
    if (cartTotalElement) cartTotalElement.textContent = `Total: ${formatINR(grandTotal)}`;
    if (cartActions) cartActions.style.display = 'flex';
}

function proceedToPayment() {
    if (!cart.length) { showNotification('Your gaming cart is empty', 'error'); return; }
    if (!user) { showPage('login'); showNotification('Please login to checkout your gaming gear', 'error'); return; }
    showPage('payment');
}

// =================== PAYMENT ===================
function renderPaymentPage() {
    if (!cart.length) { 
        showPage('cart'); 
        return; 
    }
    
    // Show the order summary
    const orderSummaryDiv = document.querySelector('.order-summary');
    if (orderSummaryDiv) orderSummaryDiv.style.display = 'block';
    
    // Show both payment buttons
    const payNowBtn = document.getElementById('pay-now-btn');
    if (payNowBtn) payNowBtn.style.display = 'block';
    
    const codBtn = document.getElementById('cod-btn');
    if (codBtn) codBtn.style.display = 'block';
    
    // Show the back button
    const backButton = document.querySelector('.payment-container button.btn-secondary:not(#cod-btn)');
    if (backButton) backButton.style.display = 'block';
    
    // Show/hide the "OR" divider appropriately
    const orDiv = document.querySelector('.payment-container div[style*="text-align: center"]');
    if (orDiv) {
        orDiv.style.display = payNowBtn && codBtn && payNowBtn.style.display !== 'none' && codBtn.style.display !== 'none' ? 'block' : 'none';
    }
    
    // Hide success message
    if (paymentSuccess) paymentSuccess.style.display = 'none';
    
    let total = 0, orderHtml = '';
    cart.forEach(item => {
        const p = products.find(pr => pr.id === item.id);
        if (p) {
            const itemTotal = p.price * item.quantity;
            total += itemTotal;
            orderHtml += `<div class="order-summary-item"><span>${p.name} x${item.quantity}</span><span>${formatINR(itemTotal)}</span></div>`;
        }
    });
    const shipping = total > 15000 ? 0 : 499;
    const tax = Math.round(total * 0.18);
    const grandTotal = total + shipping + tax;
    orderHtml += `<div class="order-summary-item"><span>Shipping</span><span>${shipping === 0 ? 'Free' : formatINR(shipping)}</span></div><div class="order-summary-item"><span>GST (18%)</span><span>${formatINR(tax)}</span></div>`;
    if (orderSummaryItems) orderSummaryItems.innerHTML = orderHtml;
    if (paymentTotalElement) paymentTotalElement.textContent = formatINR(grandTotal);
    window.razorpayAmount = grandTotal;
}

function openCOD() {
    if (!cart.length) {
        showNotification('Your gaming cart is empty', 'error');
        return;
    }
    
    if (confirm('📦 Confirm Cash on Delivery Order?\n\nYou will pay ₹' + window.razorpayAmount.toLocaleString('en-IN') + ' when your gaming gear is delivered.\n\nClick OK to place your COD order.')) {
        completeCODPayment();
    }
}

function completeCODPayment() {
    const orderId = Math.floor(100000 + Math.random() * 900000);
    const trackingId = `GH-TRACK-${Math.floor(100000 + Math.random() * 900000)}`;
    
    if (orderNumberElement) orderNumberElement.textContent = orderId;
    if (trackingNumberElement) trackingNumberElement.textContent = trackingId.split('-')[2];
    
    cart.forEach(item => {
        purchases.push({
            productId: item.id,
            quantity: item.quantity,
            date: new Date().toISOString(),
            orderId: orderId,
            trackingId: trackingId,
            paymentMethod: 'Cash on Delivery',
            paymentId: 'COD-' + Date.now(),
            status: 'confirmed'
        });
    });
    
    localStorage.setItem('gamehubPurchases', JSON.stringify(purchases));
    if (checkCookieConsent()) setCookie(COOKIE_NAMES.PURCHASES, JSON.stringify(purchases), 365);
    
    cart = [];
    updateCartCount();
    saveCart();
    
    if (paymentSuccess) paymentSuccess.style.display = 'block';
    showNotification(`✅ COD Order placed! Order #GH-${orderId} confirmed. Pay ₹${window.razorpayAmount.toLocaleString('en-IN')} on delivery.`);
}

function openRazorpay() {
    const amount = window.razorpayAmount;
    if (!amount || amount <= 0) { showNotification('Invalid amount', 'error'); return; }
    const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "GameHub",
        description: "Gaming Order Payment",
        image: "https://img.icons8.com/color/48/gamepad.png",
        handler: function(response) {
            if (response.razorpay_payment_id) {
                completePayment(response.razorpay_payment_id);
            } else {
                showNotification('Payment failed', 'error');
            }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: "#FF2E9E" }
    };
    const rzp = new Razorpay(options);
    rzp.open();
}

function completePayment(paymentId) {
    const orderId = Math.floor(100000 + Math.random() * 900000);
    const trackingId = `GH-TRACK-${Math.floor(100000 + Math.random() * 900000)}`;
    if (orderNumberElement) orderNumberElement.textContent = orderId;
    if (trackingNumberElement) trackingNumberElement.textContent = trackingId.split('-')[2];
    
    cart.forEach(item => {
        purchases.push({
            productId: item.id,
            quantity: item.quantity,
            date: new Date().toISOString(),
            orderId: orderId,
            trackingId: trackingId,
            paymentMethod: 'Razorpay',
            paymentId: paymentId,
            status: 'confirmed'
        });
    });
    
    localStorage.setItem('gamehubPurchases', JSON.stringify(purchases));
    if (checkCookieConsent()) setCookie(COOKIE_NAMES.PURCHASES, JSON.stringify(purchases), 365);
    
    cart = [];
    updateCartCount();
    saveCart();
    
    if (paymentSuccess) paymentSuccess.style.display = 'block';
    showNotification(`✅ Payment successful! Order #GH-${orderId} confirmed. You can track your order in Purchases.`);
}

// =================== PURCHASES WITH REALISTIC TRACKING ===================
function renderPurchases() {
    if (!purchasesList) return;
    if (!purchases.length) {
        purchasesList.innerHTML = `<div class="empty-purchases"><i class="fas fa-box-open fa-4x"></i><h3>No gaming purchases yet</h3><button class="btn" onclick="showPage('dashboard')" style="width:auto;">Start Shopping</button></div>`;
        return;
    }
    let html = '';
    purchases.slice().reverse().forEach(p => {
        const product = products.find(pr => pr.id === p.productId);
        if (product) {
            const status = getOrderStatus(p.date);
            const statusClass = status.toLowerCase().replace(/\s/g, '');
            const trackingDetails = getTrackingDetails(p.orderId, p.date);
            
            html += `<div class="purchase-card">
                <div class="purchase-header">
                    <span class="order-id">Order #GH-${p.orderId}</span>
                    <span>${new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="purchase-body">
                    <img src="${product.image}" class="purchase-img">
                    <div class="purchase-details">
                        <h3>${product.name}</h3>
                        <p>Quantity: ${p.quantity}</p>
                        <p class="purchase-price">${formatINR(product.price * p.quantity)}</p>
                        <p>Payment: ${p.paymentMethod}</p>
                        <div class="purchase-status status-${statusClass}">${status}</div>
                    </div>
                </div>
                <div class="tracking-info">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                        <div><i class="fas fa-truck"></i> <strong>Courier:</strong> ${trackingDetails.courier}</div>
                        <div><i class="fas fa-barcode"></i> <strong>AWB No:</strong> ${trackingDetails.awb}</div>
                        <div><i class="fas fa-calendar-alt"></i> <strong>Est. Delivery:</strong> ${trackingDetails.estimatedDelivery}</div>
                    </div>
                    <div style="margin-top: 12px;">
                        <i class="fas fa-map-marker-alt"></i> <strong>Current Location:</strong> ${trackingDetails.location}
                    </div>
                    <div style="margin-top: 12px;">
                        <i class="fas fa-clock"></i> <strong>Last Updated:</strong> ${trackingDetails.lastUpdated}
                    </div>
                    <div style="margin-top: 15px;">
                        <button class="btn-track" onclick="trackOrder('${p.trackingId}')"><i class="fas fa-map-marker-alt"></i> Track Gaming Gear</button>
                    </div>
                </div>
            </div>`;
        }
    });
    purchasesList.innerHTML = html;
}

function getOrderStatus(purchaseDate) {
    const daysSince = Math.floor((Date.now() - new Date(purchaseDate)) / (1000 * 60 * 60 * 24));
    
    if (daysSince >= 7) return "Delivered";
    if (daysSince >= 5) return "Out for Delivery";
    if (daysSince >= 3) return "Shipped";
    if (daysSince >= 1) return "Processing";
    return "Confirmed";
}

function getTrackingDetails(orderId, purchaseDate) {
    const couriers = ['BlueDart', 'Delhivery', 'DTDC', 'Amazon Logistics', 'Ekart', 'Xpressbees', 'GameCourier'];
    const locations = [
        'Mumbai Gaming Hub',
        'Delhi Tech Warehouse', 
        'Bangalore Electronics Center',
        'Chennai Distribution Point',
        'Kolkata Logistics Hub',
        'Hyderabad Gaming Warehouse'
    ];
    
    const daysSince = Math.floor((Date.now() - new Date(purchaseDate)) / (1000 * 60 * 60 * 24));
    const courierIndex = orderId % couriers.length;
    const locationIndex = (orderId + daysSince) % locations.length;
    
    let location = locations[locationIndex];
    let lastUpdated = '';
    
    if (daysSince >= 7) {
        location = 'Delivered to your gaming setup!';
        lastUpdated = 'Today, 10:30 AM';
    } else if (daysSince >= 5) {
        location = 'Out for delivery from local gaming hub';
        lastUpdated = 'Today, 8:00 AM';
    } else if (daysSince >= 3) {
        location = locations[locationIndex] + ' - In Transit';
        lastUpdated = 'Yesterday, 6:00 PM';
    } else if (daysSince >= 1) {
        location = 'Order processed at ' + locations[locationIndex];
        lastUpdated = 'Today, 2:00 AM';
    } else {
        location = 'Awaiting pickup by gaming courier';
        lastUpdated = 'Just now';
    }
    
    const estimatedDays = 7 - daysSince;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + estimatedDays);
    
    return {
        courier: couriers[courierIndex],
        awb: 'GH' + orderId + Math.floor(Math.random() * 10000),
        location: location,
        lastUpdated: lastUpdated,
        estimatedDelivery: estDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
}

function trackOrder(trackingId) {
    const order = purchases.find(p => p.trackingId === trackingId);
    if (order) {
        const daysSince = Math.floor((Date.now() - new Date(order.date)) / (1000 * 60 * 60 * 24));
        let message = '';
        
        if (daysSince >= 7) {
            message = `✅ Gaming Gear ${trackingId} has been DELIVERED! Time to level up your setup!`;
        } else if (daysSince >= 5) {
            message = `🎮 Gaming Gear ${trackingId} is OUT FOR DELIVERY today! Get ready to game!`;
        } else if (daysSince >= 3) {
            message = `📦 Gaming Gear ${trackingId} has been SHIPPED! Track your package at our courier partner.`;
        } else if (daysSince >= 1) {
            message = `⚙️ Gaming Gear ${trackingId} is being PROCESSED. You'll receive tracking updates soon.`;
        } else {
            message = `✅ Gaming Gear ${trackingId} has been CONFIRMED! We'll notify you once it ships.`;
        }
        
        showNotification(message, 'info');
    } else {
        showNotification(`Gaming order ${trackingId} not found. Please check and try again.`, 'error');
    }
}

// =================== OTP LOGIN ===================
function generateOTP() { return Math.floor(100000 + Math.random() * 900000).toString(); }

async function sendOTPviaEmail(email, name, otp) {
    try {
        const response = await emailjs.send('service_a21ydfw', 'template_d1o2p6h', { to_email: email, to_name: name, otp_code: otp });
        return response.status === 200;
    } catch (error) { console.error('EmailJS error:', error); return false; }
}

if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', async function() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // ===== EMAIL VALIDATION =====
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address (e.g., name@example.com)', 'error');
            return;
        }
        
        if (email.includes(' ')) {
            showNotification('Email cannot contain spaces', 'error');
            return;
        }
        // ===== END EMAIL VALIDATION =====
        
        if (!name || !email || !mobile || !password) { 
            showNotification('Please fill all fields', 'error'); 
            return; 
        }
        
        if (!/^\d{10}$/.test(mobile)) { 
            showNotification('Enter valid 10-digit mobile', 'error'); 
            return; 
        }
        
        const passwordValidation = checkPasswordStrength(password);
        if (!passwordValidation.isValid) {
            showNotification('Password is weak! ' + passwordValidation.feedback.join(', '), 'error');
            return;
        }
        
        sendOtpText.style.display = 'none';
        otpSpinner.style.display = 'block';
        sendOtpBtn.disabled = true;
        generatedOTP = generateOTP();
        const emailSent = await sendOTPviaEmail(email, name, generatedOTP);
        otpField.style.display = 'block';
        loginBtn.style.display = 'block';
        sendOtpBtn.style.display = 'none';
        showNotification(emailSent ? `OTP sent to ${email}` : 'Demo Mode: Using test OTP', emailSent ? 'success' : 'info');
        sendOtpText.style.display = 'block';
        otpSpinner.style.display = 'none';
        sendOtpBtn.disabled = false;
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', function() {
        if (otpInput.value === generatedOTP) {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const rememberMe = document.getElementById('rememberMe').checked;
            saveUserSession({ name: name, email: email, loginTime: new Date().toISOString() }, rememberMe);
            showPage('dashboard');
            showNotification(`Welcome ${name} to GameHub! Let's level up your gaming setup!`);
            generatedOTP = null;
            otpInput.value = '';
            otpField.style.display = 'none';
            loginBtn.style.display = 'none';
            sendOtpBtn.style.display = 'block';
        } else {
            showNotification('Invalid OTP', 'error');
        }
    });
}

// =================== CHATBOT ===================
function toggleChatbot() {
    const container = document.getElementById('chatbotContainer');
    if (container) container.classList.toggle('active');
}

function handleChatbotKeypress(event) { if (event.key === 'Enter') sendChatbotMessage(); }

function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    addChatbotMessage(msg, 'user');
    input.value = '';
    showChatbotTyping(true);
    setTimeout(() => {
        showChatbotTyping(false);
        const response = getChatbotResponse(msg);
        addChatbotMessage(response, 'bot');
    }, 800);
}

function addChatbotMessage(message, sender) {
    const container = document.getElementById('chatbotMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `message ${sender}-message`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `<div class="message-content"><p>${message.replace(/\n/g, '<br>')}</p></div><span class="message-time">${time}</span>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function showChatbotTyping(show) {
    const typing = document.getElementById('chatbotTyping');
    if (typing) typing.style.display = show ? 'flex' : 'none';
}

function getChatbotResponse(message) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.match(/\b(hi|hello|hey|namaste|yo|sup)\b/)) return "Hey Gamer! 🎮 Welcome to GameHub. Ready to level up your setup? How can I help you today?";
    if (lowerMsg.match(/\b(product|item|shop|buy|gear)\b/)) {
        if (lowerMsg.includes('laptop')) return "Our Gaming Laptop RTX 4060 is ₹74,999 with 144Hz display and RGB keyboard! Perfect for competitive gaming!";
        if (lowerMsg.includes('keyboard')) return "Mechanical Gaming Keyboard is ₹5,999 with RGB lighting and hot-swappable switches!";
        if (lowerMsg.includes('mouse')) return "Wireless Gaming Mouse is ₹3,999 with 25K DPI sensor and RGB lighting!";
        if (lowerMsg.includes('headset') || lowerMsg.includes('headphone')) return "Gaming Headset is ₹4,999 with 7.1 surround sound and noise-cancelling mic!";
        if (lowerMsg.includes('monitor')) return "Gaming Monitor 27\" 165Hz is ₹19,999 with 1ms response time - ultra smooth gameplay!";
        if (lowerMsg.includes('chair')) return "Gaming Chair is ₹14,999 with RGB lighting and lumbar support for those long gaming sessions!";
        return "We have epic gaming gear! 🎮\n• Gaming Laptop (₹74,999)\n• Mechanical Keyboard (₹5,999)\n• Gaming Mouse (₹3,999)\n• Gaming Headset (₹4,999)\n• Gaming Monitor (₹19,999)\n• Gaming Chair (₹14,999)\n• And more! Which gaming gear interests you?";
    }
    if (lowerMsg.match(/\b(price|cost|rate)\b/)) {
        const productMatch = products.find(p => lowerMsg.includes(p.name.toLowerCase()) || lowerMsg.includes(p.name.toLowerCase().split(' ')[0]));
        if (productMatch) return `${productMatch.name} costs ${formatINR(productMatch.price)}. Ready to add it to your gaming cart?`;
        return "Here are our gaming gear prices:\n• Gaming Laptop: ₹74,999\n• Mechanical Keyboard: ₹5,999\n• Gaming Mouse: ₹3,999\n• Gaming Headset: ₹4,999\n• Gaming Monitor: ₹19,999\n• Gaming Chair: ₹14,999\n• Streaming Mic: ₹5,999\n• Gaming Controller: ₹3,999\nWhich one catches your eye?";
    }
    if (lowerMsg.match(/\b(track|order|delivery)\b/)) return "To track your gaming gear order, go to the Purchases page in your account. You'll find all your orders with tracking IDs there.";
    if (lowerMsg.match(/\b(pay|payment|razorpay)\b/)) return "We use Razorpay for secure payments. You can pay using Credit/Debit cards, UPI, Net Banking, or Wallets. Click 'Proceed to Payment' to checkout your gaming gear.";
    if (lowerMsg.match(/\b(offer|discount|coupon)\b/)) return "🎮 Current GameHub Offers:\n• Free shipping on orders above ₹15,000\n• Use code 'GAMEON10' for 10% off your first gaming purchase!";
    if (lowerMsg.match(/\b(return|refund)\b/)) return "We have a 30-day return policy on gaming gear. Items must be unused and in original packaging. Contact support to initiate a return.";
    if (lowerMsg.match(/\b(contact|support|help)\b/)) return "You can reach our GameHub support team:\n• WhatsApp: Click the green WhatsApp button\n• Email: support@gamehub.com\n• Phone: 1800-GAME-HUB";
    if (lowerMsg.match(/\b(thank|thanks)\b/)) return "You're welcome, gamer! 😊 Is there anything else gaming-related I can help you with?";
    if (lowerMsg.match(/\b(bye|goodbye)\b/)) return "Goodbye, gamer! 👋 Thanks for chatting with GameBuddy. Come back anytime for epic gaming gear! GG!";
    return "I'm GameBuddy, your gaming assistant! I can help you with:\n• Gaming gear info and prices\n• Order tracking\n• Payment methods\n• Offers and discounts\n• Returns and support\nWhat would you like to know, gamer?";
}

function quickChatbotAction(action) {
    let response = '';
    if (action === 'products') response = getChatbotResponse('products');
    else if (action === 'prices') response = getChatbotResponse('prices');
    else if (action === 'help') response = getChatbotResponse('help');
    else if (action === 'offers') response = getChatbotResponse('offers');
    addChatbotMessage(response, 'bot');
}

// =================== INITIALIZATION ===================
document.addEventListener('DOMContentLoaded', function() {
    emailjs.init("tm1KYJzOrMbuUQEjs");
    
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keyup', updatePasswordStrength);
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
    
    document.getElementById('cookieConsent').style.display = getCookie(COOKIE_NAMES.CONSENT) ? 'none' : 'block';
    const savedUser = localStorage.getItem('gamehubUser');
    if (savedUser) {
        try {
            const data = JSON.parse(savedUser);
            if (data.expiry > Date.now()) {
                user = data.user;
                loggedInUserSpan.textContent = user.name;
                updateNavigation();
                startSessionTimer(data.expiry);
                showPage('dashboard');
            }
        } catch(e) {}
    }
    const savedCart = localStorage.getItem('gamehubCart');
    if (savedCart) { cart = JSON.parse(savedCart); updateCartCount(); }
    const savedPurchases = localStorage.getItem('gamehubPurchases');
    if (savedPurchases) purchases = JSON.parse(savedPurchases);
    renderProducts();
    if (!user) showPage('login');
});
