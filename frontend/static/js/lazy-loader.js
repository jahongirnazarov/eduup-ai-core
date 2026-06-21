/**
 * 🚀 Universal Lazy Loader
 * Cross-device compatible lazy loading for all components
 */
(function() {
    'use strict';

    // Device detection
    const device = {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isSlowConnection: navigator.connection ? (navigator.connection.effectiveType === '2g' || navigator.connection.effectiveType === 'slow-2g') : false,
        memory: navigator.deviceMemory || 4,
        cores: navigator.hardwareConcurrency || 4
    };

    // Lazy load configuration based on device
    const config = {
        imageThreshold: device.isSlowConnection ? 200 : 50,
        scriptDelay: device.isSlowConnection ? 500 : 0,
        preloadDistance: device.isMobile ? 200 : 300
    };

    // Image lazy loading
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: `${config.preloadDistance}px`
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => loadImage(img));
        }
    }

    function loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        }
    }

    // Script lazy loading
    function lazyLoadScripts() {
        const scripts = document.querySelectorAll('script[data-src]');
        
        scripts.forEach(script => {
            const src = script.dataset.src;
            if (src) {
                const newScript = document.createElement('script');
                newScript.src = src;
                newScript.async = true;
                
                if (script.dataset.defer === 'true') {
                    newScript.defer = true;
                }
                
                script.parentNode.replaceChild(newScript, script);
            }
        });
    }

    // Component lazy loading
    function lazyLoadComponents() {
        const components = document.querySelectorAll('[data-component]');
        
        components.forEach(component => {
            const componentName = component.dataset.component;
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadComponent(component, componentName);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: `${config.preloadDistance}px`
            });
            
            observer.observe(component);
        });
    }

    async function loadComponent(element, name) {
        try {
            // Dynamic import for components
            const module = await import(`/static/js/components/${name}.js`);
            if (module.default) {
                module.default(element);
            }
            element.classList.add('loaded');
        } catch (error) {
            console.warn(`Failed to load component ${name}:`, error);
        }
    }

    // Background lazy loading
    function lazyLoadBackgrounds() {
        const elements = document.querySelectorAll('[data-background]');
        
        elements.forEach(element => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const bg = entry.target.dataset.background;
                        entry.target.style.backgroundImage = `url(${bg})`;
                        entry.target.classList.add('loaded');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: `${config.preloadDistance}px`
            });
            
            observer.observe(element);
        });
    }

    // Initialize when DOM is ready
    function init() {
        // Add loading class to body
        document.body.classList.add('lazy-loading');
        
        // Start lazy loading
        lazyLoadImages();
        lazyLoadBackgrounds();
        
        // Delay script loading for slow connections
        if (config.scriptDelay > 0) {
            setTimeout(lazyLoadScripts, config.scriptDelay);
        } else {
            lazyLoadScripts();
        }
        
        // Load components
        lazyLoadComponents();
        
        // Remove loading class when done
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.classList.remove('lazy-loading');
                document.body.classList.add('lazy-loaded');
            }, 100);
        });
    }

    // Export utilities
    window.LazyLoader = {
        device,
        config,
        loadImage,
        lazyLoadImages,
        lazyLoadScripts
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
