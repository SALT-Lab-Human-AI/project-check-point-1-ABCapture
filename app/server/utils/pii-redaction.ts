import { SyncRedactor } from 'redact-pii';

/**
 * Redact student names from transcript text
 * Uses redact-pii library with custom pattern matching
 * 
 * @param transcript - The transcript text to redact
 * @param studentNames - Array of student names to redact
 * @returns Redacted transcript with student names replaced by [Student]
 */
export function redactStudentNames(transcript: string, studentNames: string[]): string {
  if (!transcript || studentNames.length === 0) {
    return transcript;
  }

  // Escape special regex characters in student names to prevent regex injection
  const escapedNames = studentNames.map(name => {
    // Escape regex special characters
    return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });

  // Build regex pattern: word boundaries to match full names only
  // Case-insensitive matching
  const studentNamesPattern = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');

  // Create redactor with custom pattern for student names
  const redactor = new SyncRedactor({
    customRedactors: {
      before: [
        {
          regexpPattern: studentNamesPattern,
          replaceWith: '[Student]'
        }
      ]
    }
  });

  const redacted = redactor.redact(transcript);
  
  console.log(`[PII Redaction] Redacted ${studentNames.length} student names from transcript`);
  
  return redacted;
}
