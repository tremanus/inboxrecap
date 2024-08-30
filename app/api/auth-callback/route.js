import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Define scopes required for your application
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify' // Add this scope
];

async function loadSavedCredentialsIfExist(googleId) {
  try {
    // Query Supabase for the user's tokens
    const { data, error } = await supabase
      .from('users')
      .select('access_token, refresh_token, expiry_date, email')
      .eq('google_id', googleId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching credentials from Supabase:', error);
      return null;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth-callback`
    );

    oauth2Client.setCredentials({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiry_date: data.expiry_date,
    });

    // Check if the token is expired
    if (data.expiry_date && data.expiry_date <= Date.now()) {
      console.log('Access token has expired, refreshing token...');
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      await saveCredentials(googleId, oauth2Client, data.email);  // Save the new tokens
    }

    return oauth2Client;
  } catch (err) {
    console.error('Error loading credentials:', err);
    return null;
  }
}

async function saveCredentials(googleId, client, email) {
  const { access_token, refresh_token, token_type, expiry_date } = client.credentials;

  // Save or update user credentials in Supabase
  const { error } = await supabase
    .from('users')
    .upsert({
      google_id: googleId,
      access_token,
      refresh_token,
      token_type,
      expiry_date,
      email // Make sure to include email here
    });

  if (error) {
    console.error('Error saving credentials to Supabase:', error);
    throw new Error('Failed to save credentials.');
  }
}

async function authorize(code) {
  let oauth2Client = await loadSavedCredentialsIfExist(code);

  if (oauth2Client) {
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

    // Decode id_token to extract Google ID
    const idToken = tokens.id_token;
    if (!idToken) {
      throw new Error('id_token is missing in the token response.');
    }

    let decodedToken;
    try {
      decodedToken = jwt.decode(idToken);
    } catch (decodeError) {
      console.error('Error decoding id_token:', decodeError);
      throw new Error('Failed to decode id_token.');
    }

    if (!decodedToken || !decodedToken.sub) {
      throw new Error('Failed to decode id_token or extract Google ID.');
    }

    const googleId = decodedToken.sub;
    const email = decodedToken.email; // Extract email from the decoded token
    await saveCredentials(googleId, oauth2Client, email);

    return oauth2Client;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    throw new Error('Failed to authorize with Google.');
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
  }

  try {
    const oauth2Client = await authorize(code);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
  } catch (error) {
    console.error('Authorization Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
