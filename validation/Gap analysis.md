# Gap Analysis

## NotebookLM
The team’s evaluation of NotebookLM showed that while it performs well in summarizing structured text, it lacks several features needed for real classroom documentation. In terms of **accuracy**, NotebookLM generated clear summaries when inputs were well written but often missed emotional tone and contextual nuance. **Reliability** was consistent, though outputs tended to sound formal and detached. Regarding **latency**, the system responded within a reasonable time but required multiple steps such as uploading sources, selecting them, and then prompting which made it slower and less efficient for teachers working in real time.

There was clear **UX friction** since NotebookLM does not support **voice input** and cannot **automatically tag incidents** without manual prompting. These limitations make it impractical for teachers to use while managing a class. In terms of **safety**, the tool relies on Google’s cloud infrastructure, meaning data privacy is dependent on external policies and not explicitly FERPA-compliant. **Cost** is currently not a concern while in beta, but future pricing remains uncertain.  

Overall, the team concluded that NotebookLM is effective for structured text summarization but lacks automation, emotional awareness, and real-time usability. These weaknesses highlight the opportunity for ABCapture to introduce hands-free voice logging, automatic tagging, and secure data management tailored to education settings.

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

