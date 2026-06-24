import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Menu,
  Sun,
  Moon,
  Copy,
  Check,
  AlertTriangle,
  MessageSquare,
  X,
  Paperclip,
  LayoutGrid,
  Share2,
  MoreHorizontal,
  ArrowUp,
} from "lucide-react";
import LandingPage from "./LandingPage";
import "./App.css";

// Simple brand logo: Green circle with white T
export function TLogo({ size = 24 }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: "#0b332c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: `${size * 0.5}px`,
        fontFamily: "var(--font-sans)",
        userSelect: "none",
        flexShrink: 0,
      }}
      className="t-brand-logo"
    >
      T
    </div>
  );
}

// User Avatar component for Sarah Chen
export function UserAvatar({ size = 28 }) {
  return (
    <div className="user-avatar-wrapper" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ borderRadius: "50%" }}
      >
        <circle cx="50" cy="50" r="50" fill="#dfdad2" />
        {/* Hair back */}
        <path d="M 30,55 C 30,25 70,25 70,55 C 70,60 70,70 70,70 L 30,70 Z" fill="#9ba29f" />
        {/* Head */}
        <circle cx="50" cy="45" r="20" fill="#f5ece1" />
        {/* Hair front/bangs */}
        <path d="M 32,40 C 35,28 65,28 68,40 C 68,40 55,30 50,38 C 45,30 32,40 32,40 Z" fill="#b8c0bd" />
        {/* Neck */}
        <path d="M 45,60 L 55,60 L 55,68 L 45,68 Z" fill="#ebdcd0" />
        {/* Shoulders/Clothes */}
        <path d="M 22,85 C 22,70 35,68 50,68 C 65,68 78,70 78,85 L 22,85 Z" fill="#0b332c" />
      </svg>
    </div>
  );
}

// Split AI message into conversational parts and draft/block parts
export function parseMessageParts(text) {
  if (!text) return [];

  // Check for Subject line draft pattern
  const subjectIndex = text.indexOf("Subject:");
  if (subjectIndex !== -1) {
    const intro = text.substring(0, subjectIndex).trim();
    const draft = text.substring(subjectIndex).trim();

    const parts = [];
    if (intro) {
      parts.push({ type: "conversational", text: intro });
    }
    if (draft) {
      parts.push({ type: "draft", text: draft });
    }
    return parts;
  }

  // Check for standard code block pattern
  if (text.includes("```")) {
    const regex = /(```[\s\S]*?```)/g;
    const tokens = text.split(regex);
    return tokens
      .map((token) => {
        if (token.startsWith("```")) {
          const match = token.match(/```(\w*)\n?([\s\S]*?)```/);
          return {
            type: "draft",
            text: match ? match[2].trim() : token.replace(/```/g, "").trim(),
            language: match ? match[1] : "",
          };
        }
        return { type: "conversational", text: token.trim() };
      })
      .filter((p) => p.text);
  }

  return [{ type: "conversational", text }];
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">
          <span className="lang-dot" />
          {(language || "code").toUpperCase()}
        </span>
        <button className="copy-code-btn" onClick={handleCopy}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInline(text) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bp, j) => {
      if (bp.startsWith("**") && bp.endsWith("**")) {
        return <strong key={`${i}-${j}`}>{bp.slice(2, -2)}</strong>;
      }
      return bp;
    });
  });
}

function FormattedMessage({ text }) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="message-content">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
          if (match) {
            return <CodeBlock key={index} code={match[2].trim()} language={match[1] || "code"} />;
          }
        }
        return (
          <div key={index}>
            {part.split("\n").map((line, lineIdx) => {
              const listMatch = line.match(/^(\s*)([*-]|\d+\.)\s+(.*)/);
              if (listMatch) {
                return (
                  <li key={lineIdx} style={{ marginLeft: "1.2rem" }}>
                    {renderInline(listMatch[3])}
                  </li>
                );
              }
              if (line.trim() === "") {
                return <div key={lineIdx} style={{ height: "0.4rem" }} />;
              }
              return (
                <p key={lineIdx} style={{ margin: "0.15rem 0" }}>
                  {renderInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function StreamingMessage({ fullText, onDone }) {
  const [shown, setShown] = useState("");
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    setShown("");
    startRef.current = null;

    // Fixed total duration regardless of length, capped between 0.4s and 1.6s.
    // A single rAF loop (synced to the browser's paint cycle) avoids the
    // layout-thrash / vibration caused by a fast setInterval forcing reflow
    // every few milliseconds.
    const duration = Math.min(1600, Math.max(400, fullText.length * 6));

    const step = (timestamp) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const chars = Math.floor(progress * fullText.length);
      setShown(fullText.slice(0, chars));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setShown(fullText);
        onDone?.();
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText]);

  return (
    <div className="message-content">
      <span style={{ whiteSpace: "pre-wrap" }}>{shown}</span>
      <span className="stream-cursor" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="message-wrapper ai animate-msg-ai">
      <div className="message-avatar">
        <TrinityLogo size="small" />
      </div>
      <div className="message-col">
        <div className="typing-bubble">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-label">Trinity is thinking…</span>
        </div>
      </div>
    </div>
  );
}

const QUICK_PILLS = [
  { emoji: "💡", label: "Brainstorm ideas", text: "Help me brainstorm ideas for " },
  { emoji: "🐞", label: "Debug code", text: "Help me debug this code: " },
  { emoji: "✍️", label: "Write something", text: "Help me write " },
  { emoji: "📚", label: "Explain a concept", text: "Explain this concept simply: " },
];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const MOCK_HISTORY = [
  {
    id: "welcome-email",
    title: "Welcome email draft",
    date: "Today",
    messages: [
      {
        id: "msg-1",
        role: "user",
        text: "Can you help me write a welcome email for new users?",
        time: "2m ago",
      },
      {
        id: "msg-2",
        role: "ai",
        text: "Of course! Here's a warm, concise draft that feels personal without being overwhelming.\n\nSubject: Welcome — we're glad you're here\n\nHi [Name], thanks for joining us. You're now part of something we've been building with a lot of care. Explore at your own pace, and reach out anytime.",
        time: "2m ago",
      },
      { id: "msg-3", role: "user", text: "Make it a bit shorter, please.", time: "2m ago" },
      {
        id: "msg-4",
        role: "ai",
        text: "Done. Here's the trimmed version — three punchy lines, still warm, much tighter.\n\nSubject: Welcome\n\nHi [Name] — glad you're here. Take a look around, and we're always just a message away.",
        time: "2m ago",
      },
    ],
  },
  {
    id: "prod-desc",
    title: "Product description",
    date: "Today",
    messages: [
      {
        id: "msg-5",
        role: "user",
        text: "Help me write a product description for a mechanical keyboard.",
        time: "1h ago",
      },
      {
        id: "msg-6",
        role: "ai",
        text: "Sounds great, can you add some specific features or key material details?",
        time: "1h ago",
      },
    ],
  },
  {
    id: "blog-outline",
    title: "Blog post outline",
    date: "Yesterday",
    messages: [
      {
        id: "msg-7",
        role: "user",
        text: "Draft a blog post outline on minimalist productivity workspaces.",
        time: "Yesterday",
      },
      {
        id: "msg-8",
        role: "ai",
        text: "What about SEO keywords? Should I generate them based on this outline?",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "support-faq",
    title: "Support FAQ copy",
    date: "Monday",
    messages: [
      {
        id: "msg-9",
        role: "user",
        text: "Can we draft an FAQ response for shipping refunds?",
        time: "Mon",
      },
      {
        id: "msg-10",
        role: "ai",
        text: "Can we add a refund section? Here are the standard draft points for shipping...",
        time: "Mon",
      },
    ],
  },
];

function App() {
  const [view, setView] = useState("landing"); // 'landing' or 'chat'
  const [message, setMessage] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("light"); // default to light as per mockups
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamingId, setStreamingId] = useState(null);
  const [revealedIds, setRevealedIds] = useState(new Set());

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem("trinity_history");
    const storedTheme = localStorage.getItem("trinity_theme") || "light";

    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);

    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setActiveChatId(parsed[0].id);
        } else {
          setHistory(MOCK_HISTORY);
          setActiveChatId("welcome-email");
        }
      } catch (e) {
        console.error("Error parsing stored history:", e);
        setHistory(MOCK_HISTORY);
        setActiveChatId("welcome-email");
      }
    } else {
      setHistory(MOCK_HISTORY);
      setActiveChatId("welcome-email");
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("trinity_history", JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, activeChatId, isLoading, streamingId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "42px";
      const sh = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(sh, 150)}px`;
    }
  }, [message]);

  useEffect(() => {
    if (!isLoading && view === "chat") {
      textareaRef.current?.focus();
    }
  }, [isLoading, view]);

  const activeChat = history.find((h) => h.id === activeChatId) || { messages: [] };

  const createNewChat = useCallback(
    (skipCheck = false) => {
      if (!skipCheck) {
        const emptyChat = history.find((h) => h.messages.length === 0);
        if (emptyChat) {
          setActiveChatId(emptyChat.id);
          return;
        }
      }
      const id = Date.now().toString();
      const newChat = {
        id,
        title: "New Conversation",
        messages: [],
        date: new Date().toLocaleDateString(),
      };
      setHistory((prev) => [newChat, ...prev]);
      setActiveChatId(id);
    },
    [history]
  );

  const deleteChat = (id, e) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    if (activeChatId === id) {
      if (updated.length > 0) setActiveChatId(updated[0].id);
      else createNewChat(true);
    }
  };

  const clearAllChats = () => {
    if (!window.confirm("Delete all conversations? This cannot be undone.")) return;
    const id = Date.now().toString();
    const fresh = {
      id,
      title: "New Conversation",
      messages: [],
      date: new Date().toLocaleDateString(),
    };
    setHistory([fresh]);
    setActiveChatId(id);
    localStorage.removeItem("trinity_history");
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("trinity_theme", next);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setError(null);

    const userText = message.trim();
    setMessage("");

    const userMsgId = `${Date.now()}-user`;
    const currentMessages = activeChat.messages;

    setHistory((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChatId) return chat;
        const title =
          chat.messages.length === 0
            ? userText.length > 28
              ? userText.substring(0, 28) + "…"
              : userText
            : chat.title;
        return {
          ...chat,
          title,
          messages: [
            ...chat.messages,
            { id: userMsgId, role: "user", text: userText, time: getTime() },
          ],
        };
      })
    );
    setRevealedIds((s) => new Set(s).add(userMsgId));
    setIsLoading(true);

    try {
      const apiURL = import.meta.env.DEV ? "http://localhost:5000/chat" : "/chat";
      const res = await axios.post(apiURL, {
        message: userText,
        history: currentMessages,
      });
      const aiMsgId = `${Date.now()}-ai`;

      setHistory((prev) =>
        prev.map((chat) => {
          if (chat.id !== activeChatId) return chat;
          return {
            ...chat,
            messages: [
              ...chat.messages,
              { id: aiMsgId, role: "ai", text: res.data.reply, time: getTime() },
            ],
          };
        })
      );
      setIsLoading(false);
      setStreamingId(aiMsgId);
    } catch (err) {
      const errId = `${Date.now()}-err`;
      const backendError =
        err.response?.data?.reply ||
        "Could not reach the Trinity backend. Make sure the server is running.";
      setError(backendError);
      setHistory((prev) =>
        prev.map((chat) => {
          if (chat.id !== activeChatId) return chat;
          return {
            ...chat,
            messages: [
              ...chat.messages,
              {
                id: errId,
                role: "ai",
                text: `⚠️ Error: ${backendError}`,
                isError: true,
                time: getTime(),
              },
            ],
          };
        })
      );
      setRevealedIds((s) => new Set(s).add(errId));
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handlePill = (text) => {
    setMessage(text);
    textareaRef.current?.focus();
  };

  const handleStreamDone = (id) => {
    setRevealedIds((s) => new Set(s).add(id));
    setStreamingId(null);
  };

  // If view is 'landing', show the landing page
  if (view === "landing") {
    return (
      <LandingPage
        onStartChat={() => setView("chat")}
        onThemeToggle={toggleTheme}
        theme={theme}
      />
    );
  }

  return (
    <div className="app-container">
      {isSidebarOpen && (
        <div className="sidebar-overlay visible" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isSidebarOpen ? "" : "closed"}`}>
        <div className="sidebar-brand">
          <div
            className="brand-logo"
            onClick={() => setView("landing")}
            style={{ cursor: "pointer" }}
          >
            <TLogo size={24} />
            <div className="brand-name">Trinity AI</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span className="brand-badge">Beta</span>
            <button
              className="sidebar-close-btn"
              onClick={() => setIsSidebarOpen(false)}
              title="Close sidebar"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="new-chat-area">
          <button className="new-chat-btn" onClick={() => createNewChat()}>
            <Plus size={14} />
            <span>New conversation</span>
          </button>
        </div>

        <div className="history-label">Recent</div>
        <div className="sidebar-history">
          {history.length === 0 ? (
            <div
              style={{
                padding: "1rem",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
                textAlign: "center",
              }}
            >
              No conversations yet
            </div>
          ) : (
            history.map((chat) => {
              const isActive = chat.id === activeChatId;
              const lastMsg = chat.messages[chat.messages.length - 1];
              // Get message preview, clean of code blocks formatting
              const previewRaw = lastMsg ? lastMsg.text : "";
              const subjectIdx = previewRaw.indexOf("Subject:");
              const previewClean =
                subjectIdx !== -1 ? previewRaw.substring(0, subjectIdx).trim() : previewRaw;
              const previewText = previewClean
                ? previewClean.length > 25
                  ? previewClean.substring(0, 25) + "..."
                  : previewClean
                : "No messages yet";

              // Find appropriate timestamp display
              const timeText = lastMsg ? lastMsg.time || "Just now" : "";

              return (
                <div
                  key={chat.id}
                  className={`history-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className="history-item-content-wrapper">
                    <div className="history-item-title-row">
                      <span className="history-item-title">{chat.title}</span>
                      {timeText && <span className="history-item-time">{timeText}</span>}
                    </div>
                    <span className="history-item-preview">{previewText}</span>
                  </div>
                  <div className="history-item-actions">
                    <button
                      className="delete-history-btn"
                      onClick={(e) => deleteChat(chat.id, e)}
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Profile Card Footer */}
        <div className="sidebar-footer-profile">
          <div className="profile-info">
            <UserAvatar size={28} />
            <div className="profile-details">
              <span className="profile-name">Sarah Chen</span>
              <span className="profile-badge">Pro plan</span>
            </div>
          </div>
          <button className="settings-btn" onClick={clearAllChats} title="Clear all history">
            <Trash2 size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      </aside>

      {/* ── Main Chat ── */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="header-left">
            {!isSidebarOpen && (
              <button
                className="menu-toggle-btn"
                onClick={() => setIsSidebarOpen(true)}
                title="Open sidebar"
              >
                <Menu size={15} />
              </button>
            )}
            <div className="header-info">
              <div className="header-title">{activeChat.title || "Welcome"}</div>
              <div className="header-subtitle">
                <span>
                  {activeChat.messages ? activeChat.messages.length : 0}{" "}
                  {activeChat.messages && activeChat.messages.length === 1
                    ? "message"
                    : "messages"}
                </span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button className="header-share-btn">
              <Share2 size={12} />
              <span>Share</span>
            </button>
            <button className="header-icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button className="header-icon-btn" title="More options">
              <MoreHorizontal size={15} />
            </button>
          </div>
        </header>

        <div className="chat-messages">
          {activeChat.messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="large-welcome-logo-container" style={{ height: "auto" }}>
                <TLogo size={60} />
                <h2 style={{ marginTop: "1rem", color: "var(--text-primary)" }}>
                  Meet Trinity. Your AI.
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Ask anything to start a conversation.
                </p>
              </div>
            </div>
          ) : (
            activeChat.messages.map((msg, i) => {
              const isRevealed = revealedIds.has(msg.id);
              const isStreamingNow = streamingId === msg.id;

              // Parse message into parts (conversational sage bubbles vs cream drafts)
              const parts =
                msg.role === "ai" && !msg.isError
                  ? parseMessageParts(msg.text)
                  : [{ type: "conversational", text: msg.text }];

              return (
                <div key={msg.id || i}>
                  {i === 0 && (
                    <div className="date-divider">
                      <span>{activeChat.date || "Today"}</span>
                    </div>
                  )}

                  <div className={`message-wrapper ${msg.role === "user" ? "user" : "ai"}`}>
                    {msg.role === "ai" && (
                      <div className="message-avatar">
                        <TLogo size={24} />
                      </div>
                    )}

                    <div className="message-col">
                      {parts.map((part, pIdx) => {
                        const isCream = part.type === "draft";
                        return (
                          <div
                            key={pIdx}
                            className={`message-bubble ${
                              isCream ? "cream-bubble" : "sage-bubble"
                            }`}
                          >
                            {msg.isError ? (
                              <div
                                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                              >
                                <AlertTriangle size={14} />
                                <span>{part.text}</span>
                              </div>
                            ) : isStreamingNow && pIdx === parts.length - 1 ? (
                              <StreamingMessage
                                fullText={part.text}
                                onDone={() => handleStreamDone(msg.id)}
                              />
                            ) : (
                              <FormattedMessage text={part.text} />
                            )}
                          </div>
                        );
                      })}
                      {msg.time && (isRevealed || msg.role === "user") && (
                        <div className="message-time">{msg.time}</div>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="message-avatar-user" style={{ marginLeft: "0.55rem" }}>
                        <UserAvatar size={24} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Box ── */}
        <div className="chat-input-area">
          <div className="input-inner">
            {error && (
              <div className="error-banner">
                <AlertTriangle size={13} />
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "inherit",
                    display: "flex",
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="input-box">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Trinity anything..."
                className="chat-textarea"
                disabled={isLoading}
                rows={1}
              />
              <div className="input-box-bottom-row">
                <div className="input-box-left-actions">
                  <button className="input-action-pill-btn" type="button">
                    <Paperclip size={12} />
                    <span>Attach</span>
                  </button>
                  <button className="input-action-pill-btn" type="button">
                    <LayoutGrid size={12} />
                    <span>Templates</span>
                  </button>
                </div>
                <div className="input-box-right-actions">
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || isLoading}
                    className="send-btn"
                    title="Send"
                  >
                    <span>Send</span>
                    <ArrowUp size={14} style={{ strokeWidth: 2.5 }} />
                  </button>
                </div>
              </div>
            </div>

            <div className="input-hint">
              Trinity may make mistakes. Review important information.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
