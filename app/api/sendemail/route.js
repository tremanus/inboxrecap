import { NextResponse } from 'next/server';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

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
    // Extract message content from request
    const { textContent } = await request.json();

    // Fetch the user email
    const userEmail = await fetchUserEmail();

    // Replace 'inboxrecap.com' with your Mailgun domain
    const domain = 'inboxrecap.com';

    // Send the email using Mailgun
    const response = await mg.messages.create(domain, {
      from: 'InboxRecap <summary@inboxrecap.com>',
      to: [userEmail], // Use the fetched user email
      subject: 'Test Email',
      text: textContent,
      html: `<p>${textContent}</p>`,
    });

    // Log and return the response from Mailgun
    console.log(response);
    return NextResponse.json({ message: 'Email sent successfully!', response });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
