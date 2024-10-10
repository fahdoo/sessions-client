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

### 3.2 Usecase 2: Sessions Creation, Management, and Discovery

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

#### 3.2.4 Milestone 4: Session Management and Browsing [PARTIALLY IMPLEMENTED]

##### Frontend (React)
1. Public Sessions Page (`app/page.tsx`): [IMPLEMENTED]
   - Display a list of public sessions with basic information
   - Implement simple search or filter functionality
   - Include a prominent "Create New Session" button

2. My Sessions Page (`app/sessions/mine/page.tsx`): [IMPLEMENTED]
   - Fetch and display user's sessions
   - Implement edit and delete functionality

3. Session Details Page (`app/sessions/[id]/page.tsx`): [IMPLEMENTED]
   - Display full session details including transcript
   - Include an audio player for listening to the session

4. Navigation Component (`components/layout/navigation.tsx`): [IMPLEMENTED]
   - Create a navigation bar with links to Public Sessions, My Sessions, and Create New Session
   - Display user authentication status and logout option

5. Session Delete Functionality: [TO BE IMPLEMENTED]
   - Add a delete button or option in the My Sessions page and/or Session Details page
   - Implement a confirmation dialog before deleting a session
   - Send a DELETE request to the backend API when confirmed
   - Update the UI to reflect the deleted session (remove from list or update status)
   - Provide user feedback (e.g., success message or error notification)

##### Backend (API Routes + Supabase)
1. Fetch Public Sessions: [IMPLEMENTED]
   - API Route: `GET /api/sessions/public` with optional search/filter parameters
   - Implement pagination for efficient loading

2. Fetch User's Sessions: [IMPLEMENTED]
   - API Route: `GET /api/sessions/mine`
   - Query database for sessions belonging to the authenticated user

3. Fetch Single Session: [IMPLEMENTED]
   - API Route: `GET /api/sessions/:id`
   - Return full session details including audio URL and transcript

4. Edit Session: [IMPLEMENTED]
   - API Route: `PUT /api/sessions/:id`
   - Update session metadata

5. Delete Session: [TO BE IMPLEMENTED]
   - API Route: `DELETE /api/sessions/:id`
   - Implement soft delete by updating the `deleted_at` field in the database
   - Ensure that deleted sessions are not returned in regular queries

##### Database Update
Update the Sessions table in Supabase to support soft delete:
1. Add a new column to the Sessions table:
   - Column name: `deleted_at`
   - Data type: `timestamp with time zone`
   - Default value: `null`

2. Update existing queries to exclude soft-deleted sessions:
   - Add a condition `WHERE deleted_at IS NULL` to SELECT queries
   - For example:
     ```sql
     SELECT * FROM sessions WHERE deleted_at IS NULL AND user_id = :user_id;
     ```

3. Implement soft delete in the DELETE API:
   - Instead of removing the row, update the `deleted_at` field:
     ```sql
     UPDATE sessions SET deleted_at = CURRENT_TIMESTAMP WHERE id = :session_id;
     ```

##### Additional Considerations
- Ensure proper error handling and user feedback for all operations
- Implement access control to restrict session management to authorized users
- Optimize queries for performance, especially for users with many sessions
- Consider implementing caching strategies for frequently accessed data
- Ensure responsive design for various screen sizes and devices
- Update all existing queries in the backend to exclude soft-deleted sessions
- Implement a way to permanently delete or restore soft-deleted sessions if needed
- Consider adding a status field to sessions to handle different states (e.g., active, archived, deleted)
- Ensure proper access control to prevent unauthorized deletion of sessions
- Implement error handling for cases where a session might already be deleted

### 3.3 Usecase 3: Session Recording with LiveKit Realtime

#### 3.3.1 Milestone 1: LiveKit Integration [IMPLEMENTED]

1. Frontend: Set up LiveKit Room
   - Update `app/sessions/[id]/record/page.tsx`:
     - Import necessary components from '@livekit/components-react'
     - Implement LiveKitRoom component with proper configuration
     - Add AudioConference component for user audio
     - Implement SimpleVoiceAssistant component using LiveKit's `useVoiceAssistant` hook
     - Add BarVisualizer for audio visualization
     - Implement VoiceAssistantControlBar for user controls
     - Add start interview and disconnect buttons

2. Backend: LiveKit Token Generation
   - Update `app/api/livekit/get-token/route.ts`:
     - Implement token generation for LiveKit rooms
     - Use AccessToken from livekit-server-sdk

3. Frontend: Session Recording Flow
   - Implement start interview functionality
   - Handle real-time audio processing through LiveKit
   - Display audio visualization during recording

#### 3.3.2 Milestone 2: AI Interviewer Integration with LiveKit [IMPLEMENTED]

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

#### 3.3.3 Milestone 3: Audio Recording, Storage, and Transcription

1. Backend: Implement Audio Recording with LiveKit Cloud Egress
   - Set up LiveKit Cloud Egress for audio-only recording
   - Create an API route to start and stop room recordings
   - Implement webhook handler for LiveKit Cloud egress events

2. Backend: Implement Audio Storage
   - Create a new API route to handle completed LiveKit Cloud egress events
   - Implement logic to upload the recorded audio file to Supabase Storage
   - Update the session entry in the database with the audio file URL

3. Frontend: Update Session Recording Component
   - Implement start and stop recording functionality
   - Display recording status and duration to the user

4. Frontend: Update Session View Page
   - Enhance the audio player component to use the stored audio file
   - Implement loading and error states for audio playback

5. Backend: Implement Transcription Storage
   - Create an API route to periodically save transcriptions during the session
   - Implement logic to upload the final transcript to Supabase Storage
   - Update the session entry in the database with the transcript file URL

6. Frontend: Implement Transcript Handling
   - Add functionality to periodically save real-time transcriptions
   - Send the final transcript to the backend when the session ends
   - Create a new component to display the transcript on the session view page

7. Backend: Update Session Retrieval API
   - Modify the GET /api/sessions/:id endpoint to include audio and transcript URLs

8. Testing and Error Handling
   - Implement proper error handling for recording, file uploads, and API calls
   - Test the entire flow from recording to playback and transcript display

For detailed implementation guidelines, including code samples and best practices, refer to the `session_recording.md` file in the `requirements` folder. This document provides in-depth information on using LiveKit Cloud for audio recording, real-time transcription, and integrating with Supabase Storage for file management.

#### Additional Considerations

- Ensure proper cleanup of temporary files after uploading to Supabase Storage
- Implement access control to restrict audio and transcript access to authorized users
- Consider implementing a backup strategy for audio recordings and transcripts
- Optimize audio file format and quality for web playback
- Implement progressive loading for long transcripts to improve performance
- Handle potential network interruptions during recording and implement recovery mechanisms

## 4. File Structure

Note: Can be regenerated with `tree -L 3 -I 'node_modules'`

```
SESSIONS
├── README.md
├── app
│   ├── api
│   │   ├── default-prompt
│   │   ├── livekit
│   │   ├── sessions
│   │   └── webhooks
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
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
├── postcss.config.mjs
├── prompts
│   ├── muse-v1.md
│   └── muse-v2.md
├── requirements
│   ├── backend.md
│   ├── instructions.md
│   ├── session_recording.md
│   └── transcripts_design.md
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
`

Always use this method when interacting with Supabase to ensure consistency and proper authentication throughout the application.