// ==========================================================================
// COMFYTECH RESEARCH HUB - LANDING PAGE JAVASCRIPT
// ==========================================================================

class LandingPage {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Initializing Landing Page');
        this.setupEventListeners();
        this.setupFormHandlers();
        this.setupSmoothScrolling();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Handle demo button clicks
        const demoButtons = document.querySelectorAll('[onclick="openDemo()"]');
        demoButtons.forEach(button => {
            button.addEventListener('click', this.handleDemoClick.bind(this));
        });

        // Handle plan selection
        const planButtons = document.querySelectorAll('[onclick^="selectPlan"]');
        planButtons.forEach(button => {
            button.addEventListener('click', this.handlePlanSelection.bind(this));
        });

        // Handle CTA buttons
        const ctaButtons = document.querySelectorAll('[onclick="scrollToSubscribe()"]');
        ctaButtons.forEach(button => {
            button.addEventListener('click', this.scrollToSubscribe.bind(this));
        });

        // Handle navbar scroll effect
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    setupFormHandlers() {
        const form = document.getElementById('subscribeForm');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Handle plan radio button changes
        const planRadios = document.querySelectorAll('input[name="plan"]');
        planRadios.forEach(radio => {
            radio.addEventListener('change', this.handlePlanChange.bind(this));
        });
    }

    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe animated elements
        const animatedElements = document.querySelectorAll('.feature-card, .pricing-card');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    handleScroll() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'transparent';
                navbar.style.backdropFilter = 'none';
            }
        }
    }

    handleDemoClick(e) {
        e.preventDefault();
        console.log('🎥 Opening demo');

        // For now, redirect to the main app
        // In production, this could open a modal with demo video or tour
        this.showNotification('Demo coming soon! For now, try our live application.', 'info');

        // Redirect to main app after a short delay
        setTimeout(() => {
            window.open('/index.html', '_blank');
        }, 1500);
    }

    handlePlanSelection(e) {
        const button = e.target.closest('button');
        const planType = button.getAttribute('onclick').match(/selectPlan\('(.+?)'\)/)[1];
        console.log(`📋 Plan selected: ${planType}`);

        // Update form radio button
        const planRadio = document.querySelector(`input[name="plan"][value="${planType}"]`);
        if (planRadio) {
            planRadio.checked = true;
        }

        // Scroll to form
        this.scrollToSubscribe();
    }

    handlePlanChange(e) {
        const selectedPlan = e.target.value;
        console.log(`📋 Plan changed to: ${selectedPlan}`);

        // Update any plan-specific UI
        this.updatePlanUI(selectedPlan);
    }

    updatePlanUI(planType) {
        // Update form title or other UI elements based on selected plan
        const formTitle = document.querySelector('.form-title');
        if (formTitle) {
            const planNames = {
                starter: 'Start Your Starter Trial',
                professional: 'Start Your Professional Trial',
                enterprise: 'Contact Sales Team'
            };
            formTitle.textContent = planNames[planType] || 'Start Your Free Trial';
        }

        // Update submit button text
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            if (planType === 'enterprise') {
                submitButton.innerHTML = 'Contact Sales <span class="btn-icon">→</span>';
            } else {
                submitButton.innerHTML = 'Start Free Trial <span class="btn-icon">→</span>';
            }
        }
    }

    scrollToSubscribe() {
        const subscribeSection = document.getElementById('subscribe');
        if (subscribeSection) {
            subscribeSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        console.log('📝 Form submitted');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Validate form
        if (!this.validateForm(data)) {
            return;
        }

        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = 'Processing... <span class="btn-icon">⏳</span>';
        submitButton.disabled = true;

        try {
            // Simulate API call (replace with actual endpoint)
            await this.submitSubscription(data);

            // Show success message
            this.showSuccessMessage();

            // Reset form
            e.target.reset();

        } catch (error) {
            console.error('❌ Subscription failed:', error);
            this.showNotification('Something went wrong. Please try again.', 'error');
        } finally {
            // Restore button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    validateForm(data) {
        const required = ['fullName', 'email', 'businessType', 'plan'];
        const missing = required.filter(field => !data[field] || data[field].trim() === '');

        if (missing.length > 0) {
            this.showNotification(`Please fill in: ${missing.join(', ')}`, 'error');
            return false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }

        return true;
    }

    async submitSubscription(data) {
        console.log('📤 Submitting subscription:', data);

        // In production, replace this with actual API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.1) { // 90% success rate for demo
                    resolve({ success: true, userId: 'user_' + Date.now() });
                } else {
                    reject(new Error('API Error'));
                }
            }, 2000);
        });
    }

    showSuccessMessage() {
        const form = document.getElementById('subscribeForm');
        const formContainer = form.closest('.subscribe-form-container');

        formContainer.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✅</div>
                <h3 class="success-title">Welcome to Comfytech Research Hub!</h3>
                <p class="success-description">
                    Thank you for signing up! We've sent you an email with your login details 
                    and next steps to get started with your free trial.
                </p>
                <div class="success-actions">
                    <button class="btn btn-primary" onclick="window.open('/index.html', '_blank')">
                        Access Dashboard
                        <span class="btn-icon">→</span>
                    </button>
                    <button class="btn btn-secondary" onclick="location.reload()">
                        Sign Up Another Account
                    </button>
                </div>
            </div>
        `;

        // Add success message styles
        const style = document.createElement('style');
        style.textContent = `
            .success-message {
                text-align: center;
                padding: 2rem;
            }
            .success-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            .success-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 1rem;
                color: var(--text-primary);
            }
            .success-description {
                color: var(--text-secondary);
                margin-bottom: 2rem;
                line-height: 1.6;
            }
            .success-actions {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
        `;
        document.head.appendChild(style);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Add notification styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                    padding: 1rem 1.5rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    max-width: 400px;
                    animation: slideInRight 0.3s ease;
                }
                .notification-info {
                    background: #dbeafe;
                    color: #1e40af;
                    border-left: 4px solid #3b82f6;
                }
                .notification-error {
                    background: #fef2f2;
                    color: #dc2626;
                    border-left: 4px solid #ef4444;
                }
                .notification-success {
                    background: #f0fdf4;
                    color: #16a34a;
                    border-left: 4px solid #22c55e;
                }
                .notification-message {
                    flex: 1;
                    font-weight: 500;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    opacity: 0.7;
                }
                .notification-close:hover {
                    opacity: 1;
                }
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global functions for inline event handlers (to be removed in production)
function scrollToSubscribe() {
    if (window.landingPage) {
        window.landingPage.scrollToSubscribe();
    }
}

function openDemo() {
    if (window.landingPage) {
        window.landingPage.handleDemoClick({ preventDefault: () => { } });
    }
}

function selectPlan(planType) {
    if (window.landingPage) {
        const mockEvent = {
            target: { closest: () => ({ getAttribute: () => `selectPlan('${planType}')` }) }
        };
        window.landingPage.handlePlanSelection(mockEvent);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.landingPage = new LandingPage();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LandingPage;
}
