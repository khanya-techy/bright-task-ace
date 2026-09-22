# AI Work Assistant

Build a modern, responsive SaaS web application called AI Workplace Productivity Assistant.

Purpose

Create an AI-powered assistant that helps professionals save time by automating common workplace tasks. The application should feel like a polished, practical workplace productivity tool.

Core Features

1. Smart Email Generator

Generate professional emails from user-provided context.

Allow the user to select a tone: Formal, Informal, or Persuasive.

Allow the user to select an audience: Client, Manager, or Team.

Display the generated email in an editable output box.

Include Copy, Regenerate, and Clear actions.

2. Meeting Notes Summarizer

Allow users to paste lengthy meeting notes.

Generate a concise summary.

Extract Key Points, Decisions, Action Items, Deadlines, and Responsibilities.

Display the result in a clear, editable format.

Include Copy, Regenerate, and Clear actions.

3. AI Task Planner

Allow users to enter multiple tasks, deadlines, priorities, and available working hours.

Generate a structured daily or weekly plan.

Prioritize tasks according to urgency and importance.

Suggest ways to optimize the user's time.

Display the plan in an easy-to-read schedule/timeline.

Allow tasks and generated plans to be edited.

Dashboard & Navigation

Create a clean dashboard with:

Sidebar navigation

Dashboard/Home

Email Generator

Meeting Summarizer

Task Planner

History

Settings

The dashboard should include quick-access cards for the three main tools and a simple recent-activity section.

AI & Prompt Design

Use structured prompts for each feature. AI outputs should be relevant, concise, professional, and based only on information provided by the user.

The AI must not invent deadlines, responsibilities, decisions, or other facts. If information is missing, it should clearly indicate that.

If a live AI API is not available, use realistic mock AI responses so that all workflows can still be demonstrated. Structure the application so a real AI API can be integrated later.

User Experience

Include:

Clear input forms

Input validation

Loading states

Error states with a retry option

Editable AI outputs

Copy and Regenerate functionality

Responsive desktop, tablet, and mobile layouts

Responsible AI

Include a visible Responsible AI disclaimer stating that AI-generated content may contain errors and should be reviewed before being used professionally. Advise users not to enter confidential or sensitive information.

Design

Use a clean, modern, professional SaaS design with:

Simple navigation

Clear typography

Consistent spacing

Subtle cards, borders, and shadows

Minimal unnecessary decoration

Accessible and responsive layouts

Prioritize functionality, usability, prompt quality, and responsible AI over unnecessary features or visual complexity.

The final application should be presentation-ready and clearly demonstrate how AI can improve workplace productivity.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dec310d9-b524-4e87-82e0-b3d67c68400d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
