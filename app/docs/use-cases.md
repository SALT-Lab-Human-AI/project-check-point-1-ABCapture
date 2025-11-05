# ABCapture Use Cases & Testing Scenarios

## Overview

This document outlines the primary use cases for ABCapture, user workflows, and testing scenarios to ensure the application meets the needs of special education teachers.

## Primary User Personas

### 1. Special Education Teacher (Primary User)
- **Goals:** Quickly document behavioral incidents during busy classroom days
- **Pain Points:** Limited time, paperwork burden, remembering details later
- **Needs:** Fast data entry, AI assistance, mobile accessibility

### 2. School Administrator
- **Goals:** Monitor trends, ensure documentation compliance, support teachers
- **Pain Points:** Incomplete reports, inconsistent data, delayed notifications
- **Needs:** Dashboard analytics, teacher oversight, audit trails

### 3. Parent/Guardian (Indirect User)
- **Goals:** Stay informed about their child's behavior
- **Pain Points:** Late notifications, unclear reports
- **Needs:** Timely email notifications, clear incident descriptions

## Core Use Cases

### Use Case 1: Record Incident Using Voice

**Actor:** Special Education Teacher  
**Preconditions:** Teacher is logged in, student exists in system  
**Trigger:** Behavioral incident occurs in classroom  

**Main Flow:**
1. Teacher navigates to "Record Incident" page
2. Selects student from dropdown
3. Clicks microphone button to start recording
4. Speaks natural description: "Johnny threw a book during math time because he was asked to put his phone away. I gave him a 5-minute break in the calm corner."
5. Clicks stop recording
6. System transcribes audio using Whisper AI
7. System sends transcription to LLaMA AI for ABC extraction
8. AI analyzes and auto-fills form:
   - **Antecedent:** "Asked to put phone away during math time"
   - **Behavior:** "Threw a book"
   - **Consequence:** "5-minute break in calm corner"
9. Teacher reviews pre-filled form
10. Adjusts severity, location, and incident type
11. Clicks "Save Incident"
12. System stores incident with timestamp

**Postconditions:**
- Incident saved to database
- Incident appears in history
- Dashboard statistics updated

**Alternative Flows:**
- **3a.** Microphone permission denied → System shows error, offers chat alternative
- **5a.** Recording too long → System shows warning after 2 minutes
- **6a.** Transcription fails → System shows error, allows manual text entry
- **8a.** AI extraction incomplete → Teacher manually fills missing fields

**Success Criteria:**
- Incident documented in <2 minutes from start to finish
- AI accuracy >80% for ABC extraction
- Voice recording clear and accurate

---

### Use Case 2: Record Incident Using Chat

**Actor:** Special Education Teacher  
**Preconditions:** Teacher is logged in, student exists in system  
**Trigger:** Teacher prefers typing over voice  

**Main Flow:**
1. Teacher navigates to "Record Incident" page
2. Selects student from dropdown
3. Types in chat: "Sarah had a meltdown during reading time"
4. AI responds: "I see Sarah had a meltdown during reading time. What was happening just before the meltdown?"
5. Teacher: "She was asked to read out loud in front of the class"
6. AI: "Got it. What did you do after the meltdown?"
7. Teacher: "Gave her a quiet break and removed the audience"
8. AI responds with formatted ABC data
9. Form auto-fills with extracted information
10. Teacher reviews and saves

**Postconditions:** Same as Use Case 1

**Alternative Flows:**
- **4a.** Teacher provides complete ABC in first message → AI extracts immediately, skips follow-up questions
- **8a.** Teacher disagrees with AI extraction → Manually edits fields before saving

**Success Criteria:**
- Natural conversation flow (not interrogation)
- AI asks maximum 2 clarifying questions
- ABC extraction accuracy >85%

---

### Use Case 3: Share Incident with Guardian

**Actor:** Special Education Teacher  
**Preconditions:** Incident saved, student has guardian email  
**Trigger:** Teacher decides to notify guardian  

**Main Flow:**
1. Teacher views incident in history
2. Clicks "Share with Guardian" button
3. System generates email with:
   - Student name
   - Incident date/time
   - ABC details
   - Teacher contact info (reply-to)
4. Email sent via Gmail SMTP
5. Guardian receives professional incident report
6. Guardian can reply directly to teacher

**Postconditions:**
- Email delivered to guardian
- System logs email sent timestamp
- Teacher notified of successful send

**Alternative Flows:**
- **2a.** No guardian email on file → System shows error, prompts to add email
- **4a.** Email service fails → System shows error, allows retry

**Success Criteria:**
- Email delivered within 1 minute
- Professional, clear formatting
- Reply-to correctly set to teacher

---

### Use Case 4: View Dashboard Analytics

**Actor:** Special Education Teacher  
**Preconditions:** Teacher is logged in, has recorded incidents  
**Trigger:** Teacher wants to review trends  

**Main Flow:**
1. Teacher navigates to Dashboard
2. Views summary cards:
   - Total incidents this month
   - Most frequent behavior types
   - Students requiring attention
3. Reviews trend charts:
   - Incidents over time
   - Behavior patterns by time of day
4. Identifies patterns (e.g., more incidents before lunch)
5. Adjusts classroom strategies accordingly

**Postconditions:**
- Teacher gains insights
- Data-driven intervention planning

**Success Criteria:**
- Charts load in <2 seconds
- Data visualization is clear and actionable
- Filters work correctly (date range, student)

---

### Use Case 5: Administrator Reviews All Teachers

**Actor:** School Administrator  
**Preconditions:** Administrator logged in  
**Trigger:** Monthly compliance review  

**Main Flow:**
1. Administrator navigates to "All Teachers"
2. Views list of all teachers with stats:
   - Number of students
   - Total incidents
   - Last active date
3. Clicks on specific teacher
4. Views detailed breakdown:
   - Incident frequency
   - Student roster
   - Documentation quality
5. Identifies teachers needing support
6. Reaches out to provide assistance

**Postconditions:**
- Administrator has overview of school-wide trends
- Support needs identified

**Success Criteria:**
- All teachers visible (no permission errors)
- Stats accurate and up-to-date
- Page load <3 seconds

---

### Use Case 6: Edit Incident History

**Actor:** Special Education Teacher  
**Preconditions:** Incident previously saved  
**Trigger:** Teacher realizes mistake or wants to add details  

**Main Flow:**
1. Teacher navigates to Incident History
2. Finds incident to edit
3. Clicks "Edit" button
4. Modifies fields (e.g., adds missing consequence details)
5. Clicks "Save Changes"
6. System:
   - Updates incident
   - Logs edit in `incident_edit_history` table
   - Records who edited and when

**Postconditions:**
- Incident updated
- Edit history preserved for audit trail
- Original data not lost

**Success Criteria:**
- Edit history tracked accurately
- Changes reflected immediately
- Original author still visible

---

## Testing Scenarios

### Manual Testing Checklist

#### Authentication Tests
- [ ] Sign up with valid email/password
- [ ] Sign up with duplicate email (should fail)
- [ ] Login with correct credentials
- [ ] Login with incorrect password (should fail)
- [ ] Logout successfully
- [ ] Session persists after page refresh
- [ ] Google OAuth login (if configured)

#### Student Management Tests
- [ ] Add new student with all required fields
- [ ] Add student with missing required field (should fail)
- [ ] View list of students
- [ ] Click on student to view details
- [ ] Edit student information
- [ ] Delete student (should ask for confirmation)

#### Incident Recording Tests (Voice)
- [ ] Grant microphone permission
- [ ] Record 10-second voice memo
- [ ] Transcription appears correctly
- [ ] ABC form auto-fills from transcription
- [ ] Save incident with auto-filled data
- [ ] Recording longer than 2 minutes shows warning

#### Incident Recording Tests (Chat)
- [ ] Type simple incident description
- [ ] AI responds with clarifying question
- [ ] Complete conversation triggers ABC extraction
- [ ] Form auto-fills with chat-extracted data
- [ ] Manually edit auto-filled fields
- [ ] Save modified incident

#### Incident History Tests
- [ ] View list of all incidents for current teacher
- [ ] Filter incidents by student
- [ ] Filter incidents by date range
- [ ] Click incident to view full details
- [ ] Edit existing incident
- [ ] Delete incident (with confirmation)
- [ ] View edit history for incident

#### Dashboard Tests
- [ ] Summary cards show correct counts
- [ ] Charts render without errors
- [ ] Trend data matches incident history
- [ ] Date range filter updates charts
- [ ] Student filter updates data

#### Email Tests
- [ ] Click "Share with Guardian" on incident
- [ ] Email sent notification appears
- [ ] Guardian receives email (check inbox)
- [ ] Email contains correct incident details
- [ ] Reply-to address is teacher's email
- [ ] Student with no guardian email shows error

#### Administrator Tests
- [ ] Login as administrator
- [ ] View "All Teachers" page
- [ ] See all teachers in system
- [ ] Click on specific teacher
- [ ] View teacher's students and incidents
- [ ] Access denied for non-administrator

#### Responsive Design Tests
- [ ] Test on mobile phone (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)
- [ ] Sidebar collapses on mobile
- [ ] Forms are usable on small screens
- [ ] Voice recording works on mobile

#### Error Handling Tests
- [ ] No internet connection (graceful error)
- [ ] Invalid API key (Groq) shows error
- [ ] Database connection fails (error message)
- [ ] Session expires (redirect to login)
- [ ] File upload too large (error)
- [ ] Invalid form data (validation errors)

### Automated Testing (Future)

#### Unit Tests
```typescript
// Example: Test ABC extraction
describe('extractABCData', () => {
  it('should extract antecedent, behavior, consequence from conversation', async () => {
    const messages = [
      { role: 'user', content: 'Johnny hit Sara during circle time' },
      { role: 'assistant', content: 'What happened just before?' },
      { role: 'user', content: 'He was asked to sit down' },
      { role: 'assistant', content: 'What did you do after?' },
      { role: 'user', content: 'Gave him a 5-minute break' }
    ];
    
    const result = await extractABCData(messages);
    
    expect(result.antecedent).toContain('asked to sit');
    expect(result.behavior).toContain('hit');
    expect(result.consequence).toContain('break');
  });
});
```

#### E2E Tests (Playwright/Cypress)
```typescript
// Example: Complete incident recording flow
test('teacher can record incident via voice', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'teacher@test.com');
  await page.fill('#password', 'password');
  await page.click('button[type=submit]');
  
  await page.goto('/record-incident');
  await page.selectOption('#student', '1');
  await page.click('#record-button');
  // ... simulate audio recording
  await page.click('#stop-button');
  
  await page.waitForSelector('#abc-form');
  expect(await page.textContent('#antecedent')).toBeTruthy();
  
  await page.click('#save-incident');
  expect(await page.textContent('.success-message')).toContain('saved');
});
```

## Performance Benchmarks

| Operation | Target | Acceptable | Unacceptable |
|-----------|--------|------------|--------------|
| Page load (initial) | <2s | <4s | >5s |
| Voice transcription | <5s | <10s | >15s |
| ABC extraction | <3s | <7s | >10s |
| Save incident | <1s | <2s | >3s |
| Dashboard load | <2s | <4s | >6s |
| Email send | <30s | <60s | >90s |

## Accessibility Requirements

- [ ] Keyboard navigation for all features
- [ ] Screen reader compatible (ARIA labels)
- [ ] Color contrast meets WCAG AA standards
- [ ] Form errors announced to screen readers
- [ ] Voice recording has visual indicator
- [ ] Chat interface has focus management

## Security Testing

- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (input sanitization)
- [ ] CSRF tokens on state-changing requests
- [ ] Password hashing (bcrypt)
- [ ] Session hijacking prevention
- [ ] API rate limiting (Groq)
- [ ] PII redaction working correctly

## User Acceptance Criteria

For each use case, the following must be true:
1. **Efficiency:** Task completed in minimal time with minimal clicks
2. **Accuracy:** Data captured correctly without loss
3. **Usability:** Interface intuitive for non-technical teachers
4. **Reliability:** System available 99% of school hours
5. **Feedback:** Clear confirmation messages for all actions
6. **Error Recovery:** Graceful handling of errors with user-friendly messages

## Conclusion

These use cases and testing scenarios ensure ABCapture meets the real-world needs of special education teachers while maintaining high quality, security, and usability standards.
>>>>>>> b41824e (Created a checkpoint)
