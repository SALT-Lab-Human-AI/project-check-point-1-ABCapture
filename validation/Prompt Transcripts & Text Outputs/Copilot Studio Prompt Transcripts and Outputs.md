## Prompts/Instructions Used for Agent Setup
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

---

## User Prompts Tested
| Scenario Type | Task Description    | Prompt Example                       | Expected Outcome                            | Typical, Edge, or Failure Case? |
| ------------- | ------------------- | ------------------------------------ | ------------------------------------------- | ------------------------------- |
| Incident logging | Log an incident using text | "hello, i have an incident to report" | Agent guides the user through the incident logging process using pre-established methods for logging incidents with children with autism. Then, it summarizes the incident report and saves the report as a document for later reference. | Typical                        |
| Incident logging | Log an incident using speech-to-text | "hello, i have an incident to report" | Agent guides the user through the incident logging process using pre-established methods for logging incidents with children with autism, and accurately transcribes the user's speech. | Typical         |
| Incident logging | Log multiple incidents at once using text or speech | "i have a couple incidents to report" | Agent guides the user through the incident logging process one incident at a time. | Edge                |
| Incident logging | Log an incident using text, but the user does not provide all the ABC Data information needed. | "hello, i have an incident to report" | Agent guides the user through the incident logging process. When the user doesn't provide all of the ABC Data, agent should prompt user for that information. | Typical          |

---

## Scenarios Tested
See [scenario categories](https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/validation/Prompting%20protocol.md#scenario-categories) of [Prompting Protocol](https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/validation/Prompting%20protocol.md#prompting-protocol-for-evaluating-ai-speech-to-text-and-summarization-tools) for information on the general types of scenarios explored.

### Scenario 1:
> So, for the ABC form, the student is Alex Brown. The incident happened at 10.15am on October 3rd, 2025. The duration of this observation is around 30 minutes. The staff that observed this behavior was me, Valerie Frizzle, and it took place It was during our small math group at the back table where I was working with four other students at the time. And for the antecedent...
>
> A few students were talking loudly and I reminded the group to stay focused. Then Alex started tapping his pencil and humming while I was giving directions. For the behavior, after I asked him to stop, he said the noise was bothering him and pushed his worksheet off the table. For the consequence, I directed him to take a 5 minute break in the calm corner. When he came back, he finished his math problems without any issues.
>
> So overall, I think the function was partly sensory, the noise, and partly escape, since the break really helped calm me.  

#### Scenario 1 Reflection:
The conversation was initiated with the user prompt...
> I have an incident to report  
And then the agent responded by requesting the following information from the user, guiding them through the different pieces of information needed to properly follow pre-established methods for reporting incidents involving children with autism.  
<img width="553" height="263" alt="image" src="https://github.com/user-attachments/assets/4d9129db-ff56-48b3-8b94-58405dae7c46" /> 

After the user provides the above scenario information, the agent responded with the following summary. The agent's response effectively summarizes the incident as described by the user.  
<img width="1061" height="463" alt="image" src="https://github.com/user-attachments/assets/30363698-6137-4aad-9012-5dc81ad01ff2" />
