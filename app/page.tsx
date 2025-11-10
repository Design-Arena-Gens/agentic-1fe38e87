import Link from "next/link";

const twilioSteps = [
  {
    title: "Buy a phone number",
    description:
      "In the Twilio Console, purchase or select a number with Voice capabilities enabled.",
  },
  {
    title: "Point voice webhooks",
    description:
      "Set the Voice & Fax webhook for incoming calls to POST https://YOUR_DOMAIN/api/voice/incoming.",
  },
  {
    title: "Deploy & test",
    description:
      "Deploy this project to Vercel, add your environment variables, and call the Twilio number.",
  },
];

const features = [
  {
    title: "Natural small talk",
    description:
      "Every caller hears a warm greeting and can speak naturally while the assistant listens and responds in real time.",
  },
  {
    title: "Live context memory",
    description:
      "Conversations stay in context for the duration of the call. You can plug in your own data source or CRM later.",
  },
  {
    title: "Operator handoff ready",
    description:
      "You choose the keywords that send callers to voicemail, hang up, or route to a live teammate.",
  },
];

export default function Home() {
  return (
    <main>
      <header className="panel grid">
        <span className="badge">
          <span role="img" aria-label="sparkles">
            ✨
          </span>
          AI receptionist for your phone line
        </span>
        <h1 className="headline">
          Your voice assistant that answers every call, every time.
        </h1>
        <p className="subheadline">
          Drop this project on Vercel, connect your Twilio phone number, and
          your callers will speak with an AI receptionist that follows the tone
          and scripting you define.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link className="button" href="#getting-started">
            Configure Twilio webhooks
          </Link>
          <Link
            className="button secondary"
            href="https://www.twilio.com/console/voice/numbers"
            target="_blank"
            rel="noreferrer"
          >
            Open Twilio Console
          </Link>
        </div>
      </header>

      <section className="grid" style={{ marginTop: "3.5rem" }}>
        <div className="panel grid">
          <h2 className="section-title">Environment variables</h2>
          <p className="muted">
            Add these to your Vercel project or a local <code>.env.local</code>{" "}
            file before running <code>npm run dev</code>.
          </p>
          <pre>
            {`OPENAI_API_KEY=sk-...
ASSISTANT_VOICE_NAME=Polly.Joanna
ASSISTANT_SYSTEM_PROMPT=You are a professional scheduling assistant for Acme Co. ...
ASSISTANT_GOODBYE_KEYWORDS=goodbye,thanks,that's all,end call`}
          </pre>
        </div>

        <div className="panel grid two" id="getting-started">
          {twilioSteps.map((step) => (
            <article key={step.title} className="card">
              <h3>{step.title}</h3>
              <p className="muted">{step.description}</p>
            </article>
          ))}
        </div>

        <div className="panel grid">
          <h2 className="section-title">Capabilities</h2>
          <div className="grid two">
            {features.map((feature) => (
              <article key={feature.title} className="card">
                <h3>{feature.title}</h3>
                <p className="muted">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel grid">
          <h2 className="section-title">Webhook URLs</h2>
          <p className="muted">
            Replace <code>YOUR_DOMAIN</code> with the domain where this project
            runs (for example{" "}
            <code>https://agentic-1fe38e87.vercel.app/api/voice/incoming</code>
            ).
          </p>
          <pre>
            {`Incoming call webhook (HTTP POST):
https://YOUR_DOMAIN/api/voice/incoming`}
          </pre>
          <p className="muted">
            The assistant listens for exit keywords. Customize them with{" "}
            <code>ASSISTANT_GOODBYE_KEYWORDS</code> to trigger a graceful
            goodbye and hang up.
          </p>
        </div>
      </section>
    </main>
  );
}
