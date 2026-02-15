# ClassMate AI - Smart Course Scheduling Assistant

An AI-powered course scheduling tool that helps students build the perfect class schedule. No more fighting for slots, no more suboptimal picks.

## Features

- **AI Chat Assistant** - Tell the AI what you want in plain English: "I want morning classes close together" and it figures out the rest
- **Smart Scheduling Algorithm** - Generates multiple optimized schedule options ranked by score based on your preferences
- **Preference Engine**:
  - Morning vs afternoon classes
  - Spread out vs compact/back-to-back
  - Minimize walking distance between buildings
  - Walking time feasibility checks between consecutive classes
- **Primary + Backup Courses** - Set backup courses in case your first choices are full
- **Visual Schedule Grid** - Beautiful weekly calendar view with color-coded course blocks
- **Course Catalog** - Browse all available courses with section details, seat availability, professors
- **Friends System** - Add friends (or your girlfriend hehe) to see their schedules overlaid on yours
- **Seat Availability Warnings** - Know which classes are filling up before you register
- **Smart Conflict Detection** - Automatic time conflict and walking distance conflict detection

## Quick Start

```bash
npm install
npm start
```

Then open http://localhost:3000

## How to Use

1. **Chat with the AI**: Type preferences like "I want morning classes" or "keep buildings close"
2. **Add courses**: Tell the AI "I need CS101, MATH201, ENG110" or browse the Course Catalog tab
3. **Set backups**: Click the "primary" badge on a course to toggle it to "backup"
4. **Generate**: Click "Generate Best Schedules" or tell the AI "generate my schedule"
5. **Compare**: Browse through ranked schedule options in the sidebar
6. **Friends**: Sign in, add friends by username, and see their schedules on your grid

## Feature Ideas for Future Development

1. Rate My Professor integration
2. Waitlist auto-enroll notifications
3. GPA impact predictor
4. Study group matcher
5. Campus map with walking routes
6. Google Calendar / Apple Calendar export
7. Prerequisite checker
8. Workload balancer (estimated weekly hours)
9. Shared class finder with friends
10. Schedule comparison side-by-side
11. Real-time opening notifications
12. Professor office hours overlay
13. Commuter mode (arrival/departure optimization)
14. Break time optimizer (lunch blocks, study blocks)
15. Multi-semester planner

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JS (no framework dependencies)
- **Styling**: Custom CSS with dark theme, Inter font
