# Sessions Requirements Doc

This document provides instructions for the Sessions app.

## 1. Overview

Sessions is a personal podcast app where users can record conversations with an AI interviewer to capture their life stories, thoughts, and reflections. The app allows users to edit, share, and manage their podcast sessions, offering customization options like background music and visuals. Initially, we will focus on developing a web application, with plans to expand to a mobile app in the future.

## 2. Key Features

### A. Real-Time AI Interviewer
- Engage with an AI interviewer in real-time, guided by intelligent questions.
- Adaptive questioning based on user responses, supported by OpenAI GPT-4 Realtime API.

### B. Audio and Smart Editing
- Real-time audio recording using LiveKit SDK.
- Automatic removal of filler words and long pauses.
- Text-based transcript editor for direct audio segment editing.

### C. Music and Visuals
- Mood-based background music suggestions and user uploads.
- Upload visuals, photos, or other media during and after recording.
- AI-generated illustrations for key moments/themes.

### D. Session Management
- Browse, share, and manage sessions with privacy settings (public, private, shared).
- Version control for original and edited sessions.

### E. Public and Shared Sessions
- Explore public sessions and manage shared sessions with privacy controls.

Note: While initially focusing on web development, all features will be designed with future mobile compatibility in mind.

## 3. End-to-End Usecases

### 3.1 Usecase 1: User Authentication and Onboarding [IMPLEMENTED]

#### Frontend (React + Clerk SDK)
1. Create Sign-Up Component (`app/routes/auth/signup.tsx`):
   - Form with email and password fields
   - Client-side validation
   - Use Clerk's `useSignUp` hook for registration

2. Create Login Component (`app/routes/auth/login.tsx`):
   - Form with email and password fields
   - Use Clerk's `useSignIn` hook for authentication

3. Implement Protected Routes:
   - Use Clerk's `useAuth` hook to check authentication status
   - Redirect unauthenticated users to login page

4. Create a Welcome/Onboarding Page (update `app/page.tsx`):
   - Brief introduction to the app's features
   - Call-to-action to create first session or browse public sessions

5. Implement Redirect After Authentication:
   - After successful login or signup, redirect to the Welcome page for new users
   - For returning users, redirect to the Public Sessions page

#### Backend (Clerk + API Routes)
1. Set up Clerk in your backend:
   - Configure Clerk webhook endpoints to sync user data
   - Create an API route to handle Clerk webhooks (`app/api/clerk-webhooks.ts`)

2. User Data Storage:
   - When a new user signs up, create a corresponding entry in your database

3. Session Management:
   - Use Clerk's session tokens to authenticate API requests
   - Implement middleware to verify Clerk session tokens (`middleware.ts`)

4. Add Clerk User to Supabase
   - After a user login via Clerk, we should get the userId from clerk, and check if this userId exist in 'users' table, matching "user_id"
   - If the user doesn't exist, then create a user in 'users' table
   - If the user exist, then proceed with the next step

### 3.2 Usecase 2: Session Creation

#### 3.2.1 Milestone 1: Basic Session Creation Setup

1. Frontend: Create Session Creation Page
   - Create a new page at `app/routes/create-session.tsx`
   - Implement a basic form with fields for session title and description
   - Add a button to start the interview process

2. Backend: Set up Session Creation API
   - Create an API route at `app/api/sessions/index.ts`
   - Implement POST method to create a new session entry in the database
   - Store basic session metadata (title, description, userId)

#### 3.2.2 Milestone 2: LiveKit Integration and Audio Recording

1. Frontend: Set up LiveKit Room
   - Implement LiveKit Room component for real-time audio
   - Add audio recording functionality using LiveKit SDK
   - Display audio visualization during recording

2. Backend: LiveKit Room Creation
   - Create an API route at `app/api/livekit/create-room.ts`
   - Implement room creation and token generation for LiveKit

3. Frontend: Implement Voice Assistant Component
   - Create a VoiceAssistantComponent using LiveKit's `useVoiceAssistant` hook
   - Add BarVisualizer for audio visualization
   - Implement VoiceAssistantControlBar for user controls

#### 3.2.3 Milestone 3: AI Interviewer Integration with LiveKit

1. Backend: Set up AI Interviewer Agent
   - Create a LiveKit agent file at `agents/voice-interviewer.ts`
   - Implement the AI interviewer logic using LiveKit's Agents framework and OpenAI

2. Backend: AI Interviewer API
   - Create an API route at `app/api/ai-interviewer.ts`
   - Implement LiveKit room creation and agent connection
   - Handle sending messages to the AI interviewer agent

3. Frontend: AI Interviewer Interface
   - Update the interview interface to work with the LiveKit-based AI interviewer
   - Implement real-time communication with the AI interviewer

#### 3.2.4 Milestone 4: Audio Processing and Transcription

1. Backend: Implement Transcription Service
   - Create an API route at `app/api/sessions/transcribe.ts`
   - Integrate with OpenAI Whisper for audio transcription
   - Update session entry with transcription text

2. Frontend: Add Transcript Display
   - Create a component to display the transcribed text
   - Implement real-time updates as transcription progresses

#### 3.2.5 Milestone 5: Session Publishing

1. Frontend: Session Finalization
   - Add UI for users to review their session
   - Implement publishing flow for completed sessions

2. Backend: Update Session Status
   - Update the sessions API to handle status changes (e.g., draft to published)
   - Implement any necessary checks before allowing publication

#### 3.2.6 Milestone 6: Customizable AI Prompts

1. Backend: Default Prompt API
   - Create an API route at `app/api/prompts/default.ts`
   - Implement reading the default prompt from a file (e.g., `prompts/muse-v2.md`)

2. Frontend: Prompt Customization
   - Add a text area for displaying and editing the AI interviewer prompt
   - Implement loading the default prompt and sending custom prompts to the AI Interviewer API

3. Backend: Update AI Interviewer for Custom Prompts
   - Modify `app/api/ai-interviewer.ts` to accept custom prompts
   - Update the AI agent to use the provided prompt for interview questions

#### Example Code Snippets

1. Basic Session Creation (Frontend):

```tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateSession() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (response.ok) {
        const { sessionId } = await response.json();
        router.push(`/sessions/${sessionId}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Session Title"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Session Description"
        required
      />
      <button type="submit">Create Session</button>
    </form>
  );
}
```

2. LiveKit Room Setup (Frontend):

```tsx
import { LiveKitRoom, useVoiceAssistant, BarVisualizer, VoiceAssistantControlBar } from '@livekit/components-react';

function VoiceAssistantComponent() {
  const { state, audioTrack } = useVoiceAssistant();
  return (
    <div>
      <BarVisualizer state={state} barCount={5} trackRef={audioTrack} />
      <p>{state}</p>
      <VoiceAssistantControlBar />
    </div>
  );
}

export default function CreateSession() {
  // ... other state and handlers

  return (
    <LiveKitRoom
      token={myToken}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
    >
      <VoiceAssistantComponent />
      {/* Other session creation components */}
    </LiveKitRoom>
  );
}
```

3. LiveKit Agent Setup (Backend):

```typescript
import { Agent, AgentContext } from '@livekit/agents';
import { MultimodalAgent } from '@livekit/agents-plugin-openai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const agent: Agent = async (ctx: AgentContext, options: { systemPrompt: string }) => {
  const assistant = new MultimodalAgent({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    systemPrompt: options.systemPrompt,
  });

  ctx.onMessage(async (message) => {
    if (message.type === 'text') {
      const response = await assistant.complete(message.text);
      await ctx.publish('audio', await textToSpeech(response));
      await ctx.publish('transcript', { role: 'assistant', content: response });
    }
  });

  async function textToSpeech(text: string): Promise<ArrayBuffer> {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });
    return mp3.arrayBuffer();
  }
};
```

4. AI Interviewer API with LiveKit (Backend):

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { Room, RoomServiceClient } from 'livekit-server-sdk';
import { agent } from '../../agents/voice-interviewer';

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, prompt } = req.body;

  try {
    const room = await roomService.createRoom({
      name: `interview-${userId}`,
      emptyTimeout: 10 * 60, // 10 minutes
    });

    const agentToken = await roomService.createToken(room.name, {
      identity: 'ai-interviewer',
      name: 'AI Interviewer',
    });

    await agent.connect(room.name, agentToken, { systemPrompt: prompt });

    res.status(200).json({ message: 'AI Interviewer initialized', roomName: room.name });
  } catch (error) {
    console.error('Error in AI Interviewer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
```

5. Session Publishing (Frontend):

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PublishSessionProps {
  sessionId: string;
  transcript: string;
}

export default function PublishSession({ sessionId, transcript }: PublishSessionProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    try {
      const response = await fetch('/api/sessions/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to publish session');
      }
      
      const data = await response.json();
      console.log('Session published:', data);
      router.push(`/sessions/${sessionId}`);
      router.refresh(); // Refresh the current route
    } catch (err) {
      console.error('Error publishing session:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Review and Publish Session</h1>
      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Transcript Preview:</h2>
        <p className="text-sm">{transcript.slice(0, 300)}...</p>
      </div>
      <Button 
        onClick={handlePublish} 
        disabled={isPublishing}
        className="w-full"
      >
        {isPublishing ? 'Publishing...' : 'Publish Session'}
      </Button>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
```

6. Session Publishing API (Backend):

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { sessionId } = req.query;

  try {
    const { data, error } = await supabase
      .from('sessions')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select();

    if (error) throw error;

    res.status(200).json({ message: 'Session published successfully', session: data[0] });
  } catch (error) {
    console.error('Error publishing session:', error);
    res.status(500).json({ message: 'Error publishing session' });
  }
}
```

#### Additional Considerations

- Implement proper error handling and user feedback throughout the process.
- Ensure all API routes are authenticated using Clerk middleware.
- Consider implementing a WebSocket connection for real-time communication during the interview process.
- Add input validation and sanitization for all user inputs.
- Implement proper state management on the frontend to handle the interview flow.
- Ensure proper cleanup of LiveKit rooms and resources after the interview is complete.
- Implement error handling for LiveKit-specific issues, such as connection problems or audio device errors.
- Implement a review process before publishing, if necessary (e.g., content moderation).
- Consider adding the ability to schedule session publication for a future date.

#### Relevant Documentation
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [LiveKit SDK](https://docs.livekit.io/client-sdk-js/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [LiveKit Agents for Node.js](https://github.com/livekit/agents-js)
- [LiveKit React Components](https://docs.livekit.io/client-sdk-js/react-components/)

### 3.3 Usecase 3: Session Management and Browsing

#### Frontend (React)
1. Public Sessions Page (`app/routes/sessions/index.tsx`):
   - Display a list of public sessions with basic information
   - Implement simple search or filter functionality
   - Include a prominent "Create New Session" button

2. My Sessions Page (`app/routes/sessions/my-sessions.tsx`):
   - Fetch and display user's sessions
   - Implement edit and delete functionality

3. Session Details Page (`app/routes/sessions/[id].tsx`):
   - Display full session details including transcript
   - Include an audio player for listening to the session

4. Navigation Component (`components/layout/navigation.tsx`):
   - Create a navigation bar with links to Public Sessions, My Sessions, and Create New Session
   - Display user authentication status and logout option

5. Version History Component (`components/session/version-history.tsx`):
   - Display list of versions for a session
   - Allow reverting to previous versions

#### Backend (API Routes + Supabase)
1. Fetch Public Sessions:
   - API Route: `GET /api/sessions/public` with optional search/filter parameters
   - Implement pagination for efficient loading

2. Fetch User's Sessions:
   - API Route: `GET /api/sessions/my-sessions`
   - Query database for sessions belonging to the authenticated user

3. Fetch Single Session:
   - API Route: `GET /api/sessions/:id`
   - Return full session details including audio URL and transcript

4. Edit Session:
   - API Route: `PUT /api/sessions/:id`
   - Update session metadata and create a new version

5. Delete Session:
   - API Route: `DELETE /api/sessions/:id`
   - Remove session and associated versions from the database

6. Version Control:
   - API Route: `GET /api/sessions/:id/versions`
   - API Route: `POST /api/sessions/:id/versions` to create a new version
   - API Route: `PUT /api/sessions/:id/revert/:versionId` to revert to a specific version

### 3.4 Usecase 4: Sharing and Notifications

#### Frontend (React)
1. Shared Sessions Page (`app/routes/sessions/shared.tsx`):
   - Display sessions shared with the user
   - Implement a notification system for new shared sessions

#### Backend (API Routes + Supabase)
1. Shared Sessions:
   - API Route: `GET /api/sessions/shared`
   - Query database for sessions shared with the authenticated user

2. Sharing Functionality:
   - API Route: `POST /api/sessions/:id/share`
   - Create entries in the `shared_sessions` table

3. Notification System:
   - Implement a notification service (e.g., using WebSockets or server-sent events)
   - API Route: `GET /api/notifications` to fetch user notifications

## 4. File Structure

```
SESSIONS
├── .next
├── app
│   ├── api
│   │   ├── webhooks
│   │   │   └── route.ts
│   │   ├── ai-interviewer
│   │   │   └── route.ts
│   │   ├── sessions
│   │   │   ├── route.ts
│   │   │   ├── [id]
│   │   │   │   ├── route.ts
│   │   │   │   └── publish
│   │   │   │       └── route.ts
│   │   │   ├── audio
│   │   │   │   └── route.ts
│   │   │   ├── transcribe
│   │   │   │   └── route.ts
│   │   │   ├── my-sessions
│   │   │   │   └── route.ts
│   │   │   └── public
│   │   │       └── route.ts
│   ├── sessions
│   │   ├── page.tsx
│   │   ├── [id]
│   │   │   └── page.tsx
│   │   ├── create
│   │   │   └── page.tsx
│   │   └── my-sessions
│   │       └── page.tsx
│   ├── fonts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── session
│   │   ├── audio-recorder.tsx
│   │   ├── transcript-display.tsx
│   │   └── metadata-form.tsx
├── lib
│   └── utils.ts
├── prompts
├── requirements
├── .eslintrc.json
├── .gitattributes
├── .gitignore
├── components.json
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## 5. Rules
- All new components should go in /components and be named like example-component.tsx unless otherwise specified
- All new pages go in /app with appropriate routing structure
- All new API routes go in /app/api with appropriate routing structure

## 6. API Endpoints Summary

With Next.js 14 App Router, API routes are now defined using Route Handlers.

1. Authentication (handled by Clerk)
   - POST /api/signup
   - POST /api/login
   - POST /api/logout

2. Sessions
   - POST /api/sessions - Create a new session
   - GET /api/sessions - List user's sessions
   - GET /api/sessions/[id] - Get a specific session
   - PUT /api/sessions/[id] - Update a session
   - DELETE /api/sessions/[id] - Delete a session
   - POST /api/sessions/[id]/publish - Publish a session

3. Audio
   - POST /api/audio/upload - Upload audio file
   - POST /api/audio/transcribe - Transcribe audio file

4. AI Interviewer
   - POST /api/ai-interviewer - Get AI-generated questions
   - GET /api/prompts/default - Get default AI prompt

## 7. Tech Stack Overview

### Frontend
- **Framework**: Next.js 14 (React) with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Hooks
- **Audio Processing**: Web Audio API
- **Real-time Communication**: LiveKit SDK

### Backend
- **Runtime**: Node.js
- **API Framework**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **File Storage**: Supabase Storage

### AI and Machine Learning
- **Natural Language Processing**: OpenAI GPT-4
- **Speech-to-Text**: OpenAI Whisper
- **Text-to-Speech**: OpenAI TTS

### DevOps and Infrastructure
- **Hosting**: Vercel
- **Version Control**: Git (GitHub)
- **CI/CD**: Vercel (integrated with GitHub)

### Testing
- **Unit Testing**: Jest
- **Integration Testing**: Supertest
- **End-to-End Testing**: Cypress
- **Accessibility Testing**: axe-core

### Monitoring and Logging
- **Error Tracking**: Sentry
- **Performance Monitoring**: Vercel Analytics

## 8. Testing Strategy
1. Unit Testing
   - Use Jest for testing individual components and functions
   - Aim for at least 70% code coverage for critical paths

2. Integration Testing
   - Test API endpoints using tools like Supertest
   - Ensure proper data flow between frontend and backend

3. End-to-End Testing
   - Use Cypress to simulate user journeys
   - Cover key flows: user signup, session creation, and publishing

4. Accessibility Testing
   - Use tools like axe-core to ensure WCAG 2.1 AA compliance
   - Perform manual keyboard navigation testing

## 9. Deployment
1. Staging Environment
   - Set up a staging environment on Vercel
   - Configure staging database in Supabase
   - Use separate API keys for staging (OpenAI, Clerk, etc.)

2. Production Deployment
   - Set up continuous deployment from main branch to Vercel
   - Configure production database in Supabase
   - Implement database migration strategy

3. Monitoring and Logging
   - Set up error tracking (e.g., Sentry)
   - Implement application logging
   - Set up performance monitoring

## 10. Post-MVP Features
1. Real-time Audio Communication
   - Integrate LiveKit for real-time audio streaming
   - Update AI interviewer to work with LiveKit
   - Implement real-time transcription

2. Sharing and Notifications
   - Implement session sharing functionality
   - Create a notification system for shared sessions

3. Transcript Editing
   - Add ability to edit transcripts after session creation
   - Implement version control for edited transcripts

4. Advanced Audio Processing
   - Implement automatic removal of filler words and long pauses
   - Add background noise reduction

5. Multi-language Support
   - Implement AI interviewer in multiple languages
   - Add automatic translation of sessions

6. Collaborative Sessions
   - Allow multiple users to participate in a single session
   - Implement role-based permissions for collaborative sessions

7. Mobile App Development
   - Create mobile versions of the app for iOS and Android
   - Ensure feature parity with the web application
   - Optimize UI/UX for mobile devices
   - Implement push notifications for mobile users

8. Analytics Dashboard
   - Implement user analytics and session performance metrics
   - Create visualizations for user engagement and content popularity

9. Integration with External Platforms
   - Add ability to publish sessions directly to podcast platforms
   - Implement social media sharing features

10. Advanced AI Features
    - Implement sentiment analysis on session content
    - Add AI-generated session summaries and highlights

## 11. Relevant Documentation
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Supabase Documentation](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Clerk Documentation](https://clerk.com/docs/references/nextjs/overview)
- [OpenAI API Documentation](https://beta.openai.com/docs/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vercel Deployment Documentation](https://vercel.com/docs)