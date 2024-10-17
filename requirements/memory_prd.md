### **Product Requirements Document (PRD) – AI Interviewer Memory System**

**Project Name:**  
AI Interviewer Memory Enhancement

**Objective:**  
Enable the AI interviewer to reference and leverage past conversations with users to deliver personalized, context-aware interactions by implementing a structured and unstructured memory system.

---

### **1. Problem Statement**

Currently, the AI interviewer engages with users without any continuity across sessions, meaning it cannot recall previous conversations or user-specific details. This lack of memory leads to generic interactions and requires users to repeat information, reducing engagement and user satisfaction.

The goal is to enable the AI interviewer to:
- **Reference past conversations** by accessing stored knowledge about users.
- **Leverage both structured factual data** (e.g., hometown, hobbies) and **unstructured narrative insights** (e.g., stories, preferences).
- **Retrieve relevant information** at both **setup time** and **during ongoing conversations**.

---

### **2. Key Features and Scope**

#### **Structured Memory (Graph Database)**
- **Description:** Store and manage user-specific factual data (e.g., locations, professions, hobbies, admired people) in a structured format that can be queried efficiently.
- **Technology:** Graph database (e.g., **Neo4j** or **AWS Neptune**).
- **Example Data:**
  - User lives in Boston, enjoys hiking, and admires Steve Jobs.
- **Functionality:**
  - Retrieve factual data when the session starts and integrate it into the AI's initial context.
  - Query structured data (nodes and relationships) for direct references during conversations.

#### **Unstructured Memory (Vector Search Database)**
- **Description:** Capture, store, and retrieve past conversations or narratives as embeddings, allowing the AI to recall semantically related conversations during future interactions.
- **Technology:** Vector search engine (e.g., **Pinecone**, **Weaviate**, or **FAISS**).
- **Functionality:**
  - Convert conversation snippets into embeddings using OpenAI’s API or Sentence-BERT.
  - Perform semantic searches during new sessions or in real-time during conversations to recall relevant past conversations.
  - Retrieve narratives based on the meaning rather than exact wording (e.g., "I love hiking" vs. "I enjoy nature walks").

#### **Real-time Memory Updates**
- **Description:** Dynamically update memory (both structured and unstructured) as the conversation evolves. For example, if a user shares new details, this data should be added to their memory profile without interrupting the ongoing session.
- **Functionality:**
  - Capture new user inputs mid-session and update graph database (structured) and vector database (unstructured) in real time.

#### **Memory Decay and Summarization**
- **Description:** Implement a system to manage memory growth by summarizing or decaying old, less relevant information. This will prevent the system from becoming overloaded with unnecessary data.
- **Technology:** Summarization models (e.g., GPT-3) to periodically condense older sessions into shorter summaries.
- **Functionality:**
  - Regularly compress older, irrelevant memory data while keeping key facts and important narratives.

---

### **3. User Stories**

1. **As a user**, I want the AI interviewer to remember key details about me from past sessions, so I don’t have to repeat myself in future interactions.
2. **As a user**, I expect the AI to reference specific hobbies or experiences I’ve shared in past conversations, making the interaction more personal and engaging.
3. **As a developer**, I want to store user data in both structured and unstructured forms so the AI can recall facts (like where the user lives) and stories (like their favorite hiking trip).
4. **As a developer**, I want to ensure the AI can update its memory during conversations in real-time, capturing new user information without disruption.

---

### **4. Functional Requirements**

1. **Structured Memory:**
   - Store factual data (location, profession, hobbies, etc.) using a graph database.
   - Fetch structured data at session startup to personalize the AI’s opening questions.
   - Update facts in real-time during conversations.
  
2. **Unstructured Memory:**
   - Store full conversation embeddings in a vector search engine.
   - Fetch past conversation snippets using semantic search at session startup and during the conversation (if relevant topics arise).
  
3. **Memory Retrieval:**
   - Pre-session: At the beginning of a session, retrieve both structured facts and relevant unstructured conversation snippets to enrich the AI's responses.
   - In-session: Use real-time vector search to pull up relevant past narratives during the conversation based on user input.

4. **Memory Update:**
   - Automatically update both the graph database and the vector database with new user information learned during the session.

5. **Memory Management:**
   - Implement memory summarization/decay to manage large volumes of data, ensuring that only relevant information is retained long-term.

---

### **5. Non-functional Requirements**

1. **Scalability:**  
   - The memory system should be able to handle large numbers of users and store detailed memory profiles for each one, growing as user interaction increases.
  
2. **Performance:**  
   - Memory retrieval (both structured and unstructured) must be fast enough to avoid delays during user interactions.
  
3. **Security and Privacy:**  
   - Ensure all stored memory (structured and unstructured) is securely handled with proper encryption, especially when storing personal information.

---

### **6. Assumptions and Dependencies**

- The AI interviewer is already integrated with OpenAI’s GPT models for conversation generation.
- Entity extraction for structured memory will be handled by an NLP pipeline (e.g., using **spaCy** or OpenAI’s API).
- Conversation embeddings are generated using OpenAI’s embedding models or similar tools.
- You will leverage managed services for databases (e.g., **Neo4j Aura**, **Pinecone**, or **Weaviate**) to reduce infrastructure management overhead.

---

### **7. Milestones**

1. **Phase 1: Short-term MVP (2 weeks)**  
   - Implement structured memory using a simple relational database.
   - Add basic entity extraction for structured data (hometown, hobbies).
   - Set up vector search for past conversation retrieval at session setup time.

2. **Phase 2: Full Structured and Unstructured Memory Integration (1-2 months)**  
   - Implement the graph database for structured memory.
   - Integrate vector search for unstructured memory retrieval.
   - Enable real-time memory updates during conversations.

3. **Phase 3: Advanced Features (3-6 months)**  
   - Implement memory summarization and decay.
   - Enable deeper RAG integration for mid-conversation memory queries.
   - Fully automate real-time memory updates.

---

### **8. Risks**

- **Data Privacy Concerns:**  
   - As the AI stores detailed personal data, there’s a potential risk of exposing sensitive information. Ensure compliance with data privacy regulations (e.g., GDPR).
  
- **Scalability Issues:**  
   - As more data is stored, especially in unstructured memory, the system could face performance issues. Optimization strategies will need to be explored, including memory decay or summarization.

---

### **9. Success Metrics**

1. **User Retention and Engagement:**  
   - Improved user satisfaction due to personalized conversations, leading to higher retention and engagement rates.

2. **Conversation Continuity:**  
   - A higher percentage of conversations that reference past user details, enhancing the perceived intelligence of the AI.

3. **Memory Accuracy:**  
   - The AI’s ability to recall correct facts and relevant stories from past sessions without repeating outdated or irrelevant information.

---

This PRD outlines how to implement a memory system that allows your AI interviewer to reference both structured facts and unstructured narratives, enabling more personalized and context-aware interactions across user sessions.