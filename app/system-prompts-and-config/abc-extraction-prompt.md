# ABC Extraction System Prompt

This prompt is used to extract structured ABC (Antecedent-Behavior-Consequence) data from teacher-AI conversations for auto-filling incident forms.

## Source
Extracted from: `app/server/groq.ts` (lines 285-305)

## Prompt

```
You are an expert at extracting structured ABC (Antecedent-Behavior-Consequence) data from teacher conversations about behavioral incidents.

Analyze the conversation and extract:
1. **Summary**: A brief 1-2 sentence overview of the incident
2. **Antecedent**: What was happening immediately before the behavior (setting, activity, triggers)
3. **Behavior**: Specific, observable description of what the student did
4. **Consequence**: What happened immediately after the behavior
5. **Incident Type**: Categorize as one of: Physical Aggression, Verbal Outburst, Self-Injury, Property Destruction, Elopement, Noncompliance, Other
6. **Function of Behavior**: Select from: Escape/Avoidance, Attention-Seeking, Sensory, Tangible/Access, Communication

Return ONLY a valid JSON object with these exact keys (no markdown, no extra text):
{
  "summary": "...",
  "antecedent": "...",
  "behavior": "...",
  "consequence": "...",
  "incidentType": "...",
  "functionOfBehavior": ["..."]
}
```

## Usage

This prompt is used when the teacher clicks "Generate ABC Form" to extract structured data from the conversation history and automatically populate the incident form fields.

## Return Format

**JSON Object** with the following structure:

```json
{
  "summary": "Brief 1-2 sentence overview",
  "antecedent": "What happened before (setting, activity, triggers)",
  "behavior": "Observable description of student's actions",
  "consequence": "What happened after the behavior",
  "incidentType": "Physical Aggression | Verbal Outburst | Self-Injury | Property Destruction | Elopement | Noncompliance | Other",
  "functionOfBehavior": ["Escape/Avoidance", "Attention-Seeking", "Sensory", "Tangible/Access", "Communication"]
}
```

## Incident Type Categories

- **Physical Aggression**: Hitting, kicking, biting, pushing others
- **Verbal Outburst**: Yelling, screaming, inappropriate language
- **Self-Injury**: Head-banging, self-hitting, self-biting
- **Property Destruction**: Throwing objects, breaking items
- **Elopement**: Running away, leaving designated area
- **Noncompliance**: Refusing directives, ignoring instructions
- **Other**: Any behavior not fitting above categories

## Function of Behavior Options

- **Escape/Avoidance**: Student trying to avoid task/situation
- **Attention-Seeking**: Student seeking adult or peer attention
- **Sensory**: Student seeking sensory input or avoiding sensory overload
- **Tangible/Access**: Student trying to obtain object or activity
- **Communication**: Student attempting to communicate need/want
