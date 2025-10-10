# Gap Analysis
See [Evaluation Dimensions](https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/validation/Prompting%20protocol.md#evaluation-dimensions) in [Prompting Protocol](https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/validation/Prompting%20protocol.md#evaluation-dimensions) for evaluation rubric.

## NotebookLM

| **Dimension** | **Guiding question** | **NotebookLM Findings** |
|----------------|----------------------|-----------------------------------------------|
| **STT Accuracy** | Is the transcription accurate? | ❌ Not applicable — NotebookLM only handles written text, not live speech. Cleaned messy input well but cannot process overlapping or noisy audio. |
| **Summary Quality** | Is the summary clear and complete? | ✅ Accurate and concise with no hallucinations. ❌ Tone often too formal or detached; lacked emotional nuance. |
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
| STT Accuracy       | Is the transcription accurate? | TBD            |
| Summary Quality    | Is the summary clear and complete? | The agent returns a neatly organized and complete summary of the incident, splitting up the user's information into general incident information, ABC Data categories, and behavior function hypothesis.           |
| ABC Extraction     | Are ABC elements correctly identified? | Text: The agent is accurately able to determine whether ABC data has been included in the report or not, and prompts the user to provide the information if it has not been included. ABC data is categorized correctly (Antecedent, Behavior, & Consequence). Speech: TBD.           |
| Document Tagging   | Are tags accurate and complete? | TBD             |
| Usability          | Is the tool easy to use and fast? | The agent is easy to interact with and the conversation flows quickly and smoothly. The user is not required to step in to complete the reporting process beyond providing the initial incident details and any details that were initially left out.           |
| Ethical Compliance | Is language objective and is PII protected? | The agent uses objective language as instructed to. As it is currently set-up, it does not seem able to accurately identify all instances of more subjective language-use by the user.         |
| Failure handling & Robustness | Does it handle noise or ambiguity well? | TBD           |

