import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Send,
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
} from "lucide-react";
import "./App.css";

// Trinity AI Logo Component
function TrinityLogo({ size = "small" }) {
  if (size === "large") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "44px" }}>
        <style>{`
          @keyframes draw-ring {
            from { stroke-dashoffset: 620; opacity: 0; }
            to   { stroke-dashoffset: 0;   opacity: 0.75; }
          }
          @keyframes dot-appear {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes center-pulse {
            0%,100% { opacity: 0.9; r: 5; }
            50%      { opacity: 0.4; r: 9; }
          }
          @keyframes halo-breathe {
            0%,100% { opacity: 0.35; }
            50%      { opacity: 0.7; }
          }
          @keyframes mark-float {
            0%,100% { transform: translateY(0px); }
            50%      { transform: translateY(-8px); }
          }
          @keyframes text-rise {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0px); }
          }
          @keyframes badge-shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
          }

          .ring-1 {
            stroke-dasharray: 620;
            animation: draw-ring 2s cubic-bezier(0.4,0,0.2,1) 0.2s both;
          }
          .ring-2 {
            stroke-dasharray: 620;
            animation: draw-ring 2s cubic-bezier(0.4,0,0.2,1) 0.55s both;
          }
          .ring-3 {
            stroke-dasharray: 620;
            animation: draw-ring 2s cubic-bezier(0.4,0,0.2,1) 0.9s both;
          }

          .dot-1 { animation: dot-appear 0.4s ease 2.2s both; }
          .dot-2 { animation: dot-appear 0.4s ease 2.5s both; }
          .dot-3 { animation: dot-appear 0.4s ease 2.8s both; }

          .center-dot {
            animation: center-pulse 2.8s ease-in-out 3s infinite;
          }
          .halo {
            animation: halo-breathe 3s ease-in-out infinite;
          }
          .mark-float {
            animation: mark-float 5s ease-in-out 3s infinite;
            will-change: transform;
          }

          .wordmark {
            font-family: 'Space Grotesk', sans-serif;
            animation: text-rise 0.9s cubic-bezier(0.16,1,0.3,1) 1.8s both;
          }
          .tagline {
            font-family: 'Space Grotesk', sans-serif;
            animation: text-rise 0.9s cubic-bezier(0.16,1,0.3,1) 2.1s both;
          }

          .ai-badge {
            background: linear-gradient(
              90deg,
              #4F9DFF 0%,
              #A78BFA 40%,
              #67E8F9 70%,
              #4F9DFF 100%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: badge-shimmer 4s linear 3s infinite;
          }
        `}</style>
        {/* ── Mark ── */}
        <div className="mark-float" style={{ lineHeight: 0 }}>
          <svg
            viewBox="0 0 200 200"
            width="260"
            height="260"
            style={{ overflow: "visible" }}
          >
            <defs>
              {/* Glow filters */}
              <filter id="glow-blue" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-purple" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-cyan" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-center" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>

              {/* Ambient halo gradient */}
              <radialGradient id="halo-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#3D1FA8" stopOpacity="0.35" />
                <stop offset="60%"  stopColor="#1A0D5C" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#07071A" stopOpacity="0" />
              </radialGradient>

              {/* Motion paths */}
              <path
                id="orbit-path"
                d="M 32,100 A 68,22 0 1,1 168,100 A 68,22 0 1,1 32,100"
                fill="none"
              />
            </defs>

            {/* Ambient halo */}
            <circle className="halo" cx="100" cy="100" r="96" fill="url(#halo-grad)" />

            {/* ── Ring 1: horizontal (0°) – blue ── */}
            <ellipse
              className="ring-1"
              cx="100" cy="100" rx="68" ry="22"
              fill="none"
              stroke="#4F9DFF"
              strokeWidth="1.4"
              filter="url(#glow-blue)"
            />

            {/* ── Ring 2: vertical (90°) – purple ── */}
            <g transform="rotate(90, 100, 100)">
              <ellipse
                className="ring-2"
                cx="100" cy="100" rx="68" ry="22"
                fill="none"
                stroke="#A78BFA"
                strokeWidth="1.4"
                filter="url(#glow-purple)"
              />
            </g>

            {/* ── Ring 3: diagonal (45°) – cyan ── */}
            <g transform="rotate(45, 100, 100)">
              <ellipse
                className="ring-3"
                cx="100" cy="100" rx="68" ry="22"
                fill="none"
                stroke="#67E8F9"
                strokeWidth="1.4"
                filter="url(#glow-cyan)"
              />
            </g>

            {/* ── Orbiting dot – ring 1 (blue) ── */}
            <g className="dot-1">
              <circle r="3.8" fill="#4F9DFF" filter="url(#glow-blue)">
                <animateMotion dur="7s" repeatCount="indefinite" begin="2.2s">
                  <mpath href="#orbit-path" />
                </animateMotion>
              </circle>
            </g>

            {/* ── Orbiting dot – ring 2 (purple, rotated 90°) ── */}
            <g className="dot-2" transform="rotate(90, 100, 100)">
              <circle r="3.8" fill="#A78BFA" filter="url(#glow-purple)">
                <animateMotion dur="10s" repeatCount="indefinite" begin="2.5s">
                  <mpath href="#orbit-path" />
                </animateMotion>
              </circle>
            </g>

            {/* ── Orbiting dot – ring 3 (cyan, rotated 45°) ── */}
            <g className="dot-3" transform="rotate(45, 100, 100)">
              <circle r="3.8" fill="#67E8F9" filter="url(#glow-cyan)">
                <animateMotion dur="8.5s" repeatCount="indefinite" begin="2.8s">
                  <mpath href="#orbit-path" />
                </animateMotion>
              </circle>
            </g>

            {/* ── Center core ── */}
            <circle
              className="center-dot"
              cx="100" cy="100" r="5"
              fill="white"
              filter="url(#glow-center)"
            />
            {/* Hard center pinpoint */}
            <circle cx="100" cy="100" r="2.5" fill="white" opacity="0.95" />
          </svg>
        </div>

        {/* ── Wordmark ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div
            className="wordmark"
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "46px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              TRINITY
            </span>
            <span
              className="ai-badge"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "0.3em",
                lineHeight: 1,
              }}
            >
              AI
            </span>
          </div>

          <p
            className="tagline"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "11px",
              fontWeight: 400,
              letterSpacing: "0.38em",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Intelligence &middot; Redefined
          </p>
        </div>
      </div>
    );
  }

  // Small compact version for avatars / sidebar
  return (
    <svg
      viewBox="0 0 200 200"
      className={size === "sidebar" ? "brand-logo-svg" : "message-avatar-svg"}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Simple filters */}
        <filter id="glow-blue-sm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-purple-sm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-cyan-sm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-center-sm" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ring 1 */}
      <ellipse
        cx="100" cy="100" rx="68" ry="22"
        fill="none"
        stroke="#4F9DFF"
        strokeWidth="6"
        filter="url(#glow-blue-sm)"
      />

      {/* Ring 2 */}
      <g transform="rotate(90, 100, 100)">
        <ellipse
          cx="100" cy="100" rx="68" ry="22"
          fill="none"
          stroke="#A78BFA"
          strokeWidth="6"
          filter="url(#glow-purple-sm)"
        />
      </g>

      {/* Ring 3 */}
      <g transform="rotate(45, 100, 100)">
        <ellipse
          cx="100" cy="100" rx="68" ry="22"
          fill="none"
          stroke="#67E8F9"
          strokeWidth="6"
          filter="url(#glow-cyan-sm)"
        />
      </g>

      {/* Center core */}
      <circle
        cx="100" cy="100" r="14"
        fill="white"
        filter="url(#glow-center-sm)"
      />
      <circle cx="100" cy="100" r="7" fill="white" opacity="0.95" />
    </svg>
  );
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

function App() {
  const [message, setMessage] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamingId, setStreamingId] = useState(null);
  const [revealedIds, setRevealedIds] = useState(new Set());

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem("trinity_history");
    const storedTheme = localStorage.getItem("trinity_theme") || "dark";

    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);

    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        setHistory(Array.isArray(parsed) ? parsed : []);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveChatId(parsed[0].id);
        } else {
          createNewChat(true);
        }
      } catch (e) {
        console.error("Error parsing stored history:", e);
        createNewChat(true);
      }
    } else {
      createNewChat(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

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
    const fresh = { id, title: "New Conversation", messages: [], date: new Date().toLocaleDateString() };
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
          messages: [...chat.messages, { id: userMsgId, role: "user", text: userText, time: getTime() }],
        };
      })
    );
    setRevealedIds((s) => new Set(s).add(userMsgId));
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        message: userText,
        history: currentMessages,
      });
      const aiMsgId = `${Date.now()}-ai`;

      setHistory((prev) =>
        prev.map((chat) => {
          if (chat.id !== activeChatId) return chat;
          return {
            ...chat,
            messages: [...chat.messages, { id: aiMsgId, role: "ai", text: res.data.reply, time: getTime() }],
          };
        })
      );
      setIsLoading(false);
      setStreamingId(aiMsgId);
    } catch (err) {
      const errId = `${Date.now()}-err`;
      const backendError = err.response?.data?.reply || "Could not reach the Trinity backend. Make sure the server is running.";
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

  return (
    <div className="app-container">
      {isSidebarOpen && (
        <div className="sidebar-overlay visible" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${isSidebarOpen ? "" : "closed"}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <TrinityLogo size="sidebar" />
            <div className="brand-name">Trinity</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span className="brand-badge">Beta</span>
            <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)} title="Close sidebar">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="new-chat-area">
          <button className="new-chat-btn" onClick={() => createNewChat()}>
            <Plus size={14} />
            <span>New Conversation</span>
          </button>
        </div>

        <div className="history-label">Recent</div>
        <div className="sidebar-history">
          {history.length === 0 ? (
            <div style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.78rem", textAlign: "center" }}>
              No conversations yet
            </div>
          ) : (
            history.map((chat) => (
              <div
                key={chat.id}
                className={`history-item ${chat.id === activeChatId ? "active" : ""}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="history-item-content">
                  <MessageSquare size={12} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <span className="history-item-text">{chat.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  {chat.messages.length > 0 && (
                    <span className="history-msg-count">{chat.messages.length}</span>
                  )}
                  <button className="delete-history-btn" onClick={(e) => deleteChat(chat.id, e)} title="Delete">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button className="clear-all-btn" onClick={clearAllChats}>
            <Trash2 size={12} />
            <span>Clear all history</span>
          </button>
          <div className="creator-credit">
            Built by <span>Vaibhav Singh Saroniya</span>
          </div>
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <div className="header-left">
            {!isSidebarOpen && (
              <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)} title="Open sidebar">
                <Menu size={15} />
              </button>
            )}
            <div className="header-info">
              <div className="header-title">Trinity</div>
              <div className="header-subtitle">
                <span className="status-pulse" />
                <span>Online · Groq Cloud</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <span className="model-pill">Llama 3.3 · 70B</span>
            <button className="header-icon-btn" onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}>
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        <div className="chat-messages">
          {activeChat.messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="large-welcome-logo-container">
                <TrinityLogo size="large" />
              </div>
            </div>
          ) : (
            activeChat.messages.map((msg, i) => {
              const isRevealed = revealedIds.has(msg.id);
              const isStreamingNow = streamingId === msg.id;
              const animClass = msg.role === "user" ? "animate-msg-user" : "animate-msg-ai";

              return (
                <div key={msg.id || i}>
                  {i === 0 && (
                    <div className="date-divider">
                      <span>{activeChat.date || "Today"}</span>
                    </div>
                  )}

                  <div className={`message-wrapper ${msg.role === "user" ? "user" : "ai"} ${!isRevealed && !isStreamingNow ? animClass : ""}`}>
                    {msg.role === "ai" && (
                      <div className="message-avatar">
                        <TrinityLogo size="small" />
                      </div>
                    )}

                    <div className="message-col">
                      <div className="message-bubble">
                        {msg.isError ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <AlertTriangle size={14} />
                            <span>{msg.text}</span>
                          </div>
                        ) : isStreamingNow ? (
                          <StreamingMessage fullText={msg.text} onDone={() => handleStreamDone(msg.id)} />
                        ) : (
                          <FormattedMessage text={msg.text} />
                        )}
                      </div>
                      {msg.time && (isRevealed || msg.role === "user") && (
                        <div className="message-time">{msg.time}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="input-inner">
            {error && (
              <div className="error-banner">
                <AlertTriangle size={13} />
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex" }}
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {activeChat.messages.length > 0 && (
              <div className="input-pills">
                {QUICK_PILLS.map((p, i) => (
                  <div key={i} className="input-pill" onClick={() => handlePill(p.text)}>
                    <span>{p.emoji}</span>
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="input-box">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Trinity… (Enter to send, Shift+Enter for new line)"
                className="chat-textarea"
                disabled={isLoading}
                rows={1}
              />
              <div className="input-actions">
                <button onClick={sendMessage} disabled={!message.trim() || isLoading} className="send-btn" title="Send">
                  <Send size={14} />
                </button>
              </div>
            </div>

            <div className="input-hint">Trinity can make mistakes. Verify important information.</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
