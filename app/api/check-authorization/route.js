// app/api/check-authorization/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Retrieve access token from environment variables
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    
    // Check if the access token is present and valid
    const isAuthorized = !!accessToken;

    return NextResponse.json({ authorized: isAuthorized });
  } catch (error) {
    console.error('Error checking authorization:', error);
    return NextResponse.json({ authorized: false });
  }
}
