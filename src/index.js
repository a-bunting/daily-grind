import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
        
        // Listen for waiting service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available - show a better notification
              showUpdateNotification(() => {
                newWorker.postMessage({ action: 'skipWaiting' });
                window.location.reload();
              });
            }
          });
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });

    // Listen for controllerchange event
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // The service worker has been updated
      window.location.reload();
    });
  });
}

// PWA Install Button Helper (optional)
let deferredPrompt;
let installButton = null;

// Better update notification function
function showUpdateNotification(onUpdate) {
  // Create a better notification instead of using confirm()
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #6366f1;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;
  
  notification.innerHTML = `
    <div style="margin-bottom: 12px; font-weight: 500;">Update Available!</div>
    <div style="margin-bottom: 12px; opacity: 0.9;">A new version of Daily Grind is ready.</div>
    <div>
      <button id="update-yes" style="background: white; color: #6366f1; border: none; padding: 6px 12px; border-radius: 4px; margin-right: 8px; cursor: pointer; font-size: 12px;">Update Now</button>
      <button id="update-no" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Later</button>
    </div>
  `;

  // Add animation keyframes
  if (!document.getElementById('update-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'update-animation-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  document.getElementById('update-yes').addEventListener('click', () => {
    notification.remove();
    onUpdate();
  });

  document.getElementById('update-no').addEventListener('click', () => {
    notification.remove();
  });

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // You can create and show an install button here
  // This is optional - you can add this to your UI later
  showInstallButton();
});

function showInstallButton() {
  // Create install button if it doesn't exist
  if (!installButton && deferredPrompt) {
    installButton = document.createElement('button');
    installButton.textContent = 'Install App';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #6366f1;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      z-index: 1000;
      transition: all 0.3s ease;
    `;
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        
        deferredPrompt = null;
        installButton.remove();
        installButton = null;
      }
    });
    
    document.body.appendChild(installButton);
  }
}

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
  
  if (installButton) {
    installButton.remove();
    installButton = null;
  }
});

// Optional: Add to home screen detection for iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

if (isIOS() && !isInStandaloneMode()) {
  // Show iOS-specific install instructions
  console.log('iOS user - show "Add to Home Screen" instructions');
}