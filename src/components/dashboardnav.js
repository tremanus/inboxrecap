"use client";
import React from 'react';
import { useSession } from 'next-auth/react';
import { Replay, Inbox, Settings, Payments, BarChart, QuestionAnswer, DeleteSweep } from '@mui/icons-material'; // Import BarChart icon
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
      <div className="dash-logo" onClick={() => handleNavClick('dashboard')} style={{ cursor: 'pointer' }}>
        <img src="/favicon.ico" alt="InboxRecap Logo" />
        <span className="dash-site-title">InboxRecap</span>
      </div>
      <div className="nav-links">
        <a 
          className={getLinkClass('clear-inbox')} 
          onClick={() => handleNavClick('clear-inbox')}
        >
          <IconButton>
            <Inbox style={{ color: 'white' }} />
          </IconButton>
          Clear Inbox
        </a>
        <a 
          className={getLinkClass('mass-delete')} 
          onClick={() => handleNavClick('mass-delete')}
        >
          <IconButton>
            <DeleteSweep style={{ color: 'white' }} />
          </IconButton>
          Mass Delete
        </a>
        <a 
          className={getLinkClass('daily-recap')} 
          onClick={() => handleNavClick('daily-recap')}
        >
          <IconButton>
            <Replay style={{ color: 'white' }} />
          </IconButton>
          Daily Recap
        </a>
        <a 
          className={getLinkClass('analytics')} 
          onClick={() => handleNavClick('dashboard')}
        >
          <IconButton>
            <BarChart style={{ color: 'white' }} /> {/* Use BarChart for Analytics */}
          </IconButton>
          Analytics
        </a>
        <a 
          className={getLinkClass('faq')} 
          onClick={() => handleNavClick('faq')}
        >
          <IconButton>
            <QuestionAnswer style={{ color: 'white' }} /> {/* Use BarChart for Analytics */}
          </IconButton>
          FAQs
        </a>
        <a 
          className={getLinkClass('billing')} 
          onClick={() => handleNavClick('billing')}
        >
          <IconButton>
            <Payments style={{ color: 'white' }} />
          </IconButton>
          Billing
        </a>
        <a 
          className={getLinkClass('settings')} 
          onClick={() => handleNavClick('settings')}
        >
          <IconButton>
            <Settings style={{ color: 'white' }} />
          </IconButton>
          Settings
        </a>
      </div>
    </div>
  );
};

export default DashboardNav;
