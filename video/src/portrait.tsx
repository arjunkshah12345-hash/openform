import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
const paper = "#f8f9f6",
  forest = "#294b39",
  sage = "#e2ecdc",
  peach = "#f7decf",
  lilac = "#e5e2f4",
  muted = "#7c8c73";
const enter = (f: number, a = 0, b = 22) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
function Brand({
  light = false,
  large = false,
}: {
  light?: boolean;
  large?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        color: light ? paper : forest,
        fontSize: large ? 88 : 40,
        fontWeight: 650,
        letterSpacing: large ? -5 : -2,
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          background: "#d2ec9b",
          color: forest,
          width: large ? 100 : 46,
          height: large ? 100 : 46,
          borderRadius: large ? 28 : 13,
        }}
      >
        <svg
          width={large ? 76 : 35}
          height={large ? 76 : 35}
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M9 9h9a7 7 0 0 1 0 14H9V9ZM10 16h9"
            stroke="currentColor"
            strokeWidth="3.8"
          />
        </svg>
      </span>
      openform
    </div>
  );
}
function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: "Display",
        fontSize: 85,
        lineHeight: 1.07,
        fontWeight: 400,
        letterSpacing: -2.8,
        margin: "28px 0",
      }}
    >
      {children}
    </h1>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 16, letterSpacing: 3, color: muted }}>
      {children}
    </div>
  );
}
function Action({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-block",
        padding: "18px 27px",
        background: forest,
        color: paper,
        fontSize: 24,
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  );
}
function Card({ f, theme = sage }: { f: number; theme?: string }) {
  return (
    <div
      style={{
        background: theme,
        border: "1px solid #cadaC0",
        borderRadius: 18,
        padding: "45px 55px",
        height: 515,
        boxShadow: "0 18px 45px #294b3910",
      }}
    >
      <Brand />
      <h2
        style={{
          fontFamily: "Display",
          fontSize: 58,
          lineHeight: 1.1,
          fontWeight: 400,
          letterSpacing: -1,
          margin: "50px 0 25px",
        }}
      >
        What’s on
        <br />
        your mind?
      </h2>
      <div
        style={{
          borderBottom: "2px solid #a3b494",
          fontSize: 27,
          paddingBottom: 15,
          color: "#718869",
        }}
      >
        {"Something worth sharing.".slice(0, Math.floor(enter(f, 30, 90) * 24))}
        <span style={{ opacity: Math.floor(f / 15) % 2 ? 0 : 1 }}>│</span>
      </div>
      <div style={{ marginTop: 25 }}>
        <Action>OK ✓</Action>
      </div>
    </div>
  );
}
export function PortraitFilm() {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender("Local portrait fonts"));
  useEffect(() => {
    Promise.all([
      document.fonts.load("400 80px Display"),
      document.fonts.load("500 30px Sans"),
    ]).then(() => continueRender(handle));
  }, [handle]);
  const phase =
    f < 120 ? 0 : f < 240 ? 1 : f < 420 ? 2 : f < 570 ? 3 : f < 720 ? 4 : 5;
  const local = f - [0, 120, 240, 420, 570, 720][phase];
  const dark = phase === 5 && local >= 84;
  return (
    <AbsoluteFill
      style={{
        fontFamily: "Sans",
        background: dark
          ? forest
          : phase === 1
            ? sage
            : phase === 3
              ? peach
              : paper,
        color: dark ? paper : forest,
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("soundtrack.wav")} volume={0.78} />
      <div style={{ position: "absolute", top: 65, left: 70 }}>
        <Brand light={dark} />
      </div>
      <div
        key={phase}
        style={{
          position: "absolute",
          inset: 0,
          opacity: enter(local),
          transform: `translateY(${(1 - enter(local)) * 25}px)`,
        }}
      >
        {phase === 0 && (
          <>
            <div
              style={{ position: "absolute", top: 230, left: 70, right: 60 }}
            >
              <Label>A LITTLE MORE HUMAN</Label>
              <Title>
                Forms should feel
                <br />
                like a <em>conversation.</em>
              </Title>
            </div>
            <div
              style={{
                position: "absolute",
                top: 610,
                left: 180,
                right: 110,
                transform: "rotate(4deg)",
              }}
            >
              <Card f={local} />
            </div>
          </>
        )}
        {phase === 1 && (
          <>
            <div
              style={{ position: "absolute", top: 225, left: 70, right: 70 }}
            >
              <Label>MEET YOUR NEXT CONVERSATION</Label>
              <div style={{ marginTop: 40 }}>
                <Brand large />
              </div>
              <Title>A little more human.</Title>
              <p style={{ fontSize: 28, color: muted, lineHeight: 1.6 }}>
                An open-source form builder.
                <br />A thoughtful place to ask.
              </p>
            </div>
            <div
              style={{
                position: "absolute",
                top: 630,
                left: 170,
                right: 100,
                transform: "rotate(-3deg)",
              }}
            >
              <Card f={local + 15} />
            </div>
          </>
        )}
        {phase === 2 && (
          <>
            <div
              style={{ position: "absolute", top: 225, left: 70, right: 70 }}
            >
              <Label>01 / BUILD</Label>
              <Title>
                A blank page.
                <br />
                Your next big idea.
              </Title>
              <p style={{ fontSize: 28, color: muted }}>
                Seven question types. Six thoughtful themes.
              </p>
            </div>
            <div
              style={{
                position: "absolute",
                left: 70,
                right: 70,
                top: 625,
                background: "#fff",
                border: "1px solid #dce4d3",
                borderRadius: 15,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "23px 30px",
                  fontSize: 23,
                  borderBottom: "1px solid #e3e8dc",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Customer feedback</span>
                <span style={{ color: "#8ca074" }}>Saved ✓</span>
              </div>
              <div
                style={{
                  padding: 30,
                  background: local < 65 ? sage : local < 115 ? peach : lilac,
                }}
              >
                <div style={{ fontSize: 15, opacity: 0.6 }}>2 →</div>
                <h2
                  style={{
                    fontFamily: "Display",
                    fontSize: 51,
                    fontWeight: 400,
                    margin: "30px 0 22px",
                  }}
                >
                  How was your experience?
                </h2>
                <div
                  style={{ fontSize: 54, letterSpacing: 15, color: "#7c9769" }}
                >
                  ☆☆☆☆☆
                </div>
                <div style={{ marginTop: 30 }}>
                  <Action>OK ✓</Action>
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: 80,
                top: 1120,
                display: "flex",
                gap: 20,
              }}
            >
              {[sage, peach, lilac].map((c, i) => (
                <span
                  key={c}
                  style={{
                    height: 57,
                    width: 57,
                    borderRadius: 50,
                    background: c,
                    border: `${(local < 65 ? 0 : local < 115 ? 1 : 2) === i ? 3 : 1}px solid #93a77d`,
                  }}
                />
              ))}
            </div>
          </>
        )}
        {phase === 3 && (
          <>
            <div
              style={{ position: "absolute", top: 225, left: 70, right: 70 }}
            >
              <Label>02 / ASK</Label>
              <Title>
                What would you
                <br />
                like to build?
              </Title>
              <p style={{ fontSize: 28, color: "#a87b63" }}>
                One question. One real connection.
              </p>
            </div>
            <div
              style={{
                position: "absolute",
                top: 625,
                left: 70,
                right: 70,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {["A better product", "A real connection", "Something new"].map(
                (a, i) => (
                  <div
                    key={a}
                    style={{
                      border: "1px solid #c6a388",
                      borderRadius: 8,
                      padding: "27px 28px",
                      fontSize: 29,
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      background:
                        local > 58 && i === 1 ? "#fff8f1" : "#ffffff20",
                      transform: `translateX(${(1 - enter(local, i * 6, i * 6 + 22)) * 40}px)`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 19,
                        border: "1px solid #c3a087",
                        padding: "6px 10px",
                        borderRadius: 4,
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    {a}
                    <span style={{ marginLeft: "auto" }}>
                      {local > 58 && i === 1 ? "✓" : ""}
                    </span>
                  </div>
                ),
              )}
              <div style={{ marginTop: 20, opacity: enter(local, 67, 85) }}>
                <Action>Submit ✓</Action>
              </div>
            </div>
          </>
        )}
        {phase === 4 && (
          <>
            <div
              style={{ position: "absolute", left: 70, right: 70, top: 225 }}
            >
              <Label>03 / LISTEN</Label>
              <Title>
                Every answer.
                <br />A new perspective.
              </Title>
            </div>
            <div
              style={{
                position: "absolute",
                left: 70,
                right: 70,
                top: 595,
                border: "1px solid #d1dec3",
                borderRadius: 16,
                padding: "40px 45px",
                background: sage,
                opacity: enter(local, 22, 40),
                transform: `translateY(${(1 - enter(local, 22, 45)) * 55}px)`,
              }}
            >
              <Label>A CLOSER LOOK</Label>
              <h3 style={{ fontSize: 25, fontWeight: 500, marginTop: 40 }}>
                What could we do better?
              </h3>
              <p
                style={{
                  fontFamily: "Display",
                  fontSize: 52,
                  lineHeight: 1.23,
                  letterSpacing: -1,
                  margin: "32px 0",
                }}
              >
                “Keep making it
                <br />
                this easy to feel heard.”
              </p>
              <div
                style={{
                  borderTop: "1px solid #ccdabe",
                  paddingTop: 25,
                  fontSize: 20,
                  color: "#80966e",
                }}
              >
                Read the story. Take the insights.
              </div>
              <div style={{ marginTop: 30 }}>
                <Action>↓ Export CSV</Action>
              </div>
              <div style={{ fontSize: 14, color: "#8fa37f", marginTop: 35 }}>
                Sample product demonstration
              </div>
            </div>
          </>
        )}
        {phase === 5 && !dark && (
          <div style={{ position: "absolute", left: 70, top: 280 }}>
            <Label>OPEN BY NATURE. YOURS BY DESIGN.</Label>
            {["Your questions.", "Your data.", "Your code."].map((line, i) => (
              <div
                key={line}
                style={{
                  fontFamily: "Display",
                  fontSize: 102,
                  lineHeight: 1.5,
                  letterSpacing: -2.5,
                  opacity: enter(local, i * 17, i * 17 + 14),
                  transform: `translateX(${(1 - enter(local, i * 17, i * 17 + 24)) * -50}px)`,
                  color: i === 2 ? "#82a05e" : forest,
                  marginTop: i === 0 ? 40 : 0,
                }}
              >
                {line}
              </div>
            ))}
            <div
              style={{
                color: "#d8e3cc",
                fontSize: 190,
                position: "absolute",
                right: -130,
                bottom: -170,
              }}
            >
              ✳
            </div>
          </div>
        )}
        {dark && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: enter(local, 84, 100),
            }}
          >
            <Brand large light />
            <h2
              style={{
                fontFamily: "Display",
                fontSize: 67,
                fontWeight: 400,
                lineHeight: 1.12,
                textAlign: "center",
                margin: "65px 0 28px",
              }}
            >
              Open source.
              <br />
              MIT licensed.
            </h2>
            <p style={{ fontSize: 29, color: "#c4d6b5" }}>
              Try it. Fork it. Make it yours.
            </p>
            <div
              style={{
                background: paper,
                color: forest,
                padding: "18px 28px",
                borderRadius: 8,
                fontSize: 24,
                marginTop: 32,
              }}
            >
              Explore Openform →
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 63,
          left: 70,
          right: 70,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 16,
          color: dark ? "#b9cda7" : muted,
        }}
      >
        <span>Beautiful forms. Open to everyone.</span>
        <span>OPENFORM</span>
      </div>
    </AbsoluteFill>
  );
}
