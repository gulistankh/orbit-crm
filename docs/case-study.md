# Orbit CRM: case study

**Live demo:** https://orbit-crm-gamma-ten.vercel.app · 

**Video:** https://youtu.be/A-Dkta40X9Q ·

 **Code:** https://github.com/gulistankh/orbit-crm

## The problem

Small sales teams often run their pipeline in spreadsheets. It works at first, and then it stops: nobody knows who owns which lead, notes are scattered, anyone can edit anything, and a deal that moved stages leaves no trace. I wanted to show what the replacement can look like: one clean internal tool that a small team can adopt in a day, with sensible permissions from the start.

## Who it is for

Early-stage B2B SaaS founders and the small sales teams they hire first. The product has to be fast to learn, honest about who can do what, and calm to look at, since people spend hours a day in it.

## What I built

- A **pipeline board** with drag and drop, plus a sortable list of the same deals
- **Contacts and companies** with detail pages, notes, calls, emails and meetings in one activity history
- **One search and one filter panel** that follow you across every page
- **CSV import and export**, so the move off spreadsheets takes minutes
- **Four roles** (admin, manager, sales rep, viewer) enforced on the server
- **Notifications** for assignments, deal moves, new activity and role changes

## Design decisions

**One search, one filters button.** My first version had a search box inside every page and another in the top bar. Testing it myself showed it was confusing, so I merged them: the top-bar search filters the list you are on and works as a finder everywhere else, and the filters live in a single panel beside it. Active filters show as small removable chips, and they are stored in the page address, so a refresh or the Back button keeps them.

**A calm visual language.** I built a small set of design tokens (colors, spacing, radius, type) in one file and used them everywhere. The palette is warm paper and deep teal, with status colors that stay readable on it. Dates and times use one quiet style, a small clock icon with muted text, so the interface never shouts about metadata.

**Navigation that matches how people move.** The pipeline board scrolls sideways, so I added stage shortcuts, arrow buttons, and automatic scrolling when you drag a card near the edge. The scrollbar is always on screen instead of buried below the cards.

## Technical decisions

**Permissions live on the server.** Hiding a button is not security. Every API route checks the user's role, and sales reps can only change records they own. The interface and the server use the same rules, but only the server is trusted.

**The login cookie stays first-party.** The token is stored in an HttpOnly, Secure cookie. In production the frontend forwards `/api` calls to the backend, so the browser sees one site and the cookie is never a third-party cookie.

**API answers are never cached.** Because the app sits behind a content network, I send `Cache-Control: no-store` on every API response. A private contact list should never be something a cache is allowed to keep.

**A transactional CSV import.** The import creates missing companies, skips duplicate emails, and runs as one transaction, so a bad file can never leave the data half-imported.

**Notifications by polling.** A new notification appears within about 30 seconds without a refresh. I chose polling over live connections because it works on any hosting without extra infrastructure, and the cost is small at this scale.

## Problems I ran into

- **A pop-up that was cut off.** A modal opened from the top bar was clipped to the bar's height. The bar's blur effect makes fixed-position children measure themselves against the bar instead of the screen. The fix was to draw pop-ups on the page body.
- **A notification panel off the screen.** I found this one by testing on my phone: the panel hung off the left edge. The same cause, the same kind of fix, and I rebuilt it to be positioned from the bell and to fill the width on small screens.
- **Unstyled dropdowns.** Native dropdown lists ignore your design. I replaced them with one accessible, keyboard-friendly component, so every dropdown looks the same and nothing is clipped inside pop-ups.
- **Money and dates through the database.** PostgreSQL numbers arrive as text and plain dates can shift by a day with timezones. I handled both once, at the database connection, so the rest of the code never has to think about it.

## Security checks

- Passwords are hashed, and failed logins are rate limited
- A sales rep calling the API directly to edit a colleague's contact is refused
- Notifications are scoped to their recipient, and asking for someone else's returns "not found"
- All queries are parameterized and all request bodies are validated

## What I would do next

- Reminders for deals past their expected close date
- An audit log of who changed what
- Server-side pagination for larger teams
- Automated tests for the permission rules

## Stack

React, Vite, Node.js, Express, PostgreSQL (Neon), deployed on Vercel.