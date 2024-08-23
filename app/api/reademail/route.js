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

export async function GET(request) {
  try {
    const oauth2Client = await loadSavedCredentialsIfExist();
    
    if (!oauth2Client) {
      return NextResponse.json({ error: 'No credentials found' }, { status: 401 });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const url = new URL(request.url);
    const category = url.searchParams.get('category') || 'all';
    const timeRange = url.searchParams.get('timeRange') || 'all';

    let pageToken = null;
    let messageId = null;

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

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 1, // Fetch only the latest unread email
    });

    if (response.data.messages && response.data.messages.length > 0) {
      messageId = response.data.messages[0].id;
    } else {
      return NextResponse.json({ error: 'No unread emails found' }, { status: 404 });
    }

    const emailResponse = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    return NextResponse.json({ email: emailResponse.data });
  } catch (error) {
    console.error('Error reading email:', error); // Log error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
