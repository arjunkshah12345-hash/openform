import { useEffect, useRef } from "react";
import { BAYER_8 } from "./vendor/dithercn/bayer";
import { DitherGradient } from "./vendor/dither-kit/gradient";
import { grainLayer } from "./vendor/gradient-grain";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

// A folded ring in normalized coordinates, used by the pixel and glyph layers.
function ribbon(x: number, y: number, aspect: number) {
  const u = (x - 0.53) * aspect;
  const v = y - 0.49;
  const angle = Math.atan2(v, u);
  const radius = Math.hypot(u, v);
  const edge = 0.4 + Math.sin(3 * angle + 0.3) * 0.055;
  const ridge = Math.exp(-Math.pow((radius - edge) / 0.12, 2));
  const stripes = 0.5 + 0.5 * Math.cos(33 * radius + 5 * angle);
  return clamp(ridge * (0.2 + stripes * 0.8) - 0.2);
}

const palette = [
  [21, 20, 32],
  [36, 28, 68],
  [66, 48, 139],
  [107, 81, 205],
  [173, 154, 246],
  [216, 246, 101],
  [243, 255, 170],
];
const glyphs = ".:+x#";
const glyphColors = ["#604ab6", "#8b6bdb", "#ad94fa", "#d8f362", "#eeffa5"];
const backdrop = [
  grainLayer(0.28),
  "radial-gradient(ellipse at 58% 48%, #745be3 0%, #41317d 42%, transparent 75%)",
  "#14141b",
].join(", ");

export function SignalArt() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const ascii = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node = canvas.current;
    const context = node?.getContext("2d");
    const glyphCanvas = ascii.current;
    const glyphContext = glyphCanvas?.getContext("2d");
    if (!node || !context) return;
    const draw = () => {
      const { width, height } = node.getBoundingClientRect();
      if (!width || !height) return;
      const cols = Math.min(300, Math.round(width / 3));
      const rows = Math.min(245, Math.round(height / 3));
      node.width = cols;
      node.height = rows;
      const pixels = context.createImageData(cols, rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const u = x / cols;
          const v = y / rows;
          const glow = ribbon(u, v, width / height);
          const edge = Math.hypot((u - 0.52) * 1.12, v - 0.48);
          const beam = Math.exp(
            -Math.pow((v - 0.68 + u * 0.41 + Math.sin(u * 6) * 0.12) * 4.8, 2),
          );
          const light = clamp(glow * 0.85 + beam * 0.41 - edge * 0.27);
          const threshold = BAYER_8.thresholds[(y % 8) * 8 + (x % 8)];
          const rank = Math.min(
            palette.length - 1,
            Math.floor(light * (palette.length - 1) + threshold),
          );
          const [r, g, b] = palette[rank];
          const offset = (y * cols + x) * 4;
          pixels.data[offset] = r;
          pixels.data[offset + 1] = g;
          pixels.data[offset + 2] = b;
          pixels.data[offset + 3] = Math.round(clamp(light * 2.4) * 255);
        }
      }
      context.putImageData(pixels, 0, 0);
      if (!glyphCanvas || !glyphContext) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      glyphCanvas.width = Math.round(width * ratio);
      glyphCanvas.height = Math.round(height * ratio);
      glyphContext.scale(ratio, ratio);
      glyphContext.font = "11px monospace";
      glyphContext.textBaseline = "middle";
      const stepX = glyphContext.measureText("x").width + 2;
      const stepY = 12;
      for (let y = stepY; y < height; y += stepY) {
        for (let x = stepX; x < width; x += stepX) {
          const signal = ribbon(x / width, y / height, width / height);
          if (signal < 0.14) continue;
          const index = Math.min(
            glyphs.length - 1,
            Math.floor(signal * glyphs.length * 1.45),
          );
          glyphContext.fillStyle = glyphColors[index];
          glyphContext.fillText(glyphs[index], x, y);
        }
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="signal-art"
      style={{ background: backdrop }}
      aria-hidden="true"
    >
      <canvas
        className="signal-field"
        style={{ imageRendering: "pixelated" }}
        ref={canvas}
      />
      <canvas className="signal-ascii" ref={ascii} />
    </div>
  );
}

export function PixelField({ className }: { className?: string }) {
  return (
    <DitherGradient
      className={className}
      from={76}
      direction="up"
      cell={3}
      opacity={0.27}
    />
  );
}
