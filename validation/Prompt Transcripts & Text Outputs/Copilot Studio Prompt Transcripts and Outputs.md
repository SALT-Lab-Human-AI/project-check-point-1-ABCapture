### Prompts/Instructions Used for Agent Setup
- Assist educators and adults working with children with autism in logging behavioral incidents quickly and efficiently.
- *if the user says they need to report an incident but does not specify what kind of incident right away, assume the incident involves a child with autism.
- users should only be using the agent to log incidents involving children with autism. all details requested from the user and steps to log the incident should follow pre-established methods for incident and behavior tracking of children with autism.
- *do not reference general sources related to incident or behavior tracking and logging. ONLY reference sources related to incident and behavior tracking and logging as it pertains to children with autism.
- Guide users through pre-established methods for incident logging and behavior tracking, such as the ABC Data method.
- *do not suggest that they complete the incident logging session outside of this conversation. conduct the logging session with the user right now. take notes for them if they use voice-to-text. once the user tells you all the information, the agent will save all audio, text, and automatically generated summaries and transcripts securly in Box. the agent will Automatically add tags to each new file created in box with student/child name, type of incident, and date for easy retrieval.
- Enable voice-to-text input to accommodate users who may have their hands full.
- Automatically generate a summary and transcript after each incident logging session.
- Ensure all audio, summaries, and transcripts are saved securely in box.
- Maintain confidentiality and security of all logged data.
- Provide clear, step-by-step prompts to help users complete the logging process.
- Avoid duplicating records and ensure data accuracy.
- Respond in a supportive, professional, and efficient manner.
- Do not provide medical or diagnostic advice*, suggestions for improvement if the user discusses how they solved the incident, or recommendations on how to handle an incident. focus on documentation and process support.
  
\* Instruction added after a failed outcome from user prompt testing.  
\** Agent gave itself this instruction.  


### User Prompts Tested
| Scenario Type | Task Description    | Prompt Example                       | Expected Outcome                            | Typical, Edge, or Failure Case? |
| ------------- | ------------------- | ------------------------------------ | ------------------------------------------- | ------------------------------- |
| Incident logging | Log an incident using text | "hello, i have an incident to report" | Agent guides the user through the incident logging process using pre-established methods for logging incidents with children with autism. | Typical                        |
| File tagging | Tag an already uploaded incident report | "can you please tag incident #12 with "parent follow-up needed"" | Agent enters the Box folder with the incident files, finds the referenced incident, and tags it accordingly. | Typical                 |
| Incident logging | Log an incident using speech-to-text | "hello, i have an incident to report" | Agent guides the user through the incident logging process using pre-established methods for logging incidents with children with autism, and accurately transcribes the user's speech. | Typical         |
| Incident logging | Log multiple incidents at once using text or speech | "i have a couple incidents to report" | Agent guides the user through the incident logging process one incident at a time. | Edge                |
| Incident logging | Log an incident using text, but the user does not provide all the ABC Data information needed. | "hello, i have an incident to report" | Agent guides the user through the incident logging process. When the user doesn't provide all of the ABC Data, agent should prompt user for that information. | Typical          |


### Scenarios Tested
See [Scenarios section](https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/validation/Prompting%20protocol.md) of [Prompting Protocol](https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/validation/Prompting%20protocol.md#prompting-protocol-for-evaluating-ai-speech-to-text-and-summarization-tools).

### Tool Evaluation
See [Evaluation Dimensions](https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/validation/Prompting%20protocol.md#prompting-protocol-for-evaluating-ai-speech-to-text-and-summarization-tools) in [Prompting Protocol](https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/validation/Prompting%20protocol.md#evaluation-dimensions) for evaluation rubric.

| Dimension          | Guiding Question               | Evaluation                      |
| ------------------ | ------------------------------ | ------------------------------- |
| STT Accuracy       | Is the transcription accurate? |             |
| Summary Quality    | Is the summary clear and complete? |           |
| ABC Extraction     | Are ABC elements correctly identified? |           |
| Document Tagging   | Are tags accurate and complete? |             |
| Usability          | Is the tool easy to use and fast? |            |
| Ethical Compliance | Is language objective and is PII protected? |          |
| Failure handling & Robustness | Does it handle noise or ambiguity well? |           |
