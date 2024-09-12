import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; 

export async function GET(req) {
  // Use getServerSession to retrieve the session
  const session = await getServerSession(authOptions);
  
  const url = new URL(req.url);
  const plan = url.searchParams.get('plan');

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const paymentLinks = {
    monthly: 'https://buy.stripe.com/test_8wM00v1IMgdp4SIdR1',
    yearly: 'https://buy.stripe.com/test_3cs00v3QU7GTfxmeV4',
  };

  if (plan === 'free') {
    return new Response(null, { status: 302, headers: { Location: '/dashboard' } });
  } else if (paymentLinks[plan]) {
    const paymentLink = `${paymentLinks[plan]}?prefilled_email=${encodeURIComponent(session.user.email)}`;
    return new Response(null, { status: 302, headers: { Location: paymentLink } });
  } else {
    return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400 });
  }
}
