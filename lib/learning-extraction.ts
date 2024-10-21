import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type Learning = string;

export async function extractLearningsFromTranscript(transcript: string): Promise<Learning[]> {
  // Check if the transcript is empty or too short
  if (!transcript || transcript.trim().length < 50) {
    return []; // Return an empty array if the transcript is too short
  }

  const prompt = `
    Please analyze the conversation transcript between a user and an AI. Generate a list of concise learnings about the user (and not the AI) based on the key insights in this conversation. Each learning should be phrased as a simple, clear statement that captures an important detail or understanding about the user or the discussion.

    Input format:
    - The transcript is a JSON object with the following fields you should pay attention to:
      - transcript: An array of objects, each representing a segment of the conversation.
        - text: The text of the segment.
        - participantId: The ID of the participant in the conversation (prefixed by "agent" or "user"). Focus on the user and keep the agent in mind for context.

    Guidelines:
    - Output the learnings as a list of strings, each starting with a dash (-).
    - Avoid using the user's name in each learning. Use phrases like "Is passionate about...", "Is facing challenges...", "Recently traveled to...", "Is interested in...", etc.
    - Focus on capturing key points, personal facts, interests, ongoing challenges, or important updates.
    - Filter by importance: Only include learnings that are significant or relevant for future conversations. Prioritize personal values, goals, challenges, and notable experiences.
    - Filter by relevance: Only include learnings that are relevant to the user and not the AI.
    - The learnings should be concise, accurate, and usable as standalone facts.
    - Don't be repetitive. If the same information is mentioned multiple times, only include it once.
    - Do not generate any learnings if there's no valuable information in the transcript.
    - If the transcript is too short or lacks meaningful content, return an empty list.
    - Do not include a learning about the user's name.

    ### Example Output:
    - Is passionate about AI ethics and integrates it into work as CTO.
    - Is facing challenges hiring senior engineers, particularly those with ethical AI expertise.
    - Recently traveled to Japan and loved the ramen and local culture.
    - Was born in the USA and moved to the UK at 18.
    - Is a big fan of the TV show "The Office".

    ### Conversation:
    ${transcript}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an AI assistant that extracts key learnings from conversations to help personalize future interactions. Only extract meaningful and relevant information." },
      { role: "user", content: prompt }
    ],
    temperature: 0.6,
    max_tokens: 1000,
  });

  const learningsString = response.choices[0].message?.content;
  if (!learningsString) {
    return []; // Return an empty array if no content is generated
  }

  // Split the response into individual learnings
  const learnings = learningsString.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.slice(1).trim());

  return learnings;
}
