// app/api/check-authorization/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function GET(req) {
  // Extract user Google ID from the request
  const { searchParams } = new URL(req.url);
  const googleId = searchParams.get('google_id');

  if (!googleId) {
    console.error('Google ID not provided in the request');
    return NextResponse.json({ authorized: false, error: 'Google ID not provided' }, { status: 400 });
  }

  try {
    // Query Supabase for the user's tokens
    const { data, error } = await supabase
      .from('users')
      .select('access_token, refresh_token, expiry_date')
      .eq('google_id', googleId)
      .single(); // Ensure we expect exactly one row

    if (error) {
      console.error('Error fetching credentials from Supabase:', error.message);
      return NextResponse.json({ authorized: false, error: 'Failed to fetch user data' }, { status: 500 });
    }

    if (!data) {
      console.warn('No credentials found for the given Google ID');
      return NextResponse.json({ authorized: false, error: 'No credentials found' }, { status: 404 });
    }

    // Initialize OAuth2 client
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

    // Check if the access token is still valid
    const currentTime = Date.now();
    if (data.expiry_date && data.expiry_date > currentTime) {
      return NextResponse.json({ authorized: true });
    } else {
      console.warn('Access token has expired');
      return NextResponse.json({ authorized: false, error: 'Access token has expired' });
    }
  } catch (error) {
    console.error('Error checking authorization:', error.message);
    return NextResponse.json({ authorized: false, error: 'Internal server error' }, { status: 500 });
  }
}
