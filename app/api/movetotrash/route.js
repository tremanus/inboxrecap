import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.promises.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

export async function POST(request) {
  try {
    const oauth2Client = await loadSavedCredentialsIfExist();
    
    if (!oauth2Client) {
      return NextResponse.json({ error: 'No credentials found' }, { status: 401 });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const { category, timeRange } = await request.json();

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

    let pageToken = null;
    const messageIds = [];

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        pageToken: pageToken,
      });

      if (response.data.messages) {
        response.data.messages.forEach(message => messageIds.push(message.id));
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    console.log('Messages to move to trash:', messageIds); // Log message IDs

    // Move messages to trash
    if (messageIds.length > 0) {
      await Promise.all(
        messageIds.map(messageId =>
          gmail.users.messages.trash({
            userId: 'me',
            id: messageId,
          })
        )
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving emails to trash:', error); // Log error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
