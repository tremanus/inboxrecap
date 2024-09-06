import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as cheerio from 'cheerio'; // Import Cheerio
import OpenAI from 'openai';  // Import OpenAI client

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const accessToken = session.user.accessToken;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread newer_than:1d',
    });

    const messages = response.data.messages;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ message: 'No unread emails found' }), { status: 404 });
    }

    const emailPromises = messages.map(async (message) => {
        try {
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });
      
          const headers = msg.data.payload.headers;
          const body = getVisibleText(msg.data.payload);
          const contentToSummarize = body || `${getHeaderValue(headers, 'Subject')}: ${msg.data.snippet}`;

          const summary = await getSummaryFromGPT(contentToSummarize);  // Summarize email content using GPT

          return {
            id: message.id,
            body: body || `${getHeaderValue(headers, 'Subject')}: ${msg.data.snippet}`,  // Fallback to subject and snippet
            unsubscribeLinks: getUnsubscribeLinks(headers),  // Extract unsubscribe links
            sender: getHeaderValue(headers, 'From'),  // Extract sender
            subject: getHeaderValue(headers, 'Subject'),  // Extract subject
            summary,  // Include GPT-4o-mini summary
          };
        } catch (error) {
          console.error('Error fetching message content:', error);
          return {
            id: message.id,
            body: `No Subject: ${message.snippet}`,  // Fallback to subject and snippet
            sender: 'Unknown',
            subject: 'No Subject',
            unsubscribeLinks: [],
            summary: 'Unable to summarize email content',
          };
        }
      });      

    const emailData = await Promise.all(emailPromises);

    return new Response(JSON.stringify(emailData), { status: 200 });
  } catch (error) {
    console.error('Error fetching unread emails:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch emails', error }), { status: 500 });
  }
}

// Helper function to extract visible text using Cheerio
function getVisibleText(payload) {
  let htmlContent = '';
  let plainTextContent = '';

  if (payload.parts) {
    payload.parts.forEach((part) => {
      if (part.mimeType === 'text/html' && part.body?.data) {
        htmlContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/plain' && part.body?.data) {
        plainTextContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'multipart/alternative' && part.parts) {
        part.parts.forEach((subPart) => {
          if (subPart.mimeType === 'text/html' && subPart.body?.data) {
            htmlContent = Buffer.from(subPart.body.data, 'base64').toString('utf-8');
          } else if (subPart.mimeType === 'text/plain' && subPart.body?.data) {
            plainTextContent = Buffer.from(subPart.body.data, 'base64').toString('utf-8');
          }
        });
      }
    });
  }

  // Fallback to plain text if HTML is not available
  if (!htmlContent && plainTextContent) {
    return cleanUpText(plainTextContent);
  }

  if (!htmlContent) return ''; // Return empty if neither HTML nor plain text is available

  // Use Cheerio to load the HTML and extract visible text
  const $ = cheerio.load(htmlContent);
  const visibleText = $('body').text().trim(); // Extract visible text from the body

  return cleanUpText(visibleText);
}

// Function to clean up excessive line breaks and white spaces
function cleanUpText(text) {
  return text
    .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with a single one
    .replace(/\s\s+/g, ' ')    // Replace multiple spaces with a single space
    .trim();                   // Trim leading/trailing whitespace
}

// Function to extract unsubscribe links from headers
function getUnsubscribeLinks(headers) {
  const unsubscribeHeader = headers.find(
    (header) => header.name.toLowerCase() === 'list-unsubscribe'
  );
  if (unsubscribeHeader) {
    return unsubscribeHeader.value
      .replace(/^<|>$/g, '') // Remove angle brackets if present
      .split(',')
      .map((link) => link.trim())
      .filter((link) => link.startsWith('http')); // Ensure valid HTTP links
  }
  return [];
}

// Function to get a specific header value
function getHeaderValue(headers, name) {
  const header = headers.find(header => header.name === name);
  return header ? header.value : 'Unknown';
}

// Function to fetch the summary from GPT using OpenAI client
async function getSummaryFromGPT(content) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // Use GPT-4o-mini
      messages: [
        { role: 'system', content: 'Summarize the following email in one concise sentence. Only focus on the content of the email and avoid generic information::' },
        { role: 'user', content },
      ],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error fetching GPT summary:', error);
    return 'Unable to summarize email content';
  }
}
