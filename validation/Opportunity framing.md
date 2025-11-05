# Opportunity Framing


## Purpose  
This document outlines the **specific product opportunities and requirements** that emerged from our validation phase.  
It identifies areas where current AI tools (NotebookLM, ChatGPT Agent, Copilot Studio, Notion AI) perform well, and where important gaps remain for teachers working with autistic students in real classrooms.

---

## Key Validation Insights  
Across all systems tested, we observed consistent strengths:
- **High Speech-to-Text (STT) accuracy**, including tolerance to moderate background noise.  
- **Clear and concise summaries**, generally free from hallucinations.  
- **Correct identification of ABC (Antecedent–Behavior–Consequence) structure** when data was clearly provided.  
- **Accurate tagging** for student names, dates, and incident types.  

These results confirm that **core AI capabilities are reliable**.  
However, none of the tools provided a **fully integrated, context-aware, and privacy-safe workflow** suitable for daily use in classrooms.

---

## Opportunities Identified

### 1. Lack of Real-Time, Hands-Free Workflow  
**Problem:** Current tools require multi-step actions (record, upload, prompt) instead of instant capture.  
**Impact:** Teachers cannot use them efficiently during classroom incidents.  
**Opportunity:**  
- Enable **one-tap voice capture** and **automatic summarization** without extra prompting.  
- Support **real-time operation** so teachers can document while maintaining engagement with students.

---

### 2. Limited Handling of Multi-Student or Overlapping Incidents  
**Problem:** No tool reliably separated multiple behaviors or students within a single description.  
**Impact:** Teachers must manually split or edit records.  
**Opportunity:**  
- Implement **incident segmentation** that can distinguish multiple students or events automatically.  
- Offer **AI-assisted tagging per student** within one captured session.

---

### 3. Inconsistent Contextual Awareness  
**Finding:** Summaries were clear but often omitted subtle classroom context (e.g., emotional tone, setting, escalation cues).  
**Impact:** Reports may lose nuance that supports behavioral interpretation.  
**Opportunity:**  
- Allow optional inclusion of **contextual descriptors** (tone, intensity, environment) in summaries while keeping language objective.  
- Provide teachers with **editable fields** to add observations not captured by the AI.

---

### 4. Partial Automation in Tagging and Metadata  
**Finding:** While tools accurately generated basic tags, **most required manual prompting** and did not automatically capture metadata and had difficulty handling multi-tagging for function of behavior.  
**Impact:** Increased effort and inconsistent data entry.  
**Opportunity:**  
- Automate **metadata capture** (timestamp, user ID, student, context).  
- Expand tagging to include **behavior category and resolution type** without extra user input.

---

### 5. Fragmented Workflows Across Systems  
**Finding:** Even the best-performing tools (e.g., NotebookLM, Notion AI) required separate steps for transcription, summarization, and tagging.  
**Impact:** Disconnected workflows reduce adoption likelihood.  
**Opportunity:**  
- Build a **unified interface** integrating recording, summarization, tagging, and search.  
- Optimize for **speed and simplicity** on mobile or tablet devices.

---

### 6. Unclear Data Privacy and FERPA Compliance  
**Finding:** All tested systems rely on external cloud providers without transparent compliance guarantees.  
**Impact:** Schools may face restrictions using them for sensitive student data.  
**Opportunity:**  
- Prioritize **local or institution-controlled data storage**.  
- Ensure **FERPA-aligned policies**, anonymization, and clear data ownership terms.

---

### 7. Need for Classroom-Tuned Robustness  
**Finding:** STT performance was strong overall but not specifically optimized for **live, high-noise educational environments**.  
**Impact:** While reliable in tests, accuracy may vary under real classroom conditions with interruptions or multiple speakers.  
**Opportunity:**  
- Maintain proven STT performance but **validate further in authentic environments**.  
- Include **error-handling and edit options** for teachers to quickly correct misheard segments.

---

## Summary: Product Requirements for ABCapture  

| **Need** | **Design Requirement** | **Why It Matters** |
|-----------|------------------------|--------------------|
| **Hands-Free Real-Time Capture** | One-tap voice logging with automatic summaries | Enables practical in-class use |
| **Incident Segmentation** | AI separates multiple students/incidents | Increases accuracy and saves time |
| **Contextual Awareness** | Optionally include tone/environmental cues | Adds nuance for specialists while staying objective |
| **Auto-Tagging & Metadata** | Automatic capture of key fields (date, student, behavior type) | Standardizes data and reduces workload |
| **Unified Workflow** | Single interface from recording → review | Improves usability and adoption |
| **Privacy & Compliance** | Local or controlled storage, anonymization | Enables ethical and secure use in schools |
| **Classroom Robustness** | Validated STT under real conditions | Ensures reliability for teachers |

---

## Framing Statement  

**Opportunity:**  
Current AI tools can accurately transcribe and summarize behavioral incidents, but they lack **real-time integration, educational privacy safeguards, and unified usability**.  

**ABCapture** will fill this gap by providing a **seamless, privacy-conscious, classroom-ready tool** that combines accurate transcription, meaningful summaries, and smart organization — enabling teachers to capture critical behavioral data without losing focus on their students.

---
---
