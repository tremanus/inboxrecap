import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Define scopes required for your application
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify' // Add this scope
];

// Load credentials from environment variables
function loadSavedCredentialsIfExist() {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    return new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth-callback`
    );
  }
  return null;
}

// Save credentials to environment variables
function saveCredentials(tokens) {
  process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
  process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token;
  process.env.GOOGLE_TOKEN_TYPE = tokens.token_type;
  process.env.GOOGLE_EXPIRY_DATE = tokens.expiry_date;
}

async function authorize(code) {
  let oauth2Client = loadSavedCredentialsIfExist();
  if (oauth2Client) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      token_type: process.env.GOOGLE_TOKEN_TYPE,
      expiry_date: parseInt(process.env.GOOGLE_EXPIRY_DATE, 10),
    });
    return oauth2Client;
  }

  oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth-callback`
  );

  try {
    console.log('Attempting to get token using code:', code);
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', tokens);
    oauth2Client.setCredentials(tokens);
    saveCredentials(tokens);
    return oauth2Client;
  } catch (error) {
    console.error('Error retrieving access token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to authorize with Google.');
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  console.log('Authorization Code:', code); // Debug log

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
  }

  try {
    const oauth2Client = await authorize(code);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
  } catch (error) {
    console.error('Authorization Error:', error); // Debug log
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
