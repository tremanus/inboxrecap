"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import Settings from './settings';
import Billing from './billing';
import Countdown from './countdown';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
);

import './designtest.css';

const Test = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [stats, setStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(null);
  const [summaryTime, setSummaryTime] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [userEmail, setUserEmail] = useState(null);

  const handleNavClick = (section) => {
    setSelectedSection(section);
  };
  
  const router = useRouter();

  useEffect(() => {
    document.title = "Dashboard | InboxRecap";
    
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch user email from the custom endpoint
      fetch('/api/get-user-email')
        .then((response) => response.json())
        .then((data) => {
          setUserEmail(data.email);
        })
        .catch((error) => {
          console.error('Error fetching user email:', error);
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (userEmail) {
      // Fetch user statistics
      fetch(`/api/get-user-statistics?userEmail=${encodeURIComponent(userEmail)}`)
        .then((response) => response.json())
        .then((data) => {
          setStats(data);
        })
        .catch((error) => {
          console.error('Error fetching statistics:', error);
        });

      // Fetch unread emails count based on selected category
      fetch(`/api/findunread?userEmail=${encodeURIComponent(userEmail)}&category=${selectedCategory}`)
        .then((response) => response.json())
        .then((data) => {
          setUnreadCount(data.unreadCount); // Assuming your API returns { unreadCount: number }
        })
        .catch((error) => {
          console.error('Error fetching unread emails:', error);
        });

      // Fetch summary time from user preferences
      fetch(`/api/get-user-preferences?userEmail=${encodeURIComponent(userEmail)}`)
        .then((response) => response.json())
        .then((data) => {
          const timeString = data.summary_time; // Assuming your API returns { summary_time: string }
          
          // Convert to 12-hour format with AM/PM
          const [hour, minute] = timeString.split(":");
          const hours = parseInt(hour, 10);
          const period = hours >= 12 ? "PM" : "AM";
          const formattedHours = hours % 12 || 12; // Convert to 12-hour format

          setSummaryTime(`${formattedHours}:${minute} ${period}`);
        })
        .catch((error) => {
          console.error('Error fetching summary time:', error);
        });
    }
  }, [userEmail, selectedCategory]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  const data = {
    labels: ['Marked as Read', 'Summarized', 'Sent to Trash'],
    datasets: [
      {
        data: [
          stats?.emails_marked_as_read || 0,
          stats?.emails_summarized || 0,
          stats?.emails_sent_to_trash || 0,
        ],
        borderColor: '#36A2EB',
        backgroundColor: [
          '#1041bd',
          '#109148',
          '#c42a1f',
        ],
        borderWidth: 2,
        pointBackgroundColor: [
          '#1041bd',
          '#109148',
          '#c42a1f',
        ],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
        titleFont: {
          family: "'Poppins', sans-serif",
          size: 16,
          weight: '600',
        },
        bodyFont: {
          family: "'Poppins', sans-serif",
          size: 14,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12,
            weight: '600',
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12,
            weight: '600',
          },
          beginAtZero: true,
        },
      },
    },
    layout: {
      padding: {
        top: 30,
        right: 0,
        bottom: 20,
        left: 0,
      },
    },
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    isAuthenticated && (
      <div className="dashboard-container">
        <div className="sidebar">
          <div className="profile-section">
            <img src={user?.picture || "/default-profile.png"} alt={user?.name} className="profile-picture" />
            <h3>Welcome back,</h3>
            <h2>{user?.name || "User"}</h2>
          </div>
          <div className="nav-links">
            <a onClick={() => handleNavClick('dashboard')}>
              <img src="/dashboard.png" alt="Dashboard Icon" />
              Dashboard
            </a>
            <a onClick={() => handleNavClick('settings')}>
              <img src="/settings.png" alt="Settings Icon" />
              Settings
            </a>
            <a onClick={() => handleNavClick('billing')}>
              <img src="/billing.png" alt="Billing Icon" />
              Billing
            </a>
          </div>
          <div className="dash-logo">
            <img src="/favicon.ico" alt="InboxRecap Logo" />
            <span className="dash-site-title">InboxRecap</span>
          </div>
        </div>
        <div className="main-content">
          <div className="header">
            <h1>{selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}</h1>
          </div>
          {selectedSection === 'dashboard' && (
            <div className="content-container">
              <div className="unread-emails-box">
                <div className="selector-container">
                  <select 
                    id="category-selector" 
                    className="category-selector" 
                    value={selectedCategory} 
                    onChange={handleCategoryChange}
                  >
                    <option value="all">All Mail</option>
                    <option value="promotions">Promotions</option>
                    <option value="social">Social</option>
                    <option value="updates">Updates</option>
                  </select>
                </div>
                <h2>Total Unread Emails</h2>
                <p>{unreadCount !== null ? unreadCount : 'Loading...'}</p>
                <div className="bottom-elements">
                  <span className="user-email">{userEmail}</span>
                  <img src="/gmaillogo.png" alt="Gmail Logo" className="gmail-logo" />
                </div>
              </div>
              <div className="line-graph-container">
                <h2>Email Statistics</h2>
                <Line data={data} options={options} />
              </div>
              <div className="stats">
                <div className="read-stat-box">
                  <h2>Emails Marked as Read</h2>
                  <p>{stats?.emails_marked_as_read || '0'}</p>
                </div>
                <div className="small-stats">
                  <div className="stat-box">
                    <h3>Emails Summarized</h3>
                    <p>{stats?.emails_summarized || '0'}</p>
                  </div>
                  <div className="stat-box">
                    <h1>Emails Sent to Trash</h1>
                    <p>{stats?.emails_sent_to_trash || '0'}</p>
                  </div>
                </div>
              </div>
              <div className="next-summary">
  <h3>Next Summary in:</h3>
  {summaryTime !== null ? <Countdown summaryTime={summaryTime} /> : "Loading..."}
</div>

            </div>
          )}
          {selectedSection === 'settings' && <Settings />}
          {selectedSection === 'billing' && <Billing />}
        </div>
      </div>
    )
  );
};

export default Test;
