"use client";
import React from 'react';
import { useSession } from 'next-auth/react';
import './mobiledashboardnav.css'; // Import CSS for styling

const MobileDashboardNav = ({ selectedSection, handleNavClick }) => {
  const { data: session } = useSession();

  const getLinkClass = (section) => {
    return selectedSection === section ? 'mobile-nav-link active' : 'mobile-nav-link';
  };

  return (
    <div className="mobile-dashboard-nav">
      <div className="mobile-profile-section">
        <img src={session?.user?.image || "/default-profile.png"} alt={session?.user?.name} className="mobile-profile-picture" />
        <h3>Welcome back,</h3>
        <h2>{session?.user?.name || "User"}</h2>
      </div>
      <div className="mobile-nav-links">
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
    </div>
  );
};

export default MobileDashboardNav;
