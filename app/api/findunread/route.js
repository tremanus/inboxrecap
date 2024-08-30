// app/api/markasread/route.js
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Function to create OAuth2 client using environment variables
function createOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  // Set the credentials
  oauth2Client.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    token_type: process.env.GOOGLE_TOKEN_TYPE,
    expiry_date: parseInt(process.env.GOOGLE_EXPIRY_DATE, 10),
  });

  return oauth2Client;
}

export async function GET(request) {
  try {
    const oauth2Client = createOAuth2Client();

    if (!oauth2Client) {
      return NextResponse.json({ error: 'No credentials found' }, { status: 401 });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const url = new URL(request.url);
    const category = url.searchParams.get('category') || 'all';
    const timeRange = url.searchParams.get('timeRange') || 'all';

    let unreadCount = 0;
    let pageToken = null;

    let query = 'is:unread';
    
    if (category === 'promotions') {
      query += ' category:promotions';
    } else if (category === 'social') {
      query += ' category:social';
    } else if (category === 'updates') {
      query += ' category:updates';
    }

    if (timeRange === '1d') {
      query += ' newer_than:1d';
    } else if (timeRange === '1w') {
      query += ' newer_than:7d';
    } else if (timeRange === '1m') {
      query += ' newer_than:30d';
    } else if (timeRange === '6m') {
      query += ' newer_than:180d';
    }

    console.log('Query:', query); // Log the query

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        pageToken: pageToken,
      });

      if (response.data.messages) {
        unreadCount += response.data.messages.length;
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread emails:', error); // Log error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
