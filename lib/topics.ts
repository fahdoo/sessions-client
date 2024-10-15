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
    "Has spirituality or religion played a role in your life? If so, how?"
  ];  

export function getRandomTopic() {
  return sampleTopics[Math.floor(Math.random() * sampleTopics.length)];
}
