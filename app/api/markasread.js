// pages/api/unread-emails.js

import { google } from 'googleapis';

const client_id = 'YOUR_CLIENT_ID';
const client_secret = 'YOUR_CLIENT_SECRET';
const redirect_uris = ['YOUR_REDIRECT_URI'];
const refresh_token = 'YOUR_REFRESH_TOKEN';

const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oauth2Client.setCredentials({ refresh_token });

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export default async function handler(req, res) {
  try {
    // Fetch the unread emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread', // Query parameter to get unread emails
    });

    const unreadCount = response.data.resultSizeEstimate;

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread emails:', error);
    res.status(500).json({ error: 'Error fetching unread emails' });
  }
}
