# CourseCraft - Smart Course Scheduling Assistant

A course scheduling tool that helps students build the perfect class schedule. No more fighting for slots, no more suboptimal picks.

## Features

- **Natural Language Planner** - Describe what you want in plain English: "I want morning classes close together" and it figures out the rest
- **Smart Scheduling Algorithm** - Generates multiple optimized schedule options ranked by score based on your preferences
- **Preference Engine**:
  - Morning vs afternoon classes
  - Spread out vs compact/back-to-back
  - Minimize walking distance between buildings
  - Walking time feasibility checks between consecutive classes
- **Rate My Professor Integration** - See professor ratings, difficulty, reviews, and "would take again" percentages inline
- **Primary + Backup Courses** - Set backup courses in case your first choices are full
- **Visual Schedule Grid** - Beautiful weekly calendar view with color-coded course blocks
- **Course Catalog** - Browse all available courses with section details, seat availability, professors
- **Friends System** - Add friends to see their schedules overlaid on yours and find shared classes
- **Seat Availability Warnings** - Know which classes are filling up before you register
- **Smart Conflict Detection** - Automatic time conflict and walking distance conflict detection

## Quick Start

```bash
npm install
npm start
```

Then open http://localhost:3000

## How to Use

1. **Chat with the Planner**: Type preferences like "I want morning classes" or "keep buildings close"
2. **Add courses**: Say "I need CS101, MATH201, ENG110" or "set me up first year courses", or browse the Catalog tab
3. **Set backups**: Click the "primary" badge on a course to toggle it to "backup"
4. **Generate**: Click "Generate Schedule" or say "generate my schedule"
5. **Compare**: Browse through ranked schedule options in the sidebar
6. **Friends**: Sign in, add friends by username, and compare schedules side-by-side

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JS (no framework dependencies)
- **Styling**: Custom CSS with dark theme, Inter font
