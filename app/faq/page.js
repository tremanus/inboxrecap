'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import DashboardNav from '../../src/components/dashboardnav'; // Import DashboardNav
import MobileDashboardNav from '../../src/components/mobiledashboardnav'; // Import MobileDashboardNav
import TopDashNav from '../../src/components/topdashnav'; // Import TopDashNav
import '../../src/components/clearinbox.css'; // Import CSS for consistent styling
import FAQ from '../../src/components/faq'; // Import your FAQ component

const FAQPage = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const [isMobile, setIsMobile] = useState(false); // Track screen size for mobile view

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signIn('google'); // Redirect to the sign-in page if not authenticated
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1027); // Set 1027px as breakpoint for mobile
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isLoading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    isAuthenticated && (
      <>
        <TopDashNav /> {/* Render the top navigation bar */}
        {isMobile ? (
          <MobileDashboardNav />
        ) : (
          <DashboardNav />
        )}
        <div className="dashboard-container"> {/* Container for dashboard */}
          <div className="main-content"> {/* Container for main content */}
            <div className="content-container"> {/* Container for content */}
              <div className="main2-row" style={{ marginTop: '-50px' }}> {/* Apply margin-top here */}
                <FAQ /> {/* Render the FAQ component */}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
};

const styles = {
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#555',
  },
};

export default FAQPage;
