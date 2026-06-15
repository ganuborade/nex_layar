// ===========================
// API Helpers
// ===========================
const apiBase = '/api';
const tokenKey = 'nexlayar_token';
const userKey = 'nexlayar_user';

function getToken() {
    return localStorage.getItem(tokenKey);
}

function getUser() {
    const storedUser = localStorage.getItem(userKey);
    return storedUser ? JSON.parse(storedUser) : null;
}

async function apiRequest(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase}${path}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || 'Request failed.');
    }

    return data;
}

function formatPrice(amount) {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;
}

// ===========================
// Mobile Menu Toggle
// ===========================
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        }
    });
});

// ===========================
// Auth and Cart UI
// ===========================
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');
const authModal = document.getElementById('authModal');
const cartModal = document.getElementById('cartModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

function setAuthTab(tabName) {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.authTab === tabName);
    });
    loginForm.classList.toggle('active', tabName === 'login');
    registerForm.classList.toggle('active', tabName === 'register');
    authMessage.textContent = '';
}

function updateAuthButtons() {
    const user = getUser();

    if (user) {
        loginButton.textContent = user.name.split(' ')[0];
        registerButton.textContent = 'Logout';
    } else {
        loginButton.textContent = 'Login';
        registerButton.textContent = 'Register';
        cartCount.textContent = '0';
    }
}

function saveSession(data) {
    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(userKey, JSON.stringify(data.user));
    updateAuthButtons();
}

async function refreshCart() {
    if (!getToken()) {
        cartItems.innerHTML = '<p>Please login to view your cart.</p>';
        cartTotal.textContent = formatPrice(0);
        cartCount.textContent = '0';
        return;
    }

    const data = await apiRequest('/cart');
    cartCount.textContent = data.items.reduce((sum, item) => sum + item.quantity, 0);
    cartTotal.textContent = formatPrice(data.total);

    if (data.items.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    cartItems.innerHTML = data.items.map(item => `
        <div class="cart-item">
            <div>
                <h4>${item.title}</h4>
                <p>${formatPrice(item.price)} x ${item.quantity}</p>
            </div>
            <button type="button" data-remove-cart="${item.cart_id}">Remove</button>
        </div>
    `).join('');
}

loginButton.addEventListener('click', () => {
    setAuthTab('login');
    openModal(authModal);
});

registerButton.addEventListener('click', () => {
    if (getUser()) {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        updateAuthButtons();
        refreshCart();
        return;
    }

    setAuthTab('register');
    openModal(authModal);
});

cartButton.addEventListener('click', async () => {
    openModal(cartModal);
    try {
        await refreshCart();
    } catch (error) {
        cartItems.innerHTML = `<p>${error.message}</p>`;
    }
});

document.querySelectorAll('[data-close-modal]').forEach(button => {
    button.addEventListener('click', () => {
        closeModal(authModal);
        closeModal(cartModal);
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });
});

document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => setAuthTab(tab.dataset.authTab));
});

loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    authMessage.textContent = 'Logging in...';

    try {
        const formData = new FormData(loginForm);
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData))
        });

        saveSession(data);
        authMessage.textContent = 'Login successful.';
        closeModal(authModal);
        await refreshCart();
    } catch (error) {
        authMessage.textContent = error.message;
    }
});

registerForm.addEventListener('submit', async event => {
    event.preventDefault();
    authMessage.textContent = 'Creating account...';

    try {
        const formData = new FormData(registerForm);
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData))
        });

        saveSession(data);
        authMessage.textContent = 'Account created.';
        closeModal(authModal);
        await refreshCart();
    } catch (error) {
        authMessage.textContent = error.message;
    }
});

document.querySelectorAll('.add-cart-button').forEach(button => {
    button.addEventListener('click', async () => {
        if (!getToken()) {
            setAuthTab('login');
            openModal(authModal);
            authMessage.textContent = 'Please login or register before buying a project.';
            return;
        }

        button.disabled = true;
        button.textContent = 'Adding...';

        try {
            await apiRequest('/cart/items', {
                method: 'POST',
                body: JSON.stringify({ productId: button.dataset.productId, quantity: 1 })
            });
            await refreshCart();
            openModal(cartModal);
        } catch (error) {
            alert(error.message);
        } finally {
            button.disabled = false;
            button.textContent = 'Buy Project';
        }
    });
});

cartItems.addEventListener('click', async event => {
    const removeButton = event.target.closest('[data-remove-cart]');
    if (!removeButton) {
        return;
    }

    await apiRequest(`/cart/items/${removeButton.dataset.removeCart}`, {
        method: 'DELETE'
    });
    await refreshCart();
});

// ===========================
// Contact Form Handler
// ===========================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;

        if (name && email && message) {
            alert(`Thank you ${name}! Your message has been received. We'll get back to you soon at ${email}`);
            contactForm.reset();
        } else {
            alert('Please fill in all fields');
        }
    });
}

// ===========================
// Smooth Scroll Enhancement
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===========================
// Navbar Styling on Scroll
// ===========================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ===========================
// Scroll Animation for Cards
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .portfolio-item').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

updateAuthButtons();
refreshCart().catch(() => {});

console.log('NexLayar website loaded successfully!');
