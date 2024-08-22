import React from 'react';
import { Link } from 'react-router-dom';
import './accessdenied.css'; // Include custom styles if needed

function AccessDenied() {
  return (
    <div className="access-denied">
      <h1>Access Denied</h1>
      <p>Sorry, you don't have permission to access this page. You must purchase a plan to gain access.</p>
      <Link to="/pricing" className="home-link">Purchase a Plan</Link>
    </div>
  );
}

export default AccessDenied;
