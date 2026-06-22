export default function App() {
  return (
    <div
      style={{ background: "#07071A" }}
      className="size-full min-h-screen flex items-center justify-center"
    >
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

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "44px" }}>

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

              {/* Motion paths – all share the same base ellipse; rings 2 & 3
                  reference this path inside a rotated group to get different planes */}
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
                color: "white",
                lineHeight: 1,
              }}
            >
              TRRINITY
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
              color: "rgba(255,255,255,0.32)",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Intelligence &middot; Redefined
          </p>
        </div>
      </div>
    </div>
  );
}
