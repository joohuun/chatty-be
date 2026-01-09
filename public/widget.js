(function() {
  // Styles
  const style = document.createElement('style');
  style.innerHTML = `
    #chatty-widget-container {
      font-family: 'Inter', sans-serif;
      z-index: 9999;
    }
    
    #chatty-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 72px;
      height: 72px;
      background-color: #ffd700;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      z-index: 10000;
    }
    
    #chatty-trigger:hover {
      transform: scale(1.05);
    }

    #chatty-trigger span {
      font-weight: bold;
      font-size: 12px;
      color: #000;
      margin-top: 4px;
    }
    
    #chatty-window {
      position: fixed;
      bottom: 110px;
      right: 24px;
      width: 380px;
      height: 600px;
      background-color: #1a1b1e;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #333;
    }

    .chatty-header {
      background-color: #000;
      padding: 16px;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chatty-header h3 {
      color: #ffd700;
      margin: 0;
      font-size: 18px;
    }

    .chatty-close {
      color: #888;
      cursor: pointer;
      font-size: 20px;
    }

    #chatty-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .message .username {
      color: #888;
      font-size: 12px;
      margin-bottom: 2px;
    }

    .message .content {
      background-color: #333;
      padding: 8px 12px;
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      max-width: 80%;
    }
    
    .message.mine .content {
      background-color: #ffd700;
      color: #000;
    }

    .message.mine {
      flex-direction: row-reverse;
    }

    .chatty-input-area {
      padding: 16px;
      background-color: #000;
      border-top: 1px solid #333;
      display: flex;
      gap: 10px;
    }

    #chatty-input {
      flex: 1;
      background: #333;
      border: none;
      border-radius: 20px;
      padding: 10px 16px;
      color: #fff;
      outline: none;
    }

    #chatty-send {
      background: #ffd700;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;
  document.head.appendChild(style);

  // Widget HTML
  const container = document.createElement('div');
  container.id = 'chatty-widget-container';
  container.innerHTML = `
    <div id="chatty-trigger">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>CHAT</span>
    </div>

    <div id="chatty-window">
      <div class="chatty-header">
        <h3>CHATTY</h3>
        <span class="chatty-close">&times;</span>
      </div>
      <div id="chatty-messages"></div>
      <div class="chatty-input-area">
        <input type="text" id="chatty-input" placeholder="메시지 입력..." />
        <button id="chatty-send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Load Socket.io script dynamically if not present
  if (!window.io) {
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
    script.onload = initChat;
    document.head.appendChild(script);
  } else {
    initChat();
  }

  function initChat() {
    const trigger = document.getElementById('chatty-trigger');
    const windowEl = document.getElementById('chatty-window');
    const closeBtn = document.querySelector('.chatty-close');
    const inputFn = document.getElementById('chatty-input');
    const sendBtn = document.getElementById('chatty-send');
    const messagesEl = document.getElementById('chatty-messages');

    let socket = null;

    trigger.addEventListener('click', () => {
      const isOpen = windowEl.style.display === 'flex';
      if (isOpen) {
        windowEl.style.display = 'none';
      } else {
        windowEl.style.display = 'flex';
        connectSocket();
        // Scroll to bottom
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    });

    closeBtn.addEventListener('click', () => {
      windowEl.style.display = 'none';
    });

    function addMessage(msg, isMine = false) {
      const div = document.createElement('div');
      div.className = `message ${isMine ? 'mine' : ''}`;
      // Basic sanitization
      const safeContent = msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      
      div.innerHTML = `
        <div class="content">
          ${!isMine ? `<div class="username">${msg.username}</div>` : ''}
          ${safeContent}
        </div>
      `;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function connectSocket() {
      if (socket) return;

      // Get token from global scope (Mocking the Host site providing it)
      const token = window.params?.token; 
      if (!token) {
        console.error("Chatty: No auth token found!");
        addMessage({content: "인증 토큰이 없습니다. 로그인해주세요.", username: "System"});
        return;
      }

      // Connect to the server path
      const serverUrl = window.CHAT_SERVER_URL || 'http://localhost:3000';
      socket = io(serverUrl, {
        auth: { token }
      });

      socket.on('connect', () => {
        console.log('Connected to chat server');
      });

      socket.on('history', (history) => {
        messagesEl.innerHTML = ''; // Clear previous
        history.forEach(msg => {
          const isMine = msg.username === window.params.username;
          addMessage(msg, isMine);
        });
      });

      socket.on('chat message', (msg) => {
        const isMine = msg.username === window.params.username;
        addMessage(msg, isMine);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected');
      });
      
      socket.on('connect_error', (err) => {
         console.error('Connection failed', err);
         addMessage({content: "연결 실패: " + err.message, username: "System"});
      });
    }

    // Send Message Logic
    function sendMessage() {
      const text = inputFn.value.trim();
      if (!text || !socket) return;
      
      socket.emit('chat message', text);
      inputFn.value = '';
    }

    sendBtn.addEventListener('click', sendMessage);
    inputFn.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
})();
