# AI Requirements Doc (AIRD) - Phase 2 - Mobile App Implementation

This document provides instructions for developing the Sessions mobile app MVP, focusing on core functionality for quick user testing and validation.

## 1. Overview

The Sessions mobile app MVP will allow users to record conversations with an AI interviewer, manage their podcast sessions, and access their content on-the-go. The app will be developed for both iOS and Android platforms using React Native.

## 2. Project Structure

Before beginning the mobile app development, we need to restructure our project into a monorepo to accommodate both web and mobile versions.

### 2.1 Monorepo Setup [Human]

Restructure the existing project into a monorepo with the following structure:

```
project-root/
├── web/                 # Existing Next.js web app
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── mobile/              # New React Native mobile app
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── hooks/
│   │   └── utils/
│   ├── App.tsx
│   └── ...
├── shared/              # Shared code between web and mobile
│   ├── types/
│   ├── utils/
│   └── constants/
├── requirements/        # Keep existing requirements docs
│   ├── aird-v1.md
│   ├── aird-phase-1.md
│   ├── aird-phase-2.md
│   └── ...
├── package.json         # Root package.json for shared dependencies
└── README.md
```

Steps to implement:

1. Create new directories:
   ```
   mkdir mobile shared
   ```

2. Move existing web app into `web/` directory (if not already structured this way):
   ```
   mv app components lib web/
   ```

3. Update the root `package.json` to include scripts for both web and mobile development.

## 3. Tech Stack

- **Framework**: React Native
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **API Calls**: Axios
- **Authentication**: Clerk React Native SDK
- **Database**: Supabase (same as web app)
- **Real-time Communication**: LiveKit React Native SDK

## 4. Implementation Plan

### Milestone 0: Vercel Build Configuration [TODO]

1. Update Vercel Project Settings: [HUMAN]
   - In your Vercel dashboard, go to your project settings.
   - Under "Build & Development Settings":
     - Set the "Root Directory" to `web`
     - Ensure the "Framework Preset" is still set to Next.js

2. Review and update any environment variables in your Vercel project settings. Make sure they're still pointing to the correct resources after the restructure. [HUMAN]

3. Create a `turbo.json` file in the root of your project: [AI]

```json:turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {}
  }
}
```

4. Update the `package.json` file in the `web` directory: [AI]

```json:web/package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

5. Update `.gitignore` file to exclude build artifacts from both web and mobile projects: [AI]

```:.gitignore
# Next.js
web/.next/
web/out/

# React Native
mobile/ios/build/
mobile/android/app/build/

# Node modules
node_modules/

# Environment variables
.env*.local
```

6. Test the build process locally: [HUMAN]
   - Navigate to the `web` directory
   - Run `npm run build` or `yarn build`
   - Ensure the build completes successfully

7. After making these changes: [HUMAN]
   - Commit all changes to your repository
   - Push to your connected Git provider
   - Monitor the Vercel deployment to ensure it builds and deploys successfully

### Milestone 1: Basic App Setup and Navigation [TODO]

Set up developer accounts for iOS (Apple Developer Program) and Android (Google Play Console). Configure necessary certificates and provisioning profiles for iOS development. [HUMAN]

1. Set up a new React Native project using Expo within the `mobile/` directory [AI]
2. Implement basic navigation structure using React Navigation [AI]
   - Set up a bottom tab navigator for main screens (Home, Public Sessions, My Sessions, Profile)
   - Implement a stack navigator for each main screen to handle nested navigation
3. Create placeholder screens for Home, Public Sessions, My Sessions, Profile, and Session Details [AI]
4. Set up React Native Paper for UI components [AI]
5. Implement a basic layout for each main screen [AI]
6. Implement navigation logic: [AI]
   - Add navigation from Public Sessions and My Sessions to Session Details
   - Add navigation from Session Details to Recording screen
   - Implement back navigation and error state navigation
7. Add authentication-aware navigation: [AI]
   - Redirect unauthenticated users to Login/Signup screens
   - Implement a navigation guard for authenticated routes

Review and approve the initial project structure, navigation design, and screen flow [HUMAN]

### Milestone 2: Authentication with Clerk [TODO]

1. Install and configure Clerk React Native SDK [AI]   ```
   npm install @clerk/clerk-expo   ```

2. Set up Clerk provider in the root component (e.g., App.tsx) [AI]   ```typescript
   import { ClerkProvider } from '@clerk/clerk-expo';

   const App = () => (
     <ClerkProvider publishableKey="your_publishable_key">
       {/* Your app components */}
     </ClerkProvider>
   );
   ```

3. Implement sign-up and sign-in screens using Clerk components [AI]
   - Create SignUp screen using `useSignUp` hook
   - Create SignIn screen using `useSignIn` hook

4. Implement a basic authentication state manager [AI]
   - Use Clerk's `useAuth` hook to manage authentication state
   - Create protected routes that require authentication

5. Sync user data with Supabase [AI]
   - After successful sign-up or sign-in, create or update user data in Supabase
   - Use Clerk's user ID as the primary identifier in Supabase

6. Implement sign-out functionality [AI]

7. Add error handling and loading states for authentication processes [AI]

Test the complete authentication flow on physical devices, ensuring seamless integration with Supabase [HUMAN]

### Milestone 3: Core Session Functionality and LiveKit Integration [TODO]

#### 3.1: Session Creation and Listing [TODO]
1. Implement session creation screen with basic fields (title, description) [AI]
2. Create a Public Sessions List screen [AI]
   - Implement infinite scrolling or pagination for efficient loading
   - Add basic search or filter functionality
3. Create a My Sessions screen [AI]
   - Display user's own sessions (both public and private)
   - Implement options to edit, delete, and toggle session visibility
4. Implement API calls to fetch and create sessions in Supabase [AI]
   - Fetch public sessions for the Public Sessions List
   - Fetch user's own sessions for the My Sessions screen
   - Implement create, update, and delete operations for sessions
5. Add a Session Details screen [AI]
   - Display full session details including title, description, and status
   - Show options to edit or delete the session (for user's own sessions)
   - Include a button to start a new recording session
6. Implement navigation between screens: [AI]
   - Add a "Create Session" button on the My Sessions screen that navigates to the session creation screen
   - Implement navigation from session list items to the Session Details screen
   - Add a "Start Recording" button on the Session Details screen that navigates to the Recording screen

#### 3.2: LiveKit Integration for Audio Recording and AI Interviewer [TODO]
1. Install and configure LiveKit React Native SDK [AI]
2. Create a Recording screen that sets up the LiveKit room [AI]
   - Implement room creation and joining
   - Set up audio streaming functionality
3. Implement the AI interviewer interaction flow [AI]
   - Integrate with the existing AI backend service
4. Add disconnect/end call functionality [AI]
5. Implement real-time transcript updates during the call [AI]
   - Store transcripts in S3 and update transcript_url in Supabase
   - Update transcript_status in Supabase throughout the process
6. Set up LiveKit Cloud Egress for audio recording [AI]
7. Implement post-call processing [AI]
   - Handle the storage of audio recording in S3
   - Update audio_url and audio_status in Supabase
8. Add error handling for LiveKit integration, audio streaming, and network issues [AI]
9. Implement navigation for the recording flow: [AI]
   - Add a confirmation dialog before leaving the Recording screen
   - Implement navigation back to the Session Details screen after completing or cancelling a recording

#### 3.3: Session Management and Playback [TODO]
1. Update the Session Details screen to include playback functionality [AI]
   - Add an audio player component for recorded sessions
   - Display the transcript if available
2. Implement status updates and progress indicators [AI]
   - Show processing status for transcript and audio
3. Add error handling for playback and data fetching [AI]
4. Enhance navigation for playback: [AI]
   - Add a full-screen mode for the audio player with proper navigation
   - Implement swipe gestures for navigating between sessions in the Session Details screen

Test the entire flow from session creation, through recording, to playback on physical devices [HUMAN]

### Milestone 4: User Experience Enhancement [TODO]

1. Refine the interview flow based on initial testing [AI]
2. Implement basic analytics using a simple solution (e.g., Firebase Analytics) [AI]
3. Add an in-app feedback mechanism (e.g., a "Send Feedback" button that emails the development team) [AI]
4. Optimize performance for key user flows [AI]
5. Improve UI/UX based on initial internal testing [AI]

Conduct comprehensive testing of the entire app flow, focusing on user experience [HUMAN]

### Milestone 5: Beta Testing Preparation [TODO]

1. Prepare the app for beta deployment (TestFlight for iOS, Internal Test Track for Android) [AI]
2. Create user documentation or in-app tutorials for beta testers [AI]
3. Set up a system for collecting and organizing beta tester feedback [AI]

Set up beta testing groups and distribute the app to testers [HUMAN]

### Milestone 6: Polish and Bug Fixes [TODO]

1. Address critical bugs and user-reported issues from beta testing [AI]
2. Implement final UI/UX improvements based on beta tester feedback [AI]
3. Perform final performance optimizations [AI]

Review user feedback and prepare for public release [HUMAN]

## 5. MVP Features Checklist

- [ ] User registration and login using Clerk
- [ ] Session creation with basic metadata
- [ ] Audio recording and playback
- [ ] Simple AI interviewer interaction
- [ ] Session listing and management (view, edit, delete)
- [ ] Basic error handling and loading states
- [ ] In-app feedback mechanism
- [ ] Basic analytics
- [ ] User data syncing between Clerk and Supabase

## 6. Testing Strategy

- Focus on manual testing of core functionality
- Test on a limited set of iOS and Android devices
- Gather user feedback through in-app mechanism and direct communication with beta testers

## 7. Deployment

- Use TestFlight for iOS beta distribution
- Use Internal Test Track on Google Play Console for Android beta distribution
- Prepare for quick iterations based on user feedback

## 8. Post-MVP Considerations

After gathering initial user feedback, prioritize the following based on user needs:

1. Offline functionality
2. Advanced AI interviewer capabilities
3. Enhanced audio editing features
4. Push notifications
5. Social sharing
6. Accessibility improvements
7. Performance optimizations
8. Expanded test coverage
9. Set up GitHub Actions for automated CI/CD pipeline

## 9. Relevant Documentation

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [React Native Paper Documentation](https://callstack.github.io/react-native-paper/)
- [Clerk React Native Documentation](https://clerk.dev/docs/reference/react-native)
- [Supabase React Native Documentation](https://supabase.com/docs/reference/javascript/installing)
- [LiveKit React Native Documentation](https://docs.livekit.io/client-sdk-react-native/)
- [React Native Audio Toolkit Documentation](https://github.com/react-native-audio-toolkit/react-native-audio-toolkit)
