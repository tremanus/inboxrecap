"use client";
import React, { useState, useEffect } from 'react';
import './emailcounter.css'; // Ensure this CSS file is created

const EmailCounter = () => {
  const [count, setCount] = useState(200);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    if (count > 0) {
      const interval = setInterval(() => {
        setCount(prevCount => {
          if (prevCount <= 1) {
            setHasEnded(true); // Set flag when countdown ends
            clearInterval(interval);
            return 200; // Reset count to 200 for the top set
          }
          return prevCount - 1;
        });
      }, 10);

      return () => clearInterval(interval);
    }
  }, [count]);

  // Calculate opacity based on count value
  const calculateOpacity = () => {
    if (count > 100) return 0; // No arrow if count is above 100
    const maxCount = 100; // Adjust as needed for when the arrow is fully visible
    const minOpacity = 0.2; // Minimum opacity
    return minOpacity + (1 - minOpacity) * (1 - (count / maxCount));
  };

  return (
    <div className="email-counter">
      <div className="email-counter-header">
        <div className={`email-counter-item ${hasEnded ? 'small-icon' : ''}`}>
          <img src="/mail.png" alt="Mail" className="email-icon" />
          <div className="count-display">{hasEnded ? 200 : count}</div>
        </div>
        <div className={`email-counter-item ${hasEnded ? 'small-icon' : ''}`}>
          <img src="/gmail.png" alt="Gmail" className="gmail-icon" />
          <div className="count-display">{hasEnded ? 200 : count}</div>
        </div>
        <div className={`email-counter-item ${hasEnded ? 'small-icon' : ''}`}>
          <img src="/outlook.png" alt="Outlook" className="gmail-icon" id="outlook"/>
          <div id="outlook" className="count-display">{hasEnded ? 200 : count}</div>
        </div>
      </div>
      <div 
  className="down-arrow" 
  style={{ opacity: hasEnded ? 1 : calculateOpacity() }}
>
  <img src="./arrow.png" alt="Down arrow" />
</div>
      <div className="email-counter-header second-set" style={{ opacity: hasEnded ? 1 : calculateOpacity() }}>
        <div className="email-counter-item">
          <img src="/mail.png" alt="Mail" className="email-icon" />
          <div className="count-display">0</div>
        </div>
        <div className="email-counter-item">
          <img src="/gmail.png" alt="Gmail" className="gmail-icon" />
          <div className="count-display">0</div>
        </div>
        <div className="email-counter-item">
          <img src="/outlook.png" alt="Outlook" className="gmail-icon" id="outlook"/>
          <div className="count-display" id="outlook">0</div>
        </div>
      </div>
    </div>
  );
};

export default EmailCounter;
