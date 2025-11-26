/**
 * PowerFit Gym Website - Enhanced JavaScript
 * Features: Mobile menu toggle, Theme persistence, Scroll reveal animations
 */

// ========================================
// Theme Toggle with localStorage Persistence
// ========================================

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');
const html = document.documentElement;

// Load saved theme preference or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Theme toggle event listener
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

// Update theme icon based on current theme
function updateThemeIcon(theme) {
  if (themeIcon) {
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
  }
}

// ========================================
// Mobile Menu Toggle with Accessibility
// ========================================

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const isActive = hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Update aria-expanded for accessibility
    hamburger.setAttribute('aria-expanded', isActive);
    
    // Trap focus in menu when open
    if (isActive) {
      navMenu.querySelector('a')?.focus();
    }
  });
}

// Close mobile menu when clicking nav links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
  });
});

// Close mobile menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
    hamburger?.focus();
  }
});

// ========================================
// Scroll Reveal Animation
// ========================================

// Debounce function for better performance
function debounce(func, wait = 20, immediate = true) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

// Scroll reveal functionality
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  const windowHeight = window.innerHeight;
  const revealPoint = 100;
  
  reveals.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    
    if (elementTop < windowHeight - revealPoint) {
      element.classList.add('active');
    }
  });
}

// Initialize scroll reveal on page load and scroll
window.addEventListener('load', revealOnScroll);
window.addEventListener('scroll', debounce(revealOnScroll, 20));

// ========================================
// Enhanced Navbar Scroll Effect
// ========================================

let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', debounce(() => {
  const currentScroll = window.pageYOffset;
  
  // Add shadow when scrolled
  if (currentScroll > 0) {
    header?.style.setProperty('box-shadow', '0 4px 20px rgba(0, 0, 0, 0.15)');
  } else {
    header?.style.setProperty('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.1)');
  }
  
  lastScroll = currentScroll;
}, 20));

// ========================================
// Counter Animation for Stats
// ========================================

// Counter animation constants
const ANIMATION_STEPS = 50;

function animateCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px',
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const element = entry.target;
        const targetValue = parseInt(element.getAttribute('data-target'));
        let current = 0;
        const increment = targetValue / ANIMATION_STEPS;
        const duration = 2000;
        const stepTime = duration / ANIMATION_STEPS;
        
        const updateCounter = () => {
          current += increment;
          if (current < targetValue) {
            element.textContent = Math.floor(current).toLocaleString() + '+';
            setTimeout(updateCounter, stepTime);
          } else {
            element.textContent = targetValue.toLocaleString() + '+';
          }
        };
        
        updateCounter();
        element.dataset.animated = 'true';
        observer.unobserve(element);
      }
    });
  }, observerOptions);
  
  statNumbers.forEach((stat) => observer.observe(stat));
}

// Initialize counter animation
if (document.querySelector('.stat-number')) {
  animateCounter();
}

// ========================================
// Contact Form Handling
// ========================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = contactForm.querySelector('input[type="text"]')?.value;
    const email = contactForm.querySelector('input[type="email"]')?.value;
    const message = contactForm.querySelector('textarea')?.value;
    
    // Validate form
    if (!name || !email || !message) {
      alert('Please fill in all fields.');
      return;
    }
    
    // Show success message
    alert(`Thank you, ${name}! We'll get back to you at ${email} shortly.`);
    
    // Reset form
    contactForm.reset();
  });
}

// ========================================
// Membership Button Click Handling
// ========================================

const membershipBtns = document.querySelectorAll('.membership-btn');

membershipBtns.forEach((btn) => {
  btn.addEventListener('click', function() {
    // Get the plan name from the card
    const card = this.closest('.membership-card');
    const planName = card?.querySelector('h3')?.textContent || 'this plan';
    
    // Create ripple effect
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      width: 20px;
      height: 20px;
      animation: ripple 0.6s ease-out;
      pointer-events: none;
      left: 50%;
      top: 50%;
      margin-left: -10px;
      margin-top: -10px;
    `;
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
    
    // Show selection message
    setTimeout(() => {
      alert(`You selected the ${planName} plan! Our team will contact you soon.`);
    }, 300);
  });
});

// Add ripple animation to stylesheet if not present
if (!document.getElementById('ripple-animation')) {
  const style = document.createElement('style');
  style.id = 'ripple-animation';
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// ========================================
// Service and Class Cards Animation on Scroll
// ========================================

const serviceCards = document.querySelectorAll('.service-card');
const classCards = document.querySelectorAll('.class-card');

const cardObserverOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting && !entry.target.dataset.revealed) {
      // Stagger animation for cards
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.dataset.revealed = 'true';
      }, index * 100);
    }
  });
}, cardObserverOptions);

// Initialize cards with initial state
[...serviceCards, ...classCards].forEach((card) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  cardObserver.observe(card);
});

// ========================================
// Back to Top Button
// ========================================

function createBackToTopBtn() {
  // Only create if it doesn't exist
  if (document.getElementById('backToTop')) return;
  
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.textContent = '↑ Top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #ff006e, #ff4757);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 50px;
    cursor: pointer;
    font-weight: 700;
    font-size: 14px;
    display: none;
    z-index: 999;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 0, 110, 0.4);
    font-family: inherit;
  `;
  
  document.body.appendChild(btn);
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', debounce(() => {
    if (window.pageYOffset > 400) {
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }
  }, 20));
  
  // Scroll to top on click
  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Hover effects
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-3px)';
    btn.style.boxShadow = '0 6px 20px rgba(255, 0, 110, 0.6)';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0)';
    btn.style.boxShadow = '0 4px 15px rgba(255, 0, 110, 0.4)';
  });
}

// ========================================
// Initialize Everything on DOMContentLoaded
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('💪 PowerFit Gym Website Loaded Successfully!');
  
  // Create back to top button
  createBackToTopBtn();
  
  // Ensure initial reveal check
  setTimeout(revealOnScroll, 100);
});

// ========================================
// Performance: Lazy Loading for Future Images
// ========================================

if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      }
    });
  });
  
  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

// ========================================
// Accessibility: Focus Management
// ========================================

// Add visible focus indicator for keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

// Add keyboard navigation style
const keyboardNavStyle = document.createElement('style');
keyboardNavStyle.textContent = `
  .keyboard-nav *:focus {
    outline: 3px solid #ff006e !important;
    outline-offset: 2px !important;
  }
`;
document.head.appendChild(keyboardNavStyle);
