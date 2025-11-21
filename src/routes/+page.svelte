<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<div class="splash-container">
  <div class="splash-content">
    <div class="app-icon">
      <div class="icon-inner">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M20 20 L60 20 L60 60 L20 60 Z" fill="url(#gradient)" stroke="none"/>
          <path d="M30 30 L35 30 L35 50 L30 50 Z" fill="white" opacity="0.9"/>
          <path d="M40 30 L45 30 L45 50 L40 50 Z" fill="white" opacity="0.9"/>
          <path d="M50 30 L55 30 L55 50 L50 50 Z" fill="white" opacity="0.9"/>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#007AFF;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#5856D6;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
    
    <h1 class="app-title">Scribe</h1>
    <p class="app-subtitle">Write beautifully. Think clearly.</p>
    
    <div class="action-buttons">
      <button class="primary-button" on:click={() => goto('/draft')}>
        New Draft
      </button>
      <button class="secondary-button" on:click={() => console.log('Open drafts')}>
        Open Drafts
      </button>
      <button class="text-button" on:click={() => console.log('About')}>
        About Scribe
      </button>
    </div>
    
    <div class="version-info">
      <span class="version">Version 1.0</span>
      <span class="separator">•</span>
      <span class="copyright">© 2025 Scribe</span>
    </div>
  </div>
  
  <div class="background-shapes">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
    <div class="shape shape-4"></div>
  </div>
</div>

<style>
  .splash-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  .background-shapes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .shape-1 {
    width: 300px;
    height: 300px;
    top: -150px;
    left: -150px;
    animation: float 20s infinite ease-in-out;
  }

  .shape-2 {
    width: 200px;
    height: 200px;
    bottom: -100px;
    right: -100px;
    animation: float 15s infinite ease-in-out reverse;
  }

  .shape-3 {
    width: 150px;
    height: 150px;
    top: 50%;
    left: -75px;
    animation: float 25s infinite ease-in-out;
  }

  .shape-4 {
    width: 100px;
    height: 100px;
    top: 20%;
    right: 10%;
    animation: float 18s infinite ease-in-out reverse;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-20px) rotate(120deg); }
    66% { transform: translateY(20px) rotate(240deg); }
  }

  .splash-content {
    text-align: center;
    z-index: 10;
    position: relative;
    max-width: 400px;
    width: 100%;
  }

  .app-icon {
    margin-bottom: 40px;
    display: inline-block;
    animation: fadeInScale 1s ease-out;
  }

  .icon-inner {
    width: 120px;
    height: 120px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    backdrop-filter: blur(20px);
    transition: transform 0.3s ease;
  }

  .icon-inner:hover {
    transform: scale(1.05);
  }

  @keyframes fadeInScale {
    0% { 
      opacity: 0; 
      transform: scale(0.8); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1); 
    }
  }

  .app-title {
    font-size: 48px;
    font-weight: 700;
    color: white;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
    animation: fadeInUp 1s ease-out 0.2s both;
  }

  .app-subtitle {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 60px;
    font-weight: 400;
    letter-spacing: 0.01em;
    animation: fadeInUp 1s ease-out 0.4s both;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 60px;
    animation: fadeInUp 1s ease-out 0.6s both;
  }

  .primary-button {
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(20px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .primary-button:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }

  .primary-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .secondary-button {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 14px 30px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(20px);
  }

  .secondary-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .text-button {
    background: transparent;
    color: rgba(255, 255, 255, 0.8);
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .text-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .version-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    animation: fadeInUp 1s ease-out 0.8s both;
  }

  .separator {
    opacity: 0.5;
  }

  @keyframes fadeInUp {
    0% { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }

  @media (max-width: 640px) {
    .app-title {
      font-size: 40px;
    }
    
    .app-subtitle {
      font-size: 18px;
      margin-bottom: 50px;
    }
    
    .action-buttons {
      margin-bottom: 50px;
    }
    
    .primary-button,
    .secondary-button {
      font-size: 16px;
      padding: 14px 28px;
    }
    
    .shape-1 {
      width: 200px;
      height: 200px;
    }
    
    .shape-2 {
      width: 150px;
      height: 150px;
    }
  }
</style>
