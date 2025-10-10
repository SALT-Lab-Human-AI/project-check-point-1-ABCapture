# Prompting Protocol for Evaluating AI Speech-to-Text and Summarization Tools

## Purpose
This protocol defines the scenarios, prompts, and tasks used to evaluate multiple AI tools for their ability to:
1. Accurately transcribe short classroom speech (or text when STT not available) segments describing behavioral incidents.
2. Generate concise summaries of incidents.
3. Complete or assist in filling out an ABC (Antecedent–Behavior–Consequence) form.
4. Accurately tag incident documents (document tagging) — extract and label student name, incident type, date, and inferred behavior function(s).
5. Handle typical, edge, and failure cases relevant to classrooms supporting elementary school students with Autism Spectrum Disorder (ASD).

## Tools
Most school behavioral incident forms are completed manually (paper forms) or via proprietary digital behavior-tracking systems. Those specialized proprietary tools often have limited or no accessible AI capabilities and we do not have direct access for testing. To evaluate what teachers can already use today, we selected several widely-available, generalized AI tools to test how they handle speech-to-text, summarization, ABC extraction, and document tagging in classroom incident logging. The tools we tested are:

![ChatGPT logo](https://img.shields.io/badge/ChatGPT-00A67A?logo=openai&logoColor=white&style=flat-square) ![Copilot Studio logo](https://img.shields.io/badge/Copilot%20Studio-1389FF?logo=github-copilot&logoColor=white&style=flat-square) ![NotebookLM logo](https://img.shields.io/badge/NotebookLM-4285F4?logo=google&logoColor=white&style=flat-square) ![NotionAI logo](https://img.shields.io/badge/NotionAI-000000?logo=notion&logoColor=white&style=flat-square)

## Evaluation Dimensions

| Dimension | Guiding question | Quick checks |
|---|---|---|
| **STT Accuracy** | Is the transcription accurate? | Word-error rate, handling of overlapping speech and background noise. |
| **Summary Quality** | Is the summary clear and complete? | Preserves antecedent/behavior/consequence, concise wording, avoids hallucination, suitable tone for teachers/parents. |
| **ABC extraction** | Are ABC elements correctly identified? | Correct labeling, completeness of each element, consistent time/location/staff details|
| **Document Tagging** | Are tags accurate and complete? | Field accuracy (name, date, incident type, function of behavior(s)), multi-tag function of behavior when neccesary |
| **Usability** | Is the tool easy to use and fast? | Clarity of required inputs, intuitive navigation, latency to first usable result |
| **Ethical Compliance** | Is language objective and is PII protected? | Non‑stigmatizing phrasing, does not provide medical/diagnostic advice, protects PII/sensitive data, states uncertainty or asks clarifying questions, avoids fabrication. |
| **Failure handling & Robustness** | Does it handle noise or ambiguity well? | explicit uncertainty, ability to separate multiple incidents and handle overlapping student behaviors. |

## Scenario Categories

### ✅ Typical Classroom Incidents
**Goal:** Test average use cases under realistic conditions.  
-  Teacher describes behavioral incident and provides all necessary details to complete the ABC form.    

### ⚠️ Edge Cases
**Goal:** Test how models handle nuanced or atypical incidents. 
- Teacher describes behavioral incident and does not initially provide all necessary details to complete the ABC form.
- Emotional tone or sarcasm (“that went great… not really”) to test contextual understanding.  
- Two students interact; unclear who initiated behavior.  
- Teacher describes multiple incidents in one recording.  

### ❌ Failure Cases
**Goal:** Test limits of the systems.  
- Audio includes significant background noise or overlapping voices.
- Input is unrrelated to behavior logging
