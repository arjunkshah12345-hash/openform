import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  Code2,
  Copy,
  Github,
  Heart,
  Play,
  RotateCcw,
  Star,
} from "lucide-react";
import { Logo, Modal } from "./ui";
import "./landing.css";

type LandingProps = {
  onOpenWorkspace: () => void;
  repoUrl: string;
  demoUrl?: string;
};
const scrollToSection = (id: string) =>
  document
    .getElementById(id)
    ?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });

export default function Landing({ onOpenWorkspace, repoUrl }: LandingProps) {
  const [copied, setCopied] = useState(false);
  const [showFilm, setShowFilm] = useState(false);
  const assetBase = import.meta.env.BASE_URL;
  const [showPrivacy, setShowPrivacy] = useState(false);
  const repoPath = repoUrl.replace("https://github.com/", "");
  const copy = () =>
    navigator.clipboard
      .writeText(
        `git clone https://github.com/${repoPath}.git\ncd ${repoPath.split("/").pop()}\nnpm install\nnpm run dev`,
      )
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => setCopied(false));
  return (
    <div className="of-landing">
      <a
        href="#of-main"
        className="of-skip"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("of-main")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="of-nav">
        <button
          className="of-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Openform home"
        >
          <Logo />
        </button>
        <nav aria-label="Site navigation">
          <button onClick={() => scrollToSection("of-features")}>
            Why Openform
          </button>
          <button onClick={() => scrollToSection("of-use-cases")}>
            Made for you
          </button>
          <a href={repoUrl} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>
        <button className="of-nav-cta" onClick={onOpenWorkspace}>
          Try the builder <ArrowRight size={15} />
        </button>
      </header>
      <main id="of-main" tabIndex={-1}>
        <section className="of-hero">
          <div className="of-hero-copy">
            <a
              className="of-open-source"
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span /> OPEN SOURCE. OPEN POSSIBILITIES.{" "}
              <ArrowUpRight size={12} />
            </a>
            <h1>
              Good questions.
              <br />
              Great <em>connections.</em>
            </h1>
            <p>
              Forms that feel like a conversation.
              <br />
              Beautiful to fill out. Simple to make. Yours to own.
            </p>
            <div className="of-hero-actions">
              <button
                className="of-button of-button-dark"
                onClick={onOpenWorkspace}
              >
                Make your first form <ArrowUpRight size={18} />
              </button>
              <a
                className="of-github-link"
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={17} /> View the source
              </a>
            </div>
            <div className="of-hero-footnote">
              <Check size={13} /> No account. No credit card. Just curiosity.
            </div>
            <button className="of-film-link" onClick={() => setShowFilm(true)}>
              <Play size={13} fill="currentColor" /> Watch the 30-second film{" "}
              <ArrowUpRight size={13} />
            </button>
            <div className="of-handwritten" aria-hidden="true">
              <svg viewBox="0 0 105 55">
                <path
                  d="M3 7c23 9 15 41 62 35 16-2 24-11 34-23m-18 3 20-7-1 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                Less form.
                <br />
                More human.
              </span>
            </div>
          </div>
          <div className="of-hero-demo">
            <div className="of-demo-caption">
              <span>
                <span /> A LITTLE PREVIEW OF WHAT’S POSSIBLE
              </span>
              <span>
                Go on, try it <ArrowDown size={13} />
              </span>
            </div>
            <ConversationDemo />
            <div className="of-demo-under">
              <span>
                <Heart size={12} /> A small interaction. A better first
                impression.
              </span>
              <span>100% yours.</span>
            </div>
            <span className="of-hero-asterisk" aria-hidden="true">
              ✳
            </span>
          </div>
        </section>
        <div className="of-belief">
          <span>For the good questions in life.</span>
          <div>
            <span>Feedback worth hearing.</span>
            <i>✳</i>
            <span>People worth knowing.</span>
            <i>✳</i>
            <span>Ideas worth exploring.</span>
          </div>
        </div>
        <section id="of-features" className="of-feature-section">
          <div className="of-section-heading">
            <span className="of-eyebrow">THOUGHTFULLY SIMPLE</span>
            <h2>
              Less friction.
              <br />
              <em>More conversation.</em>
            </h2>
            <p>
              Getting an answer shouldn’t feel like paperwork.
              <br />
              Give every question a little breathing room.
            </p>
          </div>
          <div className="of-feature-layout">
            <div className="of-editor-scene">
              <div className="of-editor-chrome">
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <span>Customer feedback</span>
                <span>
                  <Check size={11} /> Saved
                </span>
              </div>
              <MiniEditor />
              <div className="of-editor-caption">
                <Code2 size={13} /> An actual form builder. No coding required.
              </div>
            </div>
            <div className="of-feature-copy">
              <span className="of-feature-number">01 / MAKE IT YOURS</span>
              <h3>
                A blank page.
                <br />A world of possibilities.
              </h3>
              <p>
                Start with an idea or a ready-to-go template. Add your
                questions, find your colors, and make something that feels like
                you.
              </p>
              <ul>
                <li>
                  <Check /> Seven useful question types
                </li>
                <li>
                  <Check /> Six thoughtful color themes
                </li>
                <li>
                  <Check /> A preview that feels like the real thing
                </li>
              </ul>
              <button className="of-text-link" onClick={onOpenWorkspace}>
                Find your starting point <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="of-two-principles">
            <article>
              <span className="of-feature-number">02 / KEEP IT HUMAN</span>
              <h3>
                One question.
                <br />
                All their attention.
              </h3>
              <p>
                A familiar conversation, not a wall of fields. A thoughtful
                experience on every screen, with keyboard controls and room to
                share.
              </p>
              <span className="of-principle-flower" aria-hidden="true">
                ✳
              </span>
            </article>
            <article>
              <span className="of-feature-number">03 / REALLY LISTEN</span>
              <h3>
                Every response.
                <br />A new perspective.
              </h3>
              <p>
                Keep the answers together. Read the whole story, look a little
                closer, or take your responses with you in a clean CSV export.
              </p>
              <div className="of-principle-answers" aria-hidden="true">
                <span>
                  <Check /> “That felt easy.”
                </span>
                <span>
                  <Heart size={13} /> “Thanks for asking.”
                </span>
              </div>
            </article>
          </div>
        </section>
        <UseCases onOpenWorkspace={onOpenWorkspace} />
        <section id="of-open-source" className="of-ownership">
          <div>
            <span className="of-eyebrow">OPEN BY NATURE. YOURS BY DESIGN.</span>
            <h2>
              Beautiful forms.
              <br />
              <em>Without the strings.</em>
            </h2>
            <p>
              Good software should give you more freedom.
              <br />
              Openform is MIT licensed. Read it, change it, host it.
              <br />
              Your forms and your data deserve a home of their own.
            </p>
            <a
              className="of-button of-button-dark"
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={17} /> Make it your own <ArrowUpRight size={16} />
            </a>
            <div className="of-ownership-note">
              <span>MIT LICENSED</span>
              <span>SELF-HOSTABLE</span>
              <span>NO TRACKERS</span>
            </div>
          </div>
          <div className="of-code-wrap">
            <div className="of-code-heading">
              <span>YOUR NEXT CONVERSATION STARTS HERE</span>
              <button onClick={copy} aria-label="Copy setup commands">
                {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre>
              <code>
                <span className="of-code-comment">
                  # A little space of your own
                </span>
                {"\n"}
                <span className="of-code-prompt">$</span> git clone {repoUrl}
                .git{"\n"}
                <span className="of-code-prompt">$</span> cd{" "}
                {repoPath.split("/").pop()}
                {"\n"}
                <span className="of-code-prompt">$</span> npm install{"\n"}
                <span className="of-code-prompt">$</span> npm run dev{"\n\n"}
                <span className="of-code-ready">
                  → Your workspace is ready.
                </span>
              </code>
            </pre>
            <div className="of-code-footer">
              <span>React + TypeScript + SQLite</span>
              <a href={`${repoUrl}#readme`} target="_blank" rel="noreferrer">
                Self-hosting guide <ArrowUpRight size={13} />
              </a>
            </div>
            <p className="of-demo-disclaimer">
              The online demo saves forms and responses in your browser.
              Self-host Openform to collect responses from everyone, in your own
              database.
            </p>
          </div>
        </section>
        <section className="of-faq">
          <div>
            <span className="of-eyebrow">A FEW GOOD QUESTIONS</span>
            <h2>
              Curious?
              <br />
              <em>Good.</em>
            </h2>
          </div>
          <div>
            {[
              [
                "Is Openform really free?",
                "Yes. The source code is MIT licensed. Use it, change it, and host it yourself. There are no paid plans built into Openform. You cover your own hosting costs.",
              ],
              [
                "Can I try it without setting anything up?",
                "Absolutely. The browser demo lets you build, style, publish, and fill out forms. Demo forms and responses stay in that browser. For shared response collection, run your own instance.",
              ],
              [
                "What can I build with it?",
                "Feedback forms, event sign-ups, research surveys, contact forms, applications, and anything else a good question can start. Choose short text, long text, email, multiple choice, number, rating, or yes/no questions.",
              ],
              [
                "Where does my data live?",
                "In the demo, it lives in your browser’s local storage. In a self-hosted instance, forms and responses live in your SQLite database. There are no analytics trackers or third-party data collection built into the app.",
              ],
              [
                "Can I contribute?",
                "Please do. Openform is built to be read, improved, and made your own. Visit the GitHub repository for the code, setup instructions, and contribution guide.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <PlusSymbol />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="of-final-cta">
          <span className="of-final-flower" aria-hidden="true">
            ✳
          </span>
          <span className="of-eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</span>
          <h2>
            What will you
            <br />
            <em>ask today?</em>
          </h2>
          <button
            className="of-button of-button-dark"
            onClick={onOpenWorkspace}
          >
            Start a conversation <ArrowUpRight size={18} />
          </button>
          <p>Beautiful forms. Open to everyone.</p>
        </section>
      </main>
      <section className="of-guides" aria-label="Openform guides">
        <span className="of-eyebrow">A FEW USEFUL STARTING POINTS</span>
        <div>
          <a href={`${assetBase}guides/open-source-typeform-alternative.html`}>
            An open-source Typeform alternative <ArrowUpRight size={14} />
          </a>
          <a href={`${assetBase}guides/self-host-conversational-forms.html`}>
            Self-hosting guide <ArrowUpRight size={14} />
          </a>
          <a href={`${assetBase}guides/customer-feedback-form.html`}>
            Build a customer feedback form <ArrowUpRight size={14} />
          </a>
        </div>
      </section>
      <footer className="of-footer">
        <div>
          <Logo />
          <span>A little more human.</span>
        </div>
        <div>
          <a href={repoUrl} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
          <a
            href={`${repoUrl}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
          >
            MIT license
          </a>
          <button
            onClick={() => setShowPrivacy(!showPrivacy)}
            aria-expanded={showPrivacy}
          >
            Your privacy
          </button>
          <span>Made for meaningful connections.</span>
        </div>
        {showPrivacy && (
          <p className="of-privacy-copy">
            Openform includes no analytics or advertising trackers. The demo
            uses your browser’s local storage for forms and responses; your
            preview answers above are held only in memory. Your hosting provider
            may keep normal server access logs. Self-hosted owners control their
            own database and privacy practices.
          </p>
        )}
      </footer>
      {showFilm && (
        <Modal title="Meet Openform" onClose={() => setShowFilm(false)} wide>
          <video
            className="of-launch-video"
            controls
            playsInline
            autoPlay
            preload="metadata"
            poster={`${assetBase}social-card.png`}
            aria-label="Openform 30-second launch film"
          >
            <source
              src={`${assetBase}media/openform-launch.mp4`}
              type="video/mp4"
            />
            <track
              kind="captions"
              src={`${assetBase}media/openform-launch.vtt`}
              srcLang="en"
              label="English"
            />
            Your browser does not support video playback.
          </video>
          <p className="of-video-caption">
            Build. Ask. Listen. An original Remotion film with original music.
          </p>
        </Modal>
      )}
    </div>
  );
}
function PlusSymbol() {
  return (
    <span className="of-plus" aria-hidden="true">
      +
    </span>
  );
}

function ConversationDemo() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [choice, setChoice] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const themes = ["sage", "peach", "lilac"];
  const next = () => {
    if (
      (step === 0 && !name.trim()) ||
      (step === 1 && !choice) ||
      (step === 2 && !rating)
    ) {
      setError(
        step === 0
          ? "A first name is all we need."
          : "Choose an answer to keep going.",
      );
      return;
    }
    setError("");
    if (step === 2) setComplete(true);
    else setStep(step + 1);
  };
  const reset = () => {
    setStep(0);
    setName("");
    setChoice("");
    setRating(0);
    setError("");
    setComplete(false);
  };
  return (
    <div className={`of-conversation of-conversation-${themes[step]}`}>
      <div className="of-conversation-header">
        <Logo compact />
        <span>A little hello</span>
        <span>INTERACTIVE DEMO</span>
      </div>
      <div className="of-conversation-progress">
        <span style={{ transform: `scaleX(${complete ? 1 : step / 3})` }} />
      </div>
      <div className="of-conversation-body" key={complete ? "done" : step}>
        {complete ? (
          <>
            <span className="of-demo-flower">✳</span>
            <h2>
              Nice to meet you,
              <br />
              <em>{name.trim()}.</em>
            </h2>
            <p>
              That’s what a better form feels like.
              <br />
              Now imagine what you could ask.
            </p>
            <button className="of-demo-next" onClick={reset}>
              Once more? <RotateCcw size={15} />
            </button>
          </>
        ) : (
          <>
            <span className="of-demo-question-index">
              0{step + 1} <ArrowRight size={14} />
            </span>
            <h2>
              {step === 0 ? (
                <>
                  First things first,
                  <br />
                  what’s your name?
                </>
              ) : step === 1 ? (
                <>
                  Hi {name.trim()}.<br />
                  What brings you here?
                </>
              ) : (
                <>
                  One last thing.
                  <br />
                  How did that feel?
                </>
              )}
            </h2>
            {step === 0 ? (
              <input
                className="of-demo-input"
                aria-label="Your first name"
                placeholder="Your first name goes here..."
                value={name}
                maxLength={40}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") next();
                }}
              />
            ) : step === 1 ? (
              <div className="of-demo-options">
                {["A curious mind", "A big idea", "A better way to ask"].map(
                  (o, i) => (
                    <button
                      key={o}
                      className={choice === o ? "chosen" : ""}
                      onClick={() => {
                        setChoice(o);
                        setError("");
                      }}
                      aria-pressed={choice === o}
                    >
                      <span>{String.fromCharCode(65 + i)}</span>
                      {o}
                      {choice === o && <Check size={15} />}
                    </button>
                  ),
                )}
              </div>
            ) : (
              <div className="of-demo-ratings" aria-label="Rate this form">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setRating(n);
                      setError("");
                    }}
                    aria-label={`${n} out of 5`}
                    aria-pressed={rating === n}
                    className={rating >= n ? "chosen" : ""}
                  >
                    <Star
                      size={28}
                      fill={rating >= n ? "currentColor" : "none"}
                    />
                    <span>{n}</span>
                  </button>
                ))}
              </div>
            )}
            {error && (
              <p role="alert" className="of-demo-error">
                {error}
              </p>
            )}
            <div className="of-demo-action">
              <button className="of-demo-next" onClick={next}>
                {step === 2 ? "All done" : "OK"} <Check size={15} />
              </button>
              {step === 0 && (
                <span>
                  press <strong>Enter ↵</strong>
                </span>
              )}
              {step > 0 && (
                <button
                  className="of-demo-back"
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                  }}
                  aria-label="Previous preview question"
                >
                  <ChevronLeft size={17} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <div className="of-conversation-footer">
        <span>
          Made with <strong>openform</strong>
        </span>
        <span>
          {complete ? "Thanks for being curious." : `${step + 1} of 3`}
        </span>
      </div>
    </div>
  );
}

function MiniEditor() {
  const [active, setActive] = useState(1);
  const [theme, setTheme] = useState("sage");
  const questions = [
    "First things first, your name?",
    "How was your experience?",
    "What could we do better?",
  ];
  return (
    <div className="of-mini-editor">
      <aside>
        <span>YOUR QUESTIONS</span>
        {questions.map((q, i) => (
          <button
            className={active === i ? "active" : ""}
            key={q}
            onClick={() => setActive(i)}
          >
            <span>{i + 1}</span>
            {q}
          </button>
        ))}
        <span className="of-mini-theme-label">A LITTLE PERSONALITY</span>
        <div className="of-mini-themes">
          {["sage", "peach", "lilac"].map((t) => (
            <button
              key={t}
              className={`of-swatch-${t} ${theme === t ? "active" : ""}`}
              onClick={() => setTheme(t)}
              aria-label={`Preview ${t} theme`}
              aria-pressed={theme === t}
            >
              {theme === t && <Check size={12} />}
            </button>
          ))}
        </div>
      </aside>
      <div className={`of-mini-preview of-mini-preview-${theme}`}>
        <span className="of-mini-preview-step">{active + 1} →</span>
        <h4>{questions[active]}</h4>
        {active === 1 ? (
          <div className="of-mini-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={23} />
            ))}
          </div>
        ) : (
          <span className="of-mini-answer">
            {active === 0
              ? "Type your name here…"
              : "Every little thought helps…"}
          </span>
        )}
        <span className="of-mini-ok">
          OK <Check size={10} />
        </span>
      </div>
    </div>
  );
}
function UseCases({ onOpenWorkspace }: { onOpenWorkspace: () => void }) {
  const [selected, setSelected] = useState(0);
  const cases = [
    {
      name: "Feedback",
      title: "Your next great idea<br/>might be their answer.",
      question: "What could we do better?",
      text: "Give your customers a thoughtful place to share what’s working, what isn’t, and what comes next.",
      theme: "sage",
    },
    {
      name: "Sign-ups",
      title: "Bring the right<br/>people together.",
      question: "What’s your idea of a great event?",
      text: "From a community meetup to your next workshop. Make a first impression that feels like a warm welcome.",
      theme: "peach",
    },
    {
      name: "Research",
      title: "Better questions.<br/>Fresh perspectives.",
      question: "Tell us about the last time…",
      text: "Look beyond the obvious. Collect honest perspectives, understand a real problem, and find your next direction.",
      theme: "lilac",
    },
    {
      name: "Applications",
      title: "Meet the person.<br/>Not just the résumé.",
      question: "What are you most proud of?",
      text: "Open the door to interesting people. Turn a job application into the start of a real conversation.",
      theme: "sand",
    },
  ];
  const chosen = cases[selected];
  return (
    <section className="of-use-cases" id="of-use-cases">
      <div className="of-use-case-top">
        <span className="of-eyebrow">FOR ALL YOUR GOOD QUESTIONS</span>
        <div
          className="of-use-case-tabs"
          role="tablist"
          aria-label="Form use cases"
        >
          {cases.map((c, i) => (
            <button
              key={c.name}
              role="tab"
              aria-selected={selected === i}
              aria-controls="of-use-case-panel"
              id={`of-use-case-tab-${i}`}
              onClick={() => setSelected(i)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div
        className="of-use-case-panel"
        id="of-use-case-panel"
        role="tabpanel"
        aria-labelledby={`of-use-case-tab-${selected}`}
      >
        <div key={chosen.name}>
          <h2>
            {chosen.title.split("<br/>").map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>
          <p>{chosen.text}</p>
          <button className="of-text-link" onClick={onOpenWorkspace}>
            Make it happen <ArrowRight size={16} />
          </button>
        </div>
        <div
          className={`of-use-case-art of-use-case-${chosen.theme}`}
          aria-hidden="true"
        >
          <span className="of-use-case-flower">✳</span>
          <div className="of-use-case-paper">
            <span>ONE GOOD QUESTION</span>
            <h3>{chosen.question}</h3>
            <span className="of-paper-answer">Your perspective goes here…</span>
            <span className="of-paper-button">
              Let’s talk <ArrowUpRight size={13} />
            </span>
          </div>
          <span className="of-art-note">
            Start something
            <br />
            <em>worth asking.</em>
          </span>
        </div>
      </div>
    </section>
  );
}
