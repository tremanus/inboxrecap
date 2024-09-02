import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const accessToken = session.user.accessToken;
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // Fetch a list of emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:inbox', // Filter emails from the last 24 hours
      maxResults: 100, // Limit the number of emails fetched initially
    });

    const messages = response.data.messages;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ message: 'No emails found' }), { status: 404 });
    }

    // Use Promise.all to fetch email details in parallel
    const emailDetails = await Promise.all(messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'metadata', // Fetch only metadata (headers)
      });
      return {
        headers: msg.data.payload.headers,
      };
    }));

    // Count emails per sender and collect unsubscribe links
    const senderCounts = {};
    const unsubscribeLinks = {};
    emailDetails.forEach(({ headers }) => {
      const sender = getHeaderValue(headers, 'From');
      const links = getUnsubscribeLinks(headers);
      if (sender) {
        senderCounts[sender] = (senderCounts[sender] || 0) + 1;
        if (links.length > 0) {
          unsubscribeLinks[sender] = links;
        }
      }
    });

    // Sort and slice top 10 senders
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
    console.error('Error fetching email senders:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch senders', error }), { status: 500 });
  }
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
