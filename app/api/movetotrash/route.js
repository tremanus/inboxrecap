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

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      console.log('New refresh token:', tokens.refresh_token);
      // Update refresh token in your storage if needed
    }
    if (tokens.access_token) {
      session.user.accessToken = tokens.access_token;
      // Update access token in your storage if needed
    }
  });

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

    let pageToken = null;
    let totalMessagesProcessed = 0;
    const maxMessagesPerBatch = 50;

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        pageToken: pageToken,
        maxResults: maxMessagesPerBatch,
      });

      const messageIds = response.data.messages ? response.data.messages.map(message => message.id) : [];

      if (messageIds.length > 0) {
        await Promise.all(
          messageIds.map(messageId =>
            gmail.users.messages.trash({
              userId: 'me',
              id: messageId,
            })
          )
        );
        totalMessagesProcessed += messageIds.length;
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken && totalMessagesProcessed < 500); // Limit total messages processed

    // Supabase operations
    const { data: existingUser, error: fetchError } = await supabase
      .from('email_statistics')
      .select('id, emails_sent_to_trash')
      .eq('user_id', userEmail)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('email_statistics')
        .insert([{ user_id: userEmail, emails_sent_to_trash: totalMessagesProcessed }]);

      if (insertError) {
        console.error('Error creating user:', insertError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    } else {
      const updatedCount = (existingUser.emails_sent_to_trash || 0) + totalMessagesProcessed;

      const { error: updateError } = await supabase
        .from('email_statistics')
        .update({ emails_sent_to_trash: updatedCount })
        .eq('user_id', userEmail);

      if (updateError) {
        console.error('Error updating Supabase:', updateError);
        return NextResponse.json({ error: 'Failed to update email stats' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving emails to trash:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
