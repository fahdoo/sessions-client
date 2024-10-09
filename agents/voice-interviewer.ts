import { type JobContext, defineAgent, multimodal } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import fs from 'fs';
import path from 'path';

export const voiceInterviewer = defineAgent({
  entry: async (ctx: JobContext) => { // Change 'entry' to 'execute'
    await ctx.connect();

    console.log('starting voice interviewer agent');

    const systemPrompt = fs.readFileSync(path.join(process.cwd(), 'prompts', 'muse-v2.md'), 'utf-8');

    const model = new openai.realtime.RealtimeModel({
      instructions: systemPrompt,
    });

    const agent = new multimodal.MultimodalAgent({
      model,
    });

    const session = await agent
      .start(ctx.room)
      .then((session) => session as openai.realtime.RealtimeSession);

    session.conversation.item.create({
      type: 'message',
      role: 'user',
      content: [{ type: 'input_text', text: 'Start the interview with a friendly greeting.' }],
    });
    session.response.create();

    // ctx.on('message', async (message: unknown) => { // Change 'onMessage' to 'on' and add type for message
    //   if (typeof message === 'string') {
    //     session.conversation.item.create({
    //       type: 'message',
    //       role: 'user',
    //       content: [{ type: 'input_text', text: message }],
    //     });
    //     const response = await session.response.create();
    //     if (response && response.content) { // Add a check for response
    //       const aiResponse = response.content[0].text;
    //       await ctx.publish('audio', await textToSpeech(aiResponse)); // Change 'send' to 'publish'
    //       await ctx.publish('transcript', { role: 'assistant', content: aiResponse }); // Change 'send' to 'publish'
    //     }
    //   }
    // });

    // async function textToSpeech(text: string): Promise<ArrayBuffer> {
    //   const openaiClient = new openai.OpenAI({
    //     apiKey: process.env.OPENAI_API_KEY,
    //   });
    //   const mp3 = await openaiClient.audio.speech.create({
    //     model: "tts-1",
    //     voice: "alloy",
    //     input: text,
    //   });
    //   return mp3.arrayBuffer();
    // }
  },
});