// Performance optimizations for Al Marsam

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
  // Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Preload critical resources
  preloadCriticalResources();
  
  // Optimize animations
  optimizeAnimations();
  
  // Setup service worker for caching
  setupServiceWorker();
  
  // Defer non-critical JavaScript
  deferNonCriticalJS();
});

function preloadCriticalResources() {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins&family=Rosario:wght@500;600;700&display=swap';
  fontLink.as = 'style';
  fontLink.onload = function() { this.rel = 'stylesheet'; };
  document.head.appendChild(fontLink);

  // Preload critical images
  const criticalImages = [
    './assets/images/hero-banner-1.jpg',
    './assets/images/hero-banner-2.jpg'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

function optimizeAnimations() {
  // Reduce animations on low-end devices
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-1', '0s');
    document.documentElement.style.setProperty('--transition-2', '0s');
  }

  // Use transform for better performance
  const animatedElements = document.querySelectorAll('.product-card, .hero-banner, .collection-card');
  animatedElements.forEach(el => {
    el.style.willChange = 'transform';
  });
}

function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  }
}

function deferNonCriticalJS() {
  // Defer loading of non-critical scripts
  const scripts = [
    'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js',
    'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js'
  ];

  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  });
}

// Image optimization utilities
function optimizeImages() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Add loading="lazy" to images that don't have it
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Add error handling
    img.addEventListener('error', function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyNkMxNi42ODYzIDI2IDE0IDIzLjMxMzcgMTQgMjBDMTQgMTYuNjg2MyAxNi42ODYzIDE0IDIwIDE0QzIzLjMxMzcgMTQgMjYgMTYuNjg2MyAyNiAyMEMyNiAyMy4zMTM3IDIzLjMxMzcgMjYgMjAgMjZaTTIwIDE2QzE4LjM0MzEgMTYgMTcgMTcuMzQzMSAxNyAxOUMxNyAyMC42NTY5IDE4LjM0MzEgMjIgMjAgMjJDMjEuNjU2OSAyMiAyMyAyMC42NTY5IDIzIDE5QzIzIDE3LjM0MzEgMjEuNjU2OSAxNiAyMCAxNloiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';
      this.alt = 'Image not available';
    });
  });
}

// Performance monitoring
function monitorPerformance() {
  // Measure page load time
  window.addEventListener('load', function() {
    const perfData = performance.getEntriesByType('navigation')[0];
    const loadTime = perfData.loadEventEnd - perfData.fetchStart;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // Log performance metrics
    if (window.gtag) {
      gtag('event', 'page_load_time', {
        custom_parameter: loadTime
      });
    }
  });

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn(`Long task detected: ${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
}

// Debounce utility for better performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for scroll/resize events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Optimize scroll events
const optimizedScrollHandler = throttle(function() {
  // Header active state
  const header = document.querySelector("[data-header]");
  if (header) {
    if (window.scrollY > 100) {
      header.classList.add("active");
    } else {
      header.classList.remove("active");
    }
  }
}, 16); // ~60fps

// Apply optimized scroll handler
window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

// Optimize resize events
const optimizedResizeHandler = debounce(function() {
  // Handle responsive design changes
  if (window.innerWidth < 768) {
    document.body.classList.add('mobile');
  } else {
    document.body.classList.remove('mobile');
  }
}, 250);

window.addEventListener('resize', optimizedResizeHandler);

// Initialize optimizations
optimizeImages();
monitorPerformance();

// Export utilities for other scripts
window.performanceUtils = {
  debounce,
  throttle,
  optimizeImages
};