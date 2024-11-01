Note: Can be regenerated with `tree -L 4 -I 'node_modules'`

```
── README.md
├── app
│   ├── admin
│   │   ├── generate-learnings
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── update-titles
│   │   │   └── page.tsx
│   │   └── visualization
│   │       └── page.tsx
│   ├── api
│   │   ├── admin
│   │   │   ├── generate-learnings
│   │   │   └── update-titles
│   │   ├── generate-title
│   │   │   └── route.ts
│   │   ├── livekit
│   │   │   ├── get-token
│   │   │   └── recording
│   │   ├── sessions
│   │   │   ├── [id]
│   │   │   ├── mine
│   │   │   ├── public
│   │   │   └── route.ts
│   │   ├── test
│   │   │   └── route.ts
│   │   ├── users
│   │   │   ├── [username]
│   │   │   └── recommended
│   │   └── webhooks
│   │       ├── clerk
│   │       ├── livekit
│   │       └── zapier-audio-produced
│   ├── favicon.ico
│   ├── feed
│   │   └── page.tsx
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css
│   ├── layout.tsx
│   ├── mine
│   │   └── page.tsx
│   ├── page.tsx
│   ├── profile
│   │   └── [username]
│   │       └── page.tsx
│   ├── session
│   │   └── page.tsx
│   ├── sessions
│   │   └── [id]
│   │       ├── ClientSessionView.tsx
│   │       ├── SessionView.tsx
│   │       ├── edit
│   │       ├── page.tsx
│   │       └── record
│   ├── settings
│   │   └── page.tsx
│   └── test
│       └── audio
│           └── page.tsx
├── components
│   ├── LoadingIndicator.tsx
│   ├── RecommendedUsers.tsx
│   ├── TopicCard.tsx
│   ├── hero-section.tsx
│   ├── layout
│   │   ├── NewSessionDialog.tsx
│   │   └── navigation.tsx
│   ├── recording
│   │   ├── ControlBar.tsx
│   │   ├── InitialControlBar.tsx
│   │   ├── QuickRecordingSession.tsx
│   │   ├── SessionRoom.tsx
│   │   ├── StandbyVisualizer.tsx
│   │   ├── StatusBar.tsx
│   │   ├── TopicInputs.tsx
│   │   └── visualizer
│   │       ├── AgentVisualizer.module.scss
│   │       ├── AgentVisualizer.tsx
│   │       ├── AgentVisualizerBands.tsx
│   │       ├── SimpleVoiceAssistant.tsx
│   │       ├── animationSequences
│   │       ├── useBandAnimator.ts
│   │       └── visualizerUtils.ts
│   ├── session
│   │   ├── audio
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── MiniAudioPlayer.tsx
│   │   │   ├── PlayerContext.tsx
│   │   │   └── WaveformPlayer.tsx
│   │   ├── feed
│   │   │   ├── SessionCard.tsx
│   │   │   └── SessionFeed.tsx
│   │   └── view
│   │       ├── ClientSessionControls.tsx
│   │       ├── GenerateTitleButton.tsx
│   │       ├── SessionContent.tsx
│   │       └── TitleSection.tsx
│   ├── transcription
│   │   ├── TranscriptionDisplay.tsx
│   │   └── TranscriptionDrawer.tsx
│   ├── ui
│   │   ├── accordion.tsx
│   │   ├── action-button.tsx
│   │   ├── avatar.tsx
│   │   ├── back-button.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── error-boundary.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── loading.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toggle.tsx
│   │   └── tooltip.tsx
│   └── user
│       └── UserHeader.tsx
├── components.json
├── lib
│   ├── audioUtils.ts
│   ├── browser-utils.ts
│   ├── hooks
│   │   ├── use-toast.ts
│   │   ├── useSupabase.ts
│   │   └── useUserDataReady.ts
│   ├── learning-extraction.ts
│   ├── livekit.ts
│   ├── mergeProps.ts
│   ├── roles.ts
│   ├── server-utils.ts
│   ├── summarization.ts
│   ├── supabase-auth.ts
│   ├── supabase-client.ts
│   ├── supabase-public.ts
│   ├── supabase-service-role.ts
│   ├── title-generation.ts
│   ├── topics.ts
│   ├── types.ts
│   ├── useTranscript.ts
│   ├── userUtils.ts
│   └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   └── topics
│       ├── career-aspirations.webp
│       ├── creativity-arts.webp
│       ├── hobbies-adventure.webp
│       ├── hobbies-gardening.webp
│       ├── personal-experiences-childhood.webp
│       ├── personal-growth-self.webp
│       ├── science-exploration.webp
│       ├── society-culture.webp
│       └── spirituality.webp
├── requirements
│   ├── aird-1-web.md
│   ├── aird-2-mobile.md
│   ├── aird-3-memory.md
│   ├── backend.md
│   ├── session_recording.md
│   └── transcripts_design.md
├── tailwind.config.ts
├── tsconfig.json
└── types
    └── globals.d.ts
```