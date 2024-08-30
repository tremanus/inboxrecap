// src/app/api/get-user-email/route.js
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

export async function GET() {
  try {
    const oauth2Client = createOAuth2Client();

    if (!oauth2Client) {
      return NextResponse.json({ error: 'No credentials found' }, { status: 401 });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    return NextResponse.json({ email: profile.data.emailAddress });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
