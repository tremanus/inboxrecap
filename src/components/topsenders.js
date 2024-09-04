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

  const handleUnsubscribe = (link) => {
    window.open(link, '_blank');
  };

  const handleTimeRangeChange = (event) => {
    const newTimeRange = event.target.value;
    setTimeRange(newTimeRange);
  };

  return (
    <div className="top-senders-container">
      <div className="time-range-selector">
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
                <th></th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {senders.map((sender, index) => (
                <tr key={index}>
                  <td className="sender-name">{sender.sender}</td>
                  <td className="unsubscribe-cell">
                    {sender.unsubscribeLinks && sender.unsubscribeLinks.length > 0 && (
                      <button className="unsubscribe-button" onClick={() => handleUnsubscribe(sender.unsubscribeLinks[0])}>
                        Unsubscribe
                      </button>
                    )}
                  </td>
                  <td>{sender.count}</td>
                </tr>
              ))}
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