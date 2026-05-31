// src/features/quest/components/RetroUI.tsx
import React, { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";

export const RetroWindow = ({
  children,
  className,
  title,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={clsx(
      "border-4 border-white p-4 bg-[#000020] text-white font-mono",
      className,
    )}
    style={style}
  >
    {title && (
      <div
        className="-mx-4 -mt-4 mb-4 px-4 py-2 border-b-2 border-white/40 text-sm"
        style={{ color: "#ffd700" }}
      >
        {title}
      </div>
    )}
    {children}
  </div>
);

export const RetroButton = ({
  children,
  onClick,
  type = "button",
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      "flex items-center w-full px-3 py-2 font-mono text-left",
      "bg-[#000020] text-white border-2 border-white",
      "hover:bg-[#ffd700] hover:text-black hover:border-[#ffd700]",
      "active:scale-95 transition-all group",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      className,
    )}
  >
    <span className="mr-2 shrink-0 invisible group-hover:visible">▶</span>
    {children}
  </button>
);

export const RetroInput = (
  props: React.InputHTMLAttributes<HTMLInputElement>,
) => (
  <input
    {...props}
    className={clsx(
      "w-full border-2 border-white p-2 font-mono bg-[#000020] text-white",
      "focus:outline-none focus:border-[#ffd700]",
      "placeholder:opacity-40",
      props.className,
    )}
  />
);

export const RetroSelect = (
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) => (
  <select
    {...props}
    className={clsx(
      "w-full border-2 border-white p-2 font-mono bg-[#000020] text-white",
      "focus:outline-none focus:border-[#ffd700]",
      props.className,
    )}
  >
    {props.children}
  </select>
);

const useTypewriter = (text: string, speed: number) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return displayed;
};

export const RetroMessage = ({
  children,
  className,
  speed = 40,
}: {
  children: string;
  className?: string;
  speed?: number;
}) => {
  const displayed = useTypewriter(children, speed);
  const isDone = displayed.length >= children.length;

  return (
    <div className={clsx("font-mono whitespace-pre-wrap text-sm leading-relaxed", className)}>
      {displayed}
      {!isDone && <span className="animate-pulse">▌</span>}
    </div>
  );
};

type GlitchMode = "idle" | "attack" | "defeat";

const IDLE_VARIANTS = [
  { wrapper: "idleFloat 2.2s ease-in-out infinite",     glitch: "none" },
  { wrapper: "idleFloat 2.2s ease-in-out infinite",     glitch: "idleGlitch 3.5s linear infinite" },
  { wrapper: "idleBreath 2.8s ease-in-out infinite",    glitch: "idleGlitch 3.5s linear infinite" },
];

export const GlitchImage = ({
  src,
  alt,
  glitchMode,
  glitchTrigger,
  className = "h-40 w-40 sm:h-64 sm:w-64",
  idleVariant,
}: {
  src: string;
  alt: string;
  glitchMode: GlitchMode;
  glitchTrigger: number;
  className?: string;
  idleVariant?: number;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const [randomVariant, setRandomVariant] = useState(1);
  useEffect(() => { setRandomVariant(Math.floor(Math.random() * 3)); }, []);
  const variant = IDLE_VARIANTS[idleVariant ?? randomVariant] ?? IDLE_VARIANTS[1];

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    el.style.animation = "none";
    el.getBoundingClientRect();
    if (glitchMode === "idle") {
      el.style.animation = variant.glitch;
    } else if (glitchMode === "attack") {
      el.style.animation = "glitchAttack 0.35s ease-out forwards";
    } else {
      el.style.animation = "glitchDefeat 1.4s linear forwards";
    }
  }, [glitchMode, glitchTrigger]);

  const isIdle = glitchMode === "idle";
  const wrapperAnim = isIdle ? variant.wrapper : "none";

  return (
    <div style={{ animation: wrapperAnim }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} object-contain`}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
};

const CONFETTI_COLORS = ["#ffd700", "#ffec6e", "#ffe44d", "#ffc200", "#fff0a0"];
const CONFETTI_COUNT = 55;

type ConfettiPiece = {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  w: number;
  h: number;
  spinDuration: number;
};

const generateConfetti = (): ConfettiPiece[] =>
  Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 2.5 + Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    w: 5 + Math.random() * 8,
    h: 8 + Math.random() * 12,
    spinDuration: 0.6 + Math.random() * 1.2,
  }));

export const Confetti = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  useEffect(() => { setPieces(generateConfetti()); }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-20px",
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in infinite`,
          }}
        >
          <div
            style={{
              width: `${p.w}px`,
              height: `${p.h}px`,
              backgroundColor: p.color,
              animation: `confettiSpin ${p.spinDuration}s ${p.delay}s linear infinite`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export const RetroTab = ({
  children,
  onClick,
  isActive,
  hasBorderRight = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
  hasBorderRight?: boolean;
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "px-4 py-2 font-mono text-sm transition-colors",
      hasBorderRight && "border-r border-white/20",
      isActive
        ? "bg-white text-black"
        : "bg-[#000020] text-white hover:bg-white/10",
    )}
  >
    {children}
  </button>
);

export const DamagePopup = ({
  value,
}: {
  value: number;
}) => (
  <div
    className="pointer-events-none font-mono font-bold text-2xl tabular-nums select-none"
    style={{
      color: "#ff4444",
      animation: "damageFloat 0.9s ease-out forwards",
      textShadow: "0 0 8px #ff4444",
    }}
  >
    -{value}
  </div>
);

export const RetroHpBar = ({
  current,
  max,
  label = "HP",
}: {
  current: number;
  max: number;
  label?: string;
}) => {
  const pct = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const barColor = pct > 0.5 ? "#00ff00" : pct > 0.25 ? "#ffd700" : "#ff0000";

  return (
    <div className="font-mono space-y-1">
      <div className="flex justify-between text-sm">
        <span className="opacity-70">{label}</span>
        <span style={{ color: barColor }}>
          {current} / {max}
        </span>
      </div>
      <div className="w-full h-4 border-2 border-white bg-[#000020]">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct * 100}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};
