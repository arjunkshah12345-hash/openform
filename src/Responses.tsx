import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import type { Form, Submission } from "./types";
import { sharedFormUrl, STATIC_DEMO } from "./routing";
import { api, download, request } from "./api";
import { Empty, Logo } from "./ui";
export default function Responses({
  id,
  onBack,
  onEdit,
  notify,
}: {
  id: string;
  onBack: () => void;
  onEdit: () => void;
  notify: (message: string) => void;
}) {
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (!selected) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [selected]);
  useEffect(() => {
    let active = true;
    Promise.all([request<Form>(`/forms/${id}`), api.responses(id)])
      .then(([f, r]) => {
        if (active) {
          setForm(f);
          setResponses(r);
        }
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);
  const questionMap = new Map(form?.questions.map((q) => [q.id, q]));
  for (const response of responses)
    for (const question of response.questions || [])
      if (!questionMap.has(question.id)) questionMap.set(question.id, question);
  const allQuestions = [...questionMap.values()];
  const exportCsv = () => {
    if (!form) return;
    const escape = (v: unknown) => {
      let text = String(v ?? "");
      if (/^\s*[=+\-@]|^[\t\r\n]/.test(text)) text = `'${text}`;
      return `"${text.replaceAll('"', '""')}"`;
    };
    const rows = [
      ["Response ID", "Submitted at", ...allQuestions.map((q) => q.title)],
      ...responses.map((r) => [
        r.id,
        r.createdAt,
        ...allQuestions.map((q) => r.answers[q.id] ?? ""),
      ]),
    ];
    download(
      `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-responses.csv`,
      "\uFEFF" + rows.map((row) => row.map(escape).join(",")).join("\r\n"),
      "text/csv;charset=utf-8",
    );
    notify("Responses exported.");
  };
  if (loading)
    return (
      <div className="full-loading">
        <Loader2 className="spin" /> Gathering your conversations…
      </div>
    );
  return (
    <div className="responses-page">
      <header className="builder-header">
        <div>
          <button
            className="icon-button"
            onClick={onBack}
            aria-label="Back to workspace"
          >
            <ArrowLeft size={20} />
          </button>
          <Logo compact />
          <ChevronRight size={15} />
          <span className="response-page-form-title">
            {form?.title || "Responses"}
          </span>
        </div>
        <button className="secondary" onClick={onEdit}>
          <FileText size={16} /> Edit form
        </button>
      </header>
      <main className="responses-main">
        <div className="responses-intro">
          <div>
            <span className="eyebrow">THE OTHER SIDE OF THE CONVERSATION</span>
            <h1>
              Every answer matters<span className="heading-period">.</span>
            </h1>
            <p>Here’s what your people have to say.</p>
          </div>
          <button
            className="primary"
            disabled={!responses.length}
            onClick={exportCsv}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
        {STATIC_DEMO && (
          <p
            style={{
              fontSize: 11,
              color: "#8b6e40",
              lineHeight: 1.8,
              marginBottom: 20,
            }}
          >
            Demo responses are saved in this browser only. Responses submitted
            from other browsers are not sent here. Self-host Openform to collect
            responses centrally.
          </p>
        )}
        <div className="response-summary">
          <div>
            <MessageSquare size={22} />
            <span>
              <strong>{responses.length}</strong>{" "}
              {responses.length === 1 ? "response" : "responses"} collected
            </span>
          </div>
          <span className={`status-badge ${form?.status}`}>
            <span />
            {form?.status === "published" ? "Your form is live" : "Draft form"}
          </span>
        </div>
        {error ? (
          <Empty title="Couldn’t load responses.">{error}</Empty>
        ) : !responses.length ? (
          <Empty
            icon={<MessageSquare size={25} />}
            title="The best part is still to come."
            action={
              form?.status === "published" ? (
                <div className="empty-share">
                  <input
                    className="text-input"
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
                          notify("Select the link to copy it manually."),
                        )
                    }
                  >
                    <Copy size={16} /> Copy link
                  </button>
                </div>
              ) : (
                <button className="primary" onClick={onEdit}>
                  Finish your form <ArrowRight size={16} />
                </button>
              )
            }
          >
            Share your form and give people a chance to chime in.
            <br />
            Their responses will find a home right here.
          </Empty>
        ) : (
          <>
            <div className="response-table-heading">
              <h2>
                All responses{" "}
                <span className="count-pill">{responses.length}</span>
              </h2>
              <label className="search-field">
                <Search size={16} />
                <input
                  placeholder="Search answers..."
                  aria-label="Search answers"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            <div className="response-table-scroll">
              <table className="response-table">
                <thead>
                  <tr>
                    <th>Submitted</th>
                    {allQuestions.map((q) => (
                      <th key={q.id}>{q.title}</th>
                    ))}
                    <th>
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {responses
                    .filter((r) =>
                      Object.values(r.answers).some((a) =>
                        String(a).toLowerCase().includes(search.toLowerCase()),
                      ),
                    )
                    .map((r) => (
                      <tr
                        key={r.id}
                        tabIndex={0}
                        onClick={() => setSelected(r)}
                        onKeyDown={(e) => e.key === "Enter" && setSelected(r)}
                      >
                        <td>
                          {new Date(r.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </td>
                        {allQuestions.map((q) => (
                          <td key={q.id}>{r.answers[q.id] ?? "—"}</td>
                        ))}
                        <td>
                          <ChevronRight size={16} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
      {selected && (
        <div
          className="response-detail-backdrop"
          onClick={() => setSelected(null)}
        >
          <aside
            className="response-detail"
            role="dialog"
            aria-modal="true"
            aria-label="Response detail"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <h2>A closer look</h2>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="Close response detail"
              >
                <X size={19} />
              </button>
            </div>
            <p className="quiet">
              Submitted {new Date(selected.createdAt).toLocaleString()}
            </p>
            {(selected.questions || form?.questions || []).map((q, i) => (
              <div className="answer-detail" key={q.id}>
                <span>
                  {i + 1}. {q.title}
                </span>
                <p>{selected.answers[q.id] ?? "No answer"}</p>
              </div>
            ))}
            <div className="response-detail-id">Response {selected.id}</div>
          </aside>
        </div>
      )}
    </div>
  );
}
