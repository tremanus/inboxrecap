import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Create OAuth2 client using environment variables
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

export async function POST(request) {
  try {
    const oauth2Client = createOAuth2Client();
    
    if (!oauth2Client) {
      return NextResponse.json({ error: 'No credentials found' }, { status: 401 });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch user profile to get email address
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    // Parse request body
    const { category, timeRange } = await request.json();

    // Build the query
    let query = 'is:unread';
    if (category === 'promotions') query += ' category:promotions';
    if (category === 'social') query += ' category:social';
    if (category === 'updates') query += ' category:updates';
    if (timeRange === '1d') query += ' newer_than:1d';
    if (timeRange === '1w') query += ' newer_than:7d';
    if (timeRange === '1m') query += ' newer_than:30d';
    if (timeRange === '6m') query += ' newer_than:180d';

    // Fetch message IDs
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

    console.log('Messages to move to trash:', messageIds);

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

    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('email_statistics')
      .select('id')
      .eq('user_id', userEmail)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    // Create user if not exists
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('email_statistics')
        .insert([{ user_id: userEmail }]);

      if (insertError) {
        console.error('Error creating user:', insertError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    // Update email statistics
    const { data: statsData, error: statsError } = await supabase
      .from('email_statistics')
      .select('emails_sent_to_trash')
      .eq('user_id', userEmail)
      .single();

    if (statsError) {
      console.error('Error fetching email stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch email stats' }, { status: 500 });
    }

    const currentCount = statsData ? statsData.emails_sent_to_trash : 0;
    const { data, error: updateError } = await supabase
      .from('email_statistics')
      .upsert({
        user_id: userEmail,
        emails_sent_to_trash: currentCount + messageIds.length,
      }, 
      { onConflict: ['user_id'] });

    if (updateError) {
      console.error('Error updating Supabase:', updateError);
      return NextResponse.json({ error: 'Failed to update email stats' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving emails to trash:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
