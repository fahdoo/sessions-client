Note: Can be regenerated with `tree -L 4 -I 'node_modules'`

├── README.md
├── app
│   ├── admin
│   │   ├── generate-learnings
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── update-titles
│   │   │   └── page.tsx
│   │   └── visualization
│   │       └── page.tsx
│   ├── api
│   │   ├── admin
│   │   │   ├── generate-learnings
│   │   │   └── update-titles
│   │   ├── extract-learnings
│   │   │   └── route.ts
│   │   ├── generate-summary
│   │   │   └── route.ts
│   │   ├── generate-title
│   │   │   └── route.ts
│   │   ├── livekit
│   │   │   ├── get-token
│   │   │   └── recording
│   │   ├── sessions
│   │   │   ├── [id]
│   │   │   ├── mine
│   │   │   ├── process-audio
│   │   │   ├── public
│   │   │   └── route.ts
│   │   ├── test
│   │   │   └── route.ts
│   │   ├── users
│   │   │   ├── [username]
│   │   │   └── recommended
│   │   └── webhooks
│   │       ├── auphonic
│   │       ├── clerk
│   │       ├── livekit
│   │       └── zapier-audio-produced
│   ├── audiogram-test
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── feed
│   │   └── page.tsx
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css
│   ├── labs
│   │   ├── audiogram
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── musicolors
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── learnings
│   │   └── page.tsx
│   ├── mine
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── page.tsx
│   ├── privacy
│   │   └── page.tsx
│   ├── profile
│   │   └── [username]
│   │       ├── error.tsx
│   │       └── page.tsx
│   ├── session
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── sessions
│   │   ├── [id]
│   │   │   ├── edit
│   │   │   ├── error.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── record
│   │   └── layout.tsx
│   ├── sign-in
│   │   └── [[...sign-in]]
│   │       └── page.tsx
│   ├── sign-up
│   │   └── [[...sign-up]]
│   │       └── page.tsx
│   ├── terms
│   │   └── page.tsx
│   ├── test
│   │   └── audio
│   │       └── page.tsx
│   └── topics
│       ├── [topic]
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── layout.tsx
│       └── page.tsx
├── components
│   ├── HeroSection.tsx
│   ├── LoadingIndicator.tsx
│   ├── RecommendedUsers.tsx
│   ├── TopicCard.tsx
│   ├── audiogram
│   │   ├── AgentVisualizationWrapper.tsx
│   │   ├── Audiogram.module.scss
│   │   ├── AudiogramHeader.tsx
│   │   ├── AudiogramSettingsSidebar.tsx
│   │   ├── AudiogramToolbar.tsx
│   │   ├── AudiogramVisualizer.tsx
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── utils
│   │   │   ├── recording.ts
│   │   │   └── visualEffects.ts
│   │   └── visualizers
│   │       ├── MusicolorsVisualizer.tsx
│   │       └── WaveWrapper.tsx
│   ├── layout
│   │   ├── NewSessionDialog.tsx
│   │   └── navigation.tsx
│   ├── legal
│   │   └── LegalPageLayout.tsx
│   ├── recording
│   │   ├── AgentVariantSelector.tsx
│   │   ├── InitialControlBar.tsx
│   │   ├── LiveTranscriptOverlay.tsx
│   │   ├── QuickRecordingSession.tsx
│   │   ├── SessionRoom.tsx
│   │   ├── SessionVisibilitySelector.tsx
│   │   ├── StatusBar.tsx
│   │   ├── TopicInput.tsx
│   │   ├── TopicInputs.tsx
│   │   └── visualizer
│   │       ├── AgentVisualizer.module.scss
│   │       ├── AgentVisualizer.tsx
│   │       ├── AgentVisualizerBands.tsx
│   │       ├── SimpleVoiceAssistant.tsx
│   │       ├── TestControlBar.tsx
│   │       ├── animationSequences
│   │       ├── useBandAnimator.ts
│   │       └── visualizerUtils.ts
│   ├── session
│   │   ├── DeleteSession.tsx
│   │   ├── ProcessingStatus.tsx
│   │   ├── audio
│   │   │   ├── AudioPlayButton.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── MediaSessionContext.tsx
│   │   │   ├── MiniAudioPlayer.tsx
│   │   │   ├── PlayerContext.tsx
│   │   │   ├── ProcessAudioButton.tsx
│   │   │   ├── TestAuphonicButton.tsx
│   │   │   └── WaveformPlayer.tsx
│   │   ├── feed
│   │   │   ├── SessionCard.tsx
│   │   │   └── SessionFeed.tsx
│   │   └── view
│   │       ├── ClientSessionControls.tsx
│   │       ├── ClientSessionView.tsx
│   │       ├── GenerateTitleButton.tsx
│   │       ├── SessionContent.tsx
│   │       └── TitleSection.tsx
│   ├── transcription
│   │   ├── TranscriptionDisplay.tsx
│   │   └── TranscriptionDrawer.tsx
│   ├── ui
│   │   ├── accordion.tsx
│   │   ├── action-button.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── back-button.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── collapsible.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── error-boundary.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── loading.tsx
│   │   ├── select.tsx
│   │   ├── selector-group.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── textarea.tsx
│   │   ├── title-manager.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── toggle.tsx
│   │   └── tooltip.tsx
│   └── user
│       └── UserHeader.tsx
├── components.json
├── docs.md
├── hooks
│   ├── use-media-query.ts
│   └── use-mobile.tsx
├── lib
│   ├── ai
│   │   ├── extractLearnings.ts
│   │   ├── generateSummary.ts
│   │   └── generateTitle.ts
│   ├── hooks
│   │   ├── useSessionData.ts
│   │   ├── useSupabase.ts
│   │   ├── useToast.ts
│   │   ├── useTranscript.ts
│   │   └── useUserDataReady.ts
│   ├── livekit.ts
│   ├── mergeProps.ts
│   ├── musicolors
│   │   ├── config.ts
│   │   ├── index.ts
│   │   ├── js
│   │   │   ├── audio.js
│   │   │   └── colors.js
│   │   └── types.ts
│   ├── roles.ts
│   ├── server.ts
│   ├── supabase
│   │   ├── supabase-auth-client.ts
│   │   ├── supabase-auth.ts
│   │   ├── supabase-client.ts
│   │   ├── supabase-public.ts
│   │   └── supabase-service-role.ts
│   ├── topics.ts
│   ├── types.ts
│   └── utils
│       ├── audio-conversion.ts
│       ├── audio.ts
│       ├── auphonic.ts
│       ├── browser.ts
│       ├── client.ts
│       ├── format.ts
│       ├── index.ts
│       ├── polling.ts
│       └── user.ts
├── middleware.ts
├── migrations
│   └── add_auphonic_uuid.sql
├── next-env.d.ts
├── next.config.mjs
├── notepad
│   └── Audiogram.md
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon-96x96.png
│   ├── favicon.svg
│   ├── test-audio.mp3
│   ├── topics
│   │   ├── career-aspirations.webp
│   │   ├── creativity-arts.webp
│   │   ├── hobbies-adventure.webp
│   │   ├── hobbies-gardening.webp
│   │   ├── personal-experiences-childhood.webp
│   │   ├── personal-growth-self.webp
│   │   ├── science-exploration.webp
│   │   ├── society-culture.webp
│   │   └── spirituality.webp
│   ├── web-app-manifest-192x192.png
│   └── web-app-manifest-512x512.png
├── requirements
│   ├── aird-1-web.md
│   ├── aird-2-mobile.md
│   ├── aird-3-memory.md
│   ├── audio-conversion.md
│   ├── backend.md
│   ├── file-structure.md
│   ├── overview.md
│   ├── session_recording.md
│   └── transcripts_design.md
├── styles
│   └── globals.css
├── supabase
│   └── migrations
│       └── [timestamp]_add_deleted_at_to_sessions.sql
├── tailwind.config.ts
├── tsconfig.json
└── types
    ├── globals.d.ts
    ├── musicolors.d.ts
    └── note-frequency-map.d.ts