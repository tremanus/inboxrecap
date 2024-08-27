"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import './designtest.css';

const Test = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    document.title = "Dashboard | InboxRecap";
    
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    isAuthenticated && (
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="profile-section">
            <img src={user?.picture || "/default-profile.jpg"} alt={user?.name} className="profile-picture" />
            <h3>Welcome back,</h3>
            <h2>{user?.name || "User"}</h2>
          </div>
          <div className="nav-links">
  <a href="#">
    <img src="/dashboard.png" alt="Dashboard Icon" />
    Dashboard
  </a>
  <a href="#">
    <img src="/settings.png" alt="Settings Icon" />
    Settings
  </a>
  <a href="#">
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
            <h1>Dashboard</h1>
          </div>
          <div className="balance-card">
            <p className="balance-title">Available balance</p>
            <h2 className="balance-amount">$12,234</h2>
            <div className="credit-info">
              <p>**** 4532</p>
              <div className="toggle">
                <input type="checkbox" id="credit-toggle" />
                <label htmlFor="credit-toggle">Credit</label>
              </div>
            </div>
            <div className="payment-limit">
              <span>Internet payment limit</span>
              <span>1,200 / 3,000</span>
              <div className="payment-progress">
                <div className="payment-bar"></div>
              </div>
            </div>
          </div>
          <div className="stats">
            <div className="stat-box">
              <h4>Income</h4>
              <p>$5,700</p>
            </div>
            <div className="stat-box">
              <h4>Spending</h4>
              <p>$2,254</p>
            </div>
          </div>
          <div className="latest-spendings">
            <h3>Latest spendings</h3>
            <ul>
              <li>
                <span>Online store</span>
                <span>- $32.50</span>
              </li>
              <li>
                <span>Housekeeping</span>
                <span>- $4.20</span>
              </li>
              <li>
                <span>Tickets</span>
                <span>- $100.29</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  );
};

export default Test;
