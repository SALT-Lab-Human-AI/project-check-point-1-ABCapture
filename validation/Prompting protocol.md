## Prompting Protocol for ABCapture

### Prompts/Instructions Used for Agent Setup
*Copilot Studio:*
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
| Incident logging | Log an incident using text or speech | "hello, i have an incident to report" | Agent guides the user through the incident logging process using pre-established methods for logging incidents with children with autism. | Typical                        |
| File tagging | Tag an already uploaded incident report | "can you please tag incident #12 with "parent follow-up needed"" | Agent enters the Box folder with the incident files, finds the referenced incident, and tags it accordingly. | Typical                 |

# Prompting Protocol for Evaluating AI Speech-to-Text and Summarization Tools

## Purpose
This protocol defines the scenarios, prompts, and tasks used to evaluate multiple AI tools for their ability to:
1. Accurately transcribe short classroom speech segments describing behavioral incidents.
2. Generate concise summaries of incidents.
3. Complete or assist in filling out an ABC (Antecedent–Behavior–Consequence) form.
4. Handle typical, edge, and failure cases relevant to classrooms supporting students with Autism Spectrum Disorder (ASD).

---

## Evaluation Dimensions
Each tool will be tested and rated on:
- **Speech recognition accuracy:** transcription quality, handling of overlapping speech, background noise.  
- **Summarization quality:** clarity, conciseness, inclusion of critical behavioral details.  
- **ABC extraction:** ability to identify antecedent, behavior, and consequence correctly.
- **Document Tagging:** ability to tag the behvioral form with student name, type of incident, date and funtion(s) of behavior displayed by student.
- **Responsiveness:** time required to produce usable output.  
- **Ethical compliance:** data sensitivity, transparency, and potential bias in phrasing.  
- **Failure handling:** how the tool responds to incomplete, ambiguous, or emotional teacher inputs.  

---

## Scenario Categories

### 1. Typical Classroom Incidents
**Goal:** Test average use cases under realistic conditions.  
- *Scenario 1:* Teacher describes behavioral incident and provides all necessary details to complete the ABC form.  
- *Scenario 2:* Teacher describes behavioral incident and does not provide all necessary details to complete the ABC form.  

### 2. Edge Cases
**Goal:** Test how models handle nuanced or atypical incidents.  
- *Scenario 3:* Emotional tone or sarcasm (“that went great… not really”) to test contextual understanding.  
- *Scenario 4:* Two students interact; unclear who initiated behavior.  
- *Scenario 5:* Teacher describes multiple incidents in one recording.  

### 3. Failure Cases
**Goal:** Test limits of the systems.  
- *Scenario 6:* Audio includes significant background noise or overlapping voices.  
- *Scenario 7:* Audio does not relate to a behavioral incident.  

---

## Prompts and Tasks

For each scenario, perform the following tasks using each AI tool:

1. **Speech-to-Text Task**  
   - Input sample audio (simulate natural teacher speech).  
   - Evaluate transcription accuracy (Word Error Rate, completeness).  

2. **Summarization Task**  
   - Evaluate for clarity, factual accuracy, and completeness.  

3. **ABC Extraction Task**  
   - Prompt: “Fill out the ABC form from the information provided from my audio.”  
   - Evaluate for correct labeling and usefulness to a behavior specialist.  

4. **Bias and Ethical Review**  
   - Prompt: “Use objective language. If any information required by the form is not mentioned by me in the recording please let me know so we can fill it out correctly.”  
   - Evaluate whether summaries avoid bias or stigmatizing phrasing (important for ASD contexts).  

---

## Scoring Rubric (Example)

| Dimension | Excellent (5) | Good (4) | Adequate (3) | Poor (2) | Fail (1) |
|------------|---------------|-----------|----------------|------------|-----------|
| **STT accuracy** | Minor or no transcription errors | Mostly accurate with minor omissions | Understandable but with moderate errors | Frequent mishearing | Unusable |
| **Summary relevance** | Includes all key details clearly | Clear but misses minor context | Captures main points but vague | Incomplete or unclear | Off-topic or incorrect |
| **ABC accuracy** | All elements correct | One element unclear | Partial extraction | Mislabeling | No extraction |
| **Ethical tone** | Neutral and factual | Slightly subjective | Noticeable bias | Unprofessional tone | Inappropriate language |
| **Latency (seconds)** | <10 | 10–20 | 20–30 | 30–60 | >60 |

---

## Scenario Scripts

### **Scenario 1:** Teacher describes behavioral incident and provides all necessary details to complete the ABC form
> “Okay, so for the ABC form the student is Alex Brown. The incident happened at 10:15 on October 3rd, 2025. The duration of this observation is around 30 min. The staff that observed this behavior was me, Valerie Frizzle, and the setting where the observation occurred was in my classroom. It was during our math small group, at the back table where I was working with four students at a time.  
> For the antecedent a few students were talking loudly, and I reminded the group to stay focused. Then Alex started tapping his pencil and humming while I was giving directions.  
> For the behavior after I asked him to stop, he said the noise was bothering him and pushed his worksheet off the table.  
> For the consequence I directed him to take a five-minute break in the calm corner. When he came back, he finished his math problems without any issues.  
> So overall, I think the function was partly sensory due to the noise and partly escape, since the break helped him calm down.”

---

### **Scenario 2:** Incomplete incident description
> “This morning during our math small group, Alex began tapping his pencil and humming while I was giving instructions. Just before that, a few other students were talking loudly, and I reminded the group to stay focused. When I asked Alex to stop tapping, he said the noise from the others was bothering him and pushed his worksheet off the table. I directed him to the calm corner for a five-minute break, and when he came back, he completed his math problems without any further issues.”

---

### **Scenario 3:** Emotional tone and sarcasm
> “Well, this morning during math group was just great — I have to log an incident report for it. Okay, this was with Alex Brown, and it happened this morning at about 10:15, October 3rd, 2025. The whole thing lasted maybe thirty minutes. I’m Ms. Valerie Frizzle, and it was during our math small group at the back table in my classroom, where I was working with four students.  
> So I had just reminded everyone to stay focused because a few kids were talking way too loudly, and that’s when Alex decided it was the perfect time to start his own little percussion concert — tapping his pencil and humming right in the middle of my directions. When I asked him to stop, he said the noise was bothering him, which, sure, makes sense since he was adding to it. Then he pushed his worksheet off the table like it had done something to him.  
> I told him to take five minutes in the calm corner to cool off — and, surprise, that fixed everything. He came back calm as can be and finished his math problems like nothing had ever happened. Honestly, I’d say it was partly sensory, with the noise, and partly just escape, since the quick break seemed to reset him completely.”

---

### **Scenario 4:** Two students interacting; unclear who initiated
> “This incident was between Jordan Smith and Alex Brown, and it happened today during indoor recess at around 1:30 in the afternoon — October 3rd, 2025. I’m Ms. Valerie Frizzle, and it lasted maybe ten minutes or so in my classroom play area where the building blocks are set up.  
> I didn’t actually see how it started. When I looked over, Jordan was saying Alex took the blocks from him, and Alex was insisting he had them first. They were both getting louder, talking over each other, and then Jordan knocked over what Alex had built. Alex yelled and pushed the blocks off the table. I stepped in right away and had them take breaks on opposite sides of the room. After a few minutes, they both calmed down, apologized, and helped clean up.  
> Honestly, I’m not sure who started it. It might have been about taking turns or sharing, but it escalated pretty quickly once they both got frustrated.”

---

### **Scenario 5:** Multiple incidents in one recording
> “This report is for Alex Brown and took place today, October 3rd, 2025. I’m Ms. Valerie Frizzle, and both incidents happened in my classroom. The first one was around 10:15 during math small group — it lasted maybe ten minutes. The second was later in the day, right before dismissal at about 2:45.  
> So, for the first one, Alex was at the back table working on math problems when a couple of other students were chatting loudly. I reminded everyone to focus, and Alex started tapping his pencil and humming. When I asked him to stop, he said the noise was too much and pushed his worksheet off the table. I had him take a short break in the calm corner, and when he came back, he finished his work without any issues.  
> Then, later in the afternoon, during clean-up time, Alex got frustrated because another student moved his backpack. He started yelling that people were touching his stuff and refused to line up. I asked him to take a few deep breaths, but he kept arguing, so I had him wait by the door with me until the rest of the class was ready. Once things settled, he apologized and walked out calmly.  
> Both times, it seemed like the noise and unexpected changes set him off, but once he got space and structure, he was able to reset.”

---

### **Scenario 6:** Background noise
> *Scenario 1 script + artificial kindergarten classroom sounds playing at full volume.*

---

### **Scenario 7:** Off-topic audio
> “Hey, just a quick note to myself. I need to remember to print out the new spelling lists for next week and check if the laminator is working. Also, I want to talk to Mr. Chen about rearranging the seating chart before Monday. Oh, and I still need to send that email to Alex’s mom about the field trip permission slip. Anyway, tomorrow we’re supposed to have indoor recess again if it rains, so I should set up the sensory bin ahead of time. That’s it - just reminders so I don’t forget.”

---


