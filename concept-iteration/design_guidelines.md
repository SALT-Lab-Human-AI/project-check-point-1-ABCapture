# ABCapture Design Guidelines

## Design Approach: Material Design System (Adapted)
**Rationale:** ABCapture is a utility-focused educational tool requiring clarity, efficiency, and accessibility. Material Design provides excellent form handling, data visualization, and responsive patterns suitable for teachers working in various environments.

## Core Design Principles
1. **Clarity First:** Information hierarchy guides teachers through incident recording efficiently
2. **Quick Access:** Primary actions (record incident, select student) are always prominent
3. **Data Integrity:** Visual design reinforces accuracy and proper documentation
4. ** Professional Trust:** Clean, credible interface for sensitive student data

## Color Palette

**Primary Colors (inspired by logo's educational blocks):**
- Primary Blue: 210 85% 45% (trust, professionalism)
- Primary Light: 210 85% 92% (backgrounds, subtle elements)

**Accent Colors:**
- Success Green: 145 65% 45% (completed forms, confirmations)
- Alert Orange: 25 85% 55% (requires attention, warnings)
- Recording Red: 0 75% 55% (active recording indicator)

**Neutral Foundation:**
- Dark Mode Background: 220 15% 12%
- Dark Mode Surface: 220 15% 18%
- Dark Mode Surface Elevated: 220 15% 22%
- Light Mode Background: 0 0% 98%
- Light Mode Surface: 0 0% 100%
- Text Primary Dark: 220 15% 95%
- Text Secondary Dark: 220 10% 65%
- Text Primary Light: 220 20% 15%

## Typography

**Font Family:**
- Primary: 'Inter' (Google Fonts) - excellent readability for forms and data
- Monospace: 'JetBrains Mono' - timestamps, incident IDs

**Scale:**
- Display: text-4xl font-bold (page headers)
- Heading: text-2xl font-semibold (section headers)
- Subheading: text-lg font-medium (form labels, card titles)
- Body: text-base (form inputs, descriptions)
- Caption: text-sm (metadata, timestamps)
- Helper: text-xs (form hints, character counts)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 (cards), p-4 (compact elements)
- Section margins: mb-8, mb-12
- Form field spacing: space-y-6
- Grid gaps: gap-4 (tight), gap-6 (standard), gap-8 (spacious)

**Container Widths:**
- Main content: max-w-7xl mx-auto
- Form containers: max-w-3xl mx-auto
- Student cards grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## Component Library

### Navigation
- **Top Navigation Bar:** Fixed, bg-surface with border-b, contains ABCapture logo (left), user menu (right)
- **Sidebar (Desktop):** Persistent left sidebar (w-64) with: Dashboard, My Students, Incident History, Settings
- **Mobile Nav:** Bottom tab bar with icons, slide-in drawer for settings

### Dashboard Components
- **Quick Action Card:** Prominent "Record New Incident" button with microphone icon, raised elevation
- **Student Quick-Select:** Horizontal scrollable student avatars with names for fast access
- **Recent Incidents:** Table/list view with student name, date/time, incident type tags

### Student Management
- **Student Cards:** Photo/avatar, name, grade, incident count, last recorded date
- **Add Student Form:** Modal with fields for name, photo upload, grade, notes
- **Student Detail View:** Full-screen with tabs (Profile, Incident History, ABC Analysis)

### Incident Recording
- **Recording Interface:**
  - Large circular record button (center, pulsing animation when active)
  - Waveform visualization during recording
  - Text alternative: "Or type incident details" link below
  - Selected student indicator at top
  - Timer display during recording

- **Form Review Screen:**
  - AI-generated summary card (editable)
  - ABC Form sections: Antecedent, Behavior, Consequence
  - Auto-populated fields (editable) with visual indicators for AI-filled vs manual
  - Metadata fields: Date/time (pre-filled), Incident type (dropdown), Function of behavior (multi-select chips)
  - Sign/Save action buttons (fixed bottom bar)

### Data Display
- **ABC Form View:** Clean form layout with clear section dividers, labeled fields, read-only mode for completed forms
- **Incident History:** Filterable table with columns: Student, Date, Type, Function, Status (Signed/Draft)
- **Tags/Chips:** Rounded badges for incident types, behavior functions (different accent colors)

### Forms & Inputs
- All text inputs: Outlined style, focus ring with primary color
- Dropdowns: Native select with custom styling or headlessui listbox
- Checkboxes/Radio: Custom styled with primary color
- Text areas: Auto-expanding for long descriptions
- Voice input indicator: Microphone icon in input with active state animation

### Modals & Overlays
- **Modal backdrop:** bg-black/50 backdrop-blur-sm
- **Modal container:** Centered, max-w-2xl, rounded-xl, elevated shadow
- **Confirmation dialogs:** Compact with clear primary/secondary actions

## Accessibility & States

**Focus States:**
- 2px ring with primary color offset
- Visible on all interactive elements
- Skip-to-content link for keyboard navigation

**Loading States:**
- Skeleton screens for student lists
- Spinner for AI processing with "Analyzing incident..." text
- Progressive disclosure for long forms

**Empty States:**
- Illustrations with helpful text (e.g., "No students yet. Add your first student to get started.")
- Clear call-to-action buttons

**Error States:**
- Inline validation with alert orange color
- Error messages below fields in text-sm
- Toast notifications for system errors (top-right)

## Interaction Patterns

**Animations (Minimal):**
- Smooth transitions: transition-all duration-200
- Card hover: subtle scale-105 and shadow increase
- Button press: scale-95
- Modal entry: fade + slide from bottom
- No decorative animations

**Microinteractions:**
- Recording button: pulse animation when active
- Form auto-save indicator: checkmark fade-in
- Success states: green checkmark with brief scale animation

## Images

**Student Photos:**
- Circular avatars (96x96px on cards, 128x128px on detail view)
- Placeholder: Initials on colored background if no photo
- Located: Student cards, quick-select bar, incident forms

**No Hero Image:** This is a utility app - dashboard immediately shows actionable content

**Icons:**
- Use Heroicons (outline style for navigation, solid for active states)
- Recording: microphone, Type: keyboard, Students: users, History: clock, Settings: cog

## Visual Hierarchy

1. **Primary Actions:** Record incident button, Add student - largest, primary color, elevated
2. **Student Selection:** Prominent cards or horizontal scroll - easy to scan
3. **Form Fields:** Clear labels, adequate spacing, logical grouping
4. **Metadata:** Smaller, secondary text color, grouped at edges
5. **Historical Data:** Tables/lists with clear sorting/filtering options

**Responsive Behavior:**
- Mobile: Stack elements, bottom nav, full-width forms
- Tablet: 2-column layouts where appropriate, persistent sidebar
- Desktop: Full multi-column dashboard, side-by-side form review