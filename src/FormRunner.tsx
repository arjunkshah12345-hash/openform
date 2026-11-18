import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
} from "lucide-react";
import type { Form, Question, Submission } from "./types";
import { request } from "./api";
import { STATIC_DEMO, routeUrl } from "./routing";
import { Logo } from "./ui";
export default function FormRunner({
  id,
  previewForm,
}: {
  id?: string;
  previewForm?: Form;
}) {
  const [form, setForm] = useState<Form | null>(previewForm || null);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (previewForm || !id) return;
    let active = true;
    request<Form>(`/public/forms/${id}`)
      .then((f) => active && setForm(f))
      .catch((e) => active && setLoadError(e.message));
    return () => {
      active = false;
    };
  }, [id, previewForm]);
  useEffect(() => {
    setError("");
  }, [step]);
  const question = form?.questions[step];
  const submit = async () => {
    if (!form || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      if (!previewForm)
        await request<Submission>(`/public/forms/${form.id}/responses`, {
          method: "POST",
          body: JSON.stringify({ answers }),
        });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };
  const advance = () => {
    if (!form || submitting) return;
    if (step === -1) {
      setStep(0);
      return;
    }
    if (!question) return;
    const value = answers[question.id];
    const message = validate(question, value);
    if (message) {
      setError(message);
      return;
    }
    if (step === form.questions.length - 1) void submit();
    else setStep(step + 1);
  };
  if (loadError)
    return (
      <div className="runner-unavailable">
        <Logo />
        <div>
          <span className="eyebrow">A MOMENT OF QUIET</span>
          <h1>
            This form isn’t taking
            <br />
            answers right now.
          </h1>
          <p>It may not be published, or its owner may have closed it.</p>
          <a className="secondary" href={routeUrl("/")}>
            Go to Openform <ArrowRight size={16} />
          </a>
        </div>
      </div>
    );
  if (!form)
    return (
      <div className="full-loading">
        <Loader2 className="spin" /> Getting your conversation ready…
      </div>
    );
  return (
    <div
      className={`form-runner theme-${form.theme} ${previewForm ? "runner-embedded" : ""}`}
    >
      <div
        className="runner-progress"
        role="progressbar"
        aria-label="Form progress"
        aria-valuemin={0}
        aria-valuemax={form.questions.length}
        aria-valuenow={done ? form.questions.length : Math.max(0, step)}
      >
        <span
          style={{
            transform: `scaleX(${done ? 1 : Math.max(0, step) / form.questions.length})`,
          }}
        />
      </div>
      <header className="runner-header">
        <Logo compact />
        <span>{form.title}</span>
        {previewForm && <span className="preview-tag">PREVIEW</span>}
      </header>
      {STATIC_DEMO && !previewForm && (
        <p
          style={{
            fontSize: 11,
            textAlign: "center",
            margin: "0 25px",
            opacity: 0.8,
            lineHeight: 1.7,
          }}
        >
          Interactive demo: your answers stay in this browser. They are not sent
          to the form’s owner.
        </p>
      )}
      <main
        className="runner-main"
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            e.target instanceof HTMLElement &&
            !["TEXTAREA", "BUTTON"].includes(e.target.tagName) &&
            !(e.nativeEvent as KeyboardEvent).isComposing
          ) {
            e.preventDefault();
            advance();
          }
        }}
      >
        {done ? (
          <div className="runner-content runner-done">
            <span className="done-flower">✳</span>
            <span className="eyebrow">A LITTLE TIME. A BIG THANK YOU.</span>
            <h1>You made a difference.</h1>
            <p>
              {previewForm
                ? "That’s the whole experience. Your preview answers weren’t saved."
                : STATIC_DEMO
                  ? "Your demo response is saved in this browser only. It has not been sent to the form owner."
                  : "Your response is in. Thanks for sharing a little piece of your world with us."}
            </p>
            <span className="done-check">
              <Check size={17} />
              {previewForm ? "Preview complete" : "Response received"}
            </span>
            {previewForm && (
              <button
                className="text-button"
                onClick={() => {
                  setDone(false);
                  setStep(-1);
                  setAnswers({});
                }}
              >
                Try again <ArrowRight size={15} />
              </button>
            )}
          </div>
        ) : step === -1 ? (
          <div className="runner-content runner-welcome">
            <span className="welcome-flower">✳</span>
            <span className="eyebrow">LET’S START A CONVERSATION</span>
            <h1>{form.title}</h1>
            <p>
              {form.description ||
                "Your perspective matters. We’d love to hear it."}
            </p>
            <div className="runner-action-row">
              <button className="runner-next" ref={nextRef} onClick={advance}>
                Let’s get started <ArrowRight size={19} />
              </button>
              <span className="press-enter">
                takes about {Math.max(1, Math.ceil(form.questions.length / 3))}{" "}
                min
              </span>
            </div>
            <small>
              {form.questions.length} thoughtful{" "}
              {form.questions.length === 1 ? "question" : "questions"}. One at a
              time.
            </small>
          </div>
        ) : (
          question && (
            <div key={question.id} className="runner-content runner-question">
              <span className="runner-question-number">
                {step + 1} <ArrowRight size={17} />
              </span>
              <h1>
                {question.title}
                {question.required && <sup>*</sup>}
              </h1>
              {question.description && <p>{question.description}</p>}
              <QuestionInput
                question={question}
                value={answers[question.id] ?? ""}
                onChange={(value) => {
                  setAnswers((a) => {
                    const next = { ...a };
                    if (value === "") delete next[question.id];
                    else next[question.id] = value;
                    return next;
                  });
                  setError("");
                }}
                error={Boolean(error)}
              />
              {error && (
                <div className="runner-error" role="alert">
                  {error}
                </div>
              )}
              <div className="runner-action-row">
                <button
                  ref={nextRef}
                  className="runner-next"
                  disabled={submitting}
                  onClick={advance}
                >
                  {submitting ? (
                    <Loader2 className="spin" size={19} />
                  ) : step === form.questions.length - 1 ? (
                    <>
                      Submit <Check size={18} />
                    </>
                  ) : (
                    <>
                      OK <Check size={18} />
                    </>
                  )}
                </button>
                <span className="press-enter">
                  {question.type === "long-text" ? (
                    "Shift + Enter for a new line"
                  ) : (
                    <>
                      press <strong>Enter ↵</strong>
                    </>
                  )}
                </span>
                {!question.required && (
                  <button
                    className="text-button skip-question"
                    disabled={submitting}
                    onClick={() => {
                      setAnswers((a) => {
                        const next = { ...a };
                        delete next[question.id];
                        return next;
                      });
                      if (step < form.questions.length - 1) setStep(step + 1);
                      else {
                        setError("");
                        setTimeout(() => nextRef.current?.click(), 0);
                      }
                    }}
                  >
                    Skip <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </main>
      <footer className="runner-footer">
        <a
          href={routeUrl("/")}
          target={previewForm ? undefined : "_blank"}
          rel="noreferrer"
          onClick={previewForm ? (e) => e.preventDefault() : undefined}
        >
          Made with <strong>openform</strong>
          <span>✳</span>
        </a>
        {step >= 0 && !done && (
          <div>
            <span>
              {step + 1} of {form.questions.length}
            </span>
            <button
              aria-label="Previous question"
              onClick={() => setStep(step - 1)}
              disabled={submitting}
            >
              <ChevronUp size={20} />
            </button>
            <button
              aria-label="Next question"
              onClick={advance}
              disabled={submitting}
            >
              <ChevronDown size={20} />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
export function QuestionInput({
  question: q,
  value,
  onChange,
  disabled = false,
  error = false,
}: {
  question: Question;
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [q.id, disabled]);
  const common = {
    "aria-label": q.title || "Your answer",
    "aria-required": q.required,
    "aria-invalid": error,
    disabled,
  };
  if (q.type === "multiple-choice" || q.type === "yes-no") {
    const options = q.type === "yes-no" ? ["Yes", "No"] : q.options;
    return (
      <div className="runner-options" role="group" aria-label={q.title}>
        {options.map((o, i) => (
          <button
            key={i}
            className={value === o ? "chosen" : ""}
            disabled={disabled}
            aria-pressed={value === o}
            onClick={() => onChange(o)}
          >
            <span>{String.fromCharCode(65 + i)}</span>
            {o}
            {value === o && <Check size={17} />}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === "rating")
    return (
      <div className="rating-field">
        <div role="group" aria-label={q.title}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              disabled={disabled}
              className={Number(value) >= n ? "chosen" : ""}
              aria-label={`${n} out of 5`}
              aria-pressed={Number(value) === n}
              onClick={() => onChange(n)}
            >
              <Star
                size={30}
                fill={Number(value) >= n ? "currentColor" : "none"}
              />
              <span>{n}</span>
            </button>
          ))}
        </div>
        <div>
          <span>Not so great</span>
          <span>Loved it</span>
        </div>
      </div>
    );
  if (q.type === "long-text")
    return (
      <textarea
        {...common}
        ref={(el) => {
          inputRef.current = el;
        }}
        className="runner-text-input long-answer"
        placeholder="Tell us a little more..."
        value={value}
        rows={3}
        maxLength={10000}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget
              .closest(".runner-content")
              ?.querySelector<HTMLButtonElement>(".runner-next")
              ?.click();
          }
        }}
      />
    );
  return (
    <input
      {...common}
      ref={(el) => {
        inputRef.current = el;
      }}
      className="runner-text-input"
      type={
        q.type === "email" ? "email" : q.type === "number" ? "number" : "text"
      }
      placeholder={
        q.type === "email"
          ? "name@example.com"
          : q.type === "number"
            ? "Type a number..."
            : "Type your answer here..."
      }
      value={value}
      maxLength={10000}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={q.type === "email" ? "email" : "off"}
    />
  );
}
function validate(q: Question, value: string | number | undefined) {
  const empty = value === undefined || String(value).trim() === "";
  if (empty)
    return q.required ? "Please answer this question to continue." : "";
  if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)))
    return "That email doesn’t look quite right. Please check it.";
  if (q.type === "number" && !Number.isFinite(Number(value)))
    return "Please enter a valid number.";
  return "";
}
