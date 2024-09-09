import React, { useState, useEffect } from 'react';
import './TopSenders.css';

const TopSenders = () => {
  const [senders, setSenders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last_week');

  const fetchTopSenders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/top-senders?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch top senders');
      }
      const data = await response.json();
      setSenders(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSenders();
  }, [timeRange]);

  const handleUnsubscribe = async (link, senderEmail) => {
    // Open the unsubscribe link in a new tab
    window.open(link, '_blank');

    try {
      // Send a POST request to the backend to update Supabase
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: senderEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }

      const data = await response.json();
      console.log('Unsubscribed successfully:', data);
      // Optionally, refresh the list after unsubscribing
      fetchTopSenders();
    } catch (err) {
      console.error('Failed to unsubscribe:', err.message);
    }
  };

  const handleMarkAsRead = async (senderEmail) => {
    try {
      const response = await fetch('/api/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender: senderEmail, timeRange: timeRange }), // Ensure sender and timeRange are sent
      });
  
      if (!response.ok) {
        throw new Error('Failed to mark emails as read');
      }
  
      const data = await response.json();
      console.log('Marked as read successfully:', data);
      // Optionally, refresh the list after marking as read
      fetchTopSenders();
    } catch (err) {
      console.error('Failed to mark as read:', err.message);
    }
  };
  
  const handleDeleteAll = async (senderEmail) => {
    try {
      const response = await fetch('/api/movetotrash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteAll: true, timeRange: timeRange, sender: senderEmail }), // Remove sender if not needed
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete all emails');
      }
  
      const data = await response.json();
      console.log('Deleted all emails successfully:', data);
      fetchTopSenders();
    } catch (err) {
      console.error('Failed to delete all emails:', err.message);
    }
  };  

  const handleTimeRangeChange = (event) => {
    const newTimeRange = event.target.value;
    setTimeRange(newTimeRange);
  };

  const getProgressColor = (progress) => {
    if (progress < 50) return '#f44336'; // Red
    if (progress >= 50 && progress < 80) return '#ffeb3b'; // Yellow
    return '#4caf50'; // Green
  };

  return (
    <div className="top-senders-container">
      <div className="time-range-selector">
        <h2>Top Senders</h2>
        <select id="timeRange" value={timeRange} onChange={handleTimeRangeChange}>
          <option value="last_week">Last Week</option>
          <option value="last_month">Last Month</option>
          <option value="last_3_months">Last 3 Months</option>
          <option value="last_6_months">Last 6 Months</option>
        </select>
      </div>

      {error && <div className="error-message">Error: {error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-message">Fetching your top senders...</p>
        </div>
      ) : senders.length > 0 ? (
        <div className="table-container">
          <table className="senders-table">
            <thead>
              <tr>
                <th>From:</th>
                <th>Read</th>
                <th>Emails</th>
                <th></th> {/* Unsubscribe and Mark as Read button column */}
              </tr>
            </thead>
            <tbody>
              {senders.map((sender, index) => {
                const progress = (sender.read / sender.count) * 100;
                const progressColor = getProgressColor(progress);

                return (
                  <tr key={index}>
                    <td className="sender-name">{sender.sender}</td>
                    <td className="progress-cell">
                      <div className="progress">
                        <div className="progress-bar-container" title={`${sender.read} read, ${sender.count} total`}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: progressColor,
                            }}
                          ></div>
                        </div>
                        <p className="progress-percentage">{Math.round(progress)}%</p>
                      </div>
                    </td>
                    <td className="total-emails-cell">{sender.count}</td>
                    <td className="actions-cell">
                      <div class="button-container">
                      {sender.unsubscribeLinks && sender.unsubscribeLinks.length > 0 && !sender.unsubscribed ? (
                        <button
                          className="unsubscribe-button"
                          onClick={() => handleUnsubscribe(sender.unsubscribeLinks[0], sender.sender)}
                        >
                          Unsubscribe
                        </button>
                      ) : (
                        <span className="unsubscribed-text">Unsubscribed</span>
                      )}
                      <button
                        className="mark-as-read-button"
                        onClick={() => handleMarkAsRead(sender.sender)}
                      >
                        Mark as Read
                      </button>
                      <button
                        className="mark-as-read-button" // Reuse the same className for styling
                        onClick={() => handleDeleteAll(sender.sender)}
                      >
                        Delete
                      </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No senders found</p>
      )}
    </div>
  );
};

export default TopSenders;
