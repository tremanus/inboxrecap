import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');

// Load OAuth credentials from token.json
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.promises.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    console.error('Error loading credentials:', err);
    return null;
  }
}

// Function to extract HTML content from email parts
const extractHtmlFromParts = (parts) => {
  if (!Array.isArray(parts)) return null;
  for (const part of parts) {
    if (part.mimeType === 'text/html') {
      return Buffer.from(part.body.data, 'base64').toString('utf-8');
    } else if (part.parts) {
      const html = extractHtmlFromParts(part.parts);
      if (html) return html;
    }
  }
  return null;
};

// Initialize Mailgun client
const mg = new Mailgun(formData).client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

// Helper function to fetch user email from the API
async function fetchUserEmail() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-user-email`);
    if (!response.ok) {
      throw new Error('Failed to fetch user email');
    }
    const data = await response.json();
    return data.email;
  } catch (error) {
    throw new Error(`Error fetching user email: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    const oauth2Client = await loadSavedCredentialsIfExist();

    if (!oauth2Client) {
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
      const emailHtml = extractHtmlFromParts(emailPayload.parts) || '';

      if (emailHtml) {
        // Initialize OpenAI
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // Summarize the parsed email content using OpenAI
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // Use the correct model name
          messages: [
            { role: 'user', content: `Summarize this email in one concise sentence: ${emailHtml}` }
          ]
        });

        const summary = completion.choices[0].message.content.trim();

        // Append summary to the email summaries string with Mark as Unread and Reply buttons
        emailSummaries += `
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1); margin: 20px; margin-bottom: 40px">
            <p style="font-size: 16px; color: #333;"><strong>From:</strong> ${sender}</p>
            <p style="font-size: 16px; color: #333;"><strong>Subject:</strong> ${subject}</p>
            <p style="font-size: 16px; color: #333; margin-top: 20px;">${summary}</p>
            <div style="margin-top: 20px;">
              <a href="https://mail.google.com/mail/u/0/#inbox/${messageId}" style="text-decoration: none; padding: 10px 20px; background-color: #007bff; color: white; border-radius: 5px; display: inline-block; margin: 0 auto; text-align: center;">Reply</a>
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
      }
    }

    // Get user email to send the summary
    const userEmail = await fetchUserEmail();

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
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; width: 70%; margin: 40px auto; border: 1px solid #e0e0e0; border-radius: 10px;">
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
