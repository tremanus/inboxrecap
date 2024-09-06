'use client';

import React, { useState } from 'react';

const LastUnreadEmail = () => {
  const [status, setStatus] = useState(null); // New state to handle status messages
  const [sending, setSending] = useState(false); // New state to handle sending process

  const sendDailySummary = async () => {
    setSending(true);
    setStatus(null); // Reset status before sending

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send summary email');
      }

      setStatus('Email Sent'); // Set status message on success
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '100px auto' }}>
      <h2>Send Daily Summary Email</h2>
      <button 
        onClick={sendDailySummary} 
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
        disabled={sending}
      >
        {sending ? 'Sending...' : 'Send Daily Summary'}
      </button>

      {status && <div style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</div>}
    </div>
  );
};

export default LastUnreadEmail;
