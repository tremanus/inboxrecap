"use client";
import React, { useState, useEffect } from 'react';
import './emailcounter.css'; // Ensure this CSS file is created

const EmailCounter = () => {
  const [count, setCount] = useState(200);

  useEffect(() => {
    if (count > 0) {
      const interval = setInterval(() => {
        setCount(prevCount => {
          if (prevCount <= 1) {
            clearInterval(interval);
            return 0; // Stop countdown at 0
          }
          return prevCount - 1;
        });
      }, 20);

      return () => clearInterval(interval);
    }
  }, [count]);

  return (
    <div className="email-counter">
      <div className="email-counter-header">
        <div className="email-counter-item">
          <img src="/mail.png" alt="Mail" className="email-icon" />
          <div className="count-display">{count}</div>
        </div>
        <div className="email-counter-item">
          <img src="/gmail.png" alt="Gmail" className="gmail-icon" />
          <div className="count-display">{count}</div>
        </div>
        <div className="email-counter-item">
          <img src="/outlook.png" alt="Outlook" className="gmail-icon" />
          <div className="count-display">{count}</div>
        </div>
      </div>
    </div>
  );
};

export default EmailCounter;
