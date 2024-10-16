# AI Requirements Doc (AIRD) - Phase 2 - Mobile App Implementation

This document provides instructions for developing the Sessions mobile app MVP, focusing on core functionality for quick user testing and validation.

## 1. Overview

The Sessions mobile app MVP will allow users to record conversations with an AI interviewer, manage their podcast sessions, and access their content on-the-go. The app will be developed for both iOS and Android platforms using React Native.

## 2. Project Structure

Before beginning the mobile app development, we need to restructure our project into a monorepo to accommodate both web and mobile versions.

### 2.1 Monorepo Setup

[HUMAN] Restructure the existing project into a monorepo with the following structure:

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

4. Update any CI/CD configurations to account for the new structure.

## 3. Tech Stack

- **Framework**: React Native
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **API Calls**: Axios
- **Authentication**: Clerk React Native SDK
- **Database**: Supabase (same as web app)
- **Audio Recording**: React Native Audio Toolkit
- **Real-time Communication**: LiveKit React Native SDK

## 4. Implementation Plan

### Milestone 0: Vercel Build Configuration [TODO]

[HUMAN] 1. Update Vercel Project Settings:
   - In your Vercel dashboard, go to your project settings.
   - Under "Build & Development Settings":
     - Set the "Root Directory" to `web`
     - Ensure the "Framework Preset" is still set to Next.js

[HUMAN] 2. Review and update any environment variables in your Vercel project settings. Make sure they're still pointing to the correct resources after the restructure.

[AI] 3. Create a `turbo.json` file in the root of your project:

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

[AI] 4. Update the `package.json` file in the `web` directory:

```json:web/package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

[AI] 5. Update `.gitignore` file to exclude build artifacts from both web and mobile projects:

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

[HUMAN] 6. Test the build process locally:
   - Navigate to the `web` directory
   - Run `npm run build` or `yarn build`
   - Ensure the build completes successfully

[HUMAN] 7. After making these changes:
   - Commit all changes to your repository
   - Push to your connected Git provider
   - Monitor the Vercel deployment to ensure it builds and deploys successfully

### Milestone 1: Basic App Setup and Navigation [TODO]

[HUMAN] Set up developer accounts for iOS (Apple Developer Program) and Android (Google Play Console). Configure necessary certificates and provisioning profiles for iOS development.

[AI] 1. Set up a new React Native project using Expo within the `mobile/` directory
[AI] 2. Implement basic navigation structure using React Navigation
[AI] 3. Create placeholder screens for Home, Sessions, and Profile
[AI] 4. Set up React Native Paper for UI components
[AI] 5. Implement a basic layout for each main screen

[HUMAN] Review and approve the initial project structure and navigation design

### Milestone 2: Core Session Functionality [TODO]

#### 2.1: Session Creation and Listing [TODO]
[AI] 1. Implement session creation screen with basic fields (title, description)
[AI] 2. Create a Sessions List screen
[AI] 3. Implement API calls to fetch and create sessions in Supabase

#### 2.2: Audio Recording and Playback [TODO]
[AI] 1. Integrate React Native Audio Toolkit for recording
[AI] 2. Implement basic audio recording functionality
[AI] 3. Create a simple audio player component
[AI] 4. Implement audio file upload to Supabase storage

#### 2.3: Session Management [TODO]
[AI] 1. Create a Session Details screen
[AI] 2. Implement edit and delete functionality for sessions
[AI] 3. Add basic error handling and loading states

[HUMAN] Test core session functionality on physical devices, ensuring basic features work correctly

### Milestone 3: AI Interviewer Integration [TODO]

[HUMAN] Set up LiveKit account for mobile app usage.

[AI] 1. Install and configure LiveKit React Native SDK
[AI] 2. Implement LiveKit room creation and joining
[AI] 3. Set up basic audio streaming for AI interviewer
[AI] 4. Create a simplified interview flow with start/stop functionality
[AI] 5. Implement basic error handling for network issues

[HUMAN] Conduct initial testing of the AI interviewer integration, focusing on core functionality

### Milestone 4: User Testing Preparation [TODO]

[AI] 1. Implement basic analytics using a simple solution (e.g., Firebase Analytics)
[AI] 2. Add an in-app feedback mechanism (e.g., a "Send Feedback" button that emails the development team)
[AI] 3. Prepare the app for beta deployment (TestFlight for iOS, Internal Test Track for Android)

[HUMAN] Set up beta testing groups and distribute the app to testers

### Milestone 5: Polish and Bug Fixes [TODO]

[AI] 1. Address critical bugs and user-reported issues
[AI] 2. Improve UI/UX based on initial user feedback
[AI] 3. Optimize performance for key user flows

[HUMAN] Review user feedback and prioritize improvements for the next iteration

## 5. Simplified Authentication

For the MVP, we'll use a simplified authentication flow:

[AI] 1. Implement basic email/password authentication using Clerk React Native SDK
[AI] 2. Create a simple sign-up and login screen
[AI] 3. Implement a basic authentication state manager

[HUMAN] Test the authentication flow on physical devices

## 6. MVP Features Checklist

- [ ] User registration and login
- [ ] Session creation with basic metadata
- [ ] Audio recording and playback
- [ ] Simple AI interviewer interaction
- [ ] Session listing and management (view, edit, delete)
- [ ] Basic error handling and loading states
- [ ] In-app feedback mechanism
- [ ] Basic analytics

## 7. Testing Strategy

- Focus on manual testing of core functionality
- Test on a limited set of iOS and Android devices
- Gather user feedback through in-app mechanism and direct communication with beta testers

## 8. Deployment

- Use TestFlight for iOS beta distribution
- Use Internal Test Track on Google Play Console for Android beta distribution
- Prepare for quick iterations based on user feedback

## 9. Post-MVP Considerations

After gathering initial user feedback, prioritize the following based on user needs:

1. Offline functionality
2. Advanced AI interviewer capabilities
3. Enhanced audio editing features
4. Push notifications
5. Social sharing
6. Accessibility improvements
7. Performance optimizations
8. Expanded test coverage

## 10. Relevant Documentation

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [React Native Paper Documentation](https://callstack.github.io/react-native-paper/)
- [Clerk React Native Documentation](https://clerk.dev/docs/reference/react-native)
- [Supabase React Native Documentation](https://supabase.com/docs/reference/javascript/installing)
- [LiveKit React Native Documentation](https://docs.livekit.io/client-sdk-react-native/)
- [React Native Audio Toolkit Documentation](https://github.com/react-native-audio-toolkit/react-native-audio-toolkit)
