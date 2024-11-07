export interface Topic {
  id: string;
  title: string;
  description: string;
  image: string;
  subtopics: Array<{ id: string; title: string }>;
}

export const topics: Topic[] = [
  { 
    id: "memories",
    title: "Memories",
    description: "Dive into the heart of your personal story. Share the moments that shaped you, the relationships that defined you, and the lessons that transformed you.",
    image: '/topics/personal-experiences-childhood.webp',
    subtopics: [
      { id: "childhood-memories", title: "Childhood Memories" },
      { id: "friendships-and-relationships", title: "Friendships and Relationships" },
      { id: "family-and-heritage", title: "Family and Heritage" },
      { id: "emotions-and-experiences", title: "Emotions and Experiences" },
      { id: "challenges-and-resilience", title: "Challenges and Resilience" },
      { id: "achievements-and-milestones", title: "Achievements and Milestones" }
    ]
  },
  { 
    id: "meaning",
    title: "Meaning",
    description: "Delve into life's deeper questions. Explore your beliefs, discuss your inward journey, and ponder the search for purpose and meaning.",
    image: '/topics/personal-growth-self.webp',
    subtopics: [
      { id: "personal-growth-and-self-discovery", title: "Personal Growth and Self-Discovery" },
      { id: "mindfulness-and-reflection", title: "Mindfulness and Reflection" },
      { id: "philosophy-and-lifes-big-questions", title: "Philosophy and Life's Big Questions" },
      { id: "religion-and-spirituality", title: "Religion and Spirituality" },
      { id: "meditation-and-mindfulness", title: "Meditation and Mindfulness" },
      { id: "personal-values-and-ethics", title: "Personal Values and Ethics" },
      { id: "search-for-purpose", title: "Search for Purpose" }
    ]
  },
  {
    id: "aspirations",
    title: "Aspirations",
    description: "Envision your professional path. Discuss your career highs, the challenges you've overcome, and the ambitious dreams that drive you forward.",
    image: '/topics/career-aspirations.webp',
    subtopics: [
      { id: "career-and-professional-life", title: "Career and Professional Life" },
      { id: "future-aspirations", title: "Future Aspirations" },
      { id: "achievements-and-milestones", title: "Achievements and Milestones" },
    ]
  },
  {
    id: "passions",
    title: "Passions",
    description: "Celebrate the activities that light up your world. Share the pursuits that bring you joy, the skills you've honed, and the passions that define you.",
    image: '/topics/hobbies-adventure.webp',
    subtopics: [
      { id: "hobbies-and-passions", title: "Hobbies and Passions" },
      { id: "arts-and-entertainment", title: "Arts and Entertainment" },
      { id: "travel-and-adventure", title: "Travel and Adventure" },
      { id: "nature-and-the-environment", title: "Nature and the Environment" },
      { id: "health-and-well-being", title: "Health and Well-being" }
    ]
  },
  {
    id: "society",
    title: "Society",
    description: "Engage with the world around you. Discuss the cultural forces shaping our society, your role in your community, and the changes you wish to see.",
    image: '/topics/society-culture.webp',
    subtopics: [
      { id: "society-and-culture", title: "Society and Culture" },
      { id: "community-and-service", title: "Community and Service" },
      { id: "technology-and-innovation", title: "Technology and Innovation" }
    ]
  },
  {
    id: "exploration",
    title: "Exploration",
    description: "Unleash your curiosity about the universe. Explore scientific breakthroughs, technological marvels, and the wonders that inspire your sense of awe.",
    image: '/topics/science-exploration.webp',
    subtopics: [
      { id: "technology-and-innovation", title: "Technology and Innovation" },
      { id: "space-and-astronomy", title: "Space and Astronomy" },
      { id: "scientific-discoveries", title: "Scientific Discoveries" },
      { id: "curiosity-about-the-natural-world", title: "Curiosity about the Natural World" }
    ]
  },
  {
    id: "arts",
    title: "Creativity",
    description: "Immerse yourself in the world of creativity. Discuss your favorite art forms, your own creative pursuits, and the power of artistic expression.",
    image: '/topics/creativity-arts.webp',
    subtopics: [
      { id: "visual-arts-and-design", title: "Visual Arts and Design" },
      { id: "music-and-performance-arts", title: "Music and Performance Arts" },
      { id: "writing-and-literature", title: "Writing and Literature" },
      { id: "film-and-cinema", title: "Film and Cinema" }
    ]
  }
];

export const topicPlaceholders = [
  // Personal Reflections
  "Share a childhood memory that makes you smile",
  "Tell me about a dream that stayed with you",
  "Describe a place that feels like home",
  "Talk about a moment that changed you",
  "Share a family tradition you cherish",
  "Tell me about an emotional turning point",
  "Describe a challenge you overcame",
  "Share an achievement you're proud of",
  
  // Growth & Learning
  "What's a lesson life taught you recently",
  "Share a skill you're proud of learning",
  "Describe a mistake that helped you grow",
  "Talk about someone who inspired you",
  "Share how you practice mindfulness",
  "Tell me about your journey of self-discovery",
  "What philosophical question intrigues you most",
  
  // Passions & Interests
  "What's a hobby that brings you joy",
  "Share a creative project you're working on",
  "Tell me about a book that moved you",
  "Describe your perfect weekend",
  "What's a cause you care deeply about",
  "Share what wellness means to you",
  "Tell me about your favorite art form",
  
  // Career & Future
  "Share a pivotal moment in your career",
  "What's a dream you're working towards",
  "Tell me about your ideal future",
  "Describe something you want to learn",
  "What innovation excites you most",
  
  // Nature & Science
  "Share what fascinates you about space",
  "Tell me about your connection with nature",
  "What scientific discovery amazes you",
  "Describe your favorite natural wonder",
  "Share how you help the environment",
  
  // Society & Community
  "How do you give back to your community",
  "Share a cultural experience that moved you",
  "Tell me about a social cause you champion",
  "What change do you wish to see in the world",
  "Describe how you bridge cultural differences",
  
  // Arts & Expression
  "Share what music means to you",
  "Tell me about a film that changed your view",
  "Describe your creative process",
  "What inspires your artistic side",
  "Share your favorite way to perform",
  
  // Spirituality & Values
  "Share a belief that guides you",
  "Tell me about your spiritual journey",
  "What questions keep you up at night",
  "Describe what brings you inner peace",
  "Share how your values shape your choices",
  
  // Relationships & Connections
  "Tell me about a friendship that shaped you",
  "Share a meaningful conversation you had",
  "Describe a random act of kindness",
  "Talk about your most valued relationship",
  "Share a moment of unexpected connection",
  
  // Lifestyle & Wellness
  "Share your favorite way to stay active",
  "Tell me how you find work-life balance",
  "Describe your ideal self-care day",
  "What healthy habit changed your life",
  "Share how you manage stress",
  
  // Fun & Light-hearted
  "Tell me about your funniest memory",
  "Share your favorite comfort food story",
  "Describe your perfect adventure",
  "What makes you laugh every time",
  "Share a quirky fact about yourself",
  
  // Entertainment & Pop Culture
  "Share a TV show that captivated you",
  "Tell me about your favorite game",
  "What podcast can't you stop recommending",
  "Describe a concert that moved you",
  "Share your most rewatched movie",
  "Tell me about a character you relate to",
  "What viral trend made you laugh",
  
  // Current Events & World
  "What recent news story moved you",
  "Share how you stay informed",
  "Tell me about a global issue you follow",
  "What future technology excites you",
  "Share a positive change you've noticed",
  "Describe how your community is evolving",
  "What world event shaped your views"
];
