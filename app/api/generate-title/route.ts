import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { transcript, originalTitle } = await request.json();
    
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid transcript format. Expected string.',
      }, { status: 400 });
    }

    if (transcript.length < 50) {
      return NextResponse.json({ title: originalTitle });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that generates concise and engaging titles for podcast episodes based on their transcripts. The transcript may be partial or incomplete. Generate the title without any surrounding quotation marks." 
        },
        { 
          role: "user", 
          content: `Generate a short, engaging title for this podcast episode based on the following transcript:\n\n${transcript}\n\nTitle:` 
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    let newTitle = completion.choices[0].message.content?.trim() || originalTitle;
    newTitle = newTitle.replace(/^["'](.+)["']$/, '$1');

    return NextResponse.json({ title: newTitle });

  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json({ 
      error: 'Title generation failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
