"use client";

import Image from "next/image";
import {
  Fragment,
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import "./gscpe.css";

type View =
  | "home"
  | "assistant"
  | "documents"
  | "enrollment"
  | "policies"
  | "program"
  | "admin";

type Doc = {
  id: number;
  title: string;
  category: string;
  description: string;
  summary: string;
};

type Message = {
  id: number;
  text: string;
  user?: boolean;
};

const VIEWS: { id: View; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "assistant", label: "Assistant" },
  { id: "documents", label: "Documents" },
  { id: "enrollment", label: "Enrollment" },
  { id: "policies", label: "Policies" },
  { id: "program", label: "Program" },
  { id: "admin", label: "Management" },
];

const FEATURES: { title: string; description: string; view: View }[] = [
  {
    title: "University Assistant",
    description: "Answers basic questions about PUP Graduate School and GSCPE.",
    view: "assistant",
  },
  {
    title: "Document Repository",
    description: "Centralized storage of official university documents.",
    view: "documents",
  },
  {
    title: "Smart Document Search",
    description: "Quickly finds relevant policies, guidelines and procedures.",
    view: "documents",
  },
  {
    title: "Enrollment Guide",
    description: "Enrollment steps, requirements and related information.",
    view: "enrollment",
  },
  {
    title: "Policies & Guidelines",
    description: "University and Graduate School rules in one place.",
    view: "policies",
  },
  {
    title: "Program Information",
    description: "Basic information about the Computer Engineering graduate program.",
    view: "program",
  },
  {
    title: "Document Management",
    description: "Upload, update and organize documents (authorized staff).",
    view: "admin",
  },
  {
    title: "AI Document Summaries",
    description: "Simple summaries of lengthy university documents.",
    view: "documents",
  },
];

const INITIAL_DOCS: Doc[] = [
  {
    id: 1,
    title: "Graduate Enrollment Procedures",
    category: "Procedure",
    description: "Step-by-step process for new and continuing students.",
    summary:
      "Covers online pre-enrollment, advising, subject loading and payment. Students must settle requirements before the posted deadline.",
  },
  {
    id: 2,
    title: "Thesis Writing Guidelines",
    category: "Guideline",
    description: "Formatting, structure and citation standards.",
    summary:
      "Defines chapter structure, margins, citation style and the submission checklist for thesis manuscripts.",
  },
  {
    id: 3,
    title: "Academic Retention Policy",
    category: "Policy",
    description: "Grade requirements to remain in the program.",
    summary:
      "States the minimum grade standards, probation conditions and steps for appeal.",
  },
  {
    id: 4,
    title: "Leave of Absence Request Form",
    category: "Form",
    description: "Form and requirements for filing a leave.",
    summary:
      "Explains who may file, required signatures and the maximum leave period.",
  },
  {
    id: 5,
    title: "Admission Requirements Handbook",
    category: "Guideline",
    description: "Documents needed to apply to the graduate program.",
    summary:
      "Lists credentials, entrance requirements and the interview and evaluation flow.",
  },
  {
    id: 6,
    title: "Graduation Clearance Procedure",
    category: "Procedure",
    description: "Offices to visit before graduation.",
    summary:
      "Outlines clearance from library, accounting and registrar, plus the final manuscript submission.",
  },
  {
    id: 7,
    title: "Student Conduct Policy",
    category: "Policy",
    description: "Expected behavior and academic integrity rules.",
    summary:
      "Describes academic honesty standards, violations and disciplinary process.",
  },
  {
    id: 8,
    title: "Program of Study: Computer Engineering",
    category: "Program",
    description: "Course sequence and unit requirements.",
    summary:
      "Shows the recommended course sequence, electives and total unit requirement.",
  },
];

const STEPS: [string, string][] = [
  [
    "Prepare your requirements",
    "Gather your credentials, ID and any pending documents.",
  ],
  [
    "Consult your adviser",
    "Confirm your subjects and study plan for the term.",
  ],
  [
    "Complete online pre-enrollment",
    "Submit your subject load through the enrollment portal.",
  ],
  [
    "Pay assessed fees",
    "Settle the assessment and keep the official receipt.",
  ],
  [
    "Get validation",
    "Submit proof of payment and receive your validated form.",
  ],
];

const POLICIES: [string, string][] = [
  [
    "Academic Integrity",
    "All submitted work must be original. Cite sources and follow the thesis guidelines on plagiarism.",
  ],
  [
    "Grading and Retention",
    "Students must maintain the minimum grade standard to remain in the program.",
  ],
  [
    "Thesis Submission",
    "Manuscripts follow the official format and are submitted with the required clearances.",
  ],
  [
    "Leave of Absence",
    "File the request form before the term begins and wait for written approval.",
  ],
];

const PROGRAM: [string, string][] = [
  ["Level", "Graduate (Master’s) program"],
  ["Field", "Computer Engineering"],
  ["Schedule", "Weekend and evening classes (sample)"],
  ["Culminating requirement", "Thesis or capstone research"],
  ["Focus areas", "Embedded systems, networks, AI and data"],
  ["Contact", "GSCPE office (add official email)"],
];

const KNOWLEDGE_BASE: [RegExp, string][] = [
  [
    /enrol|enroll|register/,
    "Enrollment starts with preparing requirements, consulting your adviser, then pre-enrolling online and paying fees. See the Enrollment tab for the full checklist.",
  ],
  [
    /thesis|format|manuscript/,
    "Thesis rules are in the Thesis Writing Guidelines: chapter structure, citation style and the submission checklist. Find it under Documents.",
  ],
  [
    /leave|loa/,
    "To request a leave of absence, file the Leave of Absence Request Form before the term starts and wait for written approval.",
  ],
  [
    /graduat|clearance/,
    "Graduation requires clearance from the library, accounting and registrar, plus final manuscript submission.",
  ],
  [
    /program|course|subject/,
    "The Program tab lists the level, field and focus areas of the Computer Engineering graduate program.",
  ],
  [
    /admission|apply|requirement/,
    "The Admission Requirements Handbook lists the credentials and evaluation steps for applicants.",
  ],
  [
    /hello|hi\b|hey/,
    "Hello. I can help with enrollment, policies, thesis guidelines and program information.",
  ],
];

const SUGGESTIONS = [
  "How do I enroll?",
  "Thesis format",
  "Leave of absence",
  "Graduation clearance",
];

const DOC_CATEGORIES = ["Policy", "Guideline", "Procedure", "Form", "Program"];

const MARQUEE_WORDS = [
  "Policies",
  "Guidelines",
  "Procedures",
  "Forms",
  "Enrollment",
  "Thesis",
  "Programs",
  "Summaries",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 0,
    text: "Good day. How may I help you with Graduate School or GSCPE information?",
  },
];

const NEXT_DOC_ID = INITIAL_DOCS.reduce((max, doc) => Math.max(max, doc.id), 0) + 1;

function parseView(hash: string): View {
  const id = hash.replace(/^#/, "");
  return VIEWS.some((view) => view.id === id) ? (id as View) : "home";
}

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getHashSnapshot() {
  return parseView(window.location.hash);
}

function getServerSnapshot(): View {
  return "home";
}

function answerFor(question: string) {
  const normalized = question.toLowerCase();
  const entry = KNOWLEDGE_BASE.find(([pattern]) => pattern.test(normalized));

  if (entry) {
    return entry[1];
  }

  const words = normalized.split(/\s+/).filter((word) => word.length > 4);
  const hit = INITIAL_DOCS.find((doc) =>
    words.some((word) => doc.title.toLowerCase().includes(word)),
  );

  return hit
    ? `Related document: ${hit.title}. ${hit.summary}`
    : "I could not find that in the sample knowledge base. Try asking about enrollment, thesis format, leave of absence or graduation.";
}

export default function Home() {
  const view = useSyncExternalStore(
    subscribeToHash,
    getHashSnapshot,
    getServerSnapshot,
  );

  const [staff, setStaff] = useState(false);
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
  const [homeQuery, setHomeQuery] = useState("");
  const [docQuery, setDocQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [summaries, setSummaries] = useState<Record<number, "loading" | "done">>(
    {},
  );
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [question, setQuestion] = useState("");
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState("");
  const [newCategory, setNewCategory] = useState(DOC_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const nextMessageId = useRef(1);
  const nextDocId = useRef(NEXT_DOC_ID);
  const timers = useRef<number[]>([]);
  const toastTimer = useRef<number | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, view]);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => {
      pendingTimers.forEach((timer) => window.clearTimeout(timer));
      if (toastTimer.current !== null) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  function go(next: View) {
    if (window.location.hash === `#${next}`) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = next;
  }

  function showToast(text: string) {
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current);
    }
    setToast(text);
    setToastVisible(true);
    toastTimer.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  }

  function toggleStaff() {
    if (staff) {
      setStaff(false);
      return;
    }
    setStaff(true);
    go("admin");
  }

  function searchFromHome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDocQuery(homeQuery);
    go("documents");
  }

  const categories = ["All", ...Array.from(new Set(docs.map((doc) => doc.category)))];
  const tokens = docQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !["how", "the", "and", "for"].includes(word));

  const filteredDocs = docs.filter((doc) => {
    if (category !== "All" && doc.category !== category) {
      return false;
    }
    if (tokens.length === 0) {
      return true;
    }
    const haystack = (
      doc.title +
      doc.description +
      doc.summary +
      doc.category
    ).toLowerCase();
    return tokens.some((word) => haystack.includes(word.replace(/s$/, "")));
  });

  function toggleSummary(id: number) {
    if (summaries[id]) {
      setSummaries((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });
      return;
    }

    setSummaries((previous) => ({ ...previous, [id]: "loading" }));
    const timer = window.setTimeout(() => {
      setSummaries((previous) =>
        previous[id] ? { ...previous, [id]: "done" } : previous,
      );
    }, 700);
    timers.current.push(timer);
  }

  function ask(rawQuestion: string) {
    const trimmed = rawQuestion.trim();
    if (!trimmed) {
      return;
    }

    const userMessageId = nextMessageId.current++;
    const pendingMessageId = nextMessageId.current++;

    setMessages((previous) => [
      ...previous,
      { id: userMessageId, text: trimmed, user: true },
      { id: pendingMessageId, text: "Searching…" },
    ]);

    const timer = window.setTimeout(() => {
      const answer = answerFor(trimmed);
      setMessages((previous) =>
        previous.map((message) =>
          message.id === pendingMessageId ? { ...message, text: answer } : message,
        ),
      );
    }, 600);
    timers.current.push(timer);
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(question);
    setQuestion("");
  }

  function toggleStep(index: number) {
    setCompletedSteps((previous) => {
      const next = new Set(previous);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function addDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      return;
    }

    const id = nextDocId.current++;
    setDocs((previous) => [
      {
        id,
        title: title.trim(),
        category: newCategory,
        description: description.trim(),
        summary: `Summary pending: ${description.trim()}`,
      },
      ...previous,
    ]);
    setTitle("");
    setNewCategory(DOC_CATEGORIES[0]);
    setDescription("");
    showToast("Document uploaded");
  }

  function removeDocument(id: number) {
    setDocs((previous) => previous.filter((doc) => doc.id !== id));
    showToast("Document removed");
  }

  return (
    <div className="gscpe">
      <header className="hd">
        <div className="wrap hd-in">
          <button type="button" className="brand" onClick={() => go("home")}>
            <Image
              src="/gscpe-logo.png"
              alt="GSCPE seal"
              width={360}
              height={360}
              priority
            />
            <span>
              GSCPE
              <small>PUP Graduate School</small>
            </span>
          </button>

          <nav aria-label="Main">
            {VIEWS.filter((item) => item.id !== "admin").map((item) => (
              <button
                key={item.id}
                type="button"
                className={view === item.id ? "on" : undefined}
                onClick={() => go(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            className={staff ? "staff on" : "staff"}
            onClick={toggleStaff}
          >
            {staff ? "Staff access: on" : "Staff access"}
          </button>
        </div>
      </header>

      <main>
        <section className={view === "home" ? "view on" : "view"} id="home">
          <div className="hero wrap">
            <div className="hero-t">
              <span className="eb">PUP Graduate School · Computer Engineering</span>
              <h1>
                Graduate knowledge, <em>beautifully organized.</em>
              </h1>
              <p>
                Every policy, guideline, procedure and form in one trusted place,
                with an assistant that answers in seconds.
              </p>
              <form className="big" onSubmit={searchFromHome}>
                <input
                  value={homeQuery}
                  onChange={(event) => setHomeQuery(event.target.value)}
                  placeholder="Search thesis guidelines, forms, enrollment…"
                  aria-label="Search"
                />
                <button type="submit" aria-label="Search">
                  Search →
                </button>
              </form>
            </div>
            <div className="hero-s">
              <span className="ring" />
              <Image
                src="/gscpe-logo.png"
                alt=""
                aria-hidden="true"
                width={360}
                height={360}
                loading="eager"
              />
            </div>
          </div>

          <div className="mq" aria-hidden="true">
            <div className="mq-in">
              {Array.from({ length: 2 }).map((_, copy) => (
                <Fragment key={copy}>
                  {MARQUEE_WORDS.map((word) => (
                    <Fragment key={`${copy}-${word}`}>
                      <span>{word}</span>
                      <span>✦</span>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="wrap">
            <div className="stats">
              {[
                [docs.length, "Documents indexed"],
                [new Set(docs.map((doc) => doc.category)).size, "Categories"],
                [8, "Tools in one place"],
              ].map(([value, label]) => (
                <div className="stat" key={label}>
                  <b>{value}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="sh">
              <span className="eb">The toolkit</span>
              <h2>
                Eight ways to <em>find your answer</em>
              </h2>
            </div>

            <div className="idxs">
              {FEATURES.map((feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  className="idx"
                  onClick={() => go(feature.view)}
                >
                  <span className="n">{String(index + 1).padStart(2, "0")}</span>
                  <span className="t">{feature.title}</span>
                  <span className="d">{feature.description}</span>
                  <span className="ar">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          className={view === "assistant" ? "view wrap on" : "view wrap"}
          id="assistant"
        >
          <div className="ph">
            <span className="eb">01 — Assistant</span>
            <h1>
              University <em>Assistant</em>
            </h1>
            <p>
              Ask about PUP Graduate School and GSCPE. Answers in this prototype
              are samples; confirm key details with the Registrar.
            </p>
          </div>
          <div className="split">
            <div className="sugs">
              <span className="eb">Try asking</span>
              <div>
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            <div className="chat">
              <div className="msgs" ref={messagesRef} aria-live="polite">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.user ? "m u" : "m"}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
              <form className="compose" onSubmit={submitQuestion}>
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Type your question…"
                  aria-label="Question"
                />
                <button type="submit" aria-label="Send">
                  Send →
                </button>
              </form>
            </div>
          </div>
        </section>

        <section
          className={view === "documents" ? "view wrap on" : "view wrap"}
          id="documents"
        >
          <div className="ph">
            <span className="eb">02 — Documents</span>
            <h1>
              Document <em>Repository</em>
            </h1>
            <p>
              Official university and Graduate School documents, searchable and
              summarized.
            </p>
          </div>
          <input
            className="line"
            value={docQuery}
            onChange={(event) => setDocQuery(event.target.value)}
            placeholder="Search by title or keyword"
            aria-label="Search documents"
          />
          <div className="tabs">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? "on" : undefined}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="count">
            {filteredDocs.length} document{filteredDocs.length === 1 ? "" : "s"}
          </p>
          <div>
            {filteredDocs.length === 0 ? (
              <p className="count">
                No matching documents. Try the University Assistant.
              </p>
            ) : (
              filteredDocs.map((doc, index) => {
                const summaryState = summaries[doc.id];
                return (
                  <article className="row" key={doc.id}>
                    <span className="n">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3>{doc.title}</h3>
                      <p>{doc.description}</p>
                      {summaryState ? (
                        <div className="sum on">
                          {summaryState === "loading" ? (
                            "Generating summary…"
                          ) : (
                            <>
                              <b>Summary.</b> {doc.summary}
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                    <span className="cat">{doc.category}</span>
                    <div className="ra">
                      <button
                        type="button"
                        className="lnk"
                        onClick={() => toggleSummary(doc.id)}
                      >
                        Summarize
                      </button>
                      <button
                        type="button"
                        className="lnk"
                        onClick={() =>
                          showToast("Prototype: this would open the official PDF")
                        }
                      >
                        View
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section
          className={view === "enrollment" ? "view wrap on" : "view wrap"}
          id="enrollment"
        >
          <div className="ph">
            <span className="eb">03 — Enrollment</span>
            <h1>
              Enrollment <em>Guide</em>
            </h1>
            <p>
              Tap each step as you complete it. Sample steps; verify with the
              current Registrar announcement.
            </p>
          </div>
          <p className="count">
            {completedSteps.size} of {STEPS.length} steps completed
          </p>
          <div className="tl">
            {STEPS.map(([stepTitle, stepDescription], index) => (
              <button
                key={stepTitle}
                type="button"
                className={
                  completedSteps.has(index) ? "st done" : "st"
                }
                onClick={() => toggleStep(index)}
              >
                <span className="c">
                  {completedSteps.has(index) ? "✓" : index + 1}
                </span>
                <span>
                  <h3>{stepTitle}</h3>
                  <p>{stepDescription}</p>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section
          className={view === "policies" ? "view wrap on" : "view wrap"}
          id="policies"
        >
          <div className="ph">
            <span className="eb">04 — Policies</span>
            <h1>
              Policies &amp; <em>Guidelines</em>
            </h1>
            <p>University and Graduate School rules, organized by topic.</p>
          </div>
          <div id="acc">
            {POLICIES.map(([policyTitle, policyDescription]) => (
              <details key={policyTitle}>
                <summary>{policyTitle}</summary>
                <p>{policyDescription}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          className={view === "program" ? "view wrap on" : "view wrap"}
          id="program"
        >
          <div className="ph">
            <span className="eb">05 — Program</span>
            <h1>
              Program <em>Information</em>
            </h1>
            <p>
              The essentials of the Computer Engineering graduate program. Sample
              content.
            </p>
          </div>
          <dl className="kv">
            {PROGRAM.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          className={view === "admin" ? "view wrap on" : "view wrap"}
          id="admin"
        >
          <div className="ph">
            <span className="eb">06 — Management</span>
            <h1>
              Document <em>Management</em>
            </h1>
            <p>
              Authorized personnel can upload, update and organize documents.
            </p>
          </div>

          {!staff ? (
            <div className="gate">
              <h3>Authorized personnel only</h3>
              <p>
                Select “Staff access” at the top of the page to manage documents.
              </p>
            </div>
          ) : (
            <>
              <form className="form" onSubmit={addDocument}>
                <div>
                  <label htmlFor="doc-title">Document title</label>
                  <input
                    id="doc-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="doc-category">Category</label>
                  <select
                    id="doc-category"
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                  >
                    {DOC_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="doc-description">Short description</label>
                  <textarea
                    id="doc-description"
                    rows={2}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                  />
                </div>
                <button type="submit">Upload document</button>
              </form>

              <p className="count">Current documents ({docs.length})</p>
              <div style={{ marginBottom: 96 }}>
                {docs.map((doc) => (
                  <div className="arow" key={doc.id}>
                    <h3>{doc.title}</h3>
                    <span className="cat">{doc.category}</span>
                    <button
                      type="button"
                      className="lnk"
                      onClick={() => removeDocument(doc.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="ft">
        <div className="wrap">
          <div className="ft-big">GSCPE</div>
          <div className="ft-l">
            <span>Polytechnic University of the Philippines · Graduate School</span>
            <span>Knowledge Management System · Prototype</span>
          </div>
        </div>
      </footer>

      <div className={toastVisible ? "toast on" : "toast"} role="status">
        {toast}
      </div>
    </div>
  );
}
