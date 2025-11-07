<img src="https://github.com/SALT-Lab-Human-AI/project-check-point-1-ABCapture/blob/main/app/attached_assets/ABCapture%20logo.png" width="350" alt="ABCapture logo">


# ABCapture: An AI-Powered Tool to Support Adults Working With Children With Autism
#### By: Jiya Chachan, Sara Kiel, Manuela Rodriguez, Rithika Vennamaneni

Presentation Link for Checkpoint 3: https://www.canva.com/design/DAG3xkBlkw8/fQ3ZyWkxaF1DmHBwgC2vow/edit?utm_content=DAG3xkBlkw8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

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


### Our Concept and Value Proposition

**ABCapture** streamlines the incident reporting and logging process by:
1. Using AI to guide teachers through structured data collection
2. Automatically extracting ABC data components from natural language descriptions
3. Organizing incidents with visual block indicators for each ABC data component
4. Providing analytics to identify behavior patterns and functions
5. Generating professional reports for parents and specialists

### Understanding ABC Data Collection

**What is ABC Data?**

ABC data is a systematic observation method used in Applied Behavior Analysis (ABA) to understand the context and function of behaviors. It’s a cornerstone of behavioral documentation in special education, helping educators and specialists identify patterns and develop effective intervention strategies [(Nebraska Autism Spectrum Disorders Network, 2018).](https://asdnetwork.unl.edu/virtual-strategies/abc-data/)

**The Three Components:**

 **Antecedent** (What happened BEFORE)
- The trigger or event that occurred immediately before the behavior
- Environmental factors, activities, or interactions that set the stage
- Helps identify what prompts or precipitates the behavior
- *Example:* "Teacher asked student to transition from recess to math class”

 **Behavior** (What ACTUALLY happened)
- The observable, measurable action or response
- Should be described objectively without interpretation
- Include duration, intensity, and specific details
- *Example:* "Student threw pencil across room, yelled 'I hate math!' and pushed desk”

 **Consequence** (What happened AFTER)
- The response or outcome following the behavior
- How adults, peers, or environment reacted
- Helps understand what maintains or reinforces the behavior
- *Example:* "Student was removed from classroom, missed math lesson, received one-on-one attention from counselor”

**Why ABC Data Matters:**

- **Identify Patterns:** Recognize triggers and environmental factors that contribute to behaviors
- **Understand Function:** Determine why behaviors occur (escape, attention, sensory, tangible)
- **Develop Interventions:** Create targeted, evidence-based behavior support plans
- **Track Progress:** Monitor effectiveness of interventions over time
- **Collaborate Effectively:** Share objective data with teams, parents, and specialists
- **Legal Documentation:** Maintain required records for IEPs and behavior plans

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
- **All Members**: Contributed to the **initial prototype** through a 3.5 hour collaborative coding session in Replit conducted via Zoom. 

---

**Checkpoint 3: Working Implementation & Live Demo**
- **All Members**: Collaborated on building a full-stack working prototype with comprehensive features. Work was split up evenly using the Project Roadmap Tasks, and then members met live via Zoom for 3 hours to finalize details prior to the Checkpoint 3 Presentation.

**Key Features Implemented:**
- ✅ AI-powered chatbot for incident recording (Groq Llama 3.3 70B)
- ✅ Voice-to-text transcription with PII protection (Groq Whisper)
- ✅ Automatic ABC data extraction from natural language
- ✅ Student profiles with colorful avatar icons
- ✅ Comprehensive analytics (14-day trends, function analysis, week-over-week comparison)
- ✅ Draft and signed incident status with digital signatures
- ✅ Report edit history tracking
- ✅ Parent email communication system
- ✅ Privacy mode for presentations
- ✅ Role-based access (Teacher/Administrator)
- ✅ Advanced filtering (status, grade, behavior type)
- ✅ Export and print functionality
- ✅ Responsive design for desktop

---

**Checkpoint 4: Evaluation & Final Report (Planned)**
- **Jiya**: Will lead the **user study design** and data analysis, including both quantitative (task success, satisfaction) and qualitative insights. Will draft the **Results** and **Discussion** sections.  
- **Sara**: Will edit and compile the **Final Report** (3,500–4,500 words), write the **Related Work** and **Future Work** sections, and manage final formatting and submission.  
- **Manuela**: Will synthesize qualitative feedback, design **charts and visuals** for the report, and help prepare the **final presentation**.  
- **Rithika**: Will consolidate all **final deliverables** (code, cleaned data, scripts, and prompt files), document **Methodology** and **Risks & Limitations**, and ensure reproducibility.

---

**AI Disclosure**

Cursor. (2024). Cursor: The AI code editor. https://www.cursor.com

Windsurf. (2024). Windsurf: The AI-native IDE. https://www.windsurf.com

Replit. (2024). Replit: Build software faster with AI. https://replit.com

Anthropic. (2024). Claude: The AI assistant for work and research. https://www.anthropic.com/claude


