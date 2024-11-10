# Sessions App Overview

## Project Description

Sessions is a personal podcast app that enables users to record conversations with an AI interviewer to capture their life stories, thoughts, and reflections. The app provides features for editing, sharing, and managing podcast sessions, with customization options like background music and visuals.

## Core Features

### 1. AI-Powered Interviews
- Real-time conversations with an AI interviewer using LiveKit
- Adaptive questioning based on user responses (OpenAI GPT-4)
- Memory system for contextual and personalized interactions
- Real-time transcription during conversations
- Topic-guided discussions with AI adaptation

### 2. Session Management
- Create, edit, and delete recording sessions
- Public/private visibility settings
- View and manage session history
- Audio playback with transcript display
- Session title generation and management
- Automated summary generation

### 3. User Experience
- Clean, intuitive interface for recording and playback
- Real-time audio visualization
- Responsive design for both desktop and mobile
- Secure user authentication via Clerk
- Toast notification system for user feedback
- Drawer interfaces for transcripts and controls

### 4. Topic Management
- Predefined conversation topics by category
- Custom topic creation
- Topic-based session organization
- AI-guided topic exploration
- Topic refresh functionality
- Lifestyle & wellness topics
- Society & culture discussions

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 (React) with App Router
- **Styling**: Tailwind CSS + Shadcn UI
  - Custom UI components including:
    - Dialog system
    - Toast notifications
    - Drawer interface
    - Card layouts
    - Form elements
    - Avatar components
    - Badge system
- **State Management**: React Hooks
- **Real-time Communication**: LiveKit SDK
- **Authentication**: Clerk
- **Media Features**: 
  - Waveform visualization
  - Media session integration
  - Cross-browser audio support

### Backend
- **Runtime**: Node.js
- **API**: Next.js 14 API Routes
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Memory System**: Combination of Supabase (structured) and Vector DB (unstructured)

### AI and ML
- **Natural Language Processing**: OpenAI GPT-4
- **Speech-to-Text**: OpenAI Whisper
- **Text-to-Speech**: OpenAI TTS

### Infrastructure
- **Hosting**: Vercel
- **Version Control**: Git (GitHub)
- **CI/CD**: Vercel (integrated with GitHub)
- **Development Tools**: ngrok for webhook testing

## Project Structure

```
project-root/
├── app/                    # Next.js pages and API routes
│   ├── admin/             # Admin dashboard and tools
│   │   ├── update-titles/ # Title management tools
│   │   └── visualization/ # Data visualization tools
│   ├── api/               # API routes for backend functionality
│   │   ├── admin/        # Admin-specific endpoints
│   │   ├── sessions/     # Session management
│   │   └── webhooks/     # External service webhooks
│   ├── feed/             # Public feed of sessions
│   ├── topics/           # Topic selection and management
│   ├── test/             # Testing and development tools
│   └── sessions/         # Session management pages
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── recording/        # Recording-related components
│   │   └── visualizer/   # Audio visualization components
│   ├── session/          # Session management components
│   │   ├── audio/       # Audio playback components
│   ├── transcription/    # Transcription components
│   └── ui/               # Reusable UI components
├── lib/                  # Shared utilities and hooks
│   ├── ai/              # AI-related utilities
│   ├── hooks/           # Custom React hooks
│   ├── supabase/        # Supabase client and utilities
│   └── utils/           # General utility functions
├── public/               # Static assets
└── requirements/         # Project documentation
```

## Key Workflows

### 1. Session Recording
1. User creates a new session with optional topic/title
2. LiveKit room is created for audio streaming
3. AI interviewer engages in conversation using context and memories
4. Real-time transcription is generated and displayed
5. Audio is recorded via LiveKit Cloud Egress

### 2. Session Processing
1. Audio file is stored in Supabase Storage
2. Transcript is processed and formatted
3. AI generates session summary and title
4. Key learnings are extracted from conversation
5. Memory system updates user context
6. Session metadata is updated in database

### 3. Session Playback
1. User accesses a recorded session
2. Audio is streamed from Supabase Storage
3. Transcript is displayed with speaker identification
4. Navigation controls for audio timeline
5. Options to share or modify session visibility

## Development Status

### Implemented Features
- User authentication with Clerk
- Basic session creation and management
- Real-time audio recording with LiveKit
- Public/private session visibility
- Audio playback with transcript display
- Real-time transcription during recording
- AI-generated summaries and titles
- Key learning extraction

### In Progress Features
- Basic memory system implementation
- Session deletion functionality
- Enhanced error handling
- User feedback improvements

### Upcoming Features
- Enhanced AI memory system
- Mobile app development (React Native)
- Background music integration
- Advanced audio editing capabilities
- Social sharing features
- Push notifications
- Collaborative sessions
- Custom AI personalities
- Testing infrastructure (Jest, Cypress)
- Accessibility testing tools

## API Endpoints

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/[id]` - Get session details
- `PUT /api/sessions/[id]` - Update session
- `POST /api/sessions/[id]/process` - Process completed session

### AI Processing
- `POST /api/generate-summary` - Generate session summary
- `POST /api/generate-title` - Generate session title
- `POST /api/extract-learnings` - Extract key learnings

### User Management
- `GET /api/users/[username]` - Get user profile
- `GET /api/users/recommended` - Get recommended users

## Environment Setup

Required environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

## Documentation Links

- [Backend Documentation](requirements/backend.md)
- [Session Recording Documentation](requirements/session_recording.md)
- [Transcript Design Documentation](requirements/transcripts_design.md)
- [Web Documentation](requirements/aird-1-web.md)
- [Memory System Documentation](requirements/aird-3-memory.md)
- [Mobile Implementation Plan](requirements/aird-2-mobile.md)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. Run development server: `npm run dev`
5. Access the app at `http://localhost:3000`

## Development Guidelines

1. Follow TypeScript best practices
2. Use Shadcn UI components when possible
3. Implement error handling and loading states
4. Write meaningful commit messages
5. Update documentation when adding features
6. Test across different browsers and devices

## Testing (Planned)
- Unit tests with Jest [TODO]
- Integration tests with Cypress [TODO]
- Manual testing checklist for new features
- Performance testing with Lighthouse [TODO]
- Accessibility testing with axe-core [TODO]

## Security Considerations

- Authentication via Clerk
- Data encryption at rest
- CORS policy implementation
- Rate limiting on API routes
- Input validation and sanitization
- Regular security audits

For detailed setup instructions and contribution guidelines, refer to the [README.md](README.md).