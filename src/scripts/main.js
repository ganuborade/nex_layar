// Dynamic Base URL for backend API requests (supports local and deployed modes)
const getApiBaseUrl = () => {
    const { hostname, port, protocol } = window.location;
    const explicitUrl = window.API_BASE_URL || window.API_BASE_URL_OVERRIDE;
    if (explicitUrl) {
        return explicitUrl;
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1' || protocol === 'file:') {
        return port === '5000' ? '' : 'http://127.0.0.1:5000';
    }

    // On static hosts like GitHub Pages, a separately deployed backend is required.
    return '';
};
window.API_BASE_URL = window.API_BASE_URL || getApiBaseUrl();
const API_BASE_URL = window.API_BASE_URL;
const IS_LOCAL_BACKEND = window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
    || window.location.protocol === 'file:'
    || Boolean(API_BASE_URL);

function apiFetch(path, options = {}) {
    if (!IS_LOCAL_BACKEND && !API_BASE_URL) {
        return Promise.reject(new Error('Backend API unavailable. Deploy Flask backend and set window.API_BASE_URL to its URL.'));
    }
    const url = (API_BASE_URL || '') + path;
    return fetch(url, options);
}
window.apiFetch = apiFetch;

const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.style.display === 'flex';
        navLinks.style.display = isOpen ? 'none' : 'flex';
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks && navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        }
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (event) {
        event.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.style.boxShadow =
            window.scrollY > 50
                ? '0 5px 20px rgba(0, 0, 0, 0.15)'
                : '0 2px 10px rgba(0, 0, 0, 0.1)';
    });
}

// Animation Observer
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

document.querySelectorAll(
    '.service-card, .portfolio-item, .project-card, .skill-card, .pricing-card'
).forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    observer.observe(card);
});

// Active Navbar Link
window.addEventListener('scroll', () => {

    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {

        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');

        const navLink = document.querySelector(
            `.nav-links a[href="#${sectionId}"]`
        );

        if (
            navLink &&
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
        ) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.style.opacity = '0.7';
            });

            navLink.style.opacity = '1';
        }
    });
});

console.log('NexLayar website loaded successfully!');

// ==========================================
// 1. Toast Notification Helper
// ==========================================
window.showToast = function (message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return null;

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'loading') iconClass = 'fa-spinner fa-spin';

    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;

    // Handle close button click
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    container.appendChild(toast);

    // Auto-remove after 4 seconds (unless it's a loading state, which requires manual removal)
    if (type !== 'loading') {
        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 4000);
    }

    return toast;
};

// ==========================================
// 2. Light/Dark Theme Toggler
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    // Check local storage for theme
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            if (themeIcon) {
                themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
            window.showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`, 'success');
        });
    }
});

// ==========================================
// 3. Interactive Pricing Plan Selection
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Select all choose plan buttons
    const pricingCards = document.querySelectorAll('.pricing-card');

    pricingCards.forEach(card => {
        const h3 = card.querySelector('h3');
        if (!h3) return;
        const planName = h3.innerText;

        const amountSpan = card.querySelector('.amount');
        const priceAmount = amountSpan ? amountSpan.innerText : '0';

        const chooseBtn = card.querySelector('button');

        if (chooseBtn) {
            chooseBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const messageTextarea = document.getElementById('message');
                const nameInput = document.getElementById('name');
                const contactSection = document.getElementById('contact');

                if (messageTextarea) {
                    if (planName.toLowerCase().includes('enterprise')) {
                        messageTextarea.value = `Hi NexLayar Team! I am interested in discussing your Enterprise Plan. Please contact me to align on our project scope.`;
                    } else {
                        messageTextarea.value = `Hi NexLayar Team! I am interested in purchasing your "${planName}" pricing plan (₹${priceAmount}). Please get back to me.`;
                    }
                }

                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    window.showToast(`Selected the ${planName} Plan! Fill details to submit.`, 'success');

                    if (nameInput) {
                        setTimeout(() => nameInput.focus(), 800);
                    }
                }
            });
        }
    });
});

// ==========================================
// 4. Admin Messages & Stats Dashboard Panel
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const adminTrigger = document.getElementById('adminTrigger');
    const adminDrawer = document.getElementById('adminDrawer');
    const adminCloseBtn = document.getElementById('adminCloseBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    const adminAuthSection = document.getElementById('adminAuthSection');
    const adminContentSection = document.getElementById('adminContentSection');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminAuthError = document.getElementById('adminAuthError');

    const adminRefreshBtn = document.getElementById('adminRefreshBtn');
    const adminMessagesList = document.getElementById('adminMessagesList');
    const adminMessageCount = document.getElementById('adminMessageCount');

    const visitorsRefreshBtn = document.getElementById('visitorsRefreshBtn');
    const adminVisitorsList = document.getElementById('adminVisitorsList');

    const ADMIN_PASSWORD = "Tiger123"; // Updated admin password

    // Open Drawer
    if (adminTrigger && adminDrawer) {
        adminTrigger.addEventListener('click', () => {
            adminDrawer.classList.add('open');
            checkSessionAuth();
        });
    }

    // Close Drawer
    if (adminCloseBtn && adminDrawer) {
        adminCloseBtn.addEventListener('click', () => {
            adminDrawer.classList.remove('open');
        });
    }

    // Handle Logout
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('admin_authenticated');
            checkSessionAuth();
            window.showToast("Logged out successfully", "success");
        });
    }

    // Fetch public stats counts (Total Views)
    async function loadPublicStats() {
        const totalVisitsEl = document.getElementById('statPublicTotalVisits');

        try {
            const response = await apiFetch("/api/public/stats");
            const result = await response.json();

            if (response.ok && result.success) {
                if (totalVisitsEl) totalVisitsEl.innerText = result.total_visits || 0;
            }
        } catch (error) {
            console.error("Fetch Public Stats Error:", error);
        }
    }

    // Check if session is already authenticated
    function checkSessionAuth() {
        // Load public counts immediately for everyone
        loadPublicStats();

        const totalCol = document.getElementById('totalVisitsCol');
        const uniqueCol = document.getElementById('uniqueVisitorsCol');

        if (sessionStorage.getItem('admin_authenticated') === 'true') {
            if (adminAuthSection) adminAuthSection.classList.add('d-none');
            if (adminContentSection) adminContentSection.classList.remove('d-none');
            if (adminLogoutBtn) adminLogoutBtn.classList.remove('d-none');
            
            // Show Unique Guests box and adjust Total Views box
            if (totalCol) {
                totalCol.classList.remove('col-12');
                totalCol.classList.add('col-6');
            }
            if (uniqueCol) {
                uniqueCol.classList.remove('d-none');
            }

            loadMessages();
            loadStats();
        } else {
            if (adminAuthSection) adminAuthSection.classList.remove('d-none');
            if (adminContentSection) adminContentSection.classList.add('d-none');
            if (adminLogoutBtn) adminLogoutBtn.classList.add('d-none');
            
            // Hide Unique Guests box and adjust Total Views box
            if (totalCol) {
                totalCol.classList.remove('col-6');
                totalCol.classList.add('col-12');
            }
            if (uniqueCol) {
                uniqueCol.classList.add('d-none');
            }
        }
    }


    // Handle Login
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', performLogin);
    }
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') performLogin();
        });
    }

    function performLogin() {
        if (adminPasswordInput && adminPasswordInput.value === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_authenticated', 'true');
            sessionStorage.setItem('admin_password', adminPasswordInput.value); // Store password for API auth
            if (adminAuthError) adminAuthError.classList.add('d-none');
            adminPasswordInput.value = '';
            window.showToast("Logged in as Admin", "success");
            checkSessionAuth();
        } else {
            if (adminAuthError) adminAuthError.classList.remove('d-none');
            window.showToast("Invalid admin password", "error");
        }
    }

    // Load Messages from Backend
    async function loadMessages() {
        if (!adminMessagesList) return;
        adminMessagesList.innerHTML = '<div class="text-center text-muted py-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-2">Fetching messages...</p></div>';

        try {
            const response = await apiFetch("/api/messages", {
                headers: {
                    "Authorization": sessionStorage.getItem('admin_password') || ''
                }
            });

            if (response.status === 401) {
                sessionStorage.removeItem('admin_authenticated');
                sessionStorage.removeItem('admin_password');
                checkSessionAuth();
                window.showToast("Session unauthorized. Please login again.", "error");
                return;
            }

            const result = await response.json();

            if (response.ok && result.success) {
                const messages = result.messages || [];
                if (adminMessageCount) {
                    adminMessageCount.innerText = `${messages.length} Message${messages.length === 1 ? '' : 's'}`;
                }

                if (messages.length === 0) {
                    adminMessagesList.innerHTML = '<div class="text-center text-muted py-5"><i class="far fa-folder-open fa-2x"></i><p class="mt-2">No messages received yet.</p></div>';
                    return;
                }

                let listHtml = '';
                messages.forEach(msg => {
                    listHtml += `
                        <div class="message-card" id="msg-card-${msg.id}">
                            <button class="message-delete-btn" onclick="deleteMessage(${msg.id})" title="Delete Message">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                            <div class="message-card-header">
                                <span class="message-card-name">${escapeHtml(msg.name)}</span>
                                <span class="message-card-date">${msg.created_at || ''}</span>
                            </div>
                            <div class="message-card-email">${escapeHtml(msg.email)}</div>
                            <div class="message-card-body">${escapeHtml(msg.message)}</div>
                        </div>
                    `;
                });
                adminMessagesList.innerHTML = listHtml;
            } else {
                throw new Error(result.message || "Failed to load messages.");
            }
        } catch (error) {
            console.error("Fetch Messages Error:", error);
            adminMessagesList.innerHTML = `
                <div class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <p class="mt-2">Could not load messages.</p>
                    <small class="text-muted">Is Flask running on port 5000?</small>
                </div>
            `;
        }
    }

    // Load Stats and Visitor IPs from Backend
    async function loadStats() {
        const totalVisitsEl = document.getElementById('statPublicTotalVisits');
        const uniqueVisitorsEl = document.getElementById('statPublicUniqueVisitors');

        if (!adminVisitorsList) return;
        adminVisitorsList.innerHTML = '<div class="text-center text-muted py-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-2">Loading stats...</p></div>';

        try {
            const response = await apiFetch("/api/stats", {
                headers: {
                    "Authorization": sessionStorage.getItem('admin_password') || ''
                }
            });

            if (response.status === 401) {
                sessionStorage.removeItem('admin_authenticated');
                sessionStorage.removeItem('admin_password');
                checkSessionAuth();
                return;
            }

            const result = await response.json();

            if (response.ok && result.success) {
                if (totalVisitsEl) totalVisitsEl.innerText = result.total_visits || 0;
                if (uniqueVisitorsEl) uniqueVisitorsEl.innerText = result.unique_visitors || 0;

                const visitors = result.recent_visitors || [];
                if (visitors.length === 0) {
                    adminVisitorsList.innerHTML = '<div class="text-center text-muted py-5"><i class="fas fa-history fa-2x"></i><p class="mt-2">No visitor history logged yet.</p></div>';
                    return;
                }

                let tableHtml = `
                    <div class="table-responsive">
                        <table class="table table-sm table-hover" style="font-size: 0.8rem; margin: 0; color: var(--text-dark);">
                            <thead>
                                <tr class="text-muted">
                                    <th>IP Address</th>
                                    <th class="text-end">Time Visited</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                visitors.forEach(v => {
                    tableHtml += `
                        <tr>
                            <td><span class="badge bg-light text-dark font-monospace">${escapeHtml(v.ip_address)}</span></td>
                            <td class="text-end text-muted font-monospace">${v.visited_at || ''}</td>
                        </tr>
                    `;
                });

                tableHtml += `
                            </tbody>
                        </table>
                    </div>
                `;
                adminVisitorsList.innerHTML = tableHtml;
            } else {
                throw new Error(result.message || "Failed to load stats.");
            }
        } catch (error) {
            console.error("Fetch Stats Error:", error);
            adminVisitorsList.innerHTML = `
                <div class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <p class="mt-2">Could not load visitor stats.</p>
                </div>
            `;
        }
    }

    // Refresh Buttons Clicks
    if (adminRefreshBtn) {
        adminRefreshBtn.addEventListener('click', loadMessages);
    }
    if (visitorsRefreshBtn) {
        visitorsRefreshBtn.addEventListener('click', loadStats);
    }

    // Expose refresh message function to other scripts
    window.refreshAdminMessages = loadMessages;

    // Helper to escape HTML tags to prevent XSS
    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Delete message logic
    window.deleteMessage = async function (id) {
        if (!confirm("Are you sure you want to delete this message?")) return;

        const card = document.getElementById(`msg-card-${id}`);
        const deleteBtn = card ? card.querySelector('.message-delete-btn') : null;
        if (deleteBtn) deleteBtn.disabled = true;

        try {
            const response = await apiFetch(`/api/messages/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": sessionStorage.getItem('admin_password') || ''
                }
            });

            if (response.status === 401) {
                sessionStorage.removeItem('admin_authenticated');
                sessionStorage.removeItem('admin_password');
                checkSessionAuth();
                window.showToast("Unauthorized request. Please login again.", "error");
                return;
            }

            const result = await response.json();

            if (response.ok && result.success) {
                window.showToast("Message deleted successfully", "success");
                if (card) {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.remove();
                        loadMessages(); // reload to update count
                    }, 300);
                } else {
                    loadMessages();
                }
            } else {
                throw new Error(result.message || "Deletion failed.");
            }
        } catch (error) {
            console.error("Delete Message Error:", error);
            window.showToast(error.message || "Failed to delete message", "error");
            if (deleteBtn) deleteBtn.disabled = false;
        }
    };
});

// ==========================================
// 5. Visitor Logging (Automatic on load)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    apiFetch("/api/visit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }).catch(err => console.log("Visit tracking offline:", err));
});

