# Roamly

Roamly is an AI-powered solo travel planner. You give it a destination, dates, budget, and a few preferences, and it builds a full day-by-day itinerary. If something goes wrong mid-trip — rain, a closed venue, a delayed flight, going over budget — you trigger a disruption and Gemini replans the affected parts on the spot.

## What it does

You fill in where you want to go, when, how much you want to spend, your travel pace, dietary needs, and trip vibes. Roamly sends all of that to Google Gemini and gets back a structured itinerary broken into morning, afternoon, evening, and night slots. Each slot has a location, activity, estimated cost, travel time from the previous stop, weather, and a short note explaining why Gemini picked it for you.

Once you have a plan, you can simulate disruptions from a panel on the left. Pick a preset like heavy rain or venue closed, or type in your own. Gemini reads the current itinerary as context, figures out what needs to change, and returns an updated plan with only the affected slots marked as revised. Everything else stays exactly as it was.

There is also a Google Maps embed that shows your destination, a live activity feed showing what Gemini is doing at each step, and quick-tap modifications like less walking or add nightlife that fire as disruptions.

## Tech

React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Google Gemini 2.0 Flash, Google Maps Embed, Google Fonts, Firebase Hosting.

## Running locally

Install dependencies with npm install. Copy .env.example to .env and paste your Gemini API key. Run npm run dev to start the dev server.

## Scripts

npm run dev starts the development server. npm run build type-checks and builds for production. npm run test runs the test suite. npm run lint checks for lint errors.
