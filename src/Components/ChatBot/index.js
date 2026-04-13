// App.jsx - Fixed Chatbot Component
import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const QA_DATA = [
  { key: "hello", answer: "👋 Hello Commander! I'm Ari 5.0 — hypervoice ready." },
  { key: "hi", answer: "✨ Hey! Ari 5.0 at your service. Ask me anything." },

  { key: "tender", answer: "📊 Tender intelligence dashboard is active. Latest bids updated 2h ago." },
  { key: "what is tender", answer: "📊 A tender is a formal invitation to suppliers to bid for supplying goods or services." },

  { key: "bid", answer: "🚀 Bid engine v3.2 live. Strategy recommendations available." },
  { key: "what is bid", answer: "📦 A bid is a supplier's proposal offering price, terms, and delivery for a tender or contract." },

  { key: "mpr", answer: "📁 MPR workflow: 98% efficiency. All milestones synced." },
  { key: "what is mpr", answer: "📁 MPR (Material Purchase Requisition) is a formal request to procure goods or materials." },

  { key: "rfp", answer: "📄 RFP module active. Request for Proposal templates ready." },
  { key: "what is rfp", answer: "📄 RFP (Request for Proposal) is a document inviting vendors to submit proposals for a project." },

  { key: "po", answer: "🧾 Purchase Order system is live and tracking deliveries." },
  { key: "what is po", answer: "🧾 A PO (Purchase Order) is an official document issued to a supplier to authorize a purchase." },

  { key: "procurement", answer: "🏗️ Procurement system online. Managing sourcing, bidding, and vendor lifecycle." },
  { key: "what is procurement", answer: "🏗️ Procurement is the process of sourcing and acquiring goods or services from suppliers." },

  { key: "voice", answer: "🎙️ Voice module online. Tap mic and speak naturally!" },
  { key: "status", answer: "🟢 Systems nominal. Neural response time: 0.2ms." }
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: "✨ Ari 5.0 online • voice & neural sync active 🚀" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const getAnswer = (text) => {
    const lower = text.toLowerCase();
    for (let item of QA_DATA) {
      if (lower.includes(item.key)) return item.answer;
    }
    return "🤖 I'm Ari 5.0 — still learning. Try 'tender', 'bid', or 'voice'!";
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: "user", text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const reply = getAnswer(text);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: reply }]);
      setLoading(false);
      speak(reply);
    }, 500);
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("🌐 Voice not supported in this browser.");
      return;
    }
    if (listening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      if (transcript?.trim()) {
        setInput(transcript);
        sendMessage(transcript);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => setListening(false);
  };

  return (
    <>
      {/* Floating Button - Fixed Position */}
      <button className="chatbot-float-btn" onClick={() => setOpen(!open)}>
        <span className="btn-icon">🤖</span>
        <span className="btn-pulse"></span>
      </button>

      {/* Chat Window - Fixed Position but NOT covering content improperly */}
      <div className={`chatbot-window ${open ? 'active' : ''}`}>
        <div className="chatbot-header">
          <div className="header-left">
            <div className="avatar-container">
              <div className="avatar">A5</div>
              <div className="avatar-ring"></div>
            </div>
            <div className="header-info">
              <h3>Ari 5.0</h3>
              <div className="status">
                <span className={`status-dot ${listening ? 'listening' : 'online'}`}></span>
                <span>{listening ? 'Listening...' : 'Neural Active'}</span>
              </div>
            </div>
          </div>
          <button className="close-window" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="chatbot-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="message-bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chatbot-input-area">
          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask Ari 5.0... (or tap mic)"
              className="chat-input"
            />
            <button className="voice-input" onClick={startVoice}>
              {listening ? '⏺' : '🎤'}
            </button>
            <button className="send-input" onClick={() => sendMessage(input)}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;