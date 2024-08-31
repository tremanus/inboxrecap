"use client";
import React, { useEffect, useState } from 'react';
import './designtest.css';

const Countdown = ({ summaryTime }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!summaryTime) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const [time, period] = summaryTime.split(' '); // Split into time and AM/PM period
      const [hours, minutes] = time.split(':').map(Number);

      // Convert to 24-hour format
      let adjustedHours = hours;
      if (period === 'PM' && hours !== 12) {
        adjustedHours += 12;
      } else if (period === 'AM' && hours === 12) {
        adjustedHours = 0;
      }

      const summaryDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), adjustedHours, minutes);

      // If the summary time has already passed today, set it for tomorrow
      if (now > summaryDateTime) {
        summaryDateTime.setDate(summaryDateTime.getDate() + 1);
      }

      const totalDayTime = 24 * 60 * 60 * 1000; // Total milliseconds in a day
      const difference = summaryDateTime - now;
      const timePassed = totalDayTime - difference;

      const hoursRemaining = Math.floor(difference / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hoursRemaining}h ${minutesRemaining}m`);
      setProgress((timePassed / totalDayTime) * 100); // Convert to percentage
    };

    const intervalId = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [summaryTime]);

  return (
    <>
      <h4 className="time-remaining">{timeRemaining}</h4>
      <div className="countdown-timer">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      </>
  );
};

export default Countdown;
