// Use Vite's ?inline to import the raw CSS string so we can inject it into the Shadow DOM
import styleText from './style.css?inline';
import { marked } from 'marked';

class ChatWidget {
  private siteId: string;
  private token: string;
  private shadowRoot: ShadowRoot;
  private container: HTMLDivElement;
  private isOpen: boolean = false;
  private isTyping: boolean = false;
  private sessionId: string;
  private apiUrl: string = '';
  
  // DOM Elements
  private chatWindow!: HTMLDivElement;
  private toggleBtn!: HTMLButtonElement;
  private messagesContainer!: HTMLDivElement;
  private inputField!: HTMLInputElement;
  private sendBtn!: HTMLButtonElement;
  private typingIndicator!: HTMLDivElement;

  constructor() {
    // 1. Extract site_id from the script tag that loaded this file
    const scripts = document.getElementsByTagName('script');
    let currentScript = scripts[scripts.length - 1];
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('widget')) {
        currentScript = scripts[i];
        break;
      }
    }
    this.siteId = currentScript.getAttribute('data-site-id') || 'unknown';
    this.token = currentScript.getAttribute('data-token') || '';
    this.apiUrl = currentScript.getAttribute('data-api-url') || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    
    // Generate a simple session ID for the user
    this.sessionId = Math.random().toString(36).substring(2, 15);

    // 2. Setup the Shadow DOM host
    this.container = document.createElement('div');
    this.container.id = 'ai-chat-widget-root';
    this.container.style.position = 'fixed';
    this.container.style.bottom = '20px';
    this.container.style.right = '20px';
    this.container.style.zIndex = '999999';
    document.body.appendChild(this.container);

    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // 3. Inject styles and HTML
    this.render();
    this.bindEvents();
    
    // 4. Fetch Config
    this.fetchConfig();
    
    // Initial greeting
    this.addMessage("Hi! I'm your AI assistant. How can I help you today?", 'bot');
  }

  private async fetchConfig() {
    try {
      const res = await fetch(`${this.apiUrl}/api/sites/config/${this.siteId}/?token=${encodeURIComponent(this.token)}`);
      if (res.ok) {
        const config = await res.json();
        
        // Update Bot Name
        const titleEl = this.shadowRoot.querySelector('.header-info h3');
        if (titleEl && config.bot_name) titleEl.textContent = config.bot_name;
        
        // Update Theme and Color CSS Variables
        const wrapper = this.shadowRoot.querySelector('.widget-wrapper') as HTMLElement;
        if (wrapper) {
          if (config.theme_mode === 'light') {
            wrapper.classList.add('light-theme');
          }
          if (config.theme_color) {
            wrapper.style.setProperty('--bot-color', config.theme_color);
          }
        }
      }
    } catch (e) {
      console.error("Widget failed to fetch config:", e);
    } finally {
      const wrapper = this.shadowRoot.querySelector('.widget-wrapper');
      if (wrapper) wrapper.classList.add('loaded');
    }
  }

  private render() {
    // Inject CSS
    const styleTag = document.createElement('style');
    styleTag.textContent = styleText;
    this.shadowRoot.appendChild(styleTag);

    // Inject HTML
    const wrapper = document.createElement('div');
    wrapper.className = 'widget-wrapper';
    wrapper.innerHTML = `
      <!-- Chat Window -->
      <div class="chat-window closed" id="chat-window">
        <div class="chat-header">
          <div class="header-info">
            <div class="avatar">
              <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.928 11.607c-.202-.488-.635-.605-.928-.633V8c0-1.103-.897-2-2-2h-6V4.61c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5c-1.103 0-2 .897-2 2v2.997l-.082.006A1 1 0 0 0 1.99 12v2a1 1 0 0 0 1 1H3v5c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-5a1 1 0 0 0 1-1v-1.938a1.006 1.006 0 0 0-.072-.455zM5 20V8h14l.001 3.996L19 12v2l.001.005.001 5.995H5z"/><ellipse cx="8.5" cy="12" rx="1.5" ry="2"/><ellipse cx="15.5" cy="12" rx="1.5" ry="2"/><path d="M8 16h8v2H8z"/>
              </svg>
            </div>
            <div>
              <h3>AI Assistant</h3>
              <p>We typically reply instantly</p>
            </div>
          </div>
          <button class="close-btn" id="close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="chat-messages" id="chat-messages">
          <!-- Messages go here -->
          <div class="typing-indicator hidden" id="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
        
        <div class="chat-input-area">
          <form id="chat-form">
            <input type="text" id="chat-input" placeholder="Type your message..." autocomplete="off">
            <button type="submit" id="send-btn" disabled>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l-2 9 18-9-18-9 2 9zm0 0h8"></path>
              </svg>
            </button>
          </form>
          <div class="footer-branding">
            ⚡ Powered by ConvoAI
          </div>
        </div>
      </div>

      <!-- Toggle Button -->
      <button class="toggle-btn" id="toggle-btn">
        <svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        <svg class="icon-close hidden" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="currentColor"/>
        </svg>
      </button>
    `;
    this.shadowRoot.appendChild(wrapper);

    // Cache elements
    this.chatWindow = this.shadowRoot.getElementById('chat-window') as HTMLDivElement;
    this.toggleBtn = this.shadowRoot.getElementById('toggle-btn') as HTMLButtonElement;
    this.messagesContainer = this.shadowRoot.getElementById('chat-messages') as HTMLDivElement;
    this.inputField = this.shadowRoot.getElementById('chat-input') as HTMLInputElement;
    this.sendBtn = this.shadowRoot.getElementById('send-btn') as HTMLButtonElement;
    this.typingIndicator = this.shadowRoot.getElementById('typing-indicator') as HTMLDivElement;
  }

  private bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.toggleChat());
    const closeBtn = this.shadowRoot.getElementById('close-btn');
    closeBtn?.addEventListener('click', () => this.toggleChat());

    // Close chat if clicked outside the widget container
    const closeIfOutside = (e: Event) => {
      if (this.isOpen && !this.container.contains(e.target as Node)) {
        this.toggleChat();
      }
    };
    document.addEventListener('click', closeIfOutside);
    document.addEventListener('touchstart', closeIfOutside);

    const form = this.shadowRoot.getElementById('chat-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });

    this.inputField.addEventListener('input', () => {
      this.sendBtn.disabled = this.inputField.value.trim() === '';
    });

    // Strictly prevent scroll bleed (scroll chaining) to the parent window
    const preventScrollBleed = (e: Event) => {
      e.stopPropagation();
      
      const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
      const isAtTop = scrollTop === 0;
      const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
      
      let deltaY = 0;
      if (e instanceof WheelEvent) {
        deltaY = e.deltaY;
      } else if (e instanceof TouchEvent) {
        // Simple touch prevention for boundaries
        if (isAtTop || isAtBottom) {
          e.preventDefault();
        }
        return;
      }
      
      const isScrollingUp = deltaY < 0;
      const isScrollingDown = deltaY > 0;
      
      if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
        e.preventDefault();
      }
    };

    this.messagesContainer.addEventListener('wheel', preventScrollBleed, { passive: false });
    this.messagesContainer.addEventListener('touchmove', preventScrollBleed, { passive: false });
  }

  private toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.chatWindow.classList.remove('closed');
      this.toggleBtn.querySelector('.icon-open')?.classList.add('hidden');
      this.toggleBtn.querySelector('.icon-close')?.classList.remove('hidden');
      setTimeout(() => this.inputField.focus(), 300);
    } else {
      this.chatWindow.classList.add('closed');
      this.toggleBtn.querySelector('.icon-open')?.classList.remove('hidden');
      this.toggleBtn.querySelector('.icon-close')?.classList.add('hidden');
    }
  }

  private addMessage(text: string, role: 'user' | 'bot') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble markdown-body';
    
    if (role === 'bot') {
      // Parse markdown asynchronously or synchronously, marked.parse returns string here
      bubble.innerHTML = marked.parse(text) as string;
    } else {
      bubble.textContent = text;
    }
    
    msgDiv.appendChild(bubble);
    this.messagesContainer.insertBefore(msgDiv, this.typingIndicator);
    this.scrollToBottom();
  }

  private scrollToBottom() {
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
  }

  private async sendMessage() {
    const text = this.inputField.value.trim();
    if (!text || this.isTyping) return;

    // UI Updates
    this.inputField.value = '';
    this.sendBtn.disabled = true;
    this.addMessage(text, 'user');
    
    this.isTyping = true;
    this.typingIndicator.classList.remove('hidden');
    this.scrollToBottom();

    try {
      const response = await fetch(`${this.apiUrl}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: this.siteId,
          session_id: this.sessionId,
          token: this.token,
          message: text
        })
      });

      if (!response.ok) {
        this.typingIndicator.classList.add('hidden');
        this.isTyping = false;
        this.addMessage("Sorry, I'm having trouble connecting to the server.", 'bot');
        return;
      }

      this.typingIndicator.classList.add('hidden');
      this.isTyping = false;
      
      // Create empty bubble for streaming
      this.addMessage("", 'bot');
      const botMessages = this.messagesContainer.querySelectorAll('.message.bot');
      const currentBubble = botMessages[botMessages.length - 1].querySelector('.bubble') as HTMLDivElement;
      
      const reader = response.body?.getReader();
      if (!reader) return;
      
      const decoder = new TextDecoder('utf-8');
      let botMessageText = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botMessageText += decoder.decode(value, { stream: true });
        currentBubble.innerHTML = marked.parse(botMessageText) as string;
        this.scrollToBottom();
      }
      
    } catch (error) {
      this.typingIndicator.classList.add('hidden');
      this.isTyping = false;
      this.addMessage("Sorry, an error occurred.", 'bot');
    }
  }
}

// Initialize only if we are in the browser
if (typeof window !== 'undefined') {
  const initWidget = () => {
    // Check if it's already initialized
    if (!document.getElementById('ai-chat-widget-root')) {
      new ChatWidget();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
}
