export const sampleTopics = [
    "What memories from your childhood have stayed with you the most?",
    "Can you walk me through some of the key moments in your career and the lessons you've learned along the way?",
    "Who are the people that have had the biggest influence on you, and how did they shape your journey?",
    "How have you grown or discovered new things about yourself over the years?",
    "What challenges have you faced, and how did you manage to overcome them?",
    "If you had to point to defining moments in your life, what would they be?",
    "What are some of your hopes and dreams for the future?",
    "Have you had any cultural experiences that left a lasting impact on you?",
    "Can you share a decision you've made that changed the course of your life?",
    "What are some of the key lessons you'd like to pass on to others?",
    "What role has education played in shaping who you are?",
    "How has your mental health journey unfolded, and what have you learned about well-being along the way?",
    "What have you discovered about your family history or heritage that stands out to you?",
    "How has technology impacted both your personal and professional life?",
    "What adventures or travels have left the biggest impression on you?",
    "How have you built and maintained friendships over the years, and how have those relationships evolved?",
    "In what ways have your values and beliefs changed over time?",
    "How have you navigated major life transitions, and what did you learn from them?",
    "What is your relationship with money like, and how do you make financial decisions?",
    "How has media or pop culture influenced your view of the world?",
    "What creative outlets or artistic expressions are important to you?",
    "Has spirituality or religion played a role in your life? If so, how?",
    
    // Lighthearted topics
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
  ];
  

export function getRandomTopic() {
  return sampleTopics[Math.floor(Math.random() * sampleTopics.length)];
}
