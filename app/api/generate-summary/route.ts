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
    const { transcript } = await request.json();
    
    if (!transcript || transcript.length < 50) {
      return NextResponse.json({ summary: null });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are analyzing an AI-guided personal storytelling session where an individual shares their experiences, thoughts, and reflections. Create a concise summary that captures the essence of what was shared, following these guidelines:

1. Focus on the key themes, experiences, and insights shared by the individual
2. Present the information objectively without referencing that this was a recorded session
3. Avoid mentioning AI, interviews, conversations, or any interaction context
4. Write in a clear, engaging style that respects the personal nature of the content
5. Aim for 2-3 concise sentences that capture the core narrative
6. For brief content, focus on the main topic or insight shared
7. Use natural, flowing language that reads like a story summary
8. Maintain a respectful, professional tone
9. Exclude technical or procedural details about the recording
10. Don't use phrases like "shares about" or "discusses" - present the information directly`
        },
        {
          role: "user",
          content: `Create a summary of this content:\n\n${transcript}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return NextResponse.json({ 
      summary: response.choices[0].message.content || null 
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
} 