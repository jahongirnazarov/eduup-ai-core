/**
 * 🚀 Lightweight Mini App Script
 * Optimized for fast loading and smooth performance on all devices
 */

(function() {
    'use strict';
    
    // Cache DOM elements
    const cache = {};
    
    function getCachedElement(id) {
        if (!cache[id]) {
            cache[id] = document.getElementById(id);
        }
        return cache[id];
    }
    
    // Lazy load images
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => observer.observe(img));
    }
    
    // Debounce function for performance
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
    
    // Smooth scroll with performance
    function smoothScrollTo(target, duration = 300) {
        const start = window.pageYOffset;
        const targetY = target.getBoundingClientRect().top + start;
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            window.scrollTo(0, start + (targetY - start) * easeOutQuart);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Local storage helper with error handling
    const storage = {
        get: function(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('Storage get error:', e);
                return null;
            }
        },
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },
        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Storage remove error:', e);
                return false;
            }
        }
    };
    
    // Performance monitoring
    const perf = {
        mark: function(name) {
            if (performance && performance.mark) {
                performance.mark(name);
            }
        },
        measure: function(name, startMark, endMark) {
            if (performance && performance.measure) {
                performance.measure(name, startMark, endMark);
            }
        },
        getMemoryUsage: function() {
            if (performance && performance.memory) {
                return {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576)
                };
            }
            return null;
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        perf.mark('mini-app-init-start');
        
        // Initialize features
        lazyLoadImages();
        
        // Setup Telegram WebApp if available
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
        }
        
        perf.mark('mini-app-init-end');
        perf.measure('mini-app-init', 'mini-app-init-start', 'mini-app-init-end');
        
        // Log performance
        const measures = performance.getEntriesByName('mini-app-init');
        if (measures.length > 0) {
            console.log('Mini App initialized in:', measures[0].duration.toFixed(2), 'ms');
        }
    }
    
    // Export utilities
    window.MiniAppUtils = {
        storage,
        perf,
        smoothScrollTo,
        debounce
    };
    
})();
