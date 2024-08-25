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

    // Fetch the last unread email
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 1,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return NextResponse.json({ error: 'No unread emails found' }, { status: 404 });
    }

    const messageId = response.data.messages[0].id;

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

    // Check if `emailPayload.parts` is defined and is an array
    const emailHtml = extractHtmlFromParts(emailPayload.parts) || '';

    if (!emailHtml) {
      return NextResponse.json({ error: 'No HTML content found in the email' }, { status: 404 });
    }

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

    // Get user email to send the summary
    const userEmail = await fetchUserEmail();

    // Send the email with the summary
    const domain = 'inboxrecap.com'; // Replace with your Mailgun domain
    await mg.messages.create(domain, {
      from: 'InboxRecap <summary@inboxrecap.com>',
      to: [userEmail],
      subject: `Summary: ${subject}`,
      text: summary,
      html: `<p><strong>${sender} - ${subject}</strong></p><p>${summary}</p>`,
    });

    return NextResponse.json({ summary: `Summary sent to ${userEmail}` });
  } catch (error) {
    console.error('Error summarizing and sending email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
