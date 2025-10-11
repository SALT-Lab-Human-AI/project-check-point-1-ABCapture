// Conversational AI Behavioral Incident Logger

class AIIncidentLogger {
    constructor() {
        this.currentScreen = 'welcome';
        this.incidentData = {};
        this.processedData = {};
        this.isRecording = false;
        
        // Sample data for demonstration
        this.sampleInput = "This is for Jamie in my 3rd grade classroom. I'm Sarah Martinez, special education teacher. It happened today around 2:15 PM in classroom 3B. Right before the behavior, I asked the class to transition from art time to math, and Jamie was really engaged with his drawing. When I said it was time to clean up, Jamie immediately pushed his art supplies off the table, stood up quickly, and said 'No, I'm not done!' loudly. I responded by staying calm, acknowledged his feelings, and offered him two choices - he could finish his drawing during free time or take a picture of it to continue later. The whole incident lasted about 4 minutes, and he chose to take a picture and transitioned to math.";
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupCharacterCounter();
        this.preloadSampleData();
    }
    
    setupEventListeners() {
        // Main action buttons
        const processBtn = document.getElementById('process-report-btn');
        const voiceBtn = document.getElementById('voice-input-btn');
        const clearBtn = document.getElementById('clear-input-btn');
        const editBtn = document.getElementById('edit-report-btn');
        const confirmBtn = document.getElementById('confirm-report-btn');
        const newReportBtn = document.getElementById('new-report-btn');
        const viewReportsBtn = document.getElementById('view-reports-btn');
        
        // Voice modal controls
        const stopRecordingBtn = document.getElementById('stop-recording-btn');
        const cancelRecordingBtn = document.getElementById('cancel-recording-btn');
        
        if (processBtn) {
            processBtn.addEventListener('click', () => this.processReport());
        }
        
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.startVoiceInput());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearInput());
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editReport());
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmReport());
        }
        
        if (newReportBtn) {
            newReportBtn.addEventListener('click', () => this.startNewReport());
        }
        
        if (viewReportsBtn) {
            viewReportsBtn.addEventListener('click', () => this.viewReports());
        }
        
        if (stopRecordingBtn) {
            stopRecordingBtn.addEventListener('click', () => this.stopRecording());
        }
        
        if (cancelRecordingBtn) {
            cancelRecordingBtn.addEventListener('click', () => this.cancelRecording());
        }
        
        // Input validation
        const textarea = document.getElementById('incident-input');
        if (textarea) {
            textarea.addEventListener('input', () => this.validateInput());
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.processReport();
                }
            });
        }
    }
    
    setupCharacterCounter() {
        const textarea = document.getElementById('incident-input');
        const counter = document.getElementById('char-count');
        
        if (textarea && counter) {
            textarea.addEventListener('input', () => {
                this.updateCharacterCount();
            });
        }
    }
    
    updateCharacterCount() {
        const textarea = document.getElementById('incident-input');
        const counter = document.getElementById('char-count');
        
        if (textarea && counter) {
            counter.textContent = textarea.value.length;
        }
    }
    
    preloadSampleData() {
        const textarea = document.getElementById('incident-input');
        if (textarea) {
            // Add sample data as placeholder example
            textarea.placeholder = this.sampleInput;
        }
    }
    
    validateInput() {
        const textarea = document.getElementById('incident-input');
        const processBtn = document.getElementById('process-report-btn');
        
        if (textarea && processBtn) {
            const hasContent = textarea.value.trim().length > 50;
            processBtn.disabled = !hasContent;
            processBtn.classList.toggle('loading', !hasContent);
        }
        
        this.updateCharacterCount();
    }
    
    clearInput() {
        const textarea = document.getElementById('incident-input');
        const counter = document.getElementById('char-count');
        
        if (textarea) {
            textarea.value = '';
            textarea.focus();
        }
        
        if (counter) {
            counter.textContent = '0';
        }
        
        this.validateInput();
    }
    
    startVoiceInput() {
        const modal = document.getElementById('voice-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.isRecording = true;
            
            // Simulate recording process
            setTimeout(() => {
                this.simulateVoiceRecognition();
            }, 3000);
        }
    }
    
    simulateVoiceRecognition() {
        if (this.isRecording) {
            const textarea = document.getElementById('incident-input');
            if (textarea) {
                // Use sample input as voice recognition result
                textarea.value = this.sampleInput;
                this.updateCharacterCount();
                this.validateInput();
            }
            this.stopRecording();
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        const modal = document.getElementById('voice-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    cancelRecording() {
        this.isRecording = false;
        this.stopRecording();
    }
    
    processReport() {
        const textarea = document.getElementById('incident-input');
        if (!textarea || textarea.value.trim().length < 50) {
            alert('Please provide more detailed information about the incident (at least 50 characters).');
            return;
        }
        
        // Store raw input
        this.incidentData.rawInput = textarea.value.trim();
        
        // Parse data first
        this.parseIncidentData();
        
        // Show processing screen
        this.showScreen('processing');
        
        // Start processing animation
        this.animateProcessing();
    }
    
    animateProcessing() {
        const steps = document.querySelectorAll('.processing-step');
        const progressBar = document.getElementById('processing-progress');
        let currentStep = 0;
        
        // Reset animation state
        steps.forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        const processStep = () => {
            // Mark previous step as completed
            if (currentStep > 0) {
                steps[currentStep - 1].classList.remove('active');
                steps[currentStep - 1].classList.add('completed');
            }
            
            // Activate current step
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                
                // Update progress bar
                const progress = ((currentStep + 1) / steps.length) * 100;
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
                
                currentStep++;
                setTimeout(processStep, 1200);
            } else {
                // Mark last step as completed
                if (steps.length > 0) {
                    steps[steps.length - 1].classList.remove('active');
                    steps[steps.length - 1].classList.add('completed');
                }
                
                // Processing complete - transition to review screen
                setTimeout(() => {
                    console.log('Processing complete, transitioning to review screen');
                    this.showScreen('review');
                }, 800);
            }
        };
        
        // Start the animation after a brief delay
        setTimeout(processStep, 500);
    }
    
    parseIncidentData() {
        // Simulate AI parsing of the natural language input
        const input = this.incidentData.rawInput;
        const inputLower = input.toLowerCase();
        
        // Extract basic information using pattern matching
        const studentMatch = input.match(/(?:this is for|student|child)?\s*([a-zA-Z]+)(?:\s+in|\s+from)/i);
        const reporterMatch = input.match(/(?:i'm|i am|my name is)\s+([a-zA-Z\s]+)(?:,|\.|special|teacher|aide|therapist)/i);
        const roleMatch = input.match(/(special education teacher|teacher|aide|therapist|administrator)/i);
        const locationMatch = input.match(/(?:in|at)\s+(classroom\s*\w*|cafeteria|playground|[a-zA-Z\s]+room)/i);
        const timeMatch = input.match(/(?:at|around)\s*(\d{1,2}:\d{2}|\d{1,2}\s*(?:am|pm))/i);
        
        // Enhanced ABC extraction
        let antecedent = this.extractAntecedent(input);
        let behavior = this.extractBehavior(input);
        let consequence = this.extractConsequence(input);
        
        // Parse and organize data
        this.processedData = {
            student: this.extractField(studentMatch, 'Jamie'),
            reporter: this.extractField(reporterMatch, 'Sarah Martinez'),
            role: this.extractField(roleMatch, 'Special Education Teacher'),
            location: this.extractField(locationMatch, 'Classroom 3B'),
            date: new Date().toLocaleDateString(),
            time: this.extractField(timeMatch, '2:15 PM'),
            antecedent: antecedent,
            behavior: behavior,
            consequence: consequence,
            duration: this.extractDuration(input),
            summary: ''
        };
        
        // Generate summary after data is set
        this.processedData.summary = this.generateSummary();
        
        console.log('Parsed incident data:', this.processedData);
    }
    
    extractField(match, defaultValue) {
        if (match && match[1]) {
            return match[1].trim().replace(/[,.]/g, '');
        }
        return defaultValue;
    }
    
    extractAntecedent(input) {
        const antecedentIndicators = [
            /(?:right before|before|prior to|leading up to)[\s\S]*?(?:jamie|student|child|he|she)/i,
            /(?:asked|told|requested|demanded)[\s\S]*?(?:transition|change|stop|start)/i,
            /(?:was engaged|was doing|was working)[\s\S]*?(?:when|then|and)/i
        ];
        
        for (let pattern of antecedentIndicators) {
            const match = input.match(pattern);
            if (match && match[0] && match[0].length > 20) {
                return this.cleanText(match[0]);
            }
        }
        
        // Fallback: look for context before behavior keywords
        const behaviorKeywords = ['pushed', 'threw', 'said', 'yelled', 'hit', 'ran'];
        for (let keyword of behaviorKeywords) {
            const index = input.toLowerCase().indexOf(keyword);
            if (index > 50) {
                const beforeBehavior = input.substring(0, index).trim();
                const sentences = beforeBehavior.split(/[.!?]+/);
                if (sentences.length > 1) {
                    return this.cleanText(sentences[sentences.length - 1]);
                }
            }
        }
        
        return "Teacher requested transition from preferred activity to less preferred task while student was engaged.";
    }
    
    extractBehavior(input) {
        const behaviorPatterns = [
            /(?:jamie|student|child|he|she)[\s\S]*?(?:pushed|threw|hit|said|yelled|cried|ran|stood|swept)/i,
            /(?:immediately|quickly|suddenly)[\s\S]*?(?:pushed|threw|hit|said|yelled)/i
        ];
        
        for (let pattern of behaviorPatterns) {
            const match = input.match(pattern);
            if (match && match[0] && match[0].length > 15) {
                return this.cleanText(match[0]);
            }
        }
        
        // Look for action words and extract surrounding context
        const actionWords = ['pushed', 'threw', 'hit', 'said', 'yelled', 'stood', 'swept', 'crossed'];
        for (let action of actionWords) {
            const index = input.toLowerCase().indexOf(action);
            if (index !== -1) {
                const start = Math.max(0, index - 50);
                const end = Math.min(input.length, index + 100);
                return this.cleanText(input.substring(start, end));
            }
        }
        
        return "Student displayed challenging behavior including verbal protest and physical actions with materials.";
    }
    
    extractConsequence(input) {
        const consequencePatterns = [
            /(?:i responded|i said|i did|i used|consequence|after|then)[\s\S]*?(?:choice|calm|redirect|help)/i,
            /(?:responded|provided|offered|gave)[\s\S]*?(?:choice|option|help|support)/i
        ];
        
        for (let pattern of consequencePatterns) {
            const match = input.match(pattern);
            if (match && match[0] && match[0].length > 20) {
                return this.cleanText(match[0]);
            }
        }
        
        // Look for response indicators
        const responseWords = ['responded', 'offered', 'provided', 'gave', 'helped', 'redirected'];
        for (let word of responseWords) {
            const index = input.toLowerCase().indexOf(word);
            if (index !== -1) {
                const start = index;
                const end = Math.min(input.length, index + 150);
                return this.cleanText(input.substring(start, end));
            }
        }
        
        return "Staff provided calm verbal support, acknowledged feelings, and offered structured choices to help student regulate.";
    }
    
    extractDuration(input) {
        const durationMatch = input.match(/(?:lasted|duration|took)\s*(?:about|approximately)?\s*(\d+)\s*(minute|min|hour|hr)/i);
        if (durationMatch) {
            return `${durationMatch[1]} ${durationMatch[2]}${durationMatch[1] !== '1' ? 's' : ''}`;
        }
        
        const numberMatch = input.match(/(\d+)\s*(minute|min|hour|hr)/i);
        if (numberMatch) {
            return `${numberMatch[1]} ${numberMatch[2]}${numberMatch[1] !== '1' ? 's' : ''}`;
        }
        
        return '4 minutes';
    }
    
    cleanText(text) {
        return text.trim()
                   .replace(/^[^a-zA-Z]*/, '')
                   .replace(/\s+/g, ' ')
                   .charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    
    generateSummary() {
        const { student, reporter, date, time, location, antecedent, behavior, consequence } = this.processedData;
        return `On ${date} at ${time}, ${student} exhibited challenging behavior in ${location}. The incident was preceded by ${antecedent.toLowerCase()}, manifested as ${behavior.toLowerCase()}, and was addressed through ${consequence.toLowerCase()}.`;
    }
    
    showScreen(screenName) {
        console.log(`Transitioning to screen: ${screenName}`);
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            if (screenName === 'review') {
                this.populateReview();
            }
        } else {
            console.error(`Screen not found: ${screenName}-screen`);
        }
    }
    
    populateReview() {
        const reportContainer = document.getElementById('organized-report');
        if (!reportContainer) {
            console.error('Review container not found');
            return;
        }
        
        const { student, reporter, role, location, date, time, antecedent, behavior, consequence, duration } = this.processedData;
        
        reportContainer.innerHTML = `
            <div class="report-section">
                <h3 class="section-title">
                    <span class="section-icon">ℹ️</span>
                    Basic Information
                </h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Student/Child</div>
                        <div class="info-value">${student}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Reporter</div>
                        <div class="info-value">${reporter}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Role</div>
                        <div class="info-value">${role}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Location</div>
                        <div class="info-value">${location}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date</div>
                        <div class="info-value">${date}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Time</div>
                        <div class="info-value">${time}</div>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h3 class="section-title">
                    <span class="section-icon">🔗</span>
                    ANTECEDENT (What happened before)
                </h3>
                <div class="section-content">${antecedent}</div>
            </div>
            
            <div class="report-section">
                <h3 class="section-title">
                    <span class="section-icon">👁️</span>
                    BEHAVIOR (Observable actions)
                </h3>
                <div class="section-content">${behavior}</div>
                <div style="margin-top: 12px;">
                    <div class="info-item">
                        <div class="info-label">Duration</div>
                        <div class="info-value">${duration}</div>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h3 class="section-title">
                    <span class="section-icon">⚡</span>
                    CONSEQUENCE (What happened after)
                </h3>
                <div class="section-content">${consequence}</div>
            </div>
            
            <div class="report-section">
                <h3 class="section-title">
                    <span class="section-icon">📋</span>
                    AI Generated Summary
                </h3>
                <div class="section-content" style="font-style: italic; background-color: var(--color-bg-3);">
                    ${this.processedData.summary}
                </div>
            </div>
        `;
        
        console.log('Review populated successfully');
    }
    
    editReport() {
        // Return to input screen with current data pre-filled
        const textarea = document.getElementById('incident-input');
        if (textarea) {
            textarea.value = this.incidentData.rawInput;
            this.updateCharacterCount();
            this.validateInput();
        }
        
        this.showScreen('welcome');
        
        // Scroll to input
        setTimeout(() => {
            if (textarea) {
                textarea.focus();
                textarea.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }
    
    confirmReport() {
        this.showScreen('save');
        this.simulateSave();
    }
    
    simulateSave() {
        // Generate incident ID
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
        const incidentId = `INC-${year}-${month}${day}${time}`;
        
        // Show save completion after delay
        setTimeout(() => {
            this.showSaveComplete(incidentId);
        }, 3000);
    }
    
    showSaveComplete(incidentId) {
        const saveComplete = document.getElementById('save-complete');
        const generatedIdElement = document.getElementById('generated-id');
        const fileDetailsElement = document.getElementById('file-details');
        
        if (saveComplete) {
            saveComplete.classList.remove('hidden');
        }
        
        if (generatedIdElement) {
            generatedIdElement.textContent = incidentId;
        }
        
        if (fileDetailsElement) {
            const studentFolder = this.processedData.student.replace(/\s+/g, '_');
            const dateFolder = this.processedData.date.replace(/\//g, '-');
            
            fileDetailsElement.innerHTML = `
                <div class="file-item">
                    <span class="file-icon">📄</span>
                    <div class="file-info">
                        <div class="file-name">${incidentId}_ABC_Report.pdf</div>
                        <div class="file-path">/Behavioral_Incidents/${studentFolder}/${dateFolder}/</div>
                    </div>
                </div>
                <div class="file-item">
                    <span class="file-icon">📊</span>
                    <div class="file-info">
                        <div class="file-name">${incidentId}_Data_Summary.xlsx</div>
                        <div class="file-path">/Behavioral_Incidents/${studentFolder}/${dateFolder}/</div>
                    </div>
                </div>
                <div class="file-item">
                    <span class="file-icon">🎤</span>
                    <div class="file-info">
                        <div class="file-name">${incidentId}_Voice_Recording.mp3</div>
                        <div class="file-path">/Audio_Files/${studentFolder}/${dateFolder}/</div>
                    </div>
                </div>
                <div class="file-item">
                    <span class="file-icon">📝</span>
                    <div class="file-info">
                        <div class="file-name">${incidentId}_Transcript.txt</div>
                        <div class="file-path">/Transcripts/${studentFolder}/${dateFolder}/</div>
                    </div>
                </div>
            `;
        }
        
        // Store incident for demo purposes
        this.storeIncident(incidentId);
    }
    
    storeIncident(id) {
        const incident = {
            id: id,
            timestamp: new Date().toISOString(),
            ...this.processedData,
            rawInput: this.incidentData.rawInput
        };
        
        // In a real app, this would be sent to the server
        console.log('Incident saved:', incident);
    }
    
    startNewReport() {
        // Reset all data
        this.incidentData = {};
        this.processedData = {};
        
        // Clear input
        this.clearInput();
        
        // Reset processing animation
        this.resetProcessingAnimation();
        
        // Return to welcome screen
        this.showScreen('welcome');
    }
    
    resetProcessingAnimation() {
        const steps = document.querySelectorAll('.processing-step');
        const progressBar = document.getElementById('processing-progress');
        
        steps.forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        if (progressBar) {
            progressBar.style.width = '0%';
        }
        
        // Hide save complete section
        const saveComplete = document.getElementById('save-complete');
        if (saveComplete) {
            saveComplete.classList.add('hidden');
        }
    }
    
    viewReports() {
        // In a real app, this would navigate to reports view
        alert('This would navigate to the reports dashboard where you can view, search, and analyze all saved incident reports.');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.aiLogger = new AIIncidentLogger();
    
    // Add some helpful keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to process report
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const processBtn = document.getElementById('process-report-btn');
            if (processBtn && !processBtn.disabled) {
                processBtn.click();
            }
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('voice-modal');
            if (modal && !modal.classList.contains('hidden')) {
                window.aiLogger.cancelRecording();
            }
        }
    });
    
    // Add sample data button for demo purposes
    setTimeout(() => {
        const textarea = document.getElementById('incident-input');
        const inputControls = document.querySelector('.input-controls');
        
        if (textarea && inputControls) {
            const sampleButton = document.createElement('button');
            sampleButton.className = 'btn btn--outline';
            sampleButton.innerHTML = '📋 Use Sample Data';
            sampleButton.style.marginTop = '8px';
            sampleButton.addEventListener('click', () => {
                textarea.value = window.aiLogger.sampleInput;
                window.aiLogger.updateCharacterCount();
                window.aiLogger.validateInput();
            });
            
            inputControls.appendChild(sampleButton);
        }
    }, 100);
});