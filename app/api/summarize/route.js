import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(request) {
  try {
    const { emailContent } = await request.json();
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not found' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/engines/gpt-4o-mini/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: `Summarize this email in one concise sentence with important links, using markdown style for links:\n\n${emailContent}`,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return NextResponse.json({ summary: data.choices[0].text.trim() });
    } else {
      return NextResponse.json({ error: 'Failed to summarize email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error summarizing email:', error); // Log error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
