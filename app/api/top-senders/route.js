import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
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
  const session = await getServerSession(authOptions);
  const oauth2Client = await getOAuthClientFromSession(session);
  
  if (!oauth2Client) {
    console.error('OAuth client not created');
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const url = new URL(request.url);
  const timeRange = url.searchParams.get('timeRange') || 'last_week';
  const startDate = getStartDateFromRange(timeRange);

  let messages = [];
  let nextPageToken = null;
  const batchSize = 100; // Set appropriate batch size

  try {
    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: `after:${startDate} is:inbox`,
        pageToken: nextPageToken,
        maxResults: batchSize,
      });

      console.log(`Fetched ${response.data.messages.length} messages.`);

      messages = messages.concat(response.data.messages || []);
      nextPageToken = response.data.nextPageToken;

    } while (nextPageToken)

    if (messages.length === 0) {
      return new Response(JSON.stringify({ message: 'No emails found' }), { status: 404 });
    }

    const emailDetails = await Promise.all(messages.map(async (message) => {
      try {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
        });
        return {
          headers: msg.data.payload.headers,
        };
      } catch (error) {
        console.error(`Failed to fetch message details for ID: ${message.id}`, error);
        return null; // Handle errors gracefully
      }
    }));

    const senderCounts = {};
    const unsubscribeLinks = {};
    emailDetails.filter(Boolean).forEach(({ headers }) => {
      const sender = getHeaderValue(headers, 'From');
      const links = getUnsubscribeLinks(headers);

      if (sender) {
        senderCounts[sender] = (senderCounts[sender] || 0) + 1;
        if (links.length > 0) {
          unsubscribeLinks[sender] = links;
        }
      }
    });

    const sortedSenders = Object.entries(senderCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([sender, count]) => ({
        sender,
        count,
        unsubscribeLinks: unsubscribeLinks[sender] || [],
      }));

    return new Response(JSON.stringify(sortedSenders), { status: 200 });
  } catch (error) {
    console.error('Error fetching top senders:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch senders', error }), { status: 500 });
  }
}

function getStartDateFromRange(range) {
  const now = new Date();
  switch (range) {
    case 'last_week':
      now.setDate(now.getDate() - 7);
      break;
    case 'last_month':
      now.setMonth(now.getMonth() - 1);
      break;
    case 'last_3_months':
      now.setMonth(now.getMonth() - 3);
      break;
    case 'last_6_months':
      now.setMonth(now.getMonth() - 6);
      break;
    default:
      now.setMonth(now.getMonth() - 1);
  }
  return Math.floor(now.getTime() / 1000); // Gmail API requires a Unix timestamp
}

function getUnsubscribeLinks(headers) {
  const unsubscribeHeader = headers.find(
    (header) => header.name.toLowerCase() === 'list-unsubscribe'
  );
  if (unsubscribeHeader) {
    return unsubscribeHeader.value
      .replace(/<|>/g, '') // Remove angle brackets
      .split(',')
      .map((link) => link.trim())
      .filter(link => !link.startsWith('mailto:')); // Filter out mailto: links
  }
  return [];
}

function getHeaderValue(headers, name) {
  const header = headers.find(header => header.name === name);
  return header ? header.value : 'Unknown';
}
