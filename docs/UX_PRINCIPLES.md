# ClubForge UX Design Principles

Universal principles to apply across **all dashboards** (Admin, Instructor, Member, Professor).

## 1. Progressive Disclosure
- Only show what's relevant at the user's current stage
- New users see a guided setup; experienced users see advanced features
- Use collapsible sidebar sections — expand only what matters now

## 2. Guided First-Time Experience
- Every dashboard role gets a "setup wizard" or "getting started" checklist
- Steps auto-complete as the user takes action (no manual checking)
- Celebrate each milestone with micro-animations (confetti, gold check marks)
- Dismiss permanently once complete — never nag returning users

## 3. Smart Empty States
- Never show a blank table or "No data" text alone
- Every empty state includes:
  - A large, relevant icon
  - A friendly headline ("No classes yet")
  - One sentence of context ("Create your first class to start scheduling")
  - A prominent CTA button ("+ Create First Class")
- Empty states should feel like invitations, not dead ends

## 4. Context-Aware Actions
- Quick actions adapt to the user's state
  - New owner: "Create your first class" (not "Manage Classes")
  - Active owner: "View today's attendance" (not generic "Attendance")
- Use verb-first labels: "Add Member", "Create Class", "Share Link"

## 5. Sidebar Organization
- Group links into logical, collapsible sections (max 5-6 items per group)
- Use clear section headers: "Your Club", "Members", "Engagement", "Money"
- Gold dot indicator for sections needing attention
- Active page's section auto-expands
- Remember collapsed/expanded state in localStorage

## 6. Dashboard Hierarchy
- **Top**: Welcome + Setup Progress (if incomplete)
- **Middle**: Key metrics (4 stat cards max)
- **Bottom**: Today's Snapshot → Quick Actions → Activity Feed
- Never show more than 4 stat cards — extra metrics go to dedicated pages

## 7. Mobile-First Responsive
- Bottom nav shows 4-5 most important items
- Sidebar becomes a slide-out drawer on mobile
- Touch targets minimum 44×44px
- Cards stack vertically on mobile

## 8. Visual Language
- Gold = primary brand / CTA / success
- Green = positive / active / completed
- Red = destructive / error / alert (use sparingly)
- Glass cards for elevated content
- Subtle gradients — never flat or garish
- Micro-animations on state changes (0.2-0.3s ease transitions)

## 9. Copy & Tone
- Friendly, direct, encouraging — never robotic or corporate
- Use the owner's first name in greetings
- Celebrate wins: "Great — you're all set!" not "Setup complete."
- Error messages suggest a next step: "Couldn't save. Check your connection and try again."

## 10. Role-Specific Application

| Principle | Admin | Instructor | Member |
|-----------|-------|-----------|--------|
| Setup Wizard | 7-step club setup | "Complete your profile" | "Welcome — explore your dashboard" |
| Empty States | All admin pages | "No classes assigned yet" | "No attendance yet — check in to your first class" |
| Context Actions | Based on club setup stage | Based on upcoming classes | Based on membership status |
| Key Metrics | MRR, Members, Classes, Attendance | My Classes Today, Students, Attendance Rate | Belt, Sessions, Next Class |
