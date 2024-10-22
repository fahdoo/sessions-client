import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTitle(transcript: string, originalTitle: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates concise and engaging titles for podcast episodes based on their transcripts. The transcript may be partial or incomplete. Generate the title without any surrounding quotation marks." },
        { role: "user", content: `Generate a short, engaging title for this podcast episode based on the following transcript:\n\n${transcript}\n\nTitle:` }
      ],
      max_tokens: 50,
    });

    let newTitle = completion.choices[0].message.content?.trim() || originalTitle;
    
    // Remove only surrounding quotation marks
    newTitle = newTitle.replace(/^["'](.+)["']$/, '$1');

    return newTitle;
  } catch (error) {
    console.error('Error generating title:', error);
    return originalTitle;
  }
}
