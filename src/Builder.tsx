import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronRight,
  Copy,
  Eye,
  GripVertical,
  Link,
  ListChecks,
  Loader2,
  Mail,
  MessageSquare,
  Palette,
  Plus,
  Save,
  Settings2,
  Share2,
  Star,
  Text,
  Trash2,
  Type,
  Hash,
  ToggleLeft,
  ExternalLink,
} from "lucide-react";
import type { Form, QuestionType } from "./types";
import { sharedFormUrl, STATIC_DEMO } from "./routing";
import { api, newQuestion, request } from "./api";
import { Empty, Logo, Modal, themes } from "./ui";
import FormRunner, { QuestionInput } from "./FormRunner";
export const questionTypes = [
  {
    id: "short-text",
    label: "Short text",
    icon: Type,
    detail: "A name, a thought, a short answer.",
  },
  {
    id: "long-text",
    label: "Long text",
    icon: Text,
    detail: "Give people a little room to share.",
  },
  {
    id: "email",
    label: "Email address",
    icon: Mail,
    detail: "Keep the conversation going.",
  },
  {
    id: "multiple-choice",
    label: "Multiple choice",
    icon: ListChecks,
    detail: "A few good options to choose from.",
  },
  {
    id: "rating",
    label: "Rating",
    icon: Star,
    detail: "A simple scale from one to five.",
  },
  {
    id: "number",
    label: "Number",
    icon: Hash,
    detail: "For answers that add up.",
  },
  {
    id: "yes-no",
    label: "Yes / No",
    icon: ToggleLeft,
    detail: "Sometimes simple is best.",
  },
];
export default function Builder({
  id,
  onBack,
  onResponses,
  notify,
}: {
  id: string;
  onBack: () => void;
  onResponses: () => void;
  notify: (message: string) => void;
}) {
  const [form, setForm] = useState<Form | null>(null);
  const revision = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState("content");
  const [dialog, setDialog] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
  useEffect(() => {
    let active = true;
    request<Form>(`/forms/${id}`)
      .then((f) => {
        if (active) {
          setForm(f);
          setError("");
        }
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);
  const change = (patch: Partial<Form>) => {
    revision.current++;
    setForm((f) => (f ? { ...f, ...patch } : f));
    setDirty(true);
  };
  const go = (fn: () => void) => {
    if (dirty) {
      setPendingNav(() => fn);
      setDialog("unsaved");
    } else fn();
  };
  const save = async (publish = false) => {
    if (!form || saving) return false;
    setSaving(true);
    const savedRevision = revision.current;
    try {
      const saved = await api.update(id, {
        title: form.title,
        description: form.description,
        questions: form.questions,
        theme: form.theme,
        status: publish ? "published" : form.status,
      });
      setForm((current) =>
        revision.current === savedRevision
          ? saved
          : current
            ? { ...current, status: saved.status, updatedAt: saved.updatedAt }
            : saved,
      );
      setDirty(revision.current !== savedRevision);
      notify(
        publish
          ? "Your form is live. Let the conversations begin."
          : "All changes saved.",
      );
      if (publish) setTab("share");
      return true;
    } catch (e) {
      notify((e as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="full-loading">
        <Loader2 className="spin" /> Opening your form…
      </div>
    );
  if (!form)
    return (
      <div className="full-loading">
        <Empty
          title="This form couldn’t be opened."
          action={
            <button className="primary" onClick={onBack}>
              Back to workspace
            </button>
          }
        >
          {error || "This form might have been deleted."}
        </Empty>
      </div>
    );
  const question = form.questions[selected];
  const updateQuestion = (patch: Partial<NonNullable<typeof question>>) =>
    change({
      questions: form.questions.map((q, i) =>
        i === selected ? { ...q, ...patch } : q,
      ),
    });
  const addQuestion = (type: QuestionType) => {
    change({ questions: [...form.questions, newQuestion(type)] });
    setSelected(form.questions.length);
    setDialog(null);
  };
  const reorder = (direction: number) => {
    const target = selected + direction;
    if (target < 0 || target >= form.questions.length) return;
    const next = [...form.questions];
    [next[target], next[selected]] = [next[selected], next[target]];
    change({ questions: next });
    setSelected(target);
  };
  return (
    <div className="builder-shell">
      <header className="builder-header">
        <div>
          <button
            className="icon-button"
            aria-label="Back to workspace"
            onClick={() => go(onBack)}
          >
            <ArrowLeft size={20} />
          </button>
          <Logo compact />
          <ChevronRight size={15} />
          <input
            aria-label="Form title"
            className="builder-title-input"
            value={form.title}
            maxLength={200}
            onChange={(e) => change({ title: e.target.value })}
          />
          <span className={`status-badge ${form.status}`}>
            <span />
            {form.status === "published" ? "Published" : "Draft"}
          </span>
        </div>
        <div className="builder-header-actions">
          <span className="save-state">
            {dirty ? (
              "Unsaved changes"
            ) : (
              <>
                <Check size={14} /> All changes saved
              </>
            )}
          </span>
          <button className="secondary" onClick={() => setDialog("preview")}>
            <Eye size={16} />
            <span>Preview</span>
          </button>
          {form.status === "draft" && (
            <button
              className="secondary"
              disabled={saving || !dirty}
              onClick={() => void save()}
            >
              {saving ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <Save size={16} />
              )}
              <span>Save</span>
            </button>
          )}
          <button
            className="primary"
            disabled={saving}
            onClick={() =>
              form.status === "published" && !dirty
                ? setTab("share")
                : void save(true)
            }
          >
            <Share2 size={16} />
            {form.status === "published"
              ? dirty
                ? "Publish changes"
                : "Share"
              : "Publish"}
          </button>
        </div>
      </header>
      <nav className="builder-tabs" aria-label="Form editor">
        <div>
          {[
            { id: "content", label: "Content", icon: ListChecks },
            { id: "design", label: "Design", icon: Palette },
            { id: "share", label: "Share", icon: Link },
          ].map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
          <button onClick={() => go(onResponses)}>
            <MessageSquare size={16} /> Responses{" "}
            <span>{form.responseCount}</span>
          </button>
        </div>
        <span>Make it feel like a conversation.</span>
      </nav>
      {tab === "share" ? (
        <main className="share-page">
          <div className="share-icon">
            <Share2 size={28} />
          </div>
          <span className="eyebrow">GOOD QUESTIONS DESERVE AN AUDIENCE</span>
          <h1>
            {form.status === "published"
              ? "Ready for the world."
              : "Your next conversation awaits."}
          </h1>
          <p>
            {form.status === "published"
              ? "Send your link. Start a conversation. See what comes back."
              : "Publish your form to start collecting answers."}
          </p>
          {form.status === "published" ? (
            <>
              {STATIC_DEMO && (
                <p
                  style={{
                    fontSize: 11,
                    lineHeight: 1.8,
                    maxWidth: 540,
                    margin: "0 auto 20px",
                    color: "#8b6e40",
                  }}
                >
                  This is a browser-local demo. Links include a snapshot of your
                  form and cannot be revoked. Responses stay in the respondent’s
                  browser; self-host Openform to collect answers centrally.
                </p>
              )}
              <div className="share-link">
                <input
                  aria-label="Public form link"
                  readOnly
                  value={form ? sharedFormUrl(form) : ""}
                  onFocus={(e) => e.target.select()}
                />
                <button
                  className="primary"
                  onClick={() =>
                    void navigator.clipboard
                      .writeText(form ? sharedFormUrl(form) : "")
                      .then(() => notify("Form link copied."))
                      .catch(() =>
                        notify("Select the link and copy it to share."),
                      )
                  }
                >
                  <Copy size={16} />
                  Copy link
                </button>
              </div>
              <div className="share-actions">
                <a
                  href={sharedFormUrl(form)}
                  className="text-button"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open live form <ExternalLink size={15} />
                </a>
                <button className="text-button" onClick={() => go(onResponses)}>
                  View responses <ArrowRight size={15} />
                </button>
              </div>
              <div className="embed-box">
                <h3>Make yourself at home on any website</h3>
                <p>Embed your form with this snippet.</p>
                <textarea
                  readOnly
                  aria-label="Embed code"
                  value={`<iframe src="${sharedFormUrl(form)}" title="${form.title.replace(/[&<>"']/g, "")}" width="100%" height="640" style="border:0;border-radius:16px"></iframe>`}
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <button
                className="text-button unpublish-button"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const updated = await api.update(id, { status: "draft" });
                    setForm({ ...form, status: updated.status });
                    notify("Form unpublished. Your responses are safe.");
                  } catch (e) {
                    notify((e as Error).message);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Unpublish form
              </button>
            </>
          ) : (
            <button
              className="primary"
              disabled={saving}
              onClick={() => void save(true)}
            >
              <Share2 size={16} /> Publish your form
            </button>
          )}
        </main>
      ) : (
        <div
          className={`builder-body ${tab === "design" ? "design-mode" : ""}`}
        >
          <aside className="question-sidebar">
            <div className="question-sidebar-heading">
              <span>{tab === "design" ? "FORM STYLE" : "YOUR QUESTIONS"}</span>
              <span>{form.questions.length}</span>
            </div>
            {tab === "design" ? (
              <div className="design-intro">
                <Palette size={25} />
                <h3>Form theme</h3>
                <p>
                  A thoughtful color can set the tone for the whole
                  conversation.
                </p>
                <div className="design-theme-list">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => change({ theme: t.id })}
                      className={form.theme === t.id ? "active" : ""}
                    >
                      <span style={{ background: t.color }} />
                      {t.name}
                      {form.theme === t.id && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="question-list">
                  {form.questions.map((q, i) => {
                    const Icon =
                      questionTypes.find((t) => t.id === q.type)?.icon || Type;
                    return (
                      <button
                        key={q.id}
                        className={selected === i ? "active" : ""}
                        onClick={() => setSelected(i)}
                      >
                        <span className="question-type-number">
                          <Icon size={13} />
                          {i + 1}
                        </span>
                        <span>{q.title || "Your question goes here"}</span>
                        <GripVertical size={14} />
                      </button>
                    );
                  })}
                </div>
                <button
                  className="add-question"
                  onClick={() => setDialog("add")}
                >
                  <Plus size={16} /> Add a question
                </button>
                <div className="question-sidebar-tip">
                  <span>✳</span> A great conversation starts
                  <br />
                  with a thoughtful question.
                </div>
              </>
            )}
          </aside>
          <section className="editor-canvas">
            <div className="canvas-top">
              <span>
                <span className="live-dot" /> LIVE PREVIEW
              </span>
              <span>
                One question at a time <Eye size={13} />
              </span>
            </div>
            <div className={`question-preview theme-${form.theme}`}>
              <div className="preview-brand">
                <Logo compact />
              </div>
              {question ? (
                <div className="preview-question">
                  <span className="question-index">
                    {selected + 1}
                    <ArrowRight size={16} />
                  </span>
                  <h2>
                    {question.title || "Your question goes here"}
                    {question.required && <sup>*</sup>}
                  </h2>
                  {question.description && <p>{question.description}</p>}
                  <QuestionInput
                    question={question}
                    value=""
                    onChange={() => {}}
                    disabled
                  />
                  <button
                    className="runner-next"
                    onClick={() => setDialog("preview")}
                  >
                    OK <Check size={16} />
                  </button>
                  <span className="press-enter">
                    press <strong>Enter ↵</strong>
                  </span>
                </div>
              ) : (
                <div className="preview-question">
                  <h2>Let’s get curious.</h2>
                  <p>Add your first question to start the conversation.</p>
                  <button
                    className="runner-next"
                    onClick={() => setDialog("add")}
                  >
                    Add a question <Plus size={16} />
                  </button>
                </div>
              )}
              <div className="preview-bottom">
                <span>
                  Made with <strong>openform</strong>
                </span>
                <span>
                  {selected + 1} / {form.questions.length || 1}
                </span>
              </div>
            </div>
            <div className="canvas-bottom">
              <span>
                <Check size={13} /> Made for humans, on every screen.
              </span>
              <button
                className="text-button"
                onClick={() => setDialog("preview")}
              >
                Try it out <ArrowUpRightIcon />
              </button>
            </div>
          </section>
          <aside className="question-settings">
            <div className="question-sidebar-heading">
              <span>
                {tab === "design" ? "THE LITTLE DETAILS" : "QUESTION SETTINGS"}
              </span>
              <Settings2 size={15} />
            </div>
            {tab === "design" ? (
              <div className="settings-fields">
                <label className="field-label" htmlFor="welcome-title">
                  Form name
                </label>
                <input
                  id="welcome-title"
                  className="text-input"
                  value={form.title}
                  maxLength={200}
                  onChange={(e) => change({ title: e.target.value })}
                />
                <label className="field-label" htmlFor="form-description">
                  Welcome message
                </label>
                <textarea
                  id="form-description"
                  className="text-input"
                  rows={5}
                  value={form.description}
                  maxLength={5000}
                  placeholder="Say hello. Let people know what this form is about."
                  onChange={(e) => change({ description: e.target.value })}
                />
                <div className="settings-note">
                  Your form name and welcome message are the first things people
                  see.
                </div>
              </div>
            ) : question ? (
              <div className="settings-fields">
                <label className="field-label" htmlFor="question-type">
                  Question type
                </label>
                <select
                  id="question-type"
                  className="text-input"
                  value={question.type}
                  onChange={(e) =>
                    updateQuestion({
                      type: e.target.value as QuestionType,
                      options:
                        e.target.value === "multiple-choice" &&
                        question.options.length < 2
                          ? ["Option 1", "Option 2", "Option 3"]
                          : question.options,
                    })
                  }
                >
                  {questionTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <label className="field-label" htmlFor="question-title">
                  Question
                </label>
                <textarea
                  id="question-title"
                  className="text-input question-title-field"
                  rows={3}
                  value={question.title}
                  maxLength={1000}
                  placeholder="What would you like to ask?"
                  onChange={(e) => updateQuestion({ title: e.target.value })}
                />
                <label className="field-label" htmlFor="question-description">
                  Description <span>optional</span>
                </label>
                <textarea
                  id="question-description"
                  className="text-input"
                  rows={3}
                  value={question.description}
                  maxLength={5000}
                  placeholder="Optional question description"
                  onChange={(e) =>
                    updateQuestion({ description: e.target.value })
                  }
                />
                {question.type === "multiple-choice" && (
                  <>
                    <label className="field-label">Answer options</label>
                    <div className="options-editor">
                      {question.options.map((option, i) => (
                        <div key={i}>
                          <span>{String.fromCharCode(65 + i)}</span>
                          <input
                            aria-label={`Option ${i + 1}`}
                            value={option}
                            maxLength={500}
                            onChange={(e) =>
                              updateQuestion({
                                options: question.options.map((o, n) =>
                                  n === i ? e.target.value : o,
                                ),
                              })
                            }
                          />
                          <button
                            className="icon-button"
                            aria-label={`Remove option ${i + 1}`}
                            disabled={question.options.length <= 2}
                            onClick={() =>
                              updateQuestion({
                                options: question.options.filter(
                                  (_, n) => n !== i,
                                ),
                              })
                            }
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="text-button add-option"
                      disabled={question.options.length >= 26}
                      onClick={() =>
                        updateQuestion({
                          options: [
                            ...question.options,
                            `Option ${question.options.length + 1}`,
                          ],
                        })
                      }
                    >
                      <Plus size={14} /> Add option
                    </button>
                  </>
                )}
                <label className="toggle-label">
                  <span>
                    Required question<small>Make sure you get an answer.</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                      updateQuestion({ required: e.target.checked })
                    }
                  />
                  <span className="toggle-track" />
                </label>
                <div className="question-controls">
                  <button
                    className="secondary"
                    onClick={() => reorder(-1)}
                    disabled={selected === 0}
                    aria-label="Move question up"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    className="secondary"
                    onClick={() => reorder(1)}
                    disabled={selected === form.questions.length - 1}
                    aria-label="Move question down"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    className="secondary"
                    aria-label="Duplicate question"
                    onClick={() => {
                      const next = [...form.questions];
                      next.splice(selected + 1, 0, {
                        ...question,
                        id: crypto.randomUUID(),
                        options: [...question.options],
                      });
                      change({ questions: next });
                      setSelected(selected + 1);
                    }}
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    className="secondary danger"
                    aria-label="Delete question"
                    onClick={() => {
                      change({
                        questions: form.questions.filter(
                          (_, i) => i !== selected,
                        ),
                      });
                      setSelected(Math.max(0, selected - 1));
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="settings-note">
                Add a question to edit its settings.
              </p>
            )}
          </aside>
        </div>
      )}
      {dialog === "add" && (
        <Modal
          title="What would you like to ask?"
          onClose={() => setDialog(null)}
        >
          <p className="modal-description">
            The right question makes all the difference.
          </p>
          <div className="question-type-grid">
            {questionTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => addQuestion(t.id as QuestionType)}
              >
                <span>
                  <t.icon size={20} />
                </span>
                <div>
                  <strong>{t.label}</strong>
                  <small>{t.detail}</small>
                </div>
                <Plus size={16} />
              </button>
            ))}
          </div>
        </Modal>
      )}
      {dialog === "preview" && (
        <Modal title="Preview form" onClose={() => setDialog(null)} wide>
          <div className="preview-notice">
            <Eye size={14} /> Preview mode — answers won’t be saved.
          </div>
          <FormRunner previewForm={form} />
        </Modal>
      )}
      {dialog === "unsaved" && (
        <Modal
          title="Keep your latest changes?"
          onClose={() => setDialog(null)}
        >
          <p className="modal-description">
            You have unsaved changes. Save them before you go.
          </p>
          <div className="modal-actions">
            <button
              className="secondary"
              onClick={() => {
                setDialog(null);
                pendingNav?.();
              }}
            >
              Discard changes
            </button>
            <button
              className="primary"
              disabled={saving}
              onClick={async () => {
                if (await save()) {
                  setDialog(null);
                  pendingNav?.();
                }
              }}
            >
              Save and continue
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function ArrowUpRightIcon() {
  return <ExternalLink size={13} />;
}
