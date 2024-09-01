"use client";
import React from 'react';
import { useSession } from 'next-auth/react';
import './dashboardnav.css'; // Import CSS for styling

const DashboardNav = ({ selectedSection, handleNavClick, userEmail }) => {
  const { data: session } = useSession();

  const getLinkClass = (section) => {
    return selectedSection === section ? 'nav-link active' : 'nav-link';
  };

  return (
    <div className="sidebar">
      <div className="profile-section">
        <img src={session?.user?.image || "/default-profile.png"} alt={session?.user?.name} className="profile-picture" />
        <h3>Welcome back,</h3>
        <h2>{session?.user?.name || "User"}</h2>
      </div>
      <div className="nav-links">
        <a 
          className={getLinkClass('dashboard')} 
          onClick={() => handleNavClick('dashboard')}
        >
          <img src="/dashboard.png" alt="Dashboard Icon" />
          Dashboard
        </a>
        <a 
          className={getLinkClass('settings')} 
          onClick={() => handleNavClick('settings')}
        >
          <img src="/settings.png" alt="Settings Icon" />
          Settings
        </a>
        <a 
          className={getLinkClass('billing')} 
          onClick={() => handleNavClick('billing')}
        >
          <img src="/billing.png" alt="Billing Icon" />
          Billing
        </a>
      </div>
      <div className="dash-logo">
        <img src="/favicon.ico" alt="InboxRecap Logo" />
        <span className="dash-site-title">InboxRecap</span>
      </div>
    </div>
  );
};

export default DashboardNav;
