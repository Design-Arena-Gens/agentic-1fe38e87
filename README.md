# Agentic Voice Assistant

AI receptionist that answers inbound phone calls, handles natural conversations, and escalates or hangs up based on caller intent. The serverless app is built with Next.js 14 (App Router) so it can be deployed straight to Vercel and connected to Twilio Programmable Voice.

## Features

- Greets callers with a configurable voice and prompt.
- Uses OpenAI to reason over caller requests with short, natural responses.
- Maintains per-call context while the call is active.
- Detects goodbye keywords to end the call gracefully.
- Simple marketing landing page with setup instructions for non-technical teammates.

## Prerequisites

- Node.js 18+ and npm.
- A Twilio account with a Voice-enabled phone number.
- An OpenAI API key.
- (Recommended) A production domain such as `https://agentic-1fe38e87.vercel.app` once deployed.

## Environment variables

Create `.env.local` for local development or add these to your Vercel project settings:

| Variable | Description |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI key used for responses. |
| `OPENAI_MODEL` | Optional – defaults to `gpt-4o-mini`. |
| `ASSISTANT_NAME` | Assistant display name (ex: `Avery`). |
| `ASSISTANT_COMPANY` | Company or team name used in the prompt. |
| `ASSISTANT_GREETING` | Optional greeting for the first response. |
| `ASSISTANT_REPROMPT` | Optional phrase when no speech is detected. |
| `ASSISTANT_FAREWELL` | Optional closing line before hangup. |
| `ASSISTANT_FALLBACK` | Optional message when the LLM request fails. |
| `ASSISTANT_VOICE_NAME` | Polly voice name (defaults to `Polly.Joanna`). |
| `ASSISTANT_GOODBYE_KEYWORDS` | Comma-separated phrases that end the call. |

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the landing page and review setup steps. Your voice webhooks will live at:

- `http://localhost:3000/api/voice/incoming`
- `http://localhost:3000/api/voice/respond`

Expose these endpoints to Twilio during development with a tunnelling tool (for example `ngrok http 3000`).

## Twilio configuration

1. Buy or select a Voice-capable phone number in the Twilio Console.
2. Under **Voice & Fax**, set **A Call Comes In** to `Webhook` and paste the deployed URL `https://YOUR_DOMAIN/api/voice/incoming`.
3. Ensure the `HTTP POST` method is selected.
4. Save the configuration and place a call to the Twilio number to test.

## Deployment

Build and test locally:

```bash
npm run lint
npm run build
```

Deploy to Vercel (token must already be configured):

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-1fe38e87
```

After the deployment finishes, verify:

```bash
curl https://agentic-1fe38e87.vercel.app
```

Once the app is live, point the Twilio webhook to the production domain and place a real call.

## API overview

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/voice/incoming` | `POST` | Returns TwiML greeting + speech gather. |
| `/api/voice/respond` | `POST` | Processes speech transcripts and replies with AI-generated TwiML. |

Both endpoints respond with XML and run in the Node.js runtime to support server-side `formData()` parsing.

## Notes

- Conversation state is stored in-memory per server instance. For long-running production loads you should connect a shared store (Redis, Supabase, etc.) keyed by `CallSid`.
- Update the system prompt (`ASSISTANT_SYSTEM_PROMPT`) to capture your brand voice, compliance notes, or routing rules.
- To hand callers to a live agent, integrate Twilio `<Dial>` logic where the assistant detects escalation keywords.

Happy building!
