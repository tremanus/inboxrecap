"use client";
import { useState } from 'react';

export default function EmailTestPage() {
  const [textContent, setTextContent] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch('/api/sendemail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage('Email sent successfully!');
      } else {
        setStatusMessage(`Error: ${data.error || 'An unknown error occurred'}`);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Send Test Email</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="textContent">Message Content:</label>
          <textarea
            id="textContent"
            name="textContent"
            rows="4"
            cols="50"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
      </form>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
}
