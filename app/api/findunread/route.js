import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function getOAuthClientFromSession(session) {
  if (!session || !session.user || !session.user.accessToken) {
    console.error('No session or access token found');
    return null;
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: session.user.accessToken,
  });

  return oauth2Client;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const oauth2Client = await getOAuthClientFromSession(session);
    
    if (!oauth2Client) {
      console.error('OAuth client not created');
      return NextResponse.json({ error: 'No credentials found' }, { status: 401 });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const url = new URL(request.url);
    const category = url.searchParams.get('category') || 'all';
    const timeRange = url.searchParams.get('timeRange') || 'all';

    let unreadCount = 0;
    let pageToken = null;
    const batchSize = 4000;
    let processedEmails = 0;

    let query = 'is:unread';
    if (category === 'promotions') query += ' category:promotions';
    if (category === 'social') query += ' category:social';
    if (category === 'updates') query += ' category:updates';

    if (timeRange === '1d') query += ' newer_than:1d';
    if (timeRange === '1w') query += ' newer_than:7d';
    if (timeRange === '1m') query += ' newer_than:30d';
    if (timeRange === '6m') query += ' newer_than:180d';

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        pageToken: pageToken,
        maxResults: batchSize, // Process in batches
      });

      if (response.data.messages) {
        unreadCount += response.data.messages.length;
        processedEmails += response.data.messages.length;
      }

      pageToken = response.data.nextPageToken;

      // Break the loop if we've processed enough emails in this batch
      if (processedEmails >= batchSize) {
        break;
      }
    } while (pageToken);

    return NextResponse.json({ unreadCount, processedEmails });
  } catch (error) {
    console.error('Error fetching unread emails:', error); // Log error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
