// EduUp Global AI Academy - Main JavaScript
// PWA Installation and Service Worker Registration

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/pwa/service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              showUpdateNotification();
            }
          });
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

// PWA Install Prompt
let deferredPrompt;
const installButton = document.getElementById('install-button');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] Install prompt outcome: ${outcome}`);
        deferredPrompt = null;
        installButton.style.display = 'none';
      }
    });
  }
});

// Show update notification
function showUpdateNotification() {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.textContent = 'New version available! Refresh to update.';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// API Client
class EduUpAPI {
  constructor(baseURL = 'http://localhost:8001/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token') || null;
  }
  
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Add token if available
    if (this.token) {
      defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('[API] Request failed:', error);
      throw error;
    }
  }
  
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }
  
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
  
  // Authentication methods
  async register(username, email, password) {
    const response = await this.post('/auth/register', {
      username,
      email,
      password
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }
  
  async login(username, password) {
    const response = await this.post('/auth/login', {
      username,
      password
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }
  
  async getCurrentUser() {
    return this.get('/auth/me');
  }
  
  // Lessons methods
  async getLessons(subject = null, difficulty = null) {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (difficulty) params.append('difficulty', difficulty);
    const query = params.toString() ? `?${params}` : '';
    return this.get(`/lessons${query}`);
  }
  
  async getLesson(lessonId) {
    return this.get(`/lessons/${lessonId}`);
  }
  
  // Progress methods
  async saveProgress(progressData) {
    return this.post('/progress', progressData);
  }
  
  async getAllProgress() {
    return this.get('/progress');
  }
  
  async getLessonProgress(lessonId) {
    return this.get(`/progress/${lessonId}`);
  }
  
  // AI methods
  async generateContent(prompt, context = null) {
    return this.post('/ai/generate', { prompt, context });
  }
  
  // Sync methods
  async syncData(syncData) {
    return this.post('/sync', syncData);
  }
  
  async getPendingSync() {
    return this.get('/sync/pending');
  }
  
  // Configuration methods
  async getSubjects() {
    return this.get('/config/subjects');
  }
  
  async getLevels() {
    return this.get('/config/levels');
  }
  
  // Stats
  async getStats() {
    return this.get('/stats');
  }

  // Teachers
  async getTeachers() {
    return this.get('/teachers');
  }

  async getTeachersForExam(examType) {
    return this.get(`/teachers/${examType}`);
  }
}

// Initialize API client
const api = new EduUpAPI();

// Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Loading Spinner
function showSpinner(container) {
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  container.appendChild(spinner);
  return spinner;
}

function removeSpinner(spinner) {
  if (spinner) {
    spinner.remove();
  }
}

// Telegram Mini App Integration
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  
  // Expand the app
  tg.expand();
  
  // Set theme
  document.documentElement.style.setProperty(
    '--tg-theme-bg-color',
    tg.themeParams.bg_color || '#ffffff'
  );
  
  // Get user data
  const user = tg.initDataUnsafe?.user;
  if (user) {
    console.log('[Telegram] User:', user);
    // Register/login with Telegram
    api.register(user.username || user.id.toString(), `${user.id}@telegram.user`, 'telegram_auth')
      .then(data => {
        console.log('[Telegram] Auth successful:', data);
        if (data.token) {
          api.setToken(data.token);
        }
      })
      .catch(error => console.error('[Telegram] Auth failed:', error));
  }
  
  // Handle back button
  tg.BackButton.onClick(() => {
    window.history.back();
  });
  
  // Handle main button
  tg.MainButton.setText('Continue');
  tg.MainButton.onClick(() => {
    // Handle main button click
    console.log('[Telegram] Main button clicked');
  });
}

// Offline Detection
window.addEventListener('online', () => {
  showToast('You are back online!', 'success');
});

window.addEventListener('offline', () => {
  showToast('You are offline. Some features may be limited.', 'warning');
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('[EduUp] App initialized');
  
  // Check online status
  if (!navigator.onLine) {
    showToast('You are offline. Some features may be limited.', 'warning');
  }
  
  // Load initial data
  loadInitialData();
});

async function loadInitialData() {
  try {
    // Check if user is authenticated
    if (api.token) {
      // Load user profile
      const profile = await api.getCurrentUser();
      console.log('[EduUp] Profile loaded:', profile);
    }

    // Load subjects (public endpoint)
    const subjects = await api.getSubjects();
    console.log('[EduUp] Subjects loaded:', subjects);

    // Load levels (public endpoint)
    const levels = await api.getLevels();
    console.log('[EduUp] Levels loaded:', levels);

    // Load exams (public endpoint)
    const exams = await api.get('/config/exams');
    console.log('[EduUp] Exams loaded:', exams);

    // Load teachers (public endpoint)
    const teachers = await api.getTeachers();
    console.log('[EduUp] Teachers loaded:', teachers);

  } catch (error) {
    console.error('[EduUp] Failed to load initial data:', error);
    // Don't show error toast for initial load failures
  }
}

// Export for use in other modules
window.EduUpAPI = EduUpAPI;
window.api = api;
window.showToast = showToast;
