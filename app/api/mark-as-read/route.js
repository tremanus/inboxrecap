import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust the path based on your project structure
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function getOAuthClientFromSession(session) {
  if (!session || !session.user || !session.user.accessToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: session.user.accessToken,
    refresh_token: session.user.refreshToken,
  });

  // Check if access token is expired and refresh if necessary
  if (Date.now() >= session.user.expires_at) {
    try {
      const tokens = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(tokens.credentials); // Update with new tokens
      session.user.accessToken = tokens.credentials.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }

  return oauth2Client;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const oauth2Client = await getOAuthClientFromSession(session);

    if (!oauth2Client) {
      return NextResponse.json({ error: 'No credentials found' }, { status: 401 });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    const { category } = await request.json();
    let query = 'is:unread';

    if (category === 'promotions') query += ' category:promotions';
    else if (category === 'social') query += ' category:social';
    else if (category === 'updates') query += ' category:updates';

    console.log('Query:', query);

    let pageToken = null;
    const batchSize = 2000;
    let totalEmailsMarkedAsRead = 0;

    do {
      const messageIds = [];
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        pageToken: pageToken,
        maxResults: batchSize,
      });

      if (response.data.messages) {
        response.data.messages.forEach(message => messageIds.push(message.id));
      }

      if (messageIds.length > 0) {
        await gmail.users.messages.batchModify({
          userId: 'me',
          requestBody: {
            ids: messageIds,
            removeLabelIds: ['UNREAD'],
          },
        });
        totalEmailsMarkedAsRead += messageIds.length;
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    console.log('Total emails marked as read:', totalEmailsMarkedAsRead);

    const { data: existingUser, error: fetchError } = await supabase
      .from('email_statistics')
      .select('id')
      .eq('user_id', userEmail)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('email_statistics')
        .insert([{ user_id: userEmail }]);

      if (insertError) {
        console.error('Error creating user:', insertError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    const { data: statsData, error: statsError } = await supabase
      .from('email_statistics')
      .select('emails_marked_as_read')
      .eq('user_id', userEmail)
      .single();

    if (statsError) {
      console.error('Error fetching email stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch email stats' }, { status: 500 });
    }

    const currentCount = statsData ? statsData.emails_marked_as_read : 0;
    const { error: updateError } = await supabase
      .from('email_statistics')
      .upsert({
        user_id: userEmail,
        emails_marked_as_read: currentCount + totalEmailsMarkedAsRead,
      }, 
      { onConflict: ['user_id'] });

    if (updateError) {
      console.error('Error updating Supabase:', updateError);
      return NextResponse.json({ error: 'Failed to update email stats' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking emails as read:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
