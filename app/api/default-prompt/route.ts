import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Construct the path to the muse-v2.md file
    const promptPath = path.join(process.cwd(), 'prompts', 'muse-v2.md');

    // Read the contents of the file
    const defaultPrompt = await fs.readFile(promptPath, 'utf-8');

    return new NextResponse(defaultPrompt, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Failed to read default prompt file:', error);
    return new NextResponse('Failed to load default prompt', { status: 500 });
  }
}