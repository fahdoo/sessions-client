import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(content: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a skilled conversation summarizer. Create a concise summary that captures the main ideas and themes, following these strict guidelines:

1. Focus solely on the key points, ideas, and themes discussed.
2. Do not mention or refer to any participants, speakers, or the nature of the content (e.g., conversation, discussion, interview).
3. Present information as standalone facts or concepts, not as part of a dialogue.
4. Aim for 1-2 sentences, adjusting based on the amount of substantive information.
5. Use clear, engaging language that captures the essence of the content without embellishment.
6. Ensure the summary is proportional to the content provided, avoiding exaggeration.
7. For brief or limited content, summarize the main topic or idea without elaboration.
8. Avoid phrases like "The discussion revolves around" or similar constructions that reference a dialogue.
9. Do not use words like "user", "speaker", "interviewer", "AI interviewer", or "listener".`
      },
      {
        role: "user",
        content: `Summarize the following content:\n\n${content}`
      }
    ],
    max_tokens: 100
  });

  return response.choices[0].message.content || "No summary available.";
}
