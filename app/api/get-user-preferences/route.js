import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust the path based on your project structure

// Initialize the Supabase client with your credentials
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function GET(req) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return new Response(JSON.stringify({ error: 'User email is required' }), { status: 401 });
    }

    const userEmail = session.user.email; // Extract user email from the session

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
