import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import './gmailapi.css';
import GptSummary from './gptsummary';

const CLIENT_ID = process.env.REACT_APP_GMAIL_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GMAIL_API_KEY;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
const SCOPES = 'https://www.googleapis.com/auth/gmail.modify';

const GmailApi = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('gmailAccount') || null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all'); // State for email category
  const [timeRange, setTimeRange] = useState('all'); // New state for time range

  useEffect(() => {
    const initializeGapiClient = async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
          clientId: CLIENT_ID,
          scope: SCOPES,
        });

        const authInstance = gapi.auth2.getAuthInstance();
        const isUserSignedIn = authInstance.isSignedIn.get();
        setIsSignedIn(isUserSignedIn);

        if (isUserSignedIn) {
          const profile = authInstance.currentUser.get().getBasicProfile();
          const email = profile.getEmail();
          
          if (userEmail && userEmail !== email) {
            await authInstance.signOut();
            alert('You can only use the Gmail account initially authorized.');
          } else {
            if (!userEmail) {
              setUserEmail(email);
              localStorage.setItem('gmailAccount', email);
            }
            fetchUnreadEmailCount(category, timeRange); // Pass category and timeRange when fetching unread email count
          }
        }
      } catch (error) {
        console.error('Error initializing GAPI client:', error);
      }
    };

    gapi.load('client:auth2', initializeGapiClient);
  }, [userEmail, category, timeRange]); // Add timeRange to dependency array

  const handleAuthClick = async () => {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!isSignedIn) {
      try {
        await authInstance.signIn();
        const profile = authInstance.currentUser.get().getBasicProfile();
        const email = profile.getEmail();
        
        if (userEmail && userEmail !== email) {
          await authInstance.signOut();
          alert('You can only use the Gmail account initially authorized.');
        } else {
          setIsSignedIn(true);
          if (!userEmail) {
            setUserEmail(email);
            localStorage.setItem('gmailAccount', email);
          }
          fetchUnreadEmailCount(category, timeRange); // Pass category and timeRange when fetching unread email count
        }
      } catch (error) {
        console.error('Error signing in:', error);
      }
    }
  };

  const fetchUnreadEmailCount = async (selectedCategory, selectedTimeRange) => {
    try {
      setUnreadCount(null); // Reset unread count to avoid stale data
      let unreadMessagesCount = 0;
      let nextPageToken = null;
      let query = 'is:unread';

      if (selectedCategory === 'promotions') {
        query += ' category:promotions';
      } else if (selectedCategory === 'social') {
        query += ' category:social';
      } else if (selectedCategory === 'updates') {
        query += ' category:updates';
      }

      // Add newer_than query based on the selected time range
      if (selectedTimeRange === '1d') {
        query += ' newer_than:1d';
      } else if (selectedTimeRange === '1w') {
        query += ' newer_than:7d';
      } else if (selectedTimeRange === '1m') {
        query += ' newer_than:30d';
      } else if (selectedTimeRange === '6m') {
        query += ' newer_than:180d';
      }

      do {
        const response = await gapi.client.gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults: 100,
          pageToken: nextPageToken,
        });

        const messages = response.result.messages || [];
        unreadMessagesCount += messages.length;
        nextPageToken = response.result.nextPageToken;
      } while (nextPageToken);

      setUnreadCount(unreadMessagesCount);
    } catch (error) {
      console.error('Error fetching unread emails:', error);
    }
  };

  const markUnreadEmailsAsRead = async () => {
    try {
      setLoading(true);
      let nextPageToken = null;

      // Display the message while emails are being processed
      document.getElementById('content').innerText = 'All of your unread emails are currently being marked as read. Do not close your tab while this is being completed.';

      let query = 'is:unread';
      if (category === 'promotions') {
        query += ' category:promotions';
      } else if (category === 'social') {
        query += ' category:social';
      } else if (category === 'updates') {
        query += ' category:updates';
      }

      // Add newer_than query based on the selected time range
      if (timeRange === '1d') {
        query += ' newer_than:1d';
      } else if (timeRange === '1w') {
        query += ' newer_than:7d';
      } else if (timeRange === '1m') {
        query += ' newer_than:30d';
      } else if (timeRange === '6m') {
        query += ' newer_than:180d';
      }

      do {
        const response = await gapi.client.gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults: 100,
          pageToken: nextPageToken,
        });

        const messages = response.result.messages || [];
        const batch = gapi.client.newBatch();
        messages.forEach((message) => {
          batch.add(gapi.client.gmail.users.messages.modify({
            userId: 'me',
            id: message.id,
            resource: {
              removeLabelIds: ['UNREAD'],
            },
          }));
        });

        await batch.then(() => {
          console.log(`Processed ${messages.length} messages`);
        });

        nextPageToken = response.result.nextPageToken;
      } while (nextPageToken);

      setLoading(false);
      document.getElementById('content').innerText = 'All unread emails have been marked as read.';
      fetchUnreadEmailCount(category, timeRange); // Refresh unread count after marking as read
    } catch (error) {
      console.error('Error marking emails as read:', error);
      setLoading(false);
      document.getElementById('content').innerText = '';
    }
  };

  const moveEmailsToTrash = async () => {
    try {
      setLoading(true);
      let nextPageToken = null;

      // Display the message while emails are being processed
      document.getElementById('content').innerText = 'All of your selected emails are being moved to the trash. Do not close your tab while this is being completed.';

      let query = 'is:unread';
      if (category === 'promotions') {
        query += ' category:promotions';
      } else if (category === 'social') {
        query += ' category:social';
      } else if (category === 'updates') {
        query += ' category:updates';
      }

      // Add newer_than query based on the selected time range
      if (timeRange === '1d') {
        query += ' newer_than:1d';
      } else if (timeRange === '1w') {
        query += ' newer_than:7d';
      } else if (timeRange === '1m') {
        query += ' newer_than:30d';
      } else if (timeRange === '6m') {
        query += ' newer_than:180d';
      }

      do {
        const response = await gapi.client.gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults: 100,
          pageToken: nextPageToken,
        });

        const messages = response.result.messages || [];
        const batch = gapi.client.newBatch();
        messages.forEach((message) => {
          batch.add(gapi.client.gmail.users.messages.trash({
            userId: 'me',
            id: message.id,
          }));
        });

        await batch.then(() => {
          console.log(`Moved ${messages.length} messages to trash`);
        });

        nextPageToken = response.result.nextPageToken;
      } while (nextPageToken);

      setLoading(false);
      document.getElementById('content').innerText = 'All selected emails have been moved to the trash.';
      fetchUnreadEmailCount(category, timeRange); // Refresh unread count after moving to trash
    } catch (error) {
      console.error('Error moving emails to trash:', error);
      setLoading(false);
      document.getElementById('content').innerText = '';
    }
  };

  return (
    <>
    <button className="auth-button" onClick={handleAuthClick}>
        {isSignedIn ? `Account: ${userEmail}` : 'Link Your Email'}
    </button>
    <h2 className="upgrade"><a href="https://billing.stripe.com/p/login/test_cN27sJcJVd4QeiY4gg">Upgrade</a> to connect to more accounts</h2>
    <div className="main-container">
      <div className="clear-container">
        <h1>Clear Your Inbox</h1>
        <h2>Clean up your unwanted emails and save storage</h2>
        {isSignedIn && (
          <>
            <div className="selectors-container">
            <div className="category-selector">
              <label htmlFor="category-select">Select Category: </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All Mail</option>
                <option value="promotions">Promotions</option>
                <option value="social">Social</option>
                <option value="updates">Updates</option>
              </select>
            </div>
  
            <div className="time-range-selector">
              <label htmlFor="time-range-select">Select Time Range: </label>
              <select
                id="time-range-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="1d">Last 24 hours</option>
                <option value="1w">Last 7 days</option>
                <option value="1m">Last 30 days</option>
                <option value="6m">Last 6 months</option>
                <option value="all">All Time</option>
              </select>
            </div>
            </div>
  
            {unreadCount !== null && (
              <p>{`You currently have ${unreadCount} unread ${category === 'all' ? '' : category} emails.`}</p>
            )}
  
            {unreadCount > 0 && (
              <>
              <button onClick={markUnreadEmailsAsRead} disabled={loading}>
                {loading ? 'Marking as Read...' : 'Mark as Read'}
              </button>
              <button onClick={moveEmailsToTrash} disabled={loading}>
                {loading ? 'Deleting Emails...' : 'Delete Emails'}
              </button>
              </>
            )}
          </>
        )}
        <div id="content"></div>
      </div>
      <div className="summarize-container">
        <h1>Clear & Summarize</h1>
        <h2>Mark emails as read and receive one sentence recaps of each</h2>
        <GptSummary />
      </div>
    </div>
    </>
  );  
};

export default GmailApi;
