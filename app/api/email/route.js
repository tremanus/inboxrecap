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
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread newer_than:1d',
    });

    const messages = response.data.messages;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ message: 'No unread emails found' }), { status: 404 });
    }

    const emailPromises = messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      });

      const headers = msg.data.payload.headers;
      return {
        snippet: msg.data.snippet,
        body: getPlainTextBody(msg.data.payload),
        unsubscribeLinks: getUnsubscribeLinks(headers),
        sender: getHeaderValue(headers, 'From'),
        subject: getHeaderValue(headers, 'Subject'),
      };
    });

    const emailData = await Promise.all(emailPromises);

    return new Response(JSON.stringify(emailData), { status: 200 });
  } catch (error) {
    console.error('Error fetching unread emails:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch emails', error }), { status: 500 });
  }
}

function getPlainTextBody(payload) {
  let body = '';

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        break;
      } else if (part.mimeType === 'multipart/alternative' && part.parts) {
        for (const subPart of part.parts) {
          if (subPart.mimeType === 'text/plain' && subPart.body.data) {
            body = Buffer.from(subPart.body.data, 'base64').toString('utf-8');
            break;
          }
        }
      }
    }
  } else if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  return body;
}

function getUnsubscribeLinks(headers) {
  const unsubscribeHeader = headers.find(
    (header) => header.name.toLowerCase() === 'list-unsubscribe'
  );
  if (unsubscribeHeader) {
    return unsubscribeHeader.value
      .replace(/^<|>$/g, '') // Remove angle brackets if present
      .split(',')
      .map((link) => link.trim())
      .filter((link) => link.startsWith('http')); // Ensure valid HTTP links
  }
  return [];
}

function getHeaderValue(headers, name) {
  const header = headers.find(header => header.name === name);
  return header ? header.value : 'Unknown';
}
