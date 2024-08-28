import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function getUserEmail() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-user-email`); // Use absolute URL
        const data = await response.json();
        if (response.ok && data.email) {
            return data.email;
        } else {
            throw new Error('Failed to fetch user email');
        }
    } catch (error) {
        console.error('Error fetching user email:', error);
        throw new Error('Could not retrieve user email');
    }
}

export async function POST(request) {
    try {
        const { summary_time, categories } = await request.json();

        if (!summary_time || !categories || !Array.isArray(categories)) {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
        }

        const user_email = await getUserEmail();

        // Check if the user preferences already exist
        const { data: existingPreference, error: fetchError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user_email)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 means no row was found, so it's okay to proceed with insert
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        let response;

        if (existingPreference) {
            // Update existing preferences
            const { error: updateError } = await supabase
                .from('user_preferences')
                .update({
                    summary_time,
                    categories,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user_email);

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }

            response = { message: 'Preferences updated successfully' };
        } else {
            // Insert new preferences
            const { error: insertError } = await supabase
                .from('user_preferences')
                .insert({
                    user_id: user_email,
                    summary_time,
                    categories,
                });

            if (insertError) {
                return NextResponse.json({ error: insertError.message }, { status: 500 });
            }

            response = { message: 'Preferences added successfully' };
        }

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
