"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import Settings from './settings';
import Billing from './billing';
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSection, setSelectedSection] = useState('dashboard');
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
    if (isAuthenticated && user?.email) {
      // Fetch user statistics
      fetch(`/api/get-user-statistics?userEmail=${encodeURIComponent(user.email)}`)
        .then((response) => response.json())
        .then((data) => {
          setStats(data);
        })
        .catch((error) => {
          console.error('Error fetching statistics:', error);
        });

      // Fetch unread emails count based on selected category
      fetch(`/api/findunread?userEmail=${encodeURIComponent(user.email)}&category=${selectedCategory}`)
        .then((response) => response.json())
        .then((data) => {
          setUnreadCount(data.unreadCount); // Assuming your API returns { unreadCount: number }
        })
        .catch((error) => {
          console.error('Error fetching unread emails:', error);
        });
    }
  }, [isAuthenticated, user, selectedCategory]); // Include selectedCategory as a dependency

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
        borderColor: '#36A2EB', // Line color
        backgroundColor: [
          '#1041bd', // Color for 'Marked as Read'
          '#109148', // Color for 'Summarized'
          '#c42a1f', // Color for 'Sent to Trash'
        ],
        borderWidth: 2, // Line width
        pointBackgroundColor: [
          '#1041bd', // Color for point 'Marked as Read'
          '#109148', // Color for point 'Summarized'
          '#c42a1f', // Color for point 'Sent to Trash'
        ],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.1, // Smoothness of the line
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
        display: false, // Disable default title
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide grid lines on x-axis
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
          display: false, // Hide grid lines on y-axis
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
        top: 30, // Adjust padding as needed
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
        {/* Sidebar */}
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
        {/* Main Content */}
        <div className="main-content">
          <div className="header">
            <h1>{selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}</h1>
          </div>
          {/* Render the selected section */}
          {selectedSection === 'dashboard' && (
            <div className="content-container">
              {/* Unread Emails Count */}
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
                  <span className="user-email">{user?.email}</span>
                  <img src="/gmaillogo.png" alt="Gmail Logo" className="gmail-logo" />
                </div>
              </div>
              {/* Line Graph */}
              <div className="line-graph-container">
                <h2>Email Statistics</h2>
                <Line data={data} options={options} />
              </div>
              {/* Stats Section */}
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
