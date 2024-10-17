# AI Requirements Doc (AIRD) - Phase 3 - Agent Memory Enhancement

This document provides instructions for improving and enhancing the agent memory in the Sessions app, based on the PRD in memory_design.md and considering the existing LiveKit Agents implementation.

## 1. Overview

The goal of this phase is to implement a sophisticated memory system for the AI interviewer, enabling it to reference past conversations and leverage both structured and unstructured data. This will allow for more contextual, personalized, and engaging conversations, improving user experience by making the AI interviewer more responsive to the user's history and preferences.

## 2. Implementation Plan

### Milestone 1: Short-term MVP (2 weeks) [TODO]

1. Implement basic structured memory using Supabase: [AI]
   - Extend the existing users table to include fields for basic user information (e.g., hometown, hobbies)
   - Create methods for storing and retrieving this structured data

2. Implement basic entity extraction for structured data: [AI]
   - Integrate with OpenAI's API or spaCy for entity extraction
   - Focus on extracting key information like hometown and hobbies

3. Set up vector search for past conversation retrieval: [AI]
   - Integrate Pinecone or a similar vector database
   - Implement basic embedding generation for conversation snippets
   - Create methods for storing and retrieving conversation embeddings

4. Integrate memory retrieval at session setup: [AI]
   - Modify the AI interviewer to fetch relevant structured and unstructured data at the start of each session

5. Review and test the short-term MVP implementation: [HUMAN]

### Milestone 2: Full Structured and Unstructured Memory Integration (1-2 months) [TODO]

1. Implement graph database for structured memory: [AI]
   - Set up Neo4j or AWS Neptune for storing structured user data
   - Create methods for querying and updating the graph database

2. Enhance unstructured memory retrieval: [AI]
   - Implement more sophisticated semantic search capabilities
   - Develop algorithms for relevance scoring of past conversations

3. Enable real-time memory updates during conversations: [AI]
   - Implement methods to capture and store new user information mid-session
   - Update both structured (graph database) and unstructured (vector database) in real-time

4. Integrate memory retrieval during ongoing conversations: [AI]
   - Implement real-time querying of both structured and unstructured memory
   - Enhance the AI's responses with dynamically retrieved information

5. Review and test the full memory integration: [HUMAN]

### Milestone 3: Advanced Features (3-6 months) [TODO]

1. Implement memory summarization and decay: [AI]
   - Develop algorithms to identify and summarize less relevant or outdated information
   - Implement a system to gradually reduce the impact of older memories

2. Enable deeper RAG integration for mid-conversation memory queries: [AI]
   - Implement more sophisticated retrieval-augmented generation techniques
   - Enhance the AI's ability to seamlessly incorporate retrieved information into responses

3. Fully automate real-time memory updates: [AI]
   - Refine the system's ability to capture and store new information without disrupting the conversation flow
   - Implement advanced entity extraction and relationship mapping in real-time

4. Implement user controls for memory management: [AI]
   - Create interfaces for users to view, edit, and delete their stored information
   - Implement privacy controls and data management features

5. Conduct thorough testing of advanced features: [HUMAN]

### Milestone 4: LiveKit Agents Integration [TODO]

1. Update the existing LiveKit integration to use the latest LiveKit Agents framework: [AI]
   - Refactor the current implementation to align with the MultimodalAgent class structure
   - Ensure compatibility with the latest LiveKit SDK versions

2. Implement real-time processing for memory updates: [AI]
   - Modify the agent to continuously update short-term memory during conversations
   - Implement mechanisms to transfer relevant information to long-term memory in real-time

3. Enhance the system prompt to include memory-related instructions: [AI]
   - Update the prompt file (e.g., `prompts/muse_v2.md`) to guide the AI in using and updating memory

4. Implement error handling and recovery mechanisms for LiveKit connections: [AI]
   - Develop strategies to handle disconnections and reconnections gracefully
   - Ensure memory persistence across connection interruptions

5. Optimize resource usage for long-running conversations: [AI]
   - Implement efficient memory management techniques to prevent resource exhaustion
   - Develop strategies for handling extended conversation sessions

6. Review and test the LiveKit Agents integration: [HUMAN]

## 3. Existing Services to Consider

1. LiveKit Server: Leverage the existing LiveKit infrastructure for real-time communication.
2. Fly.io: Continue using Fly.io for agent deployment, taking advantage of its scalability and blue-green deployment capabilities.
3. OpenAI's GPT-4 API: Integrate with the `openai.realtime.RealtimeModel` for enhanced real-time speech-to-speech conversations and memory processing.
4. Pinecone or Weaviate: Vector databases for efficient storage and retrieval of semantic information, useful for implementing the unstructured memory system.
5. Neo4j or AWS Neptune: Graph databases for storing and querying structured user data and relationships.
6. Supabase: Continue using Supabase for initial structured data storage and as a bridge to more advanced database solutions.

## 4. MVP Features Checklist

- [ ] Basic structured memory storage (hometown, hobbies, etc.)
- [ ] Simple entity extraction for structured data
- [ ] Vector search for past conversation retrieval
- [ ] Memory retrieval at session setup
- [ ] Real-time memory updates during conversations
- [ ] Graph database integration for structured memory
- [ ] Enhanced semantic search for unstructured memory
- [ ] Memory summarization and decay mechanisms
- [ ] User controls for memory management
- [ ] Integration with existing AI interviewer and LiveKit Agents

## 5. Testing Strategy

- Implement unit tests for individual memory components
- Conduct integration tests to ensure proper interaction between memory systems and AI interviewer
- Perform end-to-end testing of entire conversation flows with memory enhancement
- Test edge cases, such as handling very long conversations or users with extensive history
- Conduct user acceptance testing to gather feedback on the enhanced conversation experience
- Implement stress tests to verify system performance under high load
- Develop tests for various network conditions to ensure robust performance of the LiveKit integration
- Create automated tests for version compatibility between client and agent components

## 6. Deployment

- Deploy memory enhancements incrementally, starting with basic context awareness
- Monitor system performance and user feedback closely after each deployment
- Prepare rollback plans in case of unexpected issues
- Gradually introduce more advanced features like personalization and memory consolidation
- Utilize Fly.io's blue-green deployment capabilities for zero-downtime updates

## 7. Cross-Component Compatibility

1. Ensure compatibility between the sessions-client and sessions-agent-python repos: [AI]
   - Align SDK versions and communication protocols
   - Implement version checking and graceful degradation if needed

2. Develop a testing suite for end-to-end compatibility: [AI]
   - Create automated tests that verify the interaction between the client and agent
   - Implement integration tests that cover memory-related features

3. Document the communication interface between the client and agent: [AI]
   - Clearly define the expected inputs and outputs for memory-related operations
   - Provide examples of how memory updates should be handled on both sides

4. Review and approve the cross-component compatibility measures: [HUMAN]

## 8. Post-MVP Considerations

1. Advanced natural language understanding for better context extraction
2. Multi-modal memory incorporation (e.g., image or audio-based memories)
3. Emotional intelligence and sentiment analysis integration
4. Collaborative memory sharing between multiple AI agents
5. User-initiated memory editing and deletion features
6. Integration with external knowledge bases for enhanced conversation depth
7. Explore advanced LiveKit Agents features for enhanced multimodal interactions (e.g., video processing, screen sharing)

## 9. Relevant Documentation

- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Pinecone Documentation](https://www.pinecone.io/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Algolia Documentation](https://www.algolia.com/doc/)
- [Supabase Documentation](https://supabase.com/docs)
- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit Agents Documentation](https://github.com/livekit/agents)
- [Fly.io Documentation](https://fly.io/docs/)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [AWS Neptune Documentation](https://docs.aws.amazon.com/neptune/)
- [Weaviate Documentation](https://weaviate.io/developers/weaviate)
