import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  ExternalLink,
  FileText,
  Folder,
  Grid2X2,
  LayoutTemplate,
  List,
  Loader2,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Sprout,
  Trash2,
  X,
  Code2,
} from "lucide-react";
import type { Form } from "./types";
import { api, newQuestion } from "./api";
import { Cover, Empty, Logo, Modal } from "./ui";
import { fromTemplate, templateData } from "./templates";
import Builder from "./Builder";
import FormRunner from "./FormRunner";
import Responses from "./Responses";
import Landing from "./Landing";
import {
  currentRoute,
  navigateRoute,
  routeUrl,
  sharedFormUrl,
  STATIC_DEMO,
  REPO_URL,
} from "./routing";

type Page = "workspace" | "templates" | "responses" | "trash";
function AppContent() {
  const [path, setPath] = useState(currentRoute);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState<Page>("workspace");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("updated");
  const [dialog, setDialog] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [newName, setNewName] = useState("");
  const [workspaceName, setWorkspaceName] = useState(
    () => localStorage.getItem("openform-workspace") || "My workspace",
  );
  const [workspaceInput, setWorkspaceInput] = useState(workspaceName);
  const searchRef = useRef<HTMLInputElement>(null);
  const notify = useCallback((message: string) => setToast(message), []);
  const navigate = useCallback((to: string) => {
    navigateRoute(to);
    setPath(to);
  }, []);
  const refresh = useCallback(async () => {
    try {
      setForms(await api.forms());
      setLoadError("");
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (path !== "/" && !path.startsWith("/f/")) void refresh();
  }, [refresh, path]);
  useEffect(() => {
    const pop = () => setPath(currentRoute());
    window.addEventListener("popstate", pop);
    window.addEventListener("hashchange", pop);
    window.addEventListener("openform:navigate", pop);
    return () => {
      window.removeEventListener("popstate", pop);
      window.removeEventListener("hashchange", pop);
      window.removeEventListener("openform:navigate", pop);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setMenu(null);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menu]);
  const act = async (operation: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try {
      await operation();
      await refresh();
      notify(message);
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const create = async (index?: number) => {
    if (busy) return;
    setBusy(true);
    try {
      const form = await api.create(
        index === undefined
          ? {
              title: newName.trim() || "Untitled form",
              description: "",
              theme: "sage",
              questions: [newQuestion()],
            }
          : fromTemplate(index),
      );
      setDialog(null);
      setNewName("");
      navigate(`/forms/${form.id}/edit`);
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const active = forms.filter((f) => !f.trashed);
  const responseCount = active.reduce((sum, f) => sum + f.responseCount, 0);
  const visible = forms
    .filter(
      (f) =>
        f.trashed === (page === "trash") &&
        f.title.toLowerCase().includes(search.toLowerCase()) &&
        (filter === "all" || f.status === filter),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.title.localeCompare(b.title)
        : sort === "responses"
          ? b.responseCount - a.responseCount
          : Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  const changePage = (next: Page) => {
    setPage(next);
    setSearch("");
    setFilter("all");
    setMobileNav(false);
  };
  if (path === "/")
    return (
      <Landing
        onOpenWorkspace={() => navigate("/workspace")}
        repoUrl={REPO_URL}
        demoUrl={routeUrl("/workspace")}
      />
    );
  const formMatch = path.match(/^\/forms\/([^/]+)\/(edit|responses)$/);
  const publicMatch = path.match(/^\/f\/([^/]+)$/);
  if (publicMatch)
    return <FormRunner id={decodeURIComponent(publicMatch[1])} />;
  if (formMatch)
    return (
      <>
        {formMatch[2] === "edit" ? (
          <Builder
            id={formMatch[1]}
            onBack={() => navigate("/workspace")}
            onResponses={() => navigate(`/forms/${formMatch[1]}/responses`)}
            notify={notify}
          />
        ) : (
          <Responses
            id={formMatch[1]}
            onBack={() => navigate("/workspace")}
            onEdit={() => navigate(`/forms/${formMatch[1]}/edit`)}
            notify={notify}
          />
        )}
        <Toast message={toast} onClose={() => setToast("")} />
      </>
    );
  if (path !== "/workspace")
    return (
      <div className="full-loading">
        <Empty
          title="This page wandered off."
          action={
            <button className="primary" onClick={() => navigate("/workspace")}>
              Back to workspace
            </button>
          }
        >
          Your forms and ideas are waiting right here.
        </Empty>
      </div>
    );
  return (
    <div className="app-shell">
      {mobileNav && (
        <div className="sidebar-shade" onClick={() => setMobileNav(false)} />
      )}
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <a
          className="brand-link"
          href={routeUrl("/workspace")}
          onClick={(e) => {
            e.preventDefault();
            changePage("workspace");
          }}
        >
          <Logo />
        </a>
        <button
          className="workspace-switch"
          onClick={() => {
            setWorkspaceInput(workspaceName);
            setDialog("workspace");
          }}
        >
          <span className="workspace-avatar">M</span>
          <span>
            <strong>{workspaceName}</strong>
            <small>Personal workspace</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <button
          className="primary sidebar-create"
          onClick={() => setDialog("create")}
        >
          <Plus size={17} /> Create a form
        </button>
        <span className="nav-label">WORKSPACE</span>
        <nav className="main-nav" aria-label="Main navigation">
          <button
            className={page === "workspace" ? "active" : ""}
            onClick={() => changePage("workspace")}
          >
            <Folder size={18} /> My forms <span>{active.length}</span>
          </button>
          <button
            className={page === "templates" ? "active" : ""}
            onClick={() => changePage("templates")}
          >
            <LayoutTemplate size={18} /> Templates{" "}
            <span className="nav-new">NEW</span>
          </button>
          <button
            className={page === "responses" ? "active" : ""}
            onClick={() => changePage("responses")}
          >
            <MessageSquare size={18} /> All responses{" "}
            {responseCount > 0 && <span>{responseCount}</span>}
          </button>
          <button
            className={page === "trash" ? "active" : ""}
            onClick={() => changePage("trash")}
          >
            <Trash2 size={18} /> Trash
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="opensource-card">
            <span className="opensource-icon">
              <Code2 size={18} />
              <span>OPEN BY NATURE</span>
            </span>
            <strong>Your forms. Your rules.</strong>
            <p>
              Open source. No limits.
              <br />
              Just better conversations.
            </p>
            <button onClick={() => setDialog("opensource")}>
              Meet Openform <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="sidebar-help" onClick={() => setDialog("help")}>
            <CircleHelp size={18} /> Help & getting started{" "}
            <ArrowUpRight size={14} />
          </button>
          <button
            className="profile"
            onClick={() => {
              setWorkspaceInput(workspaceName);
              setDialog("workspace");
            }}
          >
            <span className="user-avatar">Y</span>
            <span>
              <strong>Your workspace</strong>
              <small>Make yourself at home</small>
            </span>
            <Settings2 size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb-home">
              <Folder size={15} /> Workspace
            </span>
            <ChevronRight size={14} />
            <span>
              {page === "workspace"
                ? "My forms"
                : page === "templates"
                  ? "Templates"
                  : page === "responses"
                    ? "All responses"
                    : "Trash"}
            </span>
          </div>
          <div>
            <span className="local-label">
              <span /> All yours. Always.
            </span>
            <button className="whats-new" onClick={() => setDialog("whatsnew")}>
              <span /> What’s new <ArrowUpRight size={13} />
            </button>
            <button
              className="user-avatar top-avatar"
              onClick={() => {
                setWorkspaceInput(workspaceName);
                setDialog("workspace");
              }}
              aria-label="Workspace settings"
            >
              Y
            </button>
          </div>
        </header>
        <main className="workspace-main">
          <div className="page-intro">
            <div>
              <div className="eyebrow">
                <span className="tiny-spark">✳</span>{" "}
                {page === "workspace"
                  ? "A SPACE FOR YOUR IDEAS"
                  : page === "templates"
                    ? "SKIP THE BLANK PAGE"
                    : page === "responses"
                      ? "LISTEN A LITTLE CLOSER"
                      : "ROOM FOR A FRESH START"}
              </div>
              <h1>
                {page === "workspace" ? (
                  <>
                    Good things start
                    <br className="intro-break" /> with a question
                    <span className="heading-period">.</span>
                  </>
                ) : page === "templates" ? (
                  <>
                    A little inspiration.
                    <br />A running start.
                  </>
                ) : page === "responses" ? (
                  "Every answer matters."
                ) : (
                  "Gone, for now."
                )}
              </h1>
              <p>
                {page === "workspace"
                  ? "A little curiosity can go a long way. What will you ask today?"
                  : page === "templates"
                    ? "Thoughtfully made templates. Ready for your own spin."
                    : page === "responses"
                      ? "The people, ideas, and insights behind your forms."
                      : "Restore a form whenever you need it, or let it go for good."}
              </p>
            </div>
            {page === "workspace" && (
              <div className="intro-note">
                <svg viewBox="0 0 90 40">
                  <path
                    d="M3 31C31 38 63 25 70 5m-14 5 15-7 4 15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>
                  Less friction.
                  <br />
                  More connection.
                </span>
              </div>
            )}
          </div>
          {page === "workspace" && (
            <div className="start-row">
              <section className="create-banner">
                <div>
                  <span className="banner-eyebrow">
                    FROM A QUESTION TO A CONNECTION
                  </span>
                  <h2>
                    Make room for
                    <br />
                    your next great idea.
                  </h2>
                  <button
                    className="banner-button"
                    onClick={() => setDialog("create")}
                  >
                    <Plus size={17} /> Create a form <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="banner-art" aria-hidden="true">
                  <div className="art-dots" />
                  <div className="art-paper art-paper-back" />
                  <div className="art-paper">
                    <span className="art-paper-logo">✳</span>
                    <span className="art-question">
                      What’s on
                      <br />
                      your mind?
                    </span>
                    <span className="art-input">Your next big thing...</span>
                    <span className="art-ok">
                      OK <Check size={11} />
                    </span>
                    <span className="art-progress">
                      <i />
                    </span>
                  </div>
                  <span className="art-spark">✳</span>
                  <span className="art-loop">↗</span>
                </div>
              </section>
              <section className="template-banner">
                <span className="template-badge">
                  <LayoutTemplate size={17} />
                </span>
                <span className="banner-eyebrow">A LITTLE HEAD START</span>
                <h2>
                  No blank-page
                  <br /> energy required.
                </h2>
                <p>
                  Pick a template.
                  <br />
                  Make it your own.
                </p>
                <button onClick={() => changePage("templates")}>
                  Explore templates <ArrowRight size={16} />
                </button>
                <span className="template-swirl" aria-hidden="true">
                  ✴
                </span>
              </section>
            </div>
          )}
          {page === "templates" ? (
            <div className="template-section">
              <div className="section-title">
                <h2>
                  Find your starting point{" "}
                  <span>{templateData.length} templates</span>
                </h2>
                <span className="quiet">Made to be made yours.</span>
              </div>
              <div className="form-grid">
                {templateData.map((t, i) => (
                  <button
                    className="template-card"
                    key={t.title}
                    onClick={() => void create(i)}
                    disabled={busy}
                  >
                    <Cover theme={t.theme} />
                    <div className="template-card-content">
                      <span className="template-category">{t.category}</span>
                      <h3>{t.title}</h3>
                      <p>{t.description}</p>
                      <span className="template-use">
                        Use template <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : page === "responses" ? (
            <>
              <div className="section-title">
                <h2>
                  Your conversations <span>{responseCount} responses</span>
                </h2>
              </div>
              {active.length ? (
                <div className="responses-form-list">
                  {active.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => navigate(`/forms/${f.id}/responses`)}
                    >
                      <span className={`response-form-icon theme-${f.theme}`}>
                        <MessageSquare size={20} />
                      </span>
                      <span>
                        <strong>{f.title}</strong>
                        <small>
                          {f.status === "published" ? "Published" : "Draft"} ·{" "}
                          {f.questions.length} questions
                        </small>
                      </span>
                      <span className="response-count">
                        {f.responseCount}{" "}
                        {f.responseCount === 1 ? "response" : "responses"}
                      </span>
                      <ArrowRight size={17} />
                    </button>
                  ))}
                </div>
              ) : (
                <Empty
                  title="The conversation starts with a form."
                  action={
                    <button
                      className="primary"
                      onClick={() => setDialog("create")}
                    >
                      <Plus size={16} /> Create a form
                    </button>
                  }
                >
                  Create and share your first form to start collecting
                  responses.
                </Empty>
              )}
            </>
          ) : (
            <section className="forms-section">
              <div className="forms-heading">
                <h2>
                  {page === "trash" ? "Deleted forms" : "Your forms"}{" "}
                  <span className="count-pill">
                    {page === "trash"
                      ? forms.filter((f) => f.trashed).length
                      : active.length}
                  </span>
                </h2>
                <div className="forms-heading-actions">
                  <button
                    className="text-button"
                    onClick={() => {
                      setSort(
                        sort === "updated"
                          ? "name"
                          : sort === "name"
                            ? "responses"
                            : "updated",
                      );
                    }}
                  >
                    <ArrowDown size={14} />
                    {sort === "updated"
                      ? "Last edited"
                      : sort === "name"
                        ? "Name A–Z"
                        : "Most responses"}
                    <ChevronDown size={13} />
                  </button>
                  <span className="view-toggle">
                    <button
                      className={view === "grid" ? "selected" : ""}
                      aria-label="Grid view"
                      onClick={() => setView("grid")}
                    >
                      <Grid2X2 size={16} />
                    </button>
                    <button
                      className={view === "list" ? "selected" : ""}
                      aria-label="List view"
                      onClick={() => setView("list")}
                    >
                      <List size={18} />
                    </button>
                  </span>
                </div>
              </div>
              <div className="forms-toolbar">
                <div className="filter-tabs" aria-label="Filter forms">
                  {["all", "published", "draft"].map((f) => (
                    <button
                      key={f}
                      className={filter === f ? "active" : ""}
                      onClick={() => setFilter(f)}
                    >
                      {f === "all"
                        ? "All forms"
                        : f === "published"
                          ? "Published"
                          : "Drafts"}
                      <span>
                        {
                          forms.filter(
                            (item) =>
                              item.trashed === (page === "trash") &&
                              (f === "all" || item.status === f),
                          ).length
                        }
                      </span>
                    </button>
                  ))}
                </div>
                <label className="search-field">
                  <Search size={16} />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search forms..."
                    aria-label="Search forms"
                  />
                  {search ? (
                    <button
                      aria-label="Clear search"
                      onClick={() => setSearch("")}
                    >
                      <X size={13} />
                    </button>
                  ) : (
                    <kbd>⌘ K</kbd>
                  )}
                </label>
              </div>
              {loading ? (
                <div className="loading">
                  <Loader2 className="spin" /> Getting your workspace ready…
                </div>
              ) : loadError ? (
                <Empty
                  title="Your workspace couldn’t load."
                  action={
                    <button
                      className="primary"
                      onClick={() => {
                        setLoading(true);
                        void refresh();
                      }}
                    >
                      Try again
                    </button>
                  }
                >
                  {loadError}
                </Empty>
              ) : !visible.length ? (
                <Empty
                  icon={page === "trash" ? <Trash2 /> : <Search />}
                  title={
                    search
                      ? "No forms found."
                      : page === "trash"
                        ? "A clean slate."
                        : "Your next conversation starts here."
                  }
                  action={
                    page !== "trash" && !search ? (
                      <button
                        className="primary"
                        onClick={() => setDialog("create")}
                      >
                        <Plus size={16} /> Create a form
                      </button>
                    ) : undefined
                  }
                >
                  {search
                    ? "Try a different name or clear your filters."
                    : page === "trash"
                      ? "Deleted forms will appear here for safekeeping."
                      : "Create a form or choose a template to get started."}
                </Empty>
              ) : (
                <div
                  className={`form-grid ${view === "list" ? "form-list" : ""}`}
                >
                  {visible.map((form) => (
                    <article className="form-card" key={form.id}>
                      <button
                        className="card-cover-button"
                        onClick={() =>
                          page === "trash"
                            ? void act(
                                () => api.update(form.id, { trashed: false }),
                                "Form restored.",
                              )
                            : navigate(`/forms/${form.id}/edit`)
                        }
                        aria-label={
                          page === "trash"
                            ? `Restore ${form.title}`
                            : `Edit ${form.title}`
                        }
                      >
                        <Cover theme={form.theme} />
                      </button>
                      <div className="card-content">
                        <div className="card-title-row">
                          <button
                            className="card-title"
                            onClick={() =>
                              page === "trash"
                                ? void act(
                                    () =>
                                      api.update(form.id, { trashed: false }),
                                    "Form restored.",
                                  )
                                : navigate(`/forms/${form.id}/edit`)
                            }
                          >
                            {form.title}
                          </button>
                          <div className="card-menu-wrap">
                            <button
                              className="icon-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenu(menu === form.id ? null : form.id);
                              }}
                              aria-label={`Actions for ${form.title}`}
                              aria-expanded={menu === form.id}
                            >
                              <MoreHorizontal size={18} />
                            </button>
                            {menu === form.id && (
                              <div
                                className="dropdown"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {page === "trash" ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setMenu(null);
                                        void act(
                                          () =>
                                            api.update(form.id, {
                                              trashed: false,
                                            }),
                                          "Form restored.",
                                        );
                                      }}
                                    >
                                      <ArrowRight size={14} /> Restore form
                                    </button>
                                    <button
                                      className="danger"
                                      onClick={() => {
                                        setMenu(null);
                                        setDialog(`delete:${form.id}`);
                                      }}
                                    >
                                      <Trash2 size={14} /> Delete permanently
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        navigate(`/forms/${form.id}/edit`)
                                      }
                                    >
                                      <FileText size={14} /> Edit form
                                    </button>
                                    <button
                                      onClick={() => {
                                        setMenu(null);
                                        void act(
                                          () => api.duplicate(form.id),
                                          "Form duplicated.",
                                        );
                                      }}
                                    >
                                      <Copy size={14} /> Duplicate
                                    </button>
                                    <button
                                      onClick={() =>
                                        navigate(`/forms/${form.id}/responses`)
                                      }
                                    >
                                      <MessageSquare size={14} /> View responses
                                    </button>
                                    {form.status === "published" && (
                                      <button
                                        onClick={() => {
                                          setMenu(null);
                                          void navigator.clipboard
                                            .writeText(sharedFormUrl(form))
                                            .then(() =>
                                              notify("Form link copied."),
                                            )
                                            .catch(() => {
                                              setDialog(`share:${form.id}`);
                                            });
                                        }}
                                      >
                                        <ExternalLink size={14} /> Copy form
                                        link
                                      </button>
                                    )}
                                    <div className="dropdown-divider" />
                                    <button
                                      className="danger"
                                      onClick={() => {
                                        setMenu(null);
                                        void act(
                                          () =>
                                            api.update(form.id, {
                                              trashed: true,
                                            }),
                                          "Form moved to trash.",
                                        );
                                      }}
                                    >
                                      <Trash2 size={14} /> Move to trash
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <p>
                          {form.questions.length} questions <span>·</span>{" "}
                          {formatEdited(form.updatedAt)}
                        </p>
                        <div className="card-footer">
                          <span className={`status-badge ${form.status}`}>
                            <span />
                            {form.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                          <button
                            onClick={() =>
                              navigate(`/forms/${form.id}/responses`)
                            }
                          >
                            <MessageSquare size={13} />
                            {form.responseCount}{" "}
                            {form.responseCount === 1
                              ? "response"
                              : "responses"}
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
          <footer className="workspace-footer">
            <span>
              <Sprout size={14} /> Made for meaningful connections.
            </span>
            <span>Beautiful forms. Open to everyone.</span>
          </footer>
        </main>
      </div>
      {dialog === "create" && (
        <Modal title="Start a new conversation" onClose={() => setDialog(null)}>
          <p className="modal-description">
            A great form starts with a name. You can change it anytime.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
          >
            <label className="field-label" htmlFor="form-name">
              Form name
            </label>
            <input
              id="form-name"
              className="text-input"
              autoFocus
              placeholder="e.g. Customer feedback"
              value={newName}
              maxLength={200}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setDialog(null);
                  changePage("templates");
                }}
              >
                <LayoutTemplate size={16} /> Use a template
              </button>
              <button type="submit" className="primary" disabled={busy}>
                {busy ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <Plus size={16} />
                )}{" "}
                Create form
              </button>
            </div>
          </form>
        </Modal>
      )}
      {dialog === "workspace" && (
        <Modal title="Make yourself at home" onClose={() => setDialog(null)}>
          <p className="modal-description">
            A personal space for all your questions and ideas.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = workspaceInput.trim() || "My workspace";
              setWorkspaceName(name);
              localStorage.setItem("openform-workspace", name);
              setDialog(null);
              notify("Workspace name updated.");
            }}
          >
            <label htmlFor="workspace-name" className="field-label">
              Workspace name
            </label>
            <input
              id="workspace-name"
              className="text-input"
              value={workspaceInput}
              maxLength={60}
              onChange={(e) => setWorkspaceInput(e.target.value)}
            />
            <div className="settings-detail">
              <Code2 size={19} />
              <span>
                <strong>Your own corner of the internet</strong>
                <small>Self-hosted · MIT licensed · Unlimited forms</small>
              </span>
            </div>
            <div className="modal-actions">
              <button className="primary" type="submit">
                Save changes <Check size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {(dialog === "opensource" || dialog === "whatsnew") && (
        <Modal
          title={
            dialog === "opensource"
              ? "Open by nature. Yours by design."
              : "Meet your new form builder."
          }
          onClose={() => setDialog(null)}
        >
          <div className="about-illustration">
            <Logo />
          </div>
          <p className="modal-description">
            Beautiful forms should be open to everyone. Openform gives you a
            thoughtful form builder with no limits on your ideas.
          </p>
          <div className="feature-list">
            <span>
              <Check /> A visual builder with 7 question types
            </span>
            <span>
              <Check /> One question at a time. More human by design.
            </span>
            <span>
              <Check /> Shareable forms and CSV response exports
            </span>
            <span>
              <Check /> Self-hosted storage. MIT-licensed source.
            </span>
          </div>
          <p className="small-print">
            Your source code and self-hosting guide are included in this
            project’s README. This instance is a personal workspace.
          </p>
          <button
            className="primary full-width"
            onClick={() => {
              setDialog(null);
              setDialog("create");
            }}
          >
            Make something yours <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {dialog === "help" && (
        <Modal
          title="From first question to first response"
          onClose={() => setDialog(null)}
        >
          <div className="help-steps">
            {[
              [
                "Make it yours",
                "Create a blank form or choose a ready-to-go template.",
              ],
              [
                "Ask good questions",
                "Add your questions, choose a style, and preview the conversation.",
              ],
              [
                "Send it out into the world",
                "Publish your form and copy its shareable link.",
              ],
              [
                "Listen to the answers",
                "Open Responses to read submissions or download a CSV.",
              ],
            ].map(([title, copy], i) => (
              <div key={title}>
                <span>{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            className="primary full-width"
            onClick={() => setDialog("create")}
          >
            Let’s make a form <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {dialog?.startsWith("delete:") && (
        <Modal
          title="Delete this form for good?"
          onClose={() => setDialog(null)}
        >
          <p className="modal-description">
            The form and all its responses will be permanently deleted. This
            can’t be undone.
          </p>
          <div className="modal-actions">
            <button className="secondary" onClick={() => setDialog(null)}>
              Keep it
            </button>
            <button
              className="danger-button"
              disabled={busy}
              onClick={() => {
                const id = dialog.split(":")[1];
                void act(async () => {
                  await api.remove(id);
                  setDialog(null);
                }, "Form permanently deleted.");
              }}
            >
              Delete permanently
            </button>
          </div>
        </Modal>
      )}
      {dialog?.startsWith("share:") && (
        <Modal title="Share your form" onClose={() => setDialog(null)}>
          <p className="modal-description">
            Copy this link to start collecting responses.
          </p>
          <input
            className="text-input"
            readOnly
            value={
              forms.find((f) => f.id === dialog.split(":")[1])
                ? sharedFormUrl(
                    forms.find((f) => f.id === dialog.split(":")[1])!,
                  )
                : ""
            }
            onFocus={(e) => e.target.select()}
          />
        </Modal>
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return message ? (
    <div className="toast" role="status">
      <Check size={17} />
      <span>{message}</span>
      <button aria-label="Dismiss notification" onClick={onClose}>
        <X size={15} />
      </button>
    </div>
  ) : null;
}
function formatEdited(date: string) {
  const days = Math.floor((Date.now() - Date.parse(date)) / 86400000);
  return days === 0
    ? "Edited today"
    : days === 1
      ? "Edited yesterday"
      : `Edited ${days} days ago`;
}

export default function App() {
  return (
    <>
      <AppContent />
      {STATIC_DEMO && (
        <aside
          aria-label="Demo information"
          style={{
            position: "fixed",
            bottom: 12,
            left: 12,
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            gap: 9,
            maxWidth: "calc(100vw - 24px)",
            padding: "9px 12px",
            border: "1px solid #d5dfcb",
            borderRadius: 7,
            background: "#fffef7f5",
            boxShadow: "0 3px 14px #233b2420",
            fontSize: 10,
            color: "#627454",
          }}
        >
          <span>Interactive demo · stored in this browser</span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "underline", whiteSpace: "nowrap" }}
          >
            Self-host ↗
          </a>
        </aside>
      )}
    </>
  );
}
