import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  Download,
  Github,
  Layers3,
  Play,
  Plus,
  RotateCcw,
  Star,
  Terminal,
} from "lucide-react";
import { Logo, Modal } from "./ui";
import { SignalArt, PixelField } from "./visuals";
import { Kbd } from "./vendor/vibeui/kbd";
import "./landing.css";

type LandingProps = {
  onOpenWorkspace: () => void;
  repoUrl: string;
  demoUrl?: string;
};

const useCases = [
  {
    label: "Feedback",
    question: "How was your experience?",
    type: "Rating",
    theme: "sage",
    icon: Star,
  },
  {
    label: "Research",
    question: "What slows you down at work?",
    type: "Long text",
    theme: "lilac",
    icon: Layers3,
  },
  {
    label: "Registration",
    question: "Which session will you attend?",
    type: "Multiple choice",
    theme: "peach",
    icon: ArrowRight,
  },
];

export default function Landing({
  onOpenWorkspace,
  repoUrl,
  demoUrl,
}: LandingProps) {
  const [film, setFilm] = useState(false);
  const [active, setActive] = useState(0);
  const base = import.meta.env.BASE_URL;
  const example = useCases[active];
  const start = (
    className: string,
    text: string,
    icon = <ArrowUpRight size={17} />,
  ) => (
    <a
      href={demoUrl || "/workspace"}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        onOpenWorkspace();
      }}
    >
      {text}
      {icon}
    </a>
  );

  return (
    <div className="launch-site">
      <a
        className="launch-skip"
        href="#launch-main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("launch-main")?.focus();
        }}
      >
        Skip to content
      </a>
      <div className="launch-dark">
        <header className="launch-nav launch-width">
          <a className="launch-brand" href={base} aria-label="Openform home">
            <Logo />
          </a>
          <nav aria-label="Site navigation">
            <SectionLink id="launch-product">Product</SectionLink>
            <SectionLink id="launch-host">Self-host</SectionLink>
            <a href={repoUrl}>
              <Github size={17} /> GitHub
            </a>
          </nav>
          {start("launch-button launch-nav-action", "Open builder")}
        </header>
        <div id="launch-main" role="main" tabIndex={-1}>
          <section
            className="launch-hero launch-width"
            aria-labelledby="launch-title"
          >
            <div className="launch-hero-copy">
              <a className="launch-release" href={repoUrl}>
                <span /> Open source · MIT license <ArrowUpRight size={13} />
              </a>
              <h1 id="launch-title">
                Forms worth
                <br /> <span>answering.</span>
              </h1>
              <p>
                Build beautiful forms that ask one question at a time. Share a
                link, see the answers, and host it on your own terms.
              </p>
              <div className="launch-actions">
                {start("launch-button launch-accent", "Create a form")}
                <button
                  className="launch-button launch-quiet"
                  onClick={() => setFilm(true)}
                >
                  <Play size={15} /> Watch the film
                </button>
              </div>
              <p className="launch-fine">
                Try it in your browser. No account needed.
              </p>
            </div>
            <div className="launch-stage">
              <SignalArt />
              <QuickForm />
              <div className="launch-stage-note">
                <span>↖</span> Try the form
              </div>
            </div>
          </section>
          <div className="launch-modes launch-width">
            <span>
              <Layers3 size={17} /> Visual form builder
            </span>
            <span>
              <ArrowRight size={17} /> One question at a time
            </span>
            <span>
              <Download size={17} /> CSV export
            </span>
            <span>
              <Code2 size={17} /> Self-hostable
            </span>
          </div>
        </div>
      </div>
      <section className="launch-product launch-width" id="launch-product">
        <div className="launch-section-intro">
          <h2>
            One builder.
            <br />
            Any good question.
          </h2>
          <p>
            Start with a template or a blank form. Mix seven question types,
            choose a theme, and preview what respondents will see.
          </p>
        </div>
        <div className="launch-product-grid">
          <div
            className="product-use-cases"
            role="group"
            aria-label="Example questions"
          >
            {useCases.map((item, index) => (
              <button
                key={item.label}
                aria-pressed={active === index}
                onClick={() => setActive(index)}
              >
                <span className="product-use-icon">
                  <item.icon size={18} />
                </span>
                <span>
                  {item.label}
                  <small>{item.type}</small>
                </span>
                <ArrowUpRight size={17} />
              </button>
            ))}
            {start("launch-button launch-outline", "Try the editor")}
          </div>
          <div className="product-editor">
            <div className="product-chrome">
              <i />
              <i />
              <i />
              <span>Form preview</span>
              <Check size={15} />
            </div>
            <div className={"product-preview theme-" + example.theme}>
              <div className="product-question" key={example.label}>
                <div className="launch-mono">
                  01 <ArrowRight size={13} />
                </div>
                <h3>{example.question}</h3>
                {example.type === "Rating" ? (
                  <div className="product-stars" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={24} />
                    ))}
                  </div>
                ) : example.type === "Long text" ? (
                  <div className="product-placeholder">
                    Type your answer here…
                  </div>
                ) : (
                  <div className="product-options">
                    <span>A&nbsp; Morning</span>
                    <span>B&nbsp; Afternoon</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="launch-host" id="launch-host">
        <div className="launch-width launch-host-grid">
          <div>
            <span className="launch-mono">
              <Terminal size={15} /> SELF-HOST OPENFORM
            </span>
            <h2>
              Your forms.
              <br />
              Your database.
            </h2>
            <p>
              Run Openform with Docker and collect responses in your own SQLite
              database. Export answers as CSV whenever you need them.
            </p>
            <a
              className="launch-button launch-outline"
              href={base + "guides/self-host-conversational-forms.html"}
            >
              Self-hosting guide <ArrowUpRight size={17} />
            </a>
          </div>
          <InstallBox repoUrl={repoUrl} />
        </div>
      </section>
      <section className="launch-faq launch-width">
        <h2>Good to know.</h2>
        <div>
          {[
            [
              "Where do responses go?",
              "The online demo saves forms and answers in your browser. Run your own Openform instance to collect responses centrally.",
            ],
            [
              "What can I build?",
              "Use seven question types to build feedback forms, surveys, applications, and sign-ups. Preview, publish, and share a link when it’s ready.",
            ],
            [
              "Can I change the code?",
              "Yes. Openform is MIT licensed. You can run, modify, and redistribute it.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <Plus size={17} />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <footer className="launch-footer">
        <div className="launch-width">
          <a className="launch-brand" href={base}>
            <Logo />
          </a>
          <div className="launch-footer-links">
            <a href={base + "guides/open-source-typeform-alternative.html"}>
              Typeform alternative
            </a>
            <a href={base + "guides/customer-feedback-form.html"}>
              Feedback forms
            </a>
            <a href={repoUrl}>
              GitHub <ArrowUpRight size={13} />
            </a>
            <a href={repoUrl + "/blob/main/LICENSE"}>MIT license</a>
          </div>
        </div>
      </footer>
      {film && (
        <Modal title="Meet Openform" onClose={() => setFilm(false)} wide>
          <video
            className="launch-video"
            controls
            playsInline
            autoPlay
            preload="metadata"
            poster={base + "social-card.png"}
            aria-label="Openform launch film"
          >
            <source src={base + "media/openform-launch.mp4"} type="video/mp4" />
            <track
              kind="captions"
              src={base + "media/openform-launch.vtt"}
              srcLang="en"
              label="English"
            />
          </video>
        </Modal>
      )}
    </div>
  );
}

function SectionLink({ id, children }: { id: string; children: string }) {
  return (
    <a
      href={"#" + id}
      onClick={(event) => {
        event.preventDefault();
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }}
    >
      {children}
    </a>
  );
}

function InstallBox({ repoUrl }: { repoUrl: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);
  const commands = [
    "git clone " + repoUrl + ".git",
    "cd " + repoUrl.split("/").at(-1),
    "docker compose up --build -d",
  ];
  return (
    <div className="launch-terminal">
      <div className="launch-terminal-top">
        <span>
          <Terminal size={16} /> Terminal
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(commands.join("\n")).then(
              () => setStatus("copied"),
              () => setStatus("error"),
            );
          }}
        >
          {status === "copied" ? <Check size={15} /> : <Copy size={15} />}{" "}
          <span aria-live="polite">
            {status === "copied"
              ? "Copied"
              : status === "error"
                ? "Copy unavailable"
                : "Copy"}
          </span>
        </button>
      </div>
      <pre tabIndex={0}>
        <code>
          {commands.map((line) => (
            <span key={line}>
              <b>$ </b>
              {line}
            </span>
          ))}
        </code>
      </pre>
      <div className="launch-terminal-foot">
        Local instance <span>→</span> <code>127.0.0.1:3001</code>
      </div>
    </div>
  );
}

function QuickForm() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [choice, setChoice] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const move = (next: number) => {
    setError("");
    setStep(next);
    window.requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  };
  const advance = () => {
    const missing = [!name.trim(), !choice, !rating][step];
    if (missing) {
      setError(
        step === 0
          ? "Enter your first name to continue."
          : "Choose an answer to continue.",
      );
      return;
    }
    move(step + 1);
  };
  return (
    <form
      className="quick-form"
      onSubmit={(event) => {
        event.preventDefault();
        advance();
      }}
      aria-label="Live Openform example"
    >
      <div className="quick-top">
        <span>
          <Logo compact /> A quick hello
        </span>
        <span className="quick-live">
          <i /> Live demo
        </span>
      </div>
      <div className="quick-progress" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <i className={i <= step ? "filled" : ""} key={i} />
        ))}
      </div>
      <div className="quick-body" key={step}>
        <div className="quick-index">
          {step < 3 ? `0${step + 1} / 03` : <Check size={18} />}
        </div>
        <h2 ref={heading} tabIndex={-1}>
          {
            [
              "What should we call you?",
              `What are you making, ${name.trim()}?`,
              "How did that feel?",
              `Thanks, ${name.trim()}.`,
            ][step]
          }
        </h2>
        {step === 0 && (
          <input
            aria-label="Your first name"
            autoComplete="given-name"
            placeholder="Your first name"
            value={name}
            maxLength={32}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
          />
        )}
        {step === 1 && (
          <div
            className="quick-options"
            role="group"
            aria-label="What are you making?"
          >
            {["A survey", "A signup form", "Something else"].map((item, i) => (
              <button
                type="button"
                key={item}
                aria-pressed={choice === item}
                onClick={() => {
                  setChoice(item);
                  setError("");
                }}
              >
                <span>{"ABC"[i]}</span>
                {item}
                {choice === item && <Check size={14} />}
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="quick-stars" role="group" aria-label="Rate the demo">
            {[1, 2, 3, 4, 5].map((item) => (
              <button
                type="button"
                key={item}
                aria-label={`${item} out of 5`}
                aria-pressed={rating === item}
                onClick={() => {
                  setRating(item);
                  setError("");
                }}
              >
                <Star
                  size={24}
                  fill={rating >= item ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <p>
            You just answered an Openform. This preview keeps your answers on
            this page.
          </p>
        )}
        {error && (
          <p className="quick-error" role="alert">
            {error}
          </p>
        )}
        <div className="quick-actions">
          {step < 3 ? (
            <>
              <button className="quick-next" type="submit">
                {step === 2 ? "Finish" : "Continue"} <ArrowRight size={16} />
              </button>
              {step === 0 ? (
                <Kbd>↵ Enter</Kbd>
              ) : (
                <button
                  type="button"
                  className="quick-back"
                  onClick={() => move(step - 1)}
                  aria-label="Previous question"
                >
                  <ArrowLeft size={17} />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              className="quick-next"
              onClick={() => {
                setName("");
                setChoice("");
                setRating(0);
                move(0);
              }}
            >
              Start over <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>
      <div className="quick-footer">
        <span>
          Made with <b>openform</b>
        </span>
        <ArrowDown size={13} />
      </div>
      <PixelField className="quick-texture" />
    </form>
  );
}
