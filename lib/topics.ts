export interface TopicTheme {
  id: string;
  title: string;
  description: string;
  topics: string[];
}

export const topicThemes: TopicTheme[] = [
  {
    id: "personal-reflections",
    title: "Personal Reflections",
    description: "Explore your memories and life experiences",
    topics: [
      "Share a childhood memory that makes you smile",
      "Tell me about a dream that stayed with you",
      "Describe a place that feels like home",
      "Talk about a moment that changed you",
      "Share a family tradition you cherish",
      "Tell me about an emotional turning point",
      "Describe a challenge you overcame",
      "Share an achievement you're proud of",
      "Tell me about your most valued relationship",
      "Share a moment of unexpected connection"
    ]
  },
  {
    id: "growth-learning",
    title: "Growth & Learning",
    description: "Explore your personal development and insights",
    topics: [
      "What's a lesson life taught you recently",
      "Share a skill you're proud of learning",
      "Describe a mistake that helped you grow",
      "Talk about someone who inspired you",
      "Share how you practice mindfulness",
      "Tell me about your journey of self-discovery",
      "What philosophical question intrigues you most",
      "Share how your values shape your choices",
      "Describe what brings you inner peace",
      "What personal growth goal excites you most right now"
    ]
  },
  {
    id: "career-aspirations",
    title: "Career & Aspirations",
    description: "Discuss your professional journey",
    topics: [
      "Share a pivotal moment in your career",
      "What's a dream you're working towards",
      "Tell me about your ideal future",
      "Describe something you want to learn",
      "What innovation excites you most",
      "Tell me how you find work-life balance",
      "What leadership quality do you most admire",
      "Share a professional risk that paid off",
      "How has your definition of success evolved",
      "What impact do you want your work to have"
    ]
  },
  {
    id: "creativity-arts",
    title: "Creativity & Arts",
    description: "Express your artistic side and creative pursuits",
    topics: [
      "Share what music means to you",
      "Tell me about a film that changed your view",
      "Describe your creative process",
      "What inspires your artistic side",
      "Share your favorite way to perform",
      "Tell me about a character you relate to",
      "What art form would you love to explore",
      "How do you express yourself creatively",
      "What's the most moving performance you've seen",
      "Share a creative project you dream of starting"
    ]
  },
  {
    id: "lifestyle-wellness",
    title: "Lifestyle & Wellness",
    description: "Share your approach to well-being and daily life",
    topics: [
      "Share your favorite way to stay active",
      "Describe your ideal self-care day",
      "What healthy habit changed your life",
      "Share how you manage stress",
      "Tell me about your perfect weekend",
      "What's a cause you care deeply about",
      "How do you maintain energy throughout the day",
      "What's your approach to mental well-being",
      "Share a wellness practice you'd recommend",
      "How do you create balance in your life"
    ]
  },
  {
    id: "society-culture",
    title: "Society & Culture",
    description: "Explore your perspective on the world around us",
    topics: [
      "How do you give back to your community",
      "Share a cultural experience that moved you",
      "Tell me about a social cause you champion",
      "What change do you wish to see in the world",
      "What recent news story moved you",
      "Share how your community is evolving",
      "How do you bridge different perspectives",
      "What cultural tradition do you value most",
      "How has technology changed your community",
      "What role do you play in social change"
    ]
  },
  {
    id: "fun-memories",
    title: "Fun & Light-hearted",
    description: "Share your joyful and entertaining experiences",
    topics: [
      "Tell me about your funniest memory",
      "Share your favorite comfort food story",
      "Describe your perfect adventure",
      "What makes you laugh every time",
      "Share a quirky fact about yourself",
      "What viral trend made you laugh",
      "What's the best celebration you've attended",
      "Tell me about a happy coincidence",
      "Share your most entertaining travel story",
      "What's the most spontaneous thing you've done"
    ]
  },
  {
    id: "nature-science",
    title: "Nature & Science",
    description: "Share your fascination with the natural world",
    topics: [
      "Share what fascinates you about space",
      "Tell me about your connection with nature",
      "What scientific discovery amazes you",
      "Describe your favorite natural wonder",
      "Share how you help the environment",
      "What future technology excites you",
      "What natural phenomenon would you love to witness",
      "How has nature influenced your perspective",
      "What scientific question intrigues you most",
      "Share an unexpected encounter with wildlife"
    ]
  }
];

// Helper function to flatten topics for the QuickRecordingSession
export const getAllTopics = (): string[] => {
  return topicThemes.flatMap(theme => theme.topics);
};

export const topicPlaceholders = getAllTopics();
