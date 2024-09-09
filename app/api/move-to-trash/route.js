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
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: session.user.accessToken,
    refresh_token: session.user.refreshToken,
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
  
      const { category, timeRange } = await request.json(); // Extract timeRange from the request body
      let query = 'is:unread';
  
      if (category === 'promotions') query += ' category:promotions';
      if (category === 'social') query += ' category:social';
      if (category === 'updates') query += ' category:updates';
      
      // Add timeRange logic
      if (timeRange) {
        if (timeRange === '1d') query += ' newer_than:1d';
        if (timeRange === '1w') query += ' newer_than:7d';
        if (timeRange === '1m') query += ' newer_than:30d';
        if (timeRange === '6m') query += ' newer_than:180d';
      }
  
      console.log('Query:', query);
  
      let pageToken = null;
      const batchSize = 50;
      let totalEmailsMovedToTrash = 0;
  
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
          await Promise.all(
            messageIds.map((messageId) =>
              gmail.users.messages.trash({
                userId: 'me',
                id: messageId,
              })
            )
          );
          totalEmailsMovedToTrash += messageIds.length;
        }
  
        pageToken = response.data.nextPageToken;
      } while (pageToken);
  
      console.log('Total emails moved to trash:', totalEmailsMovedToTrash);
  
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
        .select('emails_sent_to_trash')
        .eq('user_id', userEmail)
        .single();
  
      if (statsError) {
        console.error('Error fetching email stats:', statsError);
        return NextResponse.json({ error: 'Failed to fetch email stats' }, { status: 500 });
      }
  
      const currentCount = statsData ? statsData.emails_sent_to_trash : 0;
      const { error: updateError } = await supabase
        .from('email_statistics')
        .upsert({
          user_id: userEmail,
          emails_sent_to_trash: currentCount + totalEmailsMovedToTrash,
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
