"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AOS from 'aos'; // Import AOS library
import 'aos/dist/aos.css'; // Import AOS styles
import EmailCounter from './emailcounter';
import FAQ from './faq';
import Pricing from './pricing';
import Features from './features';
import Features2 from './features2';
import Features3 from './features3';
import './home.css'; // Ensure the CSS file is correctly imported

const Home = () => {
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    document.title = "InboxRecap | Clear & Summarize Your Inbox";
    AOS.init({ duration: 1000, once: true }); // Initialize AOS with custom settings
  }, []);

  const handlePricingClick = () => {
    router.push('/login'); // Use router.push for navigation
  };

  const handleViewPlansClick = () => {
    router.push('#pricing'); // Navigate to pricing page
  };

  return (
    <section className="home">
      <div className="home-content">
        <h1>Manage your email efficiently</h1>
        <h2>Receive AI-powered recaps of your inbox</h2>
        <div className="button-container">
          <button className="view-plans-button" onClick={handleViewPlansClick}>View plans</button>
          <button className="try-button" onClick={handlePricingClick}>Try for free</button>
        </div>
        <div className="email-counter-container">
          <EmailCounter />
        </div>
      </div>
      <Features />
      <Features2 />
      <Features3 />
      <Pricing />
      <FAQ />
    </section>
  );
};

export default Home;
