"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EmailCounter from './emailcounter';
import './home.css'; // Ensure the CSS file is correctly imported

const Home = () => {
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    document.title = "InboxRecap | Clear & Summarize Your Inbox";
  }, []);

  const handlePricingClick = () => {
    router.push('/pricing'); // Use router.push for navigation
  };

  return (
    <section className="home">
      <div className="home-content">
        <h1>Manage your mail efficiently</h1>
        <p><b>Don't waste countless hours going through all of your emails:</b></p>
        <p className="check">✅ Mark your unread emails from the last day as read</p>
        <p className="check">✅ Summarize each email in one sentence</p>
        <p className="check">✅ Receive all the summaries in one daily email</p>
        <p className="check">✅ Mass delete emails & unsubscribe from mailing lists</p>
        <button className="try-button" onClick={handlePricingClick}>Try For Free</button>
        <p className="cancel">Cancel anytime</p>
        <div className="email-counter-container">
          <EmailCounter />
        </div>
      </div>
    </section>
  );
};

export default Home;
