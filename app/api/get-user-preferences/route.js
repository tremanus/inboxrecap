import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with your credentials
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get('userEmail'); // Extract userEmail from query params

  if (!userEmail) {
    return new Response(JSON.stringify({ error: 'User email is required' }), { status: 400 });
  }

  try {
    // Fetch summary_time and categories from the user_preferences table
    const { data, error } = await supabase
      .from('user_preferences')
      .select('summary_time, categories')
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
