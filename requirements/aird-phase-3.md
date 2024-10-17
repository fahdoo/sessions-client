# AI Requirements Doc (AIRD) - Phase 3 - Agent Memory Enhancement

## 1. Overview

This phase aims to implement a memory system for the AI interviewer, enabling it to reference past conversations and leverage both structured and unstructured data. The goal is to quickly validate the concept and improve the experience for early users by making conversations more contextual and personalized.

## 2. Comparison of Memory Approaches

| Approach | Pros | Cons | Use Case | Implementation Complexity |
|----------|------|------|----------|---------------------------|
| Structured (Relational DB) | - Easy to query<br>- Efficient for known data types | - Rigid schema<br>- Limited for unstructured data | Storing user profile info (name, location, etc.) | Low |
| Unstructured (Vector DB) | - Flexible for varied data<br>- Semantic search capabilities | - Complex querying<br>- Potentially slower for exact matches | Storing conversation snippets, user stories | Medium |
| Graph DB | - Efficient for relationship queries<br>- Flexible schema | - Steep learning curve<br>- Overkill for simple data | Modeling complex relationships between entities | High |
| RAG (Retrieval-Augmented Generation) | - Combines benefits of retrieval and generation<br>- Can use existing knowledge bases | - Requires careful prompt engineering<br>- Can be computationally expensive | Enhancing AI responses with relevant retrieved info | Medium-High |

For our MVP, we'll focus on a combination of structured (Supabase) and unstructured (Vector DB) approaches to balance quick implementation with flexibility.

## 3. Implementation Plan

### Milestone 1: Basic Memory Integration (2 weeks) [TODO]

#### 1.1 Enhance User Profile Storage [TODO]

Location: sessions-client (Supabase)

1. [AI] Design a flexible schema for user profiles:
   ```sql
   ALTER TABLE public.users
   ADD COLUMN profile JSONB DEFAULT '{}'::JSONB;
   ```
   This allows storing arbitrary key-value pairs for user information.

2. [AI] Implement API endpoints for updating user profiles:
   - POST /api/users/profile to update profile
   - GET /api/users/profile to retrieve profile

3. [AI] Update the client-side user settings page to allow users to input profile information (e.g., hometown, hobbies, interests).

4. [HUMAN] Review and approve the user profile schema and API design.

#### 1.2 Implement Basic Entity Extraction [TODO]

Location: New repo: sessions-memory-service

Entity extraction involves identifying and categorizing key information (e.g., locations, hobbies, people) from unstructured text. This helps in structuring conversation data for easier retrieval and use.

1. [AI] Set up a new Node.js service (sessions-memory-service) for processing transcripts and managing memory.

2. [AI] Implement entity extraction using OpenAI's API:
   - Create a function that takes a transcript as input
   - Use OpenAI's API to identify entities (e.g., "Extract key entities such as locations, hobbies, and people mentioned in this text")
   - Return a structured list of entities

3. [AI] Implement an API endpoint in sessions-memory-service to accept transcripts and return extracted entities.

4. [HUMAN] Review the entity extraction implementation and results.

#### 1.3 Set Up Vector Search for Conversation Retrieval [TODO]

Location: sessions-memory-service

1. [AI] Integrate Pinecone for vector storage:
   - Set up a Pinecone account and create an index
   - Implement functions to convert text to embeddings using OpenAI's API
   - Create functions to store and retrieve vectors from Pinecone

2. [AI] Implement an API in sessions-memory-service to store conversation snippets:
   - POST /api/memory/store to save a conversation snippet
   - GET /api/memory/retrieve to fetch relevant snippets based on a query

3. [AI] Update the sessions-client to call these APIs after each session ends.

4. [HUMAN] Test the vector search functionality with sample conversations.

#### 1.4 Basic Memory Integration at Session Start [TODO]

Location: sessions-agent-python

1. [AI] Implement a simple memory retrieval function:
   - Fetch basic user profile data from Supabase
   - Retrieve the most recent conversation snippet from Pinecone

2. [AI] Update the LiveKit Agent initialization process:
   - Before starting a session, call the memory retrieval function
   - Construct a basic memory context string

3. [AI] Update the system prompt to include the basic memory context:
   ```python
   memory_context = fetch_basic_memory(user_id)
   system_prompt = f"""
   You are an AI interviewer. Here's some basic information about the user:
   {memory_context}
   
   Use this to personalize the conversation, but don't explicitly state these facts.
   """
   ```

4. [AI] Implement basic error handling for memory retrieval failures.

5. [HUMAN] Review and test the basic memory integration in a sample conversation.

### Milestone 2: Memory Enhancement and Offline Processing (2-3 weeks) [TODO]

#### 2.1 Implement Offline Transcript Processing [TODO]

Location: sessions-memory-service

1. [AI] Create a job queue system (e.g., using Bull) for processing transcripts after sessions end.

2. [AI] Implement a worker that:
   - Extracts entities from the full transcript
   - Generates embeddings for important parts of the conversation
   - Stores structured data in Supabase and vector data in Pinecone

3. [AI] Update the sessions-client to trigger this processing job after each session.

4. [HUMAN] Monitor and optimize the offline processing system.

#### 2.2 Enhance Semantic Search Capabilities [TODO]

Location: sessions-memory-service

1. [AI] Implement more sophisticated relevance scoring for retrieved memories:
   - Consider factors like recency, importance, and relevance to the current context
   - Use OpenAI's API to generate a relevance score for each retrieved snippet

2. [AI] Create an API endpoint for fetching the most relevant memories given a context:
   - GET /api/memory/relevant that takes a context string and returns scored, relevant memories

3. [HUMAN] Test and refine the relevance scoring system.

#### 2.3 Advanced Memory Warmup for Conversation Start [TODO]

Location: sessions-agent-python

1. [AI] Implement an advanced memory retrieval function:
   - Fetch comprehensive user profile data from Supabase
   - Retrieve multiple relevant conversation snippets from Pinecone based on session context
   - Use the enhanced semantic search capabilities developed in 2.2 to score and rank memories

2. [AI] Develop a memory summarization function:
   - Use OpenAI's API to generate a concise summary of the retrieved memories
   - Highlight key points and potential conversation topics

3. [AI] Update the LiveKit Agent initialization process:
   - Before starting a session, call the advanced memory retrieval and summarization functions
   - Construct a detailed "memory warmup" string

4. [AI] Enhance the initial prompt with the advanced memory warmup:
   ```python
   memory_warmup = fetch_advanced_memory_warmup(user_id, session_context)
   initial_prompt = f"""
   You are about to start an interview session. Here's a summary of relevant information about the user and past conversations:
   {memory_warmup}
   
   Use this to inform your initial questions and conversation direction. Be subtle in your use of this information - don't explicitly restate facts, but use them to guide the conversation naturally.
   
   Potential conversation starters based on this context:
   1. [AI-generated conversation starter]
   2. [AI-generated conversation starter]
   3. [AI-generated conversation starter]
   """
   ```

5. [AI] Implement advanced error handling and fallback mechanisms for cases where memory retrieval or summarization fails.

6. [HUMAN] Conduct thorough testing of the advanced memory warmup:
   - Compare conversations with basic (1.4) and advanced (2.3) memory integration
   - Assess the naturalness and depth of the AI's use of past information

### Milestone 3: User Controls and Privacy (1-2 weeks) [TODO]

#### 3.1 Implement User Memory Management [TODO]

Location: sessions-client

1. [AI] Create a "My Data" page in the web app where users can:
   - View their stored profile information
   - See a summary of what the AI remembers about them
   - Edit or delete specific memories

2. [AI] Implement API endpoints in sessions-memory-service for:
   - Fetching a user's memory summary
   - Updating or deleting specific memories

3. [AI] Implement privacy controls allowing users to opt-out of long-term memory storage.

4. [HUMAN] Review the user interface and privacy controls.

## 4. MVP Features Checklist

- [ ] Enhanced user profile storage in Supabase
- [ ] Basic entity extraction from transcripts
- [ ] Vector search for conversation snippet retrieval
- [ ] Memory integration at conversation start
- [ ] Offline transcript processing for memory updates
- [ ] Enhanced semantic search for memory retrieval
- [ ] Memory warmup for conversation initialization
- [ ] User controls for viewing and managing their stored memories

## 5. Testing Strategy

- Implement unit tests for individual memory components
- Conduct integration tests to ensure proper interaction between memory systems and AI interviewer
- Perform end-to-end testing of entire conversation flows with memory enhancement
- Test edge cases, such as handling very long conversations or users with extensive history
- Conduct user acceptance testing to gather feedback on the enhanced conversation experience
- Implement stress tests to verify system performance under high load
- Develop tests for various network conditions to ensure robust performance of the LiveKit integration
- Create automated tests for version compatibility between client and agent components
- Implement A/B testing to compare conversations with and without memory enhancement
- Conduct user surveys to gather feedback on the perceived improvement in conversation quality

## 6. Deployment

- Deploy memory enhancements incrementally, starting with basic context awareness
- Monitor system performance and user feedback closely after each deployment
- Prepare rollback plans in case of unexpected issues
- Gradually introduce more advanced features like personalization and memory consolidation
- Utilize Fly.io's blue-green deployment capabilities for zero-downtime updates

## 7. Post-MVP Considerations

1. Implement a graph database for more complex relationship modeling
   - Possibility: Use Neo4j or Amazon Neptune to create a rich network of interconnected entities (people, places, events, topics) from user conversations. This could enable more nuanced understanding of relationships, such as "User A and User B both visited Paris and enjoy impressionist art."
   - Benefit: Allows for complex queries like "Find all users who have similar travel experiences to User X" or "Identify common interests among users who have talked about climate change."

2. Develop more advanced memory summarization and decay mechanisms
   - Possibility: Implement an AI-driven system that periodically reviews and condenses stored memories, keeping the most relevant information while gradually fading out less important details.
   - Benefit: Maintains a more manageable and relevant memory store over time, mimicking human memory processes and preventing information overload.

3. Enable deeper RAG integration for mid-conversation memory queries
   - Possibility: Implement real-time retrieval and integration of relevant information from the memory store during ongoing conversations, allowing the AI to dynamically adjust its responses based on newly recalled information.
   - Benefit: Creates more natural, context-aware conversations that can smoothly incorporate past experiences and knowledge.

4. Implement real-time memory updates during conversations
   - Possibility: Develop a system that can identify and store new important information shared by the user during a conversation, updating the memory store in real-time.
   - Benefit: Ensures that the AI's knowledge about the user is always up-to-date, allowing for immediate use of newly learned information.

5. Explore multi-modal memory incorporation (e.g., image or audio-based memories)
   - Possibility: Extend the memory system to store and retrieve not just text, but also images, audio clips, or even video snippets shared by users.
   - Benefit: Enables richer, more diverse conversations that can reference visual or auditory experiences, enhancing the depth and personal nature of interactions.

6. Develop collaborative memory sharing between multiple AI agents
   - Possibility: Create a system where multiple AI agents can share and access a common memory pool, allowing for more diverse and informed conversations.
   - Benefit: Enables scenarios where users can interact with different AI personalities that all have access to shared knowledge, creating a more cohesive and varied experience.

7. Implement more advanced error handling and recovery mechanisms for LiveKit connections
   - Possibility: Develop sophisticated error detection, logging, and recovery systems that can handle various network issues, service interruptions, or unexpected AI behaviors.
   - Benefit: Improves the overall reliability and user experience of the system, ensuring smooth conversations even in less-than-ideal conditions.

8. Optimize resource usage for very long-running conversations
   - Possibility: Implement adaptive memory management techniques that can efficiently handle hours-long conversations without degrading performance or exceeding resource limits.
   - Benefit: Allows for extended, in-depth conversations that can span multiple topics while maintaining context and relevance throughout.

9. Implement advanced privacy and ethical considerations
   - Possibility: Develop granular privacy controls, allowing users to specify exactly what information can be remembered and used. Implement ethical guidelines for AI behavior based on stored memories.
   - Benefit: Enhances user trust and control over their data, while ensuring that the AI's use of personal information remains within acceptable ethical boundaries.

10. Develop a memory-based personality evolution system
    - Possibility: Create a system where the AI's personality subtly evolves based on its interactions and memories with users over time, developing unique traits and interests.
    - Benefit: Provides a more engaging, dynamic interaction experience where users can build a truly unique relationship with their AI interviewer over multiple sessions.

## 8. Relevant Documentation

- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Pinecone Documentation](https://www.pinecone.io/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Algolia Documentation](https://www.algolia.com/doc/)
- [Supabase Documentation](https://supabase.com/docs)
- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit Agents Documentation](https://uithub.com/livekit/agents)
- [Fly.io Documentation](https://fly.io/docs/)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [AWS Neptune Documentation](https://docs.aws.amazon.com/neptune/)
- [Weaviate Documentation](https://weaviate.io/developers/weaviate)
