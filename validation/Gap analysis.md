# Gap Analysis

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

