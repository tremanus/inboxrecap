// app/api/check-authorization/route.js
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');

export async function GET() {
  try {
    const content = await fs.promises.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return NextResponse.json({ authorized: !!credentials.access_token });
  } catch (error) {
    return NextResponse.json({ authorized: false });
  }
}
