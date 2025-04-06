import React, { useState } from 'react';

const AIChatModal = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    // Add the user's message
    const userMsg = { sender: 'user', text: input.trim() };
    setMessages((msgs) => [...msgs, userMsg]);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input.trim() })
      });
      const data = await response.json();
      const aiMsg = { sender: 'ai', text: data.reply };
      setMessages((msgs) => [...msgs, aiMsg]);
    } catch (error) {
      console.error('Error talking to AI:', error);
    }
    setInput('');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>AI Assistant</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div style={styles.body}>
          {messages.map((msg, index) => (
            <div key={index} style={{ textAlign: msg.sender === 'ai' ? 'left' : 'right' }}>
              <strong>{msg.sender === 'ai' ? 'AI:' : 'You:'}</strong> {msg.text}
            </div>
          ))}
        </div>
        <div style={styles.footer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    background: '#fff',
    padding: '1rem',
    borderRadius: '5px',
    width: '400px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    margin: '1rem 0'
  },
  footer: {
    display: 'flex'
  }
};

export default AIChatModal;