import { Sparkles, Sliders, Zap, ArrowRight } from "lucide-react";

// T Logo Component to match screenshots (Green circle with white T)
export function TLogo({ size = 32 }) {
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
    >
      T
    </div>
  );
}

export default function LandingPage({ onStartChat, onThemeToggle, theme }) {
  return (
    <div className="landing-container">
      {/* ── Navbar ── */}
      <header className="landing-navbar">
        <div className="navbar-logo" onClick={onStartChat} style={{ cursor: "pointer" }}>
          <TLogo size={28} />
          <span className="logo-text">Trinity AI</span>
        </div>
        <nav className="navbar-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#docs">Docs</a>
        </nav>
        <div className="navbar-actions">
          <button className="signin-link" onClick={onStartChat}>
            Sign in
          </button>
          <button className="get-started-btn" onClick={onStartChat}>
            Get started
          </button>
        </div>
      </header>

      {/* ── Main Hero Section ── */}
      <main className="landing-hero-section">
        <div className="hero-content">
          <div className="badge-pill">
            <span className="badge-dot" />
            <span className="badge-text">Intelligent conversations, redefined</span>
          </div>

          <h1 className="hero-title">
            Meet Trinity.<br />
            Your AI, refined.
          </h1>

          <p className="hero-subtitle">
            Beautifully minimal, surprisingly capable. Trinity brings warmth and clarity to every
            conversation — designed to feel native to your site.
          </p>

          <div className="hero-buttons">
            <button className="cta-start-btn" onClick={onStartChat}>
              Start for free
            </button>
            <button className="cta-demo-btn" onClick={onStartChat}>
              See a demo <ArrowRight size={14} className="arrow-icon" />
            </button>
          </div>
        </div>

        {/* ── Chat Interface Mockup Mock ── */}
        <div className="hero-mockup-container">
          <div className="chat-mockup-card">
            {/* Header */}
            <div className="mockup-header">
              <div className="mockup-header-left">
                <TLogo size={22} />
                <span className="mockup-title">Trinity AI</span>
              </div>
              <div className="mockup-status">
                <span className="mockup-status-dot" />
                <span className="mockup-status-text">Online</span>
              </div>
            </div>

            {/* Message Thread */}
            <div className="mockup-messages">
              <div className="mockup-msg user">
                <div className="mockup-bubble">
                  Can you help me write a welcome email?
                </div>
              </div>

              <div className="mockup-msg ai">
                <div className="mockup-bubble cream">
                  Of course! Here's a warm, concise draft that feels personal without being overwhelming.
                </div>
              </div>

              <div className="mockup-msg ai">
                <div className="mockup-bubble sage">
                  Subject: Welcome — we're glad you're here
                </div>
              </div>

              <div className="mockup-msg user">
                <div className="mockup-bubble">
                  Make it a bit shorter, please.
                </div>
              </div>

              <div className="mockup-msg ai">
                <div className="mockup-bubble cream">
                  Done. Trimmed to three punchy lines — still warm, much tighter.
                </div>
              </div>
            </div>

            {/* Input Box */}
            <div className="mockup-input-box">
              <span className="mockup-input-placeholder">Ask Trinity anything...</span>
              <button className="mockup-send-btn">
                <span className="arrow-up">↑</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── Stats Area ── */}
      <section className="landing-stats-section">
        <hr className="stats-divider" />
        <div className="stats-grid">
          <div className="stat-column">
            <div className="stat-value">12k+</div>
            <div className="stat-label">Active users</div>
          </div>
          <div className="stat-column">
            <div className="stat-value">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-column">
            <div className="stat-value">&lt; 0.4s</div>
            <div className="stat-label">Avg. response</div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="landing-features-section">
        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Sparkles size={18} className="feature-icon" />
            </div>
            <h3 className="feature-title">Context-aware</h3>
            <p className="feature-desc">
              Trinity remembers the full thread, keeping every reply accurate and on-point.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Sliders size={18} className="feature-icon" />
            </div>
            <h3 className="feature-title">Fully customizable</h3>
            <p className="feature-desc">
              Adjust tone, persona, and knowledge base to perfectly match your brand.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={18} className="feature-icon" />
            </div>
            <h3 className="feature-title">Instant responses</h3>
            <p className="feature-desc">
              Sub-second replies powered by the latest generation of language models.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
