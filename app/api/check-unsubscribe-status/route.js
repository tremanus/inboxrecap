import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function POST(req) {
  try {
    // Log the request object to see if it's coming through properly
    console.log("Request received:", req);

    const { email } = await req.json();
    
    // Log the parsed email from the request body
    console.log("Email received:", email);

    const { data, error } = await supabase
      .from('email_statistics')
      .select('unsubscribed_emails')
      .contains('unsubscribed_emails', [email])
      .single();

    // Log the response from Supabase
    console.log("Supabase response data:", data);
    console.log("Supabase error (if any):", error);

    if (error) {
      throw error;
    }

    const isUnsubscribed = data ? data.unsubscribed_emails.includes(email) : false;

    // Log the final result before sending a response
    console.log("Is Unsubscribed:", isUnsubscribed);

    return new Response(JSON.stringify({ isUnsubscribed }), { status: 200 });
  } catch (error) {
    // Log any errors that occur
    console.error("Error occurred:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
