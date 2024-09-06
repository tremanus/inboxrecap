import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust the path as necessary
import SummaryEmail from '../../../src/components/summaryemail'; // Correct import statement
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to format the date as "Sep 6th, 2024"
function formatDate(date) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-US', options);

  // Add the ordinal suffix to the day (st, nd, rd, th)
  const day = date.getDate();
  const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                 (day % 10 === 2 && day !== 12) ? 'nd' :
                 (day % 10 === 3 && day !== 13) ? 'rd' : 'th';

  return formattedDate.replace(/\d+/, `${day}${suffix}`);
}

export async function POST(request) {
  try {
    // Get the session to access user details
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized or missing email' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const currentDate = formatDate(new Date());

    // Fetch emails from /api/email, forwarding the request's cookies for authentication
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    const emailData = await emailResponse.json();

    if (emailResponse.status !== 200 || !emailData) {
      return NextResponse.json({ error: 'Failed to fetch email data' }, { status: 500 });
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'InboxRecap <summary@inboxrecap.com>',
      to: [userEmail],
      subject: `${currentDate} - InboxRecap`,
      react: <SummaryEmail emailData={emailData} />, // Pass fetched email data as props
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
