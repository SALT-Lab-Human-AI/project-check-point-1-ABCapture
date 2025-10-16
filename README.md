<img width="288" height="68" alt="Screenshot 2025-10-15 at 5 40 14 PM" src="https://github.com/user-attachments/assets/9aac386a-a5ee-4a27-860c-a7a9803059e4" />


# ABCapture: An AI-Powered Tool to Support Adults Working With Children With Autism
#### By: Jiya Chachan, Sara Kiel, Manuela Rodriguez, Rithika Vennamaneni

### Problem statement and why it matters
Teachers who support autistic students need a fast, accurate way to capture what happened during conflicts, but in real classrooms they can’t stop to type long notes, so details often get lost. When records are messy or missing, it’s harder to spot patterns, adjust supports, and share clear updates with parents and specialists. Our project aims to fix this by making incident logging and organization quick and simple with voice-to-text, auto-summaries, and smart tags - turning a painful admin chore into a simple habit that actually helps students. In the long run, this can improve communication, reduce teacher stress, and create a more supportive environment for students.

### Target users and core tasks
Our target users are teachers working with autistic children, along with school specialists, administrators, and parents who need clear updates. <br> 
The core tasks include logging incidents quickly through voice-to-text, generating auto-summaries so details are easy to understand, organizing notes with AI tags, and making it simple to search and review past events. Together, these tasks save teachers time, reduce stress, and create clearer communication between everyone involved.

### Competitive landscape: existing systems/tools and their shortcomings
- AI-powered behavior tracking tools and incident logging apps exist that attempt to document observations through manual entry or some voice recognition features. However, many require significant manual input, lacking real-time voice-to-text integration combined with meaningful summaries and tagging [(Li et al., 2024).](https://www-tandfonline-com.proxy2.library.illinois.edu/doi/full/10.1080/1034912X.2013.846470)
- Specialized speech-to-text and dictation software are widely used in education, but these often are generic and not tailored to the nuanced documentation needs of autistic-related behaviors in busy classrooms [(Nebraska Autism Spectrum Disorders Network, 2018).](https://asdnetwork.unl.edu/virtual-strategies/abc-data/)
- Behavior analytic tools commonly use ABC (Antecedent-Behavior-Consequence) data collection frameworks but remain manual and fragmented, rarely integrated into a seamless AI-powered workflow for teachers [(Nebraska Autism Spectrum Disorders Network, 2018).](https://asdnetwork.unl.edu/virtual-strategies/abc-data/)
- Some AI interventions focus on improving engagement via interactive games, virtual reality, or robots, but they do not address efficient, accurate record-keeping or teacher workflows [(Li et al., 2024).](https://www-tandfonline-com.proxy2.library.illinois.edu/doi/full/10.1080/1034912X.2013.846470)

### Initial concept and value proposition
Our initial concept is to build a simple AI-powered tool with two main features: a **Voice-to-Text Incident Logger with Auto-Summary** and an **AI Document/File Organizer that Tags & Summarizes Notes**. Teachers can press a button, describe what happened, and instantly get both a transcript and a short summary of the conflict. The system will then store the record, add tags such as student name, type of conflict, and date, and keep everything organized in one place for easy searching and reviewing. This creates clearer communication with specialists and parents, makes support plans more effective, and turns documentation into a quick, reliable process instead of a stressful chore.

### Milestones & roles

**Checkpoint 1: GitHub Kickoff + Proposal & Literature**

* Set up GitHub repo with README, proposal, and folder structure
* Collect at least 8 relevant papers and add reflections
* Draft problem statement, target users, competitive landscape, and concept
* Prepare short in-class presentation

**Checkpoint 2: Prompt-Based Validation & Concept Feedback**

* Design prompting study across 3+ tools (e.g., ChatGPT, Perplexity, NotebookLM)
* Collect transcripts, outputs, and run gap analysis
* Draft DESIGN\_SPEC.md with user journeys, task flows, and key screens
* Create lightweight prototype (Figma or sandbox demo)
* Present prompting evidence, gaps, and refined concept

**Checkpoint 3: Working Implementation & Live Demo**

* Build end-to-end working prototype with both main features: Voice-to-Text Incident Logger with Auto-Summary, AI Document/File Organizer that Tags & Summarizes Notes
* Deploy live demo (or provide local run instructions)
* Add source code, config files, architecture diagram, and basic tests
* Address safety, privacy, and logging considerations
* Live walk-through demo + technical explanation

**Checkpoint 4: Evaluation & Final Report**

* Run user study or experiments to evaluate tool usefulness and reliability
* Collect both quantitative (e.g., task success, error rate, satisfaction) and qualitative feedback
* Write final report (\~3,500–4,500 words) including intro, related work, method, results, risks, and future work
* Package final artifacts (deployed link, cleaned data, prompt files, scripts, figures)
* Present key findings, lessons, and demo highlights
---

### Team Contributions

**Checkpoint 1: GitHub Kickoff + Proposal & Literature**
- **Jiya**: Set up the GitHub repository and created the **README** file.  
- **All Members**: Reviewed and reflected on **2 literature papers each**, contributing to a collective understanding of existing tools and research.  
- **Sara & Manuela**: Wrote the **project proposal**, including the problem statement, target users, and concept overview.  

---

**Checkpoint 2: Prompt-Based Validation & Concept Feedback**
- **All Members**: Participated in the **Prompting Protocol**, with **each member testing one AI tool** - Notion AI (Manuela), NotebookLM (Jiya), Copilot Studio (Sara), gpt(Rithika).
- **Manuela**: Synthesized the prompting protocol results and summarized the team's conclusions in **Gap Analysis**
- **Jiya**: Created **Opportunity Framing** based on all above results and findings.
- **Rithika**: Worked on the task flows and key screens sections of **DESIGN_SPEC.md**
- **Sara**: Worked on the user journeys section of **DESIGN_SPEC.md**
- **All Members**: Contributed to the **initial prototype** through a 3-hour collaborative coding session in Replit conducted via Zoom. 

---

**Checkpoint 3: Working Implementation & Live Demo (Planned)**
- **Jiya**: Will implement the **Voice-to-Text Incident Logger**, integrating speech-to-text and auto-summary functionality. Will update setup and run instructions in the README.  
- **Sara**: Will develop the **AI Document/File Organizer** with smart tagging logic, and create the **system architecture diagram** along with privacy & safety documentation.  
- **Manuela**: Will focus on **UI/UX design** and front-end layout, conduct usability testing, and prepare the **demo walkthrough presentation**.  
- **Rithika**: Will handle **back-end integration** between the logger and organizer modules, create **sample datasets** for the demo, and assist with final testing and debugging.  

---

**Checkpoint 4: Evaluation & Final Report (Planned)**
- **Jiya**: Will lead the **user study design** and data analysis, including both quantitative (task success, satisfaction) and qualitative insights. Will draft the **Results** and **Discussion** sections.  
- **Sara**: Will edit and compile the **Final Report** (3,500–4,500 words), write the **Related Work** and **Future Work** sections, and manage final formatting and submission.  
- **Manuela**: Will synthesize qualitative feedback, design **charts and visuals** for the report, and help prepare the **final presentation**.  
- **Rithika**: Will consolidate all **final deliverables** (code, cleaned data, scripts, and prompt files), document **Methodology** and **Risks & Limitations**, and ensure reproducibility.  

---
