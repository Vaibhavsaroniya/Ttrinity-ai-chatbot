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
      <div className="message-avatar">T</div>
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
      const parsed = JSON.parse(storedHistory);
      setHistory(parsed);
      if (parsed.length > 0) setActiveChatId(parsed[0].id);
      else createNewChat(true);
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
    } catch {
      const errId = `${Date.now()}-err`;
      setError("Could not reach the Trinity backend. Make sure the server is running.");
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
                text: "⚠️ Error: Could not retrieve a response from the backend.",
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
            <div className="brand-icon">T</div>
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
              <div className="welcome-logo-wrap">
                <div className="welcome-logo-glow" />
                <div className="welcome-logo">T</div>
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
                    {msg.role === "ai" && <div className="message-avatar">T</div>}

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
