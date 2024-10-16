# AI Requirements Doc (AIRD) - Phase 2 - Mobile App Implementation

This document provides instructions for developing the Sessions mobile app, complementing the existing web application.

## 1. Overview

The Sessions mobile app will allow users to record conversations with an AI interviewer, manage their podcast sessions, and access their content on-the-go. The app will be developed for both iOS and Android platforms using React Native to maximize code reuse and maintain consistency with the web application.

## 2. Tech Stack

- **Framework**: React Native
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **API Calls**: Axios
- **Authentication**: Clerk React Native SDK
- **Database**: Supabase (same as web app)
- **Audio Recording**: React Native Audio Toolkit
- **Real-time Communication**: LiveKit React Native SDK

## 3. Implementation Plan

### Milestone 1: Project Setup and Basic Navigation

[HUMAN] Set up developer accounts for iOS (Apple Developer Program) and Android (Google Play Console). Configure necessary certificates and provisioning profiles for iOS development.

#### 1.1: Initial Project Setup
[AI] 1. Set up a new React Native project using Expo
[AI] 2. Configure ESLint and Prettier for code consistency
[AI] 3. Set up Git repository and initial commit

#### 1.2: Navigation Structure
[AI] 1. Install and configure React Navigation
[AI] 2. Create a basic tab navigation structure (Home, Sessions, Profile)
[AI] 3. Implement a stack navigator for each tab

#### 1.3: Basic UI Components
[AI] 1. Set up React Native Paper for UI components
[AI] 2. Create reusable components (e.g., Button, Card, Input)
[AI] 3. Implement a basic layout for each main screen

[HUMAN] Review and approve the initial project structure and navigation design

### Milestone 2: Authentication and User Management

[HUMAN] Set up Clerk and Supabase accounts for the mobile app, configuring necessary API keys and permissions.

#### 2.1: Clerk Integration
[AI] 1. Install and configure Clerk React Native SDK
[AI] 2. Implement Sign Up screen
[AI] 3. Implement Sign In screen
[AI] 4. Create a Protected Route wrapper component

#### 2.2: User Profile
[AI] 1. Create a Profile screen
[AI] 2. Implement functionality to fetch user data from Supabase
[AI] 3. Add ability to update user profile information

#### 2.3: Authentication Flow
[AI] 1. Implement a splash screen for initial app load
[AI] 2. Create an authentication state manager
[AI] 3. Implement automatic sign-in for returning users

[HUMAN] Test the authentication flow on physical iOS and Android devices, approving the user management features

### Milestone 3: Session Management

#### 3.1: Session Listing
[AI] 1. Create a Sessions List screen
[AI] 2. Implement API calls to fetch user's sessions from Supabase
[AI] 3. Display sessions in a scrollable list with basic information

#### 3.2: Session Details
[AI] 1. Create a Session Details screen
[AI] 2. Implement functionality to fetch full session details
[AI] 3. Display session information, including audio player and transcript

#### 3.3: Session Creation
[AI] 1. Create a New Session screen
[AI] 2. Implement form for entering session title and description
[AI] 3. Add functionality to create a new session in Supabase

[HUMAN] Review and test the session management features on physical devices, ensuring consistency with the web app. Verify that all API endpoints are accessible and functioning correctly on mobile networks.

### Milestone 4: Audio Recording and Playback

#### 4.1: Audio Recording
[AI] 1. Integrate React Native Audio Toolkit for recording
[AI] 2. Implement audio recording functionality
[AI] 3. Add audio visualization during recording

#### 4.2: Audio Playback
[AI] 1. Create a custom audio player component
[AI] 2. Implement audio playback functionality
[AI] 3. Add playback controls (play, pause, seek, volume)

#### 4.3: Audio File Management
[AI] 1. Implement audio file upload to Supabase storage
[AI] 2. Add functionality to download audio files for offline playback
[AI] 3. Implement caching mechanism for recently played sessions

[HUMAN] Test audio recording and playback on various physical iOS and Android devices, ensuring quality and performance across different hardware. Verify microphone permissions are working correctly.

### Milestone 5: AI Interviewer Integration

[HUMAN] Set up LiveKit account for mobile app usage.

#### 5.1: LiveKit Integration
[AI] 1. Install and configure LiveKit React Native SDK
[AI] 2. Implement LiveKit room creation and joining
[AI] 3. Set up audio streaming for AI interviewer

#### 5.2: AI Interaction
[AI] 1. Implement real-time transcription during interview
[AI] 2. Create an interface for displaying AI questions and user responses
[AI] 3. Implement error handling and reconnection logic for AI interactions

#### 5.3: Interview Flow
[AI] 1. Create an Interview screen with step-by-step guidance
[AI] 2. Implement start/stop functionality for interviews
[AI] 3. Add a review step before finalizing the recorded session

[HUMAN] Conduct thorough testing of the AI interviewer integration on physical devices, ensuring a smooth and intuitive user experience across different network conditions.

## 4. Rules and Guidelines

1. Follow React Native best practices and performance guidelines.
2. Use functional components and hooks throughout the application.
3. Implement proper error handling and display user-friendly error messages.
4. Use TypeScript for type safety and better developer experience.
5. Follow the same API response formatting guidelines as the web app (use camelCase for client-side data).
6. Use the Supabase React Native SDK for database interactions.
7. Implement proper loading states and skeleton screens for better UX.
8. Use React Native's Platform API to handle platform-specific code when necessary.
9. Follow mobile-specific design patterns and respect platform guidelines (iOS Human Interface Guidelines and Material Design).
10. Implement proper keyboard handling and scrolling behavior.
11. Use async storage for local data persistence.
12. Implement proper deep linking support for sharing sessions.

## 5. Relevant Documentation

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [React Native Paper Documentation](https://callstack.github.io/react-native-paper/)
- [Clerk React Native Documentation](https://clerk.dev/docs/reference/react-native)
- [Supabase React Native Documentation](https://supabase.com/docs/reference/javascript/installing)
- [LiveKit React Native Documentation](https://docs.livekit.io/client-sdk-react-native/)
- [React Native Audio Toolkit Documentation](https://github.com/react-native-audio-toolkit/react-native-audio-toolkit)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/introduction/getting-started)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Detox Documentation](https://github.com/wix/Detox)
- [React Native Testing Library Documentation](https://callstack.github.io/react-native-testing-library/)

## 6. Integration with Existing Backend

The mobile app will use the same Supabase backend as the web application. Refer to the `backend.md` file for details on the existing database structure and API endpoints. Ensure that all new features implemented in the mobile app are compatible with the existing backend structure.

## 7. Continuous Integration and Deployment

[HUMAN] Set up Apple and Google developer accounts for app distribution.

[AI] 1. Set up a CI/CD pipeline using a service like GitHub Actions or Bitrise.
[AI] 2. Automate building and testing of the app for both iOS and Android.
[AI] 3. Implement automated deployment to TestFlight for iOS and Google Play Internal Testing for Android.

[HUMAN] Set up Firebase project for crash reporting and analytics.

## 8. Security Considerations

1. Implement secure storage for sensitive data using libraries like react-native-keychain.
2. Use HTTPS for all network requests.
3. Implement certificate pinning for added security against man-in-the-middle attacks.
4. Regularly update dependencies to patch security vulnerabilities.
5. Implement proper session management and token refresh mechanisms.

## 9. App Store Submission

[HUMAN] Prepare screenshots, app descriptions, and other required metadata for both App Store and Google Play Store. Submit the app for review to both stores and handle any feedback or rejection issues.


## 10. Post-MVP Features

### 10.1. General Features
1. Push Notifications: Implement push notifications for new shared sessions, comments, or app updates.
2. Social Sharing: Add functionality to share sessions on social media platforms.
3. Collaborative Sessions: Allow multiple users to participate in a single interview session.
4. Advanced Audio Editing: Implement basic audio editing features within the app.
5. Offline AI Interviewer: Develop a lightweight AI model that can run on-device for offline interviewing.
6. Voice Commands: Implement voice commands for hands-free control of the app.
7. Integration with Wearables: Develop companion apps for smartwatches to control recording and playback.
8. AR Visualizations: Create augmented reality visualizations of audio waveforms or transcripts.

### 10.2. Offline Functionality and Sync

#### Offline Data Storage
1. Implement local storage for user data and sessions
2. Create a sync manager to handle offline changes
3. Add functionality to queue actions when offline

#### Background Sync
1. Implement background sync functionality
2. Add notifications for completed sync actions
3. Handle conflict resolution for offline changes

#### Offline Playback
1. Implement download manager for offline session access
2. Add UI for managing downloaded sessions
3. Implement offline playback functionality

[HUMAN] Test offline functionality thoroughly, including various network conditions and sync scenarios

### 10.3. Performance Optimization and Testing

#### Performance Audit
1. Conduct a performance audit of the app
2. Optimize render performance for list views
3. Implement lazy loading for images and audio files

#### Unit and Integration Testing
1. Set up Jest and React Native Testing Library
2. Write unit tests for utility functions and components
3. Implement integration tests for main user flows

#### End-to-End Testing
1. Set up Detox for end-to-end testing
2. Write end-to-end tests for critical user journeys
3. Implement CI/CD pipeline for automated testing

[HUMAN] Review performance optimizations and approve the testing strategy

### 10.4. Polish and Final Touches

#### UI/UX Refinement
1. Conduct a design review and implement feedback
2. Add animations and transitions for a smoother user experience
3. Implement skeleton screens for loading states

#### Accessibility
1. Audit the app for accessibility issues
2. Implement VoiceOver and TalkBack support
3. Ensure proper color contrast and text sizing

#### Localization
1. Set up react-native-localize
2. Extract all strings for localization
3. Implement support for multiple languages

[HUMAN] Conduct a final review of the app's UI/UX, accessibility features, and localization support