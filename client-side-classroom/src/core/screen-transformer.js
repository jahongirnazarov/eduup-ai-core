/**
 * Screen Transformation Engine (UI State Morphing)
 * ===============================================
 * Professional screen transitions between Lesson, SAT, and IELTS modes
 * - Smooth CSS transitions with morphing effects
 * - State management for different exam modes
 * - Responsive layout transformations
 */

class ScreenTransformer {
    constructor() {
        this.currentMode = 'lesson'; // 'lesson' | 'sat' | 'ielts'
        this.transitionDuration = 500; // ms
        this.isTransitioning = false;
        
        // Mode-specific configurations
        this.modeConfigs = {
            lesson: {
                backgroundColor: '#1a3d1a',
                avatarVisible: true,
                avatarSize: '12.5vw',
                blackboardVisible: true,
                desmosVisible: false,
                splitScreen: false
            },
            sat: {
                backgroundColor: '#f3f4f6',
                avatarVisible: false,
                avatarSize: '3vw', // Tiny proctor mode
                blackboardVisible: false,
                desmosVisible: true,
                splitScreen: false
            },
            ielts: {
                backgroundColor: '#ffffff',
                avatarVisible: false,
                avatarSize: '3vw', // Tiny proctor mode
                blackboardVisible: false,
                desmosVisible: false,
                splitScreen: true
            }
        };
        
        console.log('[ScreenTransformer] Initialized');
    }
    
    /**
     * Transform screen to target mode
     */
    async transformTo(targetMode) {
        if (this.currentMode === targetMode || this.isTransitioning) {
            return;
        }
        
        this.isTransitioning = true;
        const config = this.modeConfigs[targetMode];
        
        console.log(`[ScreenTransformer] Transforming from ${this.currentMode} to ${targetMode}`);
        
        // Apply transition class to main container
        const app = document.getElementById('app');
        app.classList.add('mode-transition');
        
        // Hide current mode view
        await this.hideCurrentMode();
        
        // Update global styles
        this.updateGlobalStyles(config);
        
        // Transform avatar
        await this.transformAvatar(config);
        
        // Show target mode view
        await this.showTargetMode(targetMode);
        
        // Update state
        this.currentMode = targetMode;
        this.isTransitioning = false;
        
        // Remove transition class
        setTimeout(() => {
            app.classList.remove('mode-transition');
        }, this.transitionDuration);
        
        console.log(`[ScreenTransformer] Transformation complete: ${targetMode}`);
    }
    
    /**
     * Hide current mode view
     */
    async hideCurrentMode() {
        const views = {
            lesson: document.getElementById('classroom-view'),
            sat: document.getElementById('sat-view'),
            ielts: document.getElementById('ielts-view')
        };
        
        const currentView = views[this.currentMode];
        if (currentView) {
            currentView.style.opacity = '0';
            currentView.style.transform = 'scale(0.95)';
            
            await new Promise(resolve => {
                setTimeout(resolve, this.transitionDuration / 2);
            });
            
            currentView.classList.add('hidden');
            currentView.style.opacity = '';
            currentView.style.transform = '';
        }
    }
    
    /**
     * Show target mode view
     */
    async showTargetMode(targetMode) {
        const views = {
            lesson: document.getElementById('classroom-view'),
            sat: document.getElementById('sat-view'),
            ielts: document.getElementById('ielts-view')
        };
        
        const targetView = views[targetMode];
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.style.opacity = '0';
            targetView.style.transform = 'scale(1.05)';
            
            // Trigger reflow
            targetView.offsetHeight;
            
            targetView.style.transition = `all ${this.transitionDuration}ms ease-out`;
            targetView.style.opacity = '1';
            targetView.style.transform = 'scale(1)';
            
            await new Promise(resolve => {
                setTimeout(resolve, this.transitionDuration);
            });
            
            targetView.style.transition = '';
            targetView.style.opacity = '';
            targetView.style.transform = '';
        }
    }
    
    /**
     * Update global styles for mode
     */
    updateGlobalStyles(config) {
        const body = document.body;
        body.style.transition = `background-color ${this.transitionDuration}ms ease-out`;
        body.style.backgroundColor = config.backgroundColor;
        
        // Update navigation bar style
        const nav = document.querySelector('nav');
        if (nav) {
            if (targetMode === 'lesson') {
                nav.classList.remove('bg-gray-800');
                nav.classList.add('bg-chalkboard-medium/90');
            } else if (targetMode === 'sat') {
                nav.classList.remove('bg-chalkboard-medium/90');
                nav.classList.add('bg-blue-900');
            } else if (targetMode === 'ielts') {
                nav.classList.remove('bg-chalkboard-medium/90');
                nav.classList.add('bg-red-800');
            }
        }
    }
    
    /**
     * Transform avatar based on mode
     */
    async transformAvatar(config) {
        const avatarContainer = document.getElementById('avatar-canvas');
        if (!avatarContainer) return;
        
        avatarContainer.style.transition = `all ${this.transitionDuration}ms ease-out`;
        
        if (config.avatarVisible) {
            // Show avatar in full size
            avatarContainer.style.opacity = '1';
            avatarContainer.style.width = config.avatarSize;
            avatarContainer.style.height = config.avatarSize;
            avatarContainer.style.bottom = '20px';
            avatarContainer.style.left = '20px';
        } else {
            // Hide or shrink to proctor mode
            if (config.avatarSize === '3vw') {
                // Proctor mode - tiny top-right
                avatarContainer.style.width = config.avatarSize;
                avatarContainer.style.height = config.avatarSize;
                avatarContainer.style.bottom = 'auto';
                avatarContainer.style.left = 'auto';
                avatarContainer.style.top = '70px';
                avatarContainer.style.right = '20px';
                avatarContainer.style.opacity = '0.7';
            } else {
                // Completely hide
                avatarContainer.style.opacity = '0';
            }
        }
        
        await new Promise(resolve => {
            setTimeout(resolve, this.transitionDuration);
        });
        
        avatarContainer.style.transition = '';
    }
    
    /**
     * Get current mode
     */
    getCurrentMode() {
        return this.currentMode;
    }
    
    /**
     * Check if currently transitioning
     */
    isCurrentlyTransitioning() {
        return this.isTransitioning;
    }
}

// Export singleton instance
export const screenTransformer = new ScreenTransformer();
export default screenTransformer;
