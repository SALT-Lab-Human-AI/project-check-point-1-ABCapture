# Safety, Privacy & Reliability

## PII Handling
- **Privacy mode toggle** instantly obscures student names and initials across student cards, tables, and detail views by replacing characters with block glyphs when privacy mode is enabled.
- **Audio transcription redaction** automatically replaces recognized student names with `STUDENT_NAME` before returning transcripts from Groq Whisper, preventing raw names from reaching the client or storage layers.
- **Incident edit history** records only changed fields (excluding unchanged PII) and stores them with user attribution for auditing without duplicating full records unnecessarily.
- **Report edit tracking** (per product deck) mirrors the automated edit history in the database so administrators can review who changed signed reports and when.

## Account Security & Access Controls
- **Passwords hashed with bcrypt** before persistence so raw secrets are never written to the database.
- **Verified email requirement** ensures sign-ups must confirm a time-bound 6-digit code; mismatches, expirations, or reuse attempts are rejected and session data is cleared once verification succeeds.
- **Session-based route protection** requires authentication (and role checks for admin scopes) on every student, incident, chat, and admin endpoint, preventing unauthorized data access.
- **Global error handler & request logging** capture API responses for auditability while suppressing stack traces in production environments.

## AI Safety & Jailbreak Mitigations
- **Constrained system prompts** enforce strict conversational rules (single clarifying follow-up, fixed ABC summary format, no save prompts) to limit jailbreak attempts and model drift.
- **Structured extraction** uses low temperature and `json_object` response formatting to avoid prompt injection that could leak or hallucinate extraneous data.
- **Redaction pipeline** (above) ensures transcripts sent to or returned from the AI are scrubbed of student identifiers before further processing or storage.

## Rate Limits & Abuse Detection
- **Groq API safeguards** surface user-facing messages when Groq’s 30-requests-per-minute limit is hit and instruct users to pause before retrying; similar handling exists for Whisper transcription throttling.
- **Operational guidance** documents Groq free-tier quotas and recommends monitoring usage and adding throttling controls when approaching limits.
- **Application request body limits** (10 MB JSON/urlencoded) mitigate bulk upload abuse and excessive payload attacks at the API gateway.
