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
- Browse, share, and manage sessions with a simple public/private setting.
- Version control for original and edited sessions.

### E. Public and Private Sessions
- Explore public sessions and manage private sessions with a single toggle.

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

#### 3.2.1 Milestone 1: Basic Session Creation Setup [IMPLEMENTED]

1. Frontend: Create Session Creation Page
   - Create a new page at `app/routes/create-session.tsx`
   - Implement a basic form with fields for session title and description
   - Add a button to start the interview process

2. Backend: Set up Session Creation API
   - Create an API route at `app/api/sessions/route.ts`
   - Implement POST method to create a new session entry in the database
   - Store basic session metadata (title, userId)

#### 3.2.2 Milestone 2: Session View Page [IMPLEMENTED]

1. Frontend: Create Session View Page
   - Create a new page at `app/sessions/[id]/page.tsx`
   - Implement a layout for displaying session details
   - Add an audio player component inspired by Spotify
   - Display the title, summary, and user's full name
   - Handle visibility based on the `isPublic` field

2. Backend: Session Retrieval API
   - Update the API route at `app/api/sessions/[id]/route.ts`
   - Implement GET method to retrieve session details
   - Add logic to check `isPublic` status and user permissions

3. Frontend: Audio Player Component
   - Create a new component at `components/session/audio-player.tsx`
   - Implement a Spotify-inspired audio player design
   - Include play/pause, seek, and volume controls

4. Backend: Audio File Serving
   - Create an API route at `app/api/sessions/[id]/audio/route.ts`
   - Implement secure audio file serving with proper headers

#### 3.2.3 Milestone 3: Public Feed Page [IMPLEMENTED]

1. Frontend: Create Public Feed Page
   - Create a new page at `app/sessions/page.tsx`
   - Implement a layout for displaying public sessions
   - Add pagination or infinite scrolling for loading more sessions
   - Include session cards with basic information (title, user, duration, etc.)

2. Backend: Public Sessions API
   - Create an API route at `app/api/sessions/public/route.ts`
   - Implement GET method to retrieve public sessions
   - Add pagination support
   - Include sorting options (e.g., most recent, most viewed)

3. Frontend: Session Card Component
   - Create a new component at `components/session/session-card.tsx`
   - Design an attractive card layout for displaying session information
   - Include a link to the full session view

4. Frontend: Search and Filter Functionality
   - Add a search bar to filter sessions by title or content
   - Implement filtering options (e.g., by date range, duration)

#### 3.2.4 Milestone 4: LiveKit Integration and Audio Recording

1. Frontend: Set up LiveKit Room
   - Update `app/sessions/[id]/record/page.tsx`:
     - Import necessary components from '@livekit/components-react'
     - Implement LiveKitRoom component with proper configuration
     - Add AudioConference component for user audio
     - Implement SimpleVoiceAssistant component using LiveKit's `useVoiceAssistant` hook
     - Add BarVisualizer for audio visualization
     - Implement VoiceAssistantControlBar for user controls
     - Add start interview and disconnect buttons

2. Backend: LiveKit Room Creation
   - Update `app/api/livekit/create-room/route.ts`:
     - Implement room creation using LiveKit SDK
     - Update session in database with room details

3. Backend: LiveKit Token Generation
   - Update `app/api/livekit/get-token/route.ts`:
     - Implement token generation for LiveKit rooms
     - Use AccessToken from livekit-server-sdk

4. Frontend: Session Recording Flow
   - Implement start interview functionality
   - Handle real-time audio processing through LiveKit
   - Display audio visualization during recording

#### 3.2.5 Milestone 5: AI Interviewer Integration with LiveKit

1. Frontend: AI Interviewer Integration
   - Update `app/sessions/[id]/record/page.tsx`:
     - Implement SimpleVoiceAssistant component to handle AI interactions
     - Use BarVisualizer to display audio visualization
     - Implement VoiceAssistantControlBar for user controls

2. Backend: Update Session Creation
   - Modify `app/api/sessions/route.ts`:
     - Include `systemPrompt` when creating a new session
     - Ensure the `systemPrompt` is stored in the database for each session

3. Integration: LiveKit Agents and OpenAI
   - The integration between LiveKit Agents and OpenAI is handled automatically by the LiveKit SDK
   - No manual implementation is required in your code

4. Testing and Optimization
   - Test the entire flow from session creation to AI interaction
   - Optimize audio quality and AI response time
   - Ensure proper error handling and user feedback throughout the process

#### 3.2.6 Milestone 6: Audio Processing and Transcription

1. Backend: Implement Transcription Service
   - Create an API route at `app/api/sessions/transcribe.ts`
   - Integrate with OpenAI Whisper for audio transcription
   - Update session entry with transcription text

2. Frontend: Add Transcript Display
   - Create a component to display the transcribed text
   - Implement real-time updates as transcription progresses

#### 3.2.7 Milestone 7: Session Publishing

1. Frontend: Session Visibility Toggle
   - Add UI for users to toggle their session's public/private status
   - Implement publishing flow for completed sessions

2. Backend: Update Session Visibility
   - Update the sessions API to handle changes to the `isPublic` field
   - Implement any necessary checks before allowing visibility changes

#### 3.2.8 Milestone 8: Customizable AI Prompts

1. Backend: Default Prompt API
   - Create an API route at `app/api/prompts/default.ts`
   - Implement reading the default prompt from a file (e.g., `prompts/muse-v2.md`)

2. Frontend: Prompt Customization
   - Add a text area for displaying and editing the AI interviewer prompt
   - Implement loading the default prompt and sending custom prompts to the AI Interviewer API

3. Backend: Update AI Interviewer for Custom Prompts
   - Modify `app/api/ai-interviewer.ts` to accept custom prompts
   - Update the AI agent to use the provided prompt for interview questions

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

### 3.3 Usecase 3: Session Management and Browsing

#### Frontend (React)
1. Public Sessions Page (`app/routes/sessions/index.tsx`):
   - Display a list of public sessions with basic information
   - Implement simple search or filter functionality
   - Include a prominent "Create New Session" button

2. My Sessions Page (`app/routes/sessions/manage.tsx`):
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
   - API Route: `GET /api/sessions/mine`
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

Note: Can be regenerated with `tree -L 3 -I 'node_modules'`

```
SESSIONS
├── README.md
├── agents
│   └── voice-interviewer.ts
├── app
│   ├── api
│   │   ├── default-prompt
│   │   ├── livekit
│   │   ├── sessions
│   │   └── webhooks
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └��─ GeistVF.woff
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── sessions
│       ├── [id]
│       └── page.tsx
├── components
│   ├── layout
│   │   └── navigation.tsx
│   ├── session
│   │   ├── audio-player.tsx
│   │   ├── new-session-dialog.tsx
│   │   └── session-card.tsx
│   └── ui
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── slider.tsx
│       ├── switch.tsx
│       ├── textarea.tsx
│       └── toggle.tsx
├── components.json
├── lib
│   ├── livekit.ts
│   ├── ssr
│   │   └── client.ts
│   ├── types.ts
│   └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.js
├── postcss.config.mjs
├── prompts
│   ├── muse-v1.md
│   └── muse-v2.md
├── requirements
│   ├── backend.md
│   ├── instructions.md
│   └── transcripts_design.md
├── tailwind.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 5. Rules
- All new components should go in /components and be named like example-component.tsx unless otherwise specified
- All new pages go in /app with appropriate routing structure
- All new API routes go in /app/api with appropriate routing structure
- For API routes, use `import { getAuth } from '@clerk/nextjs/server'` instead of `import { auth } from '@clerk/nextjs'` to fetch user authentication details
- Use `createClerkSupabaseClientSsr` from `@/lib/ssr/client` to create a Supabase client that is authenticated with Clerk

## 6. API Endpoints Summary

With Next.js 14 App Router, API routes are now defined using Route Handlers.

1. Authentication (handled by Clerk)
   - POST /api/signup [IMPLEMENTED by Clerk]
   - POST /api/login [IMPLEMENTED by Clerk]
   - POST /api/logout [IMPLEMENTED by Clerk]

2. Sessions
   - POST /api/sessions - Create a new session (including systemPrompt) [IMPLEMENTED]
   - GET /api/sessions - List user's sessions [TO BE IMPLEMENTED]
   - GET /api/sessions/[id] - Get a specific session [IMPLEMENTED]
   - PUT /api/sessions/[id] - Update a session [IMPLEMENTED]
   - DELETE /api/sessions/[id] - Delete a session [TO BE IMPLEMENTED]
   - PUT /api/sessions/[id]/visibility - Toggle session visibility [TO BE IMPLEMENTED]

3. LiveKit Integration
   - POST /api/livekit/create-room - Create a new LiveKit room [IMPLEMENTED]
   - GET /api/livekit/get-token - Generate a token for a LiveKit room [IMPLEMENTED]

4. Audio
   - GET /api/sessions/[id]/audio - Serve audio file for a session [TO BE IMPLEMENTED]

5. Transcription
   - POST /api/sessions/[id]/transcribe - Transcribe audio for a session [TO BE IMPLEMENTED]

6. AI Prompts
   - GET /api/default-prompt - Get default AI prompt [TO BE IMPLEMENTED]

7. Shared Sessions
   - GET /api/sessions/shared - Get sessions shared with the user [TO BE IMPLEMENTED]
   - POST /api/sessions/[id]/share - Share a session with other users [TO BE IMPLEMENTED]

8. Notifications
   - GET /api/notifications - Get user notifications [TO BE IMPLEMENTED]

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
- **API Framework**: Next.js 14 API Routes
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
- [Humps Documentation](https://github.com/domchristie/humps) - For camelizing keys in API responses
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [LiveKit SDK](https://docs.livekit.io/client-sdk-js/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [LiveKit Agents for Node.js](https://uithub.com/livekit/agents-js)
- [LiveKit React Components](https://docs.livekit.io/client-sdk-js/react-components/)
- [LiveKit Client SDK](https://github.com/livekit/client-sdk-js/)
- [LiveKit Components](https://github.com/livekit/components-js)
- [LiveKit Realtime Playground](https://github.com/livekit-examples/realtime-playground/tree/main/web/src)
- [LiveKit Realtime Playground Agent](https://uithub.com/livekit-examples/realtime-playground/blob/main/agent/playground_agent.ts)

## 12. Guides

### 12.1 API Response Formatting Guidelines

When working on API routes, always follow these guidelines to ensure consistency across our application:

1. Database and Supabase Queries:
   - Use snake_case for database column names and in Supabase queries.
   - Example: `user_id`, `created_at`, `session_title`

2. API Responses:
   - Convert all API responses to camelCase before sending them to the client.
   - Use the `camelizeKeys` function from the `humps` library to perform this conversion.

3. Implementation:
   - Import the `camelizeKeys` function in your API route files:
     ```typescript
     import { camelizeKeys } from 'humps';
     ```
   - After fetching data from Supabase, convert it to camelCase:
     ```typescript
     const { data, error } = await supabase
       .from('your_table')
       .select('*')
       .eq('some_column', 'some_value');

     if (error) throw error;

     const camelizedData = camelizeKeys(data);
     return NextResponse.json(camelizedData);
     ```

4. Consistency:
   - Ensure that all new API routes follow this pattern.
   - When modifying existing routes, update them to follow this convention if they don't already.

By following these guidelines, we maintain consistency across our API and make it easier for frontend developers to work with our data. This approach bridges the gap between the snake_case convention used in our database and the camelCase convention preferred in JavaScript/TypeScript.

### 12.2 Making Supabase Calls

When making calls to Supabase in our application, we should use the `createClerkSupabaseClientSsr` function from our custom client. This ensures that we're using the correct configuration and authentication for our Supabase calls.

Here's how to use it:

1. Import the client:
   ```typescript
   import { createClerkSupabaseClientSsr } from '@/lib/ssr/client';
   ```

2. Create the Supabase client inside your API route or server-side function:
   ```typescript
   const supabase = createClerkSupabaseClientSsr();
   ```

3. Use the `supabase` client to make your database calls:
   ```typescript
   const { data, error } = await supabase
     .from('your_table')
     .select('*')
     .eq('some_column', 'some_value');
   ```

Remember to handle any errors that may occur during the Supabase call.

Example usage in an API route:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client';

export async function GET(request: NextRequest) {
  const supabase = createClerkSupabaseClientSsr();

  try {
    const { data, error } = await supabase
      .from('your_table')
      .select('*');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

Always use this method when interacting with Supabase to ensure consistency and proper authentication throughout the application.