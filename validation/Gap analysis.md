# Gap Analysis
See [Evaluation Dimensions](https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/validation/Prompting%20protocol.md#evaluation-dimensions) in [Prompting Protocol](https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/validation/Prompting%20protocol.md#evaluation-dimensions) for evaluation rubric.

## NotebookLM

| **Dimension** | **Guiding question** | **NotebookLM Findings** |
|----------------|----------------------|-----------------------------------------------|
| **STT Accuracy** | Is the transcription accurate? | ❌ Not applicable — NotebookLM only handles written text, not live speech. Cleaned messy input well but cannot process overlapping or noisy audio. |
| **Summary Quality** | Is the summary clear and complete? | ✅ Accurate and concise with no hallucinations. Tone often too formal appropriate for parent/teacher communication. |
| **ABC Extraction** | Are ABC elements correctly identified? | ✅ Correctly identified Antecedent, Behavior, Consequence in structured text. ❌ Missed subtle emotional or contextual cues in messy input. |
| **Document Tagging** | Are tags accurate and complete? | ✅ Produced relevant and multi-layered tags (student, behavior type, resolution). ❌ Manual prompting required; can’t auto-tag; no date/time capture. |
| **Usability** | Is the tool easy to use and fast? | ⚠️ Structured but multi-step workflow (upload, select, prompt); not real-time or hands-free. Latency acceptable but impractical for classrooms. |
| **Ethical Compliance** | Is language objective and is PII protected? | ✅ Neutral, non-stigmatizing language. ⚠️ Data privacy unclear; relies on Google’s cloud, not explicitly FERPA-compliant. |
| **Failure Handling & Robustness** | Does it handle noise or ambiguity well? | ⚙️ Handled messy input and multiple students fairly well. ❌ Produced rigid, report-like summaries; struggled with vague details. |

---

## ChatGPT Agent
| Dimension          | Guiding Question               | Evaluation                      |
| ------------------ | ------------------------------ | ------------------------------- |
| STT Accuracy       | Is the transcription accurate? | The agent transcribed the voice input for scenario 1 accurately, preserving the key words and meaning.            |
| Summary Quality    | Is the summary clear and complete? | Summaries were concise, neutral and captured key antecedents, behaviours, consequences and resolutions. They occasionally omitted emotional tone or intensity, which could add context.           |
| ABC Extraction     | Are ABC elements correctly identified? | The agent consistently identified the antecedent, behaviour and consequence for each scenario and asked for missing details (dates, times, observers) when necessary.           |
| Document Tagging   | Are tags accurate and complete? | Tags correctly labelled students and basic behaviour types, but did not include emotional states, severity or hypothesised functions, limiting comprehensiveness.             |
| Usability          | Is the tool easy to use and fast? | The agent was responsive and followed instructions closely, producing structured outputs without much prompting. Its step‑by‑step approach to gathering missing information helps ensure completeness but requires occasional follow‑up questions, which can slow the overall workflow.           |
| Ethical Compliance | Is language objective and is PII protected? | The agent used professional, objective language and avoided sharing personally identifiable information beyond what the user provided.         |
| Failure handling & Robustness | Does it handle noise or ambiguity well? | The agent handled messy, voice‑style input and multi‑student scenarios effectively, cleaning disfluent text and splitting combined incidents. It requested clarifications when information was missing, but did not describe the intensity or impact of behaviours, which would help gauge severity.           |

---

## Copilot Studio

| Dimension          | Guiding Question               | Evaluation                      |
| ------------------ | ------------------------------ | ------------------------------- |
| STT Accuracy       | Is the transcription accurate? | ✅ Incident reports were transcribed accurately and details were maintained. ⚠️ As audio quality lowers or more background noise is introduced, the accuracy lowers slightly. ⚠️ Copilot has an option to "increase accuracy with agent data," but this feature hasn't been tested yet. |
| Summary Quality    | Is the summary clear and complete? | ✅ The agent returns a neatly organized and complete summary of the incident, splitting up the user's information into general incident information, ABC Data categories, and behavior function hypothesis. |
| ABC Extraction     | Are ABC elements correctly identified? | ✅ The agent is accurately able to determine whether ABC data has been included in the report or not, and prompts the user to provide the information if it has not been included. ✅ ABC data is categorized correctly (Antecedent, Behavior, & Consequence). |
| Document Tagging   | Are tags accurate and complete? | ✅ The agent correctly names reports with basic incident information, such as student name, date and time, and incident time. ✅ It also was able to recommend relevant tags related to behavior type, incident intensity, etc., but ❌ does not have the ability to add these tags into Box. |
| Usability          | Is the tool easy to use and fast? | ✅ The agent is easy to interact with and the conversation flows quickly and smoothly. ✅ The user is not required to step in to complete the reporting process beyond providing the initial incident details and any details that were initially left out. |
| Ethical Compliance | Is language objective and is PII protected? | ✅ The agent uses objective language as instructed to. ⚠️ As it is currently set-up, it does not seem able to accurately identify all instances of more subjective language-use by the user. ⚠️ It is unclear how the agent's settings for 'Secure Inputs' and 'Secure Outputs' might contribute to FERPA and other privacy/ethical concerns with student data. |
| Failure handling & Robustness | Does it handle noise or ambiguity well? | ⚠️ As mentioned in STT Accuracy, noise in audio can impact transcription accuracy. ⚠️ Additionally, as mentioned previously in Ethical Compliance, the agent struggled to identify all instances of subjective language-use, failing slightly at failure handling. ❓ The agent's ability to detect multiple incident reports at once and file them correctly has not been tested yet. |

---

## Notion AI
| **Dimension**                     | **Guiding Question**                        | **Quick Checks**                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **STT Accuracy**                  | Is the transcription accurate?              | ✅ **Low word-error rate** (≈0.02%)<br>✅ **Handled background noise well** — in scenario 6, only 3 background words were inserted from classroom audio.                                                                                                                                                                                                                                             |
| **Summary Quality**               | Is the summary clear and complete?          | ✅ **Concise, neutral tone** appropriate for parent/teacher communication, even with sarcasm (scenario 3).<br>✅ **No hallucinations observed.**<br>❌ **Inconsistent structure** across scenarios; only used ABC format when explicitly mentioned (scenario 1).<br>❌ **Auto-generated “action items”** irrelevant to context, requiring cleanup.                                                     |
| **ABC Extraction**                | Are ABC elements correctly identified?      | ✅ **Consistent staff/time/location details** across all scenarios.<br>✅ **Captured most speaker-provided info accurately.**<br>❌ **Scenario 5, incident 1:** misclassified a behavior (“touching” → “judging”).<br>❌ **Did not separate multiple students** in scenario 4 (requires prompt tuning).<br>❌ **Final form question** correct only 2 of 6 times (scenario 6 used agent’s own response). |
| **Document Tagging**              | Are tags accurate and complete?             | ✅ **Student name, date, and incident type** tagged correctly every time.<br>🟡 **Scenario 3:** used a single “multiple functions” tag instead of multi-tagging.<br>✅ **Other multi-tag cases** handled accurately.                                                                                                                                                                                 |
| **Usability**                     | Is the tool easy to use and fast?           | ✅ **Transcription + summary:** 8.33 s (avg).<br>✅ **Form filling:** 29.83 s (avg).<br>✅ **Tagging:** 27.40 s (avg).<br>❌ **Requires setup** of database + template (moderate learning curve).<br>❌ **Workflow split** between audio upload and agent interaction.                                                                                                                                  |
| **Ethical Compliance**            | Is language objective and is PII protected? | ✅ **No stigmatizing phrasing.**<br>🟡 **Three instances** of medical/diagnostic tone.<br>✅ **“Undetermined” label** for missing info + clarification prompt.<br>✅ **Notion AI does not train on user data.**<br>❌ **Third-party vendor risk** for student data.<br>❌ **Paid plan required** — may be costly for schools.                                                                           |
| **Failure Handling & Robustness** | Does it handle noise or ambiguity well?     | ❌ **Fails to split** multiple incidents into separate forms unless explicitly stated.<br>❌ **Fails to split** multiple student behaviors into separate forms unless explicitly stated.<br>                                                                                                                                                                                                                            |
---
## Collaborative Gap Analysis

After individually evaluating different tools, we compared results to identify both common strengths and limitations. Across systems, we found that most tools perform well in key areas:

- **Speech-to-Text (STT) Accuracy** — When available, transcription quality was consistently high and handled moderate background noise effectively.  
- **Summary Generation** — Summaries were generally concise, context-appropriate, and avoided hallucinations.  
- **ABC Extraction** — Tools correctly identified antecedents, behaviors, and consequences in most cases.  
- **Document Tagging** — Student names, dates, and incident types were accurately tagged across scenarios.  

However, several overarching gaps emerged from our discussion:

- **Robustness (handling edge cases)** — None reliably separated multiple overlapping incidents or students without explicit instruction.  
- **Workflow Fragmentation** — Many systems required manual setup, multi-step uploads, or clarifying prompts, preventing a fully hands-free, in-class experience.  
- **Privacy & Accessibility** — Most tools depend on cloud vendors with unclear FERPA compliance, and subscription-based access creates barriers for schools.

