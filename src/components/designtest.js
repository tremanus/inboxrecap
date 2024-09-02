"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Countdown from './countdown';
import DashboardNav from './dashboardnav';
import MobileDashboardNav from './mobiledashboardnav';
import TopDashNav from './topdashnav'; // Make sure the path is correct
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userEmail, setUserEmail] = useState(null);
  const [isMobile, setIsMobile] = useState(false); // Track screen size for mobile view

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
    // Check screen size on component mount and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 821); // Set 768px as breakpoint for mobile
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
        <>
         <TopDashNav />
      <div className="dashboard-container">
        {isMobile ? (
          <MobileDashboardNav
          />
        ) : (
          <DashboardNav
          />
        )}
        <div className="main-content">
            <div className="content-container">
                <div className="top-row">
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
              <div className="next-summary">
              <h3>Next Summary in:</h3>
              {summaryTime !== null ? <Countdown summaryTime={summaryTime} /> : "Loading..."}
              <p>{summaryTime}</p>
            </div>
            </div>
            <div className="big-stats">
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
            </div>
        </div>
      </div>
      </>
    )
  );
}  

export default Test;
