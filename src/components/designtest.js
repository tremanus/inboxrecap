"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Settings from './settings';
import Billing from './billing';
import Countdown from './countdown';
import { Line } from 'react-chartjs-2';
import { createChartData, chartOptions } from './statchart'; // Import from statchart.js
import './designtest.css';

const Test = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const [stats, setStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(null);
  const [summaryTime, setSummaryTime] = useState(null);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [category, setCategory] = useState('all');
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
      signIn("google"); // Redirects to the sign-in page
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [isAuthenticated, session]);

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

  const markAsRead = async () => {
    setMarkingAsRead(true);
    try {
      const response = await fetch('/api/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: selectedCategory }), // Ensure selectedCategory is used
      });
      const data = await response.json();
      if (data.success) {
        fetchUnreadEmailCount();
      } else {
        console.error('Error marking emails as read:', data.error);
      }
    } catch (error) {
      console.error('Error marking emails as read:', error);
    } finally {
      setMarkingAsRead(false);
    }
  };
  

  const deleteEmails = async () => {
    setDeleting(true);
    try {
      const response = await fetch('/api/movetotrash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: selectedCategory }),
      });
      const data = await response.json();
      if (data.success) {
        // Refresh unread count after deletion
        fetchUnreadEmailCount();
      } else {
        console.error('Error deleting emails:', data.error);
      }
    } catch (error) {
      console.error('Error deleting emails:', error);
    } finally {
      setDeleting(false);
    }
  };

  const fetchUnreadEmailCount = async () => {
    if (userEmail) {
      try {
        const response = await fetch(`/api/findunread?userEmail=${encodeURIComponent(userEmail)}&category=${selectedCategory}`);
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread email count:', error);
      }
    }
  };

  const chartData = createChartData(stats); // Use the imported function

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    isAuthenticated && (
      <div className="dashboard-container">
        <div className="sidebar">
          <div className="profile-section">
            <img src={session?.user?.image || "/default-profile.png"} alt={session?.user?.name} className="profile-picture" />
            <h3>Welcome back,</h3>
            <h2>{session?.user?.name || "User"}</h2>
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
                <div className="email-actions">
                <button onClick={markAsRead} disabled={markingAsRead}>
                  {markingAsRead ? 'Marking as Read...' : 'Mark as Read'}
                </button>
                <button onClick={deleteEmails} disabled={deleting}>
                  {deleting ? 'Moving to Trash...' : 'Move to Trash'}
                </button>
              </div>
                <div className="bottom-elements">
                  <span className="user-email">{userEmail}</span>
                  <img src="/gmaillogo.png" alt="Gmail Logo" className="gmail-logo" />
                </div>
              </div>
              <div className="next-summary">
              <h3>Next Summary in:</h3>
              {summaryTime !== null ? <Countdown summaryTime={summaryTime} /> : "Loading..."}
              <p>{summaryTime}</p>
            </div>
            <div className="line-graph-container">
              <h2>Email Statistics</h2>
              <Line data={chartData} options={chartOptions} /> {/* Use imported chartData and chartOptions */}
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
            </div>
          )}
          {selectedSection === 'settings' && <Settings />}
          {selectedSection === 'billing' && <Billing />}
        </div>
      </div>
    )
  );
}  

export default Test;
