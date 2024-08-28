import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get('userEmail'); // Extract userEmail from query params

  if (!userEmail) {
    return new Response(JSON.stringify({ error: 'User email is required' }), { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('email_statistics')
      .select('emails_marked_as_read, emails_summarized, emails_sent_to_trash')
      .eq('user_id', userEmail)
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
