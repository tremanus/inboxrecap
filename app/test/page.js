'use client';

import React, { useState } from 'react';
import SummaryEmail from '../../src/components/summaryemail';

const LastUnreadEmail = () => {
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const fetchEmailData = async () => {
    setLoading(true);
    setError(null);
    setShowSummary(false); // Reset the summary view when refetching
    try {
      const response = await fetch('/api/email');
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      const data = await response.json();
      setEmails(data);
      setShowSummary(true); // Show the summary once emails are fetched
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '100px auto' }}>
      <h2>Unread Emails from the Last 24 Hours</h2>
      <button 
        onClick={fetchEmailData} 
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Fetch Emails'}
      </button>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {showSummary ? (
        <SummaryEmail emails={emails} />
      ) : (
        emails.length > 0 ? (
          emails.map((email, index) => (
            <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', margin: '20px auto', maxWidth: '600px' }}>
              <p>
                <strong>Sender:</strong> {email.sender}
                {email.unsubscribeLinks.length > 0 && (
                  <a 
                    href={email.unsubscribeLinks[0]} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ marginLeft: '10px' }}
                  >
                    Unsubscribe
                  </a>
                )}
              </p>
              <p><strong>Subject:</strong> {email.subject}</p>
              <p><strong>Snippet:</strong> {email.snippet}</p>
              <textarea 
                readOnly
                value={email.body}
                style={{ width: '100%', height: '150px', marginTop: '10px' }}
              />
            </div>
          ))
        ) : (
          <p>No emails found</p>
        )
      )}
    </div>
  );
};

export default LastUnreadEmail;
