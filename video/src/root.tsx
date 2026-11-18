import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "./style.css";
import { PortraitFilm } from "./portrait";
const C = {
  paper: "#f8f9f6",
  forest: "#294b39",
  sage: "#e2ecdc",
  peach: "#f7decf",
  lilac: "#e5e2f4",
  lime: "#d2ec9b",
  muted: "#7c8c73",
};
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const move = (f: number, a: number, b: number, x = 0, y = 1) =>
  interpolate(f, [a, b], [x, y], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
function Mark({ size = 64 }: { size?: number }) {
  return (
    <div
      style={{
        height: size,
        width: size,
        borderRadius: size * 0.28,
        background: C.lime,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size * 0.78}
        height={size * 0.78}
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M9 9h9a7 7 0 0 1 0 14H9V9Z"
          stroke={C.forest}
          strokeWidth="3.8"
        />
        <path d="M10 16h9" stroke={C.forest} strokeWidth="3.8" />
      </svg>
    </div>
  );
}
function Brand({
  size = 44,
  light = false,
}: {
  size?: number;
  light?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.22,
        color: light ? C.paper : C.forest,
        fontSize: size,
        fontWeight: 650,
        letterSpacing: -size * 0.055,
      }}
    >
      <Mark size={size * 1.1} />
      openform
    </div>
  );
}
function Label({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontSize: 17,
        letterSpacing: 3,
        textTransform: "uppercase",
        fontWeight: 550,
        color: C.muted,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
function Check({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Arrow({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12h16m-7-7 7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Button({
  children,
  invert = false,
  style = {},
}: {
  children: React.ReactNode;
  invert?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 18,
        padding: "18px 27px",
        background: invert ? C.paper : C.forest,
        color: invert ? C.forest : C.paper,
        borderRadius: 9,
        fontSize: 23,
        fontWeight: 500,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
function Footer({
  index = "01",
  dark = false,
}: {
  index?: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 45,
        left: 88,
        right: 88,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 16,
        color: dark ? "#d9e4ce" : C.muted,
      }}
    >
      <span>Good questions. Better conversations.</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>
        OPENFORM / {index}
      </span>
    </div>
  );
}
function QuestionCard({
  f = 0,
  compact = false,
}: {
  f?: number;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        background: C.sage,
        width: compact ? 620 : 820,
        height: compact ? 560 : 650,
        padding: compact ? "48px 58px" : "60px 70px",
        borderRadius: 20,
        boxShadow: "0 22px 70px #294b3914",
        position: "relative",
        border: "1px solid #cddbc5",
      }}
    >
      <Mark size={40} />
      <div
        style={{
          marginTop: compact ? 70 : 90,
          fontSize: compact ? 49 : 63,
          fontFamily: "Display",
          letterSpacing: -1,
          lineHeight: 1.12,
          color: C.forest,
        }}
      >
        What’s on
        <br />
        your mind?
      </div>
      <div
        style={{
          marginTop: 35,
          borderBottom: "2px solid #8ca07b",
          paddingBottom: 15,
          fontSize: 27,
          color: C.forest,
          height: 53,
        }}
      >
        {"Something worth sharing.".slice(
          0,
          Math.floor(move(f, 30, 90, 0, 25)),
        )}
        <span style={{ opacity: Math.floor(f / 15) % 2 === 0 ? 1 : 0 }}>│</span>
      </div>
      <Button style={{ marginTop: 28, padding: "13px 21px", fontSize: 19 }}>
        OK <Check size={19} />
      </Button>
      <div
        style={{
          position: "absolute",
          bottom: 29,
          left: 58,
          right: 58,
          display: "flex",
          justifyContent: "space-between",
          color: "#809674",
          fontSize: 13,
        }}
      >
        <span>
          Made with <b>openform</b>
        </span>
        <span>1 / 3</span>
      </div>
    </div>
  );
}
function Hook() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ background: C.paper, padding: "70px 90px", color: C.forest }}
    >
      <Brand size={36} />
      <div
        style={{
          position: "absolute",
          top: 265,
          left: 90,
          width: 1150,
          transform: `translateX(${move(f, 0, 28, -35, 0)}px)`,
          opacity: move(f, 0, 16),
        }}
      >
        <Label>A LITTLE MORE HUMAN</Label>
        <h1
          style={{
            fontFamily: "Display",
            fontSize: 108,
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: -3.5,
            margin: "27px 0 0",
          }}
        >
          Forms should feel
          <br />
          like a <em>conversation.</em>
        </h1>
        <div
          style={{
            fontSize: 27,
            marginTop: 43,
            color: C.muted,
            opacity: move(f, 25, 45),
          }}
        >
          Less friction. More connection.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1280,
          top: 220,
          transform: `translateX(${move(f, 15, 48, 150, 0)}px) rotate(6deg)`,
          opacity: move(f, 12, 34),
        }}
      >
        <QuestionCard f={f} compact />
      </div>
      <Footer />
    </AbsoluteFill>
  );
}
function Reveal() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.sage, color: C.forest }}>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 295,
          opacity: move(f, 0, 18),
          transform: `translateY(${move(f, 0, 25, 35, 0)}px)`,
        }}
      >
        <Label>MEET YOUR NEXT CONVERSATION</Label>
        <div style={{ marginTop: 30 }}>
          <Brand size={116} />
        </div>
        <h2
          style={{
            fontFamily: "Display",
            fontSize: 66,
            fontWeight: 400,
            lineHeight: 1.12,
            margin: "35px 0 25px",
            letterSpacing: -1,
          }}
        >
          A little more human.
        </h2>
        <div
          style={{
            fontSize: 25,
            color: "#7d9270",
            maxWidth: 700,
            lineHeight: 1.6,
          }}
        >
          The open-source form builder
          <br />
          for questions that deserve an answer.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 75,
          top: 140,
          transform: `translateX(${move(f, 0, 35, 260, 0)}px) rotate(${move(f, 0, 45, 8, -3)}deg) scale(.9)`,
          opacity: move(f, 0, 18),
        }}
      >
        <QuestionCard f={f + 15} />
      </div>
      <Footer index="02" />
    </AbsoluteFill>
  );
}
function Editor({ f }: { f: number }) {
  const theme = f < 65 ? C.sage : f < 115 ? C.peach : C.lilac;
  const ink = f < 65 ? C.forest : f < 115 ? "#995e45" : "#6b609b";
  return (
    <div
      style={{
        width: 1590,
        height: 690,
        background: "#fff",
        border: "1px solid #dfe5d9",
        borderRadius: 16,
        boxShadow: "0 16px 60px #294b3912",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 65,
          display: "flex",
          alignItems: "center",
          padding: "0 25px",
          borderBottom: "1px solid #e4e8df",
          gap: 18,
        }}
      >
        <Mark size={30} />
        <span style={{ fontSize: 19, fontWeight: 550 }}>Customer feedback</span>
        <span style={{ marginLeft: "auto", fontSize: 15, color: "#8b9a7e" }}>
          All changes saved
        </span>
        <div
          style={{
            fontSize: 15,
            border: "1px solid #dce4d3",
            padding: "10px 18px",
            borderRadius: 6,
          }}
        >
          Preview
        </div>
        <Button style={{ fontSize: 15, padding: "11px 18px", borderRadius: 6 }}>
          Publish <Arrow size={16} />
        </Button>
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        <aside
          style={{
            width: 245,
            padding: "30px 17px",
            borderRight: "1px solid #e4e8df",
          }}
        >
          <Label style={{ fontSize: 11, letterSpacing: 1.6 }}>
            YOUR QUESTIONS
          </Label>
          {[
            "What’s your name?",
            "How was your experience?",
            "What could we do better?",
          ].map((q, i) => (
            <div
              key={q}
              style={{
                padding: "20px 12px",
                fontSize: 13,
                marginTop: 16,
                background: i === 1 ? "#eef4e6" : "transparent",
                borderRadius: 6,
                display: "flex",
                gap: 10,
                color: "#748567",
              }}
            >
              <span
                style={{
                  border: "1px solid #c9d7bb",
                  padding: "2px 5px",
                  borderRadius: 3,
                  fontSize: 11,
                }}
              >
                {i + 1}
              </span>
              {q}
            </div>
          ))}
          <div
            style={{
              marginTop: 30,
              padding: 14,
              border: "1px dashed #cbd9bb",
              borderRadius: 5,
              fontSize: 13,
              color: "#83996c",
            }}
          >
            ＋ Add a question
          </div>
        </aside>
        <section
          style={{ flex: 1, background: "#f6f8f1", padding: "48px 38px" }}
        >
          <Label style={{ fontSize: 10, letterSpacing: 2, marginBottom: 20 }}>
            ● LIVE PREVIEW
          </Label>
          <div
            style={{
              height: 425,
              background: theme,
              borderRadius: 12,
              padding: "45px 45px",
              position: "relative",
              color: ink,
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.6 }}>2 →</div>
            <h3
              style={{
                fontFamily: "Display",
                fontWeight: 400,
                fontSize: 42,
                letterSpacing: -0.6,
                margin: "35px 0 12px",
              }}
            >
              How was your experience?
            </h3>
            <p style={{ fontSize: 17, opacity: 0.6 }}>
              Your perspective helps us get a little better.
            </p>
            <div style={{ display: "flex", gap: 22, marginTop: 38 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  style={{ fontSize: 43, opacity: n < 5 ? 0.85 : 0.25 }}
                >
                  ☆
                </span>
              ))}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginTop: 20,
                padding: "11px 18px",
                fontSize: 14,
                background: ink,
                color: theme,
                borderRadius: 5,
              }}
            >
              OK <Check size={15} />
            </div>
          </div>
        </section>
        <aside
          style={{
            width: 265,
            padding: "30px 25px",
            borderLeft: "1px solid #e4e8df",
          }}
        >
          <Label style={{ fontSize: 11, letterSpacing: 1.6 }}>
            MAKE IT YOURS
          </Label>
          <div style={{ fontSize: 15, marginTop: 35, color: "#7a8d69" }}>
            Question type
          </div>
          <div
            style={{
              padding: 14,
              border: "1px solid #dfe7d5",
              borderRadius: 5,
              fontSize: 15,
              marginTop: 10,
            }}
          >
            ☆ Rating
          </div>
          <div style={{ fontSize: 15, marginTop: 30, color: "#7a8d69" }}>
            A little personality
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 17 }}>
            {[C.sage, C.peach, C.lilac].map((c, i) => (
              <div
                key={c}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: c,
                  border: `${(f < 65 ? 0 : f < 115 ? 1 : 2) === i ? 3 : 1}px solid ${(f < 65 ? 0 : f < 115 ? 1 : 2) === i ? "#6e8658" : "#d6dfcc"}`,
                }}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: 45,
              paddingTop: 25,
              borderTop: "1px solid #e4e8df",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              color: "#7a8d69",
            }}
          >
            Required question
            <span
              style={{
                width: 32,
                height: 18,
                borderRadius: 18,
                background: "#88a16e",
                display: "flex",
                justifyContent: "flex-end",
                padding: 3,
              }}
            >
              <i
                style={{
                  width: 12,
                  height: 12,
                  background: "#fff",
                  borderRadius: 12,
                }}
              />
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
function Build() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper, color: C.forest }}>
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 60,
          right: 95,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Label>01 / BUILD</Label>
          <h2
            style={{
              fontFamily: "Display",
              fontSize: 65,
              fontWeight: 400,
              letterSpacing: -1,
              margin: "18px 0",
            }}
          >
            Build something worth answering.
          </h2>
        </div>
        <Brand size={30} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 255,
          left: 165,
          transform: `translateY(${move(f, 0, 28, 100, 0)}px) scale(${move(f, 0, 35, 0.96, 1)})`,
          opacity: move(f, 0, 16),
        }}
      >
        <Editor f={f} />
      </div>
      <Footer index="03" />
    </AbsoluteFill>
  );
}
function Ask() {
  const f = useCurrentFrame();
  const chosen = f > 58;
  return (
    <AbsoluteFill style={{ background: C.peach, color: "#995e45" }}>
      <div style={{ position: "absolute", top: 75, left: 95 }}>
        <Label style={{ color: "#ae8169" }}>02 / ASK</Label>
        <div
          style={{
            fontFamily: "Display",
            fontSize: 59,
            letterSpacing: -0.7,
            marginTop: 17,
          }}
        >
          One question. One real connection.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 240,
          right: 240,
          transform: `translateY(${move(f, 0, 25, 55, 0)}px)`,
          opacity: move(f, 0, 18),
        }}
      >
        <div style={{ fontSize: 17, opacity: 0.6 }}>3 →</div>
        <h2
          style={{
            fontFamily: "Display",
            fontSize: 72,
            fontWeight: 400,
            letterSpacing: -1.4,
            margin: "20px 0 38px",
          }}
        >
          What would you like to build?
        </h2>
        <div style={{ display: "flex", gap: 18 }}>
          {["A better product", "A real connection", "Something new"].map(
            (a, i) => (
              <div
                key={a}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 25,
                  padding: "25px 25px",
                  background: i === 1 && chosen ? "#fff8f2" : "#ffffff20",
                  border: `${i === 1 && chosen ? 2 : 1}px solid #b6876b`,
                  borderRadius: 8,
                  minWidth: 405,
                  transform: `translateY(${move(f, i * 6, 25 + i * 6, 20, 0)}px)`,
                }}
              >
                <span
                  style={{
                    border: "1px solid #c7a68e",
                    fontSize: 16,
                    padding: "5px 8px",
                    borderRadius: 3,
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {a}
                {i === 1 && chosen ? <Check size={22} /> : null}
              </div>
            ),
          )}
        </div>
        <div style={{ marginTop: 35, opacity: move(f, 67, 82) }}>
          <Button style={{ background: "#995e45", fontSize: 22 }}>
            Submit <Check />
          </Button>
          <span style={{ fontSize: 16, marginLeft: 23, opacity: 0.6 }}>
            A few thoughtful questions. One at a time.
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 240,
          right: 240,
          bottom: 145,
          display: "flex",
          alignItems: "center",
          gap: 20,
          opacity: move(f, 95, 115),
        }}
      >
        <div
          style={{
            border: "1px solid #c9a791",
            background: "#fff7ed",
            borderRadius: 7,
            padding: "20px 25px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 20,
          }}
        >
          <span
            style={{
              height: 8,
              width: 8,
              background: "#779358",
              borderRadius: 5,
            }}
          />{" "}
          Published{" "}
          <span style={{ color: "#b19076" }}>openform / customer-feedback</span>
          <Check size={20} />
        </div>
        <span style={{ fontSize: 18 }}>Ready for your people.</span>
      </div>
      <Footer index="04" />
    </AbsoluteFill>
  );
}
function Listen() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper, color: C.forest }}>
      <div style={{ position: "absolute", left: 100, top: 80 }}>
        <Label>03 / LISTEN</Label>
        <h2
          style={{
            fontFamily: "Display",
            fontSize: 72,
            fontWeight: 400,
            letterSpacing: -1.3,
            margin: "20px 0",
          }}
        >
          Listen to what comes back.
        </h2>
        <p style={{ fontSize: 25, color: C.muted, margin: "10px 0" }}>
          Every answer has a person behind it.
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 355,
          width: 1050,
          height: 425,
          background: "#fff",
          border: "1px solid #dce5d2",
          borderRadius: 13,
          padding: 35,
          transform: `translateX(${move(f, 0, 25, -60, 0)}px)`,
          opacity: move(f, 0, 18),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 28,
            borderBottom: "1px solid #e5eadf",
          }}
        >
          <span style={{ fontSize: 25, fontWeight: 500 }}>
            Customer feedback
          </span>
          <div
            style={{ display: "flex", gap: 10, fontSize: 15, color: C.muted }}
          >
            <Check size={18} /> Response received
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            color: "#8c9d7d",
            fontSize: 14,
            gap: 35,
          }}
        >
          <span style={{ width: 205 }}>SUBMITTED</span>
          <span style={{ width: 220 }}>YOUR NAME</span>
          <span>EXPERIENCE</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            alignItems: "center",
            padding: "24px 17px",
            background: C.sage,
            borderRadius: 7,
            fontSize: 22,
            gap: 35,
            opacity: move(f, 22, 38),
            transform: `translateY(${move(f, 22, 43, 18, 0)}px)`,
          }}
        >
          <span style={{ width: 188, color: "#82966f" }}>Just now</span>
          <span style={{ width: 220 }}>Taylor</span>
          <span style={{ color: "#719358", fontSize: 29 }}>★★★★★</span>
          <Arrow size={21} />
        </div>
        <div
          style={{
            marginTop: 35,
            display: "flex",
            alignItems: "center",
            gap: 15,
            fontSize: 15,
            color: "#a3b095",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              background: "#9fb384",
            }}
          />{" "}
          Sample product demonstration
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 105,
          top: 310,
          width: 590,
          height: 565,
          background: "#edf2e4",
          border: "1px solid #d4e0c5",
          borderRadius: 14,
          padding: "38px 42px",
          boxShadow: "0 20px 70px #294b3912",
          transform: `translateX(${move(f, 35, 66, 170, 0)}px) rotate(${move(f, 35, 70, 5, 0)}deg)`,
          opacity: move(f, 35, 55),
        }}
      >
        <Label style={{ fontSize: 13 }}>A CLOSER LOOK</Label>
        <h3 style={{ fontSize: 21, fontWeight: 500, margin: "35px 0 10px" }}>
          What could we do better?
        </h3>
        <p
          style={{
            fontFamily: "Display",
            fontSize: 35,
            lineHeight: 1.3,
            margin: "15px 0 40px",
            letterSpacing: -0.3,
          }}
        >
          “Keep making it this easy
          <br />
          to feel heard.”
        </p>
        <div style={{ height: 1, background: "#d9e3ce", marginBottom: 25 }} />
        <div style={{ fontSize: 16, color: "#899c77" }}>
          Keep the insights. Take them anywhere.
        </div>
        <Button style={{ marginTop: 30, fontSize: 18, padding: "15px 20px" }}>
          ↓ Export CSV
        </Button>
      </div>
      <Footer index="05" />
    </AbsoluteFill>
  );
}
function Ownership() {
  const f = useCurrentFrame();
  const end = f >= 84;
  return (
    <AbsoluteFill
      style={{
        background: end ? C.forest : C.paper,
        color: end ? C.paper : C.forest,
      }}
    >
      {!end ? (
        <>
          <div style={{ position: "absolute", left: 105, top: 115 }}>
            <Label>OPEN BY NATURE. YOURS BY DESIGN.</Label>
            {["Your questions.", "Your data.", "Your code."].map((line, i) => (
              <div
                key={line}
                style={{
                  fontFamily: "Display",
                  fontSize: 112,
                  lineHeight: 1.25,
                  letterSpacing: -2.5,
                  opacity: move(f, i * 17, i * 17 + 14),
                  transform: `translateX(${move(f, i * 17, i * 17 + 24, -65, 0)}px)`,
                  color: i === 2 ? "#82a05e" : C.forest,
                }}
              >
                {line}
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              right: 150,
              top: 200,
              fontFamily: "Display",
              fontSize: 360,
              color: "#dfe8d1",
              lineHeight: 1,
            }}
          >
            ✳
          </div>
          <Footer index="06" />
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: move(f, 84, 100),
          }}
        >
          <Brand size={115} light />
          <h2
            style={{
              fontFamily: "Display",
              fontSize: 62,
              fontWeight: 400,
              letterSpacing: -1,
              margin: "38px 0 15px",
            }}
          >
            Open source. MIT licensed.
          </h2>
          <p style={{ fontSize: 27, color: "#c4d6b5", margin: "10px 0 40px" }}>
            Try it. Fork it. Make it yours.
          </p>
          <Button invert style={{ fontSize: 22, padding: "18px 27px" }}>
            Explore Openform <Arrow size={23} />
          </Button>
          <div style={{ fontSize: 21, marginTop: 28, color: "#a7c192" }}>
            arjunkshah12345-hash.github.io/openform
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}
function Film({ portrait = false }: { portrait?: boolean }) {
  const { width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender("Loading local typefaces"));
  useEffect(() => {
    Promise.all([
      document.fonts.load("400 80px Display"),
      document.fonts.load("500 30px Sans"),
    ]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{ fontFamily: "Sans", background: C.paper }}>
      <Audio src={staticFile("soundtrack.wav")} volume={0.78} />
      <div
        style={{
          position: "absolute",
          width: 1920,
          height: 1080,
          transformOrigin: "top left",
          transform: portrait
            ? "scale(0.74) translateX(-230px)"
            : `scale(${width / 1920})`,
          top: portrait ? 180 : 0,
        }}
      >
        <Sequence from={0} durationInFrames={120}>
          <Hook />
        </Sequence>
        <Sequence from={120} durationInFrames={120}>
          <Reveal />
        </Sequence>
        <Sequence from={240} durationInFrames={180}>
          <Build />
        </Sequence>
        <Sequence from={420} durationInFrames={150}>
          <Ask />
        </Sequence>
        <Sequence from={570} durationInFrames={150}>
          <Listen />
        </Sequence>
        <Sequence from={720} durationInFrames={180}>
          <Ownership />
        </Sequence>
      </div>
      {portrait && (
        <>
          <div style={{ position: "absolute", top: 65, left: 65 }}>
            <Brand size={40} />
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 75,
              left: 65,
              right: 65,
              fontFamily: "Display",
              fontSize: 52,
              color: C.forest,
              lineHeight: 1.1,
            }}
          >
            Beautiful forms.
            <br />
            <em>Open to everyone.</em>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
}
function Social() {
  return (
    <AbsoluteFill
      style={{
        fontFamily: "Sans",
        background: C.sage,
        color: C.forest,
        padding: "53px 65px",
      }}
    >
      <Brand size={41} />
      <div
        style={{
          fontFamily: "Display",
          fontSize: 78,
          lineHeight: 1.03,
          letterSpacing: -2,
          marginTop: 62,
          width: 830,
        }}
      >
        Good questions deserve
        <br />
        <em>great forms.</em>
      </div>
      <div style={{ fontSize: 22, marginTop: 27, color: "#7c9270" }}>
        Open-source form builder. Yours to host.
      </div>
      <div
        style={{
          position: "absolute",
          right: -80,
          top: 155,
          width: 230,
          height: 300,
          background: "#f8f9f6",
          border: "1px solid #c7d5b9",
          borderRadius: 10,
          transform: "rotate(10deg)",
          padding: "30px 25px",
          fontFamily: "Display",
          fontSize: 32,
        }}
      >
        What’s on
        <br />
        your mind?
        <div
          style={{
            height: 2,
            background: "#c4d3b6",
            marginTop: 35,
            width: 170,
          }}
        />
        <div
          style={{
            fontFamily: "Sans",
            fontSize: 15,
            background: C.forest,
            color: C.paper,
            borderRadius: 4,
            padding: "9px 15px",
            display: "inline-block",
            marginTop: 18,
          }}
        >
          OK ✓
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 38,
          left: 65,
          fontSize: 15,
          letterSpacing: 1,
          color: "#8ba078",
        }}
      >
        OPENFORM / MIT LICENSED
      </div>
    </AbsoluteFill>
  );
}
export function Root() {
  return (
    <>
      <Composition
        id="OpenformLaunch"
        component={Film}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={900}
      />
      <Composition
        id="OpenformPortrait"
        component={PortraitFilm}
        width={1080}
        height={1350}
        fps={30}
        durationInFrames={900}
      />
      <Composition
        id="OpenformSocial"
        component={Social}
        width={1200}
        height={630}
        fps={30}
        durationInFrames={1}
      />
    </>
  );
}
