Note: Can be regenerated with `tree -L 4 -I 'node_modules'`

```
├── README.md
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
│   │   ├── extract-learnings
│   │   │   └── route.ts
│   │   ├── generate-summary
│   │   │   └── route.ts
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
│   ├── learnings
│   │   └── page.tsx
│   ├── mine
│   │   └── page.tsx
│   ├── page.tsx
│   ├── profile
│   │   └── [username]
│   │       ├── error.tsx
│   │       └── page.tsx
│   ├── session
│   │   └── page.tsx
│   ├── sessions
│   │   └── [id]
│   │       ├── edit
│   │       ├── error.tsx
│   │       ├── page.tsx
│   │       └── record
│   ├── sign-in
│   │   └── [[...sign-in]]
│   │       └── page.tsx
│   ├── sign-up
│   │   └── [[...sign-up]]
│   │       └── page.tsx
│   └── test
│       └── audio
│           └── page.tsx
├── components
│   ├── HeroSection.tsx
│   ├── LoadingIndicator.tsx
│   ├── RecommendedUsers.tsx
│   ├── TopicCard.tsx
│   ├── layout
│   │   ├── NewSessionDialog.tsx
│   │   └── navigation.tsx
│   ├── recording
│   │   ├── AgentVariantSelector.tsx
│   │   ├── InitialControlBar.tsx
│   │   ├── LiveTranscriptOverlay.tsx
│   │   ├── QuickRecordingSession.tsx
│   │   ├── SessionRoom.tsx
│   │   ├── SessionVisibilitySelector.tsx
│   │   ├── StatusBar.tsx
│   │   ├── TopicInput.tsx
│   │   ├── TopicInputs.tsx
│   │   └── visualizer
│   │       ├── AgentVisualizer.module.scss
│   │       ├── AgentVisualizer.tsx
│   │       ├── AgentVisualizerBands.tsx
│   │       ├── SimpleVoiceAssistant.tsx
│   │       ├── TestControlBar.tsx
│   │       ├── animationSequences
│   │       ├── useBandAnimator.ts
│   │       └── visualizerUtils.ts
│   ├── session
│   │   ├── ProcessingStatus.tsx
│   │   ├── audio
│   │   │   ├── AudioPlayButton.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── MediaSessionContext.tsx
│   │   │   ├── MiniAudioPlayer.tsx
│   │   │   ├── PlayerContext.tsx
│   │   │   └── WaveformPlayer.tsx
│   │   ├── feed
│   │   │   ├── SessionCard.tsx
│   │   │   └── SessionFeed.tsx
│   │   └── view
│   │       ├── ClientSessionControls.tsx
│   │       ├── ClientSessionView.tsx
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
│   │   ├── selector-group.tsx
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
│   ├── ai
│   │   ├── extractLearnings.ts
│   │   ├── generateSummary.ts
│   │   └── generateTitle.ts
│   ├── audioUtils.ts
│   ├── browser-utils.ts
│   ├── hooks
│   │   ├── use-toast.ts
│   │   ├── useSupabase.ts
│   │   └── useUserDataReady.ts
│   ├── livekit.ts
│   ├── mergeProps.ts
│   ├── roles.ts
│   ├── server-utils.ts
│   ├── supabase-auth-client.ts
│   ├── supabase-auth.ts
│   ├── supabase-client.ts
│   ├── supabase-public.ts
│   ├── supabase-service-role.ts
│   ├── topics.ts
│   ├── types.ts
│   ├── useTranscript.ts
│   ├── userUtils.ts
│   ├── utils
│   │   └── polling.ts
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
│   ├── file-structure.md
│   ├── session_recording.md
│   └── transcripts_design.md
├── tailwind.config.ts
├── tsconfig.json
└── types
    └── globals.d.ts
```