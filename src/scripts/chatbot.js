/* ============================================
   INNOVATEK — AI Chatbot Logic (OpenRouter)
   ============================================ */

import { select } from './utils.js';

const OPENROUTER_API_KEY = import.meta.env?.VITE_OPENROUTER_API_KEY || '';
const CHAT_API_URL = import.meta.env?.VITE_CHAT_API_URL || null; // e.g. http://127.0.0.1:8787/api/chat
const MODEL = 'poolside/laguna-xs.2:free'; // GPT-120B — primary model

export function initChatbot() {
  const chatbot = select('.chatbot');
  const toggle = select('.chatbot__toggle');
  const messagesContainer = select('.chatbot__messages');
  const input = select('.chatbot__input');
  const sendBtn = select('.chatbot__send');

  if (!chatbot || !toggle) return;

  // Toggle open/close
  toggle.addEventListener('click', () => {
    chatbot.classList.toggle('open');
    if (chatbot.classList.contains('open')) {
      input.focus();
    }
  });

  // Initial greeting
  addMessage("Bonjour ! Je suis l'assistant IA d'Innovatek. Comment puis-je vous aider à automatiser votre entreprise aujourd'hui ?", 'bot');

  const FALLBACK_MODEL = 'openrouter/free';

  // Send message handler
  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMessage(text, 'user');
    const typingIndicator = showTyping();

    const messages = [
      {
        "role": "system",
        "content": "You are the official AI assistant of Innovatek, a premium AI automation agency based in Tunisia. YOUR GOAL: Help users understand how Innovatek can transform their business with▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀IA.CONTACT INFO:\n- Official Website: innovatek.netlify.app - Contact Method: Tell users theyota
         can fill out the contact form at the bottom of the page to get a free consultation.\n- WhatsApp: +216 53% used
         052 134\n\nRULES:\n1. Use 'innovatek.netlify.app' as the only website link. Never mention '.net'
         or other domains.\n2. If the user asks how to contact you, always mention the contact form at the bottom of
         this page.\n3. If the user just says 'Hello' or greets you, respond with a very short, friendly
         greeting.\n4. Only provide a detailed overview of our services (AI Automations, Web/Mobile/SAAS apps) if
         the user specifically asks.\n5. Use bullet points with emojis and double line breaks for readability.\n6.
         Always respond in the language the user uses (French, English, or Arabic)."
      },
      { "role": "user", "content": text }
    ];

    try {
      // First Attempt: Primary Model
      let botResponse = await callOpenRouter(MODEL, messages);
      
      typingIndicator.remove();
      addMessage(botResponse, 'bot');

    } catch (error) {
      console.warn("Primary model failed, trying fallback...", error);
      
      try {
        // Second Attempt: Fallback Model
        let botResponse = await callOpenRouter(FALLBACK_MODEL, messages);
        typingIndicator.remove();
        addMessage(botResponse, 'bot');
      } catch (fallbackError) {
        console.error("Chatbot Critical Error:", fallbackError);
        typingIndicator.remove();
        
        const errorMsg = fallbackError.message || "";
        const isAuthError = errorMsg.toLowerCase().includes("user not found") || 
                            errorMsg.toLowerCase().includes("api key") ||
                            errorMsg.toLowerCase().includes("unauthorized") ||
                            errorMsg.toLowerCase().includes("401");
                            
        if (isAuthError) {
          addMessage(
            "🔑 <strong>Erreur de clé API OpenRouter (401)</strong> : La clé API dans votre fichier <code>.env</code> est invalide, expirée ou inexistante (\"User not found\").<br><br>Veuillez générer une nouvelle clé sur <a href=\"https://openrouter.ai/keys\" target=\"_blank\" style=\"color: #00bcd4; text-decoration: underline;\">openrouter.ai/keys</a>, mettre à jour <code>VITE_OPENROUTER_API_KEY</code> dans votre fichier <code>.env</code>, puis redémarrer votre serveur de développement.",
            'bot'
          );
        } else {
          addMessage("Désolé, j'ai rencontré une petite erreur technique. Pouvez-vous réessayer ?", 'bot');
        }
      }
    }
  };

  async function callOpenRouter(modelId, messages) {
    // If a server-side chat proxy is configured, use it (safer for production).
    if (CHAT_API_URL) {
      const resp = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: modelId, messages })
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
      throw new Error(data.error?.message || `Proxy error: ${resp.status}`);
    }

    // Fallback: direct client-side call to OpenRouter (not recommended for production)
    if (!OPENROUTER_API_KEY) {
      throw new Error("API Key is missing. Please check your .env file.");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Innovatek AI"
      },
      body: JSON.stringify({
        "model": modelId,
        "messages": messages
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error(data.error?.message || "Invalid API response");
    }
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  function addMessage(text, side) {
    const msg = document.createElement('div');
    msg.className = `chatbot__message chatbot__message--${side}`;
    // Support line breaks and bullet points
    msg.innerHTML = text.replace(/\n/g, '<br>');
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chatbot__typing';
    typing.innerHTML = '<div class="chatbot__dot"></div><div class="chatbot__dot"></div><div class="chatbot__dot"></div>';
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typing;
  }
}
