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

export const topicQuestions = {
  // Bucket 1: Personal Experiences and Relationships

  "childhood-memories": [
    "What is a childhood memory that still brings you joy when you think about it?",
    "How did your upbringing shape the person you are today?",
    "Can you tell me about a significant lesson you learned as a child?",
    "What was your favorite place to explore when you were young, and why?",
    "Who was a childhood friend that left a lasting impression on you?"
  ],

  "friendships-and-relationships": [
    "How have your friendships influenced your life journey?",
    "Can you share a story about a relationship that taught you something important?",
    "What qualities do you value most in a close friend?",
    "How do you maintain strong connections with the people you care about?",
    "In what ways have your relationships shaped your perspective on the world?"
  ],

  "family-and-heritage": [
    "What family traditions mean the most to you, and why?",
    "How has your heritage influenced your identity?",
    "Can you share a story passed down through your family that you find meaningful?",
    "What role does family play in your life today?",
    "How do you preserve your family's history for future generations?"
  ],

  "emotions-and-experiences": [
    "Can you describe an experience that evoked a strong emotional response?",
    "How do you navigate complex emotions during challenging times?",
    "What has been a pivotal emotional moment in your life?",
    "How do your emotions influence your decision-making?",
    "Can you share a time when an emotional experience led to personal growth?"
  ],

  "challenges-and-resilience": [
    "What's a significant challenge you've overcome, and what did you learn from it?",
    "How do you stay resilient in the face of adversity?",
    "Can you share a moment when you turned a setback into an opportunity?",
    "What strategies do you use to cope with difficult situations?",
    "How have past challenges shaped your approach to new obstacles?"
  ],

  "achievements-and-milestones": [
    "What personal achievement are you most proud of, and why?",
    "How do you celebrate reaching a significant milestone?",
    "Can you share the journey towards a goal that was important to you?",
    "What motivates you to pursue your aspirations?",
    "How have your achievements impacted your perspective on success?"
  ],

  // Bucket 2: Personal Growth and Self-Reflection

  "personal-growth-and-self-discovery": [
    "What experiences have been most instrumental in your personal growth?",
    "How do you continue to learn about yourself over time?",
    "Can you share a moment of self-discovery that changed your outlook?",
    "What practices help you stay connected to your personal development?",
    "How has self-reflection influenced your life choices?"
  ],

  "mindfulness-and-reflection": [
    "How do you incorporate mindfulness into your daily routine?",
    "Can you describe a reflective practice that brings you peace?",
    "What role does meditation or quiet time play in your life?",
    "How has mindfulness affected your relationships with others?",
    "In what ways has reflection helped you navigate life's challenges?"
  ],

  "health-and-well-being": [
    "What does well-being mean to you personally?",
    "Can you share how you've prioritized your health over the years?",
    "What activities contribute most to your sense of wellness?",
    "How do you balance physical, mental, and emotional health?",
    "What advice would you give others seeking to improve their well-being?"
  ],

  "philosophy-and-lifes-big-questions": [
    "What personal philosophy guides your actions and decisions?",
    "How do you approach life's big questions about purpose and meaning?",
    "Can you share a belief that has evolved over time?",
    "What existential topics do you find yourself pondering?",
    "How do your philosophical views influence your daily life?"
  ],

  "education-and-learning": [
    "What role has education played in shaping who you are?",
    "Can you share a learning experience that had a profound impact on you?",
    "How do you pursue lifelong learning outside of formal education?",
    "What subjects or skills are you currently interested in exploring?",
    "How has teaching others contributed to your own understanding?"
  ],

  // Bucket 3: Career and Future Aspirations

  "career-and-professional-life": [
    "What inspired you to pursue your current career path?",
    "Can you describe a pivotal moment in your professional journey?",
    "How do you define success in your professional life?",
    "What challenges have you faced in your career, and how did you overcome them?",
    "How do you balance your career ambitions with personal life?"
  ],

  "future-aspirations": [
    "What are some goals you're excited to pursue in the future?",
    "How do you envision your life five or ten years from now?",
    "What steps are you taking today to achieve your long-term aspirations?",
    "Can you share a dream that you hope to make a reality?",
    "How do you stay motivated towards your future goals?"
  ],

  "technology-and-innovation": [
    "How has technology impacted your personal or professional life?",
    "What innovations excite you about the future?",
    "Can you share your thoughts on the role of technology in society?",
    "How do you adapt to rapid technological changes?",
    "What ethical considerations do you think are important in tech development?"
  ],

  // Bucket 4: Interests, Hobbies, and Passions

  "hobbies-and-passions": [
    "What activities are you most passionate about, and why?",
    "How did you discover your favorite hobby?",
    "Can you share how your hobbies enrich your life?",
    "What new interests are you looking forward to exploring?",
    "How do you make time for your passions amidst other responsibilities?"
  ],

  "arts-and-entertainment": [
    "What forms of art or entertainment resonate most with you?",
    "Can you describe a creative work that has significantly influenced you?",
    "How do the arts contribute to your understanding of the world?",
    "What role does creativity play in your daily life?",
    "Who are some artists or entertainers that inspire you, and why?"
  ],

  "travel-and-adventure": [
    "What travel experience has left a lasting impression on you?",
    "How does exploring new places impact your perspective?",
    "Can you share a memorable adventure you've had?",
    "What destinations are on your travel bucket list?",
    "How do you immerse yourself in the cultures you visit?"
  ],

  "nature-and-the-environment": [
    "What is your favorite way to connect with nature?",
    "How does the natural world inspire you?",
    "Can you share an experience where nature profoundly affected you?",
    "What environmental issues are you passionate about?",
    "How do you incorporate eco-friendly practices into your life?"
  ],

  // Bucket 5: Society, Culture, and Community

  "society-and-culture": [
    "How do you think cultural experiences shape individuals?",
    "Can you share an aspect of society you would like to see change?",
    "What cultural traditions do you find most meaningful?",
    "How do you engage with different cultures or communities?",
    "What societal issues are you most passionate about, and why?"
  ],

  "community-and-service": [
    "In what ways do you contribute to your community?",
    "Can you share a rewarding experience from volunteering or service?",
    "How has community involvement enriched your life?",
    "What causes are you most passionate about supporting?",
    "How do you inspire others to engage in community service?"
  ],

  // Bucket 6: Science and Exploration

  "space-and-astronomy": [
    "What fascinates you most about the universe?",
    "How do you think space exploration benefits humanity?",
    "Can you share your thoughts on the possibility of life beyond Earth?",
    "What cosmic phenomena intrigue you, and why?",
    "How do you stay informed about developments in astronomy?"
  ],

  "scientific-discoveries": [
    "Which scientific discovery do you find most exciting?",
    "How do you think recent scientific advances will impact our future?",
    "Can you share a scientific topic you're passionate about?",
    "What role does science play in your understanding of the world?",
    "How do you think we can inspire more interest in science among young people?"
  ],

  "ocean-and-deep-sea-exploration": [
    "What mysteries of the ocean captivate your imagination?",
    "How do you think deep-sea exploration can contribute to science?",
    "Can you share an interesting fact about marine life that fascinates you?",
    "What are your thoughts on the conservation of marine ecosystems?",
    "How would you describe the importance of the oceans to our planet?"
  ],

  "curiosity-about-the-natural-world": [
    "What aspects of the natural world spark your curiosity?",
    "How do you explore and learn about nature in your daily life?",
    "Can you share a recent discovery that excited you?",
    "What role does curiosity play in your personal growth?",
    "How do you encourage others to stay curious about the world?"
  ],

  // Bucket 7: Creativity and the Arts

  "visual-arts-and-design": [
    "What draws you to visual arts or design?",
    "Can you describe a piece of art that has moved you deeply?",
    "How do you express yourself creatively?",
    "What role do aesthetics play in your everyday life?",
    "How does visual art influence your perspective on society?"
  ],

  "music-and-performance-arts": [
    "What genres of music resonate most with you, and why?",
    "Can you share a live performance that left a lasting impact?",
    "How does music influence your emotions or mood?",
    "Do you play any instruments or participate in performance arts?",
    "How do you discover new music or artists?"
  ],

  "writing-and-literature": [
    "What books have significantly influenced your thinking?",
    "Can you share your experience with writing or storytelling?",
    "How does literature enrich your understanding of the world?",
    "Who are your favorite authors, and what do you admire about their work?",
    "What role does reading play in your daily routine?"
  ],

  "film-and-cinema": [
    "What films have had a profound impact on you?",
    "How do movies shape your views or inspire you?",
    "Can you share your thoughts on the power of cinema as an art form?",
    "What genres of film do you enjoy most, and why?",
    "How do you think storytelling in film differs from other mediums?"
  ],

  // Bucket 8: Spirituality and Inner Life

  "religion-and-spirituality": [
    "How does spirituality or religion influence your life?",
    "Can you share a spiritual practice that brings you peace?",
    "What questions do you explore in your spiritual journey?",
    "How do your beliefs shape your interactions with others?",
    "What role does faith play in overcoming challenges?"
  ],

  "meditation-and-mindfulness": [
    "How did you first become interested in meditation or mindfulness?",
    "Can you describe the impact these practices have had on you?",
    "What techniques do you find most effective for staying present?",
    "How do you integrate mindfulness into your everyday activities?",
    "What advice would you offer someone new to meditation?"
  ],

  "personal-values-and-ethics": [
    "What core values guide your decisions and actions?",
    "Can you share a time when your ethics were challenged?",
    "How do you navigate moral dilemmas in your life?",
    "What influences have shaped your sense of right and wrong?",
    "How do your values contribute to your sense of identity?"
  ],

  "search-for-purpose": [
    "What does finding purpose mean to you?",
    "Can you share experiences that have led you closer to your purpose?",
    "How do you pursue meaning in your daily life?",
    "What questions do you ask yourself when seeking direction?",
    "How do you help others find their own sense of purpose?"
  ],

  // Bucket 9: Health, Wellness, and Lifestyle

  "physical-fitness-and-nutrition": [
    "What role does physical fitness play in your life?",
    "Can you share your approach to maintaining a healthy diet?",
    "How do you stay motivated to keep active?",
    "What fitness goals are you currently working towards?",
    "How has your understanding of nutrition evolved over time?"
  ],

  "mental-health": [
    "How do you prioritize your mental health?",
    "Can you share strategies that help you cope with stress?",
    "What has been your journey with mental well-being?",
    "How do you support others in their mental health journeys?",
    "What practices contribute to your emotional resilience?"
  ],

  "lifestyle-choices": [
    "What lifestyle choices have you made to enhance your quality of life?",
    "Can you describe a significant change you've made in how you live?",
    "How do you balance work, leisure, and rest?",
    "What daily habits contribute most to your happiness?",
    "How do your values influence your lifestyle decisions?"
  ],

  "wellness-practices": [
    "What wellness routines do you incorporate into your life?",
    "Can you share a self-care practice that you find essential?",
    "How do you stay mindful of your overall well-being?",
    "What role does sleep and rest play in your wellness?",
    "How do you adapt your wellness practices when life gets busy?"
  ],

  // Bucket 10: Environmental Awareness and Sustainability

  "climate-change-and-conservation": [
    "What are your thoughts on the current state of our environment?",
    "How do you contribute to efforts against climate change?",
    "Can you share an experience that heightened your environmental awareness?",
    "What conservation issues are you most passionate about?",
    "How do you stay informed about environmental challenges?"
  ],

  "sustainable-living": [
    "What steps have you taken towards a more sustainable lifestyle?",
    "Can you share tips for others looking to reduce their environmental impact?",
    "How do you overcome challenges in living sustainably?",
    "What motivates you to prioritize sustainability in your daily life?",
    "How do you inspire others to adopt eco-friendly habits?"
  ],

  "connection-with-nature": [
    "How does spending time in nature affect you?",
    "Can you describe a natural setting that brings you peace?",
    "What outdoor activities do you enjoy most?",
    "How do you incorporate nature into your routine?",
    "What lessons have you learned from the natural world?"
  ],

  "environmental-activism": [
    "What drives your involvement in environmental activism?",
    "Can you share a success story from your activism efforts?",
    "How do you engage others in environmental causes?",
    "What challenges have you faced as an activist?",
    "How do you envision the future of environmental advocacy?"
  ],

  // Bucket 11: Innovation and Future Trends

  "artificial-intelligence-and-robotics": [
    "What are your thoughts on the impact of AI on society?",
    "How do you see robotics changing our daily lives?",
    "Can you share an exciting development in AI that interests you?",
    "What ethical considerations do you think are important in AI advancement?",
    "How do you think AI will shape the future of work?"
  ],

  "future-of-work": [
    "How do you anticipate the workplace evolving in the coming years?",
    "What skills do you believe will be most valuable in the future?",
    "Can you share your thoughts on remote work and its effects?",
    "How do you prepare for changes in your professional field?",
    "What trends do you see influencing career paths moving forward?"
  ],

  "emerging-technologies": [
    "Which emerging technology do you find most fascinating?",
    "How do you think new technologies will solve current global issues?",
    "Can you share how you've integrated new tech into your life?",
    "What potential challenges do you foresee with rapid tech advancement?",
    "How do you stay updated on technological innovations?"
  ],

  "space-exploration-and-colonization": [
    "What excites you about the prospect of space colonization?",
    "How do you think humanity can benefit from exploring other planets?",
    "Can you share your thoughts on commercial space travel?",
    "What challenges do you think we must overcome for interplanetary life?",
    "How does space exploration inspire you personally?"
  ],

  // Bucket 12: Humor and Light-hearted Conversations

  "funny-personal-stories": [
    "Can you share a humorous story from your life that still makes you laugh?",
    "What's the most embarrassing moment you've experienced that you're willing to talk about?",
    "How do you incorporate humor into your daily routine?",
    "What role does laughter play in your relationships?",
    "Do you have a favorite joke or funny anecdote you'd like to share?"
  ],

  "comedy-and-stand-up": [
    "Who are your favorite comedians, and what do you enjoy about their style?",
    "Have you ever tried stand-up comedy or thought about it?",
    "How does comedy influence your perspective on serious topics?",
    "Can you share a comedic performance that left a lasting impression?",
    "What do you think makes something universally funny?"
  ],

  "jokes-and-riddles": [
    "Do you have a go-to joke that always gets a laugh?",
    "How do you feel about puns and wordplay?",
    "Can you share a riddle that stumped you or others?",
    "What types of humor do you appreciate the most?",
    "How does solving riddles or puzzles engage your mind?"
  ],

  "light-hearted-debates": [
    "What's your take on the classic debate: pineapple on pizza, yay or nay?",
    "If you could have any superpower, what would it be and why?",
    "Which fictional world would you love to live in?",
    "Do you prefer dogs or cats, and what's your reasoning?",
    "If you could only eat one food for the rest of your life, what would it be?"
  ],

  // Bucket 13: Pets and Animal Companionship

  "pet-stories": [
    "Can you share a memorable story about a pet you've had?",
    "How have animals enriched your life?",
    "What lessons have you learned from your pets?",
    "How do you bond with your animal companions?",
    "What role do pets play in your family dynamics?"
  ],

  "animal-behavior": [
    "What fascinates you about animal behavior?",
    "Can you share an interesting fact about a specific animal?",
    "How do you interpret the ways animals communicate with us?",
    "What animal behaviors have you observed that surprised you?",
    "How do you think we can better understand our animal friends?"
  ],

  "wildlife-and-conservation": [
    "What wildlife conservation efforts are you passionate about?",
    "How do you think individuals can help protect endangered species?",
    "Can you share an experience where you encountered wildlife up close?",
    "What impact do you believe humans have on animal habitats?",
    "How do you stay informed about conservation initiatives?"
  ],

  "therapy-and-service-animals": [
    "What are your thoughts on the role of therapy animals in healthcare?",
    "Can you share a story about an interaction with a service animal?",
    "How do you think animals contribute to emotional healing?",
    "What benefits do you see in using animals for therapeutic purposes?",
    "How can society better support the work of service animals and their handlers?"
  ],

  // Bucket 14: Culinary Arts and Food Experiences

  "favorite-dishes-and-recipes": [
    "If you could only eat one cuisine for the rest of your life, what would it be?",
    "Can you share the recipe of a dish that's special to you?",
    "What meal brings back fond memories, and why?",
    "How did you learn to cook, and who influenced your culinary skills?",
    "What new foods are you excited to try?"
  ],

  "culinary-traditions": [
    "What food traditions does your family have?",
    "How do cultural cuisines influence your cooking or eating habits?",
    "Can you share a holiday dish that you look forward to each year?",
    "What role does food play in your celebrations?",
    "How have you incorporated international dishes into your meals?"
  ],

  "restaurant-experiences": [
    "What's the most memorable restaurant you've ever visited?",
    "How do you choose new places to dine out?",
    "Can you share a story about an unexpected dining experience?",
    "What do you appreciate most when eating at a restaurant?",
    "How has a dining experience changed your perspective on food?"
  ],

  "cooking-and-baking": [
    "What do you enjoy more, cooking or baking, and why?",
    "Can you share a kitchen success or disaster story?",
    "How do you experiment with new recipes or ingredients?",
    "What does the process of preparing food mean to you?",
    "How do you involve others in your cooking or baking activities?"
  ],

  // Bucket 15: Language and Communication

  "learning-new-languages": [
    "What languages have you learned, and what motivated you?",
    "Can you share an experience where knowing another language enriched your life?",
    "How do you approach the challenge of learning a new language?",
    "What cultural insights have you gained through language study?",
    "How do you practice and maintain your language skills?"
  ],

  "communication-styles": [
    "How would you describe your communication style?",
    "Can you share a time when effective communication made a difference?",
    "What do you find most challenging about communicating with others?",
    "How do you adapt your communication in different settings?",
    "What role does listening play in your interactions?"
  ],

  "slang-and-colloquialisms": [
    "What are some local phrases or slang terms you enjoy using?",
    "How does slang reflect cultural identity?",
    "Can you share a funny misunderstanding caused by slang or idioms?",
    "What new expressions have you learned recently?",
    "How do colloquialisms add flavor to language?"
  ],

  "literature-and-poetry": [
    "What literary works have left a lasting impact on you?",
    "Can you share a poem that resonates with you, and why?",
    "How does reading influence your worldview?",
    "What themes do you look for in literature?",
    "How do you incorporate writing or reading into your daily life?"
  ],

  // New "general" subtopic for sample topics that don't fit elsewhere
  "general": [
    "If you could have dinner with any historical figure or celebrity, who would it be and why?",
    "What's your go-to comfort food, and why do you love it?",
    "What's the funniest or most embarrassing thing that has happened to you recently?",
    "If you could live anywhere in the world for a year, where would it be?",
    "What's a quirky or unusual hobby you have that people might not know about?",
    "What's a movie, book, or show you can watch or read over and over again without getting tired of it?",
    "What's a skill or talent you've always wanted to learn but haven't had the chance yet?",
    "If you could instantly master any language, which one would it be and why?",
    "What's a fictional world you'd love to visit, and what would you do there?",
    "If you were an animal, which one do you think best represents your personality?",    
    "What's the best prank you've ever pulled or been a part of?",
    "If you had a time machine, would you visit the past or the future, and why?",
    "What's a song or artist that instantly puts you in a good mood?",
    "If you could have any superpower, what would it be and how would you use it?",
    "What's your favorite holiday tradition or seasonal activity?",
    "If you could swap lives with anyone for a day, who would it be and what would you do?",
    "What's the most spontaneous thing you've ever done?",
    "What's your favorite way to relax and unwind after a long day?",
    "If you had to eat only one type of cuisine for the rest of your life, what would it be?",
    "What's a fun fact about you that surprises people when they hear it?"
  ]
};

export const topicPlaceholders = [
  // Personal Reflections
  "Share a childhood memory that makes you smile",
  "Tell me about a dream that stayed with you",
  "Describe a place that feels like home",
  "Talk about a moment that changed you",
  "Share a family tradition you cherish",
  
  // Growth & Learning
  "What's a lesson life taught you recently",
  "Tell me about a challenge you overcame",
  "Share a skill you're proud of learning",
  "Describe a mistake that helped you grow",
  "Talk about someone who inspired you",
  
  // Passions & Interests
  "What's a hobby that brings you joy",
  "Share a creative project you're working on",
  "Tell me about a book that moved you",
  "Describe your perfect weekend",
  "What's a cause you care deeply about",
  
  // Relationships & Connections
  "Share a friendship that shaped you",
  "Tell me about a mentor who guided you",
  "Describe a conversation you'll never forget",
  "Talk about a random act of kindness",
  "Share a moment of connection with a stranger",
  
  // Dreams & Aspirations
  "What's a dream you're working towards",
  "Share a goal that excites you",
  "Tell me about your ideal future",
  "Describe something you want to learn",
  "What change do you wish to see in the world",
  
  // Culture & Identity
  "Share a tradition that defines you",
  "Tell me about your cultural heritage",
  "Describe a festival you love celebrating",
  "Talk about food that reminds you of home",
  "Share a custom unique to your family",
  
  // Adventures & Experiences
  "Tell me about an unexpected adventure",
  "Share a travel story that changed you",
  "Describe a moment of pure joy",
  "Talk about a risk that paid off",
  "Share an experience that humbled you",
  
  // Creativity & Expression
  "What art form speaks to your soul",
  "Share a song that moves you",
  "Tell me about your creative process",
  "Describe what inspires you",
  "Talk about how you express yourself",
  
  // Wisdom & Philosophy
  "Share a belief that guides you",
  "Tell me about your life philosophy",
  "What questions keep you up at night",
  "Describe a truth you've discovered",
  "Talk about what gives you peace",
  
  // Future & Hope
  "Share a hope for tomorrow",
  "Tell me about the change you wish to make",
  "Describe your vision for the future",
  "What legacy do you want to leave",
  "Talk about what makes you optimistic"
];
