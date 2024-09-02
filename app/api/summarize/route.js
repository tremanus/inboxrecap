import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import OpenAI from 'openai';
import Mailgun from 'mailgun.js';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust the path based on your project structure
import formData from 'form-data';

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Initialize Mailgun client
const mg = new Mailgun(formData).client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

// Function to extract HTML content from email parts
const extractHtmlAndUnsubscribeFromParts = (parts) => {
    let htmlContent = null;
    let unsubscribeLink = null;
  
    if (!Array.isArray(parts)) return { htmlContent, unsubscribeLink };
  
    for (const part of parts) {
      if (part.mimeType === 'text/html') {
        htmlContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
        
        // Look for unsubscribe link in the HTML content
        const unsubscribeRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(?:[^<]*)unsubscribe(?:[^<]*)<\/a>/i;
        const match = unsubscribeRegex.exec(htmlContent);
        
        if (match && match[1]) {
          unsubscribeLink = match[1];
        }
  
        return { htmlContent, unsubscribeLink };
      } else if (part.parts) {
        const result = extractHtmlAndUnsubscribeFromParts(part.parts);
        if (result.htmlContent || result.unsubscribeLink) {
          return result;
        }
      }
    }
  
    return { htmlContent, unsubscribeLink };
  };  

// Function to get OAuth2 client and userEmail from session
async function getOAuthClientFromSession(session) {
  if (!session || !session.user || !session.user.email || !session.user.accessToken) {
    return null;
  }
  const { email: userEmail, accessToken } = session.user;
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return { oauth2Client, userEmail };
}

export async function POST(request) {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    // Get OAuth client and userEmail from session
    const { oauth2Client, userEmail } = await getOAuthClientFromSession(session);
    
    if (!oauth2Client || !userEmail) {
      return NextResponse.json({ error: 'No credentials found' }, { status: 401 });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get the current time and time 24 hours ago
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Fetch unread emails from the last 24 hours
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `is:unread after:${Math.floor(yesterday.getTime() / 1000)}`,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return NextResponse.json({ error: 'No unread emails found' }, { status: 404 });
    }

    let emailSummaries = '';

    // Fetch or create the user's email statistics entry
    let { data: userStats, error: fetchError } = await supabase
      .from('email_statistics')
      .select('*')
      .eq('user_id', userEmail)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') { // User not found, create a new entry
      const { data, error: insertError } = await supabase
        .from('email_statistics')
        .insert([{ user_id: userEmail, emails_summarized: 0, emails_marked_as_read: 0 }])
        .single();
      if (insertError) {
        console.error('Error creating user stats:', insertError);
        return NextResponse.json({ error: 'Failed to create user statistics' }, { status: 500 });
      }
      userStats = data;
    }

    for (const messageData of response.data.messages) {
      const messageId = messageData.id;

      // Get the email content
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      const emailPayload = message.data.payload;
      const headers = emailPayload.headers;

      // Extract Sender and Subject from the headers
      const sender = headers.find(header => header.name === 'From')?.value || 'Unknown Sender';
      const subject = headers.find(header => header.name === 'Subject')?.value || 'No Subject';

      // Extract HTML content
      const { htmlContent, unsubscribeLink } = extractHtmlAndUnsubscribeFromParts(emailPayload.parts) || '';

      if (htmlContent) {
        // Initialize OpenAI
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      
        // Summarize the parsed email content using OpenAI
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // Use the correct model name
          messages: [
            { role: 'user', content: `Summarize this email in one concise sentence: ${htmlContent}` }
          ]
        });
      
        const summary = completion.choices[0].message.content.trim();
      
        // Append summary to the email summaries string with Mark as Unread and Reply buttons
        emailSummaries += `
<div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px;">
    <div style="display: inline-flex; align-items: center; margin-top: 20px;">
    <p style="font-size: 16px; color: #333; margin: 0; margin-right: 20px;"><strong>From:</strong> ${sender}</p>
    ${unsubscribeLink ? `<a href="${unsubscribeLink}" style="color: #007bff; text-decoration: none; font-size: 16px; font-weight: 600;">Unsubscribe</a>` : ''}
</div>
    <p style="font-size: 16px; color: #333; margin-top: 10px; margin-bottom: 10px;"><strong>Subject:</strong> ${subject}</p>
    <p style="font-size: 16px; color: #333; margin-top: 20px; margin-bottom: 20px;">${summary}</p>
    <div style="text-align: center; width: 100%;">
        <a href="https://mail.google.com/mail/u/0/#inbox/${messageId}" 
           style="text-decoration: none; padding: 8px 15px; background-color: #f9f9f9; color: black; border-radius: 5px; border: 0.5px solid black; display: inline-block;">
           View / Reply
        </a>
    </div>
</div>
        `;

        // Mark the email as read
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            removeLabelIds: ['UNREAD'],
          },
        });

        // Update Supabase email statistics
        const { data, error } = await supabase
          .from('email_statistics')
          .update({
            emails_summarized: userStats.emails_summarized + 1,
            emails_marked_as_read: userStats.emails_marked_as_read + 1,
          })
          .eq('user_id', userEmail)
          .single();

        if (error) {
          console.error('Error updating email statistics:', error);
          return NextResponse.json({ error: 'Failed to update email statistics' }, { status: 500 });
        }

        // Update userStats to reflect the changes
        userStats.emails_summarized += 1;
        userStats.emails_marked_as_read += 1;
      }
    }

    // Get the current date
    const currentDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send the email with the summary
    const domain = 'inboxrecap.com';

    await mg.messages.create(domain, {
      from: 'InboxRecap <summary@inboxrecap.com>',
      to: [userEmail],
      subject: `${currentDate} - InboxRecap`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; width: 90%; margin: 40px auto; border: 1px solid #e0e0e0; border-radius: 10px;">
          <!-- Hidden Preheader Text -->
          <span style="display:none; color:transparent; max-height:0; max-width:0; opacity:0; overflow:hidden;">This is your daily InboxRecap.</span>
          
          <!-- Header -->
          <div style="text-align: center; background-color: #f5f9ff; padding: 20px; padding-bottom: 30px; border-bottom: 1px solid #e0e0e0; box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);">
            <img src="https://www.inboxrecap.com/favicon.ico" alt="InboxRecap Logo" style="width: 80px; margin-bottom: 10px;">
            <h2 style="color: #111; margin: 0; font-size: 1.8rem;">Your Daily InboxRecap</h2>
          </div>
          
          <!-- Content -->
          <div style="padding: 20px 0;">
            <h1 style="color: #111; margin-bottom: 20px; text-align: center; font-size: 2.5rem;">Hello!</h1>
            <p style="font-size: 16px; margin-bottom: 20px; color: #555; text-align: center; font-size: 1.2rem;">Here's a quick recap of your inbox from the past 24 hours:</p>
            ${emailSummaries}
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 14px; color: #999;">Best regards,<br>The InboxRecap Team</p>
            <p style="font-size: 14px; color: #999;">
              <a href="https://inboxrecap.com" style="color: #007bff; text-decoration: none;">Visit Our Website</a> | 
              <a href="mailto:support@inboxrecap.com" style="color: #007bff; text-decoration: none;">Contact Support</a>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ summary: `Summary sent to ${userEmail}` });
  } catch (error) {
    console.error('Error summarizing and sending email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
