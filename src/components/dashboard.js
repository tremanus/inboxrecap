import React, { useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react'; // Import useAuth0
import './dashboard.css'; // Ensure you have this CSS file for styling

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth0(); // Use useAuth0 hook
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard | InboxRecap";
  }, []);

  const handleClick = () => {
    // You might add functionality for editing the profile here
    // This can be used to navigate to a profile edit page or show a modal
    alert('Edit Profile functionality can be added here.');
  };

  const gmailClick = () => {
    navigate('/gmailapi');
  }

  const stripeClick = () => {
    window.location.href = 'https://billing.stripe.com/p/login/test_cN27sJcJVd4QeiY4gg';
};

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    isAuthenticated && (
      <div className="dashboard-container">
        {/* Profile Section */}
        <div className="profile-header">
          <img src={user?.picture} alt={user?.name} className="profile-picture" />
          <h2 className="profile-name">Welcome, {user?.name}!</h2>
          <p className="profile-email">{user?.email}</p>
        </div>

        {/* Summary Overview */}
        <div className="summary-overview">
          <h3>Your Email Summary for Today</h3>
          <div className="summary-box">
            <p><strong>Unread Emails:</strong> 23</p>
            <p><strong>Summarized Emails:</strong> 23</p>
            <p><strong>Next Summary Email:</strong> Scheduled for 7:00 AM Tomorrow</p>
          </div>
        </div>

        {/* Recent Summaries Section */}
        <div className="recent-summaries">
          <h3>Recent Email Summaries</h3>
          <ul className="summary-list">
            <li>"Meeting agenda for next week..." - from John Doe</li>
            <li>"Your invoice for July is ready..." - from Acme Corp</li>
            <li>"Don't miss our summer sale..." - from BestShop</li>
            {/* Add more summaries as needed */}
          </ul>
        </div>

        {/* Actions Section */}
        <div className="actions">
          <h3>Actions</h3>
          <button onClick={handleClick} className="settings-button">Edit Profile</button>
          <button onClick={stripeClick} className="manage-subscription-button">Manage Subscription</button>
          <button onClick={gmailClick} className="view-all-summaries-button">Summary Settings</button>
        </div>

        {/* Support Section */}
        <div className="support">
          <h3>Need Help?</h3>
          <p>Contact our support team if you have any issues or questions.</p>
          <button className="support-button">Contact Support</button>
        </div>
      </div>
    )
  );
};

export default Dashboard;
