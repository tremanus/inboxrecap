"use client";
import React from 'react';
import { useSession } from 'next-auth/react';
import { Home, Replay, Inbox, Settings, AttachMoney } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import './dashboardnav.css'; // Import CSS for styling

const DashboardNav = ({ selectedSection, userEmail }) => {
  const { data: session } = useSession();
  const router = useRouter(); // Initialize useRouter

  const getLinkClass = (section) => {
    return selectedSection === section ? 'nav-link active' : 'nav-link';
  };

  const handleNavClick = (path) => {
    router.push(`/${path}`); // Navigate to the selected path
  };

  return (
    <div className="sidebar">
      <div className="dash-logo">
        <img src="/favicon.ico" alt="InboxRecap Logo" />
        <span className="dash-site-title">InboxRecap</span>
      </div>
      <div className="nav-links">
        <a 
          className={getLinkClass('dashboard')} 
          onClick={() => handleNavClick('dashboard')}
        >
          <IconButton>
            <Home style={{ color: 'black' }} />
          </IconButton>
          Home
        </a>
        <a 
          className={getLinkClass('daily-recap')} 
          onClick={() => handleNavClick('daily-recap')}
        >
          <IconButton>
            <Replay style={{ color: 'black' }} />
          </IconButton>
          Daily Recap
        </a>
        <a 
          className={getLinkClass('clear-inbox')} 
          onClick={() => handleNavClick('clear-inbox')}
        >
          <IconButton>
            <Inbox style={{ color: 'black' }} />
          </IconButton>
          Clear Inbox
        </a>
        <a 
          className={getLinkClass('settings')} 
          onClick={() => handleNavClick('settings')}
        >
          <IconButton>
            <Settings style={{ color: 'black' }} />
          </IconButton>
          Settings
        </a>
        <a 
          className={getLinkClass('billing')} 
          onClick={() => handleNavClick('billing')}
        >
          <IconButton>
            <AttachMoney style={{ color: 'black' }} />
          </IconButton>
          Billing
        </a>
      </div>
    </div>
  );
};

export default DashboardNav;
