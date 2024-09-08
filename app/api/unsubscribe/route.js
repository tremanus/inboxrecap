import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust the path based on your project structure
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'User is not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Fetch the existing user data from Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('email_statistics')
      .select('unsubscribed_emails, emails_unsubscribed')
      .eq('user_id', userEmail)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user data:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // If the user doesn't exist, return an error
    if (!existingUser) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    // Update the unsubscribed emails and count
    const updatedUnsubscribedEmails = existingUser.unsubscribed_emails
      ? [...existingUser.unsubscribed_emails, email]
      : [email];

    const updatedEmailsUnsubscribedCount = (existingUser.emails_unsubscribed || 0) + 1;

    const { error: updateError } = await supabase
      .from('email_statistics')
      .update({
        unsubscribed_emails: updatedUnsubscribedEmails,
        emails_unsubscribed: updatedEmailsUnsubscribedCount,
      })
      .eq('user_id', userEmail);

    if (updateError) {
      console.error('Error updating Supabase:', updateError);
      return NextResponse.json({ error: 'Failed to update email stats' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Unsubscribed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
