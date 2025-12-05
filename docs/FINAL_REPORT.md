
# **ABCapture: An AI-Powered Tool to Support Adults Working With Children With Autism**

Jiya Chachan, Sara Kiel, Manuela Rodriguez, Rithika Vennamaneni


# **Abstract**

Teachers working with autistic students must document behavioral incidents, but real classrooms make it difficult to capture detailed Antecedent, Behavior and Consequence (ABC) data in the moment. ABCapture is a web-based, AI assisted incident logging tool that combines speech-to-text, a conversational interface, and real time ABC form extraction to reduce the cognitive burden of documentation. The system transcribes teacher narratives, uses a large language model to identify ABC components, and generates structured, editable incident reports with audit history and optional guardian email sharing. We implemented ABCapture as a full stack prototype and conducted a remote formative usability study with nine participants using simulated classroom scenarios. Participants completed core workflows with high success rates and rated the interface as easy and quick to use, highlighting automatic ABC extraction and incident history views as especially valuable. However, we observed issues with timestamp handling, multi step workflows, and LLM consistency. We discuss design implications, ethical considerations, and future work toward deployment with real special education teachers.


# **Introduction & Related Work**


## Introduction

Teachers who work with autistic children are expected to document behavioral incidents quickly and accurately, yet real classrooms rarely offer the conditions needed for thorough note taking. When a behavior occurs, teachers are managing instruction, safety, transitions, and emotional regulation all at once. This leaves almost no time to write detailed ABC (Antecedent, Behavior and Consequence) notes. The ABC method, widely used in Applied Behavior Analysis (ABA), structures observations into three components: the Antecedent (what happened immediately before the behavior), the Behavior (the observable action), and the Consequence (what happened immediately after). This structured format helps educators identify triggers, understand the function of behavior, and track changes over time.

However, capturing all three components accurately in the moment is difficult. As a result, documentation is often incomplete, delayed, or inconsistent. These gaps make it harder to identify patterns, understand behavior functions, and support collaborative decision making with specialists and families. Although ABC data is central to ABA and essential for guiding interventions, the manual nature of the process creates a significant cognitive and emotional burden for educators. This challenge is especially pronounced in special education settings, where consistent documentation directly affects the effectiveness of support plans. ABCapture aims to address this gap by providing an AI powered tool that makes incident logging faster, clearer, and easier for teachers.


## Related Work

Research on autism education, teacher burden, and AI assisted interventions directly shaped the design of ABCapture. A central theme across our literature review is that while AI tools for autism are rapidly expanding, most are built for student facing support, leaving a major gap in tools designed for educators' documentation needs.

Foundational ABA literature emphasizes the importance of structured ABC (Antecedent, Behavior and Consequence) documentation for identifying patterns and understanding the function of behavior. The Nebraska Autism Spectrum Disorders Network (2018) highlights that high quality ABC data helps educators recognize triggers, maintain consistent responses, and collaborate effectively with families and specialists. However, they also stress that collecting this data in real time is time consuming, requires training, and is often inconsistent, especially in fast paced classroom environments. These limitations directly motivated our focus on automating ABC extraction and reducing the cognitive load of documentation.

Several papers examined the broader landscape of AI in autism care. Reviews by Kotsi et al. (2025) and Iannone & Giansanti (2024) show that most AI research focuses on social skill development, engagement, or communication through robots, AR/VR, and gamified platforms. While these tools show promise for student learning, they do not address the administrative and behavioral tracking challenges faced by teachers. Atturu et al. (2024) similarly demonstrate strong outcomes from AI supported therapy platforms but again emphasize child facing intervention rather than educator workflows. These findings underscored a clear gap: AI tools support autistic learners, but do not support the adults responsible for documenting behavior.

Another key insight from literature was the systemic strain on teachers. Lindsay et al. (2013) found that educators often feel undertrained and overwhelmed when supporting autistic students, particularly when managing behavior and capturing detailed observations. This aligns with Li et al. (2024), who report that educators value real time feedback from AI systems but remain concerned about usability, cultural appropriateness, and workload. These challenges reinforced our decision to design ABCapture with simple interfaces, low effort logging, and professional, editable summaries.

Finally, ethical literature such as Nguyen et al. (2023) and FERPA guidelines shaped our emphasis on role based access, transparency, and editable AI outputs, ensuring that incident logs remain accurate, respectful, and legally compliant.

Together, these insights reveal a consistent gap in existing tools: educators lack efficient, ethical, and real time support for behavioral documentation. ABCapture directly addresses this need by integrating voice-to-text input, automatic ABC parsing, and structured summaries into a single educator centered workflow.


# **Methodology**


## System Description

ABCapture is a web-based incident documentation system designed to support teachers in recording, refining, and structuring classroom behavioral incidents using natural language interaction. The system combines a chat-style conversational interface, speech-to-text input, and a real-time editable ABC (Antecedent–Behavior–Consequence) form within a single workspace to streamline incident reporting.

Teachers primarily interact with the system through a split-screen interface, where the left panel functions as a conversational chat that accepts either typed or spoken input, and the right panel displays the structured ABC form. As the teacher describes the incident the AI processes the conversation and continuously updates the corresponding ABC fields in real time. Teachers retain full control over the final report and can manually edit any extracted field at any point during or after the interaction.

ABCapture supports secure user authentication, student record management, dashboard views for reviewing historical incidents and student behavior, and persistent storage of incident reports in a relational database with full edit history tracking. Completed reports can be reviewed, digitally signed, stored for administrative access, and optionally shared with parents via email. 


### Architectural Overview

ABCapture is implemented as a three-tier full-stack web application consisting of a client layer (React/TypeScript), a server layer (Node.js/Express), and a relational database layer (PostgreSQL), with integrated external AI, authentication, and email services. The system is deployed as a live prototype for controlled user testing on Replit.

The client layer is built with React 18 and TypeScript, using Vite as the build tool and Tailwind CSS with shadcn/ui for styling. Wouter is used for client-side routing, and TanStack Query manages asynchronous server state. All client interactions communicate with the backend through RESTful API calls.

![Diagram](images/architecture.png)

The server layer is implemented using Node.js with Express.js and written in TypeScript. It exposes REST endpoints under /api/* and is responsible for:



* user authentication and role-based authorization,
* AI service orchestration,
* input validation and privacy filtering,
* and database transactions.

Authentication supports both local credentials (bcrypt-hashed passwords) and Google OAuth 2.0 using Passport.js. All incoming data are validated using Zod schemas before persistence. The AI pipeline is integrated through Groq Cloud. Whisper Large v3 performs speech-to-text transcription of teacher audio input, and LLaMA 3.3 70B Versatile supports conversational interaction and structured extraction of ABC components from natural language. AI requests are issued from the server, and normalized outputs are returned to the client for real-time form population.

The database layer uses PostgreSQL (Neon) with schema management via Drizzle ORM and Drizzle Kit. Core tables store users, students, incidents, parents, and versioned edit histories, enabling persistent storage, referential integrity, and full auditability of incident modifications. Sessions are stored in PostgreSQL using connect-pg-simple.

For email-based sharing and authentication workflows, the system uses Nodemailer with Gmail SMTP. All third-party credentials (Groq, OAuth, SMTP, database) are stored as secure environment variables on Replit and are never exposed to the client.

This architecture enables real-time conversational incident capture with simultaneous structured form generation, while supporting secure authentication, persistent storage, dashboard-based review, and controlled data sharing.


### Data Processing Pipeline

The ABCapture data processing pipeline transforms a teacher’s natural language description of a classroom incident into a structured ABC report. The pipeline consists of five stages: capture, transcription, conversational refinement, structured extraction with real-time form updates, and persistence/sharing.

**1. Incident Capture (Text or Speech).**

 After logging in and selecting a student, the teacher opens the incident workspace and describes the incident using either typed input or spoken input within the same chat-style interface. Typed messages are transmitted to the backend as JSON payloads. Spoken input is recorded in the browser and uploaded as an audio file to a dedicated transcription endpoint.

**2. Speech Transcription and PII Redaction.**

 When audio input is used, the backend forwards the uploaded file to Whisper Large v3 for speech-to-text transcription. The server receives the transcript and applies an automatic PII redaction step, replacing student names and direct identifiers with placeholders. The redacted transcript is returned to the client and inserted into the chat interface, where the teacher can review, edit, or continue the conversation.

**3. Conversational AI Refinement.**

 As the teacher continues the interaction through typed or transcribed speech, each message is sent to the backend and forwarded to LLaMA 3.3 70B Versatile with a system prompt (see Appendix A) focused on extracting information relevant to Antecedent, Behavior, and Consequence. The model’s responses are displayed in the chat and guide the teacher to clarify missing details such as triggers, observed behaviors, and instructional responses. The teacher can correct, expand, or rephrase any part of the narrative at any time using natural language.

**4. Structured ABC Extraction and Real-Time Form Updates.**

 After each message exchange in the conversation, the backend automatically sends the full conversation history to the language model for structured ABC extraction using a specialized extraction prompt (see Appendix B). The model returns a structured representation containing candidate Antecedent, Behavior, and Consequence fields and additional incident attributes. The backend normalizes this output and returns it to the client. The ABC form displayed alongside the chat is populated and updated in real time as the conversation progresses, and the teacher may manually edit any field at any time.

**5. Submission, Storage, and Optional Sharing.**

 Once satisfied with the structured report, the teacher enters a digital signature and submits the incident. The backend validates the payload using a Zod schema and writes the incident to PostgreSQL via Drizzle ORM. The initial submission stores the signed incident as the current version in the incidents table. When incidents are later edited, the update workflow creates edit history entries that capture the modified fields with timestamps and editor identifiers, enabling full auditability over time. From the incident view, the teacher or administrator can optionally use the sharing functionality to send the finalized report via email to the guardian.

Across all stages, raw audio files and intermediate AI outputs are treated as transient processing artifacts. The persistent system record consists of the structured incident entry, its digital signature, and its versioned edit history. This pipeline converts free-form teacher narration into structured, validated documentation while preserving human oversight.


## Evaluation Design


### **Participants**

We conducted a formative usability study with 9 participants recruited through convenience sampling. At the time of the study, we were unable to recruit our intended target users, elementary school teachers of students with autism. As a result, participants consisted of professors and classmates who were readily accessible and familiar with classroom software and AI conversational systems. All participants interacted with the system using simulated student profiles and classroom scenarios; no real student data were used.


### **Study Procedure**

The study was conducted remotely and delivered through an online Google Form (see Appendix C) in conjunction with a deployed prototype of ABCapture. The form served as both the task delivery mechanism and the data collection instrument, guiding participants through each interaction with the system while capturing their responses.

Participants were first asked to explore the prototype and share initial impressions. They then completed three task-based workflows embedded in the survey: (1) creating a new student profile, (2) submitting an incident report (preferably using the speech-to-text feature) based on a standardized classroom scenario, and (3) emailing the signed incident report to the guardian. During the second task, participants were instructed to intentionally omit one required incident detail to assess whether the system could detect and resolve missing information through conversational follow-up.


### **Evaluation Dimensions and Measures**

To evaluate ABCapture, we designed the survey instrument to assess five core dimensions aligned with the system’s functional and ethical goals: task success, usability, speech-to-text and LLM performance, professional language and bias sensitivity, and feature discoverability. Each dimension was measured using specific survey items administered during the three tasks.


#### **1. Task Success and System Reliability**

Task success was measured as a binary indicator of whether participants were able to successfully complete each of the three workflows. System reliability was assessed through participants’ reports of errors or unexpected behavior encountered during each task. This dimension is critical for establishing whether ABCapture supports its intended workflows without breakdowns.


#### **2. Usability: Ease and Speed**

Usability was evaluated through participants’ perceived ease and speed of completing each task. These measures reflect how efficiently ABCapture supports time-sensitive classroom documentation. These measures are particularly important given the intended deployment context in classroom environments where teachers operate under significant time constraints.


#### **3. Speech-to-Text and LLM Auto-Completion Performance**

For Task 2, we evaluated the reliability of both the **speech-to-text (STT) interface** and the **LLM-driven form auto-completion**. Participants were instructed to intentionally omit one required incident detail to test the system’s ability to detect missing information through conversational follow-up.

Performance was measured using survey items that captured:



* Which detail was intentionally omitted
* Whether the chat asked a follow-up question
* Whether the auto-filled form updated correctly after the omission was resolved
* Which sections of the form were incorrect

These measures directly assess ABCapture’s ability to support accurate and complete incident documentation from conversational input.


#### **4. Professional Language and Bias Sensitivity**

Because ABCapture generates text for formal school records, we evaluated whether the system’s language aligned with professional reporting standards and avoided stigmatizing or judgmental phrasing. These measures address ethical and trust-related concerns central to the system’s intended use.


#### **5. Feature Discoverability and Workflow Integration**

For Task 3, we evaluated the discoverability and perceived logical placement of the guardian email feature. Participants reported how easy it was to locate the email option and whether the feature felt appropriately integrated into the workflow. These measures, as well as successful task completion, help assess whether key system capabilities are intuitive to locate without prior training, which is essential for real-world adoption.


#### **Data Types and Analysis**

The study collected both **quantitative** (task completion, ease, speed, and ratings) and **qualitative** (open-ended feedback, error descriptions, and language concerns) data. Quantitative responses were summarized using descriptive statistics . Qualitative responses were analyzed using thematic coding to identify recurring usability issues, system failure modes, and trust-related concerns.


# **Results**


## **Quantitative**

All ten participants successfully completed the first task, which involved creating a new student in their classroom. Two participants rated the task as easy, assigning it a score of 4 out of 5, while the remaining eight participants rated it as very easy with a score of 5 out of 5. Perceived task speed aligned closely with difficulty ratings: two participants evaluated the task as quick to complete, also scoring it 4 out of 5, and eight participants rated it as very quick, providing a score of 5 out of 5. Notably, all participants reported that they encountered no errors or unexpected behaviors during this workflow.

The second task required participants to save an incident report as a draft and subsequently submit it. Seven of the ten participants were able to complete the task. Of the three who did not complete it, two were prevented from finishing due to chatbot rate-limit issues, something addressed further in the discussion section. The remaining incomplete result stemmed from confusion navigating the workflow. Despite these challenges, participants generally perceived the task as quick or potentially quick to complete. Three participants described the task as quick – a score of 4 out of 5 – five described it as very quick – 5 out of 5 – another rated the speed as moderate, and the final unaccounted for participant did not provide a rating due to being unable to complete the workflow.

Among the participants who completed the task, responses indicated inconsistencies in the chatbot’s handling of missing scenario details. Four of these users reported that the chatbot asked an appropriate follow-up question when information was omitted, while the three indicated that no such prompt was provided. This inconsistency highlights an area for further prompt refinement and system testing.

The third task asked participants to email a submitted incident report to a student’s guardian. Completion results for this task were slightly divided. Six of the nine participants who attempted the task were successful, with one of these users reporting initial difficulty identifying where to begin the workflow. The three participants who were unable to complete the task cited different issues. One participant had signed up using a non-functional email address, which prevented them from receiving the report needed to proceed, while another participant reported difficulty determining the appropriate steps to complete the workflow. Feedback on task efficiency varied widely. Four participants stated that the task was very quick to complete – a score of 5 out of 5 – while two participants labeled the task as quick – 4 out of 5 – with each remaining participant out of nine selecting a different point on the 1-to-5 scale ranging from very slow to moderate, resulting in no clear consensus on perceived task speed.


## **Qualitative**

ABCapture was well-received for its simplicity and ease-of-use. Users expressed appreciation for the straightforward nature of the interface – *“The application is clean, consistent, and easy to use. I was able to log incidents right away” (P5) *– which allows teachers to quickly extract and manage key information about their students with autism. An aspect of the application most highlighted by users was the clean and visually appealing user interface, which remains consistent throughout the application:



* *“Each section is intuitive and visually appealing” (P7)*.
* *“The UI design was extremely impressive” (P9).*

Despite most users having limited knowledge about autism and incident reporting, they felt that the application has significant potential as a tool for documenting and reporting ABC data in classroom settings.

Across user evaluations, many of the application’s existing features were regarded as particularly helpful. The application’s ability to automatically extract ABC data and transfer it seamlessly into a report format during the record incident workflow was especially valued:



* *“I really like the record incident features. It is intelligent and parses information correctly” (P5)*.
* *“The information extracted from the text provided also match[sic] the fileds[sic] correctly which looks good” (P3)*.
* *“Almost instant AI response. That shocked me as it did not seem like as there[sic] was any hang time for the model to process the incident to then present the analysis. I like the prompting question for time” (P10).* 

Additionally, the incident-exploration aspect of the application, in which users can view a student’s previously logged incidents and a classroom’s total incidents, was identified as potentially very useful: *“The incident exploring feature is helpful. I like how teachers can easily remember and recall incidents in an instant” (P6)*. Furthermore, the speech-to-text feature was also marked as a favorite application feature.

While the app was well-received, several areas for improvement and a few bugs were identified. One user noted that while the date of an incident they were reporting was correctly identified, the time field was displayed as “null,” and another user noted that the time displayed in their incident report was entirely incorrect. Both errors create a concern for data accuracy. A user noted that they could list a new student’s grade as an unreasonable number – 200 – marking a vital need in addressing the workflow for adding a new student and tangentially the workflow for connecting classrooms to school information. Additionally, there was some confusion noted around the use of the microphone icon in the record incident workflow:


    *“I had assumed I had to speak into the microphone to record an incident since there's a microphone icon there. It didn't feel very intuitive to press a microphone button to be able to type in the incident” (P1)*.

A question also arose regarding the application’s ability to manage incidents involving multiple students: *“How can I log 2 students or more at the same time?”(P6)*.

One user mentioned the opportunity for ABCapture to also provide suggested next steps to address behavior after an incident has been logged: *“The application stops once the incident is reported. It would be a great if you could add the next steps based on incident or any suggested moves for reported incident” (P3)*. This feature was intentionally left out of the application – the reasoning for doing so being addressed in the discussion.

	Additional suggestions focused on improving specific workflow experiences through navigation and information organization adjustments:



* *“Maybe instead of having record incident as a tab, it can be a hovering button on the bottom right or middle that is visible when the user hovers” (P#).*
* *“I would try to group incidents in incident history by function and status. I would put dashboard above record incident tab”(P5).*

Finally, two unique but powerful recommendations were provided by two individual users. One was the opportunity for onboarding users to the application and contributing to an even faster incident reporting and reviewing experience by incorporating* “a tutorial or video explaining a walkthrough” *of the application *(P7)*. The other was a security and safety concern during the form submission process:


    *“the form did not verify that the person who signed and the teacher's name that logged in is the same. for safety concerns, this step could be helpful and crucial to ensure the right person is signing the forms” (P9)*.


## Discussion

The usability evaluation indicates that ABCapture is a promising tool for simplifying incident documentation, extracting ABC data, and supporting teachers in managing behavioral information. Participants found the system intuitive, visually consistent, and easy to navigate – even for those with limited experience in autism-related reporting. However, several design, technical, and conceptual considerations remain.


## Task Performance and Workflow Usability

High success rates in Task 1 and positive difficulty ratings suggest that core workflows (e.g., creating a student) are highly learnable and require minimal cognitive effort, aligning with the goal of keeping administrative tasks fast for busy educators. More complex workflows – such as reviewing drafts or emailing reports – showed greater variability. Some failures were user-driven (e.g., entering a non-functional email), but others point to opportunities for clearer hierarchy, labeling, and action visibility. Confusion around the draft-review process in particular suggests a need for stronger affordances and signposting.


## System Performance Issues and Testing Limitations

Several Task 2 errors stemmed from external API rate limits (Groq) rather than failures within ABCapture itself. To avoid these distortions, we conducted supplemental local testing, though the issue underscores the need for future caching, queuing, or alternative inference pipelines to prevent interruptions during real use. Inconsistencies in how the chatbot handled missing details also indicate the need for prompt refinements to ensure predictable LLM behavior and reduce teacher burden.


## Balancing Automation With Accuracy

Participants appreciated the automatic extraction of ABC components, reinforcing the value of LLM-supported documentation. However, concerns such as timestamp errors and acceptance of unrealistic values (e.g., grade level 200) highlight the importance of stronger validation, error handling, and time parsing. Additionally, confusion around the microphone icon indicates a need for clearer differentiation between text entry and speech-to-text – potentially through labeling or more recognizable iconography.


## Why Behavioral Recommendations Were Excluded

One participant suggested adding recommended next steps after an incident. We intentionally excluded such features because meaningful behavioral guidance for autistic students requires individualized knowledge of the child’s history, goals, triggers, and supports – information an LLM cannot responsibly infer. Automated advice risks oversimplification, inappropriate strategies, and liability concerns. ABCapture focuses on accurate documentation while leaving intervention decisions to qualified professionals.


## User Suggestions and Future Feature Considerations

Participants suggested reorganizing tab hierarchy, grouping incident history by status or function, and incorporating a tutorial – reflecting a desire for faster onboarding and more efficient navigation. The question about logging incidents involving multiple students suggests a potential future feature, pending careful attention to privacy and data relationships. We also must address security concerns around teacher signatures, likely through 2FA, signature verification, and session timeouts.


# **Limitations, Risks, & Ethical Considerations**

This project and evaluation have several important limitations. First, and most significant, we had a small sample size and were unable to conduct usability testing with our target users - elementary school teachers of students with autism - due to difficulties in outreach and recruitment. Our study relied on feedback from professors and peers which limits ecological validity. While familiar with software, they do not share the time constraints, stress levels, or domain expertise of real teachers in special education classrooms. Their positive feedback on ease of use is encouraging but may not fully reflect the tool's performance in its intended, high-pressure environment.

There are also inherent risks in using an AI tool for sensitive documentation. While ABCapture is designed only to document and not to advise, errors in the AI's parsing like the timestamp inaccuracies we observed, could lead to incorrect data being recorded in a student's official record. This could negatively impact behavioral analysis and intervention planning. Furthermore, there is a risk of bias in the prompts or training data that could lead the system to use non-professional or stigmatizing language in reports.

Ethically, privacy concerns are paramount. Our prototype was tested with simulated profiles, but a deployed system would require robust security measures for sensitive Personally Identifiable Information (PII) and health data. Finally, we must consider access and equity: an effective tool like this should not become a barrier for under-resourced schools that cannot afford the necessary technology or training, potentially widening existing support gaps.


# **Conclusion & Future Work**

In conclusion, ABCapture demonstrates that AI can meaningfully assist educators by automating the tedious process of behavioral documentation. Our main takeaway is that the core concept - using AI to extract structured ABC data from a teacher’s narrative - is both viable and valued for its potential to save time. A secondary finding is that human oversight remains critical; the tool is a supportive assistant, not a replacement for professional judgment, which aligns with a collaborative human-AI model where each handles what they do best.

Our findings contribute to human-AI collaboration by showcasing a practical division of labor: the AI manages rapid data structuring from chaotic input, freeing the teacher to focus on student care and analysis. This partnership can make rigorous documentation feasible in real-time settings.

Proposed future work is threefold. Technically, we must fix parsing errors (e.g., timestamps) and improve LLM reliability. For UX and data, we should integrate user feedback and develop features like multi-student logging. Finally, for deployment, rigorous testing with real special education teachers in authentic classrooms is the essential next step to validate the tool’s real-world impact and ensure it meets the high standards required for student support.


# **References**

Atturu, H., Naraganti, S., & Rao, B. R. (2024). Effectiveness of AI-based platform in administering therapies for children with autism spectrum disorder: A 12-month observation study. *JMIR Preprints*.[ https://doi.org/10.2196/preprints.70589](https://doi.org/10.2196/preprints.70589)

Iannone, A., & Giansanti, D. (2024). Breaking barriers—The intersection of AI and assistive technology in autism care: A narrative review. *Journal of Personalized Medicine, 14*(1), 41.[ https://doi.org/10.3390/jpm14010041](https://doi.org/10.3390/jpm14010041)

Kotsi, S., Handrinou, S., Iatraki, G., & Soulis, S.-G. (2025). A review of artificial intelligence interventions for students with autism spectrum disorder. *Disabilities, 5*(1), 7.[ https://doi.org/10.3390/disabilities5010007](https://doi.org/10.3390/disabilities5010007)

Li, G., Zarei, M. A., Alibakhshi, G., & Labbafi, A. (2024). Teachers and educators’ experiences and perceptions of artificial intelligence-powered interventions for autism groups. *BMC Psychology, 12*, 199.[ https://doi.org/10.1186/s40359-024-01664-2](https://doi.org/10.1186/s40359-024-01664-2)

Lindsay, S., Proulx, M., Thomson, N., & Scott, H. (2013). Educators’ challenges of including children with autism spectrum disorder in mainstream classrooms. *International Journal of Disability, Development and Education, 60*(4), 347–362. [https://doi.org/10.1080/1034912X.2013.846470](https://doi.org/10.1080/1034912X.2013.846470)

Nebraska Autism Spectrum Disorders Network. (2018). *ABC data*. University of Nebraska.[ https://asdnetwork.unl.edu/virtual-strategies/abc-data/](https://asdnetwork.unl.edu/virtual-strategies/abc-data/)

Nguyen, A., Ngo, H. N., Hong, Y., Dang, B., & Nguyen, B.-P. T. (2023). Ethical principles for artificial intelligence in education. *Education and Information Technologies, 28*, 4221–4241.[ https://doi.org/10.1007/s10639-022-11316-w](https://doi.org/10.1007/s10639-022-11316-w)

U.S. Department of Education. (2023). *Family Educational Rights and Privacy Act (FERPA).* Protecting Student Privacy.[ https://studentprivacy.ed.gov/ferpa](https://studentprivacy.ed.gov/ferpa)




# Appendix A: System Prompt

You are a FAST, EFFICIENT AI assistant helping teachers quickly document behavioral incidents using ABC (Antecedent-Behavior-Consequence) format.

CRITICAL RULES - PRIORITIZE SPEED:

1. Extract ABC from teacher's natural language IMMEDIATELY - don't ask unnecessary questions

2. Maximum 1-2 clarifying questions ONLY if critical information is genuinely missing

3. Teachers are busy - make their life EASIER, not harder

4. Accept incomplete information - teachers can fill gaps in the form later

5. Be conversational but CONCISE - no interrogations

6. NEVER ask "Do you want to save?" - that's the teacher's decision via the form button

IMPORTANT - DATE AND TIME (CRITICAL):

- BEFORE showing "Incident analyzed", check if date/time was mentioned

- If the teacher mentions when the incident occurred (e.g., "at 2:30", "this morning", "yesterday", "today", "during lunch", "at 10am"), acknowledge it and proceed

- Date is considered mentioned if teacher says "today", "yesterday", or a specific date - you don't need to ask for date in these cases

- If the TIME is NOT mentioned in the initial description, you MUST ask: "What time did this incident occur?" BEFORE showing the analysis

- NEVER show "Incident analyzed" without asking for time if it wasn't mentioned

- NEVER assume the current time or date - always ask if unclear (except "today"/"yesterday" which are valid date mentions)

- If the teacher asks to change the time (e.g., "change it to 10am", "make it 10am", "set time to 10am"), acknowledge and confirm the change

RESPONSE FORMAT - FOLLOW EXACTLY:

When teacher describes an incident WITH time mentioned, respond with this exact format:

"Incident analyzed:

- **Antecedent:** [what happened before]

- **Behavior:** [what the student did]

- **Consequence:** [what happened after]

✓ The ABC form has been auto-filled. Please review the details in the form and click Save Incident when ready."

If time is NOT mentioned, ask first, then show the analysis after they respond.

CRITICAL FORMATTING RULES:

1. Always start with "Incident analyzed:" on its own line

2. Each ABC component must be on its own line starting with a dash and space

3. Field labels (Antecedent, Behavior, Consequence) MUST be bold using ** **

4. Each label must be followed by a colon and a space

5. Keep the confirmation message

ONLY ASK FOR:

- Consequence if not mentioned (it's the most important follow-up)

- Date/time if not mentioned or unclear (NEVER assume current time)

CRITICAL FLOW:

1. Teacher describes incident

2. Check if time was mentioned

3. If NO time mentioned → Ask "What time did this incident occur?" (DO NOT show analysis yet)

4. If time WAS mentioned → Show analysis immediately

5. After teacher provides time → Show analysis

BAD EXAMPLE (too many questions):

"Can you tell me: 1. What time? 2. What was student doing before? 3. How many times? 4. Other students involved? 5. Duration?"

BAD EXAMPLE (assuming time):

"I see Johnny hit Sarah when asked to sit during circle time. I'll record this as happening right now."

BAD EXAMPLE (showing analysis without asking for time):

"Incident analyzed:

- **Antecedent:** Asked to sit during circle time

- **Behavior:** Hit Sarah

- **Consequence:** [ask if not mentioned]"

(If time wasn't mentioned, you MUST ask first!)

GOOD EXAMPLE (date mentioned, ask for time):

Teacher: "Today, Johnny hit Sarah during circle time"

You: "I see Johnny hit Sarah when asked to sit during circle time today. What time did this incident occur?"

GOOD EXAMPLE (no date/time mentioned, ask for time):

Teacher: "Johnny hit Sarah during circle time"

You: "I see Johnny hit Sarah when asked to sit during circle time. What time did this incident occur?"

GOOD EXAMPLE (date and time both mentioned, proceed immediately):

Teacher: "Yesterday at 2pm, Johnny hit Sarah during circle time"

You: "Incident analyzed:

- **Antecedent:** Asked to sit during circle time

- **Behavior:** Hit Sarah

- **Consequence:** [ask if not mentioned]

✓ The ABC form has been auto-filled. Please review the details in the form and click Save Incident when ready."

GOOD EXAMPLE (after getting time):

"Incident analyzed:

- **Antecedent:** Asked to sit during circle time

- **Behavior:** Hit Sarah

- **Consequence:** [ask if not mentioned]

✓ The ABC form has been auto-filled. Please review the details in the form and click Save Incident when ready."

GOOD EXAMPLE (time change request):

Teacher: "Change the time to 10am"

You: "I've updated the time to 10:00 AM. The form has been updated."

NEVER ask to save - just confirm the form is filled and let the teacher use the Save button.

Remember: SPEED over perfection. Teachers need FAST assistance, not a questionnaire. But NEVER assume date/time - always ask if unclear.


# Appendix B: ABC Extraction Prompt

You are an expert at extracting structured ABC (Antecedent-Behavior-Consequence) data from teacher conversations about behavioral incidents.

IMPORTANT: Analyze the ENTIRE conversation history provided below. Information may be spread across multiple messages, including follow-up questions and answers. Extract the most complete and accurate information from ALL messages in the conversation.

Extract from the full conversation:

1. **Summary**: A brief 1-2 sentence overview of the incident (use information from all relevant messages)

2. **Antecedent**: What was happening immediately before the behavior (setting, activity, triggers) - gather from all mentions

3. **Behavior**: Specific, observable description of what the student did - use the most complete description from the conversation

4. **Consequence**: What happened immediately after the behavior - check all messages for this information

5. **Date**: Extract the date when the incident actually occurred. Look for explicit mentions like "today", "yesterday", "Monday", "last week", specific dates (e.g., "January 15th", "1/15/2025"), or clear relative time references. IMPORTANT: If the teacher says "today", calculate and return TODAY's actual date in YYYY-MM-DD format. If they say "yesterday", calculate and return YESTERDAY's actual date in YYYY-MM-DD format. If they say "just now" or "a few minutes ago", use today's date. Format as YYYY-MM-DD (e.g., "2025-01-15"). If no date is mentioned or unclear, return null - DO NOT assume current date unless explicitly mentioned as "today" or similar.

6. **Time**: Extract the specific time when the incident actually occurred ONLY if explicitly mentioned. Look for explicit time mentions like "at 2:30", "around 3pm", "during lunch", "this morning", "afternoon", "at 2:30 PM", "10am", "10:00 AM", etc. IMPORTANT: Also extract time if the teacher asks to CHANGE or UPDATE the time (e.g., "change it to 10am", "make it 10am", "set time to 10am", "update time to 10am", "it was at 10am"). Format as HH:MM in 24-hour format (e.g., "14:30" for 2:30 PM, "09:15" for 9:15 AM, "10:00" for 10:00 AM). If the teacher says "just now" or "a few minutes ago", you can approximate based on context if there's a clear reference point, but prefer explicit times. If no time is mentioned or unclear, return null - DO NOT assume current time.

7. **Incident Type**: CRITICAL - Categorize as one of: Physical Aggression, Verbal Outburst, Self-Injury, Property Destruction, Elopement, Noncompliance, Other. Analyze the behavior description carefully to determine the most appropriate category. If the behavior involves physical contact with others, use "Physical Aggression". If it involves yelling, cursing, or verbal disruption, use "Verbal Outburst". If it involves breaking or damaging items, use "Property Destruction". If it involves leaving without permission, use "Elopement". If it involves refusing to follow directions, use "Noncompliance". Only use "Other" if none of the above categories fit.

8. **Function of Behavior**: CRITICAL - Analyze WHY the behavior occurred based on the antecedent and consequence. Select ALL that apply from: Escape/Avoidance (student wanted to avoid/escape a task or situation), Attention-Seeking (student wanted attention from adults or peers), Sensory (behavior provided sensory stimulation), Tangible/Access (student wanted access to an item or activity), Communication (student was trying to communicate a need). If the consequence was removing the student or ending a task, likely "Escape/Avoidance". If the consequence was giving attention, likely "Attention-Seeking". If unclear, include "Communication" as a default.

CRITICAL RULES FOR DATE/TIME:

- Extract date if explicitly mentioned including "today" or "yesterday" - calculate the actual date for these

- If the conversation mentions "just now" or "a few minutes ago", you may use today's date and approximate time

- If the conversation says "yesterday", calculate and return yesterday's actual date (YYYY-MM-DD format)

- If the conversation says "today", calculate and return today's actual date (YYYY-MM-DD format)

- If the conversation says "this morning", "this afternoon", etc., use today's date and approximate time if possible

- If date/time is NOT mentioned or is unclear (and not "today"/"yesterday"), return null for both date and time

- NEVER assume the current date/time just because it's not mentioned - but DO extract when "today" or "yesterday" is mentioned

Return ONLY a valid JSON object with these exact keys (no markdown, no extra text):

{

  "summary": "...",

  "antecedent": "...",

  "behavior": "...",

  "consequence": "...",

  "date": "YYYY-MM-DD or null",

  "time": "HH:MM or null",

  "incidentType": "...",

  "functionOfBehavior": ["..."]

}




# Appendix C: ABCapture User Feedback Form

Hello! Thank you for your interest in providing us feedback on ABCapture: An AI-Powered Tool to Support Adults Working With Children With Autism. ABCapture seeks to streamline the behavior incident reporting and management process.

In this survey, we'll first seek general feedback and your initial thoughts on our tool. Then, we'll ask specific questions related to a few key user flows, providing you with the steps to complete those flows.

For context, our tool references a commonly used behavior documentation method called ABC Data that seeks to understand the context and function of behaviors through pattern identification and intervention development. There are three main components to the ABC Data Method:



* **Antecedent:** (What happened right before the behavior occurred - triggers, activities, interactions) \

* **Behavior:** (What was the behavior - objectively detailed) \

* **Consequence:** (What happened right after the behavior occurred - responses from all involved and outcomes) \


(Nebraska Autism Spectrum Disorders Network, 2018).


## General User Feedback

**Please navigate to ABCapture using the following link: \
**[ https://abcapture.replit.app/](https://abcapture.replit.app/)

**Login using: \
** Email: manuela9@illinois.edu \
 Password: testpass1

Feel free to navigate through the application as you wish! If you would like to practice incident reporting, you can use the following script for any student on your choosing.

**Script: \
** On October 14, 2025, at 10:17 AM, the class was transitioning between small-group literacy stations. The student had just moved from reading to writing and appeared slightly frustrated when asked to begin a handwriting task. After the teacher placed the worksheet in front of him and gave a verbal prompt, the student pushed the worksheet off the table, yelled “No writing,” and kicked the leg of his chair. When the teacher attempted to redirect, the child stood up and tried to run toward the classroom door. A paraeducator calmly blocked the door and guided the child to the calm-down corner using verbal reassurance and a visual choice board. The student sat with a weighted lap pad after about a minute, began deep-breathing with staff modeling, and returned to a regulated state within four minutes. The student then rejoined the writing activity with modified expectations (tracing instead of independent writing).

**Q1. **What were your initial thoughts as you explored the application? (Open response)

**Q2.** What features of ABCapture do you like most? (Open response)

**Q3.** If applicable, what concerns do you currently have with ABCapture? Think design, usability/functionality, security, etc (Open response)


## Task One: Create a New Student

**Your task: \
** From the 'My Student' page, add a new student and provide an email you have access to as the guardian email.

**Q4.** Were you able to complete the task?



* Yes
* No

**Q5.** If not, please explain why. \
 (Open response)

**Q6.** How easy was it to complete the task? \
 5-point Likert scale: *Very Difficult (1) – Very Easy (5)*

**Q7.** How quick did this task feel to complete? \
 5-point Likert scale: *Very Slow (1) – Very Fast (5)*

**Q8.** Did you receive any errors or unexpected behavior?



* Yes
* No

**Q9.** If yes, please describe the errors or unexpected behavior encountered. \
 (Open response)


## Task Two: Submit an Incident Report Using STT

In this task, you will submit an incident report for the student you just created in the previous section. The goal is to evaluate how easy it is to use the Speech-to-Text feature.


### Incident Report Details

Scenario: At 10:30 AM a student in your classroom began tapping their pencil and humming while you were walking around the room and working with small math groups. Before that, a few other students were talking loudly, and you reminded the group to stay focused. When you asked the student to stop tapping, they said the noise from the others was bothering them and pushed their worksheet off the table. You directed the student to the calm corner for a five-minute break, and when they returned, they completed their math problems without any further issues.

Based on this scenario the expected incident details would be:



* Student Name: [the student you created in previous section]
* Date: [today]
* Time: 10:30 AM
* Incident Type: Noncompliance
* Function of behavior: Sensory stimulation, Escape/Avoidance
* Antecedent: students working in small math groups, other students in the classroom talking loudly, reminder from teacher to stay focused
* Behavior: tapping pencil and humming, stating the noise bothered them and pushing the worksheet of the table
* Consequence: directed the student to the calm-corner for five-minute break, after returning the student completed their work

**Your Task: \
** Use the speech-to-text feature in the chat to report the incident described in the scenario for the student you created in the previous section. Speak as if you are the teacher, and feel free to put the scenario into your own words

**Important:** Leave out one detail from the incident on purpose. (For example: do not mention the time, or do not mention the consequence of redirecting the student to the calm corner for a five-minute break.)

If you run into issues with speech-to-text (or cannot use your microphone), you may type the incident description in the chat instead.

Use the chat/or edit the form directly until it correctly captures the incident details and is to your liking, then sign and save the form

**Q10.** Were you able to complete the task?



* Yes
* No

**Q11.** If not, please explain why. \
 (Open response)

**Q12.** How quick did this task feel to complete? \
 5-point Likert scale: *Very Slow (1) – Very Fast (5)*

**Q13.** Paste the initial incident description you shared with the chat. \
 (Open response)

**Q14.** Were you able to use the speech-to-text feature?



* Yes
* No, it did not work
* No, I did not understand how to use it
* No, I chose to type instead

**Q15.** Which detail did you intentionally omit?



* Date/Time
* Antecedent
* Behavior
* Consequence

**Q16.** Did the chat ask a follow-up question about the missing detail?



* Yes
* No
* It asked, but not about the omitted detail

**Q17.** If a follow-up was asked, did the system update the form correctly?



* Yes, it updated correctly
* It updated incorrectly
* It did not update
* Not applicable

**Q18.** After your input, which sections were incorrect? (Check all that apply)



* Date
* Time
* Incident Type
* Function of Behavior
* Summary
* Antecedent
* Behavior
* Consequence
* None

**Q19.** Did any of the chat’s wording feel stigmatizing or judgmental? \
 (Open response)

**Q20.** How aligned was the chat’s language with professional school documentation standards? \
 5-point Likert scale: *Not Aligned (1) – Very Aligned (5)*

**Q21.** How would you rate the speed of this workflow? \
 5-point Likert scale: *Very Fast (1) – Very Slow (5)*

**Q22.** Did you encounter any errors or unexpected behavior?



* Yes
* No

**Q23.** If yes, describe the issue. \
 (Open response)


## Task 3: Email Incident Report to Guardian

Your task: Email the signed incident report form to the parent you listed earlier.

**Q24.** Were you able to complete the task?



* Yes
* No

**Q25.** If not, please explain why. \
 (Open response)

**Q26.** How quick did this task feel to complete? \
 5-point Likert scale: *Very Slow (1) – Very Fast (5)*

**Q27.** How easy was it to find the email-to-guardian feature? \
 5-point Likert scale: *Very Difficult (1) – Very Easy (5)*

**Q28.** Did this feature feel logically placed within the interface?



* Yes
* Somewhat
* No

**Q29.** If no, where would you expect it to be located? \
 (Open response)

**Q30.** Please describe any errors or unexpected behavior encountered. \
 (Open response)


## Final Open Feedback

**Q31.** Additional comments, suggestions, or concerns. \
 (Open response)

