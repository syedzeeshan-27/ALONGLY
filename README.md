# Alongly

Alongly is a warm peer-support app for people who need a real person on a heavy day. It helps someone share what is going on, generates a short companion briefing, and connects them with a peer companion for a private text room with an optional Jitsi voice call.

Alongly is peer support, not therapy, diagnosis, emergency care, or a replacement for licensed mental health support.

## Features

- Public landing page with clear user and companion entry points.
- Email/password auth through Supabase.
- Role-based onboarding for people seeking support and companions.
- AI intake chat that identifies experience, intensity, and conversation style tags.
- Three-sentence companion briefing generated from the intake conversation.
- Live companion dashboard for accepting waiting match requests.
- Private matched rooms with realtime messages.
- Optional embedded voice calls through Jitsi.
- Mobile-first app shell, installable manifest, and branded app icons.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres, Realtime, and RLS
- Anthropic Messages API
- Jitsi Meet
- Lucide React icons

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

The app expects these public tables:

- `profiles`
- `companion_profiles`
- `match_requests`
- `messages`

The current migrations in `supabase/migrations` add message room policies, realtime support for messages, voice room URLs, and companion briefing storage. Apply the migrations to the Supabase project before testing matching and room messaging.

Supabase Realtime should be enabled for match request and message updates so users and companions can move through the flow without manual refreshes.

## Key Routes

- `/` - public landing page
- `/signup` - account creation with user or companion role
- `/login` - sign in
- `/home` - user home
- `/chat` - AI intake chat and match request creation
- `/companion-dashboard` - companion availability and request queue
- `/room/[id]` - matched private conversation room
- `/companion-profile` - companion setup/profile details
- `/privacy` and `/terms` - legal pages

## Scripts

```bash
npm run dev      # Start the Next.js dev server
npm run build    # Build for production
npm run start    # Start the production server
npm run lint     # Run ESLint
```

## Environment Notes

- `ANTHROPIC_API_KEY` is only used server-side by `/api/chat`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required by both server and client Supabase helpers.
- Jitsi rooms are embedded with the iFrame API and generated as unique `https://meet.jit.si/alongly-{roomId}-{nonce}` rooms when a participant starts a voice call.

## Project Structure

```text
app/                    Next.js App Router pages, layouts, API routes, and UI
app/api/chat/           Anthropic-backed intake and briefing endpoint
app/components/         Shared app and landing page components
lib/                    Auth helpers, Supabase clients, shared utilities
lib/supabase/           Supabase browser/server clients and database types
public/brand/           Alongly icons, mark, and wordmark assets
supabase/migrations/    Database migrations and RLS updates
```

## Safety

Alongly is designed for non-clinical peer support. If someone may be in immediate danger, use local emergency services. In the U.S., call or text 988 or visit [988lifeline.org](https://988lifeline.org/).
