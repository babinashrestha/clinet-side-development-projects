


const heroCarousel = {
  // Configuration constants
  AUTOPLAY_DELAY: 5000,           // Auto-advance interval in ms
  TRANSITION_DURATION: 600,        // Slide transition duration in ms (matches CSS)
  LAZY_LOAD_ROOT_MARGIN: '200px',  // IntersectionObserver root margin
  ALT_TEXT_MAX_LENGTH: 60,         // Max characters for live region announcements
  
  slides: [],
  dots: [],
  currentIndex: 0,
  autoplayInterval: null,
  isPaused: false,
  liveRegion: null,
  
  init() {
    this.slides = document.querySelectorAll('.carousel-slide');
    this.dots = document.querySelectorAll('.carousel-dot');
    this.liveRegion = document.querySelector('.carousel-live-region');
    
    if (this.slides.length === 0) return;
    
    // Preload first two images
    this.preloadImages();
    
    // Set up event listeners
    this.setupNavigation();
    this.setupKeyboardNav();
    this.setupHoverPause();
    
    // Start autoplay
    this.startAutoplay();
  },
  
  preloadImages() {
    // First two images are preloaded (already have src)
    // Lazy load remaining images using IntersectionObserver
    const lazyImages = document.querySelectorAll('.carousel-image[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src && !img.src) {
              img.src = img.dataset.src;
            }
            imageObserver.unobserve(img);
          }
        });
      }, { rootMargin: this.LAZY_LOAD_ROOT_MARGIN });
      
      lazyImages.forEach((img) => {
        // Also preload 2nd image immediately
        const slideIndex = Array.from(this.slides).findIndex(
          slide => slide.contains(img)
        );
        if (slideIndex <= 1) {
          if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
          }
        } else {
          imageObserver.observe(img);
        }
      });
    } else {
      // Fallback: load all images
      lazyImages.forEach((img) => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    }
  },
  
  setupNavigation() {
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prev());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.next());
    }
    
    // Pagination dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
  },
  
  setupKeyboardNav() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    document.addEventListener('keydown', (e) => {
      // Only respond when hero is in viewport
      const rect = heroSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (!isInView) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });
  },
  
  setupHoverPause() {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;
    
    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
      this.pause();
    });
    
    carousel.addEventListener('mouseleave', () => {
      this.resume();
    });
    
    // Pause on focus (for accessibility)
    carousel.addEventListener('focusin', () => {
      this.pause();
    });
    
    carousel.addEventListener('focusout', (e) => {
      // Only resume if focus left the carousel completely
      if (!carousel.contains(e.relatedTarget)) {
        this.resume();
      }
    });
  },
  
  goToSlide(index) {
    if (index === this.currentIndex || index < 0 || index >= this.slides.length) return;
    
    // Update slides
    const currentSlide = this.slides[this.currentIndex];
    const nextSlide = this.slides[index];
    
    // Remove active from current, add prev class for exit animation
    currentSlide.classList.remove('active');
    currentSlide.classList.add('prev');
    currentSlide.setAttribute('aria-hidden', 'true');
    
    // Add active to next slide
    nextSlide.classList.add('active');
    nextSlide.classList.remove('prev');
    nextSlide.setAttribute('aria-hidden', 'false');
    
    // Preload next image if needed
    const nextImg = nextSlide.querySelector('img[data-src]');
    if (nextImg && nextImg.dataset.src && !nextImg.src) {
      nextImg.src = nextImg.dataset.src;
    }
    
    // Update dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    
    // Update live region for screen readers
    this.updateLiveRegion(index);
    
    // Clean up prev class after transition
    setTimeout(() => {
      currentSlide.classList.remove('prev');
    }, this.TRANSITION_DURATION);
    
    this.currentIndex = index;
    
    // Reset autoplay timer
    if (!this.isPaused) {
      this.resetAutoplay();
    }
  },
  
  next() {
    const nextIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  },
  
  prev() {
    const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  },
  
  startAutoplay() {
    if (this.autoplayInterval) return;
    this.autoplayInterval = setInterval(() => {
      if (!this.isPaused) {
        this.next();
      }
    }, this.AUTOPLAY_DELAY);
  },
  
  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  },
  
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  },
  
  pause() {
    this.isPaused = true;
  },
  
  resume() {
    this.isPaused = false;
  },
  
  updateLiveRegion(index) {
    if (!this.liveRegion) return;
    
    const slide = this.slides[index];
    const img = slide.querySelector('img');
    const altText = img ? img.alt : '';
    
    // Truncate alt text for announcement
    const shortAlt = altText.length > this.ALT_TEXT_MAX_LENGTH 
      ? altText.substring(0, this.ALT_TEXT_MAX_LENGTH) + '...' 
      : altText;
    
    this.liveRegion.textContent = `Slide ${index + 1} of ${this.slides.length}: ${shortAlt}`;
  }
};

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  heroCarousel.init();
});

// Theme Toggle with localStorage Persistenc

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



// Check if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Creates an IntersectionObserver for reveal animations
 * @param {string} selector - CSS selector for elements to observe
 * @param {Object} options - Observer options (threshold, rootMargin)
 * @param {Function} onReveal - Callback when element is revealed
 */
function createRevealObserver(selector, options, onReveal) {
  const elements = document.querySelectorAll(selector);
  
  if (prefersReducedMotion) {
    // If reduced motion is preferred, reveal all immediately
    elements.forEach(element => onReveal(element, 0));
    return;
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting && !entry.target.dataset.revealed) {
        onReveal(entry.target, index);
        entry.target.dataset.revealed = 'true';
        observer.unobserve(entry.target);
      }
    });
  }, options);
  
  elements.forEach(element => observer.observe(element));
}

// Service cards reveal - using CSS classes
createRevealObserver(
  '.service-reveal',
  { threshold: 0.15, rootMargin: '0px 0px -50px 0px' },
  (element) => element.classList.add('visible')
);

// Class cards reveal - using inline styles with staggered delay
const classCards = document.querySelectorAll('.class-card');
classCards.forEach((card) => {
  if (!prefersReducedMotion) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  }
});

createRevealObserver(
  '.class-card',
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
  (element, index) => {
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, index * 100);
  }
);



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



document.addEventListener('DOMContentLoaded', () => {
  console.log('💪 PowerFit Gym Website Loaded Successfully!');
  
  // Create back to top button
  createBackToTopBtn();
  
  // Ensure initial reveal check
  setTimeout(revealOnScroll, 100);
});



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
